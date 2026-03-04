function parseAIResponse(raw) {
  if (typeof raw === "object" && raw !== null) {
    return raw;
  }
  try {
    return JSON.parse(String(raw));
  } catch (error) {
    return {
      internal_analysis: {
        profile_updates: {},
        contradictions_found: [],
        phase_progress: 0,
      },
      visible_response: {
        acknowledgment: "",
        transition: "",
        question: String(raw || ""),
        question_type: "open",
        target_field: "",
        skip_option: true,
      },
    };
  }
}

module.exports = {
  parseAIResponse,
};
