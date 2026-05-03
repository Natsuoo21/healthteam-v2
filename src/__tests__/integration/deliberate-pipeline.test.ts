import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockPrisma = {
  deliberation: { update: vi.fn() },
  conversation: { findFirst: vi.fn(), create: vi.fn() },
  message: { create: vi.fn() },
};
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

// Mock AI SDK
vi.mock('ai', () => ({
  generateText: vi.fn(),
}));

// Mock models
vi.mock('@/lib/models', () => ({
  DEFAULT_DELIBERATION_MODEL: 'gpt-4o',
  withFallback: vi.fn((_modelId: string, fn: (m: any) => any) => fn('mock-model')),
  getModel: vi.fn(() => 'mock-model'),
}));

// Mock rate limit to always allow
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, retryAfterMs: 0 })),
}));

import { generateText } from 'ai';
import { checkRateLimit } from '@/lib/rate-limit';

const { POST } = await import('@/app/api/round-table-deliberate/route');

describe('POST /api/round-table-deliberate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.conversation.findFirst.mockResolvedValue({ id: 'conv-1' });
    mockPrisma.message.create.mockResolvedValue({});
    mockPrisma.deliberation.update.mockResolvedValue({});
  });

  it('returns 400 when missing profileId', async () => {
    const req = new Request('http://localhost/api/round-table-deliberate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'Treino' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when missing topic', async () => {
    const req = new Request('http://localhost/api/round-table-deliberate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: 'p1' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockReturnValueOnce({ allowed: false, retryAfterMs: 25000 });

    const req = new Request('http://localhost/api/round-table-deliberate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: 'p1', topic: 'Treino' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('25');
  });

  it('streams SSE events for a complete deliberation', async () => {
    // Mock 3 phases of generateText
    const mockGenerateText = vi.mocked(generateText);
    mockGenerateText
      .mockResolvedValueOnce({ text: '## COACH MIKE\nTreino aqui\n\n## DRA. SARAH\nNutricao aqui' } as any) // Phase 1
      .mockResolvedValueOnce({ text: '### Auditoria\nEvans audit content' } as any) // Phase 2
      .mockResolvedValueOnce({ text: '## Diagnóstico Integrado\nSintese\n\n## Monitoramento e Próximos Passos\nProximos passos' } as any); // Phase 3

    const req = new Request('http://localhost/api/round-table-deliberate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId: 'p1',
        topic: 'Treino completo',
        profileName: 'João',
        stack: { goal: 'hypertrophy', primary: 'Musculação', height: 180, weight: 85 },
        deliberationId: 'delib-1',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');

    // Read all SSE events
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
    }

    // Parse events
    const events = fullText
      .split('\n\n')
      .filter(line => line.startsWith('data: '))
      .map(line => JSON.parse(line.slice(6)));

    // Check we got the essential phases
    const phases = events.map(e => e.phase);
    expect(phases).toContain('coach');
    expect(phases).toContain('nutri');
    expect(phases).toContain('endo');
    expect(phases).toContain('synthesis');
    expect(phases).toContain('done');

    // Check DB persistence was attempted
    expect(mockPrisma.message.create).toHaveBeenCalled();
    expect(mockPrisma.deliberation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'delib-1' },
        data: expect.objectContaining({ nextReviewAt: expect.any(Date) }),
      })
    );
  });
});
