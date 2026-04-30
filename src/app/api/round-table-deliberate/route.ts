import { openai } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { prisma } from '@/lib/prisma';

export const maxDuration = 120;

function buildContext(stack: any, profileName: string) {
  const goals: Record<string, string> = {
    hypertrophy: "Forca & Hipertrofia",
    conditioning: "Condicionamento & Performance",
    recomp: "Recomposicao Corporal",
  };
  const conditions = stack?.conditions || "Nenhuma reportada";
  const hasDM1 = /diabet|dm1|tipo 1|type 1/i.test(conditions);

  return `ATLETA: ${profileName}
OBJETIVO: ${goals[stack?.goal] || stack?.goal}
MODALIDADE PRINCIPAL: ${stack?.primary}
MODALIDADE SECUNDARIA: ${stack?.secondary && stack.secondary !== "Nenhum" ? stack.secondary : "Nenhuma"}
ALTURA: ${stack?.height}cm | PESO: ${stack?.weight}kg
CONDICOES DE SAUDE: ${conditions}${hasDM1 ? `

ALERTA DM1 ATIVO: O atleta tem Diabetes Tipo 1. Todas as recomendacoes devem considerar:
- Risco de hipoglicemia durante e apos exercicio (especialmente aerobico)
- Ajustes de insulina basal/bolus peri-treino
- Carbs de seguranca obrigatorios (15-30g fast-acting) disponiveis durante treino
- Monitoramento via CGM — alertas de glicemia <80 mg/dL para pausar treino
- Evitar jejum prolongado sem protocolo de seguranca
- Peri-treino: reduzir bolus em 50% na refeicao pre-treino, considerar reduzir basal em 20-30%` : ""}`.trim();
}

function coachNutriPrompt(stack: any, profileName: string) {
  return `Voce e o sistema de deliberacao entre dois especialistas do HealthTeam.

Produza DOIS blocos de analise rigorosamente separados:

BLOCO 1 — COACH MIKE (Treino & Performance):
- CRIE A FICHA DE TREINO COMPLETA E PRONTA PARA USO.
- Especifique o modelo de periodizacao escolhido (linear, ondulada diaria, ondulada semanal, ou blocos) e JUSTIFIQUE a escolha.
- Liste a divisao semanal (ex: ABCDE, Upper/Lower, Push/Pull/Legs).
- Para CADA dia de treino, use uma TABELA MARKDOWN com colunas: Exercicio | Series | Reps | Descanso | RPE/RIR
- Inclua trabalho de aquecimento/mobilidade e exercicios acessorios.
- Defina criterios de progressao de carga (ex: "Quando completar todas as series com RIR >= 2, aumentar 2.5kg").
- Ao final, resuma para a Nutricionista: volume semanal total (series efetivas por grupo muscular), demanda energetica estimada, e dias de maior/menor intensidade (para carb-cycling).

BLOCO 2 — DRA. SARAH (Nutricao & Metabolismo):
- Leia o treino de Mike e CRIE O PLANO NUTRICIONAL COMPLETO E PRONTO PARA USO.
- Calcule TDEE (Mifflin-St Jeor + fator de atividade). Mostre a conta.
- Defina macros em g/kg: proteina, carboidrato (high/moderate/low days), gordura.
- Crie uma TABELA de refeicoes para dia de treino pesado (high carb) com: Refeicao | Horario | Alimentos | Quantidade (g) | Kcal | P | C | G
- Especifique timing peri-treino: pre (2-3h antes), intra (se aplicavel), pos-treino.
- Suplementacao com doses especificas (creatina, cafeina, vitamina D, omega-3, etc).
- Liste o que Dr. Evans precisa monitorar metabolicamente.
${/diabet|dm1|tipo 1|type 1/i.test(stack?.conditions || "") ? `
ADAPTACAO DM1 OBRIGATORIA (Dra. Sarah):
- Inclua carbs de seguranca (15-30g dextrose/maltodextrina) para treinos
- Especifique ajuste de bolus pre-treino (reducao de 50%)
- Evite recomendacoes de jejum intermitente sem protocolo de monitoramento
- Distribua carboidratos para evitar picos glicemicos: priorize low-GI fora do peri-treino
` : ""}
REGRAS:
- Portugues (BR). Tecnico, especifico, com numeros reais.
- Use TABELAS MARKDOWN — e obrigatorio para treino e nutricao.
- NUNCA diga "consulte um profissional". Voce E o profissional.
- Use os headers EXATOS: "## COACH MIKE" e "## DRA. SARAH"

CONTEXTO DO ATLETA:
${buildContext(stack, profileName)}`;
}

function evansSynthesisPrompt(stack: any, profileName: string, phase1Output: string) {
  return `Voce e o sistema de finalizacao do HealthTeam (Dr. Evans + Moderador).

FASE 1 — DR. EVANS (Endocrinologista & Recuperacao Sistemica):
Leia a deliberacao abaixo entre Coach Mike e Dra. Sarah.
- Audite o protocolo combinado de treino + nutricao sob angulo hormonal e de SNC.
- Identifique riscos de overreaching, incompatibilidade metabolica ou desequilibrio hormonal.
- Forneca um PAINEL DE BIOMARCADORES com ranges funcionais (nao apenas de referencia laboratorial):
  | Marcador | Range Funcional | Range Lab | Por que monitorar |
  Use este formato de tabela.
- Biomarcadores obrigatorios: Testosterona total/livre, Cortisol matinal, TSH, T3L, T4L, SHBG, IGF-1, DHEA-S, Insulina em jejum, PCR ultrassensivel, Ferritina, Vitamina D 25-OH, B12, Hemograma completo.
- Protocolo de recuperacao: sono (7-9h, higiene do sono com acoes especificas), gerenciamento de estresse (HRV, tecnicas de respiracao), deload programado.
- SUGESTOES OPCIONAIS de suplementacao avancada: Se julgar benefico, sugira adaptogenos, manipulados ou nootropicos COM DOSES. Deixe claro que sao opcionais e para quem busca maximizar resultados.
${/diabet|dm1|tipo 1|type 1/i.test(stack?.conditions || "") ? `
AUDITORIA DM1 OBRIGATORIA (Dr. Evans):
- Avalie HbA1c alvo (<7%, ideal 6.0-6.5%) e Time in Range (>70%)
- Considere impacto de cortisol elevado e GH na resistencia a insulina
- Alerte sobre risco de cetoacidose em treinos muito intensos com glicemia >250
- Verifique se nutricao e treino estao coordenados para estabilidade glicemica
` : ""}
- Se algo estiver errado ou sub-otimizado, INTERVENHA e corrija com autoridade clinica. Nao seja passivo.

FASE 2 — MODERADOR (Sintese Final):
Apos a auditoria de Evans, produza o PLANEJAMENTO DE SAUDE COMPLETO E PRONTO PARA USO (Protocolo Unificado).
REGRA CRITICA: COPIE INTEGRALMENTE a ficha de treino (com tabelas) e o plano nutricional (com tabelas) da Fase 1. NAO resuma, NAO omita exercicios, NAO omita refeicoes. O atleta deve poder usar este documento diretamente.

Estrutura obrigatoria:
## Diagnostico Integrado
(Analise cruzada das 3 perspectivas — 3-5 paragrafos)

## Ficha de Treino Completa
(COPIAR as tabelas do Coach Mike integralmente. Nao omitir exercicios, series ou reps.)

## Plano Nutricional Completo
(COPIAR as tabelas da Dra. Sarah integralmente. Incluir todas as refeicoes com gramas.)

## Saude Hormonal & Suplementacao
(Painel de biomarcadores do Dr. Evans + protocolo de recuperacao + suplementacao opcional)

## Monitoramento e Proximos Passos
(Criterios de reavaliacao, frequencia de exames, sinais de alerta)

Use os headers EXATOS: "## DR. EVANS" antes da auditoria e "## PROTOCOLO UNIFICADO" antes da sintese.

REGRAS: Portugues (BR). Tecnico, especifico, acionavel. NUNCA diga "consulte um profissional".

CONTEXTO DO ATLETA:
${buildContext(stack, profileName)}

--- DELIBERACAO COACH MIKE + DRA. SARAH ---
${phase1Output}
--------------------------------------------`;
}

// ─── Simple retry wrapper ─────────────────────────────────────────────────────
// On 429, waits briefly and retries once.
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const status = err?.status || err?.statusCode;
    if (status === 429 || err?.message?.includes('429')) {
      console.log('[round-table-deliberate] 429 detected, retrying in 5s...');
      await new Promise(r => setTimeout(r, 5000));
      return await fn();
    }
    throw err;
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

        const { text: phase1Text } = await withRetry(() => generateText({
          model: openai('gpt-4o'),
          system: coachNutriPrompt(stack, profileName),
          prompt: `Elabore a deliberacao completa para este caso:\n\n${topic}`,
          temperature: 0.45,
          maxTokens: 8192,
        }));

        const coachMatch = phase1Text.match(/## COACH MIKE([\s\S]*?)(?=## DRA\. SARAH|$)/i);
        const nutriMatch = phase1Text.match(/## DRA\. SARAH([\s\S]*?)$/i);

        coachContent = coachMatch ? coachMatch[1].trim() : phase1Text;
        nutriContent = nutriMatch ? nutriMatch[1].trim() : "";

        send({ phase: 'coach', status: 'done', content: coachContent });
        send({ phase: 'nutri', status: 'done', content: nutriContent });

        // ──────────────────────────────────────────────────
        // CALL 2: Dr. Evans + Synthesis (streaming)
        // ──────────────────────────────────────────────────
        send({ phase: 'endo', status: 'thinking' });
        send({ phase: 'synthesis', status: 'pending' });

        const synthStreamResult = await withRetry(() => streamText({
          model: openai('gpt-4o'),
          system: evansSynthesisPrompt(stack, profileName, phase1Text),
          prompt: `Audite o protocolo e sintetize o documento final para:\n\n${topic}`,
          temperature: 0.45,
          maxTokens: 12000,
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
