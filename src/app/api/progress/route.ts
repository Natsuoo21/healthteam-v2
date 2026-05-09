import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get("profileId");

  if (!profileId) {
    return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
  }

  try {
    const logs = await prisma.weightLog.findMany({
      where: { profileId },
      orderBy: { date: "asc" },
      select: { date: true, weight: true },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching weight logs:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { profileId, weight, date } = await req.json();

    const weightNum = Number(weight);
    if (!profileId || weight == null || isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
      return NextResponse.json({ error: "Campos obrigatórios não informados ou peso inválido" }, { status: 400 });
    }

    await prisma.weightLog.create({
      data: {
        profileId,
        weight: weightNum,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating weight log:", error);
    return NextResponse.json({ error: "Erro ao registar peso" }, { status: 500 });
  }
}
