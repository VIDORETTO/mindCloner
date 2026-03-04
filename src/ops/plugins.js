const path = require("node:path");

function normalizePluginPaths(input) {
  if (!input || input === true) {
    return [];
  }
  return String(input)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function loadPlugins(pluginArg, cwd = process.cwd()) {
  const pluginPaths = normalizePluginPaths(pluginArg);
  const loaded = [];
  for (const pluginPath of pluginPaths) {
    const resolved = path.isAbsolute(pluginPath) ? pluginPath : path.resolve(cwd, pluginPath);
    const pluginModule = require(resolved);
    if (!pluginModule || typeof pluginModule !== "object") {
      throw new Error(`Plugin invalido em "${pluginPath}": modulo deve exportar um objeto.`);
    }
    loaded.push({
      path: resolved,
      name: pluginModule.name || path.basename(pluginPath),
      onCliEvent: typeof pluginModule.onCliEvent === "function" ? pluginModule.onCliEvent : null,
    });
  }
  return loaded;
}

async function emitPluginEvent(plugins, eventName, context) {
  for (const plugin of plugins) {
    if (!plugin.onCliEvent) {
      continue;
    }
    await plugin.onCliEvent(eventName, {
      pluginName: plugin.name,
      ...context,
    });
  }
}

module.exports = {
  loadPlugins,
  emitPluginEvent,
};
