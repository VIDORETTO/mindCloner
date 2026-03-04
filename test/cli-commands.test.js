const test = require("node:test");
const assert = require("node:assert/strict");
const {
  INTERVIEW_COMMANDS,
  buildInterviewCommandsHelp,
  parseInterviewCommand,
  parseSlashInput,
} = require("../src/cli/commands");

test("CLI commands: parseInterviewCommand reconhece comando suportado", () => {
  const parsed = parseInterviewCommand("   /STATUS   ");
  assert.deepEqual(parsed, {
    command: "status",
    args: [],
    argsText: "",
    raw: "/STATUS",
  });
});

test("CLI commands: parseInterviewCommand extrai argumentos", () => {
  const parsed = parseInterviewCommand("/save checkpoint rapido");
  assert.deepEqual(parsed, {
    command: "save",
    args: ["checkpoint", "rapido"],
    argsText: "checkpoint rapido",
    raw: "/save checkpoint rapido",
  });
});

test("CLI commands: parseInterviewCommand ignora input nao-slash e desconhecido", () => {
  assert.equal(parseInterviewCommand("resposta normal"), null);
  assert.equal(parseInterviewCommand("/skip"), null);
});

test("CLI commands: parseSlashInput informa comando desconhecido", () => {
  const parsed = parseSlashInput("/skip agora");
  assert.deepEqual(parsed, {
    raw: "/skip agora",
    command: "skip",
    args: ["agora"],
    argsText: "agora",
    known: false,
  });
});

test("CLI commands: lista comandos esperados e help coerente", () => {
  assert.deepEqual(INTERVIEW_COMMANDS, ["help", "status", "save", "new", "pause", "menu"]);
  const help = buildInterviewCommandsHelp();
  for (const command of INTERVIEW_COMMANDS) {
    assert.equal(help.includes(`/${command}`), true);
  }
});
