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

test("Fase 5 E2E: executa mapeamento de personalidade e transiciona para fase 6", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-test-"));
  const profileId = "bruna-alves-p5r8";

  const phase1Io = createScriptedIO([
    "Bruna Alves",
    "Bru",
    "33",
    "Sao Paulo",
    "Brasil",
    "Santos",
    "Casada",
    "Pedro",
    "Ana",
    "Portugues, Ingles",
    "Brasileira",
  ]);
  const phase1Result = await runSession({ profileId, baseDir: tmpRoot, io: phase1Io });
  assert.equal(phase1Result.state.current_phase, 2);

  const phase2Io = createScriptedIO([
    "Acordo cedo, treino e reviso prioridades.",
    "Trabalho em blocos com pausas curtas.",
    "Leio e pedalo no fim da tarde.",
    "Janto com a familia e durmo cedo.",
    "Bem estavel durante a semana.",
    "Leio toda semana.",
    "Assisto filmes no fim de semana.",
    "Musica para foco.",
    "Relacao equilibrada.",
    "Gosto de cozinhar aos domingos.",
    "Viagens espontaneas, sem roteiro fechado.",
    "Duas vezes por ano.",
    "Descansar e explorar lugares novos.",
    "Tecnologia e parte central do meu dia.",
    "Adoto rapido quando vejo utilidade.",
  ]);
  const phase2Result = await runSession({ profileId, baseDir: tmpRoot, io: phase2Io });
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
  const phase3Result = await runSession({ profileId, baseDir: tmpRoot, io: phase3Io });
  assert.equal(phase3Result.state.current_phase, 4);

  const phase4Io = createScriptedIO([
    "Depois de eventos grandes eu fico drenada, mas satisfeita.",
    "4",
    "Fico um tempo sozinha e caminho.",
    "Dois encontros por semana em media.",
    "Conversa em particular e explico o impacto.",
    "7",
    "8",
    "Primeiro escuto, depois proponho alinhamento objetivo.",
    "Fico mais silenciosa antes de falar.",
    "Levo alguns meses para confiar totalmente.",
    "Coerencia, respeito, constancia.",
    "6",
    "Calma, analitica e confiavel.",
    "Proxima, justa e clara.",
    "Sim, mas com desconforto quando e com familia; explico o motivo.",
    "Pedidos urgentes fora de horario, favores recorrentes.",
    "No casamento busco dialogo e acordos; em tensao tento evitar reatividade.",
  ]);
  const phase4Result = await runSession({ profileId, baseDir: tmpRoot, io: phase4Io });
  assert.equal(phase4Result.state.current_phase, 5);

  const phase5Io = createScriptedIO([
    "Prefiro sem plano e ir descobrindo no caminho.",
    "Curiosidade, tento entender antes de julgar.",
    "Comeco no primeiro dia e monto cronograma.",
    "No meu trabalho tudo e bem organizado.",
    "Observo no inicio e depois falo.",
    "Preciso de 2 a 3 encontros por semana para manter energia.",
    "Exponho minha opiniao com cuidado e sem agressividade.",
    "Avalio contexto, tento ajudar sem me prejudicar.",
    "7, especialmente em semanas de muita pressao.",
    "Geralmente levo algumas horas para recuperar.",
    "INTJ",
    "8",
    "5",
    "4",
    "Melancolico",
    "Fleumatico",
    "3",
    "7",
    "2",
    "8",
    "Sou analitica, planejadora e curiosa; socialmente seletiva, mas colaborativa.",
  ]);
  const phase5Result = await runSession({ profileId, baseDir: tmpRoot, io: phase5Io });

  assert.ok(
    phase5Io.outputs.some((line) =>
      line.includes("contexto profissional (Sou lider de engenharia.)")
    ),
    "A Fase 5 deve personalizar cenarios com perfil parcial (contexto profissional)"
  );
  assert.equal(phase5Result.phaseTransitioned, true);
  assert.equal(phase5Result.state.current_phase, 6);
  assert.equal(phase5Result.state.phases_status.phase_05.status, "completed");
  assert.match(phase5Result.summary, /MBTI aprox: INTJ/);

  const profileDir = path.join(tmpRoot, "profiles", profileId);
  const profileRaw = JSON.parse(
    await fs.readFile(path.join(profileDir, "partial-profile.json"), "utf8")
  );
  assert.equal(profileRaw.personality.big_five.conscientiousness.score, 8);
  assert.equal(profileRaw.personality.mbti_approximation.type, "INTJ");
  assert.equal(profileRaw.personality.enneagram_approximation.core_type, 5);
  assert.equal(profileRaw.personality.cognitive_style.detail_vs_big_picture, 7);
  assert.equal(profileRaw.meta.last_phase, "phase_06");

  const contradictionsRaw = JSON.parse(
    await fs.readFile(path.join(profileDir, "contradictions.json"), "utf8")
  );
  assert.ok(Array.isArray(contradictionsRaw));
  assert.ok(
    contradictionsRaw.some((entry) =>
      String(entry?.contradiction || "").includes("conscienciosidade")
    ),
    "A Fase 5 deve registrar contradicao para investigacao futura na Fase 10"
  );
});
