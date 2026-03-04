const { getByPath, setByPath } = require("../utils/object-path");

const PHASE_01_TARGET_FIELDS = [
  "identity.full_name",
  "identity.preferred_name",
  "identity.age",
  "identity.location.current_city",
  "identity.location.current_country",
  "identity.location.born_in",
  "identity.family.marital_status",
  "identity.family.children",
  "identity.family.siblings",
  "identity.languages",
  "identity.ethnicity_cultural_background",
];

const PHASE_02_TARGET_FIELDS = [
  "behavioral_patterns.daily_routine.morning",
  "behavioral_patterns.daily_routine.afternoon",
  "behavioral_patterns.daily_routine.evening",
  "behavioral_patterns.daily_routine.night",
  "behavioral_patterns.daily_routine.consistency_level",
  "interests_and_preferences.media.books.reading_frequency",
  "interests_and_preferences.media.movies_series.frequency",
  "interests_and_preferences.media.music.role_of_music",
  "interests_and_preferences.food.relationship_with_food",
  "interests_and_preferences.food.cooking_interest",
  "interests_and_preferences.travel.style",
  "interests_and_preferences.travel.frequency",
  "interests_and_preferences.travel.motivation",
  "interests_and_preferences.technology.relationship",
  "interests_and_preferences.technology.adoption_speed",
];

const PHASE_03_TARGET_FIELDS = [
  "professional.current_role",
  "professional.industry",
  "professional.career_history",
  "professional.expertise_areas",
  "professional.skills.technical",
  "professional.skills.soft",
  "professional.work_style.collaboration_preference",
  "professional.work_style.preferred_environment",
  "professional.work_style.autonomy_need",
  "professional.professional_identity.what_defines_them_professionally",
  "professional.professional_identity.professional_values",
  "professional.ambitions.short_term",
  "professional.ambitions.ultimate_professional_goal",
  "professional.relationship_with_money.mindset",
  "professional.career_satisfaction_level",
  "professional.motivation_summary",
  "professional.ambitions.long_term",
];

const PHASE_04_TARGET_FIELDS = [
  "social_dynamics.social_energy.social_battery_capacity",
  "social_dynamics.social_energy.introversion_extraversion_spectrum",
  "social_dynamics.social_energy.recharge_method",
  "social_dynamics.social_energy.ideal_social_frequency",
  "social_dynamics.communication_style.primary_style",
  "social_dynamics.communication_style.assertiveness_level",
  "social_dynamics.communication_style.directness",
  "social_dynamics.conflict_style.primary",
  "social_dynamics.conflict_style.anger_expression",
  "social_dynamics.trust_patterns.trust_speed",
  "social_dynamics.trust_patterns.trust_criteria",
  "social_dynamics.trust_patterns.vulnerability_comfort",
  "social_dynamics.social_perception.how_they_think_others_see_them",
  "social_dynamics.social_perception.how_they_want_to_be_seen",
  "social_dynamics.boundaries.setting_ability",
  "social_dynamics.boundaries.common_boundary_issues",
  "social_dynamics.relationship_patterns.family_relationships",
];

const PHASE_05_TARGET_FIELDS = [
  "personality.big_five.openness.score",
  "personality.big_five.openness.evidence",
  "personality.big_five.conscientiousness.score",
  "personality.big_five.conscientiousness.evidence",
  "personality.big_five.extraversion.score",
  "personality.big_five.extraversion.evidence",
  "personality.big_five.agreeableness.score",
  "personality.big_five.agreeableness.evidence",
  "personality.big_five.neuroticism.score",
  "personality.big_five.neuroticism.evidence",
  "personality.mbti_approximation.type",
  "personality.mbti_approximation.confidence",
  "personality.enneagram_approximation.core_type",
  "personality.enneagram_approximation.wing",
  "personality.temperament.primary",
  "personality.temperament.secondary",
  "personality.cognitive_style.analytical_vs_intuitive",
  "personality.cognitive_style.detail_vs_big_picture",
  "personality.cognitive_style.sequential_vs_random",
  "personality.cognitive_style.convergent_vs_divergent",
  "personality.summary",
];

const PHASE_06_TARGET_FIELDS = [
  "emotional_profile.emotional_baseline.default_mood",
  "emotional_profile.emotional_baseline.emotional_range",
  "emotional_profile.emotional_baseline.emotional_intensity",
  "emotional_profile.emotional_baseline.emotional_stability",
  "emotional_profile.emotional_intelligence.self_awareness",
  "emotional_profile.emotional_intelligence.self_regulation",
  "emotional_profile.emotional_intelligence.empathy",
  "emotional_profile.emotional_intelligence.social_skills",
  "emotional_profile.attachment_style.primary",
  "emotional_profile.attachment_style.in_romantic_relationships",
  "emotional_profile.attachment_style.in_friendships",
  "emotional_profile.attachment_style.with_authority",
  "emotional_profile.attachment_style.evidence",
  "emotional_profile.emotional_triggers",
  "emotional_profile.coping_mechanisms.healthy",
  "emotional_profile.coping_mechanisms.unhealthy",
  "emotional_profile.coping_mechanisms.primary_defense_mechanisms",
  "emotional_profile.coping_mechanisms.under_stress",
  "emotional_profile.coping_mechanisms.under_conflict",
  "emotional_profile.coping_mechanisms.under_pressure",
  "emotional_profile.emotional_needs",
  "emotional_profile.emotional_expression_style",
];

const PHASE_07_TARGET_FIELDS = [
  "values_and_beliefs.core_values",
  "values_and_beliefs.hierarchy_of_values",
  "values_and_beliefs.worldview.summary",
  "values_and_beliefs.worldview.optimist_vs_pessimist",
  "values_and_beliefs.worldview.idealist_vs_realist",
  "values_and_beliefs.worldview.individualist_vs_collectivist",
  "values_and_beliefs.moral_foundations.care_harm",
  "values_and_beliefs.moral_foundations.fairness_cheating",
  "values_and_beliefs.moral_foundations.loyalty_betrayal",
  "values_and_beliefs.moral_foundations.authority_subversion",
  "values_and_beliefs.moral_foundations.sanctity_degradation",
  "values_and_beliefs.moral_foundations.liberty_oppression",
  "values_and_beliefs.ethical_framework",
  "values_and_beliefs.political_orientation.economic",
  "values_and_beliefs.political_orientation.social",
  "values_and_beliefs.political_orientation.summary",
  "values_and_beliefs.spiritual_religious.beliefs",
  "values_and_beliefs.spiritual_religious.practices",
  "values_and_beliefs.spiritual_religious.importance",
  "values_and_beliefs.philosophical_stances",
  "values_and_beliefs.non_negotiables",
  "values_and_beliefs.things_tolerated_but_disliked",
];

const PHASE_08_TARGET_FIELDS = [
  "cognitive_patterns.decision_making.style",
  "cognitive_patterns.decision_making.factors_prioritized",
  "cognitive_patterns.decision_making.analysis_paralysis_prone",
  "cognitive_patterns.decision_making.gut_vs_data",
  "cognitive_patterns.decision_making.regret_pattern",
  "cognitive_patterns.problem_solving.approach",
  "cognitive_patterns.problem_solving.persistence_level",
  "cognitive_patterns.problem_solving.asks_for_help_when",
  "cognitive_patterns.problem_solving.preferred_tools",
  "cognitive_patterns.learning.style",
  "cognitive_patterns.learning.preferred_formats",
  "cognitive_patterns.learning.retention_strengths",
  "cognitive_patterns.learning.motivation_to_learn",
  "cognitive_patterns.cognitive_biases_prone",
  "cognitive_patterns.attention_patterns.focus_duration",
  "cognitive_patterns.attention_patterns.distraction_triggers",
  "cognitive_patterns.attention_patterns.flow_state_triggers",
  "cognitive_patterns.thinking_patterns.inner_monologue",
  "cognitive_patterns.thinking_patterns.rumination_tendency",
  "cognitive_patterns.creativity.level",
  "cognitive_patterns.creativity.creative_process",
  "cognitive_patterns.risk_tolerance.financial",
  "cognitive_patterns.risk_tolerance.social",
  "cognitive_patterns.risk_tolerance.professional",
];

const PHASE_09_TARGET_FIELDS = [
  "motivations_and_drives.core_motivations",
  "motivations_and_drives.intrinsic_motivators",
  "motivations_and_drives.what_gets_them_out_of_bed",
  "motivations_and_drives.what_keeps_them_up_at_night",
  "motivations_and_drives.deepest_fears",
  "motivations_and_drives.deepest_desires",
  "motivations_and_drives.life_goals.future",
  "motivations_and_drives.purpose_sense.has_clear_purpose",
  "motivations_and_drives.purpose_sense.purpose_statement",
  "self_concept.self_image",
  "self_concept.self_esteem_level",
  "self_concept.self_compassion_level",
  "self_concept.ideal_self",
  "self_concept.gap_real_vs_ideal",
  "self_concept.insecurities",
  "self_concept.inner_critic.intensity",
  "self_concept.inner_critic.common_messages",
  "self_concept.relationship_with_past_self",
  "life_narrative.turning_points",
  "life_narrative.formative_experiences",
  "life_narrative.proudest_moments",
  "life_narrative.deepest_regrets",
  "life_narrative.unresolved_issues",
  "life_narrative.legacy_desire",
];

const PHASE_10_TARGET_FIELDS = [
  "synthesis.key_contradictions",
  "synthesis.blind_spots_identified",
  "synthesis.growth_edges",
  "synthesis.core_essence_paragraph",
  "synthesis.in_three_words",
  "synthesis.unique_combination",
  "synthesis.primary_archetypes",
  "synthesis.prediction_patterns.how_they_would_react_to_good_news",
  "synthesis.prediction_patterns.how_they_would_react_to_bad_news",
  "synthesis.prediction_patterns.how_they_would_handle_a_crisis",
  "synthesis.prediction_patterns.how_they_would_celebrate",
  "synthesis.prediction_patterns.how_they_would_comfort_someone",
  "synthesis.prediction_patterns.how_they_would_make_a_big_decision",
  "synthesis.rag_instruction",
];

function isFilled(value) {
  if (value == null) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

const TRACKED_BLOCKS = [
  "identity",
  "interests_and_preferences",
  "behavioral_patterns",
  "social_dynamics",
  "professional",
  "personality",
  "emotional_profile",
  "values_and_beliefs",
  "cognitive_patterns",
  "motivations_and_drives",
  "self_concept",
  "life_narrative",
  "synthesis",
];

function normalizeTrackedPath(path) {
  if (typeof path !== "string") {
    return "";
  }
  if (path.startsWith("deepening:")) {
    return path.slice("deepening:".length);
  }
  return path;
}

function getBlockFromPath(path) {
  const normalized = normalizeTrackedPath(path);
  const [block] = normalized.split(".");
  return TRACKED_BLOCKS.includes(block) ? block : "";
}

function ensureTraceMetadata(profile) {
  if (!profile.meta.confidence_scores || typeof profile.meta.confidence_scores !== "object") {
    profile.meta.confidence_scores = {};
  }
  if (!profile.meta.data_lineage || typeof profile.meta.data_lineage !== "object") {
    profile.meta.data_lineage = {};
  }
  if (!profile.meta.confidence_by_block || typeof profile.meta.confidence_by_block !== "object") {
    profile.meta.confidence_by_block = {};
  }
  for (const block of TRACKED_BLOCKS) {
    if (typeof profile.meta.confidence_by_block[block] !== "number") {
      profile.meta.confidence_by_block[block] = 0;
    }
  }
}

function getDefaultConfidence(sourceType) {
  if (sourceType === "fato") {
    return 95;
  }
  if (sourceType === "auto_relato") {
    return 80;
  }
  return 55;
}

function detectInferenceByFallback({ answer = "", value }) {
  const normalizedAnswer = String(answer || "").trim();
  return normalizedAnswer.length === 0 && isFilled(value);
}

function classifySourceType({
  sourceType = "",
  phaseNumber,
  questionType,
  targetField = "",
  path = "",
  answer = "",
  value,
}) {
  if (sourceType === "fato" || sourceType === "auto_relato" || sourceType === "inferencia") {
    return sourceType;
  }
  const normalizedPath = normalizeTrackedPath(path);
  if (detectInferenceByFallback({ answer, value })) {
    return "inferencia";
  }
  if (
    questionType === "prediction" ||
    normalizedPath.startsWith("synthesis.prediction_patterns.")
  ) {
    return "inferencia";
  }
  if (phaseNumber === 1 && PHASE_01_TARGET_FIELDS.includes(targetField)) {
    return "fato";
  }
  if (
    (normalizedPath === "personality.enneagram_approximation.core_type" ||
      normalizedPath === "personality.enneagram_approximation.wing") &&
    Number(value) === 5 &&
    !/\d/.test(String(answer || ""))
  ) {
    return "inferencia";
  }
  return "auto_relato";
}

function refreshConfidenceByBlock(profile) {
  ensureTraceMetadata(profile);
  const sums = Object.fromEntries(TRACKED_BLOCKS.map((block) => [block, { sum: 0, count: 0 }]));
  for (const [path, score] of Object.entries(profile.meta.confidence_scores)) {
    const block = getBlockFromPath(path);
    if (!block) {
      continue;
    }
    const value = Number(score);
    if (!Number.isFinite(value)) {
      continue;
    }
    sums[block].sum += value;
    sums[block].count += 1;
  }
  for (const block of TRACKED_BLOCKS) {
    const entry = sums[block];
    profile.meta.confidence_by_block[block] =
      entry.count === 0 ? 0 : Number((entry.sum / entry.count).toFixed(2));
  }
}

function registerFieldTrace(profile, path, value, context = {}) {
  ensureTraceMetadata(profile);
  const sourceType = classifySourceType({
    sourceType: context.sourceType,
    phaseNumber: context.phaseNumber,
    questionType: context.questionType,
    targetField: context.targetField,
    path,
    answer: context.answer,
    value,
  });
  const confidenceScore = Number(
    (typeof context.confidenceScore === "number"
      ? context.confidenceScore
      : getDefaultConfidence(sourceType)
    ).toFixed(2)
  );
  const now = new Date().toISOString();

  const normalizedPath = normalizeTrackedPath(path);
  profile.meta.confidence_scores[normalizedPath] = confidenceScore;
  profile.meta.data_lineage[normalizedPath] = {
    source_type: sourceType,
    confirmed: sourceType !== "inferencia",
    confidence_score: confidenceScore,
    phase: context.phaseNumber ?? null,
    question_id: context.questionId || "",
    question_type: context.questionType || "",
    target_field: context.targetField || normalizedPath,
    updated_at: now,
  };
  refreshConfidenceByBlock(profile);
}

function applyUpdates(profile, updates, context = {}) {
  for (const [path, value] of Object.entries(updates)) {
    setByPath(profile, path, value);
    registerFieldTrace(profile, path, value, context);
  }
  profile.meta.updated_at = new Date().toISOString();
}

function getEmptyFields(fields, profile) {
  return fields.filter((fieldPath) => !isFilled(getByPath(profile, fieldPath)));
}

function getPhaseTargetFields(phaseNumber) {
  if (phaseNumber === 1) {
    return [...PHASE_01_TARGET_FIELDS];
  }
  if (phaseNumber === 2) {
    return [...PHASE_02_TARGET_FIELDS];
  }
  if (phaseNumber === 3) {
    return [...PHASE_03_TARGET_FIELDS];
  }
  if (phaseNumber === 4) {
    return [...PHASE_04_TARGET_FIELDS];
  }
  if (phaseNumber === 5) {
    return [...PHASE_05_TARGET_FIELDS];
  }
  if (phaseNumber === 6) {
    return [...PHASE_06_TARGET_FIELDS];
  }
  if (phaseNumber === 7) {
    return [...PHASE_07_TARGET_FIELDS];
  }
  if (phaseNumber === 8) {
    return [...PHASE_08_TARGET_FIELDS];
  }
  if (phaseNumber === 9) {
    return [...PHASE_09_TARGET_FIELDS];
  }
  if (phaseNumber === 10) {
    return [...PHASE_10_TARGET_FIELDS];
  }
  return [];
}

function calculateCompleteness(fields, profile) {
  if (fields.length === 0) {
    return 0;
  }
  const filled = fields.filter((fieldPath) => isFilled(getByPath(profile, fieldPath))).length;
  return Number((filled / fields.length).toFixed(4));
}

function updateMetaCompleteness(profile, phaseNumber) {
  const fields = getPhaseTargetFields(phaseNumber);
  const phaseCompleteness = calculateCompleteness(fields, profile);
  if (phaseNumber === 1) {
    profile.meta.completeness_by_area.identity = Number((phaseCompleteness * 100).toFixed(2));
  }
  if (phaseNumber === 2) {
    const behavioralFields = PHASE_02_TARGET_FIELDS.slice(0, 5);
    const interestsFields = PHASE_02_TARGET_FIELDS.slice(5);
    profile.meta.completeness_by_area.behavioral_patterns = Number(
      (calculateCompleteness(behavioralFields, profile) * 100).toFixed(2)
    );
    profile.meta.completeness_by_area.interests_and_preferences = Number(
      (calculateCompleteness(interestsFields, profile) * 100).toFixed(2)
    );
  }
  if (phaseNumber === 3) {
    profile.meta.completeness_by_area.professional = Number((phaseCompleteness * 100).toFixed(2));
  }
  if (phaseNumber === 4) {
    profile.meta.completeness_by_area.social_dynamics = Number(
      (phaseCompleteness * 100).toFixed(2)
    );
  }
  if (phaseNumber === 5) {
    profile.meta.completeness_by_area.personality = Number((phaseCompleteness * 100).toFixed(2));
  }
  if (phaseNumber === 6) {
    profile.meta.completeness_by_area.emotional_profile = Number(
      (phaseCompleteness * 100).toFixed(2)
    );
  }
  if (phaseNumber === 7) {
    profile.meta.completeness_by_area.values_and_beliefs = Number(
      (phaseCompleteness * 100).toFixed(2)
    );
  }
  if (phaseNumber === 8) {
    profile.meta.completeness_by_area.cognitive_patterns = Number(
      (phaseCompleteness * 100).toFixed(2)
    );
  }
  if (phaseNumber === 9) {
    const motivationsFields = PHASE_09_TARGET_FIELDS.slice(0, 9);
    const selfConceptFields = PHASE_09_TARGET_FIELDS.slice(9, 18);
    const lifeNarrativeFields = PHASE_09_TARGET_FIELDS.slice(18);
    profile.meta.completeness_by_area.motivations_and_drives = Number(
      (calculateCompleteness(motivationsFields, profile) * 100).toFixed(2)
    );
    profile.meta.completeness_by_area.self_concept = Number(
      (calculateCompleteness(selfConceptFields, profile) * 100).toFixed(2)
    );
    profile.meta.completeness_by_area.life_narrative = Number(
      (calculateCompleteness(lifeNarrativeFields, profile) * 100).toFixed(2)
    );
  }
  if (phaseNumber === 10) {
    profile.meta.completeness_by_area.synthesis = Number((phaseCompleteness * 100).toFixed(2));
  }

  const phase1Completeness = calculateCompleteness(PHASE_01_TARGET_FIELDS, profile);
  const phase2Completeness = calculateCompleteness(PHASE_02_TARGET_FIELDS, profile);
  const phase3Completeness = calculateCompleteness(PHASE_03_TARGET_FIELDS, profile);
  const phase4Completeness = calculateCompleteness(PHASE_04_TARGET_FIELDS, profile);
  const phase5Completeness = calculateCompleteness(PHASE_05_TARGET_FIELDS, profile);
  const phase6Completeness = calculateCompleteness(PHASE_06_TARGET_FIELDS, profile);
  const phase7Completeness = calculateCompleteness(PHASE_07_TARGET_FIELDS, profile);
  const phase8Completeness = calculateCompleteness(PHASE_08_TARGET_FIELDS, profile);
  const phase9Completeness = calculateCompleteness(PHASE_09_TARGET_FIELDS, profile);
  const phase10Completeness = calculateCompleteness(PHASE_10_TARGET_FIELDS, profile);
  profile.meta.completeness_score = Number(
    (
      (phase1Completeness +
        phase2Completeness +
        phase3Completeness +
        phase4Completeness +
        phase5Completeness +
        phase6Completeness +
        phase7Completeness +
        phase8Completeness +
        phase9Completeness +
        phase10Completeness) *
      10
    ).toFixed(2)
  );
  return phaseCompleteness;
}

function compressProfileForContext(profile) {
  return {
    identity: profile.identity,
    interests_and_preferences: profile.interests_and_preferences,
    behavioral_patterns: profile.behavioral_patterns,
    social_dynamics: profile.social_dynamics,
    professional: profile.professional,
    personality: profile.personality,
    emotional_profile: profile.emotional_profile,
    values_and_beliefs: profile.values_and_beliefs,
    cognitive_patterns: profile.cognitive_patterns,
    motivations_and_drives: profile.motivations_and_drives,
    self_concept: profile.self_concept,
    life_narrative: profile.life_narrative,
    synthesis: profile.synthesis,
    meta: {
      profile_id: profile.meta.profile_id,
      completeness_score: profile.meta.completeness_score,
      phases_completed: profile.meta.phases_completed,
    },
  };
}

module.exports = {
  PHASE_01_TARGET_FIELDS,
  PHASE_02_TARGET_FIELDS,
  PHASE_03_TARGET_FIELDS,
  PHASE_04_TARGET_FIELDS,
  PHASE_05_TARGET_FIELDS,
  PHASE_06_TARGET_FIELDS,
  PHASE_07_TARGET_FIELDS,
  PHASE_08_TARGET_FIELDS,
  PHASE_09_TARGET_FIELDS,
  PHASE_10_TARGET_FIELDS,
  applyUpdates,
  registerFieldTrace,
  calculateCompleteness,
  compressProfileForContext,
  getEmptyFields,
  getPhaseTargetFields,
  updateMetaCompleteness,
};
