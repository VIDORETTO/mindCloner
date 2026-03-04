const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

function runCliWithPipedInput({ cwd, baseDir, profileId, inputText }) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["bin/mindclone.js", "--baseDir", baseDir, "--profile", profileId],
      {
        cwd,
        env: {
          ...process.env,
          MINDCLONE_ENCRYPTION_KEY: "ci-non-tty-key",
        },
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });

    child.stdin.write(inputText);
    child.stdin.end();
  });
}

test("CLI com stdin encadeado encerra sem erro de readline fechado", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-cli-non-tty-"));
  const result = await runCliWithPipedInput({
    cwd: path.resolve(__dirname, ".."),
    baseDir: tmpRoot,
    profileId: "non-tty-a1",
    inputText: "sim\n/pause\n",
  });

  assert.equal(result.code, 0);
  assert.match(result.stdout, /MindClone CLI/);
  assert.doesNotMatch(result.stderr, /readline was closed/i);
});
