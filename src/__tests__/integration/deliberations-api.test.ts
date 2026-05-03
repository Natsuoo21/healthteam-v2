import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockPrisma = {
  deliberation: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
};
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

// Import after mocks
const { POST, GET } = await import('@/app/api/deliberations/route');

describe('POST /api/deliberations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a deliberation with valid data', async () => {
    mockPrisma.deliberation.create.mockResolvedValue({
      id: 'test-id-1',
      profileId: 'profile-1',
      topic: 'Treino completo',
      createdAt: new Date(),
    });

    const req = new Request('http://localhost/api/deliberations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: 'profile-1', topic: 'Treino completo' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe('test-id-1');
    expect(mockPrisma.deliberation.create).toHaveBeenCalledWith({
      data: { profileId: 'profile-1', topic: 'Treino completo' },
    });
  });

  it('returns 400 when missing fields', async () => {
    const req = new Request('http://localhost/api/deliberations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: 'profile-1' }), // missing topic
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('obrigatórios');
  });

  it('returns 400 when profileId is missing', async () => {
    const req = new Request('http://localhost/api/deliberations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'Treino' }), // missing profileId
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/deliberations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns deliberations for a profile', async () => {
    mockPrisma.deliberation.findMany.mockResolvedValue([
      { id: 'd1', topic: 'Treino 1', profileId: 'p1', messages: [] },
      { id: 'd2', topic: 'Treino 2', profileId: 'p1', messages: [] },
    ]);

    const req = new Request('http://localhost/api/deliberations?profileId=p1');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);
  });

  it('returns 400 when missing profileId', async () => {
    const req = new Request('http://localhost/api/deliberations');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});
