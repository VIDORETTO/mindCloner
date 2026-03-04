const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { runSession } = require("../src");
const { SessionManager } = require("../src/storage/session-manager");

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

test("Fase 10 E2E: integra contradicoes, fecha lacunas e finaliza synthesis", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-test-"));
  const profileId = "maria-lima-v10k1";
  const sessionManager = new SessionManager(tmpRoot);

  const loaded = await sessionManager.loadOrCreate(profileId);
  loaded.state.current_phase = 10;
  loaded.state.current_phase_progress = 0;
  loaded.state.overall_progress = 90;
  loaded.state.phases_status.phase_09 = { status: "completed", score: 100 };
  loaded.state.phases_status.phase_10 = { status: "in_progress", score: 0 };
  loaded.profile.meta.last_phase = "phase_10";
  loaded.profile.meta.phases_completed = [
    "phase_01",
    "phase_02",
    "phase_03",
    "phase_04",
    "phase_05",
    "phase_06",
    "phase_07",
    "phase_08",
    "phase_09",
  ];
  loaded.profile.identity.preferred_name = "Maria";
  loaded.profile.professional.current_role = "Head de Produto";
  loaded.profile.personality.summary = "Analitica, empatica e orientada a impacto.";
  loaded.profile.interests_and_preferences.travel.style = "espontanea";
  loaded.profile.personality.big_five.conscientiousness.score = 9;
  const contradictions = [
    {
      contradiction: "Alta conscienciosidade vs preferencia por espontaneidade em viagens.",
      explanation: "",
      fields: [
        "interests_and_preferences.travel.style",
        "personality.big_five.conscientiousness.score",
      ],
      phase_detected: 5,
      resolved: false,
      created_at: new Date().toISOString(),
    },
  ];
  await sessionManager.saveAll(profileId, {
    state: loaded.state,
    profile: loaded.profile,
    tracker: loaded.tracker,
    contradictions,
  });

  const io = createScriptedIO([
    "No trabalho sou super estruturada; em lazer uso espontaneidade para descansar da pressao.",
    "Tenho uma presenca acolhedora e postura calma.",
    "Delegar mais cedo, reduzir autocobranca, pausar antes de decidir sob pressao.",
    "Sou estrategica, humana e movida por impacto real nas pessoas.",
    "Estrategica, sensivel, persistente",
    "Equilibrio entre clareza analitica e cuidado humano.",
    "estrategista, cuidadora",
    "Celebro com pessoas proximas e ja conecto com proximo passo.",
    "Primeiro silencio e organizo fatos antes de reagir.",
    "Priorizo, comunico riscos e assumo coordenacao com calma.",
    "Com tempo de qualidade e pequenos rituais com quem importa.",
    "Escuto sem interromper, valido emocao e proponho apoio pratico.",
    "Coleto dados, testo cenarios e confirmo com meus valores centrais.",
    "Fale com clareza, senso pratico e empatia; evite exageros e respeite contexto.",
  ]);

  const result = await runSession({ profileId, baseDir: tmpRoot, io });

  assert.equal(result.phaseTransitioned, true);
  assert.equal(result.state.current_phase, 10);
  assert.equal(result.state.current_phase_progress, 100);
  assert.equal(result.state.overall_progress, 100);
  assert.equal(result.state.phases_status.phase_10.status, "completed");
  assert.match(result.summary, /Essencia:/);

  assert.ok(
    io.outputs.some((line) =>
      line.includes("Alta conscienciosidade vs preferencia por espontaneidade em viagens")
    ),
    "A Fase 10 deve explorar contradicoes conhecidas"
  );

  const profileDir = path.join(tmpRoot, "profiles", profileId);
  const profileRaw = JSON.parse(
    await fs.readFile(path.join(profileDir, "partial-profile.json"), "utf8")
  );
  assert.equal(
    profileRaw.identity.physical_self.self_description,
    "Tenho uma presenca acolhedora e postura calma."
  );
  assert.equal(
    profileRaw.synthesis.key_contradictions[0].contradiction,
    "Alta conscienciosidade vs preferencia por espontaneidade em viagens."
  );
  assert.equal(profileRaw.synthesis.in_three_words.length, 3);
  assert.equal(
    profileRaw.synthesis.prediction_patterns.how_they_would_handle_a_crisis,
    "Priorizo, comunico riscos e assumo coordenacao com calma."
  );
  assert.equal(
    profileRaw.meta.data_lineage["synthesis.prediction_patterns.how_they_would_handle_a_crisis"]
      .source_type,
    "inferencia"
  );
  assert.equal(
    profileRaw.meta.data_lineage["synthesis.prediction_patterns.how_they_would_handle_a_crisis"]
      .confirmed,
    false
  );
  assert.equal(profileRaw.meta.confidence_by_block.synthesis > 0, true);
  assert.equal(
    profileRaw.synthesis.rag_instruction,
    "Fale com clareza, senso pratico e empatia; evite exageros e respeite contexto."
  );
  assert.equal(profileRaw.meta.last_phase, "phase_10");
});
