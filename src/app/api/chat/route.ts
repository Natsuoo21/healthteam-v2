import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { prisma } from "@/lib/prisma";
import { getSystemPrompt } from "@/lib/prompts";

export const maxDuration = 60;

// Simple in-memory cache for conversation IDs to avoid repeated DB lookups
const MAX_CACHE_SIZE = 100;
const conversationCache = new Map<string, string>(); // key: `${profileId}-${specialist}` → conversationId

function cacheSet(key: string, value: string) {
  if (conversationCache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entry (first key in Map insertion order)
    const firstKey = conversationCache.keys().next().value;
    if (firstKey) conversationCache.delete(firstKey);
  }
  conversationCache.set(key, value);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, specialist, stack, profileId, deliberationId, isCascade } = body;

  if (!profileId) {
    return new Response("Profile ID is required", { status: 400 });
  }

  // Helper to extract content resilient to SDK v6 formats (content, text, parts)
  const getMessageText = (m: any): string => {
    if (typeof m.content === 'string' && m.content) return m.content;
    if (m.text) return m.text;
    if (m.parts && Array.isArray(m.parts)) {
      return m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    }
    if (Array.isArray(m.content)) {
      return m.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    }
    return "";
  };

  // Check cache first to avoid DB round-trips on every message
  const cacheKey = `${profileId}-${specialist}`;
  let conversationId = conversationCache.get(cacheKey);

  if (!conversationId) {
    // Run profile upsert and conversation lookup in parallel
    const [_, conversation] = await Promise.all([
      prisma.profile.upsert({
        where: { id: profileId },
        update: {},
        create: {
          id: profileId,
          name: "Atleta",
          avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Health"
        }
      }),
      prisma.conversation.findFirst({ where: { profileId, specialist } })
    ]);

    const conv = conversation ?? await prisma.conversation.create({
      data: { profileId, specialist }
    });

    conversationId = conv.id;
    cacheSet(cacheKey, conversationId);
  }

  const convId = conversationId;

  // Map messages to model format (resilient to all SDK v6 field variations)
  const modelMessages = messages
    .map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant' as any,
      content: getMessageText(m) || ""
    }))
    .filter((m: any) => m.content !== "");

  // Save user message and start stream in parallel (don't block stream on DB write)
  const userMessage = messages[messages.length - 1];
  const userText = getMessageText(userMessage);
  const saveUserMsg = (userMessage?.role === 'user' && userText)
    ? prisma.message.create({
        data: {
          conversationId: convId,
          deliberationId: (deliberationId as any) || null,
          role: 'user',
          content: userText,
          isCascade: Boolean(isCascade)
        } as any
      }).catch(e => console.error('[chat] Failed to save user message:', e))
    : Promise.resolve();

  const systemPrompt = getSystemPrompt(specialist, stack);

  // Start stream immediately — DB write happens concurrently in background
  const streamResult = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages: modelMessages,
    temperature: 0.4,
    maxTokens: 4096,
    onFinish: async ({ text }) => {
      await Promise.all([
        saveUserMsg, // Ensure user msg is saved too
        text ? prisma.message.create({
          data: {
            conversationId: convId,
            deliberationId: (deliberationId as any) || null,
            role: 'assistant',
            content: text,
            isCascade: Boolean(isCascade)
          } as any
        }) : Promise.resolve()
      ]);
    }
  });

  return streamResult.toUIMessageStreamResponse();
}
