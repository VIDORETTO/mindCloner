const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_ANTHROPIC_MODEL = "claude-3-5-haiku-latest";
const DEFAULT_OLLAMA_MODEL = "llama3.1:8b";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

function extractQuestionText(rawText, fallbackQuestion) {
  const text = String(rawText || "").trim();
  if (!text) {
    return fallbackQuestion;
  }

  try {
    const parsed = JSON.parse(text);
    const candidate = parsed.question || parsed.pergunta || "";
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  } catch {}

  const firstLine = text
    .split("\n")
    .map((item) => item.trim())
    .find(Boolean);
  if (!firstLine) {
    return fallbackQuestion;
  }
  return firstLine;
}

function shouldRetry(status) {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

class AIClient {
  constructor({
    provider = "local",
    model = "",
    apiKey = "",
    baseUrl = "",
    timeoutMs = 15000,
    maxRetries = 2,
    fetchImpl = fetch,
    sleepFn = sleep,
  } = {}) {
    this.provider = String(provider || "local").toLowerCase();
    this.model = model;
    this.apiKey = apiKey;
    this.baseUrl = String(baseUrl || "").trim();
    this.timeoutMs = timeoutMs;
    this.maxRetries = Math.max(0, Number(maxRetries || 0));
    this.fetchImpl = fetchImpl;
    this.sleepFn = sleepFn;
  }

  defaultModel() {
    if (this.provider === "openai") {
      return DEFAULT_OPENAI_MODEL;
    }
    if (this.provider === "anthropic") {
      return DEFAULT_ANTHROPIC_MODEL;
    }
    if (this.provider === "ollama") {
      return DEFAULT_OLLAMA_MODEL;
    }
    return "";
  }

  async generateQuestion({ messages, fallbackQuestion }) {
    if (this.provider === "local") {
      return {
        question: fallbackQuestion,
        usedFallback: true,
        provider: "local",
        reason: "provider-local",
      };
    }
    if ((this.provider === "openai" || this.provider === "anthropic") && !this.apiKey) {
      return {
        question: fallbackQuestion,
        usedFallback: true,
        provider: this.provider,
        reason: "missing-api-key",
      };
    }

    const model = this.model || this.defaultModel();
    const request =
      this.provider === "openai"
        ? this.buildOpenAIRequest({ model, messages })
        : this.provider === "anthropic"
          ? this.buildAnthropicRequest({ model, messages })
          : this.provider === "ollama"
            ? this.buildOllamaRequest({ model, messages })
            : null;
    if (!request) {
      return {
        question: fallbackQuestion,
        usedFallback: true,
        provider: this.provider,
        reason: "unsupported-provider",
      };
    }

    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      try {
        const timeout = withTimeout(this.timeoutMs);
        const response = await this.fetchImpl(request.url, {
          method: "POST",
          headers: request.headers,
          body: JSON.stringify(request.body),
          signal: timeout.signal,
        });
        timeout.clear();

        if (!response.ok) {
          if (shouldRetry(response.status) && attempt < this.maxRetries) {
            await this.sleepFn(200 * 2 ** attempt);
            continue;
          }
          return {
            question: fallbackQuestion,
            usedFallback: true,
            provider: this.provider,
            reason: `provider-http-${response.status}`,
          };
        }

        const payload = await response.json();
        const text =
          this.provider === "openai"
            ? this.extractOpenAIText(payload)
            : this.provider === "anthropic"
              ? this.extractAnthropicText(payload)
              : this.extractOllamaText(payload);
        const question = extractQuestionText(text, fallbackQuestion);
        return {
          question,
          usedFallback: false,
          provider: this.provider,
          reason: "provider-success",
        };
      } catch (error) {
        const canRetry = attempt < this.maxRetries;
        if (canRetry) {
          await this.sleepFn(200 * 2 ** attempt);
          continue;
        }
        return {
          question: fallbackQuestion,
          usedFallback: true,
          provider: this.provider,
          reason: `provider-error-${error.name || "unknown"}`,
        };
      }
    }

    return {
      question: fallbackQuestion,
      usedFallback: true,
      provider: this.provider,
      reason: "provider-fallback-exhausted",
    };
  }

  buildOpenAIRequest({ model, messages }) {
    if (this.provider !== "openai") {
      return null;
    }
    return {
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: {
        model,
        temperature: 0.2,
        messages: [
          ...messages,
          {
            role: "system",
            content:
              'Responda somente com JSON: {"question":"..."} contendo uma unica pergunta objetiva em portugues.',
          },
        ],
      },
    };
  }

  buildAnthropicRequest({ model, messages }) {
    if (this.provider !== "anthropic") {
      return null;
    }
    const system = messages
      .filter((item) => item.role === "system")
      .map((item) => item.content)
      .join("\n\n");
    const conversation = messages
      .filter((item) => item.role !== "system")
      .map((item) => `${item.role}: ${item.content}`)
      .join("\n");
    return {
      url: "https://api.anthropic.com/v1/messages",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: {
        model,
        max_tokens: 180,
        temperature: 0.2,
        system: `${system}\n\nResponda somente com JSON: {"question":"..."} com uma unica pergunta objetiva em portugues.`,
        messages: [{ role: "user", content: conversation || "Gere a proxima pergunta." }],
      },
    };
  }

  buildOllamaRequest({ model, messages }) {
    if (this.provider !== "ollama") {
      return null;
    }
    const url = `${this.baseUrl || "http://127.0.0.1:11434"}/api/chat`;
    return {
      url,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        model,
        stream: false,
        messages: [
          ...messages,
          {
            role: "system",
            content:
              'Responda somente com JSON: {"question":"..."} contendo uma unica pergunta objetiva em portugues.',
          },
        ],
      },
    };
  }

  extractOpenAIText(payload) {
    const message = payload?.choices?.[0]?.message?.content;
    if (typeof message === "string") {
      return message;
    }
    if (Array.isArray(message)) {
      return message.map((item) => item?.text || "").join("\n");
    }
    return "";
  }

  extractAnthropicText(payload) {
    const content = payload?.content;
    if (!Array.isArray(content)) {
      return "";
    }
    return content
      .map((item) => (item?.type === "text" ? item.text : ""))
      .filter(Boolean)
      .join("\n");
  }

  extractOllamaText(payload) {
    const messageText = payload?.message?.content;
    if (typeof messageText === "string") {
      return messageText;
    }
    const directResponse = payload?.response;
    if (typeof directResponse === "string") {
      return directResponse;
    }
    return "";
  }
}

module.exports = {
  AIClient,
};
