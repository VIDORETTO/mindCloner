# Evidencia - Smoke manual TTY no PowerShell com comando global `mindcloner`

- Data/hora: 2026-03-04 22:34 (America/Sao_Paulo)
- Ambiente: PowerShell 7.5.4 (TTY real)
- Preparacao global: `npm link`
- Comando principal validado: `mindcloner --baseDir ./.mindclone --profile smoke-tty-a2`

## Objetivo
Fechar o gap do plano inicial (secao 11) exigindo smoke manual em PowerShell com comando global `mindcloner`.

## Execucao e resultados

### R1.1 Preparacao do comando global
- Resultado: OK.
- Acao executada: `npm link`.
- Evidencia: shims globais criados em `C:/Users/gabri/AppData/Roaming/npm/` (`mindcloner`, `mindcloner.cmd`, `mindcloner.ps1`).

### R1.2 Execucao TTY com comando global
- Resultado: OK.
- Comando executado em PTY PowerShell real:
  - `mindcloner --baseDir ./.mindclone --profile smoke-tty-a2`

### R1.3 Validacao de navegacao e slash commands
- Resultado: OK.
- Menu por setas validado nas opcoes:
  - `Iniciar entrevista`
  - `Continuar entrevista`
  - `Gerar documento`
  - `Configuracoes`
  - `Diagnostico`
  - `Sair`
- Comandos slash validados em sessao real:
  - `/status`
  - `/save`
  - `/new`
  - `/menu`
  - `/pause`
- Handoff gerado:
  - `.mindclone/profiles/smoke-tty-a2/handoffs/handoff-20260305T013336Z.json`

### R1.4 Validacao de export por menu
- Resultado: OK.
- Presets obrigatorios executados:
  - `Resumo para IA` (`context-pack`)
  - `Pacote completo` (`all`)
- Arquivos validados em `.mindclone/exports/smoke-tty-a2/`:
  - `context-pack.md`
  - `profile.json`
  - `profile.md`
  - `summary.txt`
  - `rag-chunks.jsonl`

### R1.5 Registro de evidencia
- Resultado: OK.
- Este arquivo cumpre a evidencia manual solicitada para o comando global `mindcloner`.

## Conclusao
- Smoke manual TTY com comando global `mindcloner`: APROVADO.
- Gap do plano inicial (gate final com `mindcloner`) fechado sem erros bloqueantes.
