import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockPrisma = {
  profile: {
    create: vi.fn(),
    upsert: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(),
  },
  trainingStack: {
    upsert: vi.fn(),
  },
};
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

// Import after mocks
const { POST, GET, DELETE } = await import('@/app/api/profiles/route');

describe('POST /api/profiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates profile with trainingStack via upsert', async () => {
    mockPrisma.profile.upsert.mockResolvedValue({
      id: 'prof-1', name: 'João', avatarUrl: '/avatars/1.png',
    });
    mockPrisma.trainingStack.upsert.mockResolvedValue({});

    const req = new Request('http://localhost/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'prof-1',
        name: 'João',
        avatarUrl: '/avatars/1.png',
        trainingStack: { goal: 'hypertrophy', primary: 'Musculação', height: 180, weight: 85, conditions: '' },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockPrisma.profile.upsert).toHaveBeenCalled();
    expect(mockPrisma.trainingStack.upsert).toHaveBeenCalled();
  });

  it('creates profile without trainingStack', async () => {
    mockPrisma.profile.create.mockResolvedValue({
      id: 'prof-2', name: 'Maria', avatarUrl: '/avatars/2.png',
    });

    const req = new Request('http://localhost/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'prof-2', name: 'Maria', avatarUrl: '/avatars/2.png' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockPrisma.profile.create).toHaveBeenCalled();
  });
});

describe('GET /api/profiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mapped profiles', async () => {
    mockPrisma.profile.findMany.mockResolvedValue([
      { id: 'p1', name: 'João', avatarUrl: '/a.png', trainingStack: null },
    ]);

    const req = new Request('http://localhost/api/profiles');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.profiles).toBeDefined();
    expect(data.profiles['p1'].name).toBe('João');
  });
});

describe('DELETE /api/profiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a profile by id', async () => {
    mockPrisma.profile.delete.mockResolvedValue({ id: 'p1' });

    const req = new Request('http://localhost/api/profiles?id=p1', { method: 'DELETE' });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    expect(mockPrisma.profile.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
  });

  it('returns 400 when missing id', async () => {
    const req = new Request('http://localhost/api/profiles', { method: 'DELETE' });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('ID');
  });
});
