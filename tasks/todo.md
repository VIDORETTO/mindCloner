# TODO - Execucao Faseada da CLI Dinamica MindCloner

Ultima atualizacao: 2026-03-04
Responsavel atual: Codex
Status geral: Execucao em andamento (F0, F2 e F3 concluidas; F1 smoke manual pendente; F4-F7 pendentes)
Referencia principal: `tasks/plano-cli-entrevista-dinamica.md`
Arquivo historico anterior: `tasks/todo-archive-2026-03-04.md`

## 1) Objetivo deste arquivo

- Centralizar somente o backlog ativo e executavel.
- Organizar o trabalho por fases de entrega (F0 a F7).
- Mostrar criterio de aceite e verificacao de cada fase.
- Referenciar explicitamente as secoes do plano tecnico mestre.

## 2) Snapshot atual

- [x] Plano completo publicado em `tasks/plano-cli-entrevista-dinamica.md`.
- [x] Backlog antigo arquivado em `tasks/todo-archive-2026-03-04.md`.
- [x] Implementacao do novo escopo iniciada.

## 3) Regras de execucao (Ready / Done)

### Ready (antes de implementar fase)

- [ ] Escopo da fase validado em 1 frase.
- [ ] Dependencias de codigo mapeadas (arquivos/modulos).
- [ ] Criterio de aceite objetivo definido.
- [ ] Risco principal da fase com mitigacao definida.

### Done (antes de marcar fase concluida)

- [ ] Codigo implementado sem workaround temporario.
- [ ] Testes relevantes executados com sucesso.
- [ ] Smoke manual realizado quando aplicavel.
- [ ] Documentacao atualizada (`README.md` e este `tasks/todo.md`).

## 4) Fases e tasks (backlog principal)

### F0 - Preparacao tecnica e alinhamento

Referencias no plano:

- Secao 6) Arquitetura tecnica alvo
- Secao 9) F0 - Preparacao tecnica
- Secao 16) Decisoes travadas para simplificar o escopo inicial

Tasks:

- [x] F0.1 Fechar decisao da lib de UI TTY (`@inquirer/prompts` ou `enquirer`).
- [x] F0.2 Definir contrato unico de estado da UI (router de telas + contexto global).
- [x] F0.3 Definir formato final de `settings.json` e estrategia de segredo da API key.
- [x] F0.4 Registrar decisoes em ADR curta dentro de `tasks/`.

Criterio de aceite:

- [x] Documento tecnico da fase aprovado e sem pontos abertos criticos.

Verificacao:

- [x] Revisao tecnica do desenho antes de iniciar F1.
- Evidencia: `tasks/adr-0001-f0-cli-dinamica-foundation.md`.

### F1 - Shell interativo com setas (menu principal)

Referencias no plano:

- Secao 4.1) Entrada e bootstrap da CLI
- Secao 4.2) Menu principal com setas
- Secao 6.2) `src/cli/tui-shell.js` e `src/cli/screen-router.js`
- Secao 9) F1 - Shell interativo com setas
- Secao 10) Plataforma CLI

Tasks:

- [x] F1.1 Criar `src/cli/tui-shell.js` com navegacao por setas e atalhos (`Enter`, `Esc`, `?`).
- [x] F1.2 Criar `src/cli/screen-router.js` com estados: Home, Entrevista, Documentos, Configuracoes, Diagnostico, Sair.
- [x] F1.3 Integrar novo shell ao entrypoint preservando fallback do fluxo atual.
- [x] F1.4 Exibir help contextual da opcao selecionada no menu principal.

Criterio de aceite:

- [x] Usuario navega no menu principal sem digitar comandos manuais.

Verificacao:

- [x] Teste de integracao de transicao entre telas.
- [ ] Smoke manual no PowerShell.

### F2 - Setup inicial e configuracoes guiadas

Referencias no plano:

- Secao 4.3) Setup inicial guiado
- Secao 4.8) Configuracoes em menu
- Secao 6.2) `src/config/settings-manager.js` e `src/config/settings-schema.js`
- Secao 7.1) Contrato `settings.json`
- Secao 9) F2 - Setup e configuracao guiada
- Secao 10) Configuracao e onboarding

Tasks:

- [x] F2.1 Criar `src/config/settings-schema.js` com defaults seguros.
- [x] F2.2 Criar `src/config/settings-manager.js` para carregar/salvar config local.
- [x] F2.3 Implementar wizard de primeiro uso para perfil padrao, `baseDir`, API key e consentimento.
- [x] F2.4 Trancar provider/modelo inicial em OpenAI `gpt-5-mini-2025-08-07`.
- [x] F2.5 Implementar tela de configuracoes editavel no menu.

Criterio de aceite:

- [x] Usuario novo inicia entrevista sem precisar passar flags de CLI.

Verificacao:

- [x] Teste unitario de validacao de config.
- [x] Teste de primeiro uso (config inexistente -> wizard -> menu).

### F3 - Entrevista em dois modos (faseado + adaptativo)

Referencias no plano:

- Secao 4.4) Modos de entrevista
- Secao 6.2) `src/ai/adaptive-interview-engine.js`
- Secao 9) F3 - Entrevista em 2 modos
- Secao 10) Entrevista IA
- Secao 13) Riscos (alucinacao em modo adaptativo)

Tasks:

- [x] F3.1 Integrar modo faseado existente no novo shell de entrevista.
- [x] F3.2 Implementar `src/ai/adaptive-interview-engine.js` com perguntas baseadas em lacunas/contradicoes.
- [x] F3.3 Reusar `question-validator` para validar perguntas adaptativas antes de exibir.
- [x] F3.4 Exibir progresso e resumo de sessao nos dois modos.
- [x] F3.5 Garantir persistencia continua sem quebrar estado existente.

Criterio de aceite:

- [x] Ambos os modos funcionam com persistencia e atualizacao de completude.

Verificacao:

- [x] Teste de integracao para troca de modo.
- [x] Smoke de sessao curta em cada modo.

### F4 - Handoff de agente (`/save` e `/new`)

Referencias no plano:

- Secao 4.5) Comandos em tempo real durante entrevista
- Secao 4.6) Fluxo anti-alucinacao com handoff
- Secao 6.2) `src/cli/commands.js` e `src/ai/handoff-manager.js`
- Secao 7.2) Contrato `handoff-<timestamp>.json`
- Secao 9) F4 - Comandos `/save` e `/new`
- Secao 10) Handoff de agente

Tasks:

- [ ] F4.1 Criar `src/cli/commands.js` com parser para `/help`, `/status`, `/save`, `/new`, `/pause`, `/menu`.
- [ ] F4.2 Criar `src/ai/handoff-manager.js` para gerar e carregar snapshots de continuidade.
- [ ] F4.3 Implementar comportamento `/save` no loop de entrevista.
- [ ] F4.4 Implementar comportamento `/new` iniciando sessao nova com contexto salvo.
- [ ] F4.5 Persistir historico de handoffs por perfil com timestamp.

Criterio de aceite:

- [ ] Fluxo `/save` -> `/new` preserva contexto e reinicia sessao de agente.

Verificacao:

- [ ] Teste E2E dedicado ao handoff.
- [ ] Confirmacao de arquivo de handoff criado e reutilizado.

### F5 - Geracao de documento no menu

Referencias no plano:

- Secao 4.7) Geracao de documento pela propria CLI
- Secao 6.2) `src/profile/context-pack-exporter.js`
- Secao 9) F5 - Gerador de documento no menu
- Secao 10) Documentos e exportacao

Tasks:

- [ ] F5.1 Implementar tela `Gerar documento` com selecao por setas.
- [ ] F5.2 Criar `src/profile/context-pack-exporter.js` para preset "Resumo para IA".
- [ ] F5.3 Integrar presets existentes (`json`, `markdown`, `summary`, `rag-chunks`).
- [ ] F5.4 Exibir caminho de saida e resultado final da exportacao.

Criterio de aceite:

- [ ] Usuario exporta documentos sem usar flags de linha de comando.

Verificacao:

- [ ] Teste de integracao do menu de export.
- [ ] Verificacao de arquivos gerados no diretorio correto.

### F6 - QA, hardening e compatibilidade

Referencias no plano:

- Secao 5) Requisitos nao funcionais
- Secao 9) F6 - QA, hardening e compatibilidade
- Secao 11) Estrategia de testes e verificacao
- Secao 13) Riscos principais e mitigacoes
- Secao 14) Definicao de pronto para release

Tasks:

- [ ] F6.1 Cobrir novos modulos com testes unitarios.
- [ ] F6.2 Cobrir fluxo TTY e non-TTY sem regressao dos testes atuais.
- [ ] F6.3 Revisar mensagens de erro para padrao "causa + acao recomendada".
- [ ] F6.4 Validar recuperacao de falhas de I/O e consistencia de persistencia.
- [ ] F6.5 Rodar `npm run verify` e corrigir regressao restante.

Criterio de aceite:

- [ ] Suite automatizada verde e smoke manual aprovado no PowerShell.

Verificacao:

- [ ] `npm run verify` ok.
- [ ] Smoke de onboarding, entrevista, `/save`/`/new` e export ok.

### F7 - Documentacao de produto e release

Referencias no plano:

- Secao 9) F7 - Documentacao de produto
- Secao 11) Estrategia de testes e verificacao
- Secao 14) Definicao de pronto para release
- Secao 15) Cronograma sugerido

Tasks:

- [ ] F7.1 Atualizar `README.md` com onboarding da nova UX de menu.
- [ ] F7.2 Documentar comandos slash e fluxo anti-alucinacao.
- [ ] F7.3 Documentar menu de configuracoes e export de documentos.
- [ ] F7.4 Adicionar guia rapido para usuario final (passo a passo).
- [ ] F7.5 Registrar evidencias finais da release neste arquivo.

Criterio de aceite:

- [ ] Usuario novo conclui setup e uso basico sem suporte tecnico.

Verificacao:

- [ ] Revisao final de docs + smoke de comandos documentados.

## 5) Ordem de execucao (gates)

- [x] Gate 1: F0 concluida.
- [ ] Gate 2: F1 + F2 concluidas (UI base + setup guiado).
- [ ] Gate 3: F3 + F4 concluidas (entrevista + handoff).
- [ ] Gate 4: F5 concluida (documentos por menu).
- [ ] Gate 5: F6 + F7 concluidas (qualidade + docs + release).

## 6) Revisao da entrega (ciclo atual)

- Escopo executado: entrega da F3 com modo adaptativo integrado ao `runSession`, motor `adaptive-interview-engine`, selecao de modo via config/flag e validacao anti-alucinacao preservada.
- Resultado objetivo: dois modos operacionais (`phased` e `adaptive`) funcionando no mesmo fluxo com persistencia e transicao de fases no modo adaptativo.
- Evidencias: `src/ai/adaptive-interview-engine.js`; integracoes em `src/index.js`, `src/cli/menu.js`, `src/cli/setup-wizard.js`; testes `test/adaptive-interview.e2e.test.js` e `test/cli-tui.test.js`; `npm run verify` (ok, 65/65).
- Risco remanescente: smoke manual no PowerShell continua pendente para fechamento formal da F1 (UX TTY real).
- Proxima acao recomendada: iniciar F4 (`/save` + `/new` + handoff manager).
