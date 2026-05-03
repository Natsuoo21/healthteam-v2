"use client";

import { useHTStore, type Specialist } from "@/stores/htStore";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaperPlaneRight, Barbell, AppleLogo, Stethoscope, Lightning, ArrowSquareOut } from "@phosphor-icons/react";

import { DefaultChatTransport, type UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface SpecInfo {
  name: string;
  role: string;
  icon: React.ElementType;
  avatar: string;
  quicks: string[];
}

const SPECS_INFO: Record<Specialist, SpecInfo> = {
  trainer: { name: "Coach Mike", role: "Treino & Performance Atlética", icon: Barbell, avatar: "/avatars/coach.png", quicks: ["Pulei o treino", "Treinei mais leve", "Sinto dor no ombro", "Mudar o treino de amanhã"] },
  nutritionist: { name: "Dra. Sarah", role: "Nutrição Clínica & Esportiva", icon: AppleLogo, avatar: "/avatars/nutritionist.png", quicks: ["Saí da dieta", "Comi em restaurante", "Sem fome pós-treino", "Dúvida sobre suplemento"] },
  endocrinologist: { name: "Dr. Evans", role: "Endocrinologia & Recuperação", icon: Stethoscope, avatar: "/avatars/endocrinologist.png", quicks: ["Glicemia alta", "Sentindo fadiga excessiva", "Cortisol desregulado", "Renovar exames"] },
};

// Helper to extract text from UIMessage parts
function getMessageText(msg: UIMessage): string {
  if (msg.parts && Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('');
  }
  return '';
}

export default function ChatScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const specialistKey = (pathname.split("/").pop() as Specialist) || "trainer";
  const info = SPECS_INFO[specialistKey];

  const activeProfileId = useHTStore((s) => s.activeProfileId);
  const profiles = useHTStore((s) => s.profiles);
  const profile = profiles[activeProfileId || ""];

  // Use refs for dynamic body values so transport stays stable
  const bodyRef = useRef({ specialist: specialistKey, stack: profile?.trainingStack, profileId: activeProfileId, model: profile?.preferredModel });
  bodyRef.current = { specialist: specialistKey, stack: profile?.trainingStack, profileId: activeProfileId, model: profile?.preferredModel };

  const transport = useMemo(() => new DefaultChatTransport({
    api: '/api/chat',
    body: () => bodyRef.current,
  }), []);

  const { messages, setMessages, sendMessage, status } = useChat({ transport });

  const isChatLoading = status === 'submitted' || status === 'streaming';
  const [inputValue, setInputValue] = useState("");

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isChatLoading) return;
    sendMessage({ text: inputValue });
    setInputValue("");
  };

  const profileNameRef = useRef(profile?.name);
  profileNameRef.current = profile?.name;

  useEffect(() => {
    if (!activeProfileId) return;
    const controller = new AbortController();
    fetch(`/api/chat/history?profileId=${activeProfileId}&specialist=${specialistKey}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch history');
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          // Transform server messages ({ content }) to UIMessage format ({ parts })
          setMessages(data.map((m: { id: string; role: 'user' | 'assistant'; content: string }) => ({
            id: m.id,
            role: m.role,
            parts: [{ type: 'text' as const, text: m.content }],
          })));
        } else {
          const firstName = profileNameRef.current?.split(' ')[0] || "atleta";
          setMessages([{ id: "welcome-1", role: "assistant" as const, parts: [{ type: 'text' as const, text: `Olá ${firstName}! Preparado? O que temos para a pauta de hoje?` }] }]);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      });
    return () => controller.abort();
  }, [activeProfileId, specialistKey, setMessages]);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, status]);

  const handleQuickAction = (text: string) => {
    if (isChatLoading) return;
    sendMessage({ text });
  };

  if (!info) return <div>Especialista inválido</div>;

  return (
    <div className="flex flex-col h-full w-full relative">

      {/* Top Header - Mobile */}
      <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-200/50 dark:border-white/5 bg-white/90 dark:bg-zinc-900/90 z-20">
        <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0 border border-zinc-200/50 dark:border-white/10">
          <Image src={info.avatar} alt={info.name} fill className="object-cover" />
        </div>
        <div>
          <h2 className="font-semibold text-sm leading-tight">{info.name}</h2>
          <p className="text-[10px] text-zinc-400">{info.role}</p>
        </div>
      </header>

      {/* Context Banner → Round Table */}
      <div className="mx-3 mt-2 md:mx-6 md:mt-4 flex items-center justify-between gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl bg-health-500/8 dark:bg-health-500/10 border border-health-500/20">
        <p className="text-[11px] text-health-600 dark:text-health-400 font-semibold leading-tight">
          Esta conversa alimenta a Mesa Redonda
        </p>
        <button
          onClick={() => router.push("/round-table")}
          className="flex items-center gap-1 text-[10px] font-bold text-health-600 dark:text-health-400 hover:text-health-700 dark:hover:text-health-300 transition-colors whitespace-nowrap shrink-0 py-1"
        >
          Ver Mesa <ArrowSquareOut className="w-3.5 h-3.5" weight="bold" />
        </button>
      </div>

      {/* Main Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto px-3 md:px-12 py-4 md:py-8 flex flex-col gap-4 md:gap-6 scroll-smooth">

        {/* Intro — compact on mobile */}
        <div className="flex flex-col items-center justify-center py-6 md:py-12 mb-4 md:mb-8">
          <div className="w-16 h-16 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl mb-3 md:mb-6 relative">
            <Image src={info.avatar} alt={info.name} fill className="object-cover" />
          </div>
          <h1 className="text-xl md:text-3xl font-display font-semibold tracking-tighter mb-1 md:mb-2">{info.name}</h1>
          <p className="text-zinc-500 uppercase tracking-widest text-[10px] md:text-xs font-bold">{info.role}</p>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            const text = getMessageText(msg);
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
              >
                {/* Bot avatar — visible on all screens */}
                {!isUser && (
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden shrink-0 mr-2 md:mr-3 mt-1 relative shadow-sm border border-zinc-200/50 dark:border-white/10">
                    <Image src={info.avatar} alt="bot" fill className="object-cover" />
                  </div>
                )}

                <div className="flex flex-col gap-2 max-w-[82%] md:max-w-[65%]">
                  <div
                    className={`px-4 py-3 md:px-5 md:py-4 text-sm leading-relaxed rounded-3xl ${
                      isUser
                        ? "bg-health-500 text-white rounded-br-sm shadow-md"
                        : "liquid-glass text-zinc-800 dark:text-zinc-100 rounded-bl-sm"
                    }`}
                  >
                    {isUser ? text : <MarkdownRenderer content={text} />}
                  </div>

                  {/* Magic button on first AI message */}
                  {!isUser && i === 0 && messages.length === 1 && (
                    <button onClick={() => handleQuickAction("Analise meu perfil na sua memória e monte o meu Planejamento Completo agora!")}
                      className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-health-400 to-health-600 text-white w-full py-3 px-4 rounded-xl shadow-lg border border-health-300 font-medium text-sm active:scale-95 transition-all"
                    >
                      <Lightning weight="fill" className="w-4 h-4 text-white" /> Gerar Ficha Completa
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
          {status === 'submitted' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex justify-start items-center gap-2 mt-2"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden shrink-0 relative shadow-sm border border-zinc-200/50 dark:border-white/10">
                <Image src={info.avatar} alt="bot" fill className="object-cover opacity-80" />
              </div>
              <div className="flex gap-1.5 px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-health-500 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-health-500 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-health-500 animate-bounce" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} className="h-2" />
      </div>

      {/* Sticky Bottom Input Area */}
      <div className="px-3 md:px-12 pb-3 md:pb-8 pt-2 md:pt-4 shrink-0 bg-gradient-to-t from-base via-base to-transparent dark:from-zinc-950 dark:via-zinc-950">
        <div className="max-w-3xl mx-auto w-full">

          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1 snap-x">
            {info.quicks.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(q)}
                disabled={isChatLoading}
                className="snap-start shrink-0 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:border-health-400 hover:text-health-600 dark:hover:text-health-400 transition-colors whitespace-nowrap shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleManualSubmit} className="relative flex items-center w-full">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Mensagem para ${info.name}...`}
              enterKeyHint="send"
              className="w-full liquid-glass rounded-full px-5 py-3.5 md:py-4 pr-14 outline-none text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-health-500/50 transition-shadow placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 md:right-2 w-11 h-11 md:w-12 md:h-12 bg-health-500 text-white rounded-full flex items-center justify-center hover:bg-health-400 active:scale-90 transition-all shadow-md disabled:opacity-50"
              disabled={!inputValue.trim() || isChatLoading}
            >
              <PaperPlaneRight weight="fill" className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
