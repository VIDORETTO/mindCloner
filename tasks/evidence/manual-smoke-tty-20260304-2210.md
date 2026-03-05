# Evidencia - Smoke manual TTY no PowerShell

- Data/hora: 2026-03-04 22:10 (America/Sao_Paulo)
- Ambiente: PowerShell 7.5.4 (TTY real)
- Comando base: `node bin/mindclone.js --baseDir ./.mindclone --profile smoke-tty-a1`
- Perfil/baseDir: `smoke-tty-a1` em `./.mindclone`

## Objetivo

Executar o gate manual P1 com validacao de navegacao TTY, comandos slash da entrevista e export por menu.

## Execucao e resultados

### P1.1 Executar CLI em terminal TTY real

- Resultado: OK.
- Evidencia observada: abertura da TUI com menu principal e deteccao interativa (setas + Enter).

### P1.2 Validar navegacao por setas no menu

- Resultado: OK.
- Itens navegados por setas: `Iniciar entrevista`, `Continuar entrevista`, `Gerar documento`, `Configuracoes`, `Diagnostico`, `Sair`.
- Evidencia observada: highlight mudou corretamente entre todas as opcoes e retornou para `Iniciar entrevista`.

### P1.3 Validar comandos slash da entrevista

- Resultado: OK.
- Comandos executados em TTY real:
  - `/status`: exibiu progresso/fase/completude/sessoes.
  - `/save`: gerou handoff em `.mindclone/profiles/smoke-tty-a1/handoffs/handoff-20260305T010904Z.json`.
  - `/new`: iniciou nova sessao a partir do handoff salvo.
  - `/menu`: retornou ao menu principal sem crash.
  - `/pause`: encerrou sessao com resumo de fase e saida limpa (exit code 0).
- Observacao: provider OpenAI sem chave (`missing-api-key`) acionou fallback local como esperado.

### P1.4 Validar `Gerar documento` para presets obrigatorios

- Resultado: OK.
- Presets executados por menu:
  - `Resumo para IA` (`context-pack`)
  - `Pacote completo` (`all`)
- Arquivos verificados em `.mindclone/exports/smoke-tty-a1/`:
  - `context-pack.md`
  - `profile.json`
  - `profile.md`
  - `summary.txt`
  - `rag-chunks.jsonl`

### P1.5 Registrar evidencia manual

- Resultado: OK.
- Este arquivo cumpre a evidencia manual do smoke TTY.

## Validacoes de artefatos (filesystem)

- Handoffs:
  - `.mindclone/profiles/smoke-tty-a1/handoffs/handoff-20260305T010904Z.json`
  - `.mindclone/profiles/smoke-tty-a1/handoffs/history.json`
- Exports:
  - `.mindclone/exports/smoke-tty-a1/context-pack.md`
  - `.mindclone/exports/smoke-tty-a1/profile.json`
  - `.mindclone/exports/smoke-tty-a1/profile.md`
  - `.mindclone/exports/smoke-tty-a1/summary.txt`
  - `.mindclone/exports/smoke-tty-a1/rag-chunks.jsonl`

## Conclusao

- Smoke manual TTY no PowerShell: APROVADO.
- Sem erros bloqueantes de UX/fluxo durante o gate P1.
