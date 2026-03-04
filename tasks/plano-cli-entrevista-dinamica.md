# Plano Completo - CLI Dinamica MindCloner

Ultima atualizacao: 2026-03-04
Status: Planejado (pronto para execucao apos aprovacao)
Responsavel: Codex

## 1) Escopo em 1 frase

Transformar o MindCloner em uma CLI de produto final para usuario comum, com navegacao por setas e menus guiados, entrevista com IA personalizada, comandos `/save` e `/new` para troca de agente sem perder contexto, configuracao inicial assistida e geracao de documento pelo proprio menu.

## 2) Resultado esperado pelo usuario final

- Instalar localmente, abrir PowerShell e digitar `mindcloner` para entrar direto em uma interface guiada.
- Navegar por setas (`↑`, `↓`, `Enter`, `Esc`) com instrucoes visiveis na tela.
- Entender o que cada opcao faz antes de confirmar acao.
- Escolher entre entrevista faseada (10 fases) e entrevista conversacional adaptativa.
- Quando perceber alucinacao, usar `/save` e depois `/new` para continuar com contexto preservado em nova sessao de agente.
- Gerar documento final (resumo para IA, markdown completo e json) sem sair da CLI.
- Configurar chave de API e preferencias em menu simples, com modelo inicial travado em `gpt-5-mini-2025-08-07`.

## 3) Principios de UX "anti-burro"

- Sempre mostrar "o que fazer agora" em 1 linha.
- Nunca deixar o usuario em beco sem saida; toda tela tem `Voltar`.
- Cada acao critica pede confirmacao clara.
- Toda mensagem de erro inclui causa + acao recomendada.
- Defaults seguros e uteis: caminho padrao, formato padrao, modo recomendado.
- Ajuda contextual rapida em qualquer tela (`?` e `/help`).
- Terminologia humana: evitar linguagem interna de dev no fluxo principal.

## 4) Requisitos funcionais

### 4.1 Entrada e bootstrap da CLI

- Suportar comandos globais `mindclone` e `mindcloner` apontando para o mesmo entrypoint.
- Primeiro uso abre wizard automaticamente se config nao existir.
- Retornos seguintes entram no menu principal.

### 4.2 Menu principal com setas

- Opcoes minimas:
  - `Iniciar entrevista`
  - `Continuar entrevista`
  - `Gerar documento`
  - `Configuracoes`
  - `Diagnostico`
  - `Sair`
- Painel lateral inferior com explicacao curta da opcao selecionada.
- Rodape fixo com atalhos: `Enter confirmar`, `Esc voltar`, `? ajuda`.

### 4.3 Setup inicial guiado

- Coletar:
  - Perfil padrao (slug amigavel)
  - Diretorio de dados (`baseDir`)
  - Chave OpenAI
  - Confirmacao de consentimento e privacidade
- Travar provider inicial em OpenAI com modelo `gpt-5-mini-2025-08-07`.
- Salvar configuracoes locais para nao repetir setup.

### 4.4 Modos de entrevista

- `Modo faseado`: usa o fluxo existente de 10 fases.
- `Modo conversacional adaptativo`: IA decide a proxima pergunta com base em lacunas, contradicoes e contexto recente, mantendo mapeamento para schema.
- Em ambos os modos: barra de progresso, resumo de sessao e persistencia continua.

### 4.5 Comandos em tempo real durante entrevista

- `/help`: lista comandos e exemplos.
- `/status`: mostra progresso, fase, completude e ultima gravacao.
- `/save`: salva snapshot de contexto/handoff para troca de agente.
- `/new`: inicia nova sessao de agente carregando ultimo snapshot salvo.
- `/pause`: encerra com seguranca para retomar depois.
- `/menu`: volta ao menu principal sem perder dados.

### 4.6 Fluxo anti-alucinacao com handoff

- `/save` gera pacote de continuidade com:
  - resumo curto do perfil
  - objetivos pendentes
  - contradicoes abertas
  - ultimas perguntas/respostas relevantes
- `/new` cria nova sessao de conversa (novo contexto de agente) reaproveitando esse pacote.
- Todo handoff fica auditavel em arquivo versionado por timestamp.

### 4.7 Geracao de documento pela propria CLI

- Menu `Gerar documento` com presets:
  - `Resumo para IA` (context pack objetivo)
  - `Perfil completo em Markdown`
  - `JSON estruturado`
  - `RAG chunks`
- Usuario escolhe formato por setas e confirma exportacao.
- CLI exibe caminho final dos arquivos e opcao de abrir pasta.

### 4.8 Configuracoes em menu

- `Modelo de IA`: exibido como fixo nesta fase (`gpt-5-mini-2025-08-07`).
- `API key OpenAI`: cadastrar/atualizar/remover.
- `Diretorio de dados`.
- `Comportamento da entrevista`: modo padrao, limite de perguntas por sessao.
- `Privacidade`: telemetria, criptografia local.

## 5) Requisitos nao funcionais

- Compatibilidade com Windows PowerShell como ambiente prioritario.
- Fallback para modo texto simples quando nao houver TTY (manter testes CI).
- Persistencia atomica e resistente a falha de escrita.
- Performance: resposta visual da UI em ate 100ms para navegacao local.
- Cobertura de testes para fluxos criticos novos sem regressao dos existentes.

## 6) Arquitetura tecnica alvo

### 6.1 Modulos existentes que serao reaproveitados

- `src/index.js`: motor principal de entrevista e fases.
- `src/phases/*`: banco de perguntas 1-10.
- `src/engine/question-validator.js`: guarda contra pergunta ruim.
- `src/storage/*`: persistencia e recuperacao.
- `src/profile/profile-exporter.js`: exportacao de artefatos.

### 6.2 Novos modulos propostos

| Modulo                                 | Responsabilidade                                                      |
| -------------------------------------- | --------------------------------------------------------------------- |
| `src/cli/tui-shell.js`                 | Render da interface interativa, navegacao por setas, telas e atalhos. |
| `src/cli/screen-router.js`             | Maquina de estados das telas (home, entrevista, docs, config).        |
| `src/cli/commands.js`                  | Parser e execucao de comandos slash (`/save`, `/new`, etc).           |
| `src/config/settings-manager.js`       | Leitura/escrita/validacao de configuracao local da CLI.               |
| `src/config/settings-schema.js`        | Schema e defaults da configuracao do usuario.                         |
| `src/ai/handoff-manager.js`            | Criacao e carga de snapshots para troca de agente.                    |
| `src/ai/adaptive-interview-engine.js`  | Estrategia do modo conversacional adaptativo.                         |
| `src/profile/context-pack-exporter.js` | Export dedicado "Resumo para IA".                                     |

### 6.3 Dependencias sugeridas

- `@inquirer/prompts` ou `enquirer` para menus com setas.
- `chalk` para destaque visual e estados.
- `keytar` (opcional recomendado) para guardar API key no cofre do SO.
- `node-pty` apenas para testes de navegacao por teclas em ambiente TTY simulado.

## 7) Contratos de dados novos

### 7.1 Configuracao local (`settings.json`)

```json
{
  "version": 1,
  "defaultProfileId": "gabriel",
  "baseDir": "C:/Users/<user>/.mindclone",
  "ai": {
    "provider": "openai",
    "model": "gpt-5-mini-2025-08-07",
    "timeoutMs": 20000,
    "maxRetries": 2
  },
  "interview": {
    "defaultMode": "adaptive",
    "maxQuestionsPerSession": 25
  },
  "privacy": {
    "telemetryOptIn": false
  }
}
```

### 7.2 Handoff de agente (`handoff-<timestamp>.json`)

```json
{
  "profileId": "gabriel",
  "createdAt": "2026-03-04T20:00:00.000Z",
  "sourceSessionId": "session-1741111111111",
  "summary": "Resumo curto da sessao",
  "openQuestions": ["..."],
  "openContradictions": ["..."],
  "recentConversation": [
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "profileCompleteness": 47.2
}
```

## 8) Fluxos detalhados da experiencia

### 8.1 Primeiro uso (zero friccao)

1. Usuario roda `mindcloner`.
2. CLI detecta ausencia de config.
3. Wizard guiado coleta base minima (perfil, chave, consentimento).
4. CLI mostra menu principal com explicacao da opcao recomendada.
5. Usuario inicia entrevista no modo padrao.

### 8.2 Usuario recorrente

1. Usuario roda `mindcloner`.
2. CLI abre menu principal direto.
3. Usuario escolhe `Continuar entrevista`.
4. Sistema retoma estado salvo e mostra progresso antes da primeira pergunta.

### 8.3 Recuperacao de alucinacao (`/save` + `/new`)

1. Durante a conversa, usuario percebe desvio.
2. Digita `/save`.
3. Sistema persiste snapshot e confirma caminho do handoff.
4. Usuario digita `/new`.
5. Sistema abre nova sessao de agente, injeta snapshot e resume entrevista.

### 8.4 Geracao de documento

1. Usuario volta ao menu principal (`/menu` ou fim da sessao).
2. Escolhe `Gerar documento`.
3. Seleciona preset de exportacao.
4. CLI executa export e mostra arquivos gerados.

## 9) Plano de implementacao por fases

### F0 - Preparacao tecnica (1 dia)

- Definir arquitetura final de UI e estado.
- Criar ADR curta com decisoes de dependencias.
- Criterio de aceite: documento tecnico aprovado, sem codigo quebrado.

### F1 - Shell interativo com setas (2 a 3 dias)

- Implementar `tui-shell` e `screen-router`.
- Entregar menu principal navegavel com ajuda contextual.
- Criterio de aceite: navegar por teclado sem precisar decorar comandos.

### F2 - Setup e configuracao guiada (2 dias)

- Criar `settings-manager` + schema + wizard de primeiro uso.
- Integrar provider OpenAI com modelo fixo `gpt-5-mini-2025-08-07`.
- Criterio de aceite: usuario novo inicia sem flags de linha de comando.

### F3 - Entrevista em 2 modos (3 a 4 dias)

- Reaproveitar modo faseado atual via nova UI.
- Implementar modo adaptativo com validacao e fallback local.
- Criterio de aceite: ambos os modos persistem estado e atualizam completude.

### F4 - Comandos `/save` e `/new` (2 dias)

- Criar `handoff-manager` e ligar ao loop de entrevista.
- Implementar troca de sessao mantendo contexto essencial.
- Criterio de aceite: handoff auditavel e retomada consistente em nova sessao.

### F5 - Gerador de documento no menu (1 a 2 dias)

- Criar hub de exportacao amigavel no TUI.
- Adicionar `Resumo para IA` dedicado.
- Criterio de aceite: gerar documento sem usar flags manuais.

### F6 - QA, hardening e compatibilidade (2 a 3 dias)

- Cobrir fluxos TTY e non-TTY.
- Revisar mensagens de erro e recuperacao.
- Criterio de aceite: `npm run verify` verde + smoke manual no PowerShell.

### F7 - Documentacao de produto (1 dia)

- Atualizar README com onboarding novo e gifs/asciinema opcionais.
- Adicionar guia de comandos slash e recuperacao de alucinacao.
- Criterio de aceite: usuario novo consegue usar sem ajuda externa.

## 10) Backlog tecnico executavel (checklist)

## Plataforma CLI

- [ ] Adicionar alias de comando `mindcloner` no `package.json`.
- [ ] Criar shell TUI com navegacao por setas e atalhos.
- [ ] Implementar roteador de telas com estado global previsivel.
- [ ] Manter fallback non-TTY sem regressao.

## Configuracao e onboarding

- [ ] Criar schema de configuracao e defaults.
- [ ] Implementar wizard de primeiro uso.
- [ ] Persistir configuracoes de forma segura.
- [ ] Implementar menu de configuracoes editavel.

## Entrevista IA

- [ ] Integrar modo faseado atual na nova UI.
- [ ] Implementar modo adaptativo com controle de alvo por schema.
- [ ] Reusar `question-validator` para bloquear alucinacao de pergunta.
- [ ] Expor comandos `/help`, `/status`, `/pause`, `/menu`.

## Handoff de agente

- [ ] Implementar `/save` com snapshot estruturado.
- [ ] Implementar `/new` com recarga de contexto.
- [ ] Persistir historico de handoffs por perfil.
- [ ] Exibir confirmacoes claras para o usuario.

## Documentos e exportacao

- [ ] Criar menu de export com presets.
- [ ] Implementar export `Resumo para IA`.
- [ ] Reusar exportadores existentes (`json`, `markdown`, `summary`, `rag-chunks`).
- [ ] Mostrar caminho final e status de sucesso/erro.

## Qualidade

- [ ] Adicionar testes unitarios dos novos modulos.
- [ ] Adicionar testes de integracao da maquina de estados de telas.
- [ ] Adicionar testes E2E de comandos slash.
- [ ] Validar operacao no PowerShell com smoke real.

## 11) Estrategia de testes e verificacao

- Testes unitarios:
  - parser de comandos slash
  - validacao de `settings.json`
  - geracao de handoff
- Testes de integracao:
  - transicoes de tela (`home -> entrevista -> docs -> home`)
  - troca de modo de entrevista
  - fallback de provider em caso de erro
- Testes E2E:
  - primeiro uso completo
  - recuperacao por `/save` + `/new`
  - geracao de documento via menu
  - execucao non-TTY sem crash
- Gate final:
  - `npm run verify`
  - smoke manual no PowerShell com comando global `mindcloner`

## 12) Migracao e compatibilidade

- Preservar flags atuais como camada de compatibilidade (modo avancado).
- Nova UX vira caminho padrao para usuario final.
- Manter estrutura de dados existente (`profiles`, `exports`, `sessions`).
- Incluir script de migracao de config se formato mudar no futuro.

## 13) Riscos principais e mitigacoes

- Risco: UI interativa quebrar testes automatizados non-TTY.
  - Mitigacao: adapter de IO com deteccao TTY + suite dedicada non-TTY.
- Risco: modo adaptativo aumentar alucinacao em perguntas.
  - Mitigacao: validador obrigatorio + fallback para pergunta local faseada.
- Risco: usuario perder contexto na troca de agente.
  - Mitigacao: formato de handoff versionado + teste E2E de continuidade.
- Risco: friccao na configuracao de API key.
  - Mitigacao: wizard com validacao imediata e mensagem de erro acionavel.

## 14) Definicao de pronto para release

- Usuario novo conclui setup e responde perguntas sem ler docs tecnicas.
- Menus por setas funcionam em PowerShell Windows.
- `/save` e `/new` funcionam em fluxo real de entrevista.
- Documento final e gerado por menu com pelo menos 3 formatos uteis.
- `npm run verify` e smoke manual aprovados.

## 15) Cronograma sugerido

- Duracao total estimada: 12 a 16 dias uteis.
- Ordem recomendada: F0 -> F1 -> F2 -> F3 -> F4 -> F5 -> F6 -> F7.
- Marco de demonstracao:
  - Demo 1 (dia 4): menu com setas e wizard.
  - Demo 2 (dia 9): entrevista em 2 modos + `/save`/`/new`.
  - Demo 3 (dia 13): geracao de documento e release candidate.

## 16) Decisoes travadas para simplificar o escopo inicial

- Provider unico nesta fase: `openai`.
- Modelo unico nesta fase: `gpt-5-mini-2025-08-07`.
- Sem multi-agente paralelo automatico; somente handoff manual via `/save` e `/new`.
- Sem UI grafica externa; tudo no terminal.

## 17) Proximo passo recomendado

1. Validar este plano.
2. Executar F0/F1 imediatamente.
3. Entregar primeira demo navegavel para feedback de UX antes de evoluir motor adaptativo.
