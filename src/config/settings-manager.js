const fs = require("node:fs/promises");
const path = require("node:path");
const { createDefaultSettings, normalizeSettings, validateSettings } = require("./settings-schema");
const { encryptText, isEncryptedPayload, decryptText } = require("../safety/encryption-manager");

class SettingsManager {
  constructor(baseDir, options = {}) {
    this.baseDir = baseDir;
    this.encryptionKey = String(options.encryptionKey || "");
  }

  withBaseDir(baseDir) {
    return new SettingsManager(baseDir, { encryptionKey: this.encryptionKey });
  }

  settingsPath() {
    return path.join(this.baseDir, "settings.json");
  }

  secretsPath() {
    return path.join(this.baseDir, "settings.secrets.json");
  }

  async loadSettings() {
    const fallback = createDefaultSettings({ baseDir: this.baseDir });
    try {
      const raw = await fs.readFile(this.settingsPath(), "utf8");
      const parsed = JSON.parse(raw);
      const normalized = normalizeSettings(parsed, { baseDir: this.baseDir });
      return {
        exists: true,
        settings: normalized,
      };
    } catch (error) {
      if (error.code === "ENOENT") {
        return {
          exists: false,
          settings: fallback,
        };
      }
      throw new Error(`Falha ao carregar settings: ${error.message}`);
    }
  }

  async saveSettings(input) {
    const normalized = normalizeSettings(input, { baseDir: this.baseDir });
    const validation = validateSettings(normalized);
    if (!validation.valid) {
      throw new Error(`Settings invalidas: ${validation.errors.join(" | ")}`);
    }
    await fs.mkdir(path.dirname(this.settingsPath()), { recursive: true });
    await fs.writeFile(this.settingsPath(), JSON.stringify(normalized, null, 2), "utf8");
    return normalized;
  }

  async loadSecrets() {
    try {
      const raw = await fs.readFile(this.secretsPath(), "utf8");
      const parsed = JSON.parse(raw);
      if (!isEncryptedPayload(parsed)) {
        const apiKey = String(parsed?.openaiApiKey || "").trim();
        return {
          exists: true,
          encrypted: false,
          secrets: {
            openaiApiKey: apiKey,
          },
        };
      }
      if (!this.encryptionKey) {
        throw new Error(
          "Arquivo de secrets criptografado encontrado, mas MINDCLONE_ENCRYPTION_KEY nao foi definida."
        );
      }
      const decrypted = decryptText(parsed, this.encryptionKey);
      const payload = JSON.parse(decrypted);
      return {
        exists: true,
        encrypted: true,
        secrets: {
          openaiApiKey: String(payload?.openaiApiKey || "").trim(),
        },
      };
    } catch (error) {
      if (error.code === "ENOENT") {
        return {
          exists: false,
          encrypted: false,
          secrets: {
            openaiApiKey: "",
          },
        };
      }
      throw new Error(`Falha ao carregar secrets: ${error.message}`);
    }
  }

  async saveSecrets(input) {
    const openaiApiKey = String(input?.openaiApiKey || "").trim();
    if (!openaiApiKey) {
      await fs.rm(this.secretsPath(), { force: true });
      return { saved: false, encrypted: false };
    }
    if (!this.encryptionKey) {
      throw new Error(
        "Nao foi possivel salvar API key com seguranca: defina MINDCLONE_ENCRYPTION_KEY para persistir secrets."
      );
    }
    const payload = encryptText(JSON.stringify({ openaiApiKey }), this.encryptionKey);
    await fs.mkdir(path.dirname(this.secretsPath()), { recursive: true });
    await fs.writeFile(this.secretsPath(), JSON.stringify(payload, null, 2), "utf8");
    return { saved: true, encrypted: true };
  }

  resolveApiKey({ envApiKey = "", cliApiKey = "", secretsApiKey = "" } = {}) {
    const env = String(envApiKey || "").trim();
    if (env) {
      return env;
    }
    const cli = String(cliApiKey || "").trim();
    if (cli) {
      return cli;
    }
    return String(secretsApiKey || "").trim();
  }
}

module.exports = {
  SettingsManager,
};
