# TODO - Pendencias Ativas de Release (CLI Dinamica MindCloner)

Ultima atualizacao: 2026-03-05
Responsavel atual: Codex
Referencia principal: `tasks/plano-cli-entrevista-dinamica.md`
Historico detalhado: `tasks/todo-archive-2026-03-04.md`

## 1) Estado atual consolidado

- Status de implementacao: 100% concluido no escopo tecnico do plano inicial.
- Implementacao funcional (F0-F7) concluida.
- Gates internos 1 a 5 marcados como fechados no ciclo anterior.
- Higiene de workspace (P3 anterior) concluida.
- Gap do plano inicial sobre smoke com comando global `mindcloner` concluido.
- Evidencias atuais em `tasks/evidence/` preservadas para auditoria.

## 2) O que falta (pendencias reais)

- Nenhuma pendencia aberta no plano de release atual (R1 e R2 concluidos).
- Pendencia residual apenas operacional (fora de implementacao): abrir PR e publicar release.

### R1 - Fechar gap do plano inicial: smoke manual com comando global `mindcloner`

Contexto:

- No plano inicial (secao 11), o gate final pede smoke manual no PowerShell com comando global `mindcloner`.
- A evidencia manual atual foi registrada com `node bin/mindclone.js`.

Checklist:

- [x] R1.1 Preparar comando global local (`npm link`) no ambiente de teste.
- [x] R1.2 Executar smoke manual TTY no PowerShell usando `mindcloner --baseDir ./.mindclone --profile smoke-tty-a2`.
- [x] R1.3 Validar menu por setas + comandos slash essenciais (`/status`, `/save`, `/new`, `/menu`, `/pause`).
- [x] R1.4 Validar export por menu com `Resumo para IA` e `Pacote completo`.
- [x] R1.5 Registrar evidencia em `tasks/evidence/manual-smoke-tty-mindcloner-20260304-2234.md`.

Criterio de aceite:

- [x] Evidencia manual de smoke com `mindcloner` anexada e sem erro bloqueante.

### R2 - Preparacao final de PR/release

Checklist:

- [x] R2.1 Revisar `git status` e confirmar somente arquivos esperados de implementacao/release.
- [x] R2.2 Revisar diff final de `README.md`, `package.json`, `src/**`, `test/**`, `scripts/**`, `tasks/evidence/**`.
- [x] R2.3 Escrever resumo final de release (escopo entregue + evidencias principais) para descricao de PR.

Criterio de aceite:

- [x] Pacote de alteracoes pronto para abrir PR sem pendencias operacionais.

## 3) Evidencias atuais ja disponiveis

- `tasks/evidence/manual-smoke-tty-20260304-2210.md`
- `tasks/evidence/manual-smoke-tty-mindcloner-20260304-2234.md`
- `tasks/evidence/smoke-report-20260304-220233.json`
- `tasks/evidence/smoke-bootstrap-20260304-220233.log`
- `tasks/evidence/smoke-session-20260304-220233.log`
- `tasks/evidence/smoke-status-20260304-220233.log`
- `tasks/evidence/release-readiness-20260304-220216.json`
- `tasks/evidence/release-readiness-verify-20260304-220216.log`
- `tasks/evidence/release-readiness-smoke-20260304-220216.log`

## 4) Proxima acao recomendada

1. Abrir PR/release usando `tasks/release-pr-summary-20260305.md` como base da descricao.

## 6) Status final objetivo

- Implementacao do projeto: concluida (100% do escopo planejado).
- Qualidade: `npm run verify` aprovado.
- Smoke PowerShell: aprovado (assistido + manual TTY + comando global `mindcloner`).
- Falta para encerrar ciclo: somente workflow externo de PR/release.

## 5) Fechamento do R2

- Revisao de status final concluida (`git status`).
- Revisao de diff por escopo concluida (`README`, `package`, `src`, `test`, `scripts`, `tasks/evidence`).
- Verificacao de qualidade executada novamente em 2026-03-05:
  - `npm run verify` aprovado (82 testes, 0 falhas).
- Resumo final para PR gerado em:
  - `tasks/release-pr-summary-20260305.md`.
