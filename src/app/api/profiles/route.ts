import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_req?: Request) {
  try {
    const profiles = await prisma.profile.findMany({
      include: {
        trainingStack: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Mapeia para os moldes que o front espera do htStore antigo
    const mappedProfiles = profiles.reduce((acc, p) => {
      acc[p.id] = {
        id: p.id,
        name: p.name,
        avatarUrl: p.avatarUrl,
        trainingStack: p.trainingStack ? {
          goal: p.trainingStack.goal,
          primary: p.trainingStack.primarySport,
          secondary: p.trainingStack.secondarySport || undefined,
          height: p.trainingStack.height,
          weight: p.trainingStack.weight,
          conditions: p.trainingStack.healthConditions || "",
          trainingContext: p.trainingStack.trainingContext || "",
          age: p.trainingStack.age ?? undefined,
          trainingYears: p.trainingStack.trainingYears ?? undefined,
          gender: p.trainingStack.gender ?? undefined,
          bodyFatPct: p.trainingStack.bodyFatPct ?? undefined,
          activityLevel: p.trainingStack.activityLevel ?? undefined,
        } : undefined
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ profiles: mappedProfiles });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar perfis' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, avatarUrl, trainingStack } = body;

    // Se tiver trainingStack payload, salva/atualiza profile junto do stack de uma vez
    if (trainingStack) {
      const profile = await prisma.profile.upsert({
        where: { id: id },
        update: {
          name: name,
        },
        create: {
          id: id,
          name: name,
          avatarUrl: avatarUrl
        }
      });

      await prisma.trainingStack.upsert({
        where: { profileId: profile.id },
        update: {
          goal: trainingStack.goal,
          primarySport: trainingStack.primary,
          secondarySport: trainingStack.secondary,
          height: trainingStack.height,
          weight: trainingStack.weight,
          healthConditions: trainingStack.conditions,
          trainingContext: trainingStack.trainingContext || "",
          age: trainingStack.age ?? null,
          trainingYears: trainingStack.trainingYears ?? null,
          gender: trainingStack.gender ?? null,
          bodyFatPct: trainingStack.bodyFatPct ?? null,
          activityLevel: trainingStack.activityLevel ?? null,
        },
        create: {
          profileId: profile.id,
          goal: trainingStack.goal,
          primarySport: trainingStack.primary,
          secondarySport: trainingStack.secondary || "",
          height: trainingStack.height,
          weight: trainingStack.weight,
          healthConditions: trainingStack.conditions,
          trainingContext: trainingStack.trainingContext || "",
          age: trainingStack.age ?? null,
          trainingYears: trainingStack.trainingYears ?? null,
          gender: trainingStack.gender ?? null,
          bodyFatPct: trainingStack.bodyFatPct ?? null,
          activityLevel: trainingStack.activityLevel ?? null,
        }
      });

      return NextResponse.json({ success: true, profile });
    } else {
      // Cria apenas o profile se o backend for chamado prematuramente
      const profile = await prisma.profile.create({
        data: {
          id,
          name,
          avatarUrl
        }
      });
      return NextResponse.json({ success: true, profile });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID não informado' }, { status: 400 });
    }

    await prisma.profile.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
