import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

export type ModelId = 'gpt-4o' | 'gpt-4o-mini' | 'gemini-2.0-flash' | 'gemini-2.5-pro';

export const MODEL_REGISTRY: Record<ModelId, {
  label: string;
  provider: 'openai' | 'google';
  costTier: 'low' | 'mid' | 'high';
}> = {
  'gpt-4o':           { label: 'GPT-4o',           provider: 'openai',  costTier: 'high' },
  'gpt-4o-mini':      { label: 'GPT-4o Mini',      provider: 'openai',  costTier: 'low'  },
  'gemini-2.0-flash': { label: 'Gemini 2.0 Flash', provider: 'google',  costTier: 'low'  },
  'gemini-2.5-pro':   { label: 'Gemini 2.5 Pro',   provider: 'google',  costTier: 'high' },
};

export const DEFAULT_DELIBERATION_MODEL: ModelId = 'gpt-4o';
export const DEFAULT_CHAT_MODEL: ModelId = 'gpt-4o-mini';

export const FALLBACK_CHAINS: Record<ModelId, ModelId[]> = {
  'gpt-4o':           ['gemini-2.5-pro', 'gpt-4o-mini'],
  'gpt-4o-mini':      ['gemini-2.0-flash'],
  'gemini-2.0-flash': ['gpt-4o-mini'],
  'gemini-2.5-pro':   ['gpt-4o', 'gemini-2.0-flash'],
};

export function getModel(modelId: ModelId) {
  switch (modelId) {
    case 'gpt-4o':           return openai('gpt-4o');
    case 'gpt-4o-mini':      return openai('gpt-4o-mini');
    case 'gemini-2.0-flash': return google('gemini-2.0-flash');
    case 'gemini-2.5-pro':   return google('gemini-2.5-pro');
    default:                 return openai('gpt-4o-mini');
  }
}

export async function withFallback<T>(
  modelId: ModelId,
  fn: (model: ReturnType<typeof getModel>) => Promise<T>,
): Promise<T> {
  try {
    return await fn(getModel(modelId));
  } catch (err: any) {
    const is429 = err?.status === 429 || err?.statusCode === 429 || err?.message?.includes('429');
    if (!is429) throw err;

    const fallbacks = FALLBACK_CHAINS[modelId] || [];
    for (const fallbackId of fallbacks) {
      try {
        console.log(`[models] Fallback: ${modelId} → ${fallbackId}`);
        return await fn(getModel(fallbackId));
      } catch (fbErr: any) {
        const fb429 = fbErr?.status === 429 || fbErr?.statusCode === 429 || fbErr?.message?.includes('429');
        if (fb429) continue;
        throw fbErr;
      }
    }
    throw err; // All fallbacks exhausted
  }
}
