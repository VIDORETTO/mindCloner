const { SessionManager } = require("./storage/session-manager");
const { getPhase, getMaxPhaseNumber } = require("./phases/phase-manager");
const { ContextManager } = require("./ai/context-manager");
const { AIClient } = require("./ai/client");
const { buildSystemPrompt, buildPhasePrompt } = require("./ai/prompt-builder");
const { selectNextQuestion } = require("./engine/question-engine");
const { validateQuestionCandidate } = require("./engine/question-validator");
const { selectAdaptiveQuestion } = require("./ai/adaptive-interview-engine");
const {
  applyUpdates,
  registerFieldTrace,
  compressProfileForContext,
  getEmptyFields,
  updateMetaCompleteness,
} = require("./profile/profile-builder");
const { renderProgress } = require("./cli/progress-bar");
const { DEFAULT_CONSENT_VERSION, ensureConsent } = require("./safety/consent-manager");
const {
  detectCrisisRisk,
  buildCrisisSupportMessage,
  createCrisisEvent,
} = require("./safety/crisis-protocol");
const { buildDeepeningPlan, bumpConfidence } = require("./deepening/deepening-engine");

function createQuestionId(counter) {
  return `q${String(counter).padStart(3, "0")}`;
}

function calcOverallProgress(currentPhase, currentPhaseProgress) {
  const donePhases = Math.max(0, currentPhase - 1);
  const progress = ((donePhases + currentPhaseProgress / 100) / 10) * 100;
  return Number(progress.toFixed(2));
}

function getPhaseKey(phaseNumber) {
  return `phase_${String(phaseNumber).padStart(2, "0")}`;
}

function buildRecoveryQuestion(targetField) {
  const label = String(targetField || "")
    .replace(/^deepening:/, "")
    .split(".")
    .filter(Boolean)
    .slice(-2)
    .join(" ")
    .replace(/_/g, " ");
  return `Para registrar corretamente ${label || "este campo"}, descreva com um exemplo concreto.`;
}

function buildInvalidationFeedback({ reasons, targetField }) {
  const reasonMap = {
    repetition: "nao repetir perguntas ja feitas",
    ambiguity: "evitar ambiguidade",
    low_specificity: "ser especifica e concreta",
    unmapped_target_field: "permanecer alinhada ao campo alvo do schema",
    empty: "nao pode ficar vazia",
  };
  const details = reasons
    .map((item) => reasonMap[item])
    .filter(Boolean)
    .join("; ");
  return `A ultima pergunta foi invalidada (${details || "motivo nao especificado"}). Gere outra pergunta em portugues, unica, especifica, ligada ao campo alvo "${targetField}" e responda apenas com JSON {"question":"..."}.`;
}

function normalizeContradiction(entry, phaseNumber) {
  if (!entry) {
    return null;
  }
  const now = new Date().toISOString();
  if (typeof entry === "string") {
    return {
      contradiction: entry,
      explanation: "",
      fields: [],
      phase_detected: phaseNumber,
      resolved: false,
      created_at: now,
    };
  }
  return {
    contradiction: entry.contradiction || "",
    explanation: entry.explanation || "",
    fields: Array.isArray(entry.fields) ? entry.fields : [],
    phase_detected: entry.phase_detected || phaseNumber,
    resolved: Boolean(entry.resolved),
    created_at: entry.created_at || now,
  };
}

function addContradictions(contradictions, found, phaseNumber) {
  if (!Array.isArray(found) || found.length === 0) {
    return;
  }
  const knownKeys = new Set(
    contradictions.map((item) => {
      if (typeof item === "string") {
        return item.trim().toLowerCase();
      }
      return String(item?.contradiction || "")
        .trim()
        .toLowerCase();
    })
  );

  for (const raw of found) {
    const normalized = normalizeContradiction(raw, phaseNumber);
    if (!normalized || !normalized.contradiction) {
      continue;
    }
    const key = normalized.contradiction.trim().toLowerCase();
    if (knownKeys.has(key)) {
      continue;
    }
    contradictions.push(normalized);
    knownKeys.add(key);
  }
}

function buildPhaseSummary(profile, phaseNumber, phaseProgressPct) {
  if (phaseNumber === 10) {
    const synthesis = profile.synthesis || {};
    const patterns = synthesis.prediction_patterns || {};
    return [
      `Essencia: ${synthesis.core_essence_paragraph || "-"}`,
      `3 palavras: ${synthesis.in_three_words?.join(", ") || "-"}`,
      `Combinacao unica: ${synthesis.unique_combination || "-"}`,
      `Contradicoes: ${synthesis.key_contradictions?.length || 0}`,
      `RAG: ${synthesis.rag_instruction ? "gerado" : "pendente"}`,
      `Completude: ${phaseProgressPct.toFixed(0)}%`,
    ].join(" | ");
  }

  if (phaseNumber === 9) {
    const motivations = profile.motivations_and_drives || {};
    const selfConcept = profile.self_concept || {};
    const narrative = profile.life_narrative || {};
    return [
      `Motivacao central: ${motivations.core_motivations?.[0]?.motivation || "-"}`,
      `Medo central: ${motivations.deepest_fears?.[0]?.fear || "-"}`,
      `Autoconceito: ${selfConcept.self_image || "-"}`,
      `Critico interno: ${selfConcept.inner_critic?.intensity ?? "-"}/10`,
      `Legado: ${narrative.legacy_desire || "-"}`,
      `Completude: ${phaseProgressPct.toFixed(0)}%`,
    ].join(" | ");
  }

  if (phaseNumber === 8) {
    const cognitive = profile.cognitive_patterns || {};
    const decision = cognitive.decision_making || {};
    const problem = cognitive.problem_solving || {};
    const learning = cognitive.learning || {};
    const attention = cognitive.attention_patterns || {};
    const risk = cognitive.risk_tolerance || {};
    return [
      `Decisao: ${decision.style || "-"}`,
      `Intuicao vs dados: ${decision.gut_vs_data ?? "-"}/10`,
      `Problemas (abordagem): ${problem.approach || "-"}`,
      `Aprendizado: ${learning.style || "-"}`,
      `Foco: ${attention.focus_duration || "-"}`,
      `Risco financeiro/profissional: ${risk.financial ?? "-"}/${risk.professional ?? "-"}`,
      `Completude: ${phaseProgressPct.toFixed(0)}%`,
    ].join(" | ");
  }

  if (phaseNumber === 7) {
    const values = profile.values_and_beliefs || {};
    const worldview = values.worldview || {};
    const moral = values.moral_foundations || {};
    const spirituality = values.spiritual_religious || {};
    return [
      `Valores core: ${values.hierarchy_of_values?.slice(0, 3).join(", ") || "-"}`,
      `Visao de mundo: ${worldview.summary || "-"}`,
      `Moral (cuidado/justica): ${moral.care_harm ?? "-"}/${moral.fairness_cheating ?? "-"}`,
      `Etica: ${values.ethical_framework || "-"}`,
      `Espiritualidade: ${spirituality.beliefs || "-"}`,
      `Completude: ${phaseProgressPct.toFixed(0)}%`,
    ].join(" | ");
  }

  if (phaseNumber === 6) {
    const emotional = profile.emotional_profile || {};
    const baseline = emotional.emotional_baseline || {};
    const attachment = emotional.attachment_style || {};
    const coping = emotional.coping_mechanisms || {};
    return [
      `Humor base: ${baseline.default_mood || "-"}`,
      `Estabilidade: ${baseline.emotional_stability || "-"}`,
      `Apego: ${attachment.primary || "-"}`,
      `Coping saudavel: ${coping.healthy?.join(", ") || "-"}`,
      `Defesas: ${coping.primary_defense_mechanisms?.join(", ") || "-"}`,
      `Completude: ${phaseProgressPct.toFixed(0)}%`,
    ].join(" | ");
  }

  if (phaseNumber === 5) {
    const personality = profile.personality || {};
    const bigFive = personality.big_five || {};
    const mbti = personality.mbti_approximation || {};
    const temperament = personality.temperament || {};
    return [
      `Abertura: ${bigFive.openness?.score ?? "-"}/10`,
      `Conscienciosidade: ${bigFive.conscientiousness?.score ?? "-"}/10`,
      `Extroversao: ${bigFive.extraversion?.score ?? "-"}/10`,
      `Agradabilidade: ${bigFive.agreeableness?.score ?? "-"}/10`,
      `Neuroticismo: ${bigFive.neuroticism?.score ?? "-"}/10`,
      `MBTI aprox: ${mbti.type || "-"}`,
      `Temperamento: ${temperament.primary || "-"} / ${temperament.secondary || "-"}`,
      `Completude: ${phaseProgressPct.toFixed(0)}%`,
    ].join(" | ");
  }

  if (phaseNumber === 4) {
    const social = profile.social_dynamics || {};
    const energy = social.social_energy || {};
    const communication = social.communication_style || {};
    const trust = social.trust_patterns || {};
    const boundaries = social.boundaries || {};
    return [
      `Energia social: ${energy.social_battery_capacity || "-"}`,
      `Intro/extroversao: ${energy.introversion_extraversion_spectrum ?? "-"}/10`,
      `Estilo comunicacao: ${communication.primary_style || "-"}`,
      `Assertividade: ${communication.assertiveness_level ?? "-"}/10`,
      `Confianca: ${trust.trust_speed || "-"}`,
      `Limites: ${boundaries.setting_ability ?? "-"}/10`,
      `Completude: ${phaseProgressPct.toFixed(0)}%`,
    ].join(" | ");
  }

  if (phaseNumber === 3) {
    const professional = profile.professional || {};
    const workStyle = professional.work_style || {};
    const ambitions = professional.ambitions || {};
    return [
      `Papel atual: ${professional.current_role || "-"}`,
      `Industria: ${professional.industry || "-"}`,
      `Colaboracao: ${workStyle.collaboration_preference || "-"}`,
      `Autonomia: ${workStyle.autonomy_need ?? "-"}`,
      `Meta final: ${ambitions.ultimate_professional_goal || "-"}`,
      `Satisfacao: ${professional.career_satisfaction_level ?? "-"}/10`,
      `Completude: ${phaseProgressPct.toFixed(0)}%`,
    ].join(" | ");
  }

  if (phaseNumber === 2) {
    const routine = profile.behavioral_patterns?.daily_routine || {};
    const travel = profile.interests_and_preferences?.travel || {};
    const tech = profile.interests_and_preferences?.technology || {};
    return [
      `Rotina manha: ${routine.morning || "-"}`,
      `Rotina noite: ${routine.night || "-"}`,
      `Consistencia: ${routine.consistency_level || "-"}`,
      `Viagem: ${travel.style || "-"} (${travel.frequency || "-"})`,
      `Tecnologia: ${tech.relationship || "-"}`,
      `Completude: ${phaseProgressPct.toFixed(0)}%`,
    ].join(" | ");
  }

  const identity = profile.identity;
  const languageNames = (identity.languages || []).map((item) => item.language).join(", ") || "-";
  return [
    `Nome: ${identity.full_name || "-"} (${identity.preferred_name || "-"})`,
    `Idade: ${identity.age ?? "-"}`,
    `Localizacao: ${identity.location.current_city || "-"}, ${identity.location.current_country || "-"}`,
    `Nasceu em: ${identity.location.born_in || "-"}`,
    `Familia: ${identity.family.marital_status || "-"}`,
    `Idiomas: ${languageNames}`,
    `Completude: ${phaseProgressPct.toFixed(0)}%`,
  ].join(" | ");
}

async function finalizeSession({
  sessionManager,
  profileId,
  state,
  profile,
  tracker,
  contradictions,
  sessionLog,
}) {
  profile.meta.total_sessions += 1;
  const sessionId = await sessionManager.saveSessionLog(profileId, sessionLog);
  state.last_session_id = sessionId;
  await sessionManager.saveAll(profileId, { state, profile, tracker, contradictions });
}

function updateAllPhaseCompleteness(profile) {
  const maxPhase = getMaxPhaseNumber();
  for (let phase = 1; phase <= maxPhase; phase += 1) {
    updateMetaCompleteness(profile, phase);
  }
}

async function runDeepeningSession({
  profileId,
  io,
  maxQuestions,
  enableCrisisProtocol,
  sessionManager,
  state,
  profile,
  tracker,
  contradictions,
}) {
  const phase10Done =
    state.current_phase === 10 &&
    state.current_phase_progress >= 100 &&
    state.phases_status.phase_10?.status === "completed";
  if (!phase10Done) {
    return {
      phaseTransitioned: false,
      abortedByConsent: false,
      abortedBySafety: false,
      deepeningPerformed: false,
      state,
      profile,
      summary: "Deepening disponivel apenas apos concluir a fase 10 com 100%.",
    };
  }

  const deepPlan = buildDeepeningPlan({ profile, contradictions, tracker });
  const sessionLog = [];
  let askedInSession = 0;
  const limit = Math.max(1, Math.min(maxQuestions, 10));
  await io.say("\n[Deepening] Refinando lacunas e contradicoes apos perfil base.");

  for (const item of deepPlan) {
    if (askedInSession >= limit) {
      break;
    }
    await io.say(item.question);
    const input = (await io.ask("> ")).trim();
    if (input === "/pause") {
      break;
    }
    if (input === "/skip") {
      sessionLog.push({ role: "assistant", content: item.question });
      sessionLog.push({ role: "user", content: "/skip" });
      continue;
    }
    if (input === "/status") {
      await io.say("Modo deepening ativo. Responda para refinar o perfil ou use /pause.");
      continue;
    }

    if (enableCrisisProtocol) {
      const risk = detectCrisisRisk(input);
      if (risk.detected) {
        const event = createCrisisEvent({
          phaseNumber: 10,
          questionId: item.id,
          userInput: input,
          risk,
        });
        state.safety.crisis_protocol_triggered = true;
        state.safety.last_crisis_at = event.detected_at;
        state.safety.crisis_events.push(event);
        if (state.safety.crisis_events.length > 50) {
          state.safety.crisis_events = state.safety.crisis_events.slice(-50);
        }
        profile.meta.safety.crisis_events_count += 1;
        profile.meta.safety.last_crisis_at = event.detected_at;

        const supportMessage = buildCrisisSupportMessage();
        await io.say(supportMessage);
        sessionLog.push({ role: "assistant", content: item.question });
        sessionLog.push({ role: "user", content: input });
        sessionLog.push({ role: "assistant", content: supportMessage });
        await finalizeSession({
          sessionManager,
          profileId,
          state,
          profile,
          tracker,
          contradictions,
          sessionLog,
        });
        return {
          phaseTransitioned: false,
          abortedByConsent: false,
          abortedBySafety: true,
          deepeningPerformed: false,
          state,
          profile,
          summary: "Deepening interrompido por protocolo de seguranca emocional.",
        };
      }
    }

    const context = { confidencePath: "" };
    item.apply(input, context);
    bumpConfidence(profile, context.confidencePath);
    if (context.confidencePath) {
      registerFieldTrace(profile, context.confidencePath, input, {
        sourceType: "auto_relato",
        phaseNumber: 10,
        questionId: item.id,
        questionType: "deepening",
        targetField: item.target_field,
        answer: input,
        confidenceScore: Number(profile.meta.confidence_scores?.[context.confidencePath] || 80),
      });
    }

    askedInSession += 1;
    state.total_questions += 1;
    profile.meta.total_questions_answered = state.total_questions;
    const questionRecord = {
      id: createQuestionId(state.total_questions),
      phase: "deepening",
      session: profile.meta.total_sessions + 1,
      question_text: item.question,
      target_field: item.target_field,
      response: input,
      timestamp: new Date().toISOString(),
    };
    tracker.addQuestion(questionRecord);
    state.last_question_id = questionRecord.id;

    sessionLog.push({ role: "assistant", content: item.question });
    sessionLog.push({ role: "user", content: input });
    await sessionManager.saveAll(profileId, { state, profile, tracker, contradictions });
  }

  state.deepening_sessions += 1;
  profile.meta.deepening_sessions += 1;
  updateAllPhaseCompleteness(profile);
  state.current_phase = 10;
  state.current_phase_progress = 100;
  state.overall_progress = 100;

  await finalizeSession({
    sessionManager,
    profileId,
    state,
    profile,
    tracker,
    contradictions,
    sessionLog,
  });

  return {
    phaseTransitioned: false,
    abortedByConsent: false,
    abortedBySafety: false,
    deepeningPerformed: askedInSession > 0,
    state,
    profile,
    summary: `Deepening concluido. Perguntas respondidas: ${askedInSession}. Completude atual: ${profile.meta.completeness_score}%.`,
  };
}

async function runSession({
  profileId,
  baseDir,
  io,
  maxQuestions = 25,
  requireConsent = false,
  consentVersion = DEFAULT_CONSENT_VERSION,
  consentSource = "system",
  enableCrisisProtocol = true,
  encryptionKey = process.env.MINDCLONE_ENCRYPTION_KEY || "",
  requireEncryption = false,
  deepeningMode = false,
  aiProvider = process.env.MINDCLONE_AI_PROVIDER || "local",
  aiModel = process.env.MINDCLONE_AI_MODEL || "",
  aiApiKey = process.env.MINDCLONE_AI_API_KEY || "",
  aiBaseUrl = process.env.MINDCLONE_AI_BASE_URL || "",
  aiTimeoutMs = Number(process.env.MINDCLONE_AI_TIMEOUT_MS || 15000),
  aiMaxRetries = Number(process.env.MINDCLONE_AI_RETRIES || 2),
  interviewMode = process.env.MINDCLONE_INTERVIEW_MODE || "phased",
}) {
  const sessionManager = new SessionManager(baseDir, {
    encryptionKey,
    requireEncryption,
  });
  const contextManager = new ContextManager(8000);
  const aiClient = new AIClient({
    provider: aiProvider,
    model: aiModel,
    apiKey: aiApiKey,
    baseUrl: aiBaseUrl,
    timeoutMs: aiTimeoutMs,
    maxRetries: aiMaxRetries,
  });
  const normalizedInterviewMode =
    String(interviewMode || "phased").toLowerCase() === "adaptive" ? "adaptive" : "phased";
  let aiFallbackWarnings = 0;
  const loaded = await sessionManager.loadOrCreate(profileId);
  const { state, profile, tracker, contradictions } = loaded;
  if (requireConsent) {
    const consentCheck = await ensureConsent({
      io,
      profile,
      consentVersion,
      consentSource,
    });
    if (!consentCheck.granted) {
      await sessionManager.saveAll(profileId, { state, profile, tracker, contradictions });
      return {
        phaseTransitioned: false,
        abortedByConsent: true,
        abortedBySafety: false,
        state,
        profile,
        summary: "Sessao encerrada por falta de consentimento.",
      };
    }
    if (!consentCheck.alreadyAccepted) {
      await sessionManager.saveAll(profileId, { state, profile, tracker, contradictions });
    }
  }

  if (deepeningMode) {
    return runDeepeningSession({
      profileId,
      io,
      maxQuestions,
      enableCrisisProtocol,
      sessionManager,
      state,
      profile,
      tracker,
      contradictions,
    });
  }
  if (normalizedInterviewMode === "adaptive") {
    await io.say(
      "\n[Modo adaptativo] Perguntas dinamicas por lacunas e contradicoes da conversa atual."
    );
  }

  const sessionLog = [];
  let askedInSession = 0;
  let lastEntry = null;
  let phaseTransitioned = false;

  while (askedInSession < maxQuestions) {
    const phase = getPhase(state.current_phase);
    if (!Array.isArray(phase.questions) || phase.questions.length === 0) {
      break;
    }

    let emptyFields = getEmptyFields(phase.targetFields, profile);
    const phaseCompleteness = updateMetaCompleteness(profile, phase.number);
    state.current_phase_progress = Number((phaseCompleteness * 100).toFixed(2));
    state.phases_status[getPhaseKey(phase.number)].score = state.current_phase_progress;
    state.overall_progress = calcOverallProgress(state.current_phase, state.current_phase_progress);

    if (phaseCompleteness >= phase.completionThreshold) {
      const currentPhaseKey = getPhaseKey(phase.number);
      const maxPhase = getMaxPhaseNumber();
      const nextPhase = phase.number + 1;
      const nextPhaseKey = getPhaseKey(nextPhase);
      const isLastPhase = phase.number >= maxPhase;

      state.phases_status[currentPhaseKey] = {
        status: "completed",
        score: 100,
      };
      if (!profile.meta.phases_completed.includes(phase.id)) {
        profile.meta.phases_completed.push(phase.id);
      }

      if (isLastPhase) {
        state.current_phase = phase.number;
        state.current_phase_progress = 100;
        state.overall_progress = 100;
        profile.meta.last_phase = currentPhaseKey;
      } else {
        state.current_phase = nextPhase;
        state.current_phase_progress = 0;
        if (state.phases_status[nextPhaseKey]) {
          state.phases_status[nextPhaseKey] = {
            status: "in_progress",
            score: 0,
          };
        }
        profile.meta.last_phase = nextPhaseKey;
      }

      phaseTransitioned = true;
      await io.say(phase.transitionMessage);
      if (isLastPhase || normalizedInterviewMode !== "adaptive") {
        break;
      }
      lastEntry = null;
      continue;
    }

    let question;
    let questionPhase = phase;
    let adaptiveReason = "";
    if (normalizedInterviewMode === "adaptive") {
      const adaptiveSelection = selectAdaptiveQuestion({
        currentPhaseNumber: phase.number,
        profile,
        tracker,
        contradictions,
        lastEntry,
      });
      if (!adaptiveSelection) {
        break;
      }
      question = adaptiveSelection.question;
      questionPhase = adaptiveSelection.phase;
      emptyFields = adaptiveSelection.emptyFields;
      adaptiveReason = adaptiveSelection.reason;
    } else {
      question = selectNextQuestion({
        phase,
        tracker,
        emptyFields,
        lastEntry,
      });
      if (!question) {
        break;
      }
    }

    const aiMessages = contextManager.build({
      systemPrompt: buildSystemPrompt(),
      phasePrompt: buildPhasePrompt(questionPhase),
      profile: compressProfileForContext(profile),
      askedQuestions: tracker.summary(),
      contradictions,
      recentConversation: sessionLog.slice(-10),
      emptyFields,
    });

    const questionContext = {
      contradictions,
      emptyFields,
      trackerSummary: tracker.summary(),
      interviewMode: normalizedInterviewMode,
      adaptiveReason,
    };
    const localQuestionText =
      typeof question.question === "function"
        ? question.question(profile, questionContext)
        : question.question;
    let aiQuestion = await aiClient.generateQuestion({
      messages: aiMessages,
      fallbackQuestion: localQuestionText,
    });

    let questionText = aiQuestion.question || localQuestionText;
    let validation = validateQuestionCandidate({
      questionText,
      targetField: question.target_field,
      questionType: question.question_type,
      askedQuestions: tracker.summary(),
      phaseTargetFields: questionPhase.targetFields,
      fallbackQuestion: localQuestionText,
    });
    let regenerationAttempt = 0;
    while (!validation.valid && regenerationAttempt < 2) {
      regenerationAttempt += 1;
      const regenerated = await aiClient.generateQuestion({
        messages: [
          ...aiMessages,
          {
            role: "system",
            content: buildInvalidationFeedback({
              reasons: validation.reasons,
              targetField: question.target_field,
            }),
          },
        ],
        fallbackQuestion: localQuestionText,
      });
      aiQuestion = regenerated;
      questionText = regenerated.question || localQuestionText;
      validation = validateQuestionCandidate({
        questionText,
        targetField: question.target_field,
        questionType: question.question_type,
        askedQuestions: tracker.summary(),
        phaseTargetFields: questionPhase.targetFields,
        fallbackQuestion: localQuestionText,
      });
    }

    if (!validation.valid) {
      questionText = localQuestionText;
      validation = validateQuestionCandidate({
        questionText,
        targetField: question.target_field,
        questionType: question.question_type,
        askedQuestions: tracker.summary(),
        phaseTargetFields: questionPhase.targetFields,
        fallbackQuestion: localQuestionText,
      });
    }
    if (!validation.valid) {
      questionText = buildRecoveryQuestion(question.target_field);
    }

    if (aiQuestion.usedFallback && aiProvider !== "local" && aiFallbackWarnings < 2) {
      aiFallbackWarnings += 1;
      await io.say(
        `[Aviso] Provider ${aiProvider} indisponivel (${aiQuestion.reason}). Usando fallback local.`
      );
    }

    const modeLabel = normalizedInterviewMode === "adaptive" ? "Adaptativo" : "Faseado";
    await io.say(
      `\n[${modeLabel} | ${questionPhase.name}] ${renderProgress(state.current_phase_progress)}`
    );
    await io.say(questionText);
    const input = (await io.ask("> ")).trim();
    if (input === "/pause") {
      break;
    }
    if (input === "/status") {
      await io.say(
        `Progresso atual: ${state.current_phase_progress.toFixed(0)}% | Modo: ${modeLabel}`
      );
      continue;
    }
    if (input === "/skip") {
      sessionLog.push({ role: "assistant", content: questionText });
      sessionLog.push({ role: "user", content: "/skip" });
      continue;
    }

    if (enableCrisisProtocol) {
      const risk = detectCrisisRisk(input);
      if (risk.detected) {
        const event = createCrisisEvent({
          phaseNumber: questionPhase.number,
          questionId: question.id,
          userInput: input,
          risk,
        });
        state.safety.crisis_protocol_triggered = true;
        state.safety.last_crisis_at = event.detected_at;
        state.safety.crisis_events.push(event);
        if (state.safety.crisis_events.length > 50) {
          state.safety.crisis_events = state.safety.crisis_events.slice(-50);
        }
        profile.meta.safety.crisis_events_count += 1;
        profile.meta.safety.last_crisis_at = event.detected_at;

        const supportMessage = buildCrisisSupportMessage();
        await io.say(supportMessage);
        sessionLog.push({ role: "assistant", content: questionText });
        sessionLog.push({ role: "user", content: input });
        sessionLog.push({ role: "assistant", content: supportMessage });
        await finalizeSession({
          sessionManager,
          profileId,
          state,
          profile,
          tracker,
          contradictions,
          sessionLog,
        });
        return {
          phaseTransitioned: false,
          abortedByConsent: false,
          abortedBySafety: true,
          state,
          profile,
          summary: "Sessao interrompida por protocolo de seguranca emocional.",
        };
      }
    }

    const updates = question.mapper(input, profile, questionContext);
    applyUpdates(profile, updates, {
      phaseNumber: questionPhase.number,
      questionId: question.id,
      questionType: question.question_type,
      targetField: question.target_field,
      answer: input,
    });
    if (questionPhase.number === 9 && questionPhase.emotionalValidationMessage) {
      await io.say(questionPhase.emotionalValidationMessage);
    }
    if (typeof questionPhase.detectContradictions === "function") {
      const found = questionPhase.detectContradictions({
        question,
        answer: input,
        profile,
      });
      addContradictions(contradictions, found, questionPhase.number);
    }
    askedInSession += 1;
    state.total_questions += 1;
    profile.meta.total_questions_answered = state.total_questions;

    const questionRecord = {
      id: createQuestionId(state.total_questions),
      phase: questionPhase.number,
      session: profile.meta.total_sessions + 1,
      question_text: questionText,
      target_field: question.target_field,
      response: input,
      timestamp: new Date().toISOString(),
    };
    tracker.addQuestion(questionRecord);
    state.last_question_id = questionRecord.id;
    lastEntry = {
      ...questionRecord,
      id: question.id,
      allow_followup: Boolean(question.allow_followup),
    };

    sessionLog.push({ role: "assistant", content: questionText });
    sessionLog.push({ role: "user", content: input });
    await sessionManager.saveAll(profileId, { state, profile, tracker, contradictions });
  }

  await finalizeSession({
    sessionManager,
    profileId,
    state,
    profile,
    tracker,
    contradictions,
    sessionLog,
  });

  const lastPhaseNumber = getMaxPhaseNumber();
  const summaryPhaseNumber =
    normalizedInterviewMode === "adaptive"
      ? state.current_phase
      : phaseTransitioned &&
          !(state.current_phase === lastPhaseNumber && state.current_phase_progress === 100)
        ? Math.max(1, state.current_phase - 1)
        : state.current_phase;
  const summaryScore =
    state.phases_status[getPhaseKey(summaryPhaseNumber)]?.score || state.current_phase_progress;
  const summary = buildPhaseSummary(profile, summaryPhaseNumber, summaryScore);
  return {
    phaseTransitioned,
    abortedByConsent: false,
    abortedBySafety: false,
    interviewMode: normalizedInterviewMode,
    state,
    profile,
    summary,
  };
}

module.exports = {
  runSession,
};
