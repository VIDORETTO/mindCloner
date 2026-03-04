const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { runSession } = require("../src");
const { DEFAULT_CONSENT_VERSION } = require("../src/safety/consent-manager");

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

test("Consentimento E2E: aceite explicito libera fluxo e salva metadados", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-consent-ok-"));
  const io = createScriptedIO([
    "aceito",
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
    profileId: "consent-ok-a1",
    baseDir: tmpRoot,
    io,
    requireConsent: true,
    consentSource: "test",
  });

  assert.equal(result.abortedByConsent, false);
  assert.equal(result.phaseTransitioned, true);
  assert.equal(result.state.current_phase, 2);
  assert.equal(result.profile.meta.consent.accepted, true);
  assert.equal(result.profile.meta.consent.version, DEFAULT_CONSENT_VERSION);
  assert.equal(result.profile.meta.consent.source, "test");
  assert.match(result.profile.meta.consent.accepted_at, /^\d{4}-\d{2}-\d{2}T/);
});

test("Consentimento E2E: sem aceite explicito encerra sessao sem perguntas", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-consent-block-"));
  const io = createScriptedIO(["nao"]);

  const result = await runSession({
    profileId: "consent-block-a1",
    baseDir: tmpRoot,
    io,
    requireConsent: true,
    consentSource: "test",
  });

  assert.equal(result.abortedByConsent, true);
  assert.equal(result.phaseTransitioned, false);
  assert.equal(result.state.current_phase, 1);
  assert.equal(result.state.total_questions, 0);
  assert.equal(result.profile.meta.total_sessions, 0);
  assert.equal(result.profile.meta.consent.accepted, false);
  assert.match(result.summary, /falta de consentimento/i);
  assert(
    io.outputs.some((line) => line.includes("Consentimento nao concedido")),
    "Mensagem de bloqueio de consentimento nao foi exibida"
  );
});
