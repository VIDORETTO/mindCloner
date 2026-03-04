# MindCloner

MindCloner e uma CLI para mapear uma pessoa em 10 fases e gerar um perfil estruturado, com continuidade entre sessoes, seguranca e exportacao pronta para uso humano e IA.

## O que ficou mais facil

A configuracao e o uso ficaram mais diretos porque o fluxo agora e incremental e guiado:

- Setup em poucos comandos (`clone`, `npm install`, `npm run verify`).
- Inicio rapido com defaults seguros (`--baseDir` local e `--profile` simples).
- Entrevista interativa com comandos de controle no meio da conversa (`/status`, `/skip`, `/pause`).
- Retomada idempotente com `--resume`, sem editar arquivo manualmente.
- Exportacao em formatos prontos para leitura e pipelines (`json`, `markdown`, `summary`, `rag-chunks`).

## Visao geral do workflow interativo

Fluxo completo de ponta a ponta:

1. Voce cria (ou escolhe) um perfil.
2. A CLI inicia o fluxo faseado (1 a 10) e salva progresso continuamente.
3. Durante a entrevista, voce controla a sessao por comandos rapidos.
4. Se pausar, retoma de onde parou com `--resume`.
5. Ao concluir, pode refinar com `--deepening`.
6. Exporta artefatos para uso pratico (`--export`).

## Requisitos

- Node.js 20+
- npm
- Terminal (PowerShell, CMD, Bash, zsh)

## Onboarding (5 minutos)

### 1) Clonar e instalar

```bash
git clone https://github.com/VIDORETTO/mindCloner.git
cd mindCloner
npm install
```

### 2) Verificar ambiente

```bash
npm run verify
```

Se esse comando passar, o projeto esta pronto para uso.

### 3) Criar primeira sessao interativa

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva
```

Esse comando ja e suficiente para comecar. Nao precisa configurar provider externo para iniciar o fluxo basico.

## Workflow interativo detalhado

### Etapa 1: bootstrap da sessao

Ao iniciar, a CLI exibe contexto operacional (perfil, modo, provider) e entra no fluxo de perguntas por fases.

### Etapa 2: entrevista guiada por fases

Cada fase aborda uma camada do perfil (identidade, rotina, profissional, social, personalidade, emocional, valores, cognicao, psicologia profunda e integracao).

Durante a sessao, comandos disponiveis:

- `/status`: mostra progresso atual.
- `/skip`: pula a pergunta atual.
- `/pause`: encerra com seguranca para continuar depois.

### Etapa 3: persistencia automatica

Os dados ficam no `--baseDir`, por perfil. Isso elimina configuracao manual de arquivos para continuar o trabalho.

Estrutura tipica:

```text
<baseDir>/
  profiles/
    <profileId>/
      state.json
      mind-profile.json
      sessions.json
      journal.json
  exports/
    <profileId>/
      profile.json
      profile.md
      summary.txt
      rag-chunks.json
  telemetry.json
```

### Etapa 4: retomar de onde parou

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --resume
```

### Etapa 5: inspecionar status sem abrir entrevista

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --status
```

### Etapa 6: refinar apos fase 10 (`deepening`)

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --deepening
```

### Etapa 7: exportar para consumo real

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --status --export json,markdown,summary,rag-chunks
```

## Configuracao simplificada (opcional)

Voce pode usar provider local ou externo via flags (ou variaveis de ambiente):

- `--provider` (`local`, `openai`, `anthropic`, `ollama`)
- `--ai-model`
- `--ai-key`
- `--ai-base-url`
- `--ai-timeout`
- `--ai-retries`

Exemplo com OpenAI:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --provider openai --ai-model gpt-4.1-mini --ai-key SUA_CHAVE
```

Variaveis equivalentes:

- `MINDCLONE_AI_PROVIDER`
- `MINDCLONE_AI_MODEL`
- `MINDCLONE_AI_API_KEY`
- `MINDCLONE_AI_BASE_URL`
- `MINDCLONE_AI_TIMEOUT_MS`
- `MINDCLONE_AI_RETRIES`

## Operacao diaria (comandos mais usados)

- Nova sessao:
  `node bin/mindclone.js --baseDir ./.mindclone --profile <id>`
- Retomar:
  `node bin/mindclone.js --baseDir ./.mindclone --profile <id> --resume`
- Status:
  `node bin/mindclone.js --baseDir ./.mindclone --profile <id> --status`
- Exportar:
  `node bin/mindclone.js --baseDir ./.mindclone --profile <id> --status --export json,summary`
- Deepening:
  `node bin/mindclone.js --baseDir ./.mindclone --profile <id> --deepening`

## Modos avancados

### `--mirror`

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --mirror
```

### `--journal` e `--journal-tags`

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --journal "Hoje tive mais clareza" --journal-tags reflexao,clareza
```

### `--import`

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --import ./dados/perfil-externo.json
```

### `--compare`

```bash
node bin/mindclone.js --baseDir ./.mindclone --compare ana-silva,bruno-souza
```

ou:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --compare bruno-souza
```

### `--plugin`

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --status --plugin ./plugins/audit.js,./plugins/metrics.js
```

Contrato minimo:

```js
module.exports = {
  name: "sample-plugin",
  async onCliEvent(eventName, context) {
    // Eventos da CLI e contexto da execucao.
  },
};
```

### `--telemetry on|off|status`

```bash
node bin/mindclone.js --baseDir ./.mindclone --telemetry on
node bin/mindclone.js --baseDir ./.mindclone --telemetry status
node bin/mindclone.js --baseDir ./.mindclone --telemetry off
```

## Criptografia local

Se o perfil existente estiver criptografado, defina `MINDCLONE_ENCRYPTION_KEY` antes de acessar dados.

PowerShell:

```powershell
$env:MINDCLONE_ENCRYPTION_KEY="sua-chave-original"
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --status
```

## Troubleshooting rapido

### Erro: "Dados criptografados detectados para este perfil..."

Significa que esse perfil ja foi salvo com criptografia. Sem a chave correta, a CLI nao le dados existentes.

- Se voce tem a chave: exporte `MINDCLONE_ENCRYPTION_KEY` e rode novamente.
- Se nao tem a chave: nao e possivel abrir os dados antigos.
- Se quer recomecar: use outro `--profile` ou outro `--baseDir`.

### Erro: "Perfil nao encontrado..."

- Confirme `--baseDir`.
- Confirme `--profile`.
- Para primeiro uso, nao use `--resume`.

### Erro: "Plugin invalido..."

- Verifique caminho em `--plugin`.
- Verifique `module.exports` no arquivo.

### Erro: valor invalido para `--telemetry`

Use apenas `on`, `off` ou `status`.

## Qualidade

- Testes: `npm test`
- Formatacao: `npm run format:check`
- Verificacao completa: `npm run verify`

## Glossario rapido

- `profileId`: identificador unico do perfil (ex.: `ana-silva`).
- `baseDir`: pasta raiz de dados locais.
- `deepening`: refinamento continuo apos fase 10.
- `rag-chunks`: fragmentos para indexacao e consulta por IA.
