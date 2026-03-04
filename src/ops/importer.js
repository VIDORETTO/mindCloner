const fs = require("node:fs/promises");
const { validateProfileSchema } = require("../profile/profile-exporter");

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(target, source) {
  if (!isPlainObject(source)) {
    return target;
  }
  for (const key of Object.keys(source)) {
    const incoming = source[key];
    if (Array.isArray(incoming)) {
      target[key] = [...incoming];
      continue;
    }
    if (isPlainObject(incoming)) {
      if (!isPlainObject(target[key])) {
        target[key] = {};
      }
      deepMerge(target[key], incoming);
      continue;
    }
    target[key] = incoming;
  }
  return target;
}

async function importExternalProfile({ sessionManager, profileId, importPath }) {
  const raw = await fs.readFile(importPath, "utf8");
  const parsed = JSON.parse(raw);
  const incomingProfile =
    parsed?.profile && typeof parsed.profile === "object" ? parsed.profile : parsed;
  if (!incomingProfile || typeof incomingProfile !== "object" || Array.isArray(incomingProfile)) {
    throw new Error("Arquivo de importacao invalido: perfil nao encontrado.");
  }

  const loaded = await sessionManager.loadOrCreate(profileId);
  const nextProfile = deepMerge(loaded.profile, incomingProfile);
  nextProfile.meta.profile_id = profileId;
  nextProfile.meta.updated_at = new Date().toISOString();

  const schemaCheck = validateProfileSchema(nextProfile);
  if (!schemaCheck.valid) {
    throw new Error(`Importacao rejeitada por schema invalido: ${schemaCheck.errors.join(" | ")}`);
  }

  await sessionManager.saveAll(profileId, {
    ...loaded,
    profile: nextProfile,
  });
  return {
    profile: nextProfile,
    state: loaded.state,
  };
}

module.exports = {
  importExternalProfile,
};
