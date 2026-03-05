const fs = require("node:fs/promises");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function nowTag() {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

function runCommand(command, args, cwd) {
  const result = spawnSync(command, args, {
    shell: process.platform === "win32",
    cwd,
    stdio: "pipe",
    encoding: "utf8",
  });
  return {
    code: Number(result.status ?? 1),
    stdout: String(result.stdout || ""),
    stderr: String(result.stderr || ""),
  };
}

function stripBom(input) {
  return String(input || "").replace(/^\uFEFF/, "");
}

async function findLatestSmokeReport(evidenceDir) {
  let entries;
  try {
    entries = await fs.readdir(evidenceDir);
  } catch {
    return null;
  }
  const candidates = entries.filter((name) => /^smoke-report-\d{8}-\d{6}\.json$/.test(name));
  if (candidates.length === 0) {
    return null;
  }
  const detailed = await Promise.all(
    candidates.map(async (name) => {
      const fullPath = path.join(evidenceDir, name);
      const stat = await fs.stat(fullPath);
      return { fullPath, mtimeMs: stat.mtimeMs };
    })
  );
  detailed.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return detailed[0].fullPath;
}

async function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const evidenceDir = path.join(repoRoot, "tasks", "evidence");
  await fs.mkdir(evidenceDir, { recursive: true });
  const tag = nowTag();

  const verify = runCommand("npm", ["run", "verify"], repoRoot);
  const smoke = runCommand("npm", ["run", "smoke:powershell"], repoRoot);
  const latestSmokePath = await findLatestSmokeReport(evidenceDir);

  let smokeSummary = null;
  if (latestSmokePath) {
    try {
      const raw = stripBom(await fs.readFile(latestSmokePath, "utf8"));
      smokeSummary = JSON.parse(raw);
    } catch {
      smokeSummary = null;
    }
  }

  const checks = {
    verify_ok: verify.code === 0,
    smoke_command_ok: smoke.code === 0,
    smoke_report_found: Boolean(latestSmokePath),
    smoke_report_all_checks_passed: Boolean(smokeSummary?.all_checks_passed),
  };
  const readyForRelease = Object.values(checks).every(Boolean);

  const report = {
    run_id: `release-readiness-${tag}`,
    created_at: new Date().toISOString(),
    checks,
    ready_for_release: readyForRelease,
    references: {
      smoke_report: latestSmokePath || "",
    },
    commands: {
      verify: { code: verify.code },
      smoke_powershell: { code: smoke.code },
    },
  };

  const reportPath = path.join(evidenceDir, `release-readiness-${tag}.json`);
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const verifyLogPath = path.join(evidenceDir, `release-readiness-verify-${tag}.log`);
  const smokeLogPath = path.join(evidenceDir, `release-readiness-smoke-${tag}.log`);
  await fs.writeFile(
    verifyLogPath,
    [verify.stdout.trim(), verify.stderr.trim()].filter(Boolean).join("\n\n"),
    "utf8"
  );
  await fs.writeFile(
    smokeLogPath,
    [smoke.stdout.trim(), smoke.stderr.trim()].filter(Boolean).join("\n\n"),
    "utf8"
  );

  process.stdout.write(`Relatorio de readiness: ${reportPath}\n`);
  process.stdout.write(`Ready for release: ${readyForRelease ? "YES" : "NO"}\n`);
  if (!readyForRelease) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${String(error?.stack || error?.message || error)}\n`);
  process.exit(1);
});
