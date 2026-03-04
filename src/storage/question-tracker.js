class QuestionTracker {
  constructor(data = {}) {
    this.questions_asked = Array.isArray(data.questions_asked) ? data.questions_asked : [];
    this.fields_covered = data.fields_covered || {};
  }

  addQuestion(entry) {
    this.questions_asked.push(entry);
    const existing = this.fields_covered[entry.target_field] || {
      covered: false,
      confidence: 0,
      question_ids: [],
    };
    existing.covered = true;
    existing.confidence = 1;
    existing.question_ids = [...new Set([...existing.question_ids, entry.id])];
    this.fields_covered[entry.target_field] = existing;
  }

  hasAskedAbout(fieldPath) {
    return Boolean(this.fields_covered[fieldPath]?.covered);
  }

  summary(max = 30) {
    return this.questions_asked.slice(-max).map((item) => ({
      id: item.id,
      question_text: item.question_text,
      target_field: item.target_field,
    }));
  }

  toJSON() {
    return {
      question_tracker: {
        questions_asked: this.questions_asked,
        fields_covered: this.fields_covered,
      },
    };
  }

  static fromJSON(raw) {
    if (!raw) {
      return new QuestionTracker();
    }
    if (raw.question_tracker) {
      return new QuestionTracker(raw.question_tracker);
    }
    return new QuestionTracker(raw);
  }
}

module.exports = {
  QuestionTracker,
};
