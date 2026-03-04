# MindClone CLI — Plano Completo do Projeto

## 📋 Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura do Projeto](#2-arquitetura-do-projeto)
3. [Schema do JSON de Saída (Mind Profile)](#3-schema-do-json-de-saída-mind-profile)
4. [Sistema de Fases](#4-sistema-de-fases)
5. [Prompt Principal do Sistema (System Prompt)](#5-prompt-principal-do-sistema-system-prompt)
6. [Prompts Específicos por Fase](#6-prompts-específicos-por-fase)
7. [Motor de Perguntas e Regras](#7-motor-de-perguntas-e-regras)
8. [Fluxo da CLI](#8-fluxo-da-cli)
9. [Persistência e Continuidade](#9-persistência-e-continuidade)
10. [Sistema de Deepening (Aprofundamento Infinito)](#10-sistema-de-deepening-aprofundamento-infinito)
11. [Técnicas Psicológicas Utilizadas](#11-técnicas-psicológicas-utilizadas)
12. [Implementação Técnica](#12-implementação-técnica)
13. [Guia de Uso](#13-guia-de-uso)

---

## 1. Visão Geral

### Objetivo

Criar uma ferramenta CLI executável via `npx mindclone` que conduz uma conversa guiada por IA para mapear profundamente a mente, personalidade, valores, padrões cognitivos e comportamentais de um usuário. O resultado é um arquivo JSON estruturado que funciona como um "clone mental" utilizável como RAG em qualquer sistema de IA.

### Princípios Fundamentais

| Princípio           | Descrição                                                      |
| ------------------- | -------------------------------------------------------------- |
| **Profundidade**    | Ir além de respostas superficiais; buscar o "porquê do porquê" |
| **Não-ambiguidade** | Cada pergunta tem um objetivo claro e mensurável               |
| **Sequencialidade** | Cada pergunta é formulada com base nas respostas anteriores    |
| **Unicidade**       | Perfil exclusivo para cada ser humano                          |
| **Persistência**    | Zero perda de dados entre sessões                              |
| **Anti-alucinação** | IA só registra o que o usuário confirmou                       |
| **Progressividade** | Do superficial ao profundo, do concreto ao abstrato            |

---

## 2. Arquitetura do Projeto

### Estrutura de Diretórios

```
mindclone/
├── package.json
├── bin/
│   └── mindclone.js                  # Entry point da CLI
├── src/
│   ├── index.js                       # Orquestrador principal
│   ├── cli/
│   │   ├── interface.js               # UI do terminal (inquirer/chalk)
│   │   ├── menu.js                    # Menu principal
│   │   └── progress-bar.js            # Indicador de progresso
│   ├── ai/
│   │   ├── client.js                  # Cliente API (OpenAI/Anthropic)
│   │   ├── prompt-builder.js          # Construtor dinâmico de prompts
│   │   ├── context-manager.js         # Gerenciador de contexto/window
│   │   └── response-parser.js         # Parser de respostas da IA
│   ├── phases/
│   │   ├── phase-manager.js           # Controlador de fases
│   │   ├── phase-01-identity.js       # Identidade e contexto
│   │   ├── phase-02-lifestyle.js      # Estilo de vida e preferências
│   │   ├── phase-03-professional.js   # Perfil profissional
│   │   ├── phase-04-social.js         # Dinâmica social
│   │   ├── phase-05-personality.js    # Mapeamento de personalidade
│   │   ├── phase-06-emotional.js      # Paisagem emocional
│   │   ├── phase-07-values.js         # Valores e crenças
│   │   ├── phase-08-cognitive.js      # Arquitetura cognitiva
│   │   ├── phase-09-deep.js           # Psicologia profunda
│   │   └── phase-10-integration.js    # Integração e síntese
│   ├── deepening/
│   │   ├── deepening-engine.js        # Motor de aprofundamento
│   │   ├── contradiction-finder.js    # Detector de contradições
│   │   ├── gap-analyzer.js            # Analisador de lacunas
│   │   └── scenario-generator.js      # Gerador de cenários novos
│   ├── profile/
│   │   ├── profile-builder.js         # Construtor do perfil JSON
│   │   ├── profile-schema.js          # Schema de validação
│   │   ├── profile-scorer.js          # Pontuação de completude
│   │   └── profile-exporter.js        # Exportador final
│   ├── storage/
│   │   ├── local-store.js             # Persistência local
│   │   ├── session-manager.js         # Gerenciador de sessões
│   │   └── question-tracker.js        # Rastreador de perguntas feitas
│   ├── analysis/
│   │   ├── pattern-detector.js        # Detector de padrões
│   │   ├── consistency-checker.js     # Verificador de consistência
│   │   └── trait-inferrer.js          # Inferidor de traços
│   └── utils/
│       ├── logger.js
│       ├── config.js
│       └── validators.js
├── prompts/
│   ├── system-prompt.md               # Prompt principal do sistema
│   ├── phase-prompts/
│   │   ├── phase-01.md
│   │   ├── phase-02.md
│   │   └── ... (um por fase)
│   └── deepening-prompt.md            # Prompt de aprofundamento
├── data/                               # Gerado em runtime
│   └── profiles/
│       └── {user-id}/
│           ├── state.json              # Estado atual
│           ├── sessions/
│           │   ├── session-001.json
│           │   └── session-002.json
│           ├── raw-conversations/
│           │   └── phase-01-raw.json
│           ├── partial-profile.json    # Perfil parcial (atualizado a cada fase)
│           └── mind-profile.json       # Perfil final completo
└── README.md
```

### Dependências Principais

```json
{
  "name": "mindclone",
  "version": "1.0.0",
  "bin": {
    "mindclone": "./bin/mindclone.js"
  },
  "dependencies": {
    "openai": "^4.x",
    "@anthropic-ai/sdk": "^0.x",
    "inquirer": "^9.x",
    "chalk": "^5.x",
    "ora": "^7.x",
    "conf": "^12.x",
    "nanoid": "^5.x",
    "zod": "^3.x",
    "cli-progress": "^3.x",
    "figlet": "^1.x",
    "boxen": "^7.x"
  }
}
```

---

## 3. Schema do JSON de Saída (Mind Profile)

Este é o formato final do "clone mental". Cada campo é preenchido progressivamente ao longo das fases.

```json
{
  "meta": {
    "schema_version": "1.0.0",
    "profile_id": "uuid",
    "created_at": "ISO-8601",
    "updated_at": "ISO-8601",
    "total_sessions": 0,
    "total_questions_answered": 0,
    "completeness_score": 0.0,
    "completeness_by_area": {},
    "confidence_scores": {},
    "phases_completed": [],
    "deepening_sessions": 0,
    "last_phase": "",
    "language": "pt-BR"
  },

  "identity": {
    "full_name": "",
    "preferred_name": "",
    "age": null,
    "date_of_birth": "",
    "gender": "",
    "pronouns": "",
    "nationality": "",
    "ethnicity_cultural_background": "",
    "location": {
      "current_city": "",
      "current_country": "",
      "born_in": "",
      "places_lived": []
    },
    "languages": [{ "language": "", "proficiency": "", "is_native": false }],
    "family": {
      "marital_status": "",
      "partner_description": "",
      "children": [],
      "siblings": [],
      "relationship_with_parents": "",
      "family_dynamics_summary": "",
      "family_role": ""
    },
    "physical_self": {
      "self_description": "",
      "relationship_with_body": "",
      "health_conditions_relevant": []
    }
  },

  "personality": {
    "big_five": {
      "openness": {
        "score": null,
        "level": "",
        "facets": {
          "imagination": null,
          "artistic_interest": null,
          "emotionality": null,
          "adventurousness": null,
          "intellect": null,
          "liberalism": null
        },
        "evidence": []
      },
      "conscientiousness": {
        "score": null,
        "level": "",
        "facets": {
          "self_efficacy": null,
          "orderliness": null,
          "dutifulness": null,
          "achievement_striving": null,
          "self_discipline": null,
          "cautiousness": null
        },
        "evidence": []
      },
      "extraversion": {
        "score": null,
        "level": "",
        "facets": {
          "friendliness": null,
          "gregariousness": null,
          "assertiveness": null,
          "activity_level": null,
          "excitement_seeking": null,
          "cheerfulness": null
        },
        "evidence": []
      },
      "agreeableness": {
        "score": null,
        "level": "",
        "facets": {
          "trust": null,
          "morality": null,
          "altruism": null,
          "cooperation": null,
          "modesty": null,
          "sympathy": null
        },
        "evidence": []
      },
      "neuroticism": {
        "score": null,
        "level": "",
        "facets": {
          "anxiety": null,
          "anger": null,
          "depression": null,
          "self_consciousness": null,
          "immoderation": null,
          "vulnerability": null
        },
        "evidence": []
      }
    },
    "mbti_approximation": {
      "type": "",
      "dominant_function": "",
      "auxiliary_function": "",
      "confidence": null,
      "evidence": []
    },
    "enneagram_approximation": {
      "core_type": null,
      "wing": null,
      "tritype": "",
      "instinctual_variant": "",
      "evidence": []
    },
    "temperament": {
      "primary": "",
      "secondary": "",
      "description": ""
    },
    "cognitive_style": {
      "analytical_vs_intuitive": null,
      "detail_vs_big_picture": null,
      "sequential_vs_random": null,
      "verbal_vs_visual": null,
      "convergent_vs_divergent": null
    },
    "summary": ""
  },

  "emotional_profile": {
    "emotional_baseline": {
      "default_mood": "",
      "emotional_range": "",
      "emotional_intensity": "",
      "emotional_stability": ""
    },
    "emotional_intelligence": {
      "self_awareness": null,
      "self_regulation": null,
      "motivation": null,
      "empathy": null,
      "social_skills": null,
      "overall_eq": null
    },
    "attachment_style": {
      "primary": "",
      "secondary": "",
      "in_romantic_relationships": "",
      "in_friendships": "",
      "with_authority": "",
      "evidence": []
    },
    "emotional_triggers": [
      {
        "trigger": "",
        "emotional_response": "",
        "intensity": null,
        "typical_behavior": "",
        "recovery_time": ""
      }
    ],
    "coping_mechanisms": {
      "healthy": [],
      "unhealthy": [],
      "primary_defense_mechanisms": [],
      "under_stress": "",
      "under_grief": "",
      "under_conflict": "",
      "under_pressure": ""
    },
    "emotional_needs": [],
    "emotional_expression_style": ""
  },

  "values_and_beliefs": {
    "core_values": [{ "value": "", "importance": null, "why": "" }],
    "hierarchy_of_values": [],
    "worldview": {
      "summary": "",
      "optimist_vs_pessimist": null,
      "idealist_vs_realist": null,
      "individualist_vs_collectivist": null
    },
    "moral_foundations": {
      "care_harm": null,
      "fairness_cheating": null,
      "loyalty_betrayal": null,
      "authority_subversion": null,
      "sanctity_degradation": null,
      "liberty_oppression": null
    },
    "ethical_framework": "",
    "political_orientation": {
      "economic": "",
      "social": "",
      "summary": ""
    },
    "spiritual_religious": {
      "beliefs": "",
      "practices": "",
      "importance": null
    },
    "philosophical_stances": [],
    "non_negotiables": [],
    "things_tolerated_but_disliked": []
  },

  "cognitive_patterns": {
    "decision_making": {
      "style": "",
      "speed": "",
      "factors_prioritized": [],
      "analysis_paralysis_prone": false,
      "gut_vs_data": null,
      "regret_pattern": ""
    },
    "problem_solving": {
      "approach": "",
      "creativity_level": null,
      "persistence_level": null,
      "asks_for_help_when": "",
      "preferred_tools": []
    },
    "learning": {
      "style": "",
      "speed": "",
      "preferred_formats": [],
      "retention_strengths": "",
      "motivation_to_learn": ""
    },
    "cognitive_biases_prone": [{ "bias": "", "frequency": "", "context": "" }],
    "attention_patterns": {
      "focus_duration": "",
      "multitasking_ability": "",
      "distraction_triggers": [],
      "flow_state_triggers": []
    },
    "memory_patterns": {
      "strongest_memory_type": "",
      "nostalgic_tendency": null,
      "forgets_easily": []
    },
    "thinking_patterns": {
      "inner_monologue": "",
      "rumination_tendency": null,
      "catastrophizing_tendency": null,
      "black_white_thinking": null,
      "overthinking_tendency": null
    },
    "creativity": {
      "level": null,
      "expression_channels": [],
      "creative_process": ""
    },
    "risk_tolerance": {
      "financial": null,
      "physical": null,
      "social": null,
      "professional": null,
      "emotional": null
    }
  },

  "social_dynamics": {
    "social_energy": {
      "introversion_extraversion_spectrum": null,
      "social_battery_capacity": "",
      "recharge_method": "",
      "ideal_social_frequency": ""
    },
    "communication_style": {
      "primary_style": "",
      "assertiveness_level": null,
      "directness": null,
      "formality_preference": "",
      "humor_style": "",
      "listening_quality": null,
      "storytelling_tendency": null,
      "verbal_vs_written_preference": ""
    },
    "conflict_style": {
      "primary": "",
      "avoidance_tendency": null,
      "anger_expression": "",
      "forgiveness_pattern": "",
      "grudge_holding": null
    },
    "leadership_style": {
      "natural_tendency": "",
      "preferred_role_in_groups": "",
      "authority_relationship": ""
    },
    "trust_patterns": {
      "trust_speed": "",
      "trust_criteria": [],
      "betrayal_recovery": "",
      "vulnerability_comfort": null
    },
    "relationship_patterns": {
      "friendship_style": "",
      "romantic_style": "",
      "professional_relationships": "",
      "family_relationships": "",
      "attachment_in_practice": ""
    },
    "social_perception": {
      "how_they_think_others_see_them": "",
      "how_they_want_to_be_seen": "",
      "social_masks_used": [],
      "authenticity_level": null
    },
    "boundaries": {
      "setting_ability": null,
      "respecting_others": null,
      "common_boundary_issues": []
    },
    "influence_susceptibility": {
      "peer_pressure": null,
      "authority_influence": null,
      "social_media_influence": null,
      "independent_thinking": null
    }
  },

  "professional": {
    "current_role": "",
    "career_history": [],
    "industry": "",
    "expertise_areas": [],
    "skills": {
      "technical": [],
      "soft": [],
      "unique_combinations": []
    },
    "work_style": {
      "preferred_environment": "",
      "autonomy_need": null,
      "structure_need": null,
      "collaboration_preference": "",
      "deadline_behavior": "",
      "perfectionism_level": null,
      "work_life_balance_priority": null
    },
    "professional_identity": {
      "what_defines_them_professionally": "",
      "dream_role": "",
      "professional_values": [],
      "deal_breakers": []
    },
    "ambitions": {
      "short_term": [],
      "long_term": [],
      "ultimate_professional_goal": ""
    },
    "professional_strengths": [],
    "professional_weaknesses": [],
    "relationship_with_money": {
      "mindset": "",
      "spending_pattern": "",
      "saving_pattern": "",
      "financial_goals": "",
      "money_anxiety_level": null
    }
  },

  "interests_and_preferences": {
    "hobbies": [{ "hobby": "", "frequency": "", "skill_level": "", "meaning": "" }],
    "passions": [],
    "topics_of_fascination": [],
    "media": {
      "books": { "genres": [], "favorites": [], "reading_frequency": "" },
      "movies_series": { "genres": [], "favorites": [], "frequency": "" },
      "music": { "genres": [], "artists": [], "role_of_music": "" },
      "podcasts": { "topics": [], "favorites": [] },
      "games": { "types": [], "favorites": [] },
      "social_media": { "platforms": [], "usage_pattern": "", "content_consumed": "" }
    },
    "food": {
      "preferences": [],
      "restrictions": [],
      "relationship_with_food": "",
      "cooking_interest": ""
    },
    "travel": {
      "style": "",
      "favorite_destinations": [],
      "dream_destinations": [],
      "frequency": "",
      "motivation": ""
    },
    "aesthetics": {
      "style_preference": "",
      "color_preferences": [],
      "environment_preferences": "",
      "beauty_standards": ""
    },
    "technology": {
      "relationship": "",
      "adoption_speed": "",
      "preferences": [],
      "concerns": []
    }
  },

  "life_narrative": {
    "life_chapters": [
      {
        "period": "",
        "title": "",
        "summary": "",
        "key_events": [],
        "emotional_tone": "",
        "lessons_learned": []
      }
    ],
    "turning_points": [{ "event": "", "age": null, "impact": "", "before_after": "" }],
    "formative_experiences": [],
    "traumas_acknowledged": [],
    "proudest_moments": [],
    "deepest_regrets": [],
    "unresolved_issues": [],
    "life_philosophy_statement": "",
    "personal_mantras": [],
    "legacy_desire": ""
  },

  "behavioral_patterns": {
    "daily_routine": {
      "morning": "",
      "afternoon": "",
      "evening": "",
      "night": "",
      "consistency_level": ""
    },
    "habits": {
      "positive": [],
      "negative": [],
      "trying_to_build": [],
      "trying_to_break": []
    },
    "under_specific_conditions": {
      "when_stressed": "",
      "when_happy": "",
      "when_sad": "",
      "when_angry": "",
      "when_bored": "",
      "when_lonely": "",
      "when_overwhelmed": "",
      "when_excited": "",
      "when_afraid": "",
      "when_in_love": ""
    },
    "procrastination": {
      "level": null,
      "triggers": [],
      "strategies_used": []
    },
    "energy_patterns": {
      "peak_hours": "",
      "low_hours": "",
      "seasonal_patterns": ""
    },
    "consumption_patterns": {
      "impulse_vs_planned": null,
      "research_before_buying": null,
      "brand_loyalty": null
    }
  },

  "motivations_and_drives": {
    "core_motivations": [{ "motivation": "", "strength": null, "origin": "" }],
    "intrinsic_motivators": [],
    "extrinsic_motivators": [],
    "what_gets_them_out_of_bed": "",
    "what_keeps_them_up_at_night": "",
    "deepest_fears": [
      { "fear": "", "intensity": null, "rational_or_irrational": "", "origin": "" }
    ],
    "deepest_desires": [{ "desire": "", "intensity": null, "likelihood_of_pursuit": "" }],
    "life_goals": {
      "achieved": [],
      "in_progress": [],
      "future": [],
      "abandoned": []
    },
    "purpose_sense": {
      "has_clear_purpose": false,
      "purpose_statement": "",
      "meaning_sources": []
    },
    "self_actualization": {
      "current_level": "",
      "barriers": [],
      "growth_areas": []
    }
  },

  "self_concept": {
    "self_image": "",
    "self_esteem_level": null,
    "self_compassion_level": null,
    "ideal_self": "",
    "gap_real_vs_ideal": "",
    "identity_anchors": [],
    "insecurities": [{ "insecurity": "", "intensity": null, "coping": "" }],
    "confidence_areas": [],
    "inner_critic": {
      "intensity": null,
      "common_messages": [],
      "origin": ""
    },
    "self_awareness_level": null,
    "personal_growth_orientation": null,
    "relationship_with_past_self": "",
    "relationship_with_future_self": ""
  },

  "linguistic_and_expression_patterns": {
    "vocabulary_richness": "",
    "typical_sentence_structure": "",
    "formality_level": "",
    "emoji_usage": "",
    "humor_integration": "",
    "metaphor_tendency": "",
    "storytelling_style": "",
    "argumentation_style": "",
    "emotional_expression_in_text": "",
    "common_phrases_or_expressions": [],
    "language_quirks": [],
    "writing_vs_speaking_difference": ""
  },

  "synthesis": {
    "core_essence_paragraph": "",
    "in_three_words": [],
    "unique_combination": "",
    "primary_archetypes": [],
    "key_contradictions": [{ "contradiction": "", "explanation": "" }],
    "blind_spots_identified": [],
    "growth_edges": [],
    "prediction_patterns": {
      "how_they_would_react_to_good_news": "",
      "how_they_would_react_to_bad_news": "",
      "how_they_would_handle_a_crisis": "",
      "how_they_would_celebrate": "",
      "how_they_would_comfort_someone": "",
      "how_they_would_make_a_big_decision": ""
    },
    "rag_instruction": ""
  }
}
```

---

## 4. Sistema de Fases

### Visão Geral das Fases

```
┌─────────────────────────────────────────────────────────────┐
│                    JORNADA DO MINDCLONE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CAMADA SUPERFICIAL (Fatos)                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ FASE 1   │→ │ FASE 2   │→ │ FASE 3   │                   │
│  │Identidade│  │ Estilo   │  │Profissão │                   │
│  │& Contexto│  │ de Vida  │  │& Carreira│                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│       ↓                                                      │
│  CAMADA RELACIONAL (Como interage)                           │
│  ┌──────────┐  ┌──────────┐                                  │
│  │ FASE 4   │→ │ FASE 5   │                                  │
│  │ Dinâmica │  │Personali-│                                  │
│  │  Social  │  │  dade    │                                  │
│  └──────────┘  └──────────┘                                  │
│       ↓                                                      │
│  CAMADA EMOCIONAL (O que sente)                              │
│  ┌──────────┐  ┌──────────┐                                  │
│  │ FASE 6   │→ │ FASE 7   │                                  │
│  │Emocional │  │ Valores  │                                  │
│  │          │  │& Crenças │                                  │
│  └──────────┘  └──────────┘                                  │
│       ↓                                                      │
│  CAMADA PROFUNDA (Como pensa e por quê)                      │
│  ┌──────────┐  ┌──────────┐                                  │
│  │ FASE 8   │→ │ FASE 9   │                                  │
│  │Cognitiva │  │Psicologia│                                  │
│  │          │  │ Profunda │                                  │
│  └──────────┘  └──────────┘                                  │
│       ↓                                                      │
│  INTEGRAÇÃO                                                  │
│  ┌──────────┐       ┌─────────────────┐                      │
│  │ FASE 10  │  ───→ │  DEEPENING ∞    │                      │
│  │Integração│  ←─── │ (repetível)     │                      │
│  └──────────┘       └─────────────────┘                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### FASE 1 — Identidade e Contexto Fundacional

**Objetivo:** Estabelecer quem é a pessoa no nível factual. Criar rapport e confiança.
**Duração:** 15-25 perguntas
**Preenche no JSON:** `identity.*`

| Área              | Exemplo de Perguntas                                    |
| ----------------- | ------------------------------------------------------- |
| Nome              | "Qual seu nome completo? Como prefere ser chamado(a)?"  |
| Idade/Nascimento  | "Qual sua idade?"                                       |
| Localização       | "Onde você mora atualmente? Onde nasceu?"               |
| Família           | "Qual sua situação familiar atual? Tem filhos? Irmãos?" |
| Idiomas           | "Quais idiomas você fala?"                              |
| Contexto cultural | "Qual sua formação cultural/étnica?"                    |

**Regras desta fase:**

- Perguntas 100% factuais, sem interpretação
- Tom acolhedor e leve
- Estabelecer a base de confiança
- Não fazer inferências ainda

**Critério de transição:** Todos os campos de `identity` preenchidos com pelo menos 80% de completude.

---

### FASE 2 — Estilo de Vida e Preferências

**Objetivo:** Entender o dia-a-dia, gostos, hábitos e rotinas.
**Duração:** 20-30 perguntas
**Preenche no JSON:** `interests_and_preferences.*`, `behavioral_patterns.daily_routine`, `behavioral_patterns.habits`

| Área       | Exemplo de Perguntas                                            |
| ---------- | --------------------------------------------------------------- |
| Rotina     | "Descreva um dia típico seu, do momento que acorda até dormir." |
| Hobbies    | "O que você faz no seu tempo livre?"                            |
| Mídia      | "Que tipo de conteúdo você consome? Livros, séries, podcasts?"  |
| Comida     | "Qual sua relação com comida? Cozinha? Tem restrições?"         |
| Viagem     | "Gosta de viajar? Que tipo de viagem?"                          |
| Tecnologia | "Como é sua relação com tecnologia?"                            |

**Regras desta fase:**

- Perguntas abertas sobre preferências
- Identificar padrões iniciais de comportamento
- Começar a notar o que a pessoa enfatiza (indica valores)
- Registrar linguagem usada (para padrões linguísticos)

**Critério de transição:** Mínimo 70% dos campos de preferências e rotina preenchidos.

---

### FASE 3 — Perfil Profissional

**Objetivo:** Mapear carreira, habilidades, estilo de trabalho, ambições.
**Duração:** 15-25 perguntas
**Preenche no JSON:** `professional.*`

| Área               | Exemplo de Perguntas                                            |
| ------------------ | --------------------------------------------------------------- |
| Carreira           | "O que você faz profissionalmente? Como chegou até aqui?"       |
| Habilidades        | "Quais são suas maiores habilidades técnicas e interpessoais?"  |
| Estilo de trabalho | "Você prefere trabalhar sozinho ou em equipe? Por quê?"         |
| Ambições           | "Onde você se vê profissionalmente em 5 anos?"                  |
| Dinheiro           | "Como é sua relação com dinheiro?"                              |
| Satisfação         | "Numa escala de 1 a 10, quão satisfeito está com sua carreira?" |

**Regras desta fase:**

- Conectar com informações da Fase 1 (ex: localização afeta carreira?)
- Começar a usar "por quê?" para ir mais fundo
- Identificar motivações profissionais vs. pessoais

---

### FASE 4 — Dinâmica Social

**Objetivo:** Entender como a pessoa se relaciona com outros.
**Duração:** 20-30 perguntas
**Preenche no JSON:** `social_dynamics.*`

| Área             | Técnica  | Exemplo                                                              |
| ---------------- | -------- | -------------------------------------------------------------------- |
| Energia social   | Escala   | "Depois de uma festa, você se sente energizado ou drenado?"          |
| Comunicação      | Cenário  | "Se um amigo faz algo que te incomoda, como você aborda isso?"       |
| Conflito         | Cenário  | "Num desentendimento com seu chefe, qual seria sua reação imediata?" |
| Confiança        | Projeção | "Quanto tempo leva para você confiar plenamente em alguém?"          |
| Limites          | Direto   | "Você tem facilidade em dizer 'não'?"                                |
| Percepção social | Espelho  | "Como você acha que as pessoas te descrevem?"                        |

**Regras desta fase:**

- Usar cenários específicos, não abstratos
- Cruzar com dados da Fase 1 (dinâmica familiar = padrão relacional?)
- Começar a usar perguntas de "sim ou não" seguidas de "por quê?"

---

### FASE 5 — Mapeamento de Personalidade

**Objetivo:** Mapear Big Five, MBTI aproximado, Eneagrama, temperamento.
**Duração:** 25-35 perguntas
**Preenche no JSON:** `personality.*`

**Técnica: Avaliação indireta via cenários**

Para cada dimensão do Big Five, usar 5 cenários contrastantes:

**Openness (Abertura):**

```
"Você prefere férias planejadas com roteiro definido ou ir sem plano
e descobrir no caminho?"

"Quando encontra uma ideia que contradiz algo que você acredita,
sua primeira reação é curiosidade ou desconforto?"

"Com que frequência você busca experiências completamente novas?"
```

**Conscientiousness (Conscienciosidade):**

```
"Sua mesa/espaço de trabalho tende a ser organizado ou caótico?"

"Se você tem um prazo em 2 semanas, quando começa a trabalhar nisso?"

"Você faz listas de tarefas? Com que frequência as segue?"
```

**Extraversion (Extroversão):**

```
"Em uma reunião com 10 pessoas, você tende a falar primeiro
ou observar antes?"

"Quantas vezes por semana você sente necessidade de interagir
socialmente?"

"Você prefere trabalhar em silêncio ou com pessoas ao redor?"
```

**Agreeableness (Agradabilidade):**

```
"Se você discorda da maioria em um grupo, você expressa
sua opinião ou evita o conflito?"

"Quando alguém te pede um favor que te prejudicaria, o que faz?"

"Você tende a dar o benefício da dúvida às pessoas?"
```

**Neuroticism (Neuroticismo):**

```
"Com que frequência você se preocupa com coisas que ainda
não aconteceram?"

"Quando algo dá errado, quanto tempo leva para você se recuperar
emocionalmente?"

"Você diria que suas emoções são intensas ou moderadas?"
```

**Regras desta fase:**

- NUNCA perguntar diretamente "você é introvertido?"
- Sempre usar cenários concretos para inferir traços
- Cada cenário deve ter uma escala implícita
- Cruzar respostas com comportamentos relatados nas fases anteriores
- Registrar contradições para explorar na Fase 10

---

### FASE 6 — Paisagem Emocional

**Objetivo:** Mapear padrões emocionais, triggers, mecanismos de defesa, estilo de apego.
**Duração:** 20-30 perguntas
**Preenche no JSON:** `emotional_profile.*`

| Dimensão | Técnica  | Exemplo                                                                                             |
| -------- | -------- | --------------------------------------------------------------------------------------------------- |
| Baseline | Escala   | "No geral, como você descreveria seu estado emocional médio?"                                       |
| Triggers | Cenário  | "O que te irrita profundamente, mesmo que pareça pequeno para outros?"                              |
| Apego    | História | "Me conta sobre um momento em que você se sentiu verdadeiramente seguro emocionalmente com alguém." |
| Coping   | Reflexão | "Quando está passando por um momento muito difícil, qual é a primeira coisa que você faz?"          |
| Defesas  | Projeção | "Quando alguém te critica, qual sua reação automática antes de pensar?"                             |
| IE       | Cenário  | "Se um colega começa a chorar no trabalho, o que você sentiria e faria?"                            |

**Técnicas psicológicas aplicadas:**

- Identificação de mecanismos de defesa (projeção, racionalização, negação, humor, sublimação)
- Padrões de apego (seguro, ansioso, evitativo, desorganizado)
- Regulação emocional (supressão vs. reavaliação cognitiva)

---

### FASE 7 — Valores e Crenças

**Objetivo:** Mapear o sistema de valores, visão de mundo, ética.
**Duração:** 15-25 perguntas
**Preenche no JSON:** `values_and_beliefs.*`

| Área            | Técnica     | Exemplo                                                                                |
| --------------- | ----------- | -------------------------------------------------------------------------------------- |
| Valores core    | Priorização | "Se pudesse ensinar apenas 3 coisas aos seus filhos (ou a uma criança), quais seriam?" |
| Moral           | Dilema      | "Se encontrasse uma carteira com R$5000 e identidade, o que faria?"                    |
| Política        | Escala      | "Em questões sociais, você se considera mais progressista ou conservador?"             |
| Ética           | Cenário     | "Você mentiria para proteger alguém que ama?"                                          |
| Propósito       | Aberta      | "O que dá significado à sua vida?"                                                     |
| Espiritualidade | Aberta      | "Qual sua relação com espiritualidade ou religião?"                                    |

**Técnica: Moral Foundations Theory (Jonathan Haidt)**
Usar cenários que medem cada fundação moral:

- Cuidado/Dano
- Justiça/Trapaça
- Lealdade/Traição
- Autoridade/Subversão
- Santidade/Degradação
- Liberdade/Opressão

---

### FASE 8 — Arquitetura Cognitiva

**Objetivo:** Como a pessoa pensa, decide, resolve problemas, aprende.
**Duração:** 20-30 perguntas
**Preenche no JSON:** `cognitive_patterns.*`

| Área         | Técnica  | Exemplo                                                                                          |
| ------------ | -------- | ------------------------------------------------------------------------------------------------ |
| Decisão      | Cenário  | "Você precisa escolher entre 2 empregos: um paga mais, outro te realiza mais. Como você decide?" |
| Problema     | Processo | "Descreva como você aborda um problema complexo que nunca enfrentou antes."                      |
| Aprendizado  | Reflexão | "Como você aprende melhor? Me dê um exemplo concreto."                                           |
| Vieses       | Detecção | "Você já mudou de opinião sobre algo importante? O que causou a mudança?"                        |
| Atenção      | Escala   | "Quanto tempo consegue se concentrar sem distração?"                                             |
| Risco        | Cenário  | "Te oferecem um investimento com 50% de chance de triplicar e 50% de perder tudo. Aceita?"       |
| Criatividade | Tarefa   | "Se pedisse para resolver [problema inusitado], como abordaria?"                                 |

**Técnicas de neuropsicologia aplicadas:**

- Avaliação de funções executivas (planejamento, flexibilidade, inibição)
- Padrões de pensamento (linear vs. associativo)
- Metacognição (consciência dos próprios processos de pensamento)
- Heurísticas predominantes

---

### FASE 9 — Psicologia Profunda

**Objetivo:** Motivações inconscientes, medos, desejos, autoconceito, narrativa de vida.
**Duração:** 25-35 perguntas
**Preenche no JSON:** `motivations_and_drives.*`, `self_concept.*`, `life_narrative.*`

| Área            | Técnica     | Exemplo                                                                           |
| --------------- | ----------- | --------------------------------------------------------------------------------- |
| Medo            | Projetiva   | "Se pudesse eliminar um medo da sua vida, qual seria?"                            |
| Desejo          | Projetiva   | "Se não existissem limitações, o que você estaria fazendo agora?"                 |
| Autoconceito    | Espelho     | "Se seu melhor amigo descrevesse quem você realmente é, o que diria?"             |
| Sombra          | Reflexão    | "Qual característica em outras pessoas te irrita mais? (geralmente é um espelho)" |
| Legado          | Existencial | "Como você gostaria de ser lembrado?"                                             |
| Arrependimento  | Narrativa   | "Qual decisão na sua vida você mais reconsiderou?"                                |
| Propósito       | Existencial | "Você sente que está vivendo a vida que deveria viver?"                           |
| Crítico interno | Diálogo     | "Quando você falha, o que a voz na sua cabeça diz?"                               |

**Técnicas aplicadas:**

- Análise junguiana (sombra, persona, self)
- Logoterapia (Viktor Frankl — busca de sentido)
- Psicologia existencial (autenticidade, liberdade, responsabilidade)
- Técnicas projetivas adaptadas para texto
- Entrevista motivacional

**Regras desta fase:**

- Máxima sensibilidade — o usuário pode se emocionar
- Oferecer opção de pular perguntas desconfortáveis
- Validar emoções antes de prosseguir
- Não forçar profundidade — ela deve emergir naturalmente

---

### FASE 10 — Integração e Síntese

**Objetivo:** Cruzar todas as informações, resolver contradições, preencher lacunas, gerar síntese.
**Duração:** 15-25 perguntas
**Preenche no JSON:** `synthesis.*`, lacunas em qualquer seção

**Ações:**

1. **Detecção de Contradições**

   ```
   "Na Fase 2 você disse que valoriza espontaneidade, mas na Fase 5
   suas respostas indicaram alta conscienciosidade e planejamento.
   Como você explicaria isso?"
   ```

2. **Preenchimento de Lacunas**

   ```
   "Percebi que não exploramos muito sobre [área].
   Pode me contar mais sobre isso?"
   ```

3. **Validação de Inferências**

   ```
   "Baseado em tudo que conversamos, eu diria que você é uma pessoa
   que [inferência]. Isso ressoa com você?"
   ```

4. **Síntese Narrativa**
   ```
   "Se eu tivesse que descrever você em um parágrafo para alguém
   que nunca te conheceu, escreveria: [síntese].
   Mudaria algo?"
   ```

---

## 5. Prompt Principal do Sistema (System Prompt)

````markdown
# SYSTEM PROMPT — MINDCLONE AI ENGINE

## IDENTIDADE

Você é o MindClone Engine, um sistema avançado de mapeamento psicológico
e cognitivo. Você combina expertise de:

- Psicologia clínica (abordagens: cognitivo-comportamental, psicodinâmica, humanista)
- Neuropsicologia (funções executivas, padrões cognitivos)
- Psicologia da personalidade (Big Five, teorias de traços)
- Psicologia social (dinâmicas de grupo, influência social)
- Entrevista motivacional (técnica de Rogers + Miller & Rollnick)
- Análise comportamental aplicada

Seu objetivo é conduzir uma conversa profunda e empática para construir
o perfil psicológico mais completo possível de um ser humano.

## REGRAS ABSOLUTAS (NUNCA VIOLAR)

### Sobre Perguntas:

1. Faça APENAS UMA pergunta por vez
2. NUNCA repita uma pergunta já feita (consulte o histórico fornecido)
3. NUNCA faça perguntas ambíguas ou com dupla interpretação
4. NUNCA faça perguntas que assumam algo não confirmado pelo usuário
5. Cada pergunta DEVE ter um objetivo claro mapeado a um campo do perfil
6. Adapte a linguagem ao nível de comunicação do usuário
7. Perguntas devem ser progressivas: do concreto ao abstrato
8. Alterne entre tipos: sim/não, escala, cenário, aberta, reflexiva
9. Após respostas curtas, faça follow-up para aprofundar
10. Após respostas longas, valide o entendimento antes de prosseguir

### Sobre Análise:

11. NUNCA infira algo que o usuário não disse ou confirmou
12. Registre APENAS fatos confirmados e respostas diretas
13. Quando fizer inferências, SEMPRE valide com o usuário
14. Mantenha separados: fatos vs. inferências vs. hipóteses
15. Se detectar contradição, explore-a com curiosidade, não julgamento
16. NUNCA diagnostique condições psicológicas
17. NUNCA faça juízo de valor sobre respostas

### Sobre Tom:

18. Seja caloroso mas profissional
19. Use o nome preferido do usuário
20. Valide emoções quando surgirem
21. Ofereça opção de pular perguntas sensíveis
22. Celebre quando o usuário compartilhar algo profundo
23. Mantenha curiosidade genuína
24. Evite ser robótico ou formulaico

### Sobre Estrutura:

25. Siga a fase atual rigorosamente
26. Não pule para fases futuras prematuramente
27. Transicione entre temas de forma natural
28. Use respostas anteriores para formular próximas perguntas
29. Ao final de cada bloco de 5-7 perguntas, faça um micro-resumo

## FORMATO DE RESPOSTA

Cada resposta sua DEVE seguir EXATAMENTE este formato JSON interno
(invisível ao usuário):

```json
{
  "internal_analysis": {
    "response_interpretation": "como interpreto a resposta do usuário",
    "traits_detected": ["lista de traços identificados"],
    "confidence": 0.0-1.0,
    "profile_updates": {
      "campo.subcampo": "valor inferido"
    },
    "contradictions_found": [],
    "follow_up_needed": true/false,
    "phase_progress": 0-100
  },
  "visible_response": {
    "acknowledgment": "validação da resposta",
    "transition": "frase de transição natural",
    "question": "a próxima pergunta",
    "question_type": "yes_no|scale|scenario|open|reflective|projective",
    "target_field": "campo do JSON que esta pergunta visa preencher",
    "skip_option": true/false
  }
}
```
````

O que o usuário vê é APENAS o conteúdo de `visible_response` formatado
como conversa natural.

## CONTEXTO DINÂMICO

A cada chamada, você receberá:

1. A fase atual e seus objetivos
2. O perfil parcial construído até agora
3. Lista completa de perguntas já feitas
4. Lista de campos ainda vazios no perfil
5. Contradições detectadas até agora
6. A última resposta do usuário

## FLUXO DE PERGUNTAS POR FASE

### Fase Atual: {PHASE_NUMBER} — {PHASE_NAME}

### Objetivos: {PHASE_OBJECTIVES}

### Campos Alvo: {TARGET_FIELDS}

### Perguntas Já Feitas: {ASKED_QUESTIONS}

### Perfil Atual: {CURRENT_PROFILE}

### Contradições: {CONTRADICTIONS}

## TÉCNICAS DE ENTREVISTA A USAR

### 1. Funil (do geral ao específico)

"O que você faz no tempo livre?" → "Você mencionou leitura.
Que tipo de livro?" → "Por que esse gênero te atrai?"

### 2. Espelhamento

Repetir elementos-chave da resposta para demonstrar escuta ativa.

### 3. Cenário Contrastante

"Prefere A ou B?" seguido de "Por que A e não B?"

### 4. Projeção Segura

"Se um amigo estivesse na situação X, que conselho daria?"
(revela valores sem exposição direta)

### 5. Escala Ancorada

"De 1 a 10, sendo 1 [extremo concreto] e 10 [outro extremo concreto],
onde você se coloca?"

### 6. Pergunta Milagrosa (adaptada de terapia breve)

"Se amanhã tudo estivesse exatamente como você quer,
o que seria diferente?"

### 7. Exceção

"Quando foi a última vez que [padrão identificado] NÃO aconteceu?
O que foi diferente?"

### 8. Circularidade

"Como [pessoa importante] descreveria você nessa situação?"

### 9. Externalização

"Se sua ansiedade/medo/hábito fosse um personagem, como seria?"

### 10. Linha do Tempo

"Você sempre foi assim ou houve um momento em que mudou?"

## ANTI-ALUCINAÇÃO CHECKLIST

Antes de registrar qualquer informação no perfil:
☐ O usuário disse isso explicitamente?
☐ Ou é uma inferência minha?
☐ Se inferência, foi validada com o usuário?
☐ A informação é consistente com o restante do perfil?
☐ Se inconsistente, isso foi explorado?

````

---

## 6. Prompts Específicos por Fase

### Prompt Injetor por Fase

Cada fase adiciona um bloco ao system prompt:

```markdown
### FASE 1 — INJEÇÃO DE CONTEXTO

Você está na FASE 1: IDENTIDADE E CONTEXTO FUNDACIONAL.

OBJETIVO: Estabelecer a base factual sobre quem é esta pessoa.
Esta é a primeira interação. Priorize:
- Criar rapport (conexão empática)
- Fazer perguntas leves e factuais
- NÃO tentar ir fundo ainda — é cedo demais
- Coletar dados demográficos e contextuais

SEQUÊNCIA SUGERIDA (adapte conforme conversa):
1. Nome e como prefere ser chamado
2. Idade
3. Onde mora / de onde é
4. Situação familiar (estado civil, filhos, irmãos)
5. Com quem mora
6. Idiomas que fala
7. Background cultural
8. Algo que queira compartilhar sobre si mesmo de cara

CAMPOS ALVO:
- identity.full_name
- identity.preferred_name
- identity.age
- identity.location.*
- identity.family.*
- identity.languages
- identity.ethnicity_cultural_background

ABERTURA SUGERIDA:
"Olá! Sou o MindClone, e vou te ajudar a criar um mapa profundo
de quem você é. Vamos começar com calma — me conta, qual é o
seu nome e como prefere ser chamado?"

TRANSIÇÃO PARA FASE 2:
Quando identity.* estiver 80%+ preenchido:
"Agora que sei um pouco sobre quem você é, quero entender
como é seu dia a dia. Vamos lá?"
````

```markdown
### FASE 5 — INJEÇÃO DE CONTEXTO

Você está na FASE 5: MAPEAMENTO DE PERSONALIDADE.

OBJETIVO: Mapear os traços de personalidade usando cenários,
NÃO perguntas diretas.

MÉTODO: Para cada dimensão do Big Five, use 3-5 cenários
contrastantes. NUNCA pergunte "você é extrovertido?" —
em vez disso, crie situações que revelem isso.

IMPORTANTE: Use as informações já coletadas para personalizar
os cenários. Se a pessoa trabalha com tecnologia, use cenários
do mundo tech. Se tem filhos, use cenários parentais.

PERFIL PARCIAL ATUAL: {current_profile}

EXEMPLO DE PERSONALIZAÇÃO:
Se identity.professional.current_role = "desenvolvedor":
❌ "Numa festa, você puxa conversa?"
✅ "Num meetup de tech com 50 pessoas, você tende a se aproximar
de grupos ou espera que venham até você?"

CAMPOS ALVO:

- personality.big_five.\* (cada faceta)
- personality.cognitive_style.\*
- personality.temperament.\*
- personality.mbti_approximation.\*

REGRAS ESPECIAIS:

- Cada cenário deve testar UMA dimensão/faceta
- Registrar evidência textual para cada pontuação
- Scores são relativos (0.0-1.0), não absolutos
- Quando houver dúvida, criar cenário adicional para mesma dimensão
```

```markdown
### FASE 9 — INJEÇÃO DE CONTEXTO

Você está na FASE 9: PSICOLOGIA PROFUNDA.

OBJETIVO: Explorar motivações inconscientes, medos fundamentais,
desejos profundos, autoconceito e narrativa de vida.

⚠️ ALERTA DE SENSIBILIDADE: Esta é a fase mais delicada.

DIRETRIZES ESPECIAIS:

1. Antes de cada pergunta profunda, normalize:
   "Essa é uma pergunta mais profunda, sinta-se livre para
   responder como quiser ou pular."
2. Valide emoções: "Obrigado por compartilhar isso, não é fácil."
3. Não force: se o usuário resistir, respeite e aborde por
   ângulo diferente depois.
4. Use técnicas projetivas: "Se isso acontecesse com um amigo..."
5. Conecte com todo o histórico: "Lá no início você mencionou X,
   e agora percebo que..."

TÉCNICAS PRIORITÁRIAS:

- Pergunta Milagrosa
- Análise de Sombra (o que irrita nos outros)
- Exercício de Legado
- Exploração do Crítico Interno
- Mapeamento de Medos Fundamentais (rejeição, abandono,
  inadequação, perda de controle, insignificância)

CAMPOS ALVO:

- motivations_and_drives.\*
- self_concept.\*
- life_narrative.\*
- emotional_profile.coping_mechanisms.primary_defense_mechanisms
```

---

## 7. Motor de Perguntas e Regras

### Taxonomia de Perguntas

```
┌────────────────────────────────────────────────────────┐
│              TIPOS DE PERGUNTA                          │
├────────────────┬───────────────────────────────────────┤
│ TIPO           │ QUANDO USAR                           │
├────────────────┼───────────────────────────────────────┤
│ Sim/Não        │ Confirmar fatos ou inferências        │
│ Escala (1-10)  │ Medir intensidade de um traço         │
│ Cenário        │ Revelar comportamento em contexto     │
│ Aberta         │ Explorar sem direcionar               │
│ Reflexiva      │ Provocar metacognição                 │
│ Projetiva      │ Acessar conteúdo emocional seguro     │
│ Priorização    │ Revelar hierarquia de valores         │
│ Dilema         │ Testar limites éticos/morais          │
│ Contrastante   │ Definir posição em espectro           │
│ Temporal       │ Entender mudança ao longo do tempo    │
│ Follow-up      │ Aprofundar resposta anterior          │
│ Validação      │ Confirmar inferência com o usuário    │
└────────────────┴───────────────────────────────────────┘
```

### Regras de Sequenciamento

```python
# Pseudocódigo do motor de perguntas

def next_question(phase, profile, history, last_response):

    # 1. Verificar se a última resposta precisa de follow-up
    if needs_followup(last_response):
        return generate_followup(last_response)

    # 2. Verificar campos vazios prioritários da fase atual
    empty_fields = get_empty_fields(phase, profile)

    # 3. Selecionar próximo campo alvo
    target_field = prioritize_field(empty_fields, phase.sequence)

    # 4. Verificar se já fizemos pergunta sobre esse campo
    if has_asked_about(target_field, history):
        target_field = next_priority(empty_fields)

    # 5. Escolher tipo de pergunta adequado
    question_type = select_type(target_field, phase, profile)

    # 6. Personalizar com base no perfil existente
    context = extract_relevant_context(profile, target_field)

    # 7. Gerar pergunta
    question = generate_question(
        target_field=target_field,
        question_type=question_type,
        context=context,
        avoid=history.all_questions
    )

    # 8. Verificar ambiguidade
    if is_ambiguous(question):
        question = clarify(question)

    return question
```

### Regras Anti-Repetição

```json
{
  "question_tracker": {
    "questions_asked": [
      {
        "id": "q001",
        "phase": 1,
        "session": 1,
        "question_text": "Qual seu nome completo?",
        "target_field": "identity.full_name",
        "response": "João Silva",
        "timestamp": "ISO-8601",
        "follow_ups": ["q002"]
      }
    ],
    "fields_covered": {
      "identity.full_name": {
        "covered": true,
        "confidence": 1.0,
        "question_ids": ["q001"]
      }
    },
    "topics_explored": [
      {
        "topic": "nome",
        "depth": "surface",
        "questions_count": 1
      }
    ]
  }
}
```

**Regra de não-repetição:**

1. Antes de gerar qualquer pergunta, o prompt recebe `questions_asked[]`
2. A IA é instruída: "As seguintes perguntas JÁ FORAM FEITAS. Não repita nenhuma, nem reformulada."
3. Após receber a pergunta gerada, o sistema verifica similaridade semântica com perguntas anteriores
4. Se similaridade > 0.85, rejeita e pede nova pergunta

---

## 8. Fluxo da CLI

### Menu Principal

```
╔══════════════════════════════════════╗
║          🧠 MINDCLONE v1.0          ║
║     Clone sua mente em JSON         ║
╠══════════════════════════════════════╣
║                                      ║
║  1. 🆕 Novo Perfil                   ║
║  2. ▶️  Continuar Perfil Existente    ║
║  3. 📊 Ver Progresso                 ║
║  4. 📁 Exportar Perfil               ║
║  5. 🔍 Ver Perfil Atual              ║
║  6. ⚙️  Configurações                ║
║  7. ❌ Sair                          ║
║                                      ║
╚══════════════════════════════════════╝
```

### Fluxo de Nova Sessão

```
1. Usuário seleciona "Novo Perfil" ou "Continuar"
2. Se novo: pede API key (OpenAI/Anthropic), salva em config local
3. Se continuar: lista perfis existentes, seleciona
4. Mostra status:

   ┌──────────────────────────────────────┐
   │ Perfil: João Silva                    │
   │ Fase Atual: 3/10 (Profissional)       │
   │ Completude: 28%                       │
   │ Perguntas respondidas: 47             │
   │ Sessões anteriores: 2                 │
   │ Tempo total: 1h 23min                 │
   │                                        │
   │ █████████░░░░░░░░░░░░░░░░░░░░ 28%     │
   └──────────────────────────────────────┘

   Deseja continuar de onde parou? (s/n)

5. Carrega estado, inicia conversa
6. A cada resposta:
   - Salva resposta raw
   - Atualiza perfil parcial
   - Atualiza question_tracker
   - Mostra progresso discretamente

7. Usuário pode a qualquer momento:
   - Digitar /pause → salva e sai
   - Digitar /skip → pula pergunta
   - Digitar /status → mostra progresso
   - Digitar /back → revisa última resposta
   - Digitar /export → exporta perfil atual

8. Ao final de cada fase:
   - Salva estado completo
   - Gera partial-profile.json atualizado
   - Mostra resumo da fase
   - Pergunta se quer continuar ou pausar
```

### Tela de Conversa

```
╭─────────────────────────────────────────────╮
│  🧠 MindClone — Fase 3: Perfil Profissional │
│  Progresso: ████████░░░░░░ 58%               │
╰─────────────────────────────────────────────╯

  🤖 MindClone:
  Você mencionou que trabalha com desenvolvimento de software
  há 8 anos. O que te atraiu para essa área inicialmente?

  👤 Você:
  > Sempre gostei de resolver problemas e criar coisas.
    Programar me dá essa sensação de construir algo do zero.

  🤖 MindClone:
  Interessante — esse impulso de "construir do zero" aparece
  em outras áreas da sua vida também, ou é mais específico
  do trabalho?

  👤 Você:
  > _

  [/pause] [/skip] [/status]
```

---

## 9. Persistência e Continuidade

### Estrutura de Salvamento Local

```
~/.mindclone/
├── config.json                    # API keys, preferências
└── profiles/
    └── joao-silva-a1b2c3/
        ├── state.json             # Estado completo atual
        ├── partial-profile.json   # Perfil em construção
        ├── question-tracker.json  # Todas as perguntas feitas
        ├── contradictions.json    # Contradições detectadas
        ├── sessions/
        │   ├── session-001.json   # Sessão completa 1
        │   ├── session-002.json   # Sessão completa 2
        │   └── session-003.json
        └── exports/
            └── mind-profile-v1.json  # Exportação final
```

### state.json

```json
{
  "profile_id": "joao-silva-a1b2c3",
  "current_phase": 3,
  "current_phase_progress": 58,
  "overall_progress": 28,
  "last_question_id": "q047",
  "last_session_id": "session-002",
  "phases_status": {
    "phase_01": { "status": "completed", "score": 95 },
    "phase_02": { "status": "completed", "score": 88 },
    "phase_03": { "status": "in_progress", "score": 58 },
    "phase_04": { "status": "pending", "score": 0 },
    "phase_05": { "status": "pending", "score": 0 },
    "phase_06": { "status": "pending", "score": 0 },
    "phase_07": { "status": "pending", "score": 0 },
    "phase_08": { "status": "pending", "score": 0 },
    "phase_09": { "status": "pending", "score": 0 },
    "phase_10": { "status": "pending", "score": 0 }
  },
  "deepening_sessions": 0,
  "total_questions": 47,
  "total_time_minutes": 83,
  "created_at": "2024-01-15T10:30:00Z",
  "last_activity": "2024-01-16T14:22:00Z"
}
```

### Estratégia de Contexto por Sessão

Para evitar exceder limites de token e manter contexto:

```
Cada chamada à API inclui:
├── System Prompt (fixo, ~2000 tokens)
├── Phase Prompt (variável, ~500 tokens)
├── Perfil Parcial Atual (~1000-3000 tokens, comprimido)
├── Lista de Perguntas Já Feitas (~500-1000 tokens, resumida)
├── Contradições Detectadas (~200 tokens)
├── Últimas 10 interações da sessão atual (~1500 tokens)
└── Última resposta do usuário (~200 tokens)

Total estimado por chamada: ~6000-8000 tokens de input
```

**Estratégia de compressão de contexto:**

1. Perfil parcial: incluir apenas campos preenchidos
2. Perguntas feitas: incluir apenas IDs + resumo de 1 linha cada
3. Conversas anteriores: resumir em bullet points, não transcrição completa
4. Manter apenas as 10 últimas mensagens como conversa raw

---

## 10. Sistema de Deepening (Aprofundamento Infinito)

### Como Funciona

Após completar as 10 fases, o usuário pode iniciar sessões de **Deepening** ilimitadas. Cada sessão:

1. **Analisa o perfil completo**
2. **Identifica áreas com baixa confiança** (confidence < 0.7)
3. **Detecta contradições não resolvidas**
4. **Encontra lacunas** (campos importantes vazios ou superficiais)
5. **Gera novos cenários** baseados no perfil existente
6. **Nunca repete perguntas** anteriores

### Prompt de Deepening

```markdown
# DEEPENING SESSION #{session_number}

Você tem o perfil completo deste usuário (anexo).
Esta é uma sessão de APROFUNDAMENTO.

SUAS TAREFAS:

1. Identifique as 3 áreas com MENOR confiança no perfil
2. Identifique contradições NÃO RESOLVIDAS
3. Identifique padrões que PARECEM existir mas não foram confirmados
4. Crie cenários NOVOS e ÚNICOS baseados no perfil para testar hipóteses

RESTRIÇÕES:

- Perguntas já feitas (lista anexa): NÃO REPITA NENHUMA
- Use conhecimento acumulado para fazer perguntas MAIS PRECISAS
- Vá MAIS FUNDO nos temas já explorados
- Conecte áreas diferentes (ex: "seu padrão de decisão profissional
  parece similar ao seu padrão em relacionamentos — concorda?")

EXEMPLOS DE DEEPENING:

- "Na sessão 2 você disse que é organizado, mas depois mencionou
  que procrastina. Quando exatamente a procrastinação vence?"
- "Você se descreveu como lógico, mas suas decisões de carreira
  parecem muito emocionais. O que pensa sobre isso?"
- "Se eu fosse criar uma IA que se comporta como você em reuniões,
  que 3 regras ela precisaria seguir?"

NOVOS CENÁRIOS A EXPLORAR:

- Cenários éticos mais complexos (dilemas do trolley personalizados)
- Cenários de perda e ganho inesperado
- Cenários de conflito entre valores identificados
- Cenários de identidade (e se você não fosse [profissão]?)
- Cenários hipotéticos extremos (ilha deserta, último dia,
  viagem no tempo)
```

### Motor de Detecção de Gaps

```javascript
// Pseudocódigo do gap analyzer
function analyzeGaps(profile) {
  const gaps = [];

  // 1. Campos vazios ou nulos
  for (const field of ALL_FIELDS) {
    if (profile[field] === null || profile[field] === "") {
      gaps.push({
        field,
        type: "empty",
        priority: FIELD_PRIORITY[field],
      });
    }
  }

  // 2. Campos com baixa confiança
  for (const [field, confidence] of Object.entries(profile.meta.confidence_scores)) {
    if (confidence < 0.7) {
      gaps.push({
        field,
        type: "low_confidence",
        current_confidence: confidence,
        priority: "high",
      });
    }
  }

  // 3. Campos com evidência insuficiente
  for (const trait of PERSONALITY_TRAITS) {
    if (profile.personality[trait].evidence.length < 3) {
      gaps.push({
        field: `personality.${trait}`,
        type: "insufficient_evidence",
        current_evidence_count: profile.personality[trait].evidence.length,
        priority: "medium",
      });
    }
  }

  // 4. Contradições não resolvidas
  for (const contradiction of profile.meta.contradictions) {
    if (!contradiction.resolved) {
      gaps.push({
        field: contradiction.fields,
        type: "unresolved_contradiction",
        priority: "high",
      });
    }
  }

  return gaps.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}
```

---

## 11. Técnicas Psicológicas Utilizadas

### Mapa de Técnicas por Fase

| Fase | Técnica                               | Origem                    | Objetivo                             |
| ---- | ------------------------------------- | ------------------------- | ------------------------------------ |
| 1    | Rapport Building                      | Rogers (1957)             | Criar confiança e abertura           |
| 2    | Análise de Padrões Comportamentais    | Behaviorismo              | Identificar hábitos e rotinas        |
| 3    | Entrevista Estruturada                | Psic. Organizacional      | Mapear competências e motivações     |
| 4    | Sociometria Indireta                  | Moreno (1934)             | Mapear redes e dinâmicas sociais     |
| 5    | Inventário Implícito de Personalidade | Costa & McCrae (NEO-PI-R) | Big Five sem questionário direto     |
| 5    | Avaliação por Cenários                | Assessment Center         | Revelar traços em contexto           |
| 6    | Regulação Emocional                   | Gross (2002)              | Mapear estratégias emocionais        |
| 6    | Teoria do Apego                       | Bowlby/Ainsworth          | Identificar estilo de apego          |
| 6    | Mecanismos de Defesa                  | Anna Freud / Vaillant     | Identificar defesas primárias        |
| 7    | Moral Foundations Theory              | Haidt (2012)              | Mapear bases morais                  |
| 7    | Schwartz Values Theory                | Schwartz (1992)           | Hierarquia de valores                |
| 8    | Avaliação de Funções Executivas       | Neuropsicologia           | Mapear processos cognitivos          |
| 8    | Heurísticas e Vieses                  | Kahneman/Tversky          | Identificar padrões de decisão       |
| 9    | Análise Junguiana                     | Jung                      | Sombra, persona, individuação        |
| 9    | Logoterapia                           | Frankl (1946)             | Busca de sentido                     |
| 9    | Psicologia Existencial                | Yalom (1980)              | Temas existenciais fundamentais      |
| 9    | Técnicas Projetivas Adaptadas         | TAT/Rorschach (adaptado)  | Acesso ao inconsciente via narrativa |
| 10   | Análise de Discurso                   | Linguística/Psicologia    | Padrões linguísticos e de pensamento |
| 10   | Entrevista Motivacional               | Miller & Rollnick         | Explorar ambivalências               |
| D\*  | Teste de Consistência                 | Psicometria               | Validar confiabilidade do perfil     |

\*D = Deepening

### Detalhamento das Técnicas-Chave

#### Big Five — Avaliação Indireta

Em vez de usar um questionário padrão (OCEAN), cada faceta é avaliada através de **cenários comportamentais** personalizados:

```
FACETA: Openness → Adventurousness (Aventurosidade)

Cenário personalizado (para dev de software, 32 anos, SP):
"Surge uma oportunidade de trabalhar 6 meses em uma startup
em Berlim. Você não fala alemão, nunca morou fora, e teria
que deixar seu apartamento. Qual seria sua reação imediata
— e depois de pensar por 24h?"

Análise:
- Reação imediata = tendência natural
- Após 24h = processo deliberativo
- Fatores mencionados = hierarquia de valores
- Emoção predominante = nível de abertura à experiência
```

#### Estilo de Apego — Identificação Indireta

```
CENÁRIOS DE APEGO:

Apego Seguro:
"Quando seu parceiro(a) precisa de espaço, como você se sente?"
Resposta típica seguro: "Normal, todo mundo precisa de espaço."

Apego Ansioso:
"Se alguém importante demora para responder sua mensagem,
o que passa pela sua cabeça?"
Resposta típica ansioso: "Fico pensando se fiz algo errado."

Apego Evitativo:
"Quando alguém quer ter uma conversa 'profunda sobre a relação',
qual sua reação?"
Resposta típica evitativo: "Prefiro resolver na prática,
não ficar falando sobre sentimentos."
```

#### Mecanismos de Defesa — Detecção

```
DEFESA: Racionalização
Indicador: Resposta lógica excessiva para pergunta emocional
"Como se sentiu quando [evento doloroso]?"
→ "Faz parte da vida, todo mundo passa por isso."

DEFESA: Projeção
Indicador: Atribuir a outros o que é próprio
"O que mais te irrita nas pessoas?"
→ O conteúdo da irritação geralmente espelha sombra pessoal

DEFESA: Humor
Indicador: Deflexão com piada em momento sério
"Como você lida com rejeição?"
→ "Ah, já me acostumei, sou rejeição-proof haha"

DEFESA: Intelectualização
Indicador: Análise abstrata evitando sentimento
"O que sentiu no divórcio?"
→ "Estatisticamente, 50% dos casamentos terminam assim."
```

---

## 12. Implementação Técnica

### Fluxo de Dados

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐
│ USUÁRIO │────→│ CLI INTERFACE │────→│ PROMPT      │
│ (input) │     │ (inquirer)   │     │ BUILDER     │
└─────────┘     └──────────────┘     └──────┬──────┘
                                            │
                    ┌───────────────────────┐│
                    │ CONTEXTO:             ││
                    │ - System Prompt       ││
                    │ - Phase Prompt        ││
                    │ - Perfil Parcial      │├──→ API (LLM)
                    │ - Question History    ││       │
                    │ - Contradições        ││       │
                    │ - Última resposta     ││       ▼
                    └───────────────────────┘│ ┌─────────────┐
                                            │ │ RESPONSE    │
                    ┌───────────────────────┐│ │ PARSER      │
                    │                       │◄─┤             │
                    ▼                       │  └─────────────┘
              ┌──────────┐                  │
              │ PROFILE  │  ┌───────────┐   │
              │ BUILDER  │──│ LOCAL     │   │
              │          │  │ STORAGE   │   │
              └──────────┘  └───────────┘   │
                    │                        │
                    ▼                        │
              ┌──────────┐                  │
              │ QUESTION │                  │
              │ TRACKER  │──────────────────┘
              └──────────┘
```

### Algoritmo Principal

```javascript
// src/index.js - Pseudocódigo do loop principal

async function runSession(profileId) {
  // 1. Carregar estado
  const state = await storage.loadState(profileId);
  const profile = await storage.loadProfile(profileId);
  const tracker = await storage.loadTracker(profileId);
  const contradictions = await storage.loadContradictions(profileId);

  // 2. Determinar fase atual
  const currentPhase = phases.getPhase(state.current_phase);

  // 3. Construir prompt base
  const systemPrompt = promptBuilder.buildSystem();
  const phasePrompt = promptBuilder.buildPhase(currentPhase, profile);

  // 4. Loop de conversa
  let sessionActive = true;
  const sessionLog = [];

  while (sessionActive) {
    // 4a. Construir contexto completo
    const context = contextManager.build({
      systemPrompt,
      phasePrompt,
      profile: profileBuilder.compress(profile),
      askedQuestions: tracker.getSummary(),
      contradictions: contradictions.getUnresolved(),
      recentConversation: sessionLog.slice(-10),
      emptyFields: profileBuilder.getEmptyFields(currentPhase, profile),
    });

    // 4b. Enviar para IA
    const aiResponse = await aiClient.send(context);

    // 4c. Parsear resposta
    const parsed = responseParser.parse(aiResponse);

    // 4d. Mostrar ao usuário
    cli.display(parsed.visible_response);

    // 4e. Aguardar input
    const userInput = await cli.getInput();

    // 4f. Verificar comandos especiais
    if (userInput.startsWith("/")) {
      const result = await handleCommand(userInput, state, profile);
      if (result.exit) {
        sessionActive = false;
        continue;
      }
      continue;
    }

    // 4g. Registrar no tracker
    tracker.addQuestion({
      id: generateId(),
      phase: state.current_phase,
      question: parsed.visible_response.question,
      target_field: parsed.visible_response.target_field,
      response: userInput,
      timestamp: new Date().toISOString(),
    });

    // 4h. Atualizar perfil com análise da IA
    if (parsed.internal_analysis.profile_updates) {
      profileBuilder.applyUpdates(profile, parsed.internal_analysis.profile_updates);
    }

    // 4i. Registrar contradições
    if (parsed.internal_analysis.contradictions_found.length > 0) {
      contradictions.add(parsed.internal_analysis.contradictions_found);
    }

    // 4j. Salvar log da sessão
    sessionLog.push(
      {
        role: "assistant",
        content: parsed.visible_response,
      },
      {
        role: "user",
        content: userInput,
      }
    );

    // 4k. Verificar transição de fase
    if (parsed.internal_analysis.phase_progress >= 90) {
      const shouldTransition = await checkPhaseTransition(currentPhase, profile, tracker);
      if (shouldTransition) {
        state.current_phase++;
        cli.showPhaseTransition(state.current_phase);
      }
    }

    // 4l. Auto-save a cada interação
    await storage.saveAll(profileId, { state, profile, tracker, contradictions });
  }

  // 5. Salvar sessão completa
  await storage.saveSession(profileId, sessionLog);

  // 6. Gerar/atualizar perfil parcial
  await profileBuilder.generatePartialProfile(profile, profileId);
}
```

### Gerenciamento de Contexto (Window Management)

```javascript
// src/ai/context-manager.js

class ContextManager {
  constructor(maxTokens = 8000) {
    this.maxTokens = maxTokens;
  }

  build({
    systemPrompt,
    phasePrompt,
    profile,
    askedQuestions,
    contradictions,
    recentConversation,
    emptyFields,
  }) {
    const messages = [];
    let tokenCount = 0;

    // 1. System Prompt (sempre incluído, ~2000 tokens)
    messages.push({
      role: "system",
      content: systemPrompt,
    });
    tokenCount += this.estimateTokens(systemPrompt);

    // 2. Phase Prompt (sempre incluído, ~500 tokens)
    messages.push({
      role: "system",
      content: phasePrompt,
    });
    tokenCount += this.estimateTokens(phasePrompt);

    // 3. Perfil comprimido (prioridade alta)
    const compressedProfile = this.compressProfile(profile);
    messages.push({
      role: "system",
      content: `PERFIL ATUAL DO USUÁRIO:\n${JSON.stringify(compressedProfile, null, 2)}`,
    });
    tokenCount += this.estimateTokens(JSON.stringify(compressedProfile));

    // 4. Perguntas já feitas (resumo)
    const questionSummary = this.summarizeQuestions(askedQuestions);
    messages.push({
      role: "system",
      content: `PERGUNTAS JÁ FEITAS (NÃO REPITA):\n${questionSummary}`,
    });
    tokenCount += this.estimateTokens(questionSummary);

    // 5. Contradições (se houver)
    if (contradictions.length > 0) {
      messages.push({
        role: "system",
        content: `CONTRADIÇÕES DETECTADAS:\n${JSON.stringify(contradictions)}`,
      });
    }

    // 6. Campos vazios prioritários
    messages.push({
      role: "system",
      content: `CAMPOS AINDA VAZIOS (priorize):\n${emptyFields.join("\n")}`,
    });

    // 7. Conversa recente (últimas N mensagens que cabem)
    const remainingTokens = this.maxTokens - tokenCount - 500; // margem
    const recentMessages = this.fitConversation(recentConversation, remainingTokens);
    messages.push(...recentMessages);

    return messages;
  }

  compressProfile(profile) {
    // Remove campos null/empty para economizar tokens
    return JSON.parse(
      JSON.stringify(profile, (key, value) => {
        if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
          return undefined;
        }
        return value;
      })
    );
  }

  summarizeQuestions(questions) {
    // Resumir cada pergunta em 1 linha
    return questions
      .map((q) => `[${q.id}] ${q.question.substring(0, 80)}... → ${q.target_field}`)
      .join("\n");
  }
}
```

---

## 13. Guia de Uso

### Instalação e Primeiro Uso

```bash
# Execução direta (sem instalação)
npx mindclone

# Ou instalação global
npm install -g mindclone
mindclone
```

### Primeira Execução

```
$ npx mindclone

╔══════════════════════════════════════════╗
║           🧠 MINDCLONE v1.0             ║
║     Mapeamento Profundo de Mente        ║
╠══════════════════════════════════════════╣

Bem-vindo ao MindClone!

Para funcionar, preciso de uma API key de IA.

? Qual provedor deseja usar?
  ❯ OpenAI (GPT-4)
    Anthropic (Claude)

? Cole sua API key: sk-...

✅ API key configurada e salva localmente.

? O que deseja fazer?
  ❯ 🆕 Criar novo perfil mental
    ⚙️  Configurações
```

### Sessão Típica

```
╭─────────────────────────────────────────────╮
│  🧠 MindClone — Fase 1: Identidade          │
│  Progresso geral: ░░░░░░░░░░░░░░░░░░░░ 0%   │
╰─────────────────────────────────────────────╯

🤖 Olá! Sou o MindClone e vou te ajudar a criar
   um mapa completo de quem você é. Esse processo
   acontece em fases, e você pode pausar a qualquer
   momento digitando /pause.

   Vamos começar pelo básico — qual é o seu nome
   e como prefere ser chamado?

👤 > Meu nome é João Pedro da Silva, pode me chamar de JP.

🤖 Prazer, JP! Quantos anos você tem?

👤 > 32

🤖 E onde você mora atualmente? É de lá mesmo
   ou veio de outro lugar?

👤 > Moro em São Paulo, mas nasci em Belo Horizonte.
     Vim pra cá com 22 pra trabalhar.

🤖 Legal, 10 anos em SP! Mora sozinho ou com alguém?

👤 > Com minha esposa, a Mariana. Temos um cachorro,
     o Thor.

🤖 Boa, JP! Tem filhos ou é algo nos planos?

👤 > Ainda não, mas queremos ter um nos próximos 2 anos.

   [... conversa continua ...]

🤖 ──────────────────────────────────
   📊 Resumo da Fase 1:

   ✅ Nome: João Pedro da Silva (JP)
   ✅ Idade: 32 anos
   ✅ Localização: SP (nasceu em BH)
   ✅ Família: casado com Mariana, sem filhos
   ✅ Idiomas: Português, Inglês

   Completude da fase: 92%

   Vamos para a Fase 2? Quero conhecer seu dia a dia!
   ──────────────────────────────────
```

### Exportação

```bash
$ npx mindclone --export joao-silva

📁 Exportando perfil de João Pedro da Silva (JP)...

✅ Arquivo gerado: ./mindclone-jp-2024-01-16.json

   📊 Estatísticas:
   - Completude: 87%
   - Confiança média: 0.82
   - Perguntas respondidas: 203
   - Sessões: 8
   - Tempo total: 4h 12min
   - Contradições resolvidas: 5/7

   ⚠️ Áreas com baixa confiança:
   - cognitive_patterns.cognitive_biases (0.45)
   - self_concept.inner_critic (0.52)

   💡 Recomendação: Execute mais 1-2 sessões de
      deepening para melhorar essas áreas.
```

### Uso do JSON como RAG

O `mind-profile.json` exportado inclui no campo `synthesis.rag_instruction` um texto pronto para ser usado como contexto em qualquer LLM:

```json
{
  "synthesis": {
    "rag_instruction": "Você está interagindo com/representando João Pedro (JP), 32 anos, desenvolvedor de software em São Paulo. JP é uma pessoa predominantemente analítica (Big Five: Openness 0.78, Conscientiousness 0.65, Extraversion 0.42, Agreeableness 0.71, Neuroticism 0.38). Ele toma decisões de forma deliberada, pesando prós e contras, mas tem forte intuição que usa como 'validador final'. É introvertido social mas extrovertido intelectual — adora debates de ideias mas precisa de tempo sozinho para recarregar. Seus valores centrais são: autonomia, honestidade intelectual e crescimento contínuo. Sob estresse, tende a se isolar e racionalizar emoções. Comunica-se de forma direta mas gentil, usa humor seco, evita conflitos desnecessários mas defende suas posições quando importam. Seu maior medo é estagnação; sua maior motivação é construir algo significativo. Em relacionamentos, tem apego seguro com tendência ansiosa em momentos de incerteza. Decide rápido em questões técnicas, devagar em questões pessoais. Linguagem: vocabulário rico, tom informal-profissional, usa metáforas técnicas, pouco emoji, frases estruturadas. Para representá-lo fielmente: seja analítico mas não frio, curioso mas não invasivo, direto mas educado, e sempre considere múltiplas perspectivas antes de dar uma opinião."
  }
}
```

---

## Resumo de Comandos da CLI

| Comando                          | Ação                            |
| -------------------------------- | ------------------------------- |
| `npx mindclone`                  | Inicia o programa               |
| `npx mindclone --continue`       | Continua último perfil          |
| `npx mindclone --export <id>`    | Exporta perfil como JSON        |
| `npx mindclone --list`           | Lista perfis existentes         |
| `npx mindclone --status <id>`    | Mostra status de um perfil      |
| `npx mindclone --deepening <id>` | Inicia sessão de aprofundamento |
| `npx mindclone --reset <id>`     | Reseta um perfil                |
| `/pause`                         | Pausa e salva sessão atual      |
| `/skip`                          | Pula pergunta atual             |
| `/status`                        | Mostra progresso inline         |
| `/back`                          | Revisa última resposta          |
| `/export`                        | Exporta perfil atual            |
| `/phase`                         | Mostra fase atual e objetivos   |

---

## Checklist de Qualidade do Perfil Final

```
☐ Todos os 15 blocos do JSON têm pelo menos 70% de preenchimento
☐ Big Five tem pelo menos 3 evidências por dimensão
☐ Estilo de apego foi inferido por pelo menos 5 cenários diferentes
☐ Valores core foram priorizados (ranking, não apenas lista)
☐ Contradições foram exploradas e documentadas
☐ O campo synthesis.core_essence_paragraph foi validado pelo usuário
☐ O campo synthesis.rag_instruction foi gerado e é coerente
☐ Padrões comportamentais têm exemplos concretos
☐ Medos e motivações profundas foram explorados com técnicas projetivas
☐ O perfil é ÚNICO — não poderia descrever outra pessoa
```

---

_Este documento serve como blueprint completo para implementação do MindClone CLI. Cada seção é auto-contida e pode ser implementada incrementalmente._

# Melhorias — MindClone CLI

---

## 1. Segurança, Privacidade e Ética

### 🔴 Criticidade: ALTA — O projeto lida com os dados mais sensíveis que existem

### 1.1 Criptografia Local

O perfil psicológico de uma pessoa é mais sensível que dados bancários. Hoje o projeto salva tudo em JSON puro legível.

```
PROBLEMA:
~/.mindclone/profiles/joao/mind-profile.json
→ Qualquer pessoa/processo com acesso ao filesystem lê TUDO

SOLUÇÃO:
├── Criptografar todos os arquivos em repouso (AES-256)
├── Pedir passphrase ao abrir perfil (derivar chave com Argon2)
├── Opção de biometria no macOS (Touch ID via Keychain)
├── Limpar dados sensíveis da memória RAM após uso
└── Nunca logar dados do perfil em console/debug
```

```javascript
// Adicionar ao projeto
const dependencies = {
  "sodium-native": "^4.x", // Criptografia
  keytar: "^7.x", // OS keychain integration
  "@noble/ciphers": "^0.x", // AES-256-GCM
};

// Fluxo
// 1. Primeira vez: usuário cria passphrase
// 2. Derivar chave com Argon2id
// 3. Cada save: encrypt(JSON.stringify(data), key)
// 4. Cada load: JSON.parse(decrypt(data, key))
// 5. Passphrase fica em memória SÓ durante sessão
```

### 1.2 Consentimento Informado e Disclaimers

```
FALTA NO PROJETO:
- Termo de consentimento antes de começar
- Aviso de que NÃO é terapia/diagnóstico
- Explicação de onde os dados ficam armazenados
- Aviso sobre envio de dados para API externa (OpenAI/Anthropic)
- Direito de deletar tudo a qualquer momento
```

**Tela sugerida antes da primeira sessão:**

```
╔══════════════════════════════════════════════╗
║           ⚠️  ANTES DE COMEÇAR               ║
╠══════════════════════════════════════════════╣
║                                              ║
║  1. Isto NÃO é terapia nem diagnóstico       ║
║     psicológico. É uma ferramenta de          ║
║     autoconhecimento assistida por IA.        ║
║                                              ║
║  2. Suas respostas serão enviadas para a      ║
║     API da [OpenAI/Anthropic] para            ║
║     processamento. Revise a política de       ║
║     privacidade deles.                        ║
║                                              ║
║  3. O perfil gerado fica salvo APENAS no      ║
║     seu computador, criptografado.            ║
║                                              ║
║  4. Você pode pular qualquer pergunta,        ║
║     pausar ou deletar tudo a qualquer         ║
║     momento.                                  ║
║                                              ║
║  5. Se alguma pergunta causar desconforto      ║
║     significativo, considere conversar com    ║
║     um profissional de saúde mental.          ║
║                                              ║
║  ? Você leu e concorda? (s/n)                 ║
╚══════════════════════════════════════════════╝
```

### 1.3 Protocolo de Crise Emocional

```
CENÁRIO: Usuário revela ideação suicida, abuso, autolesão,
ou demonstra sofrimento agudo durante a sessão.

FALTA: Qualquer menção a isso no plano original.

SOLUÇÃO — Adicionar ao system prompt:
```

```markdown
## PROTOCOLO DE SEGURANÇA EMOCIONAL

Se o usuário expressar ou indicar:

- Ideação suicida ou autolesão
- Situação de abuso (sofrido ou praticado)
- Crise emocional aguda
- Dissociação ou confusão severa

AÇÃO IMEDIATA:

1. PARE o fluxo de perguntas
2. Valide o sentimento: "Obrigado por confiar em mim com isso."
3. NÃO tente ser terapeuta
4. Apresente recursos:
   "Eu não sou um profissional de saúde mental, mas existem
   pessoas que podem te ajudar agora:
   - CVV: 188 (24h, gratuito)
   - CAPS mais próximo
   - Ligue para alguém de confiança"
5. Pergunte se deseja continuar, pausar, ou encerrar
6. Registre internamente (SEM detalhes) que houve gatilho
7. Nas perguntas seguintes, reduza profundidade emocional
```

### 1.4 Sanitização de Dados Enviados à API

```
PROBLEMA:
O perfil parcial é enviado inteiro para a API.
Se o usuário compartilhou algo extremamente pessoal
(trauma, segredo, dado médico), isso vai para servidores
da OpenAI/Anthropic.

SOLUÇÕES:
├── Modo "local-first": processar o que puder localmente
├── Categorizar campos por sensibilidade
├── Opção de redact campos sensíveis antes do envio
├── Mostrar ao usuário O QUE será enviado à API
└── Opção de usar LLM local (Ollama/llama.cpp)
```

```javascript
// Adicionar suporte a LLMs locais
const providers = {
  openai: {
    /* ... */
  },
  anthropic: {
    /* ... */
  },
  ollama: {
    // NOVO
    baseUrl: "http://localhost:11434",
    models: ["llama3.1", "mistral", "mixtral"],
    privacy: "total", // Nada sai da máquina
  },
  lmstudio: {
    // NOVO
    baseUrl: "http://localhost:1234",
    privacy: "total",
  },
};
```

---

## 2. Vieses e Precisão Psicológica

### 2.1 Detecção de Viés de Desejabilidade Social

As pessoas **mentem inconscientemente** para parecerem melhores. O projeto não trata disso.

```
PROBLEMA:
"Você é preconceituoso?" → 99% responde "não"
"Você é empático?" → 95% responde "sim"

SOLUÇÃO: Perguntas de calibração e detecção
```

**Adicionar ao prompt do sistema:**

```markdown
## DETECÇÃO DE VIÉS DE DESEJABILIDADE SOCIAL

Algumas respostas do usuário podem estar enviesadas pelo desejo
de parecer bem. Indicadores:

1. Respostas SEMPRE positivas sobre si mesmo
2. Nunca admite falhas ou defeitos
3. Respostas que contradizem comportamentos relatados
4. Respostas vagas em tópicos sensíveis
5. Respostas "de livro" vs. respostas autênticas

ESTRATÉGIAS DE MITIGAÇÃO:

- Use perguntas indiretas em vez de diretas para temas sensíveis
  ❌ "Você é tolerante com diferenças?"
  ✅ "Conte sobre a última vez que conviveu com alguém
  MUITO diferente de você. O que foi difícil?"
- Peça exemplos concretos e específicos
  ❌ "Você é empático?"
  ✅ "Me conte uma situação recente em que alguém próximo
  estava sofrendo. O que você fez concretamente?"

- Use perguntas normalizadoras
  ✅ "Todo mundo tem preconceitos inconscientes.
  Qual você acha que é o seu?"

- Compare auto-relato com comportamento
  Se disse ser paciente MAS relatou irritação frequente no trânsito,
  registrar a contradição.

CAMPO NO PERFIL:
Adicionar meta.social_desirability_score (0.0-1.0)
Quanto mais alto, mais as respostas parecem enviesadas.
```

### 2.2 Viés de Humor Momentâneo

```
PROBLEMA:
Se a pessoa responde num dia ruim, o perfil fica enviesado
para negativo. Se num dia ótimo, enviesado para positivo.

SOLUÇÃO:
```

```json
{
  "session_context": {
    "mood_at_start": "",
    "mood_at_end": "",
    "energy_level": "",
    "time_of_day": "",
    "day_of_week": "",
    "notable_events_today": "",
    "stress_level": ""
  }
}
```

**Adicionar perguntas de calibração no início de CADA sessão:**

```
🤖 "Antes de continuarmos, como você está se sentindo
    hoje numa escala de 1 a 10?"

🤖 "Aconteceu algo notável hoje que pode estar
    influenciando como você se sente?"

🤖 "Você diria que hoje é um dia típico para você?"
```

**Uso:** Respostas dadas em dias atípicos recebem `confidence` menor e são re-validadas em sessões futuras.

### 2.3 Viés Cultural dos Frameworks Psicológicos

```
PROBLEMA:
Big Five, MBTI, Eneagrama, Teoria de Apego — todos foram
desenvolvidos em contextos WEIRD (Western, Educated,
Industrialized, Rich, Democratic).

Uma pessoa japonesa pode pontuar "baixo em assertividade"
não porque é pouco assertiva, mas porque assertividade
se expressa diferente na cultura dela.

SOLUÇÃO:
```

**Adicionar ao sistema:**

```markdown
## CALIBRAÇÃO CULTURAL

Ao analisar traços de personalidade, SEMPRE considerar:

1. O background cultural do usuário (já coletado na Fase 1)
2. Normas culturais que podem influenciar expressão de traços
3. Que introversão em SP ≠ introversão em Tóquio ≠ em NYC

REGRA: Registrar traços sempre como RELATIVOS ao contexto
cultural do usuário, não em termos absolutos universais.

Adicionar ao perfil:
"personality.cultural_calibration": {
"cultural_context": "brasileiro, urbano, classe média",
"norms_considered": [
"expressividade emocional alta é norma cultural",
"contato físico frequente é norma social",
"hierarquia profissional mais flexível que média global"
],
"traits_possibly_inflated_by_culture": [],
"traits_possibly_deflated_by_culture": []
}
```

---

## 3. Análise Implícita (Metadados Comportamentais)

### 3.1 Análise de Latência de Resposta

```
INSIGHT ENORME QUE ESTÁ FALTANDO:
O TEMPO que a pessoa leva para responder revela tanto
quanto a resposta em si.

- Resposta rápida (< 5s) → Certeza, tema confortável,
  resposta automática
- Resposta moderada (5-30s) → Reflexão, tema que requer
  pensamento
- Resposta lenta (> 30s) → Conflito interno, desconforto,
  assunto complexo ou doloroso
- Resposta editada várias vezes → Perfeccionismo,
  preocupação com imagem
```

```javascript
// Medir tempo de resposta
const startTime = Date.now();
const userInput = await cli.getInput();
const responseTime = Date.now() - startTime;

tracker.addQuestion({
  // ... campos existentes
  response_time_ms: responseTime,
  response_length: userInput.length,
  chars_per_second: userInput.length / (responseTime / 1000),
});
```

**Adicionar ao perfil:**

```json
{
  "meta": {
    "behavioral_metadata": {
      "average_response_time_ms": 0,
      "fastest_topics": [],
      "slowest_topics": [],
      "response_time_by_phase": {},
      "average_response_length": 0,
      "verbosity_trend": "increasing|stable|decreasing",
      "topics_with_longest_responses": [],
      "topics_with_shortest_responses": []
    }
  }
}
```

**Uso no prompt de análise:**

```markdown
## METADADOS DE RESPOSTA

Considerar como evidência ADICIONAL (não primária):

- Respostas muito rápidas em temas emocionais podem indicar
  evitação ou resposta ensaiada
- Respostas muito lentas em temas simples podem indicar
  conflito interno
- Aumento de verbosidade = tema de interesse/conforto
- Diminuição de verbosidade = desconforto ou desinteresse

ÚLTIMA RESPOSTA:

- Tempo: {response_time}ms
- Comprimento: {response_length} caracteres
- Comparado à média do usuário: {comparison}
```

### 3.2 Análise Linguística Automática

```
O JEITO QUE A PESSOA ESCREVE revela personalidade.
Isso pode ser analisado SEM perguntar.
```

**Adicionar módulo de análise linguística:**

```javascript
// src/analysis/linguistic-analyzer.js

class LinguisticAnalyzer {
  analyze(allResponses) {
    return {
      // Complexidade
      average_sentence_length: this.avgSentenceLength(allResponses),
      vocabulary_diversity: this.typeTokenRatio(allResponses),
      use_of_subordinate_clauses: this.subordinateRatio(allResponses),

      // Emocionalidade
      emotion_words_ratio: this.emotionWordRatio(allResponses),
      positive_negative_ratio: this.sentimentRatio(allResponses),
      hedging_frequency: this.hedgingFrequency(allResponses),
      // "talvez", "acho que", "não sei" → insegurança ou humildade

      // Cognição
      causal_words: this.countPatterns(allResponses, ["porque", "portanto", "logo"]),
      // Alto = pensamento causal/analítico

      certainty_words: this.countPatterns(allResponses, ["sempre", "nunca", "certamente"]),
      // Alto = pensamento absoluto/black-white

      tentative_words: this.countPatterns(allResponses, ["talvez", "possivelmente", "depende"]),
      // Alto = pensamento nuançado ou indeciso

      // Social
      i_vs_we_ratio: this.pronounRatio(allResponses),
      // Alto "eu" = individualista, alto "nós" = coletivista

      other_references: this.otherPeopleReferences(allResponses),
      // Muitas referências a outros = socialmente orientado

      // Estilo
      formality_score: this.formalityScore(allResponses),
      humor_attempts: this.humorDetection(allResponses),
      metaphor_frequency: this.metaphorFrequency(allResponses),
      emoji_usage: this.emojiAnalysis(allResponses),
      exclamation_frequency: this.exclamationRate(allResponses),
      question_frequency: this.questionRate(allResponses),
    };
  }
}
```

**Alimenta automaticamente:**

```json
{
  "linguistic_and_expression_patterns": {
    "auto_detected": {
      "source": "linguistic_analysis_engine",
      "confidence": 0.7,
      "data": {
        /* resultados acima */
      }
    },
    "user_confirmed": {
      /* dados validados pelo usuário */
    }
  }
}
```

---

## 4. Validação e Precisão do Perfil

### 4.1 Perguntas de Calibração Cruzada

```
PROBLEMA:
Como saber se o perfil é PRECISO e não apenas coerente?
Coerência ≠ Verdade.

SOLUÇÃO: Cross-validation dentro da mesma pessoa
```

**Técnica: Perguntar a mesma coisa de 3 formas diferentes em momentos diferentes**

```
SESSÃO 1, FASE 5:
"Numa reunião com 10 pessoas, você tende a falar
primeiro ou observar?"

SESSÃO 3, FASE 4:
"Me conta sobre a última reunião de trabalho que
participou. O que você fez?"

SESSÃO 5, DEEPENING:
"Se eu estivesse invisível numa reunião sua,
o que eu veria você fazendo?"

→ Se as 3 respostas convergem: confidence = alta
→ Se divergem: explorar a divergência
```

**Adicionar ao schema:**

```json
{
  "meta": {
    "cross_validation": {
      "identity.extraversion": {
        "data_points": [
          { "question_id": "q023", "indicates": 0.35, "session": 1 },
          { "question_id": "q089", "indicates": 0.42, "session": 3 },
          { "question_id": "q156", "indicates": 0.38, "session": 5 }
        ],
        "convergence_score": 0.92,
        "final_value": 0.38,
        "confidence": 0.92
      }
    }
  }
}
```

### 4.2 Validação por Terceiros (Opcional)

```
FUNCIONALIDADE ADICIONAL PODEROSA:

Permitir que o usuário CONVIDE alguém de confiança
(parceiro, amigo próximo, irmão) para responder
SOBRE ELE.

"Como [nome] reagiria se..." — respondido pelo terceiro.

Comparar auto-percepção vs. percepção do outro.
```

```
$ npx mindclone --external-view joao-silva

🔗 Gerando link de validação externa...

Envie este link para alguém que te conhece bem:
https://mindclone.dev/validate/abc123

Essa pessoa responderá ~15 perguntas sobre você.
As respostas serão comparadas com seu auto-relato.
```

**Adicionar ao perfil:**

```json
{
  "external_validation": {
    "validators": [
      {
        "relationship": "esposa",
        "validated_traits": {
          "extraversion": 0.3,
          "agreeableness": 0.75,
          "conflict_style": "avoidant"
        },
        "discrepancies": [
          {
            "trait": "self_confidence",
            "self_report": 0.7,
            "external_report": 0.5,
            "note": "Esposa percebe mais insegurança do que ele reconhece"
          }
        ]
      }
    ]
  }
}
```

### 4.3 Simulação Preditiva (Self-Test)

```
IDEIA PODEROSA:
Depois de construir o perfil, a IA SIMULA ser a pessoa
e o usuário TESTA se a simulação está correta.
```

```
🤖 "JP, vou fazer um teste. Vou descrever como ACHO
    que você reagiria em uma situação que nunca
    discutimos. Me diga se acertei."

🤖 "Situação: Você está num restaurante e o garçom
    traz o pedido errado. O que EU ACHO que você faria:

    Você provavelmente comeria o prato errado se fosse
    aceitável, para evitar constrangimento. Mas se fosse
    algo que você realmente não gosta, pediria gentilmente
    para trocar, provavelmente pedindo desculpa ao
    garçom mesmo sendo erro dele. Certo?"

👤 "Quase! Eu pediria pra trocar sem problema, mas
    não pediria desculpa ao garçom. Eu seria educado
    mas direto."

🤖 "Ótimo! Ajustando: sua assertividade em situações
    de serviço é maior do que eu estimava. Anotado."
```

**Adicionar campo ao perfil:**

```json
{
  "meta": {
    "prediction_accuracy": {
      "tests_performed": 12,
      "correct_predictions": 9,
      "partially_correct": 2,
      "incorrect": 1,
      "accuracy_rate": 0.83,
      "areas_of_best_prediction": ["work_behavior", "social_energy"],
      "areas_of_worst_prediction": ["conflict_response"]
    }
  }
}
```

---

## 5. Dinâmica Temporal

### 5.1 Perfil como Entidade Viva

```
PROBLEMA:
O perfil é tratado como estático.
Pessoas MUDAM. O perfil de 6 meses atrás pode não ser preciso.

SOLUÇÃO: Versionamento temporal
```

```json
{
  "meta": {
    "temporal": {
      "profile_version": 5,
      "versions": [
        {
          "version": 1,
          "date": "2024-01-15",
          "snapshot_hash": "abc123",
          "major_changes": []
        },
        {
          "version": 5,
          "date": "2024-07-20",
          "snapshot_hash": "def456",
          "major_changes": [
            "extraversion increased from 0.38 to 0.52 (new job with more social interaction)",
            "stress_level decreased from 0.7 to 0.4 (resolved family conflict)"
          ]
        }
      ],
      "field_freshness": {
        "identity.full_name": {
          "last_confirmed": "2024-07-20",
          "freshness": "current"
        },
        "emotional_profile.baseline": {
          "last_confirmed": "2024-03-10",
          "freshness": "stale",
          "needs_revalidation": true
        }
      }
    }
  }
}
```

**Sugestão de re-validação periódica:**

```
$ npx mindclone

🔔 Faz 3 meses desde sua última sessão!
   Algumas informações podem estar desatualizadas:

   ⚠️ Estado emocional (última atualização: Mar/2024)
   ⚠️ Situação profissional (última atualização: Mar/2024)
   ⚠️ Relacionamentos (última atualização: Fev/2024)

   Deseja fazer uma sessão de atualização? (~10 min)
```

### 5.2 Rastreamento de Mudanças ao Longo do Tempo

```json
{
  "temporal_analysis": {
    "personality_evolution": {
      "openness": [
        { "date": "2024-01", "value": 0.72 },
        { "date": "2024-04", "value": 0.75 },
        { "date": "2024-07", "value": 0.78 }
      ],
      "trend": "increasing",
      "possible_cause": "started traveling more and reading philosophy"
    },
    "life_events_impact": [
      {
        "event": "promoted to tech lead",
        "date": "2024-03",
        "traits_affected": {
          "extraversion": "+0.14",
          "self_confidence": "+0.2",
          "stress_level": "+0.15"
        }
      }
    ],
    "stability_score": 0.78
  }
}
```

---

## 6. Experiência do Usuário (UX)

### 6.1 Sessões Adaptativas por Disponibilidade

```
PROBLEMA:
Sessões podem ser longas demais.
Pessoa com 5 minutos desiste.

SOLUÇÃO: Sessões de tamanho variável
```

```
🤖 "Quanto tempo você tem disponível agora?"

   ❯ ⚡ Rápido (5 min, ~5-8 perguntas)
     🕐 Normal (15 min, ~15-20 perguntas)
     🧘 Profundo (30+ min, ~25-35 perguntas)

→ Adapta profundidade e tipo de perguntas ao tempo
→ Sessão "rápida" foca em preencher gaps de alta prioridade
→ Sessão "profunda" permite exploração livre
```

### 6.2 Gamificação Leve

```
Sem exagerar, mas incentivos para completar:

📊 "Completude: 67% → 72% (+5% nesta sessão!)"

🏆 Conquistas desbloqueadas:
   ✅ "Primeiro contato" — Completou Fase 1
   ✅ "Autoconsciente" — Respondeu 50 perguntas
   ✅ "Sem máscara" — Admitiu uma fraqueza
   🔒 "Profundidade máxima" — Atingir 95% de completude
   🔒 "Clone validado" — Acertar 80%+ nas previsões

→ Motiva o usuário a continuar voltando
→ Celebra momentos de vulnerabilidade e honestidade
```

### 6.3 Feedback Visual do Perfil

```
Após cada sessão, mostrar visualização ASCII do perfil:

╭─ Big Five ──────────────────────────╮
│ Openness        ████████████░░ 0.78 │
│ Conscientiousn. ████████░░░░░░ 0.65 │
│ Extraversion    ██████░░░░░░░░ 0.42 │
│ Agreeableness   █████████░░░░░ 0.71 │
│ Neuroticism     █████░░░░░░░░░ 0.38 │
╰─────────────────────────────────────╯

╭─ Dimensões ─────────────────────────╮
│ Lógico ████████░░ Emocional         │
│ Introvertido ██████░░░░ Extrovertido│
│ Planejador ████████░░ Espontâneo    │
│ Otimista ███████░░░ Pessimista      │
│ Individualista ██████░░░░ Coletivista│
╰─────────────────────────────────────╯
```

### 6.4 Modo Conversa Natural vs. Modo Estruturado

```
Oferecer ao usuário ESCOLHA de formato:

MODO ESTRUTURADO (atual):
  Pergunta → Resposta → Próxima pergunta
  Mais eficiente, mais dados por minuto

MODO CONVERSA LIVRE:
  Conversa fluida como se fosse um chat com terapeuta
  A IA extrai informações da conversa naturalmente
  Mais confortável para quem não gosta de interrogatório
  Mais lento, mas pode capturar nuances que perguntas diretas perdem

MODO HÍBRIDO:
  Começa conversacional, faz perguntas direcionadas quando
  a conversa não está gerando dados suficientes
```

---

## 7. Saída e Interoperabilidade

### 7.1 Múltiplos Formatos de Exportação

```
PROBLEMA:
Apenas JSON. Nem todo sistema consome JSON bem como RAG.

SOLUÇÃO:
```

```
$ npx mindclone --export joao-silva --format=?

Formatos disponíveis:
  1. json          → Perfil completo estruturado
  2. markdown      → Documento legível por humanos
  3. rag-prompt    → Texto otimizado para System Prompt
  4. rag-chunks    → Chunks separados para vector DB
  5. narrative     → Biografia psicológica em prosa
  6. summary       → Resumo executivo (1 página)
  7. comparison    → Comparativo com sessões anteriores
```

### 7.2 Formato RAG Otimizado com Chunks

```
PARA USO EM VECTOR DATABASE (Pinecone, Weaviate, etc.)

Em vez de um JSON monolítico, gerar chunks temáticos
que podem ser embedados separadamente:
```

```json
{
  "rag_chunks": [
    {
      "id": "chunk_personality_core",
      "category": "personality",
      "content": "JP é predominantemente analítico com forte intuição complementar. Openness alto (0.78), o que significa que...",
      "metadata": {
        "confidence": 0.85,
        "last_updated": "2024-07-20",
        "related_chunks": ["chunk_cognitive", "chunk_decision"]
      }
    },
    {
      "id": "chunk_communication",
      "category": "social",
      "content": "JP comunica-se de forma direta mas gentil. Prefere escrita a fala para temas complexos. Usa humor seco...",
      "metadata": {
        /* ... */
      }
    },
    {
      "id": "chunk_emotional_triggers",
      "category": "emotional",
      "content": "Principais triggers emocionais: injustiça (raiva intensa), ser ignorado (frustração moderada)...",
      "metadata": {
        /* ... */
      }
    }
    // ... ~20-30 chunks
  ]
}
```

### 7.3 SDK/API para Consumo

```
IDEIA: Além do arquivo, oferecer uma forma programática
de acessar o perfil.
```

```javascript
// Uso em outro projeto Node.js
const { MindProfile } = require("mindclone");

const jp = MindProfile.load("joao-silva");

// Gerar system prompt para outro chatbot
const prompt = jp.toSystemPrompt({
  role: "customer_support_agent",
  context: "interagindo com JP como cliente",
  focus: ["communication_style", "emotional_triggers", "values"],
});

// Prever reação
const prediction = jp.predict("received_criticism_at_work");
// → "Provavelmente processaria internamente antes de responder..."

// Consultar traço
const extraversion = jp.trait("big_five.extraversion");
// → { score: 0.42, level: "low-moderate", confidence: 0.88 }
```

---

## 8. Motor de IA Melhorado

### 8.1 Chain-of-Thought Estruturado

```
PROBLEMA:
O prompt pede à IA que faça análise E gere pergunta
numa única chamada. Isso pode gerar respostas mediocres.

SOLUÇÃO: Separar em 2 chamadas
```

```
CHAMADA 1 — ANÁLISE (modelo reasoning, ex: o1):
"Aqui está a resposta do usuário. Analise:
- O que isso revela sobre personalidade?
- Que campos do perfil isso atualiza?
- Há contradições com dados anteriores?
- Que lacunas ainda existem?
- Qual é a melhor próxima área a explorar?"

CHAMADA 2 — GERAÇÃO (modelo conversacional, ex: GPT-4o):
"Com base nesta análise [resultado da chamada 1],
gere a próxima pergunta de forma natural e empática.
Contexto da conversa: [últimas mensagens]"
```

**Benefícios:**

- Análise mais profunda (modelo pensador)
- Conversa mais natural (modelo conversacional)
- Menor chance de alucinação
- Separação de preocupações

### 8.2 Avaliação de Qualidade das Perguntas

```
ADICIONAR: Auto-avaliação antes de mostrar ao usuário

Antes de exibir a pergunta gerada, passar por checklist:
```

```javascript
// src/ai/question-validator.js

function validateQuestion(question, context) {
  const checks = {
    // 1. Não é repetida
    not_repeated: !isSimilarToAny(question, context.askedQuestions, 0.85),

    // 2. Não é ambígua
    not_ambiguous: !hasMultipleInterpretations(question),

    // 3. Tem objetivo claro
    has_clear_target: question.target_field !== null,

    // 4. Apropriada para a fase
    phase_appropriate: isAppropriateForPhase(question, context.phase),

    // 5. Nível de profundidade adequado
    depth_appropriate: checkDepthProgression(question, context),

    // 6. Não assume informação não confirmada
    no_assumptions: !containsUnconfirmedAssumptions(question, context.profile),

    // 7. Culturalmente sensível
    culturally_sensitive: checkCulturalSensitivity(question, context.profile),

    // 8. Não é leading (indutiva)
    not_leading: !isLeadingQuestion(question),
  };

  const passed = Object.values(checks).every((v) => v);

  if (!passed) {
    // Regenerar pergunta com feedback específico
    return { valid: false, failures: checks };
  }

  return { valid: true };
}
```

### 8.3 Fallback Inteligente

```
CENÁRIO: API cai, rate limit, erro de parsing

SOLUÇÃO:
1. Perguntas de fallback pré-definidas por fase
2. Cache local de 5-10 próximas perguntas geradas antecipadamente
3. Retry com exponential backoff
4. Se offline, oferecer questionário estático
```

```javascript
// Pre-gerar próximas perguntas
async function prefetchQuestions(context, count = 5) {
  const prompt = `Gere as próximas ${count} perguntas que você 
  faria, em ordem, com base no contexto atual. Formato JSON array.`;

  const questions = await ai.generate(prompt);
  await cache.store("prefetched_questions", questions);
}
```

---

## 9. Funcionalidades Avançadas

### 9.1 Modo "Espelho" — Chatbot que Simula o Usuário

```
APÓS PERFIL COMPLETO:

$ npx mindclone --mirror joao-silva

🪞 MODO ESPELHO ATIVADO
   A IA vai tentar SE COMPORTAR como JP.
   Converse com "você mesmo" para testar o clone.

   (Atenção: isso é uma simulação baseada no perfil,
   não uma cópia perfeita da sua mente.)

👤 Você: "Ei JP, o que você acha de mudar de emprego?"

🪞 JP (simulado): "Olha, depende muito. Se for pra algo
    que me dá mais autonomia e eu possa construir algo
    do zero, eu pensaria seriamente. Mas não largaria
    algo estável sem ter certeza de que vale o risco.
    Provavelmente faria uma planilha comparando,
    consultaria a Mariana, e ainda assim demoraria
    uns 2 meses pra decidir."

→ Permite ao usuário testar a fidelidade do perfil
→ Funciona como preview de como outros sistemas usariam o RAG
```

### 9.2 Diário Integrado

```
PROBLEMA:
As sessões de Q&A são artificiais. Comportamento real
acontece no dia-a-dia.

SOLUÇÃO: Modo diário
```

```
$ npx mindclone --journal

📝 DIÁRIO MINDCLONE
   Escreva livremente sobre seu dia. A IA vai extrair
   informações relevantes para seu perfil automaticamente.

   > Hoje tive uma discussão com meu chefe sobre
     prazos. Ele queria que eu entregasse amanhã algo
     que precisa de pelo menos uma semana. Fiquei p***
     mas não falei nada na hora. Depois mandei um email
     bem estruturado explicando por que não dava.
     No final ele concordou.

   🧠 Análise do diário:
   - Confirma padrão: evita conflito no momento,
     processa internamente, resolve por escrito
   - Atualizado: conflict_style.primary = "avoidant-then-assertive"
   - Atualizado: communication_style.verbal_vs_written =
     "written for difficult conversations"
   - Evidência adicional para conscientiousness (preocupação com prazo realista)
```

### 9.3 Importação de Dados Existentes

```
Acelerar o mapeamento importando dados que a pessoa já tem:

$ npx mindclone --import

Fontes disponíveis:
  1. 📝 Resultado de teste MBTI/Big Five (colar texto)
  2. 📊 Resultados de terapia (resumo, opcional)
  3. 💬 Histórico de chat exportado (WhatsApp/Telegram)
  4. 📱 Dados de uso de tela (Screen Time)
  5. 📚 Lista de livros lidos (Goodreads)
  6. 🎵 Perfil musical (Spotify data)
  7. ✍️  Textos escritos pela pessoa (blog, diário)

→ Cada fonte é analisada e usada para PRÉ-PREENCHER
   o perfil, que depois é VALIDADO pelo usuário
→ Ex: Spotify data revela padrões de humor e preferências
→ Ex: WhatsApp revela estilo linguístico REAL (não auto-relatado)
```

### 9.4 Comparação de Perfis (Compatibilidade)

```
SE dois usuários tiverem perfis MindClone:

$ npx mindclone --compare perfil-a perfil-b

📊 ANÁLISE DE COMPATIBILIDADE

   Pontos de SINERGIA:
   ✅ Ambos valorizam honestidade acima de tudo
   ✅ Estilos de comunicação complementares
   ✅ Nível similar de necessidade de autonomia

   Pontos de ATRITO potencial:
   ⚠️ A é altamente organizado, B é caótico
   ⚠️ A evita conflito, B busca resolução imediata
   ⚠️ Diferença significativa em tolerância a risco

   Compatibilidade geral: 72%

   📌 Dica: O maior desafio será comunicação em conflitos.
      A tende a se calar, B quer resolver na hora.
      Combinem um "protocolo" para essas situações.

→ Útil para: equipes, relacionamentos, sócios
```

---

## 10. Qualidade do Prompt

### 10.1 Exemplos Few-Shot no Prompt

```
PROBLEMA:
O prompt diz O QUE fazer mas não mostra COMO fica uma
boa interação. LLMs funcionam muito melhor com exemplos.

SOLUÇÃO: Adicionar 2-3 exemplos completos de interação
ideal ao system prompt.
```

```markdown
## EXEMPLO DE INTERAÇÃO IDEAL — FASE 5

CONTEXTO: Usuário é professora, 40 anos, mãe de 2.

👤 [resposta anterior]: "Gosto de planejar tudo antes,
não consigo fazer nada de última hora."

🤖 ANÁLISE INTERNA:
{
"traits_detected": ["high_conscientiousness", "low_spontaneity"],
"confidence": 0.7,
"follow_up_needed": true,
"reasoning": "Resposta forte, mas preciso testar se é
TODAS as áreas ou específico de trabalho"
}

🤖 RESPOSTA VISÍVEL:
"Esse planejamento se aplica a tudo na sua vida — viagens,
fins de semana, até atividades com as crianças? Ou tem
áreas onde você consegue ser mais 'vai que vai'?"

👤 "Com as crianças eu sou mais flexível, elas me obrigam
a improvisar haha. Mas no trabalho, jamais."

🤖 ANÁLISE INTERNA:
{
"traits_detected": ["context_dependent_conscientiousness"],
"profile_updates": {
"personality.big_five.conscientiousness.score": 0.72,
"personality.big_five.conscientiousness.note":
"Alta no trabalho, moderada na vida pessoal.
Filhos funcionam como fator de flexibilização."
},
"follow_up_needed": false
}

🤖 "Interessante! Parece que as crianças te treinam
a abrir mão do controle. [transição] E quando algo
NÃO sai como planejado no trabalho — como uma aula
que sai do roteiro — o que você sente?"

→ NOTE: A pergunta conecta o que aprendeu (flexibilidade
forçada) com o contexto profissional, testando a
MESMA dimensão em cenário diferente.
```

### 10.2 Guardrails Anti-Alucinação Reforçados

```markdown
## REGRAS ANTI-ALUCINAÇÃO REFORÇADAS

### O que NUNCA fazer:

1. ❌ Assumir que silêncio = concordância
2. ❌ Preencher campos com "provavelmente X" sem confirmar
3. ❌ Inferir orientação sexual, religião, ou política
   sem declaração EXPLÍCITA
4. ❌ Assumir que uma resposta sobre um contexto se aplica
   a todos os contextos
5. ❌ Confundir o que a pessoa DESEJA ser com o que ELA É
6. ❌ Projetar padrões populacionais no indivíduo
   ("maioria dos devs é introvertida, então...")

### O que SEMPRE fazer:

1. ✅ Marcar cada dado como: fato | auto-relato | inferência
2. ✅ Dar score de confiança para cada inferência
3. ✅ Quando em dúvida, PERGUNTAR em vez de assumir
4. ✅ Registrar contexto de cada resposta
   (a pessoa pode ser assertiva NO TRABALHO mas não EM CASA)
5. ✅ Distinguir entre:
   - Quem a pessoa É
   - Quem ela QUER SER
   - Quem ela ACHA QUE É
   - Quem ela MOSTRA AO MUNDO
```

---

## 11. Arquitetura — Melhorias Estruturais

### 11.1 Plugin System

```
PROBLEMA: Diferentes usuarios querem diferentes focos.
Um coach quer perfil profissional detalhado.
Um terapeuta quer perfil emocional detalhado.
Um partner quer perfil relacional detalhado.

SOLUÇÃO: Sistema de plugins
```

```javascript
// Plugins opcionais que adicionam fases/perguntas
const plugins = {
  "career-deep-dive": {
    phases: [phase_3_extended],
    extra_fields: { /* campos profissionais adicionais */ },
    prompts: { /* prompts especializados */ }
  },
  "relationship-mapping": {
    phases: [phase_relationship],
    extra_fields: { /* campos relacionais adicionais */ },
    prompts: { /* prompts especializados */ }
  },
  "creative-profile": {
    phases: [phase_creativity],
    extra_fields: { /* campos criativos */ },
    prompts: { /* prompts especializados */ }
  },
  "leadership-assessment": {
    phases: [phase_leadership],
    extra_fields: { /* campos de liderança */ },
    prompts: { /* prompts especializados */ }
  }
};

// Uso
$ npx mindclone --plugins career-deep-dive,leadership-assessment
```

### 11.2 Telemetria Anonimizada (Opt-in)

```
Com consentimento explícito, coletar métricas anônimas para
melhorar o produto:

- Tempo médio por fase
- Taxas de conclusão por fase
- Perguntas mais puladas (indicam problema de formulação)
- Taxas de abandono e em que fase
- Acurácia das previsões agregada

NUNCA coletar conteúdo das respostas.
```

### 11.3 Testes Automatizados do Prompt

```
CRUCIAL: O prompt é o "cérebro" do sistema. Precisa de testes.

SOLUÇÃO: Suite de testes de qualidade do prompt
```

```javascript
// tests/prompt-quality.test.js

describe("Prompt Quality", () => {
  test("should not ask ambiguous questions", async () => {
    const response = await ai.generate(testContext);
    expect(isAmbiguous(response.question)).toBe(false);
  });

  test("should not repeat questions", async () => {
    const context = { askedQuestions: ["Qual seu nome?"] };
    const response = await ai.generate(context);
    expect(similarity(response.question, "Qual seu nome?")).toBeLessThan(0.8);
  });

  test("should respect phase boundaries", async () => {
    const context = { phase: 1 }; // Identity phase
    const response = await ai.generate(context);
    expect(response.target_field).toStartWith("identity.");
  });

  test("should provide skip option for sensitive questions", async () => {
    const context = { phase: 9 }; // Deep psychology
    const response = await ai.generate(context);
    expect(response.skip_option).toBe(true);
  });

  test("should detect crisis language", async () => {
    const context = { lastResponse: "Às vezes penso em desistir de tudo" };
    const response = await ai.generate(context);
    expect(response.crisis_protocol_triggered).toBe(true);
  });

  // Teste com personas fictícias
  test("should generate different profiles for different personas", async () => {
    const profileA = await runFullSession(PERSONA_INTROVERT_ANALYST);
    const profileB = await runFullSession(PERSONA_EXTROVERT_ARTIST);
    expect(profileSimilarity(profileA, profileB)).toBeLessThan(0.3);
  });
});
```

---

## 12. Resumo Priorizado

| #   | Melhoria                              | Impacto    | Esforço | Prioridade |
| --- | ------------------------------------- | ---------- | ------- | ---------- |
| 1   | Criptografia local                    | 🔴 Crítico | Médio   | **P0**     |
| 2   | Protocolo de crise emocional          | 🔴 Crítico | Baixo   | **P0**     |
| 3   | Consentimento informado               | 🔴 Crítico | Baixo   | **P0**     |
| 4   | Detecção de desejabilidade social     | 🟡 Alto    | Médio   | **P1**     |
| 5   | Análise de latência de resposta       | 🟡 Alto    | Baixo   | **P1**     |
| 6   | Viés de humor momentâneo              | 🟡 Alto    | Baixo   | **P1**     |
| 7   | Few-shot examples no prompt           | 🟡 Alto    | Médio   | **P1**     |
| 8   | Guardrails anti-alucinação reforçados | 🟡 Alto    | Baixo   | **P1**     |
| 9   | Sessões adaptativas por tempo         | 🟢 Médio   | Baixo   | **P1**     |
| 10  | Suporte a LLM local (Ollama)          | 🟡 Alto    | Médio   | **P1**     |
| 11  | Formato RAG otimizado com chunks      | 🟡 Alto    | Médio   | **P2**     |
| 12  | Análise linguística automática        | 🟢 Médio   | Alto    | **P2**     |
| 13  | Cross-validation de respostas         | 🟢 Médio   | Médio   | **P2**     |
| 14  | Simulação preditiva (self-test)       | 🟢 Médio   | Médio   | **P2**     |
| 15  | Perfil temporal/versionado            | 🟢 Médio   | Médio   | **P2**     |
| 16  | Calibração cultural                   | 🟢 Médio   | Médio   | **P2**     |
| 17  | Chain-of-thought separado             | 🟢 Médio   | Médio   | **P2**     |
| 18  | Modo diário                           | 🔵 Baixo   | Alto    | **P3**     |
| 19  | Validação por terceiros               | 🔵 Baixo   | Alto    | **P3**     |
| 20  | Modo espelho (simulador)              | 🔵 Baixo   | Alto    | **P3**     |
| 21  | Sistema de plugins                    | 🔵 Baixo   | Alto    | **P3**     |
| 22  | Importação de dados externos          | 🔵 Baixo   | Alto    | **P3**     |
| 23  | Comparação de perfis                  | 🔵 Baixo   | Alto    | **P3**     |
| 24  | Gamificação                           | 🔵 Baixo   | Baixo   | **P3**     |
| 25  | Testes automatizados do prompt        | 🟢 Médio   | Médio   | **P2**     |

---
