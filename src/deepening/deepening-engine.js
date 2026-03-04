const { getByPath, setByPath } = require("../utils/object-path");

const GAP_CANDIDATES = [
  {
    path: "values_and_beliefs.worldview.summary",
    label: "sintese da sua visao de mundo",
  },
  {
    path: "identity.physical_self.self_description",
    label: "autodescricao fisica e presenca pessoal",
  },
  {
    path: "self_concept.relationship_with_future_self",
    label: "relacao com seu eu do futuro",
  },
  {
    path: "life_narrative.life_philosophy_statement",
    label: "frase de filosofia de vida",
  },
  {
    path: "emotional_profile.attachment_style.secondary",
    label: "estilo de apego secundario",
  },
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

function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function pushUnique(list, values) {
  const existing = new Set(list.map((item) => String(item).trim().toLowerCase()));
  for (const value of values) {
    const key = value.trim().toLowerCase();
    if (!key || existing.has(key)) {
      continue;
    }
    list.push(value.trim());
    existing.add(key);
  }
}

function buildDeepeningPlan({ profile, contradictions, tracker }) {
  const plan = [];
  const unresolved = Array.isArray(contradictions)
    ? contradictions.find((item) => !item?.resolved)
    : null;
  if (unresolved?.contradiction) {
    plan.push({
      id: "deepening_contradiction_resolution",
      target_field: "synthesis.key_contradictions",
      question: `No deepening, quero resolver uma tensao: "${unresolved.contradiction}". O que esta por tras disso e como voce ajustaria essa narrativa?`,
      apply(answer, context) {
        unresolved.explanation = String(answer || "").trim();
        unresolved.resolved = true;
        unresolved.resolved_at = new Date().toISOString();
        const keyList = Array.isArray(profile.synthesis?.key_contradictions)
          ? profile.synthesis.key_contradictions
          : [];
        if (keyList.length === 0) {
          profile.synthesis.key_contradictions = [
            {
              contradiction: unresolved.contradiction,
              explanation: unresolved.explanation,
            },
          ];
        }
        context.confidencePath = "synthesis.key_contradictions";
      },
    });
  }

  for (const gap of GAP_CANDIDATES) {
    if (isFilled(getByPath(profile, gap.path))) {
      continue;
    }
    const deepField = `deepening:${gap.path}`;
    if (tracker.hasAskedAbout(deepField)) {
      continue;
    }
    plan.push({
      id: `deepening_gap_${gap.path.replace(/[^\w]+/g, "_")}`,
      target_field: deepField,
      question: `No seu perfil, ainda falta aprofundar ${gap.label}. Pode detalhar isso agora?`,
      apply(answer, context) {
        const trimmed = String(answer || "").trim();
        if (!trimmed) {
          return;
        }
        setByPath(profile, gap.path, trimmed);
        const blindSpots = Array.isArray(profile.synthesis?.blind_spots_identified)
          ? profile.synthesis.blind_spots_identified
          : [];
        profile.synthesis.blind_spots_identified = blindSpots;
        pushUnique(profile.synthesis.blind_spots_identified, [gap.label]);
        context.confidencePath = gap.path;
      },
    });
  }

  plan.push({
    id: "deepening_growth_edges_refresh",
    target_field: "deepening:synthesis.growth_edges",
    question:
      "Depois desse refinamento, quais 2-3 growth edges mais importantes voce quer priorizar agora? Separe por virgula.",
    apply(answer, context) {
      const nextEdges = parseCsv(answer).slice(0, 3);
      const currentEdges = Array.isArray(profile.synthesis?.growth_edges)
        ? profile.synthesis.growth_edges
        : [];
      profile.synthesis.growth_edges = currentEdges;
      pushUnique(profile.synthesis.growth_edges, nextEdges);
      context.confidencePath = "synthesis.growth_edges";
    },
  });

  return plan;
}

function bumpConfidence(profile, path) {
  if (!path) {
    return;
  }
  if (!profile.meta.confidence_scores || typeof profile.meta.confidence_scores !== "object") {
    profile.meta.confidence_scores = {};
  }
  const current = Number(profile.meta.confidence_scores[path] || 0);
  const next = current > 0 ? Math.min(100, current + 10) : 75;
  profile.meta.confidence_scores[path] = next;
}

module.exports = {
  buildDeepeningPlan,
  bumpConfidence,
};
