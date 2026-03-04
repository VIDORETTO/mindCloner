# MindCloner

MindCloner e uma CLI (programa de terminal) para mapear um perfil em 10 fases, salvar progresso localmente e operar funcoes avancadas como exportacao, comparacao, diario e plugins.

Este README foi escrito para iniciantes. Se voce nunca usou esse projeto, siga a secao "Primeiro uso".

## 1) O que voce precisa

- Node.js 20 ou superior
- Terminal (PowerShell, CMD, Bash, etc.)
- Projeto clonado/baixado localmente

## 2) Instalacao

No diretorio do projeto:

```bash
npm install
```

## 3) Primeiro uso (passo a passo)

### Passo 1: escolher uma pasta de dados

O `--baseDir` e onde o MindCloner salva seus perfis.

Exemplo:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile joao-silva
```

### Passo 2: responder as perguntas

O fluxo normal passa por fases 1-10. Voce pode usar comandos durante a entrevista:

- `/status`: mostra progresso atual
- `/skip`: pula a pergunta atual
- `/pause`: encerra a sessao atual

### Passo 3: retomar depois

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile joao-silva --resume
```

### Passo 4: consultar status sem entrevistar

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile joao-silva --status
```

### Passo 5: exportar resultados

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile joao-silva --status --export json,markdown,summary,rag-chunks
```

## 4) Comandos principais (resumo rapido)

- Criar/continuar sessao normal:
  `node bin/mindclone.js --baseDir ./.mindclone --profile <id>`
- Retomar perfil existente:
  `node bin/mindclone.js --baseDir ./.mindclone --profile <id> --resume`
- Ver status:
  `node bin/mindclone.js --baseDir ./.mindclone --profile <id> --status`
- Exportar:
  `node bin/mindclone.js --baseDir ./.mindclone --profile <id> --status --export json,summary`
- Deepening pos-fase-10:
  `node bin/mindclone.js --baseDir ./.mindclone --profile <id> --deepening`

## 5) Modos avancados explicados

### 5.1 `--deepening`

O que faz:

- Roda perguntas de refinamento depois que a fase 10 ja foi concluida.

Quando usar:

- Quando voce quer aumentar completude/confianca sem recomecar do zero.

Exemplo:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile joao-silva --deepening
```

### 5.2 `--mirror`

O que faz:

- Mostra um resumo reflexivo com base no perfil e nas ultimas entradas de diario.

Quando usar:

- Para revisar rapidamente o estado atual da pessoa/perfil.

Exemplo:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile joao-silva --mirror
```

### 5.3 `--journal` e `--journal-tags`

O que faz:

- Salva uma entrada de diario associada ao perfil.

Quando usar:

- Para registrar contexto que nao veio da entrevista principal.

Exemplo:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile joao-silva --journal "Hoje avancei no projeto" --journal-tags foco,energia
```

### 5.4 `--import`

O que faz:

- Importa dados de um arquivo JSON externo e faz merge no perfil.

Quando usar:

- Para acelerar onboarding com dados ja existentes.

Exemplo:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile joao-silva --import ./dados/perfil-externo.json
```

### 5.5 `--compare`

O que faz:

- Compara dois perfis e mostra diferencas resumidas.

Modos:

- Direto (2 ids): `--compare perfil-a,perfil-b`
- Relativo ao perfil atual: `--profile perfil-a --compare perfil-b`

Exemplos:

```bash
node bin/mindclone.js --baseDir ./.mindclone --compare perfil-a,perfil-b
node bin/mindclone.js --baseDir ./.mindclone --profile perfil-a --compare perfil-b
```

### 5.6 `--plugin`

O que faz:

- Carrega plugin(s) por caminho para receber eventos de CLI.

Exemplo de uso:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile joao-silva --status --plugin ./plugins/audit.js,./plugins/metrics.js
```

Contrato minimo de plugin:

```js
module.exports = {
  name: "sample-plugin",
  async onCliEvent(eventName, context) {
    // eventName pode ser:
    // cli:start, cli:status, cli:mirror, cli:journal,
    // cli:import, cli:compare, cli:session-finished
    // context traz args, profileId, baseDir, io e payload do evento.
  },
};
```

### 5.7 `--telemetry on|off|status`

O que faz:

- Liga/desliga/consulta telemetria anonimizada opt-in.

Exemplos:

```bash
node bin/mindclone.js --baseDir ./.mindclone --telemetry on
node bin/mindclone.js --baseDir ./.mindclone --telemetry off
node bin/mindclone.js --baseDir ./.mindclone --telemetry status
```

## 6) Exportacao detalhada

Formatos suportados:

- `json`
- `markdown`
- `summary`
- `rag-chunks`

Comando:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile joao-silva --status --export json,markdown,summary,rag-chunks
```

Pasta de saida:

```text
exports/<profileId>/
```

## 7) Providers de IA

Flags:

- `--provider` (ex.: `local`, `openai`, `anthropic`, `ollama`)
- `--ai-model`
- `--ai-key`
- `--ai-base-url`
- `--ai-timeout`
- `--ai-retries`

Exemplo:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile joao-silva --provider openai --ai-model gpt-4.1-mini --ai-key SUA_CHAVE
```

Variaveis de ambiente equivalentes:

- `MINDCLONE_AI_PROVIDER`
- `MINDCLONE_AI_MODEL`
- `MINDCLONE_AI_API_KEY`
- `MINDCLONE_AI_BASE_URL`
- `MINDCLONE_AI_TIMEOUT_MS`
- `MINDCLONE_AI_RETRIES`

## 8) Criptografia local

Se seus dados estiverem criptografados, voce precisa informar:

```bash
MINDCLONE_ENCRYPTION_KEY=<sua-chave>
```

Sem essa chave correta, comandos que leem perfis (como `--resume` e `--status`) podem falhar.

## 9) Estrutura de dados (visao simples)

Dentro de `--baseDir`, o projeto cria arquivos/pastas como:

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

## 10) Troubleshooting (erros comuns)

### Erro: "Dados criptografados detectados..."

Causa comum:

- Voce tem dados criptografados e nao definiu `MINDCLONE_ENCRYPTION_KEY`.

Como resolver:

1. Defina a variavel de ambiente com a chave correta.
2. Rode novamente o comando.

Exemplo (PowerShell):

```powershell
$env:MINDCLONE_ENCRYPTION_KEY="minha-chave"
node bin/mindclone.js --baseDir ./.mindclone --profile joao-silva --status
```

### Erro: "Perfil nao encontrado..."

Causa comum:

- `--profile` esta errado.
- `--baseDir` nao aponta para a pasta onde o perfil foi salvo.
- Uso de `--resume` para perfil que ainda nao existe.

Como resolver:

1. Confirme `--baseDir` correto.
2. Confirme `--profile` correto.
3. Se for primeiro uso, rode sem `--resume`.

### Erro: "Plugin invalido..."

Causa comum:

- Arquivo nao exporta objeto.
- Caminho do plugin esta errado.

Como resolver:

1. Verifique caminho do arquivo passado em `--plugin`.
2. Garanta `module.exports = { ... }`.
3. Garanta que o arquivo nao tem erro de sintaxe.

### Erro: valor invalido para `--telemetry`

Causa comum:

- Valor diferente de `on`, `off` ou `status`.

Como resolver:

- Use somente:
  `--telemetry on`
  `--telemetry off`
  `--telemetry status`

## 11) Testes

Rodar todos os testes:

```bash
npm test
```

Validar qualidade completa antes de subir alteracoes:

```bash
npm run lint
npm run typecheck
npm run verify
```

## 12) Receitas prontas (copiar e usar)

### Receita A: onboarding rapido (primeira coleta)

Objetivo:

- Criar perfil, registrar primeiro contexto e checar status.

Comandos:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --journal "Inicio de mapeamento" --journal-tags onboarding,inicio
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --status
```

### Receita B: retomar trabalho parado

Objetivo:

- Continuar exatamente de onde parou.

Comando:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --resume
```

Se der "Perfil nao encontrado":

1. confira `--baseDir`
2. confira `--profile`
3. rode sem `--resume` se for primeiro uso

### Receita C: diagnostico rapido do perfil

Objetivo:

- Obter leitura curta do estado atual sem abrir entrevista.

Comandos:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --status
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --mirror
```

### Receita D: comparar duas pessoas/perfis

Objetivo:

- Ver diferencas entre dois perfis.

Comando:

```bash
node bin/mindclone.js --baseDir ./.mindclone --compare ana-silva,bruno-souza
```

### Receita E: exportar para uso em RAG/IA

Objetivo:

- Gerar artefatos prontos para ingestao e consulta.

Comando:

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --status --export json,summary,rag-chunks
```

Resultado esperado:

- Arquivos em `exports/ana-silva/`
- `rag-chunks` pronto para indexacao vetorial

### Receita F: ligar e auditar telemetria opt-in

Objetivo:

- Ativar coleta anonima e verificar estado.

Comandos:

```bash
node bin/mindclone.js --baseDir ./.mindclone --telemetry on
node bin/mindclone.js --baseDir ./.mindclone --telemetry status
```

### Receita G: fallback rapido para erro de criptografia

Objetivo:

- Resolver leitura de dados criptografados.

Comandos (PowerShell):

```powershell
$env:MINDCLONE_ENCRYPTION_KEY="minha-chave"
node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva --status
```
