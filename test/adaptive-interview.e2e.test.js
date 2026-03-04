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
      outputs.push(String(message));
    },
    async ask() {
      const value = answers[index];
      index += 1;
      return value ?? "";
    },
  };
}

function mockResponse(content) {
  return {
    ok: true,
    status: 200,
    async json() {
      return {
        choices: [{ message: { content } }],
      };
    },
  };
}

test("Adaptive E2E: atravessa transicao de fase na mesma sessao", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-adaptive-transition-"));
  const io = createScriptedIO([
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
    "Nao tenho filhos.",
    "Acordo cedo e treino.",
  ]);

  const result = await runSession({
    profileId: "adaptive-transition-a1",
    baseDir: tmpRoot,
    io,
    interviewMode: "adaptive",
    maxQuestions: 13,
  });

  assert.equal(result.phaseTransitioned, true);
  assert.equal(result.state.current_phase, 2);
  assert.equal(result.state.total_questions, 13);
  assert(
    io.outputs.some((line) => line.includes("[Modo adaptativo]")),
    "Modo adaptativo deveria ser anunciado no inicio da sessao"
  );
  assert(
    io.outputs.some((line) => line.includes("Estilo de Vida e Preferencias")),
    "Sessao adaptativa deveria alcancar a fase 2 na mesma execucao"
  );
});

test("Adaptive E2E: valida pergunta da IA e regenera quando ambigua", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-adaptive-regen-"));
  const io = createScriptedIO(["Joao Pedro da Silva"]);
  let fetchCalls = 0;
  const originalFetch = global.fetch;
  global.fetch = async () => {
    fetchCalls += 1;
    if (fetchCalls === 1) {
      return mockResponse('{"question":"Pode falar mais sobre isso?"}');
    }
    return mockResponse('{"question":"Qual e o seu nome completo?"}');
  };

  try {
    const result = await runSession({
      profileId: "adaptive-regen-a1",
      baseDir: tmpRoot,
      io,
      interviewMode: "adaptive",
      maxQuestions: 1,
      aiProvider: "openai",
      aiApiKey: "test-key",
    });

    assert.equal(result.abortedBySafety, false);
    assert.equal(fetchCalls, 2);
    assert(
      io.outputs.some((line) => line.includes("Qual e o seu nome completo?")),
      "Pergunta regenerada valida deveria ser exibida no modo adaptativo"
    );
    assert(
      !io.outputs.some((line) => line.includes("Pode falar mais sobre isso?")),
      "Pergunta invalida nao pode chegar ao usuario no modo adaptativo"
    );
  } finally {
    global.fetch = originalFetch;
  }
});
