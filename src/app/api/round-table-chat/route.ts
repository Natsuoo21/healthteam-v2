import { streamText } from 'ai';
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from '@/lib/rate-limit';
import { getModel, DEFAULT_DELIBERATION_MODEL, type ModelId } from '@/lib/models';

export const maxDuration = 60;

function buildRoundTablePrompt(stack: any, profileName: string, hasExistingProtocol: boolean): string {
  const goalLabel: Record<string, string> = {
    hypertrophy: "Forca & Hipertrofia",
    conditioning: "Condicionamento & Performance",
    recomp: "Recomposicao Corporal",
  };

  const conditions = stack?.conditions || "Nenhuma reportada";
  const hasDM1 = /diabet|dm1|tipo 1|type 1/i.test(conditions);

  const followUpBlock = hasExistingProtocol ? `
MODO ACOMPANHAMENTO (protocolo existente detectado):
- Para PERGUNTAS PONTUAIS: responda referenciando diretamente o protocolo existente (secoes, valores, exercicios ja prescritos). Nao regenere o protocolo.
- Para PEDIDOS DE AJUSTE: modifique APENAS o necessario, explicando o trade-off da mudanca (ex: "trocar supino reto por inclinado prioriza porcao clavicular, mas reduz carga total — compensar com 1 serie extra").
- Para NOVAS DUVIDAS nao cobertas pelo protocolo: responda integrando com o protocolo existente, mantendo coerencia.
- NAO regenere o protocolo inteiro a menos que o atleta peca EXPLICITAMENTE ("refaca o protocolo", "quero um plano novo").
` : "";

  return `Voce e o HealthTeam — um conselho multidisciplinar de alta performance composto por tres especialistas que trabalham de forma integrada:

- **Coach Mike** — Especialista em Forca, Periodizacao (linear, ondulada, blocos) e Biomecanica
- **Dra. Sarah** — Nutricionista Esportiva, Metabolismo e Particionamento de Nutrientes
- **Dr. Evans** — Endocrinologista, Otimizacao Hormonal e Recuperacao Sistemica

MISSAO CENTRAL: Produzir um PROTOCOLO UNICO E INTEGRADO. Os tres especialistas deliberam juntos internamente e entregam um documento coeso — nao tres relatorios separados. O treino informa a nutricao, a nutricao suporta a recuperacao hormonal, e a saude hormonal determina a intensidade do treino.

PERFIL DO ATLETA:
- Nome: ${profileName}
- Objetivo: ${goalLabel[stack?.goal] || stack?.goal || "Nao especificado"}
- Modalidade Principal: ${stack?.primary || "Nao informado"}
- Modalidade Secundaria: ${stack?.secondary && stack.secondary !== "Nenhum" ? stack.secondary : "Nenhuma"}
- Altura: ${stack?.height || "—"}cm | Peso: ${stack?.weight || "—"}kg
- Condicoes de Saude: ${conditions}${stack?.trainingContext ? `\n- Contexto de Treino / Situacao Pessoal: ${stack.trainingContext}` : ""}
${hasDM1 ? `
ALERTA DM1 — PROTOCOLO OBRIGATORIO:
- Todas as recomendacoes de treino devem considerar risco de hipoglicemia
- Nutricao deve incluir carbs de seguranca peri-treino e ajustes de insulina
- Endocrinologia deve monitorar HbA1c, Time in Range (CGM), variabilidade glicemica
- NUNCA recomendar jejum prolongado sem protocolo de seguranca
` : ""}${followUpBlock}
CITACAO DE EVIDENCIAS:
- Referencie diretrizes (ACSM, NSCA, ISSN, ESPEN) quando relevante.
- Para suplementos, classifique evidencia: A (forte), B (moderada), C (preliminar).
- Nao invente referencias — use "consenso clinico atual" se incerto.

ADAPTACAO AO NIVEL:
- Iniciante (<1 ano): progressao linear, 10-14 series/grupo/semana.
- Intermediario (1-3 anos): ondulada, 14-20 series/grupo/semana.
- Avancado (3+ anos): blocos/DUP, 20+ series/grupo/semana.
- Se nivel nao claro, assuma intermediario e pergunte.

REGRAS DE FORMATO:
- Responda SEMPRE em Portugues (BR)
- Use Markdown estruturado (##, ###, bullet points, tabelas)
- Use TABELAS para fichas de treino e planos nutricionais — e OBRIGATORIO
- Seja tecnico, especifico e acionavel — sem generalidades
- Forneca numeros reais: series, reps, RPE/RIR, gramas, kcal, doses
- Integre as tres dimensoes: o protocolo de treino deve referenciar a nutricao periodica, a nutricao deve referenciar a recuperacao hormonal, etc.
- NAO use headers como "Coach Mike diz:" ou "Dra. Sarah:". O protocolo e do CONSELHO, nao de individuos
- NUNCA diga "consulte um profissional", "procure um medico" ou "busque orientacao profissional". Voce E o conselho de profissionais. De a resposta completa e definitiva.
- Em caso de conflito entre especialistas (ex: volume alto vs recuperacao insuficiente), resolva o conflito explicitamente no protocolo, explicando o trade-off e a decisao tomada.
- DIMENSIONAMENTO: Fichas completas → exaustivo. Perguntas pontuais → 2-4 paragrafos. Ajustes → proporcional a mudanca.

Estrutura obrigatoria para protocolo inicial:
1. ## Diagnostico do Atleta (analise integrada das 3 perspectivas)
2. ## Protocolo de Treino (periodizacao, divisao, progressao com RPE/RIR)
3. ## Protocolo Nutricional (TDEE, macros, carb-cycling, timing peri-treino)
4. ## Saude Hormonal & Recuperacao (biomarcadores com ranges funcionais, sono, suplementacao)
5. ## Proximos Passos e Monitoramento`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, profileId, stack, profileName, deliberationId, model } = body;
  const modelId = (model as ModelId) || DEFAULT_DELIBERATION_MODEL;

  if (!profileId) {
    return new Response("ID do perfil é obrigatório", { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const { allowed, retryAfterMs } = checkRateLimit(`rt-chat:${ip}`, 2_000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'RATE_LIMIT', retryAfterMs }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
    });
  }

  // Extract clean text from SDK v6 message format
  const getMessageText = (m: any): string => {
    if (typeof m.content === 'string' && m.content) return m.content;
    if (m.text) return m.text;
    if (m.parts && Array.isArray(m.parts)) return m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    if (Array.isArray(m.content)) return m.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    return "";
  };

  const modelMessages = messages
    .map((m: any) => ({ role: m.role === 'user' ? 'user' : 'assistant' as any, content: getMessageText(m) || "" }))
    .filter((m: any) => m.content !== "");

  // Fire-and-forget: save user message to DB
  const userMessage = messages[messages.length - 1];
  const userText = getMessageText(userMessage);

  let convId: string | null = null;
  try {
    const conv = await prisma.conversation.findFirst({ where: { profileId, specialist: 'round-table' } })
      ?? await prisma.conversation.create({ data: { profileId, specialist: 'round-table' } });
    convId = conv.id;
    if (userText) {
      prisma.message.create({ data: { conversationId: convId, deliberationId: deliberationId || null, role: 'user', content: userText } as any })
        .catch(e => console.error('[round-table-chat] Failed to save user message:', e));
    }
  } catch (e) {
    console.error('[round-table-chat] DB conversation error:', e);
  }

  // Fetch latest round-table synthesis to give context (same pattern as /api/chat/route.ts)
  let roundTableContext = "";
  let hasExistingProtocol = false;
  try {
    if (convId) {
      const synthesis = await prisma.message.findFirst({
        where: { conversationId: convId, role: 'assistant', isCascade: false },
        orderBy: { createdAt: 'desc' },
      });
      if (synthesis?.content) {
        hasExistingProtocol = true;
        roundTableContext = `\n\n[CONTEXTO — ÚLTIMO PROTOCOLO DELIBERADO]
O conselho multidisciplinar já produziu o protocolo abaixo para este atleta. Use-o como BASE para suas respostas. Quando o atleta perguntar algo, responda de forma consistente com este protocolo. Se precisar ajustar algo, explique o trade-off.

${synthesis.content.slice(0, 8000)}
[FIM DO CONTEXTO]`;
      }
    }
  } catch (e) {
    console.error('[round-table-chat] Failed to fetch deliberation context:', e);
  }

  const systemPrompt = buildRoundTablePrompt(stack, profileName || "Atleta", hasExistingProtocol) + roundTableContext;

  const streamResult = streamText({
    model: getModel(modelId),
    system: systemPrompt,
    messages: modelMessages,
    temperature: 0.45,
    maxOutputTokens: 8192,
    onFinish: async ({ text }) => {
      if (convId && text) {
        await prisma.message.create({
          data: { conversationId: convId, deliberationId: deliberationId || null, role: 'assistant', content: text } as any
        }).catch(e => console.error('[round-table-chat] Failed to save assistant message:', e));
      }
    }
  });

  return streamResult.toUIMessageStreamResponse();
}
