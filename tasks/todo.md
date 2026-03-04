# Plano de Execucao - MindCloner

Ultima atualizacao: 2026-03-04
Responsavel atual: Codex
Status geral: Execucao avancada (P0-P2 concluidos, P3 entregue + P3.5 receitas praticas de operacao)

## 1) Objetivo deste arquivo

- Ser a fonte unica de verdade para execucao tecnica.
- Manter backlog priorizado por risco, impacto e dependencia.
- Registrar criterios de aceite e evidencias de verificacao.
- Permitir continuidade de trabalho sem perda de contexto.

## 2) Snapshot atual do projeto

- [x] CLI funcional com fluxo por fases 1-10.
- [x] Persistencia local com hardening (backup/rollback/recuperacao) implementada.
- [x] Testes E2E por fase existentes (`test/phase1..10.e2e.test.js`).
- [x] Deepening continuo pos-fase 10 implementado (`--deepening`).
- [x] Protocolo de seguranca emocional implementado.
- [x] Criptografia de dados em repouso implementada.
- [x] Exportacoes avancadas e operacao completa de CLI implementadas.
- [x] Anti-alucinacao com rastreabilidade de origem/confiança implementado.
- [x] Suporte inicial a LLM local via provider `ollama` implementado.
- [x] README operacional com modos avancados e exemplos validos publicado.
- [x] README detalhado para iniciantes com troubleshooting passo a passo publicado.
- [x] README com secoes de receitas prontas por objetivo operacional publicado.

## 3) Regras de execucao (Definition of Ready / Done)

### Ready (antes de desenvolver)

- [ ] Escopo fechado em 1 frase objetiva.
- [ ] Dependencias mapeadas (arquivos, modulos e comandos afetados).
- [ ] Criterio de aceite mensuravel definido.
- [ ] Risco principal identificado e mitigacao planejada.

### Done (antes de marcar concluido)

- [ ] Implementacao finalizada sem workaround temporario.
- [ ] Testes automatizados relevantes executados com sucesso.
- [ ] Comportamento validado manualmente na CLI quando aplicavel.
- [ ] Documentacao/README/TODO atualizados.
- [x] Secao "Revisao da entrega" preenchida neste arquivo.

## 4) Roadmap priorizado

## P0 - Critico (seguranca, confiabilidade e compliance)

### P0.1 Consentimento informado obrigatorio

- [x] Exibir termo antes de iniciar coleta.
- [x] Exigir aceite explicito para continuar.
- [x] Persistir `consent.accepted_at`, `consent.version`, `consent.source`.
- Criterio de aceite: sem aceite, o fluxo nao inicia.
- Verificacao: teste E2E cobrindo aceite e rejeicao.

### P0.2 Protocolo de crise emocional

- [x] Detectar sinais de risco por regras/padroes definidos.
- [x] Interromper aprofundamento automaticamente quando risco alto.
- [x] Exibir orientacao segura e registrar evento em sessao.
- Criterio de aceite: entrada de risco aciona bloqueio e mensagem segura.
- Verificacao: teste E2E com frases gatilho e assert de interrupcao.

### P0.3 Criptografia local de dados sensiveis

- [x] Criptografar `state`, `sessions` e `mind-profile` em repouso.
- [x] Implementar gestao de chave via ambiente/secret local.
- [x] Garantir leitura/escrita transparente para o app.
- Criterio de aceite: arquivos sensiveis nao legiveis sem chave valida.
- Verificacao: teste de roundtrip + falha com chave invalida.

## P1 - Alto impacto de produto

### P1.1 Deepening continuo (`--deepening`)

- [x] Implementar motor de lacunas, contradicoes e refinamento.
- [x] Reusar historico sem duplicar perguntas.
- [x] Atualizar score de completude e confianca por iteracao.
- Criterio de aceite: nova sessao melhora perfil sem regressao.

### P1.2 Integracao real de providers de IA

- [x] Suportar OpenAI e Anthropic por configuracao.
- [x] Implementar retries com backoff e timeout.
- [x] Definir fallback seguro quando provider indisponivel.
- Criterio de aceite: troca de provider sem alterar fluxo principal.

### P1.3 Validador de perguntas

- [x] Bloquear repeticao, ambiguidade e baixa especificidade.
- [x] Garantir pergunta mapeada para campo alvo do schema.
- [x] Regenerar pergunta automaticamente em caso de invalidacao.
- Criterio de aceite: perguntas invalidas nao chegam ao usuario final.

#### Plano de implementacao P1.3 (execucao atual)

- [x] Criar validador central de pergunta (`src/engine/question-validator.js`) com regras de repeticao, ambiguidade, especificidade e mapeamento de schema.
- [x] Integrar validacao no `runSession` antes de exibir pergunta, com regeneracao automatica via IA e fallback seguro.
- [x] Cobrir regras com testes unitarios de validador e teste de integracao da regeneracao.
- [x] Executar suite de testes e registrar revisao da entrega deste ciclo.

### P1.4 Anti-alucinacao reforcado

- [x] Classificar origem dos dados: `fato`, `auto_relato`, `inferencia`.
- [x] Persistir `confidenceScore` por bloco do perfil.
- [x] Evitar escrita de inferencia como fato confirmado.
- Criterio de aceite: toda entrada no perfil possui rastreabilidade.

#### Plano de implementacao P1.4 (execucao atual)

- [x] Estender metadados do perfil para armazenar rastreabilidade por campo (`source_type`, `confirmed`, `confidence_score`, contexto da pergunta) e agregacao de `confidenceScore` por bloco.
- [x] Integrar rastreabilidade no `applyUpdates` e no fluxo de deepening para garantir cobertura de escrita em todos os caminhos.
- [x] Ajustar classificacao de origem (`fato`, `auto_relato`, `inferencia`) com regra para inferencia nao-confirmada.
- [x] Cobrir com testes (unitario + E2E) e atualizar revisao no `tasks/todo.md`.

## P2 - Operacao e interoperabilidade

### P2.1 Exportacoes profissionais

- [x] Implementar `--export` para `json`, `markdown`, `summary`, `rag-chunks`.
- [x] Padronizar pasta de saida (`exports/<userId>/`).
- [x] Validar schema antes de exportar.
- Criterio de aceite: multiplos formatos gerados com consistencia.

#### Plano de implementacao P2.1 (execucao atual)

- [x] Criar motor de exportacao com validacao de schema e formatos `json`, `markdown`, `summary`, `rag-chunks`.
- [x] Integrar comando `--export` no CLI, aceitando multiplos formatos e mantendo execucao padrao.
- [x] Garantir saida padronizada em `exports/<userId>/` com nomes de arquivo deterministas.
- [x] Cobrir com testes automatizados de exportador e fluxo de CLI + atualizar revisao do ciclo.

### P2.2 Comandos operacionais de CLI

- [x] Implementar/estabilizar `--resume`, `--status`, `--export`.
- [x] Garantir idempotencia nas retomadas.
- [x] Melhorar mensagens de erro orientadas a acao.
- Criterio de aceite: ciclo completo sem edicao manual de arquivos.

#### Plano de implementacao P2.2 (execucao atual)

- [x] Introduzir modo de status somente leitura (`--status`) sem iniciar entrevista.
- [x] Garantir retomada controlada (`--resume`) apenas para perfis existentes e com mensagens acionaveis.
- [x] Reforcar idempotencia operacional de retomada usando `profileId` canonico.
- [x] Cobrir fluxo com testes de CLI para status, resume, export em status e falha orientada.

### P2.3 Hardening de persistencia

- [x] Cobrir corrupcao parcial de arquivo.
- [x] Implementar estrategia de backup/rollback atomico.
- [x] Validar recuperacao de sessao apos falhas de I/O.
- Criterio de aceite: sistema recupera estado sem perda critica.

#### Plano de implementacao P2.3 (execucao atual)

- [x] Reforcar `LocalStore` com escrita segura (arquivo temporario + backup + promote) e rollback automatico.
- [x] Implementar recuperacao de leitura via backup para casos de arquivo ausente/corrompido.
- [x] Criar testes E2E simulando corrupcao parcial e interrupcao de I/O durante persistencia.
- [x] Rodar suite completa e atualizar revisao no `tasks/todo.md`.

## P3 - Backlog estrategico

- [x] Suporte a LLM local (`ollama`).
- [x] Modo espelho (`--mirror`).
- [x] Modo diario (`--journal`).
- [x] Importacao externa (`--import`).
- [x] Comparacao de perfis (`--compare`).
- [x] Sistema de plugins.
- [x] Telemetria anonimizada opt-in.
- [x] Documentacao operacional avancada (`README.md`).
- [x] Documentacao detalhada didatica + troubleshooting (`README.md`).
- [x] Receitas praticas de uso (`README.md`).

#### Plano de implementacao P3.1 (execucao atual)

- [x] Implementar provider `ollama` no `AIClient` com endpoint local configuravel e parse de resposta.
- [x] Integrar configuracao no fluxo (`runSession` + CLI) via `--ai-base-url` e `MINDCLONE_AI_BASE_URL`.
- [x] Cobrir com testes unitarios de sucesso/falha/fallback do provider local.
- [x] Rodar suite de testes e atualizar revisao do ciclo.

#### Plano de implementacao P3.2 (execucao atual)

- [x] Implementar modos CLI `--mirror`, `--journal`, `--import` e `--compare` com comportamento deterministico e mensagens acionaveis.
- [x] Implementar sistema de plugins por caminho (`--plugin`) com hooks de eventos e isolamento de falhas.
- [x] Implementar telemetria anonimizada opt-in (`--telemetry on|off|status`) e coleta somente com consentimento.
- [x] Cobrir novos fluxos com testes automatizados e validar nao regressao.
- [x] Rodar `npm test`, smoke da CLI e registrar revisao do ciclo.

#### Plano de implementacao P3.3 (execucao atual)

- [x] Fechar escopo em uma frase: documentar operacao avancada da CLI para reduzir ambiguidade de uso em producao.
- [x] Mapear dependencias de documentacao: flags reais em `src/cli/menu.js`, scripts em `package.json`, cobertura de testes em `test/cli-ops.test.js` e `test/cli-p3.test.js`.
- [x] Publicar `README.md` com setup, fluxo basico, modos avancados, plugins, telemetria, exportacao, variaveis de ambiente e criptografia.
- [x] Validar coerencia operacional por testes automatizados e smoke dos fluxos documentados.

#### Plano de implementacao P3.4 (execucao atual)

- [x] Expandir `README.md` para linguagem simples, didatica e orientada a iniciantes.
- [x] Adicionar guias passo a passo de primeiro uso, comandos principais e explicacao de quando usar cada modo.
- [x] Adicionar troubleshooting detalhado com causas e correcao para erros reais da CLI (criptografia, perfil nao encontrado, plugin invalido, telemetry invalido).
- [x] Validar comandos documentados por smoke no terminal e atualizar revisao deste ciclo.

#### Plano de implementacao P3.5 (execucao atual)

- [x] Adicionar secao de "receitas prontas" por objetivo no `README.md`.
- [x] Cobrir fluxos chave: onboarding rapido, retomada, diagnostico, comparacao, export para RAG, telemetria e criptografia.
- [x] Garantir formato copia-e-cola com comandos em sequencia.
- [x] Validar coerencia das receitas com smoke e registrar revisao.

## 5) Plano de execucao em ciclos

- [x] Ciclo 1: fechar P0 completo com testes.
- [x] Ciclo 2: entregar P1.1 + P1.2 + P1.3.
- [x] Ciclo 3: concluir P1.4 + P2.1 + P2.2.
- [x] Ciclo 4: P2.3 + backlog P3 conforme capacidade.
- [x] Ciclo 5: P3.3 documentacao operacional avancada.
- [x] Ciclo 6: P3.4 documentacao detalhada para iniciantes + troubleshooting.
- [x] Ciclo 7: P3.5 receitas praticas por objetivo.

## 6) Quadro de verificacao

- [x] Rodar testes: `npm test`.
- [x] Rodar smoke da CLI: `node bin/mindclone.js`.
- [x] Validar nao regressao de fases 1-10.
- [x] Revisar logs de erro e cobertura minima relevante.

## 6.1) Plano de execucao do ciclo atual (pronto para producao)

- [x] Criar pipeline de CI em `.github/workflows/ci.yml` executando install, lint, typecheck e testes.
- [x] Adicionar padrao de qualidade local (`eslint`, `prettier`, `typescript`) com scripts de verificacao no `package.json`.
- [x] Adicionar arquivos de governanca minima: `LICENSE`, `CONTRIBUTING.md` e `SECURITY.md`.
- [x] Criar `tasks/lessons.md` com regras de prevencao e aprendizado operacional.
- [x] Atualizar metadados do pacote para refletir estado real do projeto.
- [x] Validar tudo via comandos locais e registrar evidencias em "Revisao da entrega".

## 7) Revisao da entrega (preencher a cada ciclo)

### Ciclo atual

- Escopo executado: hardening de pronto para producao com CI, quality gates e governanca minima.
- Resultado objetivo: tornar o projeto verificavel em PR/push e operacionalmente auditavel para colaboracao externa.
- Evidencias (testes/comandos): `npm run verify` (lint + typecheck + testes, 49/49 passando); `npm install --save-dev eslint @eslint/js globals prettier typescript`.
- Riscos remanescentes: baseline de lint esta permissivo (`no-empty`/`no-unused-vars` off) e pode ser endurecido por fases sem quebrar backlog atual.
- Proxima acao recomendada: adicionar regras gradativas por pasta (`src/` mais estrito que `test/`) e gate de `npm run format:check` no CI.

### Ciclo anterior

- Escopo executado: P3.5 receitas prontas por objetivo para uso diario da CLI.
- Resultado objetivo: reduzir friccao operacional com comandos copia-e-cola para cenarios comuns.
- Evidencias (testes/comandos): smoke `node bin/mindclone.js --baseDir <tmp> --profile ana-silva --journal "Inicio de mapeamento" --journal-tags onboarding,inicio`; smoke `node bin/mindclone.js --baseDir <tmp> --profile ana-silva --status`; smoke `node bin/mindclone.js --baseDir <tmp> --telemetry on`; smoke `node bin/mindclone.js --baseDir <tmp> --telemetry status`.
- Riscos remanescentes: receitas dependem de manutencao quando novos flags/cenarios forem introduzidos.
- Proxima acao recomendada: adicionar uma tabela "comando -> quando usar -> saida esperada" para consulta rapida.

### Ciclo anterior (P3.4)

- Escopo executado: P3.4 documentacao detalhada para iniciantes com troubleshooting operacional.
- Resultado objetivo: README autoexplicativo para qualquer pessoa usar a CLI do zero ao avancado sem depender de contexto previo.
- Evidencias (testes/comandos): smoke `node bin/mindclone.js --baseDir <tmp> --profile smoke-doc-2 --journal "entrada teste"`; smoke `node bin/mindclone.js --baseDir <tmp> --profile smoke-doc-2 --status`; smoke `node bin/mindclone.js --baseDir <tmp> --telemetry status`; revisao cruzada das flags com `src/cli/menu.js`.
- Riscos remanescentes: exemplos precisam ser mantidos sincronizados se novas flags/eventos forem adicionados.
- Proxima acao recomendada: criar secao de "receitas" por objetivo (onboarding rapido, diagnostico, export para RAG).

### Ciclo anterior (P3.3)

- Escopo executado: P3.3 documentacao operacional avancada da CLI.
- Resultado objetivo: guia unico de operacao com exemplos prontos para todos os modos entregues em P2/P3.
- Evidencias (testes/comandos): `npm test` (49/49 passando); smoke `node bin/mindclone.js --baseDir <tmp> --profile smoke-doc-user --journal "registro inicial"`; smoke `node bin/mindclone.js --baseDir <tmp> --profile smoke-doc-user --status`; smoke `node bin/mindclone.js --baseDir <tmp> --telemetry status`.
- Riscos remanescentes: documentacao depende de manter exemplos sincronizados com mudancas futuras de flags.
- Proxima acao recomendada: adicionar secao de troubleshooting com erros comuns (criptografia, perfil inexistente, plugin invalido).

### Ciclo historico (P3.2 e anteriores)

- Escopo executado: P0 completo + P1 completo + P2 completo + P3.1 + P3.2 (mirror, journal, import, compare, plugins, telemetria opt-in).
- Resultado objetivo: backlog estrategico P3 implementado em CLI com operacao deterministica, extensibilidade por plugins e coleta telemetrica sob consentimento explicito.
- Evidencias (testes/comandos): `npm test` (48/48 passando); smoke CLI via `node bin/mindclone.js --baseDir <tmp> --profile smoke-user-a1 --status`; varredura de logs (`rg --files -g "*.log" .`) sem arquivos de erro no repositorio.
- Riscos remanescentes: sem riscos criticos identificados neste ciclo; manter monitoramento de UX em automacao CLI.
- Proxima acao recomendada: evoluir documentacao de uso avancado dos novos modos (`--mirror`, `--journal`, `--import`, `--compare`, `--plugin`, `--telemetry`).
