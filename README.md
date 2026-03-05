# MindCloner

MindCloner e uma CLI com UX guiada por menu para mapear perfil em 10 fases, manter continuidade entre sessoes e exportar artefatos prontos para uso humano e IA.

## O que voce consegue fazer

- Rodar onboarding guiado na primeira execucao (setup + consentimento).
- Navegar no menu principal por setas (`Iniciar`, `Continuar`, `Gerar documento`, `Configuracoes`, `Diagnostico`).
- Entrevistar em modo `adaptive` ou `phased`.
- Executar handoff anti-alucinacao com `/save` e `/new` durante a conversa.
- Exportar documentos direto pelo menu, sem depender de flags.

## Requisitos

- Node.js 20+
- npm
- PowerShell/CMD/Bash/zsh (PowerShell e ambiente prioritario)

## Instalacao

```bash
git clone https://github.com/VIDORETTO/mindCloner.git
cd mindCloner
npm install
npm run verify
```

## Inicio rapido (nova UX de menu)

### 1) Abrir a CLI

```bash
node bin/mindclone.js --baseDir ./.mindclone --profile meu-perfil
```

Alternativa com binario:

```bash
npx mindcloner --baseDir ./.mindclone --profile meu-perfil
```

### 2) Primeiro uso (wizard)

No primeiro uso, a CLI abre setup guiado para:

- `defaultProfileId`
- `baseDir`
- modo padrao da entrevista (`adaptive` ou `phased`)
- limite de perguntas por sessao
- consentimento
- cadastro opcional de API key OpenAI

Provider/modelo sao travados nesta fase para:

- provider: `openai`
- model: `gpt-5-mini-2025-08-07`

### 3) Menu principal

Use setas e Enter. Fluxo recomendado:

1. `Iniciar entrevista` (ou `Continuar entrevista`)
2. responder perguntas
3. usar comandos slash quando necessario
4. `/menu` para voltar ao menu principal
5. `Gerar documento` para exportar

## Comandos slash durante entrevista

Comandos disponiveis:

- `/help`: mostra ajuda rapida
- `/status`: mostra progresso atual
- `/save`: salva snapshot de handoff
- `/new`: inicia nova sessao de agente com ultimo handoff
- `/pause`: encerra sessao com persistencia
- `/menu`: volta ao menu principal sem perder dados

## Fluxo anti-alucinacao (`/save` -> `/new`)

Use quando a conversa perder qualidade/contexto:

1. durante a entrevista, execute `/save`
2. confirme caminho do snapshot gerado
3. execute `/new`
4. a CLI inicia sessao nova de agente reaproveitando o ultimo handoff

Resultado: continuidade auditavel sem perder estado do perfil.

## Configuracoes pelo menu

Opcao `Configuracoes` reabre o wizard de edicao para ajustar:

- perfil padrao
- diretorio base de dados
- modo padrao da entrevista
- limite de perguntas por sessao
- consentimento ativo
- API key OpenAI (opcional)

Arquivos de configuracao:

- `settings.json`
- `settings.secrets.json` (criptografado quando `MINDCLONE_ENCRYPTION_KEY` estiver definido)

## Geracao de documentos pelo menu

No menu `Gerar documento`, selecione um preset por setas:

- `Resumo para IA` -> `context-pack.md`
- `Perfil completo em Markdown` -> `profile.md`
- `JSON estruturado` -> `profile.json`
- `Resumo executivo` -> `summary.txt`
- `RAG chunks` -> `rag-chunks.jsonl`
- `Pacote completo` -> todos os formatos

A CLI mostra o diretorio final e cada arquivo gerado em:

- `exports/<profileId>/`

## Guia rapido (passo a passo)

1. `node bin/mindclone.js --baseDir ./.mindclone --profile ana-silva`
2. concluir setup inicial
3. escolher `Iniciar entrevista`
4. durante a conversa, usar `/status` e `/save` quando necessario
5. usar `/new` se precisar trocar de contexto de agente
6. usar `/menu` ao terminar a sessao
7. escolher `Gerar documento` e selecionar preset
8. validar arquivos em `./.mindclone/exports/ana-silva/`

## Operacao avancada por flags (compatibilidade)

- status: `--status`
- retomar: `--resume`
- deepening: `--deepening`
- export direto: `--status --export summary,markdown`
- diario: `--journal` e `--journal-tags`
- comparacao: `--compare`
- importacao: `--import`
- telemetria: `--telemetry on|off|status`
- plugin: `--plugin`

## Estrutura de dados local (resumo)

```text
<baseDir>/
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
      profile.json
      profile.md
      summary.txt
      rag-chunks.jsonl
      context-pack.md
  settings.json
  settings.secrets.json
  telemetry.json
```

## Troubleshooting rapido

### Dados criptografados detectados

Causa: perfil foi salvo com criptografia e a chave atual nao confere.

Acao recomendada:

- definir `MINDCLONE_ENCRYPTION_KEY` correta e tentar novamente
- ou usar novo `--profile` para recomecar

### Perfil nao encontrado

Causa: `--profile`/`--baseDir` nao correspondem a dados existentes.

Acao recomendada:

- revisar `--baseDir`
- revisar `--profile`
- evitar `--resume` no primeiro uso

### Falha ao exportar documentos

Causa comum: formato invalido em `--export` ou erro de escrita.

Acao recomendada:

- usar formatos suportados (`json`, `markdown`, `summary`, `rag-chunks`, `context-pack`)
- validar permissao de escrita no diretorio base

## Qualidade

- testes: `npm test`
- lint: `npm run lint`
- typecheck: `npm run typecheck`
- verificacao completa: `npm run verify`
- smoke assistido PowerShell: `npm run smoke:powershell`

## Smoke de release (PowerShell)

Para gerar evidencias auditaveis de onboarding/sessao com handoff/export:

```powershell
npm run smoke:powershell
```

Saidas geradas:

- relatorio JSON em `tasks/evidence/smoke-report-<timestamp>.json`
- log da sessao em `tasks/evidence/smoke-session-<timestamp>.log`
- log de status/export em `tasks/evidence/smoke-status-<timestamp>.log`

## Readiness consolidado

Para executar `verify` + smoke e gerar um unico status de prontidao:

```bash
npm run release:readiness
```

Saidas:

- `tasks/evidence/release-readiness-<timestamp>.json`
- `tasks/evidence/release-readiness-verify-<timestamp>.log`
- `tasks/evidence/release-readiness-smoke-<timestamp>.log`
