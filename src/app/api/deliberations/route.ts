import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { profileId, topic } = await req.json();
    
    if (!profileId || !topic) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
