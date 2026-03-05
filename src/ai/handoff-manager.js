const fs = require("node:fs/promises");
const path = require("node:path");
const { LocalStore } = require("../storage/local-store");

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function normalizeConversation(entries, limit = 10) {
  return toArray(entries)
    .filter((entry) => entry && typeof entry === "object")
    .slice(-Math.max(1, Math.min(Number(limit) || 10, 30)))
    .map((entry) => ({
      role: normalizeText(entry.role, "assistant"),
      content: normalizeText(entry.content),
    }))
    .filter((entry) => entry.content.length > 0);
}

function buildTimestampToken(isoString) {
  return String(isoString || "")
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function buildHandoffId(createdAt) {
  return `handoff-${buildTimestampToken(createdAt)}`;
}

function buildHandoffFilename(createdAt) {
  return `${buildHandoffId(createdAt)}.json`;
}

function normalizeContradictionSummary(entry) {
  if (!entry) {
    return "";
  }
  if (typeof entry === "string") {
    return entry.trim();
  }
  return normalizeText(entry.contradiction);
}

function summarizeOpenContradictions(contradictions) {
  return toArray(contradictions)
    .filter((entry) => entry && entry.resolved !== true)
    .map((entry) => normalizeContradictionSummary(entry))
    .filter(Boolean)
    .slice(0, 10);
}

function buildSnapshotSummary({ summary, profileCompleteness, openQuestions, openContradictions }) {
  const explicit = normalizeText(summary);
  if (explicit) {
    return explicit;
  }
  return [
    `Completude: ${Number(profileCompleteness || 0).toFixed(2)}%`,
    `Lacunas abertas: ${toArray(openQuestions).length}`,
    `Contradicoes abertas: ${toArray(openContradictions).length}`,
  ].join(" | ");
}

class HandoffManager {
  constructor(baseDir, options = {}) {
    this.baseDir = baseDir;
    this.store = new LocalStore(baseDir, options);
  }

  getProfileDir(profileId) {
    return path.join(this.baseDir, "profiles", profileId);
  }

  getHandoffsDir(profileId) {
    return path.join(this.getProfileDir(profileId), "handoffs");
  }

  getHistoryPath(profileId) {
    return path.join(this.getHandoffsDir(profileId), "history.json");
  }

  async ensureHandoffStructure(profileId) {
    await this.store.ensureProfileStructure(profileId);
    await fs.mkdir(this.getHandoffsDir(profileId), { recursive: true });
  }

  buildSnapshot({
    profileId,
    sourceSessionId,
    summary,
    openQuestions = [],
    openContradictions = [],
    recentConversation = [],
    profileCompleteness = 0,
    state = {},
    now = new Date(),
  }) {
    const createdAt = now.toISOString();
    const normalizedOpenQuestions = toArray(openQuestions)
      .map((item) => normalizeText(item))
      .filter(Boolean)
      .slice(0, 30);
    const normalizedContradictions = toArray(openContradictions)
      .map((item) => normalizeText(item))
      .filter(Boolean)
      .slice(0, 20);
    const snapshotSummary = buildSnapshotSummary({
      summary,
      profileCompleteness,
      openQuestions: normalizedOpenQuestions,
      openContradictions: normalizedContradictions,
    });
    return {
      version: 1,
      handoffId: buildHandoffId(createdAt),
      profileId: normalizeText(profileId),
      createdAt,
      sourceSessionId: normalizeText(sourceSessionId),
      sourcePhase: Number(state.current_phase || 1),
      sourcePhaseProgress: Number(state.current_phase_progress || 0),
      summary: snapshotSummary,
      openQuestions: normalizedOpenQuestions,
      openContradictions: normalizedContradictions,
      recentConversation: normalizeConversation(recentConversation, 12),
      profileCompleteness: Number(Number(profileCompleteness || 0).toFixed(2)),
    };
  }

  buildHistoryEntry(snapshot, filePath) {
    return {
      handoffId: snapshot.handoffId,
      file: path.basename(filePath),
      filePath,
      createdAt: snapshot.createdAt,
      sourceSessionId: snapshot.sourceSessionId,
      sourcePhase: snapshot.sourcePhase,
      sourcePhaseProgress: snapshot.sourcePhaseProgress,
      profileCompleteness: snapshot.profileCompleteness,
      openQuestionsCount: toArray(snapshot.openQuestions).length,
      openContradictionsCount: toArray(snapshot.openContradictions).length,
      summary: snapshot.summary,
    };
  }

  async saveSnapshot(profileId, snapshotInput) {
    await this.ensureHandoffStructure(profileId);
    const snapshot = this.buildSnapshot({
      profileId,
      ...snapshotInput,
    });
    const handoffsDir = this.getHandoffsDir(profileId);
    const filePath = path.join(handoffsDir, buildHandoffFilename(snapshot.createdAt));
    await this.store.writeJson(filePath, snapshot, { sensitive: true });

    const historyPath = this.getHistoryPath(profileId);
    const history = await this.store.readJson(historyPath, [], { sensitive: true });
    const entry = this.buildHistoryEntry(snapshot, filePath);
    const normalizedHistory = toArray(history).filter(
      (item) => item && item.handoffId !== entry.handoffId
    );
    normalizedHistory.push(entry);
    normalizedHistory.sort((left, right) =>
      String(left.createdAt).localeCompare(String(right.createdAt))
    );
    await this.store.writeJson(historyPath, normalizedHistory.slice(-200), { sensitive: true });
    return {
      snapshot,
      filePath,
      historyEntry: entry,
    };
  }

  async listHistory(profileId, options = {}) {
    const limit = Math.max(1, Math.min(Number(options.limit || 20), 200));
    const historyPath = this.getHistoryPath(profileId);
    const history = await this.store.readJson(historyPath, [], { sensitive: true });
    const normalized = toArray(history).sort((left, right) =>
      String(right.createdAt).localeCompare(String(left.createdAt))
    );
    return normalized.slice(0, limit);
  }

  async loadLatestSnapshot(profileId) {
    const history = await this.listHistory(profileId, { limit: 1 });
    if (history.length > 0) {
      const latest = history[0];
      const snapshot = await this.store.readJson(String(latest.filePath || ""), null, {
        sensitive: true,
      });
      if (snapshot) {
        return {
          snapshot,
          filePath: String(latest.filePath || ""),
          historyEntry: latest,
        };
      }
    }

    const handoffsDir = this.getHandoffsDir(profileId);
    let files;
    try {
      files = await fs.readdir(handoffsDir);
    } catch (error) {
      if (error.code === "ENOENT") {
        return null;
      }
      throw error;
    }
    const latestFile = files
      .filter((name) => /^handoff-\d{8}T\d{6}Z\.json$/.test(name))
      .sort()
      .pop();
    if (!latestFile) {
      return null;
    }
    const filePath = path.join(handoffsDir, latestFile);
    const snapshot = await this.store.readJson(filePath, null, { sensitive: true });
    if (!snapshot) {
      return null;
    }
    return {
      snapshot,
      filePath,
      historyEntry: this.buildHistoryEntry(snapshot, filePath),
    };
  }
}

module.exports = {
  HandoffManager,
  buildHandoffFilename,
  buildHandoffId,
};
