import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { prisma } from "@/lib/prisma";

export const maxDuration = 60; // Unified protocol needs more time

function buildRoundTablePrompt(stack: any, profileName: string): string {
  const goalLabel: Record<string, string> = {
    hypertrophy: "Forca & Hipertrofia",
    conditioning: "Condicionamento & Performance",
    recomp: "Recomposicao Corporal",
  };

  const conditions = stack?.conditions || "Nenhuma reportada";
  const hasDM1 = /diabet|dm1|tipo 1|type 1/i.test(conditions);

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
` : ""}
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

Estrutura obrigatoria para protocolo inicial:
1. ## Diagnostico do Atleta (analise integrada das 3 perspectivas)
2. ## Protocolo de Treino (periodizacao, divisao, progressao com RPE/RIR)
3. ## Protocolo Nutricional (TDEE, macros, carb-cycling, timing peri-treino)
4. ## Saude Hormonal & Recuperacao (biomarcadores com ranges funcionais, sono, suplementacao)
5. ## Proximos Passos e Monitoramento`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, profileId, stack, profileName, deliberationId } = body;

  if (!profileId) {
    return new Response("Profile ID is required", { status: 400 });
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

  const systemPrompt = buildRoundTablePrompt(stack, profileName || "Atleta");

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

  const streamResult = streamText({
    model: openai('gpt-4o'),
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
