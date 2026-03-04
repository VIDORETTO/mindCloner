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

test("Hardening E2E: recupera state corrompido usando backup", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-hardening-corrupt-"));
  const profileId = "hardening-corrupt-a1";

  await runSession({
    profileId,
    baseDir: tmpRoot,
    io: createScriptedIO(["Ana Maria", "/pause"]),
    maxQuestions: 2,
  });

  const profileDir = path.join(tmpRoot, "profiles", profileId);
  const statePath = path.join(profileDir, "state.json");
  const stateBakPath = `${statePath}.bak`;
  await fs.copyFile(statePath, stateBakPath);
  await fs.writeFile(statePath, "{ arquivo corrompido", "utf8");

  const result = await runSession({
    profileId,
    baseDir: tmpRoot,
    io: createScriptedIO(["/pause"]),
    maxQuestions: 1,
  });

  const recoveredRaw = await fs.readFile(statePath, "utf8");
  const recovered = JSON.parse(recoveredRaw);
  assert.equal(recovered.profile_id, profileId);
  assert.equal(result.state.profile_id, profileId);
});

test("Hardening E2E: recupera sessao quando I/O falha e deixa apenas backup", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-hardening-io-"));
  const profileId = "hardening-io-a1";

  await runSession({
    profileId,
    baseDir: tmpRoot,
    io: createScriptedIO(["Marcos Vinicius", "/pause"]),
    maxQuestions: 2,
  });

  const profileDir = path.join(tmpRoot, "profiles", profileId);
  const statePath = path.join(profileDir, "state.json");
  const stateBakPath = `${statePath}.bak`;

  await fs.rm(stateBakPath, { force: true });
  await fs.rename(statePath, stateBakPath);

  const result = await runSession({
    profileId,
    baseDir: tmpRoot,
    io: createScriptedIO(["/pause"]),
    maxQuestions: 1,
  });

  const restoredRaw = await fs.readFile(statePath, "utf8");
  const restored = JSON.parse(restoredRaw);
  assert.equal(restored.profile_id, profileId);
  assert.equal(result.state.profile_id, profileId);
});
