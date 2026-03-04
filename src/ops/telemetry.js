const path = require("node:path");
const crypto = require("node:crypto");

function telemetryDefaults() {
  return {
    opt_in: false,
    updated_at: "",
    events: [],
  };
}

function anonymizeId(raw) {
  return crypto
    .createHash("sha256")
    .update(String(raw || ""))
    .digest("hex")
    .slice(0, 16);
}

async function loadTelemetryConfig(sessionManager) {
  const filePath = path.join(sessionManager.store.baseDir, "telemetry.json");
  const data = await sessionManager.store.readJson(filePath, telemetryDefaults());
  return {
    filePath,
    data: {
      ...telemetryDefaults(),
      ...data,
      events: Array.isArray(data?.events) ? data.events : [],
    },
  };
}

async function setTelemetryOptIn(sessionManager, enabled) {
  const { filePath, data } = await loadTelemetryConfig(sessionManager);
  const next = {
    ...data,
    opt_in: Boolean(enabled),
    updated_at: new Date().toISOString(),
  };
  await sessionManager.store.writeJson(filePath, next);
  return next;
}

async function trackTelemetryEvent(sessionManager, event) {
  const { filePath, data } = await loadTelemetryConfig(sessionManager);
  if (!data.opt_in) {
    return false;
  }
  const normalized = {
    at: new Date().toISOString(),
    name: String(event.name || "unknown"),
    profile_hash: anonymizeId(event.profileId || ""),
    attrs: event.attrs && typeof event.attrs === "object" ? event.attrs : {},
  };
  const events = [...data.events, normalized].slice(-500);
  await sessionManager.store.writeJson(filePath, {
    ...data,
    events,
  });
  return true;
}

module.exports = {
  loadTelemetryConfig,
  setTelemetryOptIn,
  trackTelemetryEvent,
};
