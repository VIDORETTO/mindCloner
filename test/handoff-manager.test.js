const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { HandoffManager } = require("../src/ai/handoff-manager");

test("HandoffManager: salva snapshot e recupera ultimo handoff", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-handoff-manager-"));
  const manager = new HandoffManager(tmpRoot);

  const saveResult = await manager.saveSnapshot("perfil-a1", {
    sourceSessionId: "session-123",
    state: {
      current_phase: 2,
      current_phase_progress: 35,
    },
    summary: "Resumo de teste",
    openQuestions: ["identity.preferred_name", "identity.age"],
    openContradictions: ["Conflito em rotina semanal"],
    recentConversation: [
      { role: "assistant", content: "Qual o seu nome completo?" },
      { role: "user", content: "Joao Pedro da Silva" },
    ],
    profileCompleteness: 12.5,
  });

  assert.match(path.basename(saveResult.filePath), /^handoff-\d{8}T\d{6}Z\.json$/);
  assert.equal(saveResult.snapshot.profileId, "perfil-a1");
  assert.equal(saveResult.snapshot.sourceSessionId, "session-123");
  assert.equal(saveResult.snapshot.sourcePhase, 2);

  const loaded = await manager.loadLatestSnapshot("perfil-a1");
  assert(loaded);
  assert.equal(loaded.snapshot.handoffId, saveResult.snapshot.handoffId);
  assert.equal(loaded.snapshot.summary, "Resumo de teste");
  assert.equal(loaded.snapshot.openQuestions.length, 2);
  assert.equal(loaded.snapshot.openContradictions.length, 1);
});

test("HandoffManager: lista historico ordenado do mais recente para o mais antigo", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-handoff-history-"));
  const manager = new HandoffManager(tmpRoot);

  await manager.saveSnapshot("perfil-a2", {
    now: new Date("2026-03-04T10:00:00.000Z"),
    sourceSessionId: "session-1",
    profileCompleteness: 10,
  });
  await manager.saveSnapshot("perfil-a2", {
    now: new Date("2026-03-04T11:00:00.000Z"),
    sourceSessionId: "session-2",
    profileCompleteness: 20,
  });

  const history = await manager.listHistory("perfil-a2", { limit: 10 });
  assert.equal(history.length, 2);
  assert.equal(history[0].sourceSessionId, "session-2");
  assert.equal(history[1].sourceSessionId, "session-1");
});
