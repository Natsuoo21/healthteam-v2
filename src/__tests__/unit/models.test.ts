import { describe, it, expect } from 'vitest';
import {
  MODEL_REGISTRY,
  DEFAULT_DELIBERATION_MODEL,
  DEFAULT_CHAT_MODEL,
  FALLBACK_CHAINS,
  type ModelId,
} from '@/lib/models';

describe('MODEL_REGISTRY', () => {
  it('contains all 4 models', () => {
    const ids: ModelId[] = ['gpt-4o', 'gpt-4o-mini', 'gemini-2.0-flash', 'gemini-2.5-pro'];
    for (const id of ids) {
      expect(MODEL_REGISTRY[id]).toBeDefined();
      expect(MODEL_REGISTRY[id].label).toBeTruthy();
      expect(MODEL_REGISTRY[id].provider).toMatch(/^(openai|google)$/);
      expect(MODEL_REGISTRY[id].costTier).toMatch(/^(low|mid|high)$/);
    }
  });

  it('has correct providers', () => {
    expect(MODEL_REGISTRY['gpt-4o'].provider).toBe('openai');
    expect(MODEL_REGISTRY['gpt-4o-mini'].provider).toBe('openai');
    expect(MODEL_REGISTRY['gemini-2.0-flash'].provider).toBe('google');
    expect(MODEL_REGISTRY['gemini-2.5-pro'].provider).toBe('google');
  });
});

describe('defaults', () => {
  it('DEFAULT_DELIBERATION_MODEL is gpt-4o', () => {
    expect(DEFAULT_DELIBERATION_MODEL).toBe('gpt-4o');
  });

  it('DEFAULT_CHAT_MODEL is gpt-4o-mini', () => {
    expect(DEFAULT_CHAT_MODEL).toBe('gpt-4o-mini');
  });
});

describe('FALLBACK_CHAINS', () => {
  it('every model has a fallback chain', () => {
    const ids: ModelId[] = ['gpt-4o', 'gpt-4o-mini', 'gemini-2.0-flash', 'gemini-2.5-pro'];
    for (const id of ids) {
      expect(FALLBACK_CHAINS[id]).toBeDefined();
      expect(FALLBACK_CHAINS[id].length).toBeGreaterThan(0);
    }
  });

  it('fallback chains reference valid model IDs', () => {
    const validIds = new Set(Object.keys(MODEL_REGISTRY));
    for (const [, chain] of Object.entries(FALLBACK_CHAINS)) {
      for (const fallbackId of chain) {
        expect(validIds.has(fallbackId)).toBe(true);
      }
    }
  });

  it('no model falls back to itself', () => {
    for (const [id, chain] of Object.entries(FALLBACK_CHAINS)) {
      expect(chain).not.toContain(id);
    }
  });

  it('cross-provider fallbacks exist (OpenAI → Google and vice versa)', () => {
    // gpt-4o should fallback to a Google model
    const gpt4oChain = FALLBACK_CHAINS['gpt-4o'];
    const hasGoogle = gpt4oChain.some(id => MODEL_REGISTRY[id].provider === 'google');
    expect(hasGoogle).toBe(true);

    // gemini-2.5-pro should fallback to an OpenAI model
    const geminiChain = FALLBACK_CHAINS['gemini-2.5-pro'];
    const hasOpenAI = geminiChain.some(id => MODEL_REGISTRY[id].provider === 'openai');
    expect(hasOpenAI).toBe(true);
  });
});
