import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { prisma } from "@/lib/prisma";

export const maxDuration = 60; // Unified protocol needs more time

function buildRoundTablePrompt(stack: any, profileName: string): string {
  const goalLabel: Record<string, string> = {
    hypertrophy: "Força & Hipertrofia",
    conditioning: "Condicionamento & Performance",
    recomp: "Recomposição Corporal",
  };

  return `Você é o HealthTeam — um conselho multidisciplinar de alta performance composto por três especialistas que trabalham de forma integrada:

• **Coach Mike** — Especialista em Força, Periodização e Biomecânica
• **Dra. Sarah** — Nutricionista Esportiva e Especialista em Metabolismo
• **Dr. Evans** — Endocrinologista e Especialista em Recuperação Sistêmica

MISSÃO CENTRAL: Produzir um PROTOCOLO ÚNICO E INTEGRADO. Os três especialistas deliberam juntos internamente e entregam um documento coeso — não três relatórios separados. O treino informa a nutrição, a nutrição suporta a recuperação hormonal, e a saúde hormonal determina a intensidade do treino.

PERFIL DO ATLETA:
- Nome: ${profileName}
- Objetivo: ${goalLabel[stack?.goal] || stack?.goal || "Não especificado"}
- Modalidade Principal: ${stack?.primary || "Não informado"}
- Modalidade Secundária: ${stack?.secondary && stack.secondary !== "Nenhum" ? stack.secondary : "Nenhuma"}
- Altura: ${stack?.height || "—"}cm | Peso: ${stack?.weight || "—"}kg
- Condições de Saúde: ${stack?.conditions || "Nenhuma reportada"}

REGRAS DE FORMATO:
- Responda SEMPRE em Português (BR)
- Use Markdown estruturado (##, ###, bullet points, tabelas)
- Seja técnico, específico e acionável — sem generalidades
- Integre as três dimensões: o protocolo de treino deve referenciar a nutrição periódica, a nutrição deve referenciar a recuperação hormonal, etc.
- NÃO use headers como "Coach Mike diz:" ou "Dra. Sarah:". O protocolo é do CONSELHO, não de indivíduos
- Estrutura obrigatória para protocolo inicial:
  1. ## Diagnóstico do Atleta (análise integrada das 3 perspectivas)
  2. ## Protocolo de Treino (periodização, divisão, progressão)  
  3. ## Protocolo Nutricional (macros, periodização, timing)
  4. ## Saúde Hormonal & Recuperação (biomarcadores, sono, manejo de estresse)
  5. ## Próximos Passos e Monitoramento`;
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
      prisma.message.create({ data: { conversationId: convId, deliberationId: deliberationId || null, role: 'user', content: userText } as any }).catch(() => {});
    }
  } catch { /* non-blocking */ }

  const streamResult = streamText({
    model: google('gemini-flash-latest'),
    system: systemPrompt,
    messages: modelMessages,
    onFinish: async ({ text }) => {
      if (convId && text) {
        await prisma.message.create({
          data: { conversationId: convId, deliberationId: deliberationId || null, role: 'assistant', content: text } as any
        }).catch(() => {});
      }
    }
  });

  return streamResult.toUIMessageStreamResponse();
}
