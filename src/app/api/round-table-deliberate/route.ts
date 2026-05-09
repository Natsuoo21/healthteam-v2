import { generateText } from 'ai';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { REVIEW_CYCLE_DAYS } from '@/lib/constants';
import { withFallback, DEFAULT_DELIBERATION_MODEL, type ModelId } from '@/lib/models';
import { buildContext } from '@/lib/deliberation-context';
import { composeCoachPrompt } from '@/lib/skills/coach';
import { composeNutriPrompt } from '@/lib/skills/nutritionist';
import { composeEndoPrompt } from '@/lib/skills/endocrinologist';

export const maxDuration = 120;

// ─── Phase 1a Prompt: Coach Mike (standalone, skill-based) ──────────────────────

function coachPrompt(stack: any, profileName: string) {
  const composed = composeCoachPrompt(stack);

  return `Voce e o Coach Mike — Especialista Senior em Performance Atletica, Periodizacao e Biomecanica.
Referencias metodologicas: Mike Israetel (RP), Eric Helms, Greg Nuckols (SBS), Andy Galpin, Phil Daru (UFC), Chad Wesley Smith (JTS), Joe DeFranco.

MISSAO: Elaborar o protocolo de treino COMPLETO e PRONTO PARA USO para o atleta descrito abaixo.

${composed.text}

INSTRUCOES DE OUTPUT:
- Use TABELAS MARKDOWN para fichas de treino — OBRIGATORIO.
- Liste a divisao semanal (ex: Upper/Lower, Push/Pull/Legs, Full Body).
- Para CADA dia de treino, inclua tabela: Exercicio | Series | Reps | Descanso | RPE/RIR
- Inclua protocolo de aquecimento por dia.
- Inclua trabalho acessorio e prehab.
- Defina criterios de progressao de carga CONCRETOS.
- Prescreva protocolo de deload.
- Ao FINAL, inclua uma secao:
  ## Resumo para Nutricionista
  - Volume semanal total (series efetivas por grupo muscular)
  - Demanda energetica estimada do protocolo (kcal de treino)
  - Dias de maior/menor intensidade (para carb-cycling)
  - Frequencia e duracao das sessoes

REGRAS:
- Portugues (BR). Tecnico, especifico, com numeros reais.
- NUNCA diga "consulte um profissional". Voce E o profissional.
- Referencie diretrizes (ACSM, NSCA, ISSN) quando relevante.

CONTEXTO DO ATLETA:
${buildContext(stack, profileName)}`;
}

// ─── Phase 1b Prompt: Dra. Sarah (receives Coach output) ────────────────────────

function nutriPrompt(stack: any, profileName: string, coachOutput: string) {
  const composedNutri = composeNutriPrompt(stack);

  return `Voce e a Dra. Sarah — Nutricionista Clinica e Esportiva, Especialista em Particionamento de Nutrientes e Metabolismo.
Referencias: ISSN Position Stands, ESPEN Guidelines, Helms/Aragon/Norton, AIS Supplement Framework, IOC REDs 2023.

MISSAO: Criar o plano nutricional COMPLETO e PRONTO PARA USO, alinhado com o protocolo de treino do Coach Mike abaixo.

--- PROTOCOLO DE TREINO (COACH MIKE) ---
${coachOutput}
---

${composedNutri.text}

INSTRUCOES DE OUTPUT:
- Leia o treino acima e alinhe o plano nutricional com os dias/volumes reais.
- Calcule TDEE (Mifflin-St Jeor + fator de atividade). MOSTRE A CONTA.
- Crie TABELA de refeicoes para dia de treino pesado (high carb): Refeicao | Horario | Alimentos | Quantidade (g) | Kcal | P | C | G
- Especifique timing peri-treino com quantidades em gramas.
- Liste suplementos com doses e nivel de evidencia (A/B/C).
- Se houver restricoes alimentares, adapte com substituicoes especificas e equivalencia proteica.
- Ao FINAL, liste o que Dr. Evans precisa monitorar metabolicamente.

REGRAS:
- Portugues (BR). Tecnico, especifico, com numeros reais.
- Use TABELAS MARKDOWN — obrigatorio para plano de refeicoes.
- NUNCA diga "consulte um profissional". Voce E o profissional.

CONTEXTO DO ATLETA:
${buildContext(stack, profileName)}`;
}

// ─── Phase 2 Prompt: Dr. Evans Audit ────────────────────────────────────────────

function evansAuditPrompt(stack: any, profileName: string, coachOutput: string, nutriOutput: string) {
  const composedEndo = composeEndoPrompt(stack);

  return `Voce e o Dr. Evans — Endocrinologista e Especialista em Recuperacao Sistemica, Otimizacao Hormonal e Medicina do Esporte.
Referencias: Endocrine Society 2018, AUA 2018, IOC REDs 2023, Estudo EROS, Laukkanen (sauna), Pinero (crioterapia), Walker (sono).

SUA TAREFA: Auditar o protocolo de treino (Coach Mike) e nutricao (Dra. Sarah) abaixo sob a otica hormonal, de recuperacao e sustentabilidade fisiologica. Voce NAO copia nem repete o treino ou nutricao — apenas audita, complementa e prescreve sua area.

${composedEndo.text}

ESTRUTURE SUA RESPOSTA EXATAMENTE ASSIM:

### Auditoria do Protocolo
- Analise critica do volume vs capacidade de recuperacao.
- Compatibilidade metabolica entre treino e nutricao.
- Riscos identificados (overreaching, deficit excessivo, inflamacao).
- Se algo estiver errado ou sub-otimizado, INTERVENHA e corrija com autoridade clinica.

### Painel de Biomarcadores
Tabela OBRIGATORIA com colunas: Marcador | Range Funcional | Range Lab | Por que monitorar

### Protocolo de Recuperacao
- Sono, exposicao ao frio (com timing correto vs hipertrofia), sauna, deload, HRV, gerenciamento de estresse.

### Suplementacao Avancada (Opcional)
Sugestoes complementares com doses e nivel de evidencia (A/B/C).

### Consideracoes Especificas
- Adaptar por faixa etaria, sexo, e condicoes clinicas do atleta.

REGRAS:
- Portugues (BR). Tecnico, especifico, com numeros reais.
- Use TABELAS MARKDOWN para biomarcadores.
- NUNCA diga "consulte um profissional". Voce E o profissional.
- NAO copie nem repita a ficha de treino ou plano nutricional. Foque APENAS na sua area.

CONTEXTO DO ATLETA:
${buildContext(stack, profileName)}

--- PROTOCOLO COACH MIKE ---
${coachOutput}
---

--- PLANO NUTRICIONAL DRA. SARAH ---
${nutriOutput}
---`;
}

// ─── Phase 3 Prompt: Synthesis ──────────────────────────────────────────────────

function synthesisPrompt(stack: any, profileName: string, coachContent: string, nutriContent: string, evansContent: string) {
  return `Voce e o Moderador do HealthTeam — responsavel pela sintese final do protocolo integrado.

Voce recebera os outputs de tres especialistas. Sua tarefa e produzir APENAS duas secoes:

## Diagnostico Integrado
Analise cruzada das 3 perspectivas (treino, nutricao, saude hormonal) em 3-5 paragrafos densos. Identifique:
- Sinergias entre as prescricoes (ex: carb-cycling alinhado com dias pesados).
- Pontos de tensao resolvidos (ex: volume reduzido para acomodar deficit).
- Riscos residuais e como estao sendo mitigados.
- Prognostico geral para o objetivo do atleta.

## Monitoramento e Proximos Passos
- Criterios de reavaliacao (quando mudar de fase, quando ajustar macros, quando pedir novos exames).
- Frequencia de exames laboratoriais recomendada.
- Sinais de alerta que exigem intervencao imediata (por cada especialista).
- Timeline sugerido: semana 1-4, semana 5-8, reavaliacao completa semana 12.

REGRAS:
- Portugues (BR). Tecnico, objetivo.
- NAO repita o conteudo dos especialistas — eles ja escreveram seus blocos completos.
- Foque APENAS na integracao, analise cruzada e proximos passos.
- Use os headers EXATOS: "## Diagnostico Integrado" e "## Monitoramento e Proximos Passos"
- NUNCA diga "consulte um profissional". Este E o conselho de profissionais.

CONTEXTO DO ATLETA:
${buildContext(stack, profileName)}

--- OUTPUT COACH MIKE ---
${coachContent}
---

--- OUTPUT DRA. SARAH ---
${nutriContent}
---

--- OUTPUT DR. EVANS ---
${evansContent}
---`;
}

// ─── Simulated streaming helper ─────────────────────────────────────────────────

async function simulateStream(
  text: string,
  send: (data: object) => void,
  chunkSize = 200,
  delayMs = 15,
) {
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    send({ phase: 'synthesis', chunk });
    if (delayMs > 0 && i + chunkSize < text.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

// ─── POST Handler ───────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const body = await req.json();
  const { topic, profileId, stack, profileName, deliberationId, model } = body;
  const modelId = (model as ModelId) || DEFAULT_DELIBERATION_MODEL;

  if (!profileId || !topic) {
    return new Response("Perfil ou tópico não informado", { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const { allowed, retryAfterMs } = checkRateLimit(`delib:${ip}`, 30_000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'RATE_LIMIT', retryAfterMs }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch { /* client disconnected */ }
      };

      let coachContent = "";
      let nutriContent = "";
      let evansContent = "";
      let synthesisContent = "";
      let assembledDocument = "";

      try {
        // ──────────────────────────────────────────────────
        // PHASE 1a: Coach Mike (standalone, skill-based)
        // ──────────────────────────────────────────────────
        send({ phase: 'coach', status: 'thinking' });

        const { text: coachText } = await withFallback(modelId, (m) => generateText({
          model: m,
          system: coachPrompt(stack, profileName),
          prompt: `Elabore o protocolo de treino completo para este caso:\n\n${topic}`,
          temperature: 0.3,
          maxOutputTokens: 5000,
        }));

        coachContent = coachText.trim();
        send({ phase: 'coach', status: 'done', content: coachContent });

        // ──────────────────────────────────────────────────
        // PHASE 1b: Dra. Sarah (receives Coach output)
        // ──────────────────────────────────────────────────
        send({ phase: 'nutri', status: 'thinking' });

        const { text: nutriText } = await withFallback(modelId, (m) => generateText({
          model: m,
          system: nutriPrompt(stack, profileName, coachContent),
          prompt: `Elabore o plano nutricional completo alinhado ao protocolo de treino acima para:\n\n${topic}`,
          temperature: 0.3,
          maxOutputTokens: 4000,
        }));

        nutriContent = nutriText.trim();
        send({ phase: 'nutri', status: 'done', content: nutriContent });

        // ──────────────────────────────────────────────────
        // PHASE 2: Dr. Evans Audit (receives both)
        // ──────────────────────────────────────────────────
        send({ phase: 'endo', status: 'thinking' });

        const { text: evansText } = await withFallback(modelId, (m) => generateText({
          model: m,
          system: evansAuditPrompt(stack, profileName, coachContent, nutriContent),
          prompt: `Realize a auditoria endocrinologica e prescricao de recuperacao para:\n\n${topic}`,
          temperature: 0.3,
          maxOutputTokens: 4096,
        }));

        evansContent = evansText.trim();
        send({ phase: 'endo', status: 'done', content: evansContent });

        // ──────────────────────────────────────────────────
        // PHASE 3: Synthesis ONLY (generateText)
        // ──────────────────────────────────────────────────
        send({ phase: 'synthesis', status: 'thinking' });

        const { text: synthText } = await withFallback(modelId, (m) => generateText({
          model: m,
          system: synthesisPrompt(stack, profileName, coachContent, nutriContent, evansContent),
          prompt: `Produza o Diagnostico Integrado e Monitoramento para:\n\n${topic}`,
          temperature: 0.3,
          maxOutputTokens: 2500,
        }));

        synthesisContent = synthText.trim();

        // ──────────────────────────────────────────────────
        // ASSEMBLY: Programmatic document concatenation
        // ──────────────────────────────────────────────────

        // Extract Diagnostico Integrado and Monitoramento from synthesis
        const diagMatch = synthesisContent.match(/## Diagn[oó]stico Integrado([\s\S]*?)(?=## Monitoramento|$)/i);
        const monMatch = synthesisContent.match(/## Monitoramento[^\n]*([\s\S]*?)$/i);

        const diagnostico = diagMatch
          ? `## Diagnóstico Integrado\n${diagMatch[1].trim()}`
          : `## Diagnóstico Integrado\n\n${synthesisContent}`;

        const monitoramento = monMatch
          ? `## Monitoramento e Próximos Passos\n${monMatch[1].trim()}`
          : "";

        assembledDocument = [
          diagnostico,
          `## Ficha de Treino Completa\n\n${coachContent}`,
          `## Plano Nutricional Completo\n\n${nutriContent}`,
          `## Saúde Hormonal & Recuperação\n\n${evansContent}`,
          monitoramento,
        ].filter(Boolean).join("\n\n---\n\n");

        // ──────────────────────────────────────────────────
        // SIMULATED STREAMING: Send assembled doc in chunks
        // ──────────────────────────────────────────────────
        send({ phase: 'synthesis', status: 'streaming' });
        await simulateStream(assembledDocument, send);

        send({ phase: 'done' });

        // ──────────────────────────────────────────────────
        // SET REVIEW DATE
        // ──────────────────────────────────────────────────
        if (deliberationId) {
          const reviewDate = new Date();
          reviewDate.setDate(reviewDate.getDate() + REVIEW_CYCLE_DAYS);
          await prisma.deliberation.update({
            where: { id: deliberationId },
            data: { nextReviewAt: reviewDate },
          }).catch(e => console.error('[round-table-deliberate] Failed to set nextReviewAt:', e));
        }

        // ──────────────────────────────────────────────────
        // PERSIST: Save all outputs to DB
        // ──────────────────────────────────────────────────
        try {
          const conv = await prisma.conversation.findFirst({
            where: { profileId, specialist: 'round-table' }
          }) ?? await prisma.conversation.create({
            data: { profileId, specialist: 'round-table' }
          });

          const messagesToSave = [
            { content: `[COACH]\n${coachContent}`, isCascade: true },
            { content: `[NUTRI]\n${nutriContent}`, isCascade: true },
            { content: `[ENDO]\n${evansContent}`, isCascade: true },
            { content: assembledDocument, isCascade: false },
          ].filter(m => m.content.trim().length > 10);

          await Promise.all(messagesToSave.map(m =>
            prisma.message.create({
              data: {
                conversationId: conv.id,
                deliberationId: deliberationId || null,
                role: 'assistant',
                content: m.content,
                isCascade: m.isCascade,
              } as any
            }).catch(e => console.error('[round-table-deliberate] Failed to save message:', e))
          ));
        } catch (e) {
          console.error('[round-table-deliberate] Persist failed:', e);
        }

      } catch (err: any) {
        console.error('[round-table-deliberate] Pipeline error:', err);
        const isRateLimit = err.message?.includes('quota') || err.message?.includes('429');
        send({ phase: 'error', message: isRateLimit ? 'RATE_LIMIT' : (err.message || 'Erro') });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
