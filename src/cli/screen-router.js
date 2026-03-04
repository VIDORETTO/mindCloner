const HOME_SCREEN = "home";

const HOME_MENU_ITEMS = [
  {
    id: "start-interview",
    label: "Iniciar entrevista",
    help: "Comeca uma nova entrevista interativa para o perfil atual.",
  },
  {
    id: "continue-interview",
    label: "Continuar entrevista",
    help: "Retoma a ultima sessao salva do perfil informado.",
  },
  {
    id: "generate-document",
    label: "Gerar documento",
    help: "Exporta o perfil para formatos de uso humano e IA.",
  },
  {
    id: "settings",
    label: "Configuracoes",
    help: "Ajusta provider, chave de API e preferencias da CLI.",
  },
  {
    id: "diagnostics",
    label: "Diagnostico",
    help: "Mostra estado atual do perfil e valida recursos basicos.",
  },
  {
    id: "exit",
    label: "Sair",
    help: "Encerra a CLI com seguranca.",
  },
];

function getHomeMenuItems() {
  return HOME_MENU_ITEMS.map((item) => ({ ...item }));
}

function getMenuItemById(itemId) {
  return HOME_MENU_ITEMS.find((item) => item.id === itemId) || null;
}

function createInitialUiState(overrides = {}) {
  const now = new Date().toISOString();
  return {
    screen: HOME_SCREEN,
    stack: [HOME_SCREEN],
    createdAt: now,
    updatedAt: now,
    profileContext: {
      profileId: "",
      baseDir: "",
      hasExistingData: false,
      ...(overrides.profileContext || {}),
    },
    interviewContext: {
      mode: "phased",
      active: false,
      lastSessionId: "",
      ...(overrides.interviewContext || {}),
    },
    settingsContext: {
      loaded: false,
      path: "",
      ...(overrides.settingsContext || {}),
    },
    runtime: {
      isTTY: false,
      width: 0,
      height: 0,
      ...(overrides.runtime || {}),
    },
    ui: {
      selectedAction: "start-interview",
      helpVisible: true,
      lastInfo: "",
      lastError: "",
      ...(overrides.ui || {}),
    },
  };
}

function reduceUiState(currentState, event) {
  const state = currentState || createInitialUiState();
  const action = event || {};
  const now = new Date().toISOString();
  const next = {
    ...state,
    stack: [...state.stack],
    ui: { ...state.ui },
    updatedAt: now,
  };

  if (action.type === "NAVIGATE") {
    const target = String(action.payload?.screen || "").trim();
    if (!target) {
      return next;
    }
    next.screen = target;
    if (next.stack[next.stack.length - 1] !== target) {
      next.stack.push(target);
    }
    return next;
  }

  if (action.type === "BACK") {
    if (next.stack.length <= 1) {
      next.screen = HOME_SCREEN;
      return next;
    }
    next.stack.pop();
    next.screen = next.stack[next.stack.length - 1] || HOME_SCREEN;
    return next;
  }

  if (action.type === "SET_SELECTION") {
    next.ui.selectedAction = String(action.payload?.selectedAction || "start-interview");
    return next;
  }

  if (action.type === "SET_INFO") {
    next.ui.lastInfo = String(action.payload?.message || "");
    next.ui.lastError = "";
    return next;
  }

  if (action.type === "SET_ERROR") {
    next.ui.lastError = String(action.payload?.message || "");
    return next;
  }

  if (action.type === "EXIT") {
    next.screen = "exit";
    next.ui.lastInfo = "CLI encerrada pelo usuario.";
    return next;
  }

  return next;
}

module.exports = {
  HOME_SCREEN,
  getHomeMenuItems,
  getMenuItemById,
  createInitialUiState,
  reduceUiState,
};
