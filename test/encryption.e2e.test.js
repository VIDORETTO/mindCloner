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

test("Criptografia E2E: salva state/profile/sessao criptografados e reabre com chave valida", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-encrypt-ok-"));
  const key = "super-secret-key-01";
  const io = createScriptedIO(["Joao Pedro", "/pause"]);

  const firstRun = await runSession({
    profileId: "encrypt-ok-v1",
    baseDir: tmpRoot,
    io,
    encryptionKey: key,
    requireEncryption: true,
    maxQuestions: 2,
  });

  const profileDir = path.join(tmpRoot, "profiles", "encrypt-ok-v1");
  const stateRaw = await fs.readFile(path.join(profileDir, "state.json"), "utf8");
  const profileRaw = await fs.readFile(path.join(profileDir, "partial-profile.json"), "utf8");
  const sessionRaw = await fs.readFile(
    path.join(profileDir, "sessions", `${firstRun.state.last_session_id}.json`),
    "utf8"
  );

  assert.equal(stateRaw.includes("Joao Pedro"), false);
  assert.equal(profileRaw.includes("Joao Pedro"), false);
  assert.equal(sessionRaw.includes("Joao Pedro"), false);
  assert.equal(JSON.parse(stateRaw).__encrypted, true);
  assert.equal(JSON.parse(profileRaw).__encrypted, true);
  assert.equal(JSON.parse(sessionRaw).__encrypted, true);

  const secondRun = await runSession({
    profileId: "encrypt-ok-v1",
    baseDir: tmpRoot,
    io: createScriptedIO(["/pause"]),
    encryptionKey: key,
    requireEncryption: true,
    maxQuestions: 1,
  });

  assert.equal(secondRun.profile.identity.full_name, "Joao Pedro");
});

test("Criptografia E2E: chave invalida impede leitura de arquivos sensiveis", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-encrypt-fail-"));

  await runSession({
    profileId: "encrypt-fail-v1",
    baseDir: tmpRoot,
    io: createScriptedIO(["Maria Clara", "/pause"]),
    encryptionKey: "key-valid-123",
    requireEncryption: true,
    maxQuestions: 2,
  });

  await assert.rejects(
    () =>
      runSession({
        profileId: "encrypt-fail-v1",
        baseDir: tmpRoot,
        io: createScriptedIO(["/pause"]),
        encryptionKey: "key-invalid-999",
        requireEncryption: true,
      }),
    /chave invalida|descriptografar/i
  );
});
