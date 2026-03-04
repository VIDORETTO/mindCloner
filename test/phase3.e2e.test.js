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

test("Fase 3 E2E: executa perfil profissional e transiciona para fase 4", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-test-"));
  const profileId = "ana-souza-z7x6";

  const phase1Io = createScriptedIO([
    "Ana Souza",
    "Ana",
    "34",
    "Florianopolis",
    "Brasil",
    "Porto Alegre",
    "Casada",
    "nenhum",
    "Carlos",
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
    "Acordo cedo, treino e organizo prioridades.",
    "Faco blocos de trabalho com pausas curtas.",
    "Leio ficcao e corro no fim do dia.",
    "Janto com calma e desligo telas cedo.",
    "Mais estavel durante a semana.",
    "Leio toda semana.",
    "Assisto series alguns dias por semana.",
    "Uso musica para foco.",
    "Relacao equilibrada com comida.",
    "Gosto de cozinhar aos domingos.",
    "Viagens com natureza e boa gastronomia.",
    "Duas viagens por ano.",
    "Descansar e conhecer culturas locais.",
    "Tecnologia e parte central do meu dia.",
    "Adoto cedo quando vejo valor claro.",
  ]);

  const phase2Result = await runSession({
    profileId,
    baseDir: tmpRoot,
    io: phase2Io,
  });
  assert.equal(phase2Result.state.current_phase, 3);

  const phase3Io = createScriptedIO([
    "Sou gerente de produto digital.",
    "Tecnologia para educacao.",
    "Analista, lider de squad, gerente de produto.",
    "Produtos educacionais, estrategia digital, discovery.",
    "Analise de dados, definicao de roadmap, escrita de requisitos.",
    "Comunicacao, facilitacao, negociacao.",
    "Equipe, porque produtos melhores nascem de colaboracao.",
    "Ambiente com autonomia e clareza de objetivos.",
    "8",
    "Capacidade de transformar problema em acao.",
    "Aprendizado continuo, impacto, etica.",
    "Consolidar lideranca de produto, evoluir influencia executiva.",
    "Liderar uma area que aumente acesso a educacao de qualidade.",
    "Dinheiro representa liberdade e seguranca para escolher projetos.",
    "8",
    "Profissionais, porque impacto e aprendizado me movem; pessoais sustentam o ritmo.",
    "Diretoria de produto com foco em educacao acessivel.",
  ]);

  const phase3Result = await runSession({
    profileId,
    baseDir: tmpRoot,
    io: phase3Io,
  });

  assert.ok(
    phase3Io.outputs.some((line) =>
      line.includes("Voce mencionou que mora em Florianopolis, Brasil")
    ),
    "A Fase 3 deve conectar o contexto da Fase 1 (localizacao) na pergunta profissional"
  );
  assert.equal(phase3Result.phaseTransitioned, true);
  assert.equal(phase3Result.state.current_phase, 4);
  assert.equal(phase3Result.state.phases_status.phase_03.status, "completed");
  assert.match(phase3Result.summary, /Satisfacao: 8\/10/);

  const profileDir = path.join(tmpRoot, "profiles", profileId);
  const profileRaw = JSON.parse(
    await fs.readFile(path.join(profileDir, "partial-profile.json"), "utf8")
  );
  assert.equal(profileRaw.professional.current_role, "Sou gerente de produto digital.");
  assert.deepEqual(profileRaw.professional.professional_identity.professional_values, [
    "Aprendizado continuo",
    "impacto",
    "etica.",
  ]);
  assert.equal(profileRaw.professional.work_style.autonomy_need, 8);
  assert.equal(profileRaw.professional.career_satisfaction_level, 8);
  assert.equal(profileRaw.meta.last_phase, "phase_04");
});
