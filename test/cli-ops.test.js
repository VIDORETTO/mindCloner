const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { SessionManager } = require("../src/storage/session-manager");
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

test("CLI --status: mostra status sem executar sessao", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-status-"));
  const profileId = "status-user-a1";
  const manager = new SessionManager(tmpRoot);
  const loaded = await manager.loadOrCreate(profileId);
  loaded.state.current_phase = 4;
  loaded.state.current_phase_progress = 55;
  loaded.state.overall_progress = 35;
  loaded.state.total_questions = 22;
  loaded.profile.meta.total_sessions = 3;
  loaded.profile.meta.completeness_score = 44.8;
  await manager.saveAll(profileId, loaded);

  const io = createMemoryIO();
  let runCalls = 0;
  await runFromCliWithDeps(
    ["node", "bin/mindclone.js", "--baseDir", tmpRoot, "--profile", profileId, "--status"],
    {
      ioFactory: () => io,
      runSessionFn: async () => {
        runCalls += 1;
      },
    }
  );

  assert.equal(runCalls, 0);
  assert(io.outputs.some((line) => line.includes("Status atual:")));
  assert(io.outputs.some((line) => line.includes("Fase atual: 4 (55%)")));
});

test("CLI --resume: falha com mensagem orientada quando perfil nao existe", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-resume-miss-"));
  const io = createMemoryIO();
  await assert.rejects(
    () =>
      runFromCliWithDeps(
        ["node", "bin/mindclone.js", "--baseDir", tmpRoot, "--profile", "inexistente", "--resume"],
        {
          ioFactory: () => io,
          runSessionFn: async () => ({ summary: "ok", state: {}, profile: {} }),
        }
      ),
    /Perfil nao encontrado/i
  );
});

test("CLI --resume: retoma perfil existente de forma idempotente", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-resume-ok-"));
  const profileId = "resume-user-a1";
  const manager = new SessionManager(tmpRoot);
  await manager.loadOrCreate(profileId);

  const calls = [];
  const runSessionFn = async (input) => {
    calls.push(input.profileId);
    return {
      summary: "Execucao concluida",
      state: { current_phase: 1, overall_progress: 0 },
      profile: (await manager.loadExisting(profileId)).profile,
    };
  };

  const io1 = createMemoryIO();
  await runFromCliWithDeps(
    ["node", "bin/mindclone.js", "--baseDir", tmpRoot, "--profile", profileId, "--resume"],
    {
      ioFactory: () => io1,
      runSessionFn,
    }
  );
  const io2 = createMemoryIO();
  await runFromCliWithDeps(
    ["node", "bin/mindclone.js", "--baseDir", tmpRoot, "--profile", profileId, "--resume"],
    {
      ioFactory: () => io2,
      runSessionFn,
    }
  );

  assert.deepEqual(calls, [profileId, profileId]);
  assert(io1.outputs.some((line) => line.includes("Retomando sessao existente")));
});

test("CLI --status --export: gera artefatos sem iniciar entrevista", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-status-export-"));
  const profileId = "status-export-a1";
  const manager = new SessionManager(tmpRoot);
  const loaded = await manager.loadOrCreate(profileId);
  loaded.profile.identity.preferred_name = "Maria";
  loaded.profile.synthesis.core_essence_paragraph = "Estrategica e humana.";
  await manager.saveAll(profileId, loaded);

  const io = createMemoryIO();
  await runFromCliWithDeps(
    [
      "node",
      "bin/mindclone.js",
      "--baseDir",
      tmpRoot,
      "--profile",
      profileId,
      "--status",
      "--export",
      "summary,markdown",
    ],
    {
      ioFactory: () => io,
      runSessionFn: async () => {
        throw new Error("Nao deveria executar runSession");
      },
    }
  );

  const summaryPath = path.join(tmpRoot, "exports", profileId, "summary.txt");
  const markdownPath = path.join(tmpRoot, "exports", profileId, "profile.md");
  const summaryExists = await fs
    .access(summaryPath)
    .then(() => true)
    .catch(() => false);
  const mdExists = await fs
    .access(markdownPath)
    .then(() => true)
    .catch(() => false);
  assert.equal(summaryExists, true);
  assert.equal(mdExists, true);
});

test("CLI: repassa --ai-base-url para runSession", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-ai-base-"));
  const io = createMemoryIO();
  let capturedBaseUrl = "";
  await runFromCliWithDeps(
    [
      "node",
      "bin/mindclone.js",
      "--baseDir",
      tmpRoot,
      "--profile",
      "ai-base-url-a1",
      "--ai-base-url",
      "http://127.0.0.1:11434",
      "--provider",
      "ollama",
    ],
    {
      ioFactory: () => io,
      runSessionFn: async (input) => {
        capturedBaseUrl = input.aiBaseUrl;
        return {
          summary: "ok",
          state: { current_phase: 1, overall_progress: 0 },
          profile: (await new SessionManager(tmpRoot).loadOrCreate("ai-base-url-a1")).profile,
        };
      },
    }
  );
  assert.equal(capturedBaseUrl, "http://127.0.0.1:11434");
});
