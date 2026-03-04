const { Input, Confirm, Password, Select } = require("enquirer");
const {
  createDefaultSettings,
  normalizeSettings,
  LOCKED_PROVIDER,
  LOCKED_MODEL,
  DEFAULT_CONSENT_VERSION,
} = require("../config/settings-schema");

function createPrompt(PromptType, options, promptFactory) {
  if (typeof promptFactory === "function") {
    return promptFactory(PromptType, options);
  }
  return new PromptType(options);
}

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function askWithPrompt(PromptType, options, promptFactory) {
  const prompt = createPrompt(PromptType, options, promptFactory);
  return prompt.run();
}

async function runSetupWizard({
  mode = "first-use",
  initialSettings,
  baseDir,
  profileIdHint = "",
  promptFactory,
} = {}) {
  const seed = normalizeSettings(initialSettings || createDefaultSettings({ baseDir }), {
    baseDir,
    defaultProfileId: profileIdHint || initialSettings?.defaultProfileId || "perfil-principal",
  });

  const profileAnswer = await askWithPrompt(
    Input,
    {
      name: "defaultProfileId",
      message: "Perfil padrao (slug):",
      initial: seed.defaultProfileId,
    },
    promptFactory
  );
  const defaultProfileId = toSlug(profileAnswer) || seed.defaultProfileId;

  const baseDirAnswer = await askWithPrompt(
    Input,
    {
      name: "baseDir",
      message: "Diretorio base para dados:",
      initial: seed.baseDir || baseDir,
    },
    promptFactory
  );
  const selectedBaseDir = String(baseDirAnswer || seed.baseDir || baseDir).trim();
  const defaultMode = await askWithPrompt(
    Select,
    {
      name: "defaultMode",
      message: "Modo padrao da entrevista:",
      choices: [
        { name: "adaptive", message: "Adaptativo (recomendado)" },
        { name: "phased", message: "Faseado (1 a 10)" },
      ],
      initial: seed.interview?.defaultMode === "phased" ? 1 : 0,
    },
    promptFactory
  );

  const maxQuestionsAnswer = await askWithPrompt(
    Input,
    {
      name: "maxQuestionsPerSession",
      message: "Limite de perguntas por sessao:",
      initial: String(seed.interview?.maxQuestionsPerSession || 25),
    },
    promptFactory
  );
  const maxQuestionsInput = Number(maxQuestionsAnswer);
  const maxQuestionsPerSession =
    Number.isFinite(maxQuestionsInput) && maxQuestionsInput > 0
      ? Math.round(maxQuestionsInput)
      : 25;

  const consentMessage =
    mode === "first-use"
      ? "Voce concorda com a coleta de dados para gerar seu perfil? (obrigatorio)"
      : "Manter consentimento ativo para continuar usando a CLI?";
  const consentAccepted = await askWithPrompt(
    Confirm,
    {
      name: "consent",
      message: consentMessage,
      initial: true,
    },
    promptFactory
  );
  if (!consentAccepted) {
    throw new Error("Consentimento obrigatorio: setup cancelado.");
  }

  const wantsApiKey = await askWithPrompt(
    Confirm,
    {
      name: "wantsApiKey",
      message: "Deseja cadastrar API key da OpenAI agora?",
      initial: true,
    },
    promptFactory
  );

  let openaiApiKey = "";
  if (wantsApiKey) {
    openaiApiKey = String(
      await askWithPrompt(
        Password,
        {
          name: "openaiApiKey",
          message: "Informe sua API key OpenAI:",
          initial: "",
        },
        promptFactory
      )
    ).trim();
  }

  const normalized = normalizeSettings(
    {
      ...seed,
      defaultProfileId,
      baseDir: selectedBaseDir,
      ai: {
        ...seed.ai,
        provider: LOCKED_PROVIDER,
        model: LOCKED_MODEL,
      },
      interview: {
        ...seed.interview,
        defaultMode: defaultMode === "phased" ? "phased" : "adaptive",
        maxQuestionsPerSession,
      },
      consent: {
        accepted: true,
        acceptedAt: new Date().toISOString(),
        version: DEFAULT_CONSENT_VERSION,
      },
    },
    {
      baseDir: selectedBaseDir,
      defaultProfileId,
    }
  );

  return {
    settings: normalized,
    openaiApiKey,
  };
}

module.exports = {
  runSetupWizard,
};
