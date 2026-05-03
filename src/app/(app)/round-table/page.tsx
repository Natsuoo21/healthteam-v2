"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UsersThree, UserCircle, Sparkle, CaretDown, CaretUp, ArrowsLeftRight, X } from "@phosphor-icons/react";
import Image from "next/image";
import { Suspense, useState, useEffect, useRef } from "react";
import { useHTStore } from "@/stores/htStore";
import { useSearchParams } from "next/navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { MODEL_REGISTRY, DEFAULT_DELIBERATION_MODEL, type ModelId } from "@/lib/models";

const EXPERTS = [
  { id: "coach",  name: "Coach Mike",  avatar: "/avatars/coach.png",        role: "Treino & Performance"    },
  { id: "nutri",  name: "Dra. Sarah",  avatar: "/avatars/nutritionist.png",  role: "Nutrição & Metabolismo"  },
  { id: "endo",   name: "Dr. Evans",   avatar: "/avatars/endocrinologist.png", role: "Hormônios & Recuperação" },
];

type Phase = 'idle' | 'coach' | 'nutri' | 'endo' | 'synthesis' | 'done' | 'error';

interface State {
  phase: Phase;
  coach: string;
  nutri: string;
  endo: string;
  synthesis: string;
  error?: string;
}

const GOAL_LABEL: Record<string, string> = {
  hypertrophy: "Força & Hipertrofia",
  conditioning: "Condicionamento",
  recomp: "Recomposição Corporal",
};

export default function RoundTableScreen() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-health-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <RoundTableInner />
    </Suspense>
  );
}

function RoundTableInner() {
  const searchParams = useSearchParams();
  const autostart = searchParams.get("autostart") === "1";

  const [topic, setTopic] = useState("");
  const [started, setStarted] = useState(false);
  const [deliberationId, setDeliberationId] = useState<string | null>(null);
  const [expandedExpert, setExpandedExpert] = useState<string | null>(null);
  const autostartCalled = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<State>({
    phase: 'idle', coach: '', nutri: '', endo: '', synthesis: '',
  });

  const activeProfileId = useHTStore((s) => s.activeProfileId);
  const profiles = useHTStore((s) => s.profiles);
  const updateProfile = useHTStore((s) => s.updateProfile);
  const profile = profiles[activeProfileId || ""];
  const stack = profile?.trainingStack;
  const selectedModel = (profile?.preferredModel as ModelId) || DEFAULT_DELIBERATION_MODEL;
  const deliberations = useHTStore((s) => s.deliberations);
  const setDeliberations = useHTStore((s) => s.setDeliberations);

  const [diffData, setDiffData] = useState<{ content: string; loading: boolean; currentId: string; previousId: string } | null>(null);

  const handleCompare = async (currentDelib: any) => {
    // Find the previous completed deliberation (one that has a synthesis message)
    const completed = deliberations.filter(
      (d: any) => d.id !== currentDelib.id && d.messages?.some((m: any) => !m.isCascade && m.role === 'assistant')
    );
    if (completed.length === 0) return;
    const previousDelib = completed[0]; // most recent previous (already sorted desc)

    setDiffData({ content: '', loading: true, currentId: currentDelib.id, previousId: previousDelib.id });

    try {
      const res = await fetch('/api/deliberations/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentId: currentDelib.id, previousId: previousDelib.id, model: selectedModel }),
      });
      const data = await res.json();
      if (data.diff) {
        setDiffData(prev => prev ? { ...prev, content: data.diff, loading: false } : null);
      } else {
        setDiffData(prev => prev ? { ...prev, content: data.error || 'Erro ao comparar', loading: false } : null);
      }
    } catch (err: any) {
      setDiffData(prev => prev ? { ...prev, content: `Erro: ${err.message}`, loading: false } : null);
    }
  };

  const fetchDeliberations = () => {
    if (activeProfileId) {
      fetch(`/api/deliberations?profileId=${activeProfileId}`)
        .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
        .then(data => { if (Array.isArray(data)) setDeliberations(data); })
        .catch(() => {});
    }
  };

  useEffect(() => { fetchDeliberations(); }, [activeProfileId]);

  useEffect(() => {
    if (state.phase === 'synthesis') bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.synthesis, state.phase]);

  const buildAutoTopic = () => {
    if (!stack || !profile) return "";
    return `Elabore o protocolo de performance inicial completo para ${profile.name}. Objetivo: ${GOAL_LABEL[stack.goal] || stack.goal}. Modalidade: ${stack.primary}${stack.secondary && stack.secondary !== "Nenhum" ? " + " + stack.secondary : ""}. Dados físicos: ${stack.height}cm / ${stack.weight}kg${stack.conditions ? `. Condições: ${stack.conditions}` : ""}.`;
  };

  const loadPastDeliberation = (d: any) => {
    // Restore state from saved DB messages
    const msgs: any[] = d.messages || [];
    const synthMsg = msgs.find((m: any) => m.role === 'assistant' && !m.isCascade);
    const coachMsg = msgs.find((m: any) => m.isCascade && m.content?.startsWith('[COACH]'));
    const nutriMsg = msgs.find((m: any) => m.isCascade && m.content?.startsWith('[NUTRI]'));
    const endoMsg  = msgs.find((m: any) => m.isCascade && m.content?.startsWith('[ENDO]'));

    setState({
      phase: 'done',
      coach: coachMsg ? coachMsg.content.replace(/^\[COACH\]\n?/, '') : '',
      nutri: nutriMsg ? nutriMsg.content.replace(/^\[NUTRI\]\n?/, '') : '',
      endo:  endoMsg  ? endoMsg.content.replace(/^\[ENDO\]\n?/, '')   : '',
      synthesis: synthMsg ? synthMsg.content : '',
    });
    setTopic(d.topic);
    setDeliberationId(d.id);
    setStarted(true);
  };

  const [retryCountdown, setRetryCountdown] = useState(0);
  const isSubmittingRef = useRef(false);

  // Countdown timer for rate limit retry
  useEffect(() => {
    if (retryCountdown <= 0) return;
    const t = setTimeout(() => setRetryCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [retryCountdown]);

  const runDeliberation = async (t: string) => {
    if (!t.trim() || !activeProfileId || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // Create deliberation record first
    let delibId = deliberationId;
    if (!delibId) {
      try {
        const res = await fetch("/api/deliberations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: activeProfileId, topic: t }),
        });
        const data = await res.json();
        if (data.id) { delibId = data.id; setDeliberationId(data.id); }
      } catch {}
    }

    setStarted(true);
    setRetryCountdown(0);
    setState({ phase: 'coach', coach: '', nutri: '', endo: '', synthesis: '' });
    window.history.replaceState({}, '', '/round-table');

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/round-table-deliberate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: t,
          profileId: activeProfileId,
          profileName: profile?.name,
          stack,
          deliberationId: delibId,
          model: selectedModel,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.body) { setState(s => ({ ...s, phase: 'error', error: 'Resposta vazia do servidor' })); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.phase === 'coach') {
              if (event.status === 'thinking') setState(s => ({ ...s, phase: 'coach' }));
              if (event.status === 'done') setState(s => ({ ...s, coach: event.content, phase: 'nutri' }));
            }
            if (event.phase === 'nutri') {
              if (event.status === 'thinking') setState(s => ({ ...s, phase: 'nutri' }));
              if (event.status === 'done') setState(s => ({ ...s, nutri: event.content, phase: 'endo' }));
            }
            if (event.phase === 'endo') {
              if (event.status === 'thinking') setState(s => ({ ...s, phase: 'endo' }));
              if (event.status === 'done') setState(s => ({ ...s, endo: event.content, phase: 'synthesis' }));
            }
            if (event.phase === 'synthesis') {
              if (event.status === 'streaming') setState(s => ({ ...s, phase: 'synthesis' }));
              if (event.chunk) setState(s => ({ ...s, synthesis: s.synthesis + event.chunk }));
            }
            if (event.phase === 'done') {
              setState(s => ({ ...s, phase: 'done' }));
              fetchDeliberations();
            }
            if (event.phase === 'error') {
              setState(s => ({ ...s, phase: 'error', error: event.message }));
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setState(s => ({ ...s, phase: 'error', error: err.message }));
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // Autostart after onboarding
  useEffect(() => {
    if (autostart && !autostartCalled.current && activeProfileId && stack) {
      autostartCalled.current = true;
      const t = buildAutoTopic();
      setTopic(t);
      runDeliberation(t);
    }
  }, [autostart, activeProfileId, stack]);

  const phaseIndex: Record<Phase, number> = { idle: -1, coach: 0, nutri: 1, endo: 2, synthesis: 3, done: 3, error: -1 };
  const currentPhaseIdx = phaseIndex[state.phase];


  return (
    <div className="flex flex-col h-full w-full">

      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-zinc-200/50 dark:border-white/5 bg-white/95 dark:bg-zinc-900/95 md:bg-white/60 md:dark:bg-zinc-900/60 md:backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {EXPERTS.map(exp => (
              <div key={exp.id} className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden relative shadow-sm">
                <Image src={exp.avatar} alt={exp.name} fill className="object-cover" />
              </div>
            ))}
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Mesa Redonda</h1>
            <p className="text-[9px] text-health-500 font-bold uppercase tracking-widest">3 Especialistas · Protocolo Integrado</p>
          </div>
        </div>
        {started && state.phase === 'done' && (
          <button onClick={() => { setStarted(false); setState({ phase:'idle', coach:'', nutri:'', endo:'', synthesis:'' }); setDeliberationId(null); setTopic(''); }}
            className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-semibold transition-colors flex items-center gap-1.5">
            <Sparkle className="w-3.5 h-3.5" /> Nova consulta
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-3 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8 pb-24 md:pb-16">

          {!started ? (
            /* ─── INPUT SCREEN ─── */
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">

              {/* Review Banner */}
              {(() => {
                const dueForReview = deliberations.find(
                  (d: any) => d.nextReviewAt && new Date(d.nextReviewAt) <= new Date()
                );
                return dueForReview ? (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">
                      Hora de reavaliar
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                      Seu protocolo de {new Date(dueForReview.createdAt).toLocaleDateString('pt-BR')} completou 4 semanas.
                      Convoque o Conselho novamente para atualizar seu protocolo.
                    </p>
                  </motion.div>
                ) : null;
              })()}

              <div className="text-center space-y-4 pt-6">
                <div className="inline-flex p-5 rounded-[2rem] bg-health-500/10 border border-health-500/20">
                  <UsersThree weight="duotone" className="w-12 h-12 text-health-600" />
                </div>
                <h2 className="text-2xl md:text-4xl font-display font-bold">Mesa de Deliberação</h2>
                <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
                  Cada especialista analisa sua situação de forma independente, lê os outros e então o conselho sintetiza um protocolo unificado.
                </p>
              </div>

              <div className="relative">
                <textarea rows={4} value={topic} onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runDeliberation(topic); }}
                  placeholder="Ex: Quero um protocolo completo para ganhar força mantendo condicionamento para MMA..."
                  className="w-full liquid-glass rounded-2xl md:rounded-[2rem] p-4 md:p-6 pb-18 md:pb-20 outline-none text-sm text-zinc-900 dark:text-zinc-100 border-2 border-transparent focus:border-health-500/30 transition-all shadow-xl placeholder:text-zinc-400 dark:placeholder:text-zinc-500 resize-none"
                />
                <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 flex items-center gap-3">
                  <select
                    value={selectedModel}
                    onChange={(e) => activeProfileId && updateProfile(activeProfileId, { preferredModel: e.target.value })}
                    className="hidden md:block text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-xl px-2.5 py-2 border border-zinc-200 dark:border-zinc-700 outline-none cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
                  >
                    {Object.entries(MODEL_REGISTRY).map(([id, info]) => (
                      <option key={id} value={id}>{info.label}</option>
                    ))}
                  </select>
                  <span className="hidden md:inline text-[10px] text-zinc-300 dark:text-zinc-600">⌘↵</span>
                  <button onClick={() => runDeliberation(topic)} disabled={!topic.trim() || state.phase !== 'idle'}
                    className="h-12 px-7 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-30 flex items-center gap-2">
                    <Sparkle weight="fill" className="w-4 h-4" /> Convocar Conselho
                  </button>
                </div>
              </div>

              {deliberations.length > 0 && (
                <div className="pt-8 border-t border-zinc-200/70 dark:border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-5">Consultas Anteriores</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {deliberations.map((d: any, dIdx: number) => {
                      const hasSaved = d.messages?.some((m: any) => !m.isCascade && m.role === 'assistant');
                      // Can compare if this has a synthesis AND there's at least one other completed deliberation
                      const canCompare = hasSaved && deliberations.some(
                        (other: any) => other.id !== d.id && other.messages?.some((m: any) => !m.isCascade && m.role === 'assistant')
                      );
                      return (
                        <div key={d.id} className="p-5 liquid-glass rounded-2xl text-left hover:shadow-md transition-all">
                          <button
                            onClick={() => hasSaved ? loadPastDeliberation(d) : setTopic(d.topic)}
                            className="w-full text-left">
                            <p className="text-xs font-medium mb-3 line-clamp-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">{d.topic}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex -space-x-1.5">
                                {EXPERTS.map(e => (
                                  <div key={e.id} className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden relative">
                                    <Image src={e.avatar} alt={e.name} fill className="object-cover" />
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                {hasSaved
                                  ? <span className="text-[9px] font-bold text-health-600 bg-health-50 dark:bg-health-900/20 px-2 py-0.5 rounded-full">Ver protocolo →</span>
                                  : <span className="text-[9px] text-zinc-400">Rascunho</span>
                                }
                                <span className="text-[10px] text-zinc-400">{new Date(d.createdAt).toLocaleDateString('pt-BR')}</span>
                              </div>
                            </div>
                          </button>
                          {canCompare && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCompare(d); }}
                              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 hover:border-health-400 hover:text-health-600 dark:hover:text-health-400 transition-colors"
                            >
                              <ArrowsLeftRight className="w-3 h-3" /> Comparar com anterior
                            </button>
                          )}
                        </div>
                      );
                    })}

                  </div>
                </div>
              )}
            </motion.div>

          ) : (
            /* ─── DELIBERATION SCREEN ─── */
            <div className="space-y-6">

              {/* Topic */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <UserCircle className="w-5 h-5 text-zinc-500" />
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl rounded-tl-sm px-5 py-3.5 text-sm text-zinc-600 dark:text-zinc-300 max-w-[85%] leading-relaxed">
                  {topic}
                </div>
              </div>

              {/* Deliberation thread — each specialist */}
              <div className="space-y-3 pl-2 border-l-2 border-zinc-100 dark:border-zinc-900">
                {EXPERTS.map((exp, idx) => {
                  const content = exp.id === 'coach' ? state.coach : exp.id === 'nutri' ? state.nutri : state.endo;
                  const isThinking = currentPhaseIdx === idx && !content;
                  const isDone = !!content;
                  const isPending = currentPhaseIdx < idx && !content;

                  return (
                    <motion.div key={exp.id} className="relative ml-4"
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: isPending ? 0.4 : 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}>
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-2xl overflow-hidden shrink-0 relative border-2 transition-all duration-500 ${
                          isThinking ? 'border-health-500 shadow-[0_0_12px_rgba(34,197,94,0.3)]' :
                          isDone ? 'border-zinc-200 dark:border-zinc-800' : 'border-zinc-100 dark:border-zinc-900 opacity-40 grayscale'
                        }`}>
                          <Image src={exp.avatar} alt={exp.name} fill className="object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold">{exp.name}</span>
                              <span className="text-[9px] text-zinc-400 uppercase tracking-wider">{exp.role}</span>
                            </div>
                            {isThinking && (
                              <motion.div className="flex gap-1 items-center">
                                {[0,1,2].map(i => (
                                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-health-500"
                                    animate={{ y: [0, -3, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }} />
                                ))}
                              </motion.div>
                            )}
                          </div>

                          {isDone && (
                            <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl rounded-tl-sm overflow-hidden border border-zinc-100 dark:border-zinc-800">
                              <button
                                onClick={() => setExpandedExpert(expandedExpert === exp.id ? null : exp.id)}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors"
                              >
                                <span className="text-xs text-zinc-500 font-medium">Ver análise do especialista</span>
                                {expandedExpert === exp.id
                                  ? <CaretUp className="w-3 h-3 text-zinc-400" />
                                  : <CaretDown className="w-3 h-3 text-zinc-400" />}
                              </button>
                              <AnimatePresence>
                                {expandedExpert === exp.id && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                                    className="overflow-hidden">
                                    <div className="px-4 pb-4 pt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap border-t border-zinc-100 dark:border-zinc-800 max-h-64 overflow-y-auto">
                                      {content}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {isPending && (
                            <div className="text-xs text-zinc-400 italic px-1">Aguardando vez de falar...</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Final Protocol — Synthesis */}
              {(state.phase === 'synthesis' || state.phase === 'done') && state.synthesis && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                    {/* Council badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex -space-x-2">
                        {EXPERTS.map(e => (
                          <div key={e.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-950 overflow-hidden relative shadow">
                            <Image src={e.avatar} alt={e.name} fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-health-600 dark:text-health-400">
                          Protocolo Unificado · HealthTeam
                        </span>
                        {state.phase === 'synthesis' && (
                          <motion.span className="text-[10px] text-zinc-400 ml-2"
                            animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            sintetizando...
                          </motion.span>
                        )}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl rounded-tl-sm border border-zinc-200/60 dark:border-white/5 shadow-xl overflow-hidden">
                      <div className="p-4 md:p-10">
                        <MarkdownRenderer content={state.synthesis} />
                        {state.phase === 'synthesis' && (
                          <motion.span className="inline-block w-0.5 h-4 bg-health-500 ml-1 align-middle"
                            animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

              {state.phase === 'error' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 space-y-4">
                  <div>
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">
                      ⏱️ Erro na API
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                      Ocorreu um erro ao processar sua solicitação. A Mesa Redonda usa 2 chamadas sequenciais.
                      {retryCountdown > 0
                        ? ` Aguarde ${retryCountdown}s para tentar novamente.`
                        : " Clique para tentar novamente."}
                    </p>
                  </div>
                  {retryCountdown > 0 ? (
                    <div className="w-full h-2 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-amber-400 rounded-full"
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 60, ease: "linear" }}
                      />
                    </div>
                  ) : (
                    <button onClick={() => { setRetryCountdown(60); runDeliberation(topic); }}
                      className="w-full py-3 rounded-2xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors">
                      Tentar novamente
                    </button>
                  )}
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Diff Modal */}
      <AnimatePresence>
        {diffData && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setDiffData(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <ArrowsLeftRight className="w-4 h-4 text-health-500" />
                  <span className="text-sm font-bold">Comparativo de Protocolos</span>
                </div>
                <button onClick={() => setDiffData(null)} className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {diffData.loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-6 h-6 border-2 border-health-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-zinc-400">Analisando diferenças entre protocolos...</p>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <MarkdownRenderer content={diffData.content} />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
