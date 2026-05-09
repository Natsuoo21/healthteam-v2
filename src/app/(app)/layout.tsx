"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useHTStore } from "@/stores/htStore";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { UsersThree, CaretUpDown, Plus, Check, PencilSimple, X, ChartLineUp } from "@phosphor-icons/react";
import { MODEL_REGISTRY, type ModelId } from "@/lib/models";
import { useEffect, useRef, useState } from "react";

const SPECIALISTS = [
  { id: "trainer", label: "Coach", sublabel: "Treino & Performance", route: "/chat/trainer", avatar: "/avatars/coach.png" },
  { id: "nutritionist", label: "Nutri", sublabel: "Nutrição & Metabolismo", route: "/chat/nutritionist", avatar: "/avatars/nutritionist.png" },
  { id: "endocrinologist", label: "Endo", sublabel: "Hormônios & Recuperação", route: "/chat/endocrinologist", avatar: "/avatars/endocrinologist.png" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeProfileId = useHTStore((s) => s.activeProfileId);
  const profiles = useHTStore((s) => s.profiles);
  const setActiveProfileId = useHTStore((s) => s.setActiveProfileId);
  const hydrate = useHTStore((s) => s.hydrate);
  const isHydrated = useHTStore((s) => s.isHydrated);
  const deliberations = useHTStore((s) => s.deliberations);
  const updateTrainingStack = useHTStore((s) => s.updateTrainingStack);
  const updateProfile = useHTStore((s) => s.updateProfile);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editGoal, setEditGoal] = useState('');
  const [editPrimary, setEditPrimary] = useState('');
  const [editSecondary, setEditSecondary] = useState('');
  const [editHeight, setEditHeight] = useState(0);
  const [editWeight, setEditWeight] = useState(0);
  const [editConditions, setEditConditions] = useState('');
  const [editTrainingContext, setEditTrainingContext] = useState('');
  const [editAge, setEditAge] = useState<number | ''>('');
  const [editGender, setEditGender] = useState('');
  const [editTrainingYears, setEditTrainingYears] = useState<number | ''>('');
  const [editBodyFatPct, setEditBodyFatPct] = useState<number | ''>('');
  const [editActivityLevel, setEditActivityLevel] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (isHydrated && !activeProfileId) router.push("/");
  }, [activeProfileId, isHydrated, router]);

  // Close menu when clicking/touching outside
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  if (!activeProfileId) return null;
  const profile = profiles[activeProfileId];
  if (!profile) return null;
  const allProfiles = Object.values(profiles);

  const switchProfile = (id: string) => {
    setActiveProfileId(id);
    useHTStore.getState().setDeliberations([]);
    setProfileMenuOpen(false);
    router.push("/round-table");
  };

  const openEditModal = () => {
    const stack = profile?.trainingStack;
    setEditGoal(stack?.goal || 'hypertrophy');
    setEditPrimary(stack?.primary || 'Musculação');
    setEditSecondary(stack?.secondary || 'Nenhum');
    setEditHeight(stack?.height || 180);
    setEditWeight(stack?.weight || 85);
    setEditConditions(stack?.conditions || '');
    setEditTrainingContext(stack?.trainingContext || '');
    setEditAge(stack?.age || '');
    setEditGender(stack?.gender || '');
    setEditTrainingYears(stack?.trainingYears ?? '');
    setEditBodyFatPct(stack?.bodyFatPct ?? '');
    setEditActivityLevel(stack?.activityLevel || '');
    setEditProfileOpen(true);
    setProfileMenuOpen(false);
  };

  const saveEditProfile = async () => {
    if (!activeProfileId || !profile) return;
    const stackData = {
      goal: editGoal,
      primary: editPrimary,
      secondary: editSecondary,
      height: editHeight,
      weight: editWeight,
      conditions: editConditions,
      trainingContext: editTrainingContext,
      age: editAge || undefined,
      gender: editGender || undefined,
      trainingYears: editTrainingYears === '' ? undefined : editTrainingYears,
      bodyFatPct: editBodyFatPct === '' ? undefined : editBodyFatPct,
      activityLevel: editActivityLevel || undefined,
    };
    const previousWeight = profile.trainingStack?.weight;
    updateTrainingStack(activeProfileId, stackData);
    try {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile.id,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          trainingStack: stackData,
        }),
      });
      // Auto-log weight if it changed
      if (editWeight && editWeight !== previousWeight) {
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId: activeProfileId, weight: editWeight }),
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error saving profile:', e);
    }
    setEditProfileOpen(false);
  };

  const isRoundTable = pathname.includes("/round-table");
  const isDashboard = pathname.includes("/dashboard");
  const hasActiveDeliberation = deliberations.length > 0;

  return (
    <div className="flex h-[100dvh] w-full bg-base dark:bg-zinc-950 overflow-hidden text-zinc-900 dark:text-zinc-50 font-body relative isolate">

      <div className="fixed top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-health-400/10 dark:bg-health-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ─── Sidebar Desktop ─── */}
      <aside className="hidden md:flex flex-col w-20 lg:w-72 h-full bg-white/50 dark:bg-zinc-900/50 md:backdrop-blur-xl border-r border-zinc-200/50 dark:border-white/5 pt-6 pb-4 z-40">

        {/* Profile Switcher */}
        <div className="px-3 lg:px-4 mb-6 relative" ref={menuRef}>
          <button
            onClick={() => setProfileMenuOpen((v) => !v)}
            className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all group"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-sm shrink-0">
              <Image src={profile.avatarUrl} alt={profile.name} width={40} height={40} className="object-cover bg-health-50 mix-blend-multiply dark:mix-blend-normal" />
            </div>
            <div className="hidden lg:flex items-center justify-between flex-1 min-w-0">
              <div className="overflow-hidden">
                <h3 className="text-sm font-semibold truncate">{profile.name}</h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-health-500 animate-pulse" /> Sessão Ativa
                </span>
              </div>
              <CaretUpDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
            </div>
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {profileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute left-3 right-3 lg:left-4 lg:right-4 top-[calc(100%+4px)] z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                  {allProfiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => switchProfile(p.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                        <Image src={p.avatarUrl} alt={p.name} width={32} height={32} className="object-cover mix-blend-multiply dark:mix-blend-normal" />
                      </div>
                      <span className="text-sm font-medium flex-1 text-left truncate">{p.name}</span>
                      {p.id === activeProfileId && (
                        <Check className="w-4 h-4 text-health-500 shrink-0" weight="bold" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-800 p-2 space-y-1">
                  <div className="px-3 py-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Modelo IA</label>
                    <select
                      value={(profile?.preferredModel as ModelId) || 'gpt-4o'}
                      onChange={(e) => activeProfileId && updateProfile(activeProfileId, { preferredModel: e.target.value })}
                      className="w-full text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 outline-none cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors appearance-none"
                    >
                      {Object.entries(MODEL_REGISTRY).map(([id, info]) => (
                        <option key={id} value={id}>{info.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={openEditModal}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                  >
                    <PencilSimple className="w-4 h-4" weight="bold" />
                    Editar Perfil
                  </button>
                  <button
                    onClick={() => { setProfileMenuOpen(false); router.push("/"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" weight="bold" />
                    Gerenciar Atletas
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-3 lg:px-4 space-y-1 overflow-y-auto">
          <span className="hidden lg:block text-[10px] font-black text-zinc-400 tracking-[0.2em] uppercase mb-3 mt-2 px-2">Deliberação</span>

          <button
            onClick={() => router.push("/round-table")}
            className={`relative w-full flex items-center gap-3 p-2 rounded-2xl transition-all duration-300 transform-gpu group ${
              isRoundTable ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg" : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative ${
              isRoundTable ? "bg-white/20 dark:bg-zinc-900/20" : "bg-zinc-100 dark:bg-zinc-800"
            }`}>
              <UsersThree weight="fill" className={`w-5 h-5 ${isRoundTable ? "text-white dark:text-zinc-900" : "text-zinc-500"}`} />
              {hasActiveDeliberation && !isRoundTable && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-health-500 ring-2 ring-white dark:ring-zinc-900" />
              )}
            </div>
            <div className="hidden lg:block text-left">
              <h4 className={`text-sm font-bold ${isRoundTable ? "text-white dark:text-zinc-900" : "text-zinc-700 dark:text-zinc-300"}`}>Mesa Redonda</h4>
              <p className={`text-[10px] ${isRoundTable ? "text-white/70 dark:text-zinc-600" : "text-zinc-400"}`}>Conselho Multidisciplinar</p>
            </div>
            {isRoundTable && <motion.div layoutId="sidebar-active-rt" className="absolute left-0 w-1 h-8 bg-white dark:bg-zinc-900 rounded-r-full" />}
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className={`relative w-full flex items-center gap-3 p-2 rounded-2xl transition-all duration-300 transform-gpu group ${
              isDashboard ? "bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/50 dark:border-white/10" : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDashboard ? "bg-health-50 dark:bg-health-900/20" : "bg-zinc-100 dark:bg-zinc-800"
            }`}>
              <ChartLineUp weight="fill" className={`w-5 h-5 ${isDashboard ? "text-health-600 dark:text-health-400" : "text-zinc-500"}`} />
            </div>
            <div className="hidden lg:block text-left">
              <h4 className={`text-xs font-semibold ${isDashboard ? "text-health-700 dark:text-health-400" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50"}`}>Progresso</h4>
              <p className={`text-[10px] ${isDashboard ? "text-health-500" : "text-zinc-400"}`}>Tracking de Peso</p>
            </div>
            {isDashboard && <motion.div layoutId="sidebar-active-dash" className="absolute left-0 w-1 h-5 bg-health-500 rounded-r-full" />}
          </button>

          <div className="my-4 border-t border-zinc-200/70 dark:border-white/5" />
          <span className="hidden lg:block text-[10px] font-black text-zinc-400 tracking-[0.2em] uppercase mb-3 px-2">Consultas Diretas</span>

          {SPECIALISTS.map((item) => {
            const isActive = pathname.includes(item.route);
            return (
              <button key={item.id} onClick={() => router.push(item.route)}
                className={`relative w-full flex items-center gap-3 p-2 rounded-2xl transition-all duration-300 transform-gpu group ${
                  isActive ? "bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/50 dark:border-white/10" : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl overflow-hidden shrink-0 relative transition-all duration-300 ${
                  isActive ? "ring-2 ring-health-500 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-900" : "opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-90"
                }`}>
                  <Image src={item.avatar} alt={item.label} fill className="object-cover" />
                </div>
                <div className="hidden lg:block text-left">
                  <h4 className={`text-xs font-semibold ${isActive ? "text-health-700 dark:text-health-400" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50"}`}>{item.label}</h4>
                  <p className={`text-[10px] ${isActive ? "text-health-500" : "text-zinc-400"}`}>{item.sublabel}</p>
                </div>
                {isActive && <motion.div layoutId="sidebar-active-spec" className="absolute left-0 w-1 h-5 bg-health-500 rounded-r-full" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 overflow-hidden relative flex flex-col pb-[calc(5rem+env(safe-area-inset-bottom,0px)+1rem)] md:pb-0 z-10 w-full h-full">
        {children}
      </main>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-900/95 border-t border-zinc-200/50 dark:border-white/5 px-2 pt-1.5 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Specialists */}
          {SPECIALISTS.map((item) => {
            const isActive = pathname.includes(item.route);
            return (
              <button key={item.id} onClick={() => router.push(item.route)}
                className="flex flex-col items-center justify-center min-w-[3.5rem] py-1.5 rounded-xl transition-all active:scale-95"
              >
                <div className={`w-9 h-9 rounded-full overflow-hidden relative transition-all duration-300 ${isActive ? "ring-2 ring-health-500 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900" : "opacity-50 grayscale"}`}>
                  <Image src={item.avatar} alt={item.label} fill className="object-cover" />
                </div>
                <span className={`text-[9px] font-bold mt-0.5 ${isActive ? "text-health-600 dark:text-health-400" : "text-zinc-400"}`}>{item.label}</span>
              </button>
            );
          })}

          {/* CENTER: Round Table */}
          <button onClick={() => router.push("/round-table")}
            className={`flex flex-col items-center justify-center min-w-[3.5rem] py-1.5 transition-all active:scale-90`}
          >
            <div className={`relative flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg ${isRoundTable ? "bg-zinc-900 dark:bg-white" : "bg-zinc-800 dark:bg-zinc-200"}`}>
              <UsersThree weight="fill" className={`w-6 h-6 ${isRoundTable ? "text-white dark:text-zinc-900" : "text-zinc-200 dark:text-zinc-700"}`} />
              {hasActiveDeliberation && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-health-500 border-2 border-white dark:border-zinc-950" />
              )}
            </div>
            <span className={`text-[9px] font-bold mt-0.5 ${isRoundTable ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`}>Mesa</span>
          </button>

          {/* Dashboard */}
          <button onClick={() => router.push("/dashboard")}
            className="flex flex-col items-center justify-center min-w-[3.5rem] py-1.5 rounded-xl transition-all active:scale-95"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${isDashboard ? "bg-health-50 dark:bg-health-900/30" : ""}`}>
              <ChartLineUp weight="fill" className={`w-5 h-5 ${isDashboard ? "text-health-600 dark:text-health-400" : "text-zinc-400"}`} />
            </div>
            <span className={`text-[9px] font-bold mt-0.5 ${isDashboard ? "text-health-600 dark:text-health-400" : "text-zinc-400"}`}>Progresso</span>
          </button>

          {/* Profile Switcher */}
          <button
            onClick={() => setProfileMenuOpen((v) => !v)}
            className="flex flex-col items-center justify-center min-w-[3.5rem] py-1.5 rounded-xl transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-health-500/50">
              <Image src={profile.avatarUrl} alt={profile.name} width={36} height={36} className="object-cover mix-blend-multiply dark:mix-blend-normal" />
            </div>
            <span className="text-[9px] font-bold mt-0.5 text-zinc-400 truncate max-w-[3.5rem]">{profile.name.split(' ')[0]}</span>
          </button>
        </div>

        {/* Mobile Profile Dropdown */}
        <AnimatePresence>
          {profileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/20"
                onClick={() => setProfileMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-3 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-3 py-1">Trocar Sessão</p>
                  {allProfiles.map((p) => (
                    <button key={p.id} onClick={() => switchProfile(p.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                        <Image src={p.avatarUrl} alt={p.name} width={40} height={40} className="object-cover mix-blend-multiply dark:mix-blend-normal" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-[10px] text-zinc-400">{p.id === activeProfileId ? "Sessão atual" : "Trocar para este atleta"}</p>
                      </div>
                      {p.id === activeProfileId && <Check className="w-4 h-4 text-health-500" weight="bold" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-800 p-3 space-y-1">
                  <div className="px-3 py-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Modelo IA</label>
                    <select
                      value={(profile?.preferredModel as ModelId) || 'gpt-4o'}
                      onChange={(e) => activeProfileId && updateProfile(activeProfileId, { preferredModel: e.target.value })}
                      className="w-full text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 outline-none cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors appearance-none"
                    >
                      {Object.entries(MODEL_REGISTRY).map(([id, info]) => (
                        <option key={id} value={id}>{info.label}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={openEditModal}
                    className="w-full flex items-center gap-2.5 px-3 py-3 rounded-2xl text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <PencilSimple className="w-4 h-4" weight="bold" />
                    <span>Editar Perfil</span>
                  </button>
                  <button onClick={() => { setProfileMenuOpen(false); router.push("/"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-3 rounded-2xl text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" weight="bold" />
                    <span>Gerenciar Atletas</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editProfileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setEditProfileOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  <PencilSimple className="w-4 h-4 text-health-500" />
                  <span className="text-sm font-bold">Editar Perfil</span>
                </div>
                <button onClick={() => setEditProfileOpen(false)} className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Goal */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">Foco Principal</label>
                  <div className="relative">
                    <select value={editGoal} onChange={(e) => setEditGoal(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-health-500/50 appearance-none">
                      <option value="hypertrophy">Força & Hipertrofia</option>
                      <option value="conditioning">Condicionamento</option>
                      <option value="recomp">Recomposição Corporal</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">▾</div>
                  </div>
                </div>

                {/* Primary Sport */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">Modalidade Primária</label>
                  <div className="relative">
                    <select value={editPrimary} onChange={(e) => setEditPrimary(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-health-500/50 appearance-none">
                      <option value="Striking">Artes Marciais - Striking (Muay Thai)</option>
                      <option value="Grappling">Artes Marciais - Grappling (BJJ)</option>
                      <option value="Musculação">Musculação</option>
                      <option value="Powerlifting">Powerlifting</option>
                      <option value="CrossFit">CrossFit</option>
                      <option value="Calistenia">Calistenia</option>
                      <option value="Corrida">Corrida / Endurance</option>
                      <option value="Natação">Natação</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">▾</div>
                  </div>
                </div>

                {/* Secondary Sport */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">Modalidade Secundária</label>
                  <div className="relative">
                    <select value={editSecondary} onChange={(e) => setEditSecondary(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-health-500/50 appearance-none">
                      <option value="Musculação">Musculação (Prevenção / Suporte)</option>
                      <option value="Nenhum">Não treino mais nada explicitamente</option>
                      <option value="Cardio">Cardio Livre (Corrida / Natação)</option>
                      <option value="Yoga">Yoga / Mobilidade</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">▾</div>
                  </div>
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">Idade</label>
                    <input type="number" inputMode="numeric" min="10" max="100" value={editAge} onChange={(e) => setEditAge(e.target.value === '' ? '' : Number(e.target.value))} placeholder="25" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-health-500/50 placeholder:text-zinc-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">Sexo Biológico</label>
                    <div className="relative">
                      <select value={editGender} onChange={(e) => setEditGender(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-health-500/50 appearance-none">
                        <option value="">Não informado</option>
                        <option value="male">Masculino</option>
                        <option value="female">Feminino</option>
                        <option value="other">Outro</option>
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">▾</div>
                    </div>
                  </div>
                </div>

                {/* Height & Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">Altura (CM)</label>
                    <input type="number" inputMode="numeric" value={editHeight} onChange={(e) => setEditHeight(Number(e.target.value))} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-health-500/50" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">Peso (KG)</label>
                    <input type="number" inputMode="decimal" step="0.1" value={editWeight} onChange={(e) => setEditWeight(Number(e.target.value))} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-health-500/50" />
                  </div>
                </div>

                {/* Training Years & BF% */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">Tempo de Treino (Anos)</label>
                    <input type="number" inputMode="decimal" step="0.5" min="0" value={editTrainingYears} onChange={(e) => setEditTrainingYears(e.target.value === '' ? '' : Number(e.target.value))} placeholder="2" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-health-500/50 placeholder:text-zinc-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">Gordura Corporal %</label>
                    <input type="number" inputMode="decimal" step="0.1" min="3" max="60" value={editBodyFatPct} onChange={(e) => setEditBodyFatPct(e.target.value === '' ? '' : Number(e.target.value))} placeholder="15" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-health-500/50 placeholder:text-zinc-400" />
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">Nível de Atividade</label>
                  <div className="relative">
                    <select value={editActivityLevel} onChange={(e) => setEditActivityLevel(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-health-500/50 appearance-none">
                      <option value="">Não informar</option>
                      <option value="sedentary">Sedentário (pouco ou nenhum exercício)</option>
                      <option value="light">Leve (1-3x/semana)</option>
                      <option value="moderate">Moderado (3-5x/semana)</option>
                      <option value="active">Ativo (6-7x/semana)</option>
                      <option value="very_active">Muito Ativo (2x/dia ou trabalho físico)</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">▾</div>
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">Condições de Saúde</label>
                  <input type="text" value={editConditions} onChange={(e) => setEditConditions(e.target.value)} placeholder="Ex: Joelho valgo leve, diabetes tipo 2..." className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-health-500/50 placeholder:text-zinc-400" />
                </div>

                {/* Training Context */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">Contexto de Treino</label>
                  <textarea value={editTrainingContext} onChange={(e) => setEditTrainingContext(e.target.value)} rows={3} placeholder="Ex: Treino musculação 5x/semana há 3 anos..." className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-health-500/50 placeholder:text-zinc-400 resize-none" />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                <button onClick={saveEditProfile}
                  className="w-full py-3.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
