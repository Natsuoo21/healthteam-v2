# HealthTeam v2 — API Reference

## Base URL

Configuravel via `HEALTHTEAM_URL`. Default: `http://localhost:3000`

---

## Profiles

### GET /api/profiles

Lista todos os perfis com trainingStack.

**Response:**
```json
{
  "profiles": {
    "cuid123": {
      "id": "cuid123",
      "name": "Joao Silva",
      "avatarUrl": "/avatars/default.png",
      "trainingStack": {
        "goal": "hypertrophy",
        "primary": "Musculacao",
        "secondary": "Natacao",
        "height": 180,
        "weight": 85,
        "conditions": "",
        "trainingContext": ""
      }
    }
  }
}
```

### POST /api/profiles

Cria ou atualiza perfil. Se `trainingStack` presente, faz upsert em ambos.

**Body:**
```json
{
  "id": "uuid-gerado-no-client",
  "name": "Nome",
  "avatarUrl": "/avatars/default.png",
  "trainingStack": {
    "goal": "hypertrophy | conditioning | recomp",
    "primary": "Musculacao",
    "secondary": "Natacao",
    "height": 180,
    "weight": 85,
    "conditions": "Diabetes Tipo 1",
    "trainingContext": "Treina 5x semana em academia"
  }
}
```

**Response:** `{ "success": true, "profile": { ... } }`

### DELETE /api/profiles?id=X

Deleta perfil e dados associados (cascata).

**Response:** `{ "success": true }`

---

## Deliberations

### GET /api/deliberations?profileId=X

Lista deliberacoes com mensagens.

**Response:**
```json
[
  {
    "id": "cuid456",
    "topic": "Protocolo completo...",
    "profileId": "cuid123",
    "nextReviewAt": "2026-06-01T00:00:00.000Z",
    "createdAt": "2026-05-03T...",
    "messages": [
      { "id": "m1", "content": "[COACH]\n...", "isCascade": true, "role": "assistant" },
      { "id": "m2", "content": "[NUTRI]\n...", "isCascade": true, "role": "assistant" },
      { "id": "m3", "content": "[ENDO]\n...", "isCascade": true, "role": "assistant" },
      { "id": "m4", "content": "## Diagnostico Integrado\n...", "isCascade": false, "role": "assistant" }
    ]
  }
]
```

### POST /api/deliberations

Cria registro de deliberacao (antes de chamar round-table-deliberate).

**Body:** `{ "profileId": "X", "topic": "Texto do topico" }`

**Response:** `{ "id": "cuid789", "profileId": "X", "topic": "..." }`

### POST /api/deliberations/compare

Compara dois protocolos via LLM.

**Body:** `{ "currentId": "DELIB_NOVO", "previousId": "DELIB_ANTIGO", "model": "gpt-4o" }`

**Response:** `{ "diff": "## O Que Mudou\n### Treino\n- ..." }`

---

## Round Table Deliberation (SSE)

### POST /api/round-table-deliberate

Dispara deliberacao completa. Retorna Server-Sent Events.

**Rate limit:** 30 segundos por IP.

**Body:**
```json
{
  "topic": "Elabore protocolo completo...",
  "profileId": "X",
  "profileName": "Joao",
  "stack": { "goal": "hypertrophy", "primary": "Musculacao", "height": 180, "weight": 85 },
  "deliberationId": "DELIB_ID",
  "model": "gpt-4o"
}
```

**SSE Events:**
```
data: {"phase":"coach","status":"thinking"}
data: {"phase":"nutri","status":"thinking"}
data: {"phase":"coach","status":"done","content":"...treino completo..."}
data: {"phase":"nutri","status":"done","content":"...nutricao completa..."}
data: {"phase":"endo","status":"thinking"}
data: {"phase":"endo","status":"done","content":"...auditoria + recuperacao..."}
data: {"phase":"synthesis","status":"thinking"}
data: {"phase":"synthesis","status":"streaming"}
data: {"phase":"synthesis","chunk":"## Diagnostico Integrado..."}
data: {"phase":"synthesis","chunk":"...mais conteudo..."}
data: {"phase":"done"}
```

**Phases:**
1. `coach` + `nutri` — Coach Mike e Dra. Sarah (gerados juntos, enviados separadamente)
2. `endo` — Dr. Evans audita os dois anteriores
3. `synthesis` — Documento final montado programaticamente (Diagnostico + Treino + Nutricao + Saude + Monitoramento)

---

## Round Table Chat

### POST /api/round-table-chat

Follow-up com o painel apos deliberacao. Streaming.

**Rate limit:** 2 segundos por IP.

**Body:**
```json
{
  "messages": [{"role": "user", "content": "Pergunta sobre o protocolo"}],
  "profileId": "X",
  "model": "gpt-4o"
}
```

---

## Specialist Chat

### POST /api/chat

Chat individual com especialista. Streaming.

**Rate limit:** 2 segundos por IP.

**Body:**
```json
{
  "messages": [{"role": "user", "content": "Mensagem"}],
  "specialist": "trainer | nutritionist | endocrinologist",
  "profileId": "X",
  "stack": { ... },
  "model": "gpt-4o-mini"
}
```

### GET /api/chat/history?profileId=X&specialist=Y

Historico de mensagens com especialista.

**Response:**
```json
[
  { "id": "m1", "role": "user", "content": "Pergunta" },
  { "id": "m2", "role": "assistant", "content": "Resposta" }
]
```

---

## Error Responses

Todos os erros retornam em PT-BR:

| Status | Corpo | Significado |
|--------|-------|-------------|
| 400 | `{ "error": "Perfil ou topico nao informado" }` | Campos obrigatorios faltando |
| 429 | `{ "error": "RATE_LIMIT", "retryAfterMs": 25000 }` | Rate limit atingido |
| 500 | `{ "error": "Erro interno do servidor" }` | Erro inesperado |

## Models & Fallback

Se um modelo retorna 429, o HealthTeam tenta automaticamente a cadeia de fallback:

| Modelo | Fallback 1 | Fallback 2 |
|--------|------------|------------|
| gpt-4o | gemini-2.5-pro | gpt-4o-mini |
| gpt-4o-mini | gemini-2.0-flash | — |
| gemini-2.0-flash | gpt-4o-mini | — |
| gemini-2.5-pro | gpt-4o | gemini-2.0-flash |
