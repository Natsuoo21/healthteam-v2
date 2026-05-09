import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { profileId, topic } = await req.json();
    
    if (!profileId || !topic) {
      return NextResponse.json({ error: "Campos obrigatórios não informados" }, { status: 400 });
    }

    const deliberation = await prisma.deliberation.create({
      data: {
        profileId,
        topic,
      }
    });

    return NextResponse.json(deliberation);
  } catch (error) {
    console.error("Error creating deliberation:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID não informado" }, { status: 400 });
    }

    await prisma.message.deleteMany({ where: { deliberationId: id } });
    await prisma.deliberation.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting deliberation:", error);
    return NextResponse.json({ error: "Erro ao excluir deliberação" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, notes } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID não informado" }, { status: 400 });
    }

    await prisma.deliberation.update({
      where: { id },
      data: { notes },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating deliberation notes:", error);
    return NextResponse.json({ error: "Erro ao salvar notas" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get('profileId');
  
  if (!profileId) {
    return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
  }

  try {
    const deliberations = await prisma.deliberation.findMany({
      where: { profileId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { conversation: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(deliberations);
  } catch (error) {
    console.error("Error fetching deliberations:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
