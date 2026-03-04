# Lessons Learned

Ultima atualizacao: 2026-03-04

## Regras ativas

- Sempre manter pipeline de CI versionado para validar lint, typecheck e testes a cada push/PR.
- Toda evolucao estrutural deve incluir guardrails de qualidade no `package.json` (`lint`, `typecheck`, `verify`).
- Projeto executavel deve ter governanca minima publicada (`LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`).
- Atualizar metadados e documentacao para refletir o estado real do produto, evitando descricoes obsoletas.
- Encerrar cada ciclo com evidencias de verificacao no `tasks/todo.md`.
