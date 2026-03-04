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

test("Protocolo de crise E2E: detecta risco alto, interrompe fluxo e registra evento", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-crisis-"));
  const io = createScriptedIO(["quero morrer"]);

  const result = await runSession({
    profileId: "crisis-v1",
    baseDir: tmpRoot,
    io,
    enableCrisisProtocol: true,
  });

  assert.equal(result.abortedBySafety, true);
  assert.equal(result.phaseTransitioned, false);
  assert.equal(result.state.current_phase, 1);
  assert.equal(result.state.total_questions, 0);
  assert.equal(result.profile.meta.safety.crisis_events_count, 1);
  assert.match(result.profile.meta.safety.last_crisis_at, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(result.state.safety.crisis_protocol_triggered, true);
  assert.equal(result.state.safety.crisis_events.length, 1);
  assert.equal(result.state.safety.crisis_events[0].phase, 1);
  assert.equal(result.state.safety.crisis_events[0].reason, "self-harm-indicator");
  assert(
    io.outputs.some((line) => line.includes("CVV: 188")),
    "Mensagem de suporte com CVV nao foi exibida"
  );

  const profileDir = path.join(tmpRoot, "profiles", "crisis-v1");
  const stateRaw = JSON.parse(await fs.readFile(path.join(profileDir, "state.json"), "utf8"));
  const profileRaw = JSON.parse(
    await fs.readFile(path.join(profileDir, "partial-profile.json"), "utf8")
  );

  assert.equal(stateRaw.safety.crisis_events.length, 1);
  assert.equal(profileRaw.meta.safety.crisis_events_count, 1);
});
