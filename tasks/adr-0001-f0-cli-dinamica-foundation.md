# ADR-0001 - Fundacao Tecnica da CLI Dinamica (F0)

Data: 2026-03-04
Status: Aprovado para execucao
Fase: F0
Relacionamento: `tasks/plano-cli-entrevista-dinamica.md` (secoes 6, 7, 9 e 16)

## 1) Contexto

O projeto atual possui uma CLI orientada a flags (`--status`, `--resume`, etc.) com fluxo de entrevista funcional.
O novo objetivo e entregar uma UX de produto final para usuario comum, com:

- menu navegavel por setas
- setup guiado
- comandos em sessao (`/save`, `/new`)
- configuracao facilitada de IA e exportacao por menu

Antes de iniciar a implementacao da UI (F1), era necessario travar decisoes tecnicas de base para evitar retrabalho.

## 2) Decisoes

### D1 - Biblioteca de interface TTY

Decisao:

- Usar `enquirer` para prompts navegaveis por setas.

Justificativa:

- API simples para `Select`/`Input`/`Confirm`.
- Boa compatibilidade com CommonJS (stack atual em CJS).
- Menor friccao para integrar rapidamente ao fluxo ja existente.
- Boa operacao em PowerShell (ambiente prioritario do projeto).

Alternativas avaliadas:

- `@inquirer/prompts`: viavel, mas com maior friccao de integracao na stack atual (ESM-first em varios cenarios).

Impacto:

- F1 implementa `tui-shell`/`screen-router` sobre `enquirer`.

### D2 - Contrato unico de estado da UI (router + contexto)

Decisao:

- Centralizar estado da nova UI em um objeto unico, serializavel e previsivel.

Contrato proposto:

```json
{
  "screen": "home",
  "stack": ["home"],
  "runtime": {
    "isTTY": true,
    "width": 120,
    "height": 40
  },
  "profileContext": {
    "profileId": "ana-silva",
    "baseDir": "C:/Users/<user>/.mindclone",
    "hasExistingData": true
  },
  "interviewContext": {
    "mode": "phased",
    "active": false,
    "lastSessionId": ""
  },
  "settingsContext": {
    "loaded": true,
    "path": "C:/Users/<user>/.mindclone/settings.json"
  },
  "ui": {
    "helpVisible": true,
    "lastError": "",
    "lastInfo": ""
  }
}
```

Regras do roteador:

- `screen` guarda a tela atual.
- `stack` permite navegao reversa com `Esc`/`Voltar`.
- Toda transicao e acionada por evento explicito (`NAVIGATE`, `BACK`, `EXIT`, `START_INTERVIEW`, etc).
- Estado de dominio (perfil/sessao/config) fica no contexto e nao em variaveis soltas.

Impacto:

- F1 cria `src/cli/screen-router.js` com transicoes deterministicas.
- F6 testa transicoes principais sem depender de terminal real.

### D3 - Estrategia de configuracao e segredo da API key

Decisao:

- Configuracoes nao sensiveis: `settings.json` no `baseDir`.
- Segredo sensivel (API key): prioridade em `MINDCLONE_AI_API_KEY`.
- Quando usuario escolher "salvar chave" via menu: armazenar em `settings.secrets.json` criptografado usando o mecanismo existente de criptografia local (`src/safety/encryption-manager.js`) e chave `MINDCLONE_ENCRYPTION_KEY`.
- Se `MINDCLONE_ENCRYPTION_KEY` nao existir, a CLI deve orientar:
  - usar chave apenas para sessao atual (nao persistir), ou
  - definir `MINDCLONE_ENCRYPTION_KEY` para persistencia segura.

Justificativa:

- Reaproveita infraestrutura de criptografia ja implementada.
- Evita introduzir dependencia nativa extra nesta etapa.
- Mantem UX clara: segredo persistido somente com criptografia habilitada.

Impacto:

- F2 cria `settings-manager` com leitura combinada:
  - `MINDCLONE_AI_API_KEY` (precedencia maxima)
  - `settings.secrets.json` descriptografado (quando disponivel)
- F2 exibe mensagens acionaveis para ausencia de chave de criptografia.

## 3) Modelo de arquivos de configuracao

`settings.json` (nao sensivel):

```json
{
  "version": 1,
  "defaultProfileId": "ana-silva",
  "baseDir": "C:/Users/ana/.mindclone",
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

`settings.secrets.json` (sensivel, criptografado):

```json
{
  "__encrypted": true,
  "v": 1,
  "alg": "aes-256-gcm",
  "kdf": "scrypt",
  "scrypt": {
    "N": 16384,
    "r": 8,
    "p": 1
  },
  "salt": "...",
  "iv": "...",
  "tag": "...",
  "data": "..."
}
```

Payload descriptografado esperado:

```json
{
  "openaiApiKey": "sk-..."
}
```

## 4) Compatibilidade e fallback

- Modo flags atual continua suportado.
- Nova UI por setas vira caminho preferencial quando:
  - terminal for TTY
  - nenhum modo operacional especifico for passado por flag
- Em non-TTY (CI/pipe), manter caminho textual atual para nao quebrar automacao.

## 5) Riscos e mitigacoes

Risco 1:

- Quebra de testes non-TTY com introducao da TUI.
  Mitigacao:
- Gate de deteccao `isTTY` antes de carregar fluxo TUI.

Risco 2:

- Usuario esperar persistencia de API key sem `MINDCLONE_ENCRYPTION_KEY`.
  Mitigacao:
- Mensagem explicita no wizard e opcao de uso temporario para sessao.

Risco 3:

- Estado da UI virar acoplado e dificil de testar.
  Mitigacao:
- Router com estado serializavel e transicoes puras (evento -> novo estado).

## 6) Escopo travado para F1/F2

- Provider inicial: `openai`.
- Modelo inicial: `gpt-5-mini-2025-08-07`.
- Sem suporte a multi-provider na UX nova nesta etapa.
- Sem dependencia de interface grafica externa.

## 7) Definition of Done da F0

- [x] Decisao da lib TTY fechada.
- [x] Contrato de estado da UI definido.
- [x] Estrategia de `settings.json` e segredo definida.
- [x] ADR registrado em `tasks/`.
