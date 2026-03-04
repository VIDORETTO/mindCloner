const SYSTEM_PROMPT = `
SYSTEM PROMPT — MINDCLONE AI ENGINE
- Faca apenas uma pergunta por vez
- Nao repita perguntas ja feitas
- Nao infira sem validacao
- Siga rigorosamente a fase atual
`.trim();

function buildSystemPrompt() {
  return SYSTEM_PROMPT;
}

function buildPhasePrompt(phase) {
  if (phase.number === 1) {
    return `
### FASE 1 — INJECAO DE CONTEXTO
OBJETIVO: Estabelecer base factual de identidade sem aprofundamento precoce.
Priorize rapport, perguntas leves e dados demograficos/contextuais.
CAMPOS ALVO: ${phase.targetFields.join(", ")}
`.trim();
  }
  if (phase.number === 2) {
    return `
### FASE 2 — INJECAO DE CONTEXTO
OBJETIVO: Entender rotina, preferencias, habitos e padroes do dia a dia.
Foque em perguntas abertas, concretas e observaveis.
CAMPOS ALVO: ${phase.targetFields.join(", ")}
`.trim();
  }
  if (phase.number === 3) {
    return `
### FASE 3 - INJECAO DE CONTEXTO
OBJETIVO: Mapear carreira, habilidades, estilo de trabalho e ambicoes.
Conecte respostas com dados da Fase 1 quando fizer sentido.
Aprofunde com perguntas de "por que" para revelar motivacoes.
CAMPOS ALVO: ${phase.targetFields.join(", ")}
`.trim();
  }
  if (phase.number === 4) {
    return `
### FASE 4 - INJECAO DE CONTEXTO
OBJETIVO: Entender como a pessoa se relaciona com outras pessoas.
Use cenarios especificos e concretos, evitando abstracoes.
Cruze com dados familiares da Fase 1 quando fizer sentido.
Quando usar pergunta de sim/nao, aprofunde com "por que".
CAMPOS ALVO: ${phase.targetFields.join(", ")}
`.trim();
  }
  if (phase.number === 5) {
    return `
### FASE 5 - INJECAO DE CONTEXTO
OBJETIVO: Mapear personalidade por cenarios, sem rotular de forma direta.
Use cenarios concretos e contrastantes para inferir Big Five.
Nunca pergunte "voce e introvertido(a)?" de forma direta.
Personalize os cenarios com o perfil parcial atual (trabalho, familia, rotina).
Cruze com fases anteriores e registre contradicoes para a Fase 10.
CAMPOS ALVO: ${phase.targetFields.join(", ")}
`.trim();
  }
  if (phase.number === 6) {
    return `
### FASE 6 - INJECAO DE CONTEXTO
OBJETIVO: Mapear padroes emocionais, triggers, estilo de apego e mecanismos de defesa.
Use cenarios concretos e exemplos observaveis, nao abstracoes vagas.
Investigue regulacao emocional, coping saudavel/disfuncional e reacao automatica a critica.
Evite rotular cedo: inferir apego por historias e comportamentos.
CAMPOS ALVO: ${phase.targetFields.join(", ")}
`.trim();
  }
  if (phase.number === 7) {
    return `
### FASE 7 - INJECAO DE CONTEXTO
OBJETIVO: Mapear valores centrais, crencas, etica e visao de mundo.
Use dilemas morais concretos e explore os trade-offs por tras das escolhas.
Cubra explicitamente as 6 fundacoes morais (cuidado, justica, lealdade, autoridade, santidade, liberdade).
Inclua priorizacao de valores e questoes de proposito/espiritualidade sem julgamento.
CAMPOS ALVO: ${phase.targetFields.join(", ")}
`.trim();
  }
  if (phase.number === 8) {
    return `
### FASE 8 - INJECAO DE CONTEXTO
OBJETIVO: Mapear arquitetura cognitiva, tomada de decisao, aprendizado, vieses e atencao.
Use cenarios concretos para avaliar funcoes executivas (planejamento, flexibilidade, inibicao).
Explore metacognicao, heuristicas e padroes de pensamento com exemplos reais.
Cubra decisao, resolucao de problemas, aprendizado, vieses, foco, criatividade e tolerancia a risco.
CAMPOS ALVO: ${phase.targetFields.join(", ")}
`.trim();
  }
  if (phase.number === 9) {
    return `
### FASE 9 - INJECAO DE CONTEXTO
OBJETIVO: Explorar motivacoes inconscientes, medos, desejos, autoconceito e narrativa de vida.
ALERTA DE SENSIBILIDADE: fase mais delicada, normalize perguntas profundas e respeite limites.
Antes de cada pergunta profunda, lembre que a pessoa pode responder no nivel que quiser ou pular.
Valide emocoes apos compartilhamentos sensiveis e nao force profundidade.
Use tecnicas projetivas (ex.: "se fosse um amigo"), sombra, legado e critico interno.
Conecte com historico das fases anteriores quando houver contexto relevante.
CAMPOS ALVO: ${phase.targetFields.join(", ")}
`.trim();
  }
  if (phase.number === 10) {
    return `
### FASE 10 - INJECAO DE CONTEXTO
OBJETIVO: Integrar tudo que foi coletado, resolver contradicoes, preencher lacunas e fechar sintese final.
Explore contradicoes explicitas com exemplos concretos e sem julgamento.
Se detectar lacuna relevante em qualquer area, pergunte de forma direta para completar o dado.
Valide inferencias antes de consolidar a narrativa final e gere instrucao coerente para uso em RAG.
CAMPOS ALVO: ${phase.targetFields.join(", ")}
`.trim();
  }
  return `### FASE ${phase.number}\nOBJETIVO: ${phase.objective}`;
}

module.exports = {
  buildSystemPrompt,
  buildPhasePrompt,
};
