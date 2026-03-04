const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

function createTerminalIO(options = {}) {
  const input = options.input || stdin;
  const output = options.output || stdout;
  const pauseToken = options.pauseToken || "/pause";
  let closed = false;
  let sawInputEnd = false;

  const rl = readline.createInterface({
    input,
    output,
    terminal: Boolean(input.isTTY && output.isTTY),
  });

  rl.on("close", () => {
    closed = true;
  });
  input.on("end", () => {
    sawInputEnd = true;
  });

  return {
    async say(message) {
      output.write(`${message}\n`);
    },
    async ask(prompt = "> ") {
      if (closed) {
        return pauseToken;
      }
      try {
        const answer = await rl.question(prompt);
        if (!input.isTTY && sawInputEnd && !answer) {
          return pauseToken;
        }
        return answer;
      } catch (error) {
        const message = String(error?.message || "");
        if (message.includes("readline was closed") || error?.code === "ERR_USE_AFTER_CLOSE") {
          return pauseToken;
        }
        throw error;
      }
    },
    async close() {
      if (!closed) {
        rl.close();
      }
    },
  };
}

module.exports = {
  createTerminalIO,
};
