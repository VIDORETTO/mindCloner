const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { SettingsManager } = require("../src/config/settings-manager");
const {
  createDefaultSettings,
  normalizeSettings,
  LOCKED_PROVIDER,
  LOCKED_MODEL,
} = require("../src/config/settings-schema");

test("SettingsManager: loadSettings retorna defaults quando arquivo nao existe", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-settings-default-"));
  const manager = new SettingsManager(tmpRoot);
  const loaded = await manager.loadSettings();
  assert.equal(loaded.exists, false);
  assert.equal(loaded.settings.baseDir, tmpRoot);
  assert.equal(loaded.settings.ai.provider, LOCKED_PROVIDER);
  assert.equal(loaded.settings.ai.model, LOCKED_MODEL);
});

test("SettingsManager: saveSettings normaliza provider/model e recarrega", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-settings-save-"));
  const manager = new SettingsManager(tmpRoot);
  await manager.saveSettings(
    normalizeSettings(
      {
        ...createDefaultSettings({ baseDir: tmpRoot }),
        ai: {
          provider: "local",
          model: "xpto",
          timeoutMs: 99999,
          maxRetries: 5,
        },
      },
      { baseDir: tmpRoot }
    )
  );

  const loaded = await manager.loadSettings();
  assert.equal(loaded.exists, true);
  assert.equal(loaded.settings.ai.provider, LOCKED_PROVIDER);
  assert.equal(loaded.settings.ai.model, LOCKED_MODEL);
  assert.equal(loaded.settings.ai.maxRetries, 5);
});

test("SettingsManager: saveSecrets exige chave de criptografia", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-settings-secrets-miss-"));
  const manager = new SettingsManager(tmpRoot);
  await assert.rejects(
    () => manager.saveSecrets({ openaiApiKey: "sk-test-123" }),
    /MINDCLONE_ENCRYPTION_KEY/i
  );
});

test("SettingsManager: saveSecrets + loadSecrets com criptografia", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-settings-secrets-ok-"));
  const manager = new SettingsManager(tmpRoot, { encryptionKey: "key-settings-123" });
  await manager.saveSecrets({ openaiApiKey: "sk-test-abc" });

  const raw = await fs.readFile(path.join(tmpRoot, "settings.secrets.json"), "utf8");
  assert.match(raw, /"__encrypted": true/);

  const loaded = await manager.loadSecrets();
  assert.equal(loaded.exists, true);
  assert.equal(loaded.encrypted, true);
  assert.equal(loaded.secrets.openaiApiKey, "sk-test-abc");
});
