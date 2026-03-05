const test = require("node:test");
const assert = require("node:assert/strict");
const { shouldUseInteractiveShell, runInteractiveShell } = require("../src/cli/tui-shell");

function createArgs(entries = []) {
  return new Map(entries);
}

function createSequentialSelectFactory(responses) {
  let cursor = 0;
  return () => ({
    async run() {
      const value = responses[cursor];
      cursor += 1;
      if (value instanceof Error) {
        throw value;
      }
      return value;
    },
  });
}

test("tui-shell: shouldUseInteractiveShell habilita quando TTY sem flags operacionais", () => {
  const args = createArgs();
  const active = shouldUseInteractiveShell({
    args,
    stdin: { isTTY: true },
    stdout: { isTTY: true },
  });
  assert.equal(active, true);
});

test("tui-shell: shouldUseInteractiveShell desabilita com --export ou sem TTY", () => {
  const withExport = shouldUseInteractiveShell({
    args: createArgs([["--export", true]]),
    stdin: { isTTY: true },
    stdout: { isTTY: true },
  });
  const withoutTty = shouldUseInteractiveShell({
    args: createArgs(),
    stdin: { isTTY: false },
    stdout: { isTTY: false },
  });
  assert.equal(withExport, false);
  assert.equal(withoutTty, false);
});

test("tui-shell: generate-document retorna preset com formatos selecionados", async () => {
  const result = await runInteractiveShell({
    profileId: "tui-shell-a1",
    baseDir: "C:/tmp/mindclone",
    stdin: { isTTY: true },
    stdout: { isTTY: true, columns: 120, rows: 30 },
    selectFactory: createSequentialSelectFactory(["generate-document", "context-pack"]),
  });

  assert.equal(result.action, "generate-document");
  assert.equal(result.exportPreset, "context-pack");
  assert.deepEqual(result.exportFormats, ["context-pack"]);
});

test("tui-shell: preset voltar retorna ao home e permite escolher outra acao", async () => {
  const result = await runInteractiveShell({
    profileId: "tui-shell-b1",
    baseDir: "C:/tmp/mindclone",
    stdin: { isTTY: true },
    stdout: { isTTY: true, columns: 120, rows: 30 },
    selectFactory: createSequentialSelectFactory(["generate-document", "back", "diagnostics"]),
  });

  assert.equal(result.action, "diagnostics");
});
