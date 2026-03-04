const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { SessionManager } = require("../src/storage/session-manager");
const { runFromCliWithDeps } = require("../src/cli/menu");

function createMemoryIO(answer = "") {
  const outputs = [];
  return {
    outputs,
    async say(message) {
      outputs.push(String(message));
    },
    async ask() {
      return answer;
    },
    async close() {},
  };
}

test("CLI --journal: registra entrada com tags", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-journal-"));
  const profileId = "journal-user-a1";
  const io = createMemoryIO();

  await runFromCliWithDeps(
    [
      "node",
      "bin/mindclone.js",
      "--baseDir",
      tmpRoot,
      "--profile",
      profileId,
      "--journal",
      "Hoje avancei no projeto",
      "--journal-tags",
      "foco,energia",
    ],
    {
      ioFactory: () => io,
    }
  );

  const journalPath = path.join(tmpRoot, "profiles", profileId, "journal.json");
  const journal = JSON.parse(await fs.readFile(journalPath, "utf8"));
  assert.equal(journal.length, 1);
  assert.equal(journal[0].text, "Hoje avancei no projeto");
  assert.deepEqual(journal[0].tags, ["foco", "energia"]);
  assert(io.outputs.some((line) => line.includes("Entrada registrada no diario")));
});

test("CLI --mirror: mostra resumo reflexivo do perfil", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-mirror-"));
  const profileId = "mirror-user-a1";
  const manager = new SessionManager(tmpRoot);
  const loaded = await manager.loadOrCreate(profileId);
  loaded.profile.identity.preferred_name = "Marina";
  loaded.profile.synthesis.core_essence_paragraph = "Pragmatica e criativa.";
  loaded.profile.values_and_beliefs.hierarchy_of_values = ["autonomia", "familia", "crescimento"];
  loaded.state.current_phase = 8;
  await manager.saveAll(profileId, loaded);
  await manager.store.writeJson(
    path.join(tmpRoot, "profiles", profileId, "journal.json"),
    [{ id: "journal-1", at: "2026-03-04T00:00:00.000Z", text: "Dia produtivo", tags: [] }],
    { sensitive: true }
  );

  const io = createMemoryIO();
  await runFromCliWithDeps(
    ["node", "bin/mindclone.js", "--baseDir", tmpRoot, "--profile", profileId, "--mirror"],
    {
      ioFactory: () => io,
    }
  );

  assert(io.outputs.some((line) => line.includes("Espelho de perfil: Marina")));
  assert(io.outputs.some((line) => line.includes("Pergunta de reflexao sugerida")));
});

test("CLI --import: faz merge de arquivo externo no perfil", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-import-"));
  const profileId = "import-user-a1";
  const manager = new SessionManager(tmpRoot);
  await manager.loadOrCreate(profileId);

  const importPath = path.join(tmpRoot, "incoming-profile.json");
  await fs.writeFile(
    importPath,
    JSON.stringify(
      {
        identity: {
          preferred_name: "Ana",
        },
        synthesis: {
          core_essence_paragraph: "Objetiva e humana.",
        },
      },
      null,
      2
    ),
    "utf8"
  );

  const io = createMemoryIO();
  await runFromCliWithDeps(
    [
      "node",
      "bin/mindclone.js",
      "--baseDir",
      tmpRoot,
      "--profile",
      profileId,
      "--import",
      importPath,
    ],
    {
      ioFactory: () => io,
    }
  );

  const updated = await manager.loadExisting(profileId);
  assert.equal(updated.profile.identity.preferred_name, "Ana");
  assert.equal(updated.profile.synthesis.core_essence_paragraph, "Objetiva e humana.");
  assert(io.outputs.some((line) => line.includes("Importacao concluida")));
});

test("CLI --compare: compara dois perfis existentes", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-compare-"));
  const manager = new SessionManager(tmpRoot);
  const left = await manager.loadOrCreate("compare-a1");
  left.profile.meta.completeness_score = 80;
  left.profile.values_and_beliefs.hierarchy_of_values = ["autonomia", "impacto"];
  await manager.saveAll("compare-a1", left);

  const right = await manager.loadOrCreate("compare-b1");
  right.profile.meta.completeness_score = 50;
  right.profile.values_and_beliefs.hierarchy_of_values = ["autonomia", "estabilidade"];
  await manager.saveAll("compare-b1", right);

  const io = createMemoryIO();
  await runFromCliWithDeps(
    ["node", "bin/mindclone.js", "--baseDir", tmpRoot, "--compare", "compare-a1,compare-b1"],
    {
      ioFactory: () => io,
    }
  );

  assert(
    io.outputs.some((line) => line.includes("Comparacao de perfis: compare-a1 vs compare-b1"))
  );
  assert(io.outputs.some((line) => line.includes("Valores em comum")));
});

test("CLI --telemetry on/off/status: controla opt-in e registra evento", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-telemetry-"));
  const profileId = "telemetry-user-a1";
  const manager = new SessionManager(tmpRoot);
  await manager.loadOrCreate(profileId);

  await runFromCliWithDeps(
    ["node", "bin/mindclone.js", "--baseDir", tmpRoot, "--telemetry", "on"],
    {
      ioFactory: () => createMemoryIO(),
    }
  );

  await runFromCliWithDeps(
    ["node", "bin/mindclone.js", "--baseDir", tmpRoot, "--profile", profileId, "--status"],
    {
      ioFactory: () => createMemoryIO(),
    }
  );

  const telemetryPath = path.join(tmpRoot, "telemetry.json");
  const telemetry = JSON.parse(await fs.readFile(telemetryPath, "utf8"));
  assert.equal(telemetry.opt_in, true);
  assert(telemetry.events.some((event) => event.name === "cli.status"));

  const io = createMemoryIO();
  await runFromCliWithDeps(
    ["node", "bin/mindclone.js", "--baseDir", tmpRoot, "--telemetry", "status"],
    {
      ioFactory: () => io,
    }
  );
  assert(io.outputs.some((line) => line.includes("Telemetria opt-in: ON")));
});

test("CLI --plugin: executa hook de evento", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-plugin-"));
  const profileId = "plugin-user-a1";
  const manager = new SessionManager(tmpRoot);
  await manager.loadOrCreate(profileId);

  const hookLogPath = path.join(tmpRoot, "plugin-events.log");
  const pluginPath = path.join(tmpRoot, "sample-plugin.js");
  await fs.writeFile(
    pluginPath,
    [
      "const fs = require('node:fs');",
      "module.exports = {",
      "  name: 'sample-plugin',",
      "  onCliEvent(eventName) {",
      `    fs.appendFileSync(${JSON.stringify(hookLogPath)}, eventName + '\\\\n', 'utf8');`,
      "  }",
      "};",
    ].join("\n"),
    "utf8"
  );

  await runFromCliWithDeps(
    [
      "node",
      "bin/mindclone.js",
      "--baseDir",
      tmpRoot,
      "--profile",
      profileId,
      "--status",
      "--plugin",
      pluginPath,
    ],
    {
      ioFactory: () => createMemoryIO(),
    }
  );

  const hookLog = await fs.readFile(hookLogPath, "utf8");
  assert.match(hookLog, /cli:start/);
  assert.match(hookLog, /cli:status/);
});
