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
      outputs.push(message);
    },
    async ask() {
      const value = answers[index];
      index += 1;
      return value ?? "";
    },
  };
}

test("Fase 2 E2E: executa lifestyle e transiciona para fase 3", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-test-"));
  const profileId = "maria-souza-z9y8";

  const phase1Io = createScriptedIO([
    "Maria Souza",
    "Mari",
    "29",
    "Curitiba",
    "Brasil",
    "Curitiba",
    "Solteira",
    "nenhum",
    "Paulo",
    "Portugues, Ingles",
    "Brasileira",
  ]);

  const phase1Result = await runSession({
    profileId,
    baseDir: tmpRoot,
    io: phase1Io,
  });

  assert.equal(phase1Result.state.current_phase, 2);

  const phase2Io = createScriptedIO([
    "Acordo cedo, caminho e organizo o dia.",
    "Trabalho focada e faco pausas curtas.",
    "Leio, cozinho e faco yoga.",
    "Janto cedo e durmo por volta de 23h.",
    "Bem estavel durante a semana.",
    "Leio semanalmente.",
    "Assisto quase todos os dias.",
    "Musica me ajuda a concentrar.",
    "Tenho uma relacao equilibrada com comida.",
    "Gosto de cozinhar nos fins de semana.",
    "Viagens culturais com roteiro flexivel.",
    "Viajo duas vezes por ano.",
    "Conhecer culturas novas e descansar.",
    "Uso tecnologia para trabalho e lazer.",
    "Adoto depois que vejo bons sinais.",
  ]);

  const phase2Result = await runSession({
    profileId,
    baseDir: tmpRoot,
    io: phase2Io,
  });

  assert.equal(phase2Result.phaseTransitioned, true);
  assert.equal(phase2Result.state.current_phase, 3);
  assert.equal(phase2Result.state.phases_status.phase_02.status, "completed");
  assert.match(phase2Result.summary, /Completude: 100%/);

  const profileDir = path.join(tmpRoot, "profiles", profileId);
  const profileRaw = JSON.parse(
    await fs.readFile(path.join(profileDir, "partial-profile.json"), "utf8")
  );
  assert.equal(
    profileRaw.interests_and_preferences.travel.style,
    "Viagens culturais com roteiro flexivel."
  );
  assert.equal(
    profileRaw.behavioral_patterns.daily_routine.consistency_level,
    "Bem estavel durante a semana."
  );
  assert.equal(profileRaw.meta.last_phase, "phase_03");
});
