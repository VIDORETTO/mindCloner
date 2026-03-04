# MindCloner

MindCloner e uma CLI (aplicativo de terminal) para construir um perfil humano estruturado em 10 fases, com foco em clareza, continuidade e seguranca.

Em termos simples: voce conversa com a ferramenta, ela organiza suas respostas por tema e gera um perfil reutilizavel para analise, reflexao, comparacao e uso com IA (incluindo formato para RAG).

## Para que este projeto serve

- Mapear uma pessoa de forma progressiva (fase 1 ate fase 10).
- Salvar progresso local para continuar depois sem perder contexto.
- Refinar o perfil apos o fluxo principal (`--deepening`).
- Registrar entradas livres de diario (`--journal`).
- Comparar dois perfis (`--compare`).
- Exportar em formatos prontos para leitura humana e pipelines de IA (`json`, `markdown`, `summary`, `rag-chunks`).
- Operar com provedores de IA externos ou fallback local.

## Como o MindCloner funciona (visao simples)

### 1) Fluxo por fases

O motor da CLI percorre 10 fases de coleta. Cada fase cobre uma camada diferente do perfil (identidade, estilo de vida, dinamica social, valores, cognicao etc.).

### 2) Persistencia local

Tudo fica no `--baseDir` escolhido por voce. Isso permite:

- pausar e retomar;
- consultar status sem abrir entrevista;
- exportar resultados quando quiser.

### 3) Seguranca e confiabilidade

O projeto inclui:

- consentimento explicito;
- protocolo de crise emocional;
- criptografia em repouso (quando habilitada por chave);
- hardening de persistencia com recuperacao por backup.

### 4) Operacao avancada

Depois do fluxo base, voce pode usar modos como `--deepening`, `--mirror`, `--import`, `--compare`, `--plugin` e `--telemetry`.

## Requisitos

- Node.js 20 ou superior
- npm
- Terminal (PowerShell, CMD, Bash, zsh etc.)

## Instalacao (passo a passo)

### Passo 1: obter o projeto

Se ainda nao tiver a pasta local:

```bash
git clone https://github.com/VIDORETTO/mindCloner.git
cd mindCloner
```

### Passo 2: instalar dependencias

```bash
npm install
```

### Passo 3: validar ambiente

```bash
npm run verify
```

Se esse comando passar, seu ambiente esta pronto.

## Primeiro uso (guia completo para iniciantes)

### Passo 1: iniciar um perfil novo

Escolha um identificador simples para o perfil (ex.: `ana-silva`) e uma pasta de dados local (`.mindclone`):

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva
```

Durante a entrevista, comandos rapidos disponiveis:

- `/status`: mostra progresso atual
- `/skip`: pula pergunta atual
- `/pause`: encerra sessao para retomar depois

### Passo 2: retomar quando quiser

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --resume
```

### Passo 3: ver status sem entrevistar

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --status
```

### Passo 4: exportar artefatos

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --status --export json,markdown,summary,rag-chunks
```

### Passo 5: refinamento pos-fase-10

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --deepening
```

## Estrutura de dados gerada

Dentro do `--baseDir`, a estrutura tipica e:

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

## Comandos principais (resumo rapido)

- Sessao normal:
  `node bin/mindclone.js --baseDir ./.mindclone --profile <id>`
- Retomar:
  `node bin/mindclone.js --baseDir ./.mindclone --profile <id> --resume`
- Status:
  `node bin/mindclone.js --baseDir ./.mindclone --profile <id> --status`
- Exportar:
  `node bin/mindclone.js --baseDir ./.mindclone --profile <id> --status --export json,summary`
- Deepening:
  `node bin/mindclone.js --baseDir ./.mindclone --profile <id> --deepening`

## Modos avancados explicados

### `--mirror`

Mostra um resumo reflexivo do estado atual do perfil.

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --mirror
```

### `--journal` e `--journal-tags`

Registra entrada livre de diario ligada ao perfil.

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --journal "Hoje tive mais clareza" --journal-tags reflexao,clareza
```

### `--import`

Importa um JSON externo e faz merge no perfil.

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --import ./dados/perfil-externo.json
```

### `--compare`

Compara dois perfis.

```bash
node bin/mindclone.js --baseDir ./.mindclone --compare ana-silva,bruno-souza
```

Ou comparacao relativa ao perfil atual:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --compare bruno-souza
```

### `--plugin`

Carrega plugin(s) por caminho.

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --status --plugin ./plugins/audit.js,./plugins/metrics.js
```

Contrato minimo de plugin:

```js
module.exports = {
  name: "sample-plugin",
  async onCliEvent(eventName, context) {
    // Recebe eventos da CLI e contexto da execucao.
  },
};
```

### `--telemetry on|off|status`

Controla telemetria anonimizada opt-in.

```bash
node bin/mindclone.js --baseDir ./.mindclone --telemetry on
node bin/mindclone.js --baseDir ./.mindclone --telemetry status
node bin/mindclone.js --baseDir ./.mindclone --telemetry off
```

## Providers de IA

Voce pode configurar provider e parametros por flags:

- `--provider` (`local`, `openai`, `anthropic`, `ollama`)
- `--ai-model`
- `--ai-key`
- `--ai-base-url`
- `--ai-timeout`
- `--ai-retries`

Exemplo:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --provider openai --ai-model gpt-4.1-mini --ai-key SUA_CHAVE
```

Variaveis de ambiente equivalentes:

- `MINDCLONE_AI_PROVIDER`
- `MINDCLONE_AI_MODEL`
- `MINDCLONE_AI_API_KEY`
- `MINDCLONE_AI_BASE_URL`
- `MINDCLONE_AI_TIMEOUT_MS`
- `MINDCLONE_AI_RETRIES`

## Criptografia local

Se dados do perfil estiverem criptografados, defina:

```bash
MINDCLONE_ENCRYPTION_KEY=<sua-chave>
```

Exemplo no PowerShell:

```powershell
$env:MINDCLONE_ENCRYPTION_KEY="minha-chave"
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --status
```

## Troubleshooting (erros comuns)

### Erro: "Dados criptografados detectados para este perfil..."

Exemplo real de mensagem:

`Erro ao executar MindClone: Dados criptografados detectados para este perfil. Defina MINDCLONE_ENCRYPTION_KEY para acessar dados existentes...`

O que isso significa:

- esse perfil ja tem arquivos criptografados no `baseDir`;
- sem a chave correta, a CLI nao consegue ler `status`, `resume` nem abrir sessao normal desse perfil existente;
- o provider (`openai`, `local`, `anthropic`, `ollama`) nao muda esse comportamento.

Como resolver (3 cenarios):

1. Voce sabe a chave original:
   defina `MINDCLONE_ENCRYPTION_KEY` e rode novamente.
2. Voce nao sabe a chave e quer continuar esse mesmo perfil:
   sem a chave original nao e possivel descriptografar dados antigos.
3. Voce nao sabe a chave e quer recomecar:
   use outro `--profile` ou outro `--baseDir` para iniciar dados novos.

Exemplo PowerShell:

```powershell
$env:MINDCLONE_ENCRYPTION_KEY="sua-chave-original"
node bin/mindclone.js --baseDir ./.mindclone --profile gabriel-vidoretto --status
```

### Erro: "Perfil nao encontrado..."

Causas comuns:

- `--profile` errado;
- `--baseDir` errado;
- uso de `--resume` em perfil ainda nao criado.

Como resolver:

1. Confirme `--baseDir`.
2. Confirme `--profile`.
3. Se for primeiro uso, rode sem `--resume`.

### Erro: "Plugin invalido..."

Causas comuns:

- caminho invalido;
- arquivo nao exporta objeto.

Como resolver:

1. Revise caminho passado em `--plugin`.
2. Garanta `module.exports = { ... }`.
3. Corrija erros de sintaxe no plugin.

### Erro: valor invalido para `--telemetry`

Use apenas:

- `on`
- `off`
- `status`

## FAQ rapido

### Preciso terminar tudo em uma sessao?

Nao. O fluxo foi feito para pausar e retomar com seguranca.

### Posso usar sem provider externo?

Sim. Existe provider local/fallback para manter o fluxo.

### Onde ficam meus dados?

No `--baseDir` que voce escolheu.

### Como gerar saida para RAG?

Use `--status --export ...` incluindo `rag-chunks`.

## Qualidade e testes

- Rodar testes:

```bash
npm test
```

- Validar formatacao:

```bash
npm run format:check
```

- Validacao completa:

```bash
npm run verify
```

## Glossario rapido

- `profileId`: identificador unico do perfil (ex.: `ana-silva`).
- `baseDir`: pasta raiz de dados locais do MindCloner.
- `deepening`: refinamento continuo apos fase 10.
- `rag-chunks`: fragmentos estruturados para indexacao/consulta por IA.
