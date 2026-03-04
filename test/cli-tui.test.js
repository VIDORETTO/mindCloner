const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { SessionManager } = require("../src/storage/session-manager");
const { SettingsManager } = require("../src/config/settings-manager");
const { createDefaultSettings, normalizeSettings } = require("../src/config/settings-schema");
const { runFromCliWithDeps } = require("../src/cli/menu");

function createMemoryIO() {
  const outputs = [];
  return {
    outputs,
    async say(message) {
      outputs.push(String(message));
    },
    async close() {},
  };
}

function createSetupResult(baseDir, profileId = "perfil-principal") {
  return {
    settings: normalizeSettings(
      {
        ...createDefaultSettings({ baseDir, defaultProfileId: profileId }),
        consent: {
          accepted: true,
          acceptedAt: new Date().toISOString(),
          version: "cli-v1",
        },
      },
      { baseDir, defaultProfileId: profileId }
    ),
    openaiApiKey: "",
  };
}

test("CLI TUI: acao start-interview delega para runSession", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-tui-start-"));
  const profileId = "tui-start-a1";
  const io = createMemoryIO();
  let runCalls = 0;

  await runFromCliWithDeps(
    ["node", "bin/mindclone.js", "--baseDir", tmpRoot, "--profile", profileId],
    {
      ioFactory: () => io,
      shouldUseInteractiveShellFn: () => true,
      tuiRunner: async () => ({ action: "start-interview" }),
      setupWizardFn: async () => createSetupResult(tmpRoot, profileId),
      runSessionFn: async () => {
        runCalls += 1;
        const manager = new SessionManager(tmpRoot);
        const loaded = await manager.loadOrCreate(profileId);
        return {
          summary: "Sessao iniciada pelo TUI",
          state: loaded.state,
          profile: loaded.profile,
        };
      },
    }
  );

  assert.equal(runCalls, 1);
  assert(io.outputs.some((line) => line.includes("MindClone CLI")));
  assert(io.outputs.some((line) => line.includes("Resumo da fase: Sessao iniciada pelo TUI")));
});

test("CLI TUI: acao continue-interview ativa caminho de resume", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-tui-resume-"));
  const profileId = "tui-resume-a1";
  const manager = new SessionManager(tmpRoot);
  await manager.loadOrCreate(profileId);

  const io = createMemoryIO();
  let runCalls = 0;
  await runFromCliWithDeps(
    ["node", "bin/mindclone.js", "--baseDir", tmpRoot, "--profile", profileId],
    {
      ioFactory: () => io,
      shouldUseInteractiveShellFn: () => true,
      tuiRunner: async () => ({ action: "continue-interview" }),
      setupWizardFn: async () => createSetupResult(tmpRoot, profileId),
      runSessionFn: async () => {
        runCalls += 1;
        const loaded = await manager.loadExisting(profileId);
        return {
          summary: "Retomada via TUI",
          state: loaded.state,
          profile: loaded.profile,
        };
      },
    }
  );

  assert.equal(runCalls, 1);
  assert(io.outputs.some((line) => line.includes("Retomando sessao existente")));
});

test("CLI TUI: acao generate-document ativa status+export sem runSession", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-tui-export-"));
  const profileId = "tui-export-a1";
  const manager = new SessionManager(tmpRoot);
  await manager.loadOrCreate(profileId);

  const io = createMemoryIO();
  let runCalls = 0;
  await runFromCliWithDeps(
    ["node", "bin/mindclone.js", "--baseDir", tmpRoot, "--profile", profileId],
    {
      ioFactory: () => io,
      shouldUseInteractiveShellFn: () => true,
      tuiRunner: async () => ({ action: "generate-document" }),
      setupWizardFn: async () => createSetupResult(tmpRoot, profileId),
      runSessionFn: async () => {
        runCalls += 1;
        throw new Error("Nao deveria executar runSession para generate-document via TUI");
      },
    }
  );

  assert.equal(runCalls, 0);
  assert(io.outputs.some((line) => line.includes("Status atual:")));
  assert(io.outputs.some((line) => line.includes("Exportacao concluida em")));
});

test("CLI Setup: first-use executa wizard e salva settings", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-setup-first-"));
  let setupCalls = 0;
  await runFromCliWithDeps(["node", "bin/mindclone.js", "--baseDir", tmpRoot], {
    ioFactory: () => createMemoryIO(),
    shouldUseInteractiveShellFn: () => true,
    tuiRunner: async () => ({ action: "exit" }),
    setupWizardFn: async () => {
      setupCalls += 1;
      return createSetupResult(tmpRoot, "wizard-user-a1");
    },
  });

  const manager = new SettingsManager(tmpRoot);
  const loaded = await manager.loadSettings();
  assert.equal(setupCalls, 1);
  assert.equal(loaded.exists, true);
  assert.equal(loaded.settings.defaultProfileId, "wizard-user-a1");
  assert.equal(loaded.settings.ai.provider, "openai");
  assert.equal(loaded.settings.ai.model, "gpt-5-mini-2025-08-07");
});

test("CLI Setup: acao settings no TUI abre wizard de edicao", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-setup-edit-"));
  const settingsManager = new SettingsManager(tmpRoot);
  await settingsManager.saveSettings(createSetupResult(tmpRoot, "perfil-inicial-a1").settings);

  const actions = ["settings", "exit"];
  let setupCalls = 0;
  await runFromCliWithDeps(["node", "bin/mindclone.js", "--baseDir", tmpRoot], {
    ioFactory: () => createMemoryIO(),
    shouldUseInteractiveShellFn: () => true,
    tuiRunner: async () => ({ action: actions.shift() || "exit" }),
    setupWizardFn: async ({ mode }) => {
      setupCalls += 1;
      assert.equal(mode, "edit");
      return createSetupResult(tmpRoot, "perfil-editado-a1");
    },
  });

  const loaded = await settingsManager.loadSettings();
  assert.equal(setupCalls, 1);
  assert.equal(loaded.settings.defaultProfileId, "perfil-editado-a1");
});

test("CLI: usa modo de entrevista configurado em settings", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-mode-settings-"));
  const profileId = "mode-settings-a1";
  const settingsManager = new SettingsManager(tmpRoot);
  await settingsManager.saveSettings(
    normalizeSettings(
      {
        ...createSetupResult(tmpRoot, profileId).settings,
        interview: {
          defaultMode: "phased",
          maxQuestionsPerSession: 7,
        },
      },
      { baseDir: tmpRoot, defaultProfileId: profileId }
    )
  );

  let capturedMode = "";
  let capturedMaxQuestions = 0;
  await runFromCliWithDeps(
    ["node", "bin/mindclone.js", "--baseDir", tmpRoot, "--profile", profileId],
    {
      ioFactory: () => createMemoryIO(),
      shouldUseInteractiveShellFn: () => false,
      runSessionFn: async (input) => {
        capturedMode = input.interviewMode;
        capturedMaxQuestions = input.maxQuestions;
        const manager = new SessionManager(tmpRoot);
        const loaded = await manager.loadOrCreate(profileId);
        return {
          summary: "ok",
          state: loaded.state,
          profile: loaded.profile,
        };
      },
    }
  );

  assert.equal(capturedMode, "phased");
  assert.equal(capturedMaxQuestions, 7);
});

test("CLI: --interview-mode sobrescreve modo de entrevista do settings", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-mode-override-"));
  const profileId = "mode-override-a1";
  const settingsManager = new SettingsManager(tmpRoot);
  await settingsManager.saveSettings(createSetupResult(tmpRoot, profileId).settings);

  let capturedMode = "";
  await runFromCliWithDeps(
    [
      "node",
      "bin/mindclone.js",
      "--baseDir",
      tmpRoot,
      "--profile",
      profileId,
      "--interview-mode",
      "phased",
    ],
    {
      ioFactory: () => createMemoryIO(),
      shouldUseInteractiveShellFn: () => false,
      runSessionFn: async (input) => {
        capturedMode = input.interviewMode;
        const manager = new SessionManager(tmpRoot);
        const loaded = await manager.loadOrCreate(profileId);
        return {
          summary: "ok",
          state: loaded.state,
          profile: loaded.profile,
        };
      },
    }
  );

  assert.equal(capturedMode, "phased");
});
