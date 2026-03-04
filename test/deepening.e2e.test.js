const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { runSession } = require("../src");
const { SessionManager } = require("../src/storage/session-manager");

function createScriptedIO(answers) {
  const outputs = [];
  let index = 0;
  return {
    outputs,
    async say(message) {
      outputs.push(message);
    },
    async ask() {
      const value = answers[index];
      index += 1;
      return value ?? "";
    },
  };
}

test("Deepening E2E: executa pos-fase 10, melhora completude e mantem historico", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-deepening-"));
  const profileId = "deepening-v1";
  const sessionManager = new SessionManager(tmpRoot);
  const loaded = await sessionManager.loadOrCreate(profileId);

  loaded.state.current_phase = 10;
  loaded.state.current_phase_progress = 100;
  loaded.state.overall_progress = 100;
  loaded.state.phases_status.phase_10 = { status: "completed", score: 100 };
  loaded.profile.meta.last_phase = "phase_10";
  loaded.profile.meta.phases_completed = [
    "phase_01",
    "phase_02",
    "phase_03",
    "phase_04",
    "phase_05",
    "phase_06",
    "phase_07",
    "phase_08",
    "phase_09",
    "phase_10",
  ];
  loaded.profile.values_and_beliefs.worldview.summary = "";
  loaded.profile.synthesis.growth_edges = ["delegar melhor"];
  const contradictions = [
    {
      contradiction: "Alta exigencia por controle vs desejo de espontaneidade.",
      explanation: "",
      phase_detected: 5,
      resolved: false,
      created_at: new Date().toISOString(),
    },
  ];
  const beforeCompleteness = loaded.profile.meta.completeness_score;

  await sessionManager.saveAll(profileId, {
    state: loaded.state,
    profile: loaded.profile,
    tracker: loaded.tracker,
    contradictions,
  });

  const io = createScriptedIO([
    "No trabalho eu estruturo muito; no pessoal busco espontaneidade para recuperar energia.",
    "Vejo o mundo como complexo, mas com espaco real para construir sentido e progresso.",
    "delegar com contexto, reduzir autocobranca",
  ]);
  const result = await runSession({
    profileId,
    baseDir: tmpRoot,
    io,
    deepeningMode: true,
    maxQuestions: 3,
  });

  assert.equal(result.abortedBySafety, false);
  assert.equal(result.deepeningPerformed, true);
  assert.equal(result.state.current_phase, 10);
  assert.equal(result.state.current_phase_progress, 100);
  assert.equal(result.state.deepening_sessions, 1);
  assert.equal(result.profile.meta.deepening_sessions, 1);
  assert.equal(result.profile.values_and_beliefs.worldview.summary.length > 0, true);
  assert.equal(result.profile.meta.completeness_score > beforeCompleteness, true);
  assert.equal(
    result.profile.meta.confidence_scores["values_and_beliefs.worldview.summary"] >= 75,
    true
  );
  assert.match(result.summary, /Deepening concluido/);

  const profileDir = path.join(tmpRoot, "profiles", profileId);
  const contradictionsRaw = JSON.parse(
    await fs.readFile(path.join(profileDir, "contradictions.json"), "utf8")
  );
  const trackerRaw = JSON.parse(
    await fs.readFile(path.join(profileDir, "question-tracker.json"), "utf8")
  );

  assert.equal(contradictionsRaw[0].resolved, true);
  assert.equal(contradictionsRaw[0].explanation.length > 0, true);
  assert.equal(
    trackerRaw.question_tracker.questions_asked.some((entry) => entry.phase === "deepening"),
    true
  );
});
