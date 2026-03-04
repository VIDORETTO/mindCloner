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

test("Fase 1 E2E: cria sessao, salva estado e transiciona para fase 2", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-test-"));
  const io = createScriptedIO([
    "Joao Pedro da Silva",
    "JP",
    "32",
    "Sao Paulo",
    "Brasil",
    "Belo Horizonte",
    "Casado",
    "nenhum",
    "Ana, Carlos",
    "Portugues, Ingles",
    "Brasileiro, mineiro",
  ]);

  const result = await runSession({
    profileId: "joao-silva-a1b2",
    baseDir: tmpRoot,
    io,
  });

  assert.equal(result.phaseTransitioned, true);
  assert.equal(result.state.current_phase, 2);
  assert.equal(result.state.phases_status.phase_01.status, "completed");

  const profileDir = path.join(tmpRoot, "profiles", "joao-silva-a1b2");
  const stateRaw = JSON.parse(await fs.readFile(path.join(profileDir, "state.json"), "utf8"));
  const profileRaw = JSON.parse(
    await fs.readFile(path.join(profileDir, "partial-profile.json"), "utf8")
  );
  const trackerRaw = JSON.parse(
    await fs.readFile(path.join(profileDir, "question-tracker.json"), "utf8")
  );

  assert.equal(stateRaw.current_phase, 2);
  assert.equal(profileRaw.identity.preferred_name, "JP");
  assert.equal(profileRaw.identity.age, 32);
  assert.equal(trackerRaw.question_tracker.questions_asked.length > 0, true);
  assert.match(result.summary, /Completude: 100%/);
});
