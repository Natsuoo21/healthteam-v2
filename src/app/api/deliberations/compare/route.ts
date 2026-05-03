import { generateText } from 'ai';
import { prisma } from '@/lib/prisma';
import { withFallback, DEFAULT_DELIBERATION_MODEL, type ModelId } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { currentId, previousId, model } = await req.json();
    const modelId = (model as ModelId) || DEFAULT_DELIBERATION_MODEL;

    if (!currentId || !previousId) {
      return NextResponse.json({ error: 'IDs das deliberações são obrigatórios' }, { status: 400 });
    }

    // Fetch the synthesis (non-cascade) message from each deliberation
    const [currentMsgs, previousMsgs] = await Promise.all([
      prisma.message.findMany({
        where: { deliberationId: currentId, isCascade: false, role: 'assistant' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      }),
      prisma.message.findMany({
        where: { deliberationId: previousId, isCascade: false, role: 'assistant' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      }),
    ]);

    const currentSynthesis = currentMsgs[0]?.content;
    const previousSynthesis = previousMsgs[0]?.content;

    if (!currentSynthesis || !previousSynthesis) {
      return NextResponse.json({ error: 'Uma ou ambas as deliberações não possuem protocolo completo' }, { status: 400 });
    }

    // Truncate to avoid exceeding context limits (8k chars each)
    const maxChars = 8000;
    const current = currentSynthesis.slice(0, maxChars);
    const previous = previousSynthesis.slice(0, maxChars);

    const { text: diff } = await withFallback(modelId, (m) => generateText({
      model: m,
      system: `Voce e um analista de protocolos esportivos. Compare dois protocolos de um mesmo atleta e produza um changelog claro e objetivo.

ESTRUTURE SUA RESPOSTA EXATAMENTE ASSIM:

## O Que Mudou

### Treino
- Liste mudancas no programa de treino (volume, exercicios, divisao, periodizacao)

### Nutricao
- Liste mudancas no plano nutricional (calorias, macros, refeicoes, suplementacao)

### Saude & Recuperacao
- Liste mudancas em biomarcadores, protocolo de recuperacao, sono, suplementacao avancada

### Resumo
- 2-3 frases sintetizando a evolucao geral do protocolo: o que melhorou, o que foi ajustado e por que.

REGRAS:
- Portugues (BR). Objetivo, sem repeticao.
- Se algo NAO mudou, diga "Sem alteracoes significativas" na secao.
- Use bullets concisos. Nao repita o conteudo integralmente — apenas as diferencas.`,
      prompt: `--- PROTOCOLO ANTERIOR ---
${previous}

--- PROTOCOLO ATUAL ---
${current}`,
      temperature: 0.3,
      maxOutputTokens: 2000,
    }));

    return NextResponse.json({ diff });
  } catch (error: any) {
    console.error('[deliberations/compare] Error:', error);
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 });
  }
}
