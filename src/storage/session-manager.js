const path = require("node:path");
const fs = require("node:fs/promises");
const { LocalStore } = require("./local-store");
const { createEmptyProfile } = require("../profile/profile-schema");
const { QuestionTracker } = require("./question-tracker");

function buildInitialState(profileId, now = new Date().toISOString()) {
  const phasesStatus = {};
  for (let phase = 1; phase <= 10; phase += 1) {
    phasesStatus[`phase_${String(phase).padStart(2, "0")}`] = {
      status: phase === 1 ? "in_progress" : "pending",
      score: 0,
    };
  }
  return {
    profile_id: profileId,
    current_phase: 1,
    current_phase_progress: 0,
    overall_progress: 0,
    last_question_id: "",
    last_session_id: "",
    phases_status: phasesStatus,
    deepening_sessions: 0,
    total_questions: 0,
    total_time_minutes: 0,
    safety: {
      crisis_protocol_triggered: false,
      last_crisis_at: "",
      crisis_events: [],
    },
    created_at: now,
    last_activity: now,
  };
}

function ensureSafetyState(state) {
  if (!state.safety || typeof state.safety !== "object") {
    state.safety = {
      crisis_protocol_triggered: false,
      last_crisis_at: "",
      crisis_events: [],
    };
    return;
  }
  if (typeof state.safety.crisis_protocol_triggered !== "boolean") {
    state.safety.crisis_protocol_triggered = false;
  }
  if (typeof state.safety.last_crisis_at !== "string") {
    state.safety.last_crisis_at = "";
  }
  if (!Array.isArray(state.safety.crisis_events)) {
    state.safety.crisis_events = [];
  }
}

function ensureSafetyMeta(profile) {
  if (!profile.meta.safety || typeof profile.meta.safety !== "object") {
    profile.meta.safety = {
      crisis_events_count: 0,
      last_crisis_at: "",
    };
    return;
  }
  if (typeof profile.meta.safety.crisis_events_count !== "number") {
    profile.meta.safety.crisis_events_count = 0;
  }
  if (typeof profile.meta.safety.last_crisis_at !== "string") {
    profile.meta.safety.last_crisis_at = "";
  }
}

function ensureTraceMeta(profile) {
  if (!profile.meta.confidence_scores || typeof profile.meta.confidence_scores !== "object") {
    profile.meta.confidence_scores = {};
  }
  if (!profile.meta.data_lineage || typeof profile.meta.data_lineage !== "object") {
    profile.meta.data_lineage = {};
  }
  if (!profile.meta.confidence_by_block || typeof profile.meta.confidence_by_block !== "object") {
    profile.meta.confidence_by_block = {
      identity: 0,
      interests_and_preferences: 0,
      behavioral_patterns: 0,
      social_dynamics: 0,
      professional: 0,
      personality: 0,
      emotional_profile: 0,
      values_and_beliefs: 0,
      cognitive_patterns: 0,
      motivations_and_drives: 0,
      self_concept: 0,
      life_narrative: 0,
      synthesis: 0,
    };
  }
}

class SessionManager {
  constructor(baseDir, options = {}) {
    this.store = new LocalStore(baseDir, options);
  }

  profileFiles(profileId) {
    const dir = this.store.getProfileDir(profileId);
    return {
      dir,
      state: path.join(dir, "state.json"),
      profile: path.join(dir, "partial-profile.json"),
      tracker: path.join(dir, "question-tracker.json"),
      contradictions: path.join(dir, "contradictions.json"),
      sessionsDir: path.join(dir, "sessions"),
    };
  }

  async loadOrCreate(profileId) {
    await this.store.ensureProfileStructure(profileId);
    const files = this.profileFiles(profileId);
    const now = new Date().toISOString();
    const state = await this.store.readJson(files.state, buildInitialState(profileId, now), {
      sensitive: true,
    });
    const profile = await this.store.readJson(files.profile, createEmptyProfile(profileId, now), {
      sensitive: true,
    });
    ensureSafetyState(state);
    ensureSafetyMeta(profile);
    ensureTraceMeta(profile);
    const trackerRaw = await this.store.readJson(files.tracker, null);
    const tracker = QuestionTracker.fromJSON(trackerRaw);
    const contradictions = await this.store.readJson(files.contradictions, []);
    await this.saveAll(profileId, { state, profile, tracker, contradictions });
    return { state, profile, tracker, contradictions };
  }

  async loadExisting(profileId) {
    const files = this.profileFiles(profileId);
    try {
      await fs.access(files.state);
    } catch (error) {
      if (error.code === "ENOENT") {
        return null;
      }
      throw error;
    }

    const state = await this.store.readJson(files.state, null, { sensitive: true });
    const profile = await this.store.readJson(files.profile, null, { sensitive: true });
    const trackerRaw = await this.store.readJson(files.tracker, null);
    const contradictions = await this.store.readJson(files.contradictions, []);
    if (!state || !profile) {
      throw new Error(
        "Perfil encontrado com arquivos incompletos. Execute uma sessao de recuperacao ou restaure backup."
      );
    }
    ensureSafetyState(state);
    ensureSafetyMeta(profile);
    ensureTraceMeta(profile);
    const tracker = QuestionTracker.fromJSON(trackerRaw);
    return { state, profile, tracker, contradictions };
  }

  async saveAll(profileId, { state, profile, tracker, contradictions }) {
    const files = this.profileFiles(profileId);
    state.last_activity = new Date().toISOString();
    await this.store.writeJson(files.state, state, { sensitive: true });
    await this.store.writeJson(files.profile, profile, { sensitive: true });
    await this.store.writeJson(files.tracker, tracker.toJSON());
    await this.store.writeJson(files.contradictions, contradictions);
  }

  async saveSessionLog(profileId, sessionLog) {
    const files = this.profileFiles(profileId);
    const sessionId = `session-${String(Date.now())}`;
    const fullPath = path.join(files.sessionsDir, `${sessionId}.json`);
    await this.store.writeText(fullPath, JSON.stringify(sessionLog, null, 2), { sensitive: true });
    return sessionId;
  }
}

module.exports = {
  SessionManager,
  buildInitialState,
};
