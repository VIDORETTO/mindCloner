const path = require("node:path");

function normalizeTags(rawTags) {
  if (!rawTags) {
    return [];
  }
  return String(rawTags)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

async function appendJournalEntry({ sessionManager, profileId, text, tags = [], source = "cli" }) {
  const filePath = path.join(sessionManager.store.getProfileDir(profileId), "journal.json");
  const current = await sessionManager.store.readJson(filePath, [], { sensitive: true });
  const entry = {
    id: `journal-${Date.now()}`,
    at: new Date().toISOString(),
    source,
    text: String(text || "").trim(),
    tags: Array.isArray(tags) ? tags : [],
  };
  const next = Array.isArray(current) ? [...current, entry] : [entry];
  await sessionManager.store.writeJson(filePath, next, { sensitive: true });
  return {
    entry,
    total: next.length,
  };
}

async function readJournalEntries({ sessionManager, profileId, limit = 3 }) {
  const filePath = path.join(sessionManager.store.getProfileDir(profileId), "journal.json");
  const all = await sessionManager.store.readJson(filePath, [], { sensitive: true });
  if (!Array.isArray(all)) {
    return [];
  }
  const bounded = Math.max(1, Number(limit || 3));
  return all.slice(-bounded);
}

module.exports = {
  appendJournalEntry,
  readJournalEntries,
  normalizeTags,
};
