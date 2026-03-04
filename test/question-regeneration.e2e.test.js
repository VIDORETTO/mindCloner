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

test("Regeneracao E2E: invalida pergunta ambigua da IA e regenera antes de exibir", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-regeneration-"));
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
      profileId: "regen-a1",
      baseDir: tmpRoot,
      io,
      maxQuestions: 1,
      aiProvider: "openai",
      aiApiKey: "test-key",
    });

    assert.equal(result.abortedBySafety, false);
    assert.equal(fetchCalls, 2);
    assert(
      io.outputs.some((line) => line.includes("Qual e o seu nome completo?")),
      "Pergunta regenerada valida deveria ser exibida"
    );
    assert(
      !io.outputs.some((line) => line.includes("Pode falar mais sobre isso?")),
      "Pergunta invalida nao pode chegar ao usuario"
    );
  } finally {
    global.fetch = originalFetch;
  }
});
