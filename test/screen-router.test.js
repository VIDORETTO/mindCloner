const test = require("node:test");
const assert = require("node:assert/strict");
const {
  HOME_SCREEN,
  getHomeMenuItems,
  getMenuItemById,
  createInitialUiState,
  reduceUiState,
} = require("../src/cli/screen-router");

test("screen-router: estado inicial consistente", () => {
  const state = createInitialUiState({
    profileContext: {
      profileId: "ana-silva",
    },
  });
  assert.equal(state.screen, HOME_SCREEN);
  assert.deepEqual(state.stack, [HOME_SCREEN]);
  assert.equal(state.profileContext.profileId, "ana-silva");
  assert.equal(state.ui.selectedAction, "start-interview");
});

test("screen-router: menu principal contem opcoes obrigatorias", () => {
  const items = getHomeMenuItems();
  const ids = items.map((item) => item.id);
  assert.deepEqual(ids, [
    "start-interview",
    "continue-interview",
    "generate-document",
    "settings",
    "diagnostics",
    "exit",
  ]);
  assert.equal(getMenuItemById("settings").label, "Configuracoes");
});

test("screen-router: transicoes de navegacao e retorno", () => {
  let state = createInitialUiState();
  state = reduceUiState(state, {
    type: "NAVIGATE",
    payload: { screen: "interview" },
  });
  assert.equal(state.screen, "interview");
  assert.deepEqual(state.stack, ["home", "interview"]);

  state = reduceUiState(state, { type: "BACK" });
  assert.equal(state.screen, "home");
  assert.deepEqual(state.stack, ["home"]);
});
