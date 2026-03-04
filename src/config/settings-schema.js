const SETTINGS_VERSION = 1;
const LOCKED_PROVIDER = "openai";
const LOCKED_MODEL = "gpt-5-mini-2025-08-07";
const DEFAULT_CONSENT_VERSION = "cli-v1";

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toSafeNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function normalizeSettings(input = {}, options = {}) {
  const source =
    input && typeof input === "object" && !Array.isArray(input)
      ? input
      : createDefaultSettings(options);
  const fallback = createDefaultSettings(options);
  const defaultProfileId =
    slug(source.defaultProfileId || fallback.defaultProfileId) || "perfil-principal";
  const baseDir = String(source.baseDir || fallback.baseDir || "").trim() || fallback.baseDir;
  const telemetryOptIn = Boolean(source.privacy?.telemetryOptIn);
  const consentAccepted = Boolean(source.consent?.accepted);
  const acceptedAtRaw = String(source.consent?.acceptedAt || "").trim();
  const acceptedAt = consentAccepted ? acceptedAtRaw || new Date().toISOString() : "";

  return {
    version: SETTINGS_VERSION,
    defaultProfileId,
    baseDir,
    ai: {
      provider: LOCKED_PROVIDER,
      model: LOCKED_MODEL,
      timeoutMs: toSafeNumber(source.ai?.timeoutMs, fallback.ai.timeoutMs, 5000, 120000),
      maxRetries: toSafeNumber(source.ai?.maxRetries, fallback.ai.maxRetries, 0, 6),
    },
    interview: {
      defaultMode: source.interview?.defaultMode === "phased" ? "phased" : "adaptive",
      maxQuestionsPerSession: toSafeNumber(
        source.interview?.maxQuestionsPerSession,
        fallback.interview.maxQuestionsPerSession,
        5,
        100
      ),
    },
    privacy: {
      telemetryOptIn,
    },
    consent: {
      accepted: consentAccepted,
      acceptedAt,
      version: DEFAULT_CONSENT_VERSION,
    },
  };
}

function createDefaultSettings({ baseDir = "", defaultProfileId = "perfil-principal" } = {}) {
  return {
    version: SETTINGS_VERSION,
    defaultProfileId: slug(defaultProfileId) || "perfil-principal",
    baseDir: String(baseDir || "").trim(),
    ai: {
      provider: LOCKED_PROVIDER,
      model: LOCKED_MODEL,
      timeoutMs: 20000,
      maxRetries: 2,
    },
    interview: {
      defaultMode: "adaptive",
      maxQuestionsPerSession: 25,
    },
    privacy: {
      telemetryOptIn: false,
    },
    consent: {
      accepted: false,
      acceptedAt: "",
      version: DEFAULT_CONSENT_VERSION,
    },
  };
}

function validateSettings(settings) {
  const errors = [];
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return {
      valid: false,
      errors: ["Settings invalidas: raiz ausente."],
    };
  }

  if (!String(settings.defaultProfileId || "").trim()) {
    errors.push("defaultProfileId obrigatorio.");
  }
  if (!String(settings.baseDir || "").trim()) {
    errors.push("baseDir obrigatorio.");
  }
  if (settings.ai?.provider !== LOCKED_PROVIDER) {
    errors.push(`provider deve ser ${LOCKED_PROVIDER}.`);
  }
  if (settings.ai?.model !== LOCKED_MODEL) {
    errors.push(`model deve ser ${LOCKED_MODEL}.`);
  }
  if (!["adaptive", "phased"].includes(settings.interview?.defaultMode)) {
    errors.push("interview.defaultMode deve ser adaptive ou phased.");
  }
  if (!Number.isFinite(Number(settings.interview?.maxQuestionsPerSession))) {
    errors.push("interview.maxQuestionsPerSession deve ser numerico.");
  }
  if (typeof settings.privacy?.telemetryOptIn !== "boolean") {
    errors.push("privacy.telemetryOptIn deve ser booleano.");
  }
  if (typeof settings.consent?.accepted !== "boolean") {
    errors.push("consent.accepted deve ser booleano.");
  }
  if (settings.consent?.accepted && !String(settings.consent?.acceptedAt || "").trim()) {
    errors.push("consent.acceptedAt obrigatorio quando consent.accepted=true.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  SETTINGS_VERSION,
  LOCKED_PROVIDER,
  LOCKED_MODEL,
  DEFAULT_CONSENT_VERSION,
  createDefaultSettings,
  normalizeSettings,
  validateSettings,
};
