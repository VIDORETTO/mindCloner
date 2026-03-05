param(
  [string]$BaseDir = "",
  [switch]$KeepData
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$runId = "smoke-$timestamp"

if ([string]::IsNullOrWhiteSpace($BaseDir)) {
  $defaultRoot = Join-Path $repoRoot ".smoke"
  $BaseDir = Join-Path $defaultRoot $runId
}

$profileId = "release-$timestamp"
$evidenceDir = Join-Path $repoRoot "tasks\evidence"
$reportPath = Join-Path $evidenceDir "smoke-report-$timestamp.json"
$bootstrapLogPath = Join-Path $evidenceDir "smoke-bootstrap-$timestamp.log"
$sessionLogPath = Join-Path $evidenceDir "smoke-session-$timestamp.log"
$statusLogPath = Join-Path $evidenceDir "smoke-status-$timestamp.log"
$handoffRunnerPath = ""

New-Item -ItemType Directory -Force -Path $evidenceDir | Out-Null
New-Item -ItemType Directory -Force -Path $BaseDir | Out-Null

Write-Host "== MindCloner Smoke Release =="
Write-Host "Run ID: $runId"
Write-Host "BaseDir: $BaseDir"
Write-Host "Profile: $profileId"

Push-Location $repoRoot
try {
  $scriptedInput = @(
    "sim"
    "/pause"
    ""
  ) -join "`n"

  Write-Host ""
  Write-Host "[1/3] Rodando bootstrap CLI non-TTY..."
  $scriptedInput |
    node .\bin\mindclone.js --baseDir $BaseDir --profile $profileId --max-questions 5 2>&1 |
    Tee-Object -FilePath $bootstrapLogPath | Out-Null

  Write-Host "[2/3] Rodando sessao roteirizada com handoff..."
  $handoffRunnerPath = Join-Path $evidenceDir "smoke-handoff-runner-$timestamp.cjs"
  @'
const { runSession } = require('../../src');

function createScriptedIO(answers) {
  const outputs = [];
  let index = 0;
  return {
    outputs,
    async say(message) {
      outputs.push(String(message));
    },
    async ask() {
      const value = answers[index];
      index += 1;
      return value ?? "";
    },
  };
}

async function main() {
  const baseDir = process.argv[2];
  const profileId = process.argv[3];
  const io = createScriptedIO([
    "Joao Pedro da Silva",
    "/save",
    "/new",
    "JP",
    "/status",
    "/pause",
  ]);
  const result = await runSession({
    profileId,
    baseDir,
    io,
    maxQuestions: 5,
    requireConsent: false,
  });
  for (const line of io.outputs) {
    process.stdout.write(`${line}\n`);
  }
  process.stdout.write(`SMOKE_RESULT ${JSON.stringify({
    summary: result.summary,
    handoffPath: result.handoff?.lastSavedPath || "",
  })}\n`);
}

main().catch((error) => {
  process.stderr.write(String(error?.stack || error?.message || error));
  process.exit(1);
});
'@ | Set-Content -Path $handoffRunnerPath -Encoding UTF8

  node $handoffRunnerPath $BaseDir $profileId 2>&1 |
    Tee-Object -FilePath $sessionLogPath | Out-Null

  Write-Host "[3/3] Rodando status + export..."
  node .\bin\mindclone.js --baseDir $BaseDir --profile $profileId --status --export context-pack,json,markdown,summary,rag-chunks 2>&1 |
    Tee-Object -FilePath $statusLogPath | Out-Null

  $handoffHistory = Join-Path $BaseDir "profiles\$profileId\handoffs\history.json"
  $exportDir = Join-Path $BaseDir "exports\$profileId"

  $checks = [ordered]@{
    handoff_history_exists = Test-Path $handoffHistory
    export_context_pack_exists = Test-Path (Join-Path $exportDir "context-pack.md")
    export_json_exists = Test-Path (Join-Path $exportDir "profile.json")
    export_markdown_exists = Test-Path (Join-Path $exportDir "profile.md")
    export_summary_exists = Test-Path (Join-Path $exportDir "summary.txt")
    export_rag_chunks_exists = Test-Path (Join-Path $exportDir "rag-chunks.jsonl")
    bootstrap_log_exists = Test-Path $bootstrapLogPath
    session_log_exists = Test-Path $sessionLogPath
    status_log_exists = Test-Path $statusLogPath
  }

  $allChecksPassed = ($checks.Values | Where-Object { $_ -eq $false }).Count -eq 0

  $report = [ordered]@{
    run_id = $runId
    created_at = (Get-Date).ToUniversalTime().ToString("o")
    base_dir = $BaseDir
    profile_id = $profileId
    checks = $checks
    all_checks_passed = $allChecksPassed
    artifacts = [ordered]@{
      handoff_history = $handoffHistory
      export_dir = $exportDir
      bootstrap_log = $bootstrapLogPath
      session_log = $sessionLogPath
      status_log = $statusLogPath
    }
  }

  $report | ConvertTo-Json -Depth 6 | Set-Content -Path $reportPath -Encoding UTF8
  Write-Host ""
  Write-Host "Relatorio: $reportPath"

  if (-not $allChecksPassed) {
    throw "Smoke falhou: um ou mais checks nao passaram."
  }

  Write-Host "Smoke concluido com sucesso."
}
finally {
  if (Test-Path $handoffRunnerPath) {
    Remove-Item -Force $handoffRunnerPath
  }
  Pop-Location
  if (-not $KeepData -and (Test-Path $BaseDir)) {
    Remove-Item -Recurse -Force $BaseDir
  }
}
