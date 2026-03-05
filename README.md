# MindCloner

MindCloner e uma CLI para mapeamento de perfil em 10 fases, com operacao guiada por menu (TTY), continuidade de sessao, handoff anti-alucinacao (`/save` -> `/new`) e exportacao de artefatos para uso humano e IA.

## Status atual do projeto

- Escopo tecnico do plano inicial concluido (F0-F7).
- Gates de release internos fechados.
- Smoke de release aprovado:
  - assistido (`npm run smoke:powershell`)
  - manual TTY no PowerShell
  - manual TTY com comando global `mindcloner`
- Readiness consolidado aprovado (`npm run release:readiness`).

Evidencias principais:

- `tasks/evidence/release-readiness-20260304-220216.json`
- `tasks/evidence/smoke-report-20260304-220233.json`
- `tasks/evidence/manual-smoke-tty-20260304-2210.md`
- `tasks/evidence/manual-smoke-tty-mindcloner-20260304-2234.md`

## Requisitos

- Node.js 20+
- npm
- PowerShell/CMD/Bash/zsh (PowerShell e ambiente prioritario)

## Instalacao

```bash
git clone https://github.com/VIDORETTO/mindCloner.git
cd mindCloner
npm install
```

## Workflow atual do projeto

### 1) Workflow de uso (produto)

1. Abrir a CLI em terminal interativo (TTY):
   - `node bin/mindclone.js --baseDir ./.mindclone --profile meu-perfil`
   - ou `npx mindcloner --baseDir ./.mindclone --profile meu-perfil`
2. No primeiro uso, concluir wizard de setup.
3. Navegar no menu por setas (`Iniciar`, `Continuar`, `Gerar documento`, `Configuracoes`, `Diagnostico`, `Sair`).
4. Durante entrevista, usar slash commands (`/status`, `/save`, `/new`, `/menu`, `/pause`, `/help`).
5. Gerar documentos pelo menu (`Resumo para IA`, `Pacote completo`, etc).

### 2) Workflow de desenvolvimento

1. Implementar/alterar codigo.
2. Rodar validacao local completa:
   - `npm run lint`
   - `npm run format:check`
   - `npm run typecheck`
   - `npm test`
3. Rodar smoke assistido (quando houver impacto de fluxo):
   - `npm run smoke:powershell`
4. Rodar readiness consolidado para release candidate:
   - `npm run release:readiness`

### 3) Workflow de CI (GitHub Actions)

Arquivo: `.github/workflows/ci.yml`

- Trigger: `push` (main/master) e `pull_request`
- Matrix: Node `20` e `22`
- Etapas por job:
  - `npm ci`
  - `npm run lint`
  - `npm run format:check`
  - `npm run typecheck`
  - `npm test`

## Execucao da CLI

### Modo interativo (recomendado)

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva
```

Ativado quando:

- `stdin` e `stdout` sao TTY
- nenhuma flag operacional bloqueante foi passada (ex.: `--status`, `--export`, `--resume`, etc)

### Comando global `mindcloner`

Para validar/usar comando global local:

```bash
npm link
mindcloner --baseDir ./.mindclone --profile ana-silva
```

### Modo por flags (operacao avancada)

Comandos suportados:

- status:
  - `--status`
- retomar sessao:
  - `--resume`
- modo deepening:
  - `--deepening`
- modo de entrevista:
  - `--interview-mode adaptive|phased`
- limite de perguntas:
  - `--max-questions <n>`
- exportacao:
  - `--export json,markdown,summary,rag-chunks,context-pack`
- provider/model/key/baseURL/timeouts:
  - `--provider`
  - `--ai-model`
  - `--ai-key`
  - `--ai-base-url`
  - `--ai-timeout`
  - `--ai-retries`
- setup:
  - `--setup`
- operacoes extras:
  - `--journal`
  - `--journal-tags`
  - `--mirror`
  - `--import`
  - `--compare`
  - `--telemetry on|off|status`
  - `--plugin <path[,path...]>`

Exemplo de status + export:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --status --export context-pack,json,markdown,summary,rag-chunks
```

## Menu e slash commands

### Menu principal

- `Iniciar entrevista`
- `Continuar entrevista`
- `Gerar documento`
- `Configuracoes`
- `Diagnostico`
- `Sair`

### Presets de documento no menu

- `Resumo para IA` -> `context-pack.md`
- `Perfil completo em Markdown` -> `profile.md`
- `JSON estruturado` -> `profile.json`
- `Resumo executivo` -> `summary.txt`
- `RAG chunks` -> `rag-chunks.jsonl`
- `Pacote completo` -> todos

### Slash commands durante entrevista

- `/help`
- `/status`
- `/save`
- `/new`
- `/pause`
- `/menu`

## Configuracao e seguranca

### Settings

Arquivo: `<baseDir>/settings.json`

- `defaultProfileId`
- `baseDir`
- `ai.provider` (normalizado para `openai` no setup)
- `ai.model` (fixado em `gpt-5-mini-2025-08-07` no setup)
- `interview.defaultMode` (`adaptive`/`phased`)
- `interview.maxQuestionsPerSession`
- `privacy.telemetryOptIn`
- `consent.*`

### Secrets

Arquivo: `<baseDir>/settings.secrets.json`

- API key pode ser persistida criptografada quando `MINDCLONE_ENCRYPTION_KEY` estiver definida.
- Sem chave, a CLI nao persiste secret e avisa que sera usada apenas na execucao atual.

### Criptografia de dados sensiveis

- Camada: AES-256-GCM com chave derivada via scrypt.
- Se perfil existente foi salvo com chave e a chave atual nao confere, a leitura falha com mensagem orientada.

## Estrutura atual de dados

```text
<baseDir>/
  settings.json
  settings.secrets.json
  telemetry.json
  profiles/
    <profileId>/
      state.json
      partial-profile.json
      question-tracker.json
      contradictions.json
      handoffs/
        handoff-<timestamp>.json
        history.json
      sessions/
        session-<timestamp>.json
  exports/
    <profileId>/
      context-pack.md
      profile.json
      profile.md
      summary.txt
      rag-chunks.jsonl
```

## Estrutura atual do codigo

```text
bin/
  mindclone.js
src/
  index.js
  cli/
    menu.js
    tui-shell.js
    commands.js
    setup-wizard.js
    screen-router.js
  ai/
    client.js
    adaptive-interview-engine.js
    handoff-manager.js
  config/
    settings-manager.js
    settings-schema.js
  profile/
    profile-builder.js
    profile-exporter.js
    context-pack-exporter.js
  phases/
    phase-01-identity.js ... phase-10-integration.js
  storage/
    session-manager.js
    local-store.js
  safety/
    consent-manager.js
    crisis-protocol.js
    encryption-manager.js
  ops/
    telemetry.js
    plugins.js
    mirror.js
    journal.js
    importer.js
    compare.js
scripts/
  smoke-release.ps1
  release-readiness.js
test/
  *.test.js / *.e2e.test.js
.github/workflows/
  ci.yml
tasks/
  evidence/
  todo.md
```

## Qualidade e testes

Comandos:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
npm run verify
```

Observacao:

- `npm run verify` cobre `lint + typecheck + test`.
- O CI tambem executa `format:check` (obrigatorio para merge verde).

## Smoke e readiness de release

### Smoke assistido (PowerShell)

```powershell
npm run smoke:powershell
```

Saidas em `tasks/evidence/`:

- `smoke-report-<timestamp>.json`
- `smoke-bootstrap-<timestamp>.log`
- `smoke-session-<timestamp>.log`
- `smoke-status-<timestamp>.log`

### Readiness consolidado

```bash
npm run release:readiness
```

Saidas em `tasks/evidence/`:

- `release-readiness-<timestamp>.json`
- `release-readiness-verify-<timestamp>.log`
- `release-readiness-smoke-<timestamp>.log`

## Troubleshooting rapido

### `mindcloner` nao encontrado

- Rode `npm link` no repo e abra nova sessao de terminal.
- Em alternativa, use `npx mindcloner ...` ou `node bin/mindclone.js ...`.

### Falha com dados criptografados

- Defina `MINDCLONE_ENCRYPTION_KEY` correta antes de acessar perfil antigo.
- Ou use novo `--profile` para iniciar um perfil limpo.

### `--resume` com perfil inexistente

- Confirme `--baseDir` e `--profile`.
- Rode sem `--resume` para criar perfil novo.

### CI falhando em formatacao

- Rode `npm run format` e depois `npm run format:check`.

## Plugin API (resumo)

`--plugin` aceita caminho(s) para modulo CommonJS com contrato:

```js
module.exports = {
  name: "meu-plugin",
  async onCliEvent(eventName, context) {
    // tratar evento
  },
};
```

## Licenca

MIT (`LICENSE`).
