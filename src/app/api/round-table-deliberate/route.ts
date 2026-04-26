import { google } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import { prisma } from '@/lib/prisma';

export const maxDuration = 120;

function buildContext(stack: any, profileName: string) {
  const goals: Record<string, string> = {
    hypertrophy: "Força & Hipertrofia",
    conditioning: "Condicionamento & Performance",
    recomp: "Recomposição Corporal",
  };
  return `ATLETA: ${profileName}
OBJETIVO: ${goals[stack?.goal] || stack?.goal}
MODALIDADE PRINCIPAL: ${stack?.primary}
MODALIDADE SECUNDÁRIA: ${stack?.secondary && stack.secondary !== "Nenhum" ? stack.secondary : "Nenhuma"}
ALTURA: ${stack?.height}cm | PESO: ${stack?.weight}kg
CONDIÇÕES DE SAÚDE: ${stack?.conditions || "Nenhuma reportada"}`.trim();
}

function coachNutriPrompt(stack: any, profileName: string) {
  return `Você é o sistema de deliberação entre dois especialistas do HealthTeam.

Produza DOIS blocos de análise rigorosamente separados:

BLOCO 1 — COACH MIKE (Treino & Performance):
- CRIE A FICHA DE TREINO COMPLETA E PRONTA PARA USO. Especifique a divisão semanal (ex: ABCDE), e liste os exercícios, séries, repetições, descanso e RPE/RIR de forma detalhada e prática.
- Ao final, resuma para a Nutricionista o volume semanal e a demanda energética prevista.

BLOCO 2 — DRA. SARAH (Nutrição & Metabolismo):
- Leia o treino de Mike e CRIE O CARDÁPIO COMPLETO E PRONTO PARA USO.
- Especifique todas as refeições do dia (Café da Manhã, Almoço, Lanchas, Jantar) com lista de alimentos, quantidades exatas em gramas, calorias e macros. Especifique o timing relativo ao treino.
- Liste o que Dr. Evans precisa monitorar metabolicamente.

REGRAS:
- Português (BR). Técnico, específico, com números reais.
- Use os headers EXATOS: "## COACH MIKE" e "## DRA. SARAH"

CONTEXTO DO ATLETA:
${buildContext(stack, profileName)}`;
}

function evansSynthesisPrompt(stack: any, profileName: string, phase1Output: string) {
  return `Você é o sistema de finalização do HealthTeam (Dr. Evans + Moderador).

FASE 1 — DR. EVANS (Endocrinologista & Recuperação Sistêmica):
Leia a deliberação abaixo entre Coach Mike e Dra. Sarah.
- Audite o protocolo combinado de treino + nutrição sob ângulo hormonal e de SNC.
- Identifique riscos de overreaching, incompatibilidade metabólica ou desequilíbrio hormonal.
- SUGIRA otimizações OPCIONAIS e realistas: se julgar benéfico, faça sugestões de manipulados (fitoterápicos, adaptógenos), nootrópicos ou suplementação avançada. Deixe claro na sua fala que o uso desses recursos é 100% opcional, servindo apenas para pacientes que buscam maximizar resultados e que consultariam um nutrólogo/médico presencialmente.
- Forneça: biomarcadores prioritários para exames laboratoriais, protocolo de recuperação muscular/SNC e ajustes de sono.
- Se algo estiver errado ou sub-otimizado, intervenha e corrija com autoridade clínica.

FASE 2 — MODERADOR (Síntese Final):
Após a auditoria de Evans, produza o PLANEJAMENTO DE SAÚDE COMPLETO E PRONTO PARA USO (Protocolo Unificado). 
Copie sem perdas a Dieta Pronta e o Treino detalhado. Não crie apenas resumos.
Estrutura obrigatória:
## Diagnóstico Integrado
## Ficha de Treino Completa (Não omitir exercícios/séries)
## Dieta Pronta para Uso (Refeições completas com gramas e opções)
## Saúde Hormonal & Suplementação (Recomendações do Dr. Evans)
## Monitoramento e Próximos Passos

Use os headers EXATOS: "## DR. EVANS" antes da auditoria e "## PROTOCOLO UNIFICADO" antes da síntese.

REGRAS: Português (BR). Técnico, específico, acionável.

CONTEXTO DO ATLETA:
${buildContext(stack, profileName)}

─── DELIBERAÇÃO COACH MIKE + DRA. SARAH ───
${phase1Output}
────────────────────────────────────────────`;
}

// ─── Rate-limit-aware wrapper ─────────────────────────────────────────────────
// On 429, reads the exact retryDelay from the API response and waits before
// retrying once. Does NOT blindly retry multiple times (avoids quota cascade).
async function withRateLimit<T>(fn: () => T): Promise<T> {
  try {
    return fn();
  } catch (err: any) {
    const body = err?.responseBody || err?.data?.error?.message || '';
    const match = String(body).match(/retry in (\d+(?:\.\d+)?)s/i);
    const waitMs = match ? Math.ceil(parseFloat(match[1])) * 1000 + 2000 : 35000;
    console.log(`[round-table] 429 detected. Waiting ${waitMs / 1000}s before retry...`);
    await new Promise(r => setTimeout(r, waitMs));
    return fn(); // single retry
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { topic, profileId, stack, profileName, deliberationId } = body;

  if (!profileId || !topic) {
    return new Response("Missing profileId or topic", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch { /* client disconnected */ }
      };

      // Scoped output buffers (accessible to persist block)
      let coachContent = "";
      let nutriContent = "";
      let evansContent = "";
      let fullSynthText = "";

      try {
        // ──────────────────────────────────────────────────
        // CALL 1: Coach Mike + Dra. Sarah
        // ──────────────────────────────────────────────────
        send({ phase: 'coach', status: 'thinking' });
        send({ phase: 'nutri', status: 'thinking' });

        const { text: phase1Text } = await withRateLimit(() => generateText({
          model: google('gemini-flash-latest'),
          system: coachNutriPrompt(stack, profileName),
          prompt: `Elabore a deliberação completa para este caso:\n\n${topic}`,
        }));

        const coachMatch = phase1Text.match(/## COACH MIKE([\s\S]*?)(?=## DRA\. SARAH|$)/i);
        const nutriMatch = phase1Text.match(/## DRA\. SARAH([\s\S]*?)$/i);

        coachContent = coachMatch ? coachMatch[1].trim() : phase1Text;
        nutriContent = nutriMatch ? nutriMatch[1].trim() : "";

        send({ phase: 'coach', status: 'done', content: coachContent });
        send({ phase: 'nutri', status: 'done', content: nutriContent });

        // Gemini 2.5 Flash free tier: retry window is 25s per API error response.
        // Stream countdown to UI so user knows the pipeline is not stuck.
        const WAIT_SECONDS = 35;
        send({ phase: 'waiting', seconds: WAIT_SECONDS });
        for (let i = WAIT_SECONDS; i > 0; i--) {
          await new Promise(r => setTimeout(r, 1000));
          send({ phase: 'waiting', seconds: i - 1 });
        }

        // ──────────────────────────────────────────────────
        // CALL 2: Dr. Evans + Synthesis (streaming)
        // ──────────────────────────────────────────────────
        send({ phase: 'endo', status: 'thinking' });
        send({ phase: 'synthesis', status: 'pending' });

        const synthStreamResult = await withRateLimit(() => streamText({
          model: google('gemini-flash-latest'),
          system: evansSynthesisPrompt(stack, profileName, phase1Text),
          prompt: `Audite o protocolo e sintetize o documento final para:\n\n${topic}`,
        }));

        let evansBuffer = "";
        let inEvans = false;
        let inSynth = false;
        let evansDone = false;

        for await (const chunk of synthStreamResult.textStream) {
          fullSynthText += chunk;

          if (!inEvans && fullSynthText.includes("## DR. EVANS")) {
            inEvans = true;
            send({ phase: 'endo', status: 'streaming' });
          }

          if (!inSynth && fullSynthText.includes("## PROTOCOLO UNIFICADO")) {
            inSynth = true;
            if (!evansDone) {
              evansDone = true;
              const evansRaw = fullSynthText.match(/## DR\. EVANS([\s\S]*?)(?=## PROTOCOLO UNIFICADO)/i);
              evansContent = evansRaw ? evansRaw[1].trim() : evansBuffer;
              send({ phase: 'endo', status: 'done', content: evansContent });
            }
            send({ phase: 'synthesis', status: 'streaming' });
          }

          if (inSynth) {
            send({ phase: 'synthesis', chunk });
          } else if (inEvans) {
            evansBuffer += chunk;
          }
        }

        // Fallback if markers not found in output
        if (!inSynth) {
          evansContent = fullSynthText;
          if (!evansDone) send({ phase: 'endo', status: 'done', content: fullSynthText });
          send({ phase: 'synthesis', status: 'streaming' });
          send({ phase: 'synthesis', chunk: fullSynthText });
        }

        send({ phase: 'done' });

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
            { content: fullSynthText, isCascade: false },
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
            }).catch(console.error)
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
