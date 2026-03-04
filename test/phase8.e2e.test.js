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

test("Fase 8 E2E: executa arquitetura cognitiva e transiciona para fase 9", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-test-"));
  const profileId = "clara-mendes-v8k1";

  const phase1Io = createScriptedIO([
    "Clara Mendes",
    "Clara",
    "34",
    "Sao Paulo",
    "Brasil",
    "Recife",
    "Casada",
    "Bia, Davi",
    "Marcos",
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
  assert.equal(phase5Result.state.current_phase, 6);

  const phase6Io = createScriptedIO([
    "Calma e focada, com oscilacoes leves.",
    "Mais constante, mas muda em periodos de alta demanda.",
    "7",
    "Oscila no inicio, depois estabiliza com rotina.",
    "8",
    "7",
    "Eu acolho e tento ajudar, 8.",
    "7",
    "Com meu marido me sinto segura quando ha dialogo e previsibilidade.",
    "Na relacao casada, tento conversar rapido para reduzir distancia.",
    "Demoro um pouco para confiar, mas sou presente.",
    "Com lideranca eu sinto tensao inicial e depois organizo meus argumentos.",
    "Coerencia, escuta ativa e constancia.",
    "Injustica e promessas quebradas me irritam muito.",
    "Respirar, caminhar, escrever, conversar.",
    "Evito conversa dificil, rumino, trabalho em excesso.",
    "Racionalizo e uso humor para baixar a tensao.",
    "Fico mais controladora e detalhista.",
    "Tento conciliar primeiro e confronto depois com dados.",
    "Aumento cautela e postego decisoes irreversiveis.",
    "Seguranca, respeito, previsibilidade, reciprocidade.",
    "Sou seletiva: expresso mais com pessoas de confianca.",
  ]);
  const phase6Result = await runSession({ profileId, baseDir: tmpRoot, io: phase6Io });
  assert.equal(phase6Result.state.current_phase, 7);

  const phase7Io = createScriptedIO([
    "Integridade, responsabilidade, respeito",
    "Integridade, responsabilidade, respeito, liberdade",
    "Acredito em progresso com empatia e responsabilidade coletiva.",
    "7",
    "6",
    "7",
    "8, priorizo reduzir sofrimento concreto.",
    "9, devolveria a carteira com tudo.",
    "6, apoio o amigo mas nao encubro dano grave.",
    "4, questiono com respeito quando a ordem e injusta.",
    "7, tenho limites morais claros em alguns temas.",
    "8, liberdade individual e central para dignidade.",
    "Mentiria apenas para proteger vida imediata, nao para ganho proprio.",
    "Equilibrio entre mercado e regulacao.",
    "Progressista em direitos, pragmatica na implementacao.",
    "Valorizo liberdade com responsabilidade e protecao de vulneraveis.",
    "Tenho espiritualidade sem religiao institucional.",
    "Meditacao diaria e silencio semanal.",
    "6",
    "Estoicismo, humanismo secular",
    "Honestidade, respeito, nao humilhar ninguem",
    "Pequenas vaidades no trabalho, politicas de aparencia",
  ]);
  const phase7Result = await runSession({ profileId, baseDir: tmpRoot, io: phase7Io });
  assert.equal(phase7Result.state.current_phase, 8);

  const phase8Io = createScriptedIO([
    "Eu comparo impacto de longo prazo, risco e alinhamento com valores.",
    "Impacto, risco, tempo, alinhamento com estrategia",
    "nao",
    "8",
    "Arrependo quando adio decisoes por excesso de cautela.",
    "Quebro em partes, testo hipoteses e reviso com dados.",
    "9",
    "Depois de duas tentativas sem progresso, busco outra perspectiva.",
    "Mapa mental, checklist, prototipo rapido",
    "Aprendo melhor fazendo e ensinando.",
    "Projeto pratico, leitura guiada, discussao",
    "Revisao espaçada e conexao com casos reais.",
    "Curiosidade e aplicacao imediata no trabalho.",
    "Confirmacao|media|analises de roadmap; aversao a perda|alta|decisoes financeiras",
    "90 minutos com pausas curtas.",
    "Notificacoes, reunioes longas, mudanca de contexto",
    "Objetivo claro, silencio, desafio adequado",
    "Meu dialogo interno testa premissas e alternativas.",
    "6",
    "8",
    "Coleto referencias, combino ideias e testo rapido.",
    "6",
    "7",
    "8",
  ]);
  const phase8Result = await runSession({ profileId, baseDir: tmpRoot, io: phase8Io });

  assert.ok(
    phase8Io.outputs.some((line) => line.includes("2 empregos")),
    "A Fase 8 deve usar cenario de decisao concreta"
  );
  assert.equal(phase8Result.phaseTransitioned, true);
  assert.equal(phase8Result.state.current_phase, 9);
  assert.equal(phase8Result.state.phases_status.phase_08.status, "completed");
  assert.match(phase8Result.summary, /Decisao:/);

  const profileDir = path.join(tmpRoot, "profiles", profileId);
  const profileRaw = JSON.parse(
    await fs.readFile(path.join(profileDir, "partial-profile.json"), "utf8")
  );
  assert.equal(profileRaw.cognitive_patterns.decision_making.gut_vs_data, 8);
  assert.equal(profileRaw.cognitive_patterns.problem_solving.persistence_level, 9);
  assert.equal(profileRaw.cognitive_patterns.risk_tolerance.professional, 8);
  assert.equal(profileRaw.cognitive_patterns.creativity.level, 8);
  assert.equal(profileRaw.cognitive_patterns.cognitive_biases_prone[0].bias, "Confirmacao");
  assert.equal(profileRaw.meta.last_phase, "phase_09");
});
