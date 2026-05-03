---
name: healthteam
description: Conecta ao HealthTeam v2 — painel de saude com 3 especialistas IA (treino, nutricao, endocrinologia). Gerencia perfis de atleta, dispara deliberacoes da Mesa Redonda, conversa com especialistas e compara protocolos.
version: 1.0.0
author: Natsuoo21
license: MIT
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [health, fitness, ai-agents, nutrition, training, endocrinology]
    category: health-and-fitness
    config:
      - key: healthteam.base_url
        description: "URL base da instancia HealthTeam (sem barra final)"
        default: "http://localhost:3000"
        prompt: "URL da sua instancia HealthTeam (ex: http://localhost:3000)"
required_environment_variables:
  - name: HEALTHTEAM_URL
    prompt: "URL da instancia HealthTeam"
    help: "Ex: http://localhost:3000 ou https://healthteam.seudominio.com"
    required_for: "Conexao com a API do HealthTeam"
---

# HealthTeam — Painel de Saude Integrado

Skill para interagir com o HealthTeam v2, um painel de saude esportiva que simula uma Mesa Redonda com 3 especialistas IA: Coach Mike (treino), Dra. Sarah (nutricao) e Dr. Evans (endocrinologia/recuperacao).

## When to Use

- O usuario quer criar ou gerenciar um perfil de atleta
- O usuario pede um protocolo de treino, nutricao ou saude
- O usuario quer convocar a Mesa Redonda para deliberacao integrada
- O usuario quer conversar com um especialista especifico (treinador, nutricionista, endocrinologista)
- O usuario quer comparar dois protocolos anteriores (versionamento/diff)
- O usuario menciona "HealthTeam", "Mesa Redonda", "Coach Mike", "Dra. Sarah", "Dr. Evans"
- O usuario quer ver historico de deliberacoes ou conversas

## Quick Reference

| Acao | Metodo | Endpoint | Body/Params |
|------|--------|----------|-------------|
| Listar perfis | GET | `/api/profiles` | — |
| Criar/atualizar perfil | POST | `/api/profiles` | `{ id, name, avatarUrl, trainingStack }` |
| Deletar perfil | DELETE | `/api/profiles?id=X` | — |
| Listar deliberacoes | GET | `/api/deliberations?profileId=X` | — |
| Criar deliberacao | POST | `/api/deliberations` | `{ profileId, topic }` |
| Deliberacao completa (SSE) | POST | `/api/round-table-deliberate` | `{ topic, profileId, profileName, stack, deliberationId, model }` |
| Chat Mesa Redonda | POST | `/api/round-table-chat` | `{ messages, profileId, model }` |
| Chat com especialista | POST | `/api/chat` | `{ messages, specialist, stack, profileId, model }` |
| Historico de chat | GET | `/api/chat/history?profileId=X&specialist=Y` | — |
| Comparar protocolos | POST | `/api/deliberations/compare` | `{ currentId, previousId, model }` |

### Especialistas disponiveis

| Chave | Nome | Area |
|-------|------|------|
| `trainer` | Coach Mike | Treino & Performance Atletica |
| `nutritionist` | Dra. Sarah | Nutricao Clinica & Esportiva |
| `endocrinologist` | Dr. Evans | Endocrinologia & Recuperacao |

### Modelos LLM disponiveis

| ID | Label | Provider |
|----|-------|----------|
| `gpt-4o` | GPT-4o | OpenAI |
| `gpt-4o-mini` | GPT-4o Mini | OpenAI |
| `gemini-2.0-flash` | Gemini 2.0 Flash | Google |
| `gemini-2.5-pro` | Gemini 2.5 Pro | Google |

## Procedure

### 1. Verificar conexao

Antes de qualquer operacao, confirme que o HealthTeam esta acessivel:

```bash
curl -s -o /dev/null -w "%{http_code}" ${HEALTHTEAM_URL}/api/profiles
```

Se retornar `200`, a conexao esta ativa. Se falhar, informe ao usuario que o HealthTeam nao esta rodando.

### 2. Listar perfis existentes

```bash
curl -s ${HEALTHTEAM_URL}/api/profiles | python3 -m json.tool
```

Retorna `{ profiles: { "id": { name, avatarUrl, trainingStack } } }`. Use o ID do perfil ativo para as demais operacoes.

### 3. Criar ou atualizar perfil de atleta

```bash
curl -s -X POST ${HEALTHTEAM_URL}/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "id": "PROFILE_ID",
    "name": "Nome do Atleta",
    "avatarUrl": "/avatars/default.png",
    "trainingStack": {
      "goal": "hypertrophy",
      "primary": "Musculacao",
      "secondary": "Natacao",
      "height": 180,
      "weight": 85,
      "conditions": "",
      "trainingContext": "Treina 5x por semana"
    }
  }'
```

Valores de `goal`: `hypertrophy`, `conditioning`, `recomp`.

### 4. Convocar Mesa Redonda (deliberacao completa)

Esta e a funcao principal. O endpoint retorna Server-Sent Events (SSE) com o progresso da deliberacao em 3 fases.

Use o script helper para capturar e formatar o resultado:

```bash
python3 ${HERMES_SKILL_DIR}/scripts/deliberate.py \
  --url "${HEALTHTEAM_URL}" \
  --profile-id "PROFILE_ID" \
  --profile-name "Nome do Atleta" \
  --topic "Elabore o protocolo completo de treino, nutricao e saude" \
  --goal "hypertrophy" \
  --primary "Musculacao" \
  --height 180 \
  --weight 85
```

O script:
1. Cria um registro de deliberacao via POST `/api/deliberations`
2. Chama `/api/round-table-deliberate` com SSE
3. Captura os 3 blocos (Coach, Nutri, Endo) + sintese final
4. Imprime o protocolo completo formatado

### 5. Chat com especialista individual

```bash
curl -s -X POST ${HEALTHTEAM_URL}/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Mensagem do usuario aqui"}],
    "specialist": "trainer",
    "profileId": "PROFILE_ID",
    "stack": { "goal": "hypertrophy", "primary": "Musculacao", "height": 180, "weight": 85 },
    "model": "gpt-4o-mini"
  }'
```

Este endpoint retorna streaming. Para capturar a resposta completa, use:

```bash
curl -s -N -X POST ${HEALTHTEAM_URL}/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "MENSAGEM"}], "specialist": "SPEC", "profileId": "ID", "model": "gpt-4o-mini"}'
```

### 6. Chat de follow-up na Mesa Redonda

```bash
curl -s -N -X POST ${HEALTHTEAM_URL}/api/round-table-chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Pergunta sobre o protocolo"}],
    "profileId": "PROFILE_ID",
    "model": "gpt-4o"
  }'
```

### 7. Comparar protocolos (diff)

Requer dois IDs de deliberacoes completas:

```bash
curl -s -X POST ${HEALTHTEAM_URL}/api/deliberations/compare \
  -H "Content-Type: application/json" \
  -d '{"currentId": "DELIB_ID_NOVO", "previousId": "DELIB_ID_ANTIGO", "model": "gpt-4o"}'
```

Retorna `{ diff: "## O Que Mudou\n..." }` com changelog entre os protocolos.

### 8. Ver historico de deliberacoes

```bash
curl -s "${HEALTHTEAM_URL}/api/deliberations?profileId=PROFILE_ID" | python3 -m json.tool
```

Cada deliberacao inclui `messages[]` com os blocos dos especialistas (`isCascade: true`) e a sintese final (`isCascade: false`).

### 9. Ver historico de chat com especialista

```bash
curl -s "${HEALTHTEAM_URL}/api/chat/history?profileId=PROFILE_ID&specialist=trainer" | python3 -m json.tool
```

### 10. Deletar perfil

```bash
curl -s -X DELETE "${HEALTHTEAM_URL}/api/profiles?id=PROFILE_ID"
```

Deleta o perfil e todos os dados associados (cascata).

## Pitfalls

- **HealthTeam offline**: Se o curl falhar com connection refused, o container/servidor nao esta rodando. Instrua o usuario a iniciar com `docker compose -f docker-compose.prod.yml up -d` ou `npm run dev`.
- **Rate limit (429)**: A deliberacao tem rate limit de 30s por IP. O chat tem 2s. Se receber 429, espere o tempo indicado no header `Retry-After`.
- **SSE parsing**: O endpoint `/api/round-table-deliberate` retorna SSE (`data: {...}\n\n`). Nao tente parsear como JSON simples — use o script `deliberate.py` ou processe linha a linha.
- **Modelo indisponivel**: Se o modelo LLM retornar 429, o HealthTeam tenta fallback automaticamente (ex: gpt-4o → gemini-2.5-pro → gpt-4o-mini). Nao e necessario retry manual.
- **Perfil sem trainingStack**: Se o perfil nao tiver `trainingStack`, a deliberacao funcionara mas com contexto reduzido. Sempre atualize o perfil com dados completos antes de deliberar.
- **IDs de deliberacao**: Para comparar protocolos, ambas as deliberacoes precisam ter uma mensagem `isCascade: false` (sintese completa). Deliberacoes interrompidas nao sao comparaveis.

## Verification

1. **Conexao**: `curl -s ${HEALTHTEAM_URL}/api/profiles` retorna JSON com status 200
2. **Perfil criado**: A resposta do POST contem `{ success: true, profile: { id: ... } }`
3. **Deliberacao completa**: O SSE contem evento `{ phase: 'done' }` como ultimo evento
4. **Comparacao**: A resposta contem `{ diff: "## O Que Mudou..." }` com conteudo nao-vazio
5. **Chat**: O endpoint retorna stream de texto com a resposta do especialista
