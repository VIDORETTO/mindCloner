const test = require("node:test");
const assert = require("node:assert/strict");
const { AIClient } = require("../src/ai/client");

function mockResponse({ ok, status, payload }) {
  return {
    ok,
    status,
    async json() {
      return payload;
    },
  };
}

test("AIClient: provider local retorna fallback sem chamada externa", async () => {
  let calls = 0;
  const client = new AIClient({
    provider: "local",
    fetchImpl: async () => {
      calls += 1;
      return mockResponse({ ok: true, status: 200, payload: {} });
    },
  });
  const result = await client.generateQuestion({
    messages: [{ role: "system", content: "x" }],
    fallbackQuestion: "Pergunta local?",
  });
  assert.equal(result.usedFallback, true);
  assert.equal(result.question, "Pergunta local?");
  assert.equal(calls, 0);
});

test("AIClient: OpenAI sucesso com retorno JSON", async () => {
  const client = new AIClient({
    provider: "openai",
    apiKey: "test-key",
    fetchImpl: async () =>
      mockResponse({
        ok: true,
        status: 200,
        payload: {
          choices: [
            { message: { content: '{"question":"Qual foi seu maior aprendizado este ano?"}' } },
          ],
        },
      }),
  });
  const result = await client.generateQuestion({
    messages: [{ role: "system", content: "x" }],
    fallbackQuestion: "Fallback?",
  });
  assert.equal(result.usedFallback, false);
  assert.equal(result.question, "Qual foi seu maior aprendizado este ano?");
});

test("AIClient: Anthropic sucesso com texto direto", async () => {
  const client = new AIClient({
    provider: "anthropic",
    apiKey: "test-key",
    fetchImpl: async () =>
      mockResponse({
        ok: true,
        status: 200,
        payload: {
          content: [{ type: "text", text: "Como voce decide quando dizer nao?" }],
        },
      }),
  });
  const result = await client.generateQuestion({
    messages: [{ role: "system", content: "x" }],
    fallbackQuestion: "Fallback?",
  });
  assert.equal(result.usedFallback, false);
  assert.equal(result.question, "Como voce decide quando dizer nao?");
});

test("AIClient: retry com backoff em indisponibilidade e sucesso no fim", async () => {
  let calls = 0;
  let sleeps = 0;
  const client = new AIClient({
    provider: "openai",
    apiKey: "test-key",
    maxRetries: 2,
    sleepFn: async () => {
      sleeps += 1;
    },
    fetchImpl: async () => {
      calls += 1;
      if (calls < 3) {
        return mockResponse({ ok: false, status: 503, payload: {} });
      }
      return mockResponse({
        ok: true,
        status: 200,
        payload: {
          choices: [
            { message: { content: '{"question":"Qual tema ainda ficou em aberto para voce?"}' } },
          ],
        },
      });
    },
  });
  const result = await client.generateQuestion({
    messages: [{ role: "system", content: "x" }],
    fallbackQuestion: "Fallback?",
  });
  assert.equal(result.usedFallback, false);
  assert.equal(result.question, "Qual tema ainda ficou em aberto para voce?");
  assert.equal(calls, 3);
  assert.equal(sleeps, 2);
});

test("AIClient: sem API key faz fallback local para provider remoto", async () => {
  const client = new AIClient({
    provider: "openai",
    apiKey: "",
  });
  const result = await client.generateQuestion({
    messages: [{ role: "system", content: "x" }],
    fallbackQuestion: "Fallback?",
  });
  assert.equal(result.usedFallback, true);
  assert.equal(result.reason, "missing-api-key");
  assert.equal(result.question, "Fallback?");
});

test("AIClient: Ollama sucesso com retorno message.content", async () => {
  const urls = [];
  const client = new AIClient({
    provider: "ollama",
    model: "llama3.1:8b",
    baseUrl: "http://127.0.0.1:11434",
    fetchImpl: async (url) => {
      urls.push(url);
      return mockResponse({
        ok: true,
        status: 200,
        payload: {
          message: {
            content: '{"question":"Qual aspecto do seu dia merece mais atencao hoje?"}',
          },
        },
      });
    },
  });

  const result = await client.generateQuestion({
    messages: [{ role: "system", content: "x" }],
    fallbackQuestion: "Fallback?",
  });

  assert.equal(urls[0], "http://127.0.0.1:11434/api/chat");
  assert.equal(result.usedFallback, false);
  assert.equal(result.question, "Qual aspecto do seu dia merece mais atencao hoje?");
});

test("AIClient: Ollama indisponivel usa fallback local sem exigir api key", async () => {
  const client = new AIClient({
    provider: "ollama",
    maxRetries: 0,
    fetchImpl: async () => {
      throw new Error("connection refused");
    },
  });
  const result = await client.generateQuestion({
    messages: [{ role: "system", content: "x" }],
    fallbackQuestion: "Fallback local?",
  });
  assert.equal(result.usedFallback, true);
  assert.equal(result.reason.startsWith("provider-error-"), true);
  assert.equal(result.question, "Fallback local?");
});
