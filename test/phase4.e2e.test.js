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

test("Fase 4 E2E: executa dinamica social e transiciona para fase 5", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-test-"));
  const profileId = "lucas-rocha-v4k2";

  const phase1Io = createScriptedIO([
    "Lucas Rocha",
    "Lucas",
    "31",
    "Sao Paulo",
    "Brasil",
    "Campinas",
    "Casado",
    "Helena",
    "Marina",
    "Portugues, Ingles",
    "Brasileiro",
  ]);

  const phase1Result = await runSession({
    profileId,
    baseDir: tmpRoot,
    io: phase1Io,
  });
  assert.equal(phase1Result.state.current_phase, 2);

  const phase2Io = createScriptedIO([
    "Acordo cedo e treino.",
    "Trabalho em blocos com pausas.",
    "Leio e pedalo no fim da tarde.",
    "Janto com a familia e desconecto.",
    "Estavel na semana.",
    "Leio toda semana.",
    "Assisto filmes no fim de semana.",
    "Uso musica para foco.",
    "Relacao equilibrada.",
    "Gosto de cozinhar aos domingos.",
    "Viagens com natureza.",
    "Uma ou duas vezes por ano.",
    "Descansar e estar com quem gosto.",
    "Tecnologia e central no meu dia.",
    "Adoto quando vejo utilidade.",
  ]);

  const phase2Result = await runSession({
    profileId,
    baseDir: tmpRoot,
    io: phase2Io,
  });
  assert.equal(phase2Result.state.current_phase, 3);

  const phase3Io = createScriptedIO([
    "Sou lider de engenharia.",
    "Tecnologia B2B.",
    "Dev, tech lead e hoje lider.",
    "Arquitetura, lideranca tecnica, estrategia de produto.",
    "Node.js, arquitetura, observabilidade.",
    "Comunicacao, mentoria, negociacao.",
    "Equipe, para resolver problemas complexos.",
    "Ambiente com autonomia e confianca.",
    "8",
    "Combinar execucao com impacto no time.",
    "Transparencia, aprendizado, responsabilidade.",
    "Consolidar lideranca e ampliar escopo.",
    "Liderar uma organizacao de engenharia forte.",
    "Dinheiro como liberdade e seguranca.",
    "8",
    "Profissionais, com apoio pessoal para sustentar energia.",
    "Diretoria de engenharia.",
  ]);

  const phase3Result = await runSession({
    profileId,
    baseDir: tmpRoot,
    io: phase3Io,
  });
  assert.equal(phase3Result.state.current_phase, 4);

  const phase4Io = createScriptedIO([
    "Depois de eventos grandes eu fico drenado, mas satisfeito.",
    "4",
    "Fico um tempo sozinho e caminho.",
    "Dois encontros por semana em media.",
    "Chamo para conversar em particular e explico o impacto.",
    "7",
    "8",
    "Primeiro escuto, depois proponho alinhamento objetivo.",
    "Fico mais silencioso antes de falar.",
    "Levo alguns meses para confiar totalmente.",
    "Coerencia, respeito, constancia.",
    "6",
    "Calmo, analitico e confiavel.",
    "Proximo, justo e claro.",
    "Sim, mas com desconforto quando e com familia; explico o motivo.",
    "Pedidos urgentes fora de horario, favores recorrentes, interrupcoes.",
    "No casamento busco dialogo e acordos; em tensao tento evitar reatividade.",
  ]);

  const phase4Result = await runSession({
    profileId,
    baseDir: tmpRoot,
    io: phase4Io,
  });

  assert.ok(
    phase4Io.outputs.some((line) => line.includes("dinamica familiar atual (Casado)")),
    "A Fase 4 deve cruzar com dados familiares da Fase 1 na pergunta de padrao relacional"
  );
  assert.equal(phase4Result.phaseTransitioned, true);
  assert.equal(phase4Result.state.current_phase, 5);
  assert.equal(phase4Result.state.phases_status.phase_04.status, "completed");
  assert.match(phase4Result.summary, /Energia social:/);

  const profileDir = path.join(tmpRoot, "profiles", profileId);
  const profileRaw = JSON.parse(
    await fs.readFile(path.join(profileDir, "partial-profile.json"), "utf8")
  );
  assert.equal(profileRaw.social_dynamics.social_energy.introversion_extraversion_spectrum, 4);
  assert.equal(profileRaw.social_dynamics.communication_style.assertiveness_level, 7);
  assert.equal(profileRaw.social_dynamics.boundaries.setting_ability, 8);
  assert.deepEqual(profileRaw.social_dynamics.trust_patterns.trust_criteria, [
    "Coerencia",
    "respeito",
    "constancia.",
  ]);
  assert.equal(profileRaw.meta.last_phase, "phase_05");
});
