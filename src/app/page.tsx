"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash, Camera, Spinner, X, Check } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useHTStore } from "@/stores/htStore";
import { useEffect, useRef, useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } },
};

export default function ProfileSelection() {
  const router = useRouter();
  const setActiveProfileId = useHTStore((s) => s.setActiveProfileId);
  const profiles = useHTStore((s) => s.profiles);
  const setProfiles = useHTStore((s) => s.setProfiles);
  const updateProfile = useHTStore((s) => s.updateProfile);
  const removeProfile = useHTStore((s) => s.removeProfile);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Modal state
  const [addModal, setAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  const refreshProfiles = async () => {
    try {
      const res = await fetch('/api/profiles');
      if (!res.ok) return;
      const data = await res.json();
      if (data.profiles) setProfiles(data.profiles);
    } catch {
      // Network error — ignore, profiles stay from localStorage
    }
  };

  useEffect(() => {
    refreshProfiles().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (addModal) setTimeout(() => nameInputRef.current?.focus(), 100);
  }, [addModal]);

  const handleSelect = (id: string) => {
    setActiveProfileId(id);
    useHTStore.getState().setDeliberations([]);
    router.push(profiles[id]?.trainingStack ? "/round-table" : "/onboarding");
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const id = crypto.randomUUID();
    const newProfile = {
      id, name: newName.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(newName)}&backgroundColor=e5e7eb`
    };
    updateProfile(id, newProfile);
    setActiveProfileId(id);
    setAddModal(false);
    setNewName("");
    router.push("/onboarding");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);
    setDeleting(id);
    removeProfile(id);
    try {
      const res = await fetch(`/api/profiles?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Erro');
    } catch (err: any) {
      await refreshProfiles(); // restore if failed
    } finally {
      setDeleting(null);
    }
  };

  const handleFileChange = async (profileId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(profileId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('profileId', profileId);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.avatarUrl) {
        updateProfile(profileId, { avatarUrl: `${data.avatarUrl}?t=${Date.now()}` });
      }
    } finally {
      setUploading(null);
      if (fileInputRefs.current[profileId]) fileInputRefs.current[profileId]!.value = '';
    }
  };

  const profileList = Object.values(profiles) as any[];

  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-base dark:bg-zinc-950 p-4 relative overflow-hidden">
      {/* Grain */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015]">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /></filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }} className="mb-8 md:mb-12 text-center"
        >
          <span className="text-health-600 font-bold tracking-widest uppercase text-xs mb-3 block">HealthTeam v2</span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tighter text-zinc-900 dark:text-zinc-50 text-balance">
            Quem está treinando hoje?
          </h1>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="flex flex-wrap justify-center gap-6 md:gap-14"
        >
          {!loading && profileList.map((profile: any) => (
            <motion.div key={profile.id} variants={itemVariants} className="flex flex-col items-center gap-4 relative">
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
                ref={(el) => { fileInputRefs.current[profile.id] = el; }}
                onChange={(e) => handleFileChange(profile.id, e)}
              />

              {/* Delete badge — top-left */}
              <button
                onClick={() => setDeleteTarget({ id: profile.id, name: profile.name })}
                disabled={deleting === profile.id}
                title="Deletar Atleta"
                className="absolute -top-3 -left-3 z-30 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-red-50 hover:border-red-400 active:scale-95"
              >
                {deleting === profile.id
                  ? <Spinner className="w-4 h-4 text-red-400 animate-spin" />
                  : <Trash weight="bold" className="w-4 h-4 text-zinc-400" />}
              </button>

              {/* Avatar + Camera */}
              <div className="relative w-28 h-28 md:w-36 md:h-36">
                <button onClick={() => handleSelect(profile.id)}
                  className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-white dark:bg-zinc-900 shadow-md border border-zinc-200/50 dark:border-white/5 transition-all duration-300 transform-gpu hover:scale-105 hover:-translate-y-1 active:scale-95 hover:shadow-[0_20px_40px_-15px_rgba(34,197,94,0.2)]"
                >
                  {uploading === profile.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                      <Spinner className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  <Image src={profile.avatarUrl} alt={profile.name} fill
                    unoptimized={profile.avatarUrl.startsWith('/uploads/')}
                    className="object-cover mix-blend-multiply dark:mix-blend-normal"
                  />
                </button>

                {/* Camera badge — bottom-right */}
                <button onClick={() => fileInputRefs.current[profile.id]?.click()}
                  title="Trocar foto"
                  className="absolute -bottom-3 -right-3 z-30 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-health-50 hover:border-health-400 active:scale-95"
                >
                  <Camera weight="bold" className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              <span className="text-base md:text-lg font-semibold tracking-tight text-zinc-700 dark:text-zinc-300">
                {profile.name}
              </span>
            </motion.div>
          ))}

          {/* Add Profile */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
            <button onClick={() => setAddModal(true)}
              className="w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-600 transition-all duration-300 hover:scale-105 hover:border-health-500 hover:text-health-500 active:scale-95"
            >
              <Plus weight="bold" className="w-8 h-8 md:w-10 md:h-10" />
            </button>
            <span className="text-base md:text-lg font-semibold tracking-tight text-zinc-400 dark:text-zinc-600">Adicionar</span>
          </motion.div>
        </motion.div>
      </div>

      {/* ─── Modal: Add Profile ─── */}
      <AnimatePresence>
        {addModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              onClick={() => { setAddModal(false); setNewName(""); }}
            />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-50 inset-x-4 md:inset-x-auto md:w-96 top-1/2 md:left-1/2 md:-translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800"
            >
              <h2 className="text-xl font-bold mb-1">Novo Atleta</h2>
              <p className="text-sm text-zinc-400 mb-6">Qual o nome do atleta?</p>
              <input
                ref={nameInputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Ex: João Silva"
                className="w-full border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-base text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800 outline-none focus:border-health-500 transition-colors placeholder:text-zinc-400 mb-6"
              />
              <div className="flex gap-3">
                <button onClick={() => { setAddModal(false); setNewName(""); }}
                  className="flex-1 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button onClick={handleAdd} disabled={!newName.trim()}
                  className="flex-1 py-3 rounded-2xl bg-health-500 text-white text-sm font-bold hover:bg-health-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Check weight="bold" className="w-4 h-4" /> Criar Perfil
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Modal: Confirm Delete ─── */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-50 inset-x-4 md:inset-x-auto md:w-96 top-1/2 md:left-1/2 md:-translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-5">
                <Trash weight="fill" className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-bold mb-1">Deletar Atleta</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Tem certeza que deseja excluir <strong className="text-zinc-900 dark:text-zinc-100">"{deleteTarget.name}"</strong>? Todo o histórico de chats e deliberações será perdido.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button onClick={confirmDelete}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash weight="bold" className="w-4 h-4" /> Deletar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
