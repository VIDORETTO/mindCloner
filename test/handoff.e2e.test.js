const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { runSession } = require("../src");

function createScriptedIO(answers) {
  const outputs = [];
  let index = 0;
  return {
    outputs,
    async say(message) {
      outputs.push(String(message));
    },
    async ask() {
      const value = answers[index];
      index += 1;
      return value ?? "";
    },
  };
}

test("Handoff E2E: /save seguido de /new preserva contexto e cria snapshot", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-handoff-e2e-"));
  const profileId = "handoff-flow-a1";
  const io = createScriptedIO(["Joao Pedro da Silva", "/save", "/new", "JP", "/status", "/pause"]);

  const result = await runSession({
    profileId,
    baseDir: tmpRoot,
    io,
    maxQuestions: 5,
  });

  assert.equal(result.abortedBySafety, false);
  assert.equal(result.abortedByConsent, false);
  assert.equal(result.handoff.lastSavedAt.length > 0, true);
  assert.match(result.handoff.lastSavedPath, /handoff-\d{8}T\d{6}Z\.json$/);
  assert.equal(result.handoff.activeHandoffId.length > 0, true);
  assert(
    io.outputs.some((line) => line.includes("[Handoff] Snapshot salvo:")),
    "Comando /save deveria confirmar caminho do snapshot"
  );
  assert(
    io.outputs.some((line) => line.includes("Nova sessao de agente iniciada")),
    "Comando /new deveria iniciar nova sessao de agente com contexto salvo"
  );
  assert(
    io.outputs.some((line) => line.includes("Status da entrevista:")),
    "Comando /status deveria exibir status detalhado"
  );

  const handoffsDir = path.join(tmpRoot, "profiles", profileId, "handoffs");
  const handoffFiles = (await fs.readdir(handoffsDir)).filter((name) =>
    /^handoff-\d{8}T\d{6}Z\.json$/.test(name)
  );
  assert.equal(handoffFiles.length >= 1, true);
  const historyRaw = JSON.parse(await fs.readFile(path.join(handoffsDir, "history.json"), "utf8"));
  assert.equal(Array.isArray(historyRaw), true);
  assert.equal(historyRaw.length >= 1, true);
});

test("Handoff E2E: /new sem snapshot orienta uso de /save", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-handoff-nosnapshot-"));
  const io = createScriptedIO(["/new", "Joao Pedro da Silva", "/pause"]);

  const result = await runSession({
    profileId: "handoff-nosnapshot-a1",
    baseDir: tmpRoot,
    io,
    maxQuestions: 3,
  });

  assert.equal(result.abortedBySafety, false);
  assert.equal(result.abortedByConsent, false);
  assert.equal(result.handoff.lastSavedAt, "");
  assert(
    io.outputs.some((line) => line.includes("Use /save para criar um handoff antes de /new")),
    "Fluxo sem snapshot deve orientar acao recomendada"
  );
});
