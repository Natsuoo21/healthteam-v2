import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cacheInvalidate } from '@/app/api/chat/route';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profileId');
  const specialist = searchParams.get('specialist');

  if (!profileId || !specialist) {
    return NextResponse.json({ error: 'Perfil ou especialista não informado' }, { status: 400 });
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: {
        profileId_specialist: { profileId, specialist },
      },
    });

    if (!conversation) {
      return NextResponse.json({ success: true });
    }

    await prisma.conversation.delete({ where: { id: conversation.id } });

    // Invalidate the in-memory cache so new messages create a fresh conversation
    cacheInvalidate(profileId, specialist);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json({ error: 'Erro ao limpar conversa' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profileId');
  const specialist = searchParams.get('specialist');

  if (!profileId || !specialist) {
    return NextResponse.json({ error: 'Perfil ou especialista não informado' }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      profileId_specialist: {
        profileId,
        specialist,
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json([]);
  }

  // Formatting strictly to match Vercel AI SDK CoreMessages format
  const formattedMessages = conversation.messages.map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant' | 'system' | 'data',
    content: msg.content,
  }));

  return NextResponse.json(formattedMessages);
}
