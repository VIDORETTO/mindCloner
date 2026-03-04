const fs = require("node:fs/promises");
const path = require("node:path");
const { isEncryptedPayload, encryptText, decryptText } = require("../safety/encryption-manager");

class LocalStore {
  constructor(baseDir, options = {}) {
    this.baseDir = baseDir;
    this.encryptionKey = options.encryptionKey || "";
    this.requireEncryption = Boolean(options.requireEncryption);
  }

  getProfileDir(profileId) {
    return path.join(this.baseDir, "profiles", profileId);
  }

  async ensureProfileStructure(profileId) {
    const profileDir = this.getProfileDir(profileId);
    await fs.mkdir(path.join(profileDir, "sessions"), { recursive: true });
    await fs.mkdir(path.join(profileDir, "exports"), { recursive: true });
    return profileDir;
  }

  async readJson(filePath, fallback, options = {}) {
    const backupPath = this.getBackupPath(filePath);
    const readPrimary = async () => {
      const content = await fs.readFile(filePath, "utf8");
      return this.decodeJsonContent(content, options);
    };

    try {
      return await readPrimary();
    } catch (error) {
      if (error.code === "ENOENT") {
        const recovered = await this.tryRecoverFromBackup({ filePath, backupPath, options });
        if (recovered.recovered) {
          return recovered.value;
        }
        return fallback;
      }
      const recovered = await this.tryRecoverFromBackup({ filePath, backupPath, options });
      if (recovered.recovered) {
        return recovered.value;
      }
      throw error;
    }
  }

  async writeJson(filePath, data, options = {}) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const raw = JSON.stringify(data, null, 2);
    if (!options.sensitive) {
      await this.safeWriteFile(filePath, raw);
      return;
    }
    if (!this.encryptionKey) {
      if (this.requireEncryption) {
        throw new Error("Chave de criptografia ausente para salvar dados sensiveis.");
      }
      await this.safeWriteFile(filePath, raw);
      return;
    }
    const payload = encryptText(raw, this.encryptionKey);
    await this.safeWriteFile(filePath, JSON.stringify(payload, null, 2));
  }

  async writeText(filePath, value, options = {}) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    if (!options.sensitive) {
      await this.safeWriteFile(filePath, value);
      return;
    }
    if (!this.encryptionKey) {
      if (this.requireEncryption) {
        throw new Error("Chave de criptografia ausente para salvar dados sensiveis.");
      }
      await this.safeWriteFile(filePath, value);
      return;
    }
    const payload = encryptText(value, this.encryptionKey);
    await this.safeWriteFile(filePath, JSON.stringify(payload, null, 2));
  }

  getBackupPath(filePath) {
    return `${filePath}.bak`;
  }

  buildTempPath(filePath) {
    return `${filePath}.tmp-${process.pid}-${Date.now()}`;
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  decodeJsonContent(content, options = {}) {
    const parsed = JSON.parse(content);
    if (!options.sensitive) {
      return parsed;
    }
    if (!isEncryptedPayload(parsed)) {
      return parsed;
    }
    if (!this.encryptionKey) {
      throw new Error(
        "Arquivo sensivel criptografado encontrado, mas nenhuma chave foi fornecida."
      );
    }
    const decrypted = decryptText(parsed, this.encryptionKey);
    return JSON.parse(decrypted);
  }

  async tryRecoverFromBackup({ filePath, backupPath, options }) {
    if (!(await this.fileExists(backupPath))) {
      return { recovered: false, value: null };
    }
    try {
      const backupContent = await fs.readFile(backupPath, "utf8");
      const value = this.decodeJsonContent(backupContent, options);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.copyFile(backupPath, filePath);
      return { recovered: true, value };
    } catch {
      return { recovered: false, value: null };
    }
  }

  async safeWriteFile(filePath, content) {
    const backupPath = this.getBackupPath(filePath);
    const tempPath = this.buildTempPath(filePath);
    const hadOriginal = await this.fileExists(filePath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(tempPath, content, "utf8");
    try {
      if (hadOriginal) {
        await fs.copyFile(filePath, backupPath);
        await fs.rm(filePath, { force: true });
      }
      await fs.rename(tempPath, filePath);
    } catch (error) {
      try {
        await fs.rm(tempPath, { force: true });
      } catch {}
      if (!(await this.fileExists(filePath)) && (await this.fileExists(backupPath))) {
        try {
          await fs.copyFile(backupPath, filePath);
        } catch {}
      }
      throw error;
    }
  }
}

module.exports = {
  LocalStore,
};
