"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Barbell, Heartbeat, PersonSimpleWalk } from "@phosphor-icons/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHTStore } from "@/stores/htStore";

// Form steps definition
const STEPS = [
  { id: 1, title: "Foco Principal", description: "O que vamos transformar no seu corpo?" },
  { id: 2, title: "Training Stack", description: "Quais esportes compõem a sua rotina?" },
  { id: 3, title: "Parametrização", description: "Ajuste fino matemático do seu corpo para as IAs." },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  // Zustand
  const { activeProfileId, updateTrainingStack, profiles } = useHTStore();

  // Local Form State
  const [goal, setGoal] = useState("hypertrophy");
  const [primarySport, setPrimarySport] = useState("Musculação");
  const [secondarySport, setSecondarySport] = useState("Nenhum");
  const [height, setHeight] = useState(180);
  const [weight, setWeight] = useState(85.5);
  const [trainingContext, setTrainingContext] = useState("");
  const [trainingYears, setTrainingYears] = useState<number | "">(2);
  const [conditions, setConditions] = useState("");
  const [age, setAge] = useState<number | "">(25);
  const [gender, setGender] = useState("male");
  const [bodyFatPct, setBodyFatPct] = useState<number | "">("");
  const [activityLevel, setActivityLevel] = useState("");

  const handleNext = async () => {
    if (step < 3) {
      setStep((p) => p + 1);
    } else {
      if (!age || !gender) return; // basic validation
      if (activeProfileId) {
        const stackData = {
           goal: goal,
           primary: primarySport,
           secondary: secondarySport,
           height: height,
           weight: weight,
           conditions: conditions,
           trainingContext: trainingContext,
           age: age || undefined,
           trainingYears: trainingYears || undefined,
           gender: gender || undefined,
           bodyFatPct: bodyFatPct || undefined,
           activityLevel: activityLevel || undefined,
        };
        // Save to Zustand Memory
        updateTrainingStack(activeProfileId, stackData);
        
        // Save to SQLite via Prisma (Upsert Profile + Stack)
        const activeProfile = profiles[activeProfileId];
        if (activeProfile) {
          try {
            await fetch('/api/profiles', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  id: activeProfile.id,
                  name: activeProfile.name,
                  avatarUrl: activeProfile.avatarUrl,
                  trainingStack: stackData
               })
            });
          } catch (e) {
            console.error("Error saving profile to database", e);
          }
        }
      }
      
      router.push("/round-table?autostart=1"); // Mesa Redonda inicia o protocolo completo
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-base dark:bg-zinc-950 flex isolate relative overflow-hidden text-zinc-900 dark:text-zinc-50">
      {/* Background Graphic Context */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-health-400/20 dark:bg-health-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-zinc-300/30 dark:bg-zinc-800/20 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Container */}
      <div className="w-full max-w-5xl mx-auto flex flex-col pt-8 md:pt-24 px-4 md:px-12 relative z-10">
        
        {/* Progress Nav */}
        <header className="w-full flex items-center justify-between mb-8 md:mb-16">
          <div className="flex flex-col">
            <span className="text-health-600 dark:text-health-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">
              HealthTeam v2 — Step 0{step}
            </span>
            <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-balance mt-1">
              {STEPS[step - 1].title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-8 bg-zinc-900 dark:bg-white" : i < step ? "w-2 bg-health-500" : "w-2 bg-zinc-300 dark:bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </header>

        {/* Wizard Content */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, filter: "blur(10px)", x: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
              exit={{ opacity: 0, filter: "blur(10px)", x: -20 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="w-full max-w-xl"
            >
              <h2 className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-8">
                {STEPS[step - 1].description}
              </h2>

              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GoalCard
                    icon={<Barbell weight="duotone" className="w-8 h-8 text-health-600 dark:text-health-400" />}
                    title="Força & Hipertrofia"
                    desc="Ganho de massa magra, Powerlifting ou Fisiculturismo."
                    selected={goal === "hypertrophy"}
                    onClick={() => setGoal("hypertrophy")}
                  />
                  <GoalCard
                    icon={<Heartbeat weight="duotone" className="w-8 h-8 text-health-600 dark:text-health-400" />}
                    title="Condicionamento"
                    desc="Gás para lutas, CrossFit ou aumento de VO2 Máx."
                    selected={goal === "conditioning"}
                    onClick={() => setGoal("conditioning")}
                  />
                  <GoalCard
                    icon={<PersonSimpleWalk weight="duotone" className="w-8 h-8 text-health-600 dark:text-health-400" />}
                    title="Recomposição"
                    desc="Perder gordura sem sacrificar todo o músculo no processo."
                    selected={goal === "recomp"}
                    onClick={() => setGoal("recomp")}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="liquid-glass p-5 md:p-8 rounded-2xl md:rounded-[2rem] flex flex-col gap-5 md:gap-6">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">
                      Modalidade Primária (Maior Foco)
                    </label>
                    <div className="relative">
                      <select value={primarySport} onChange={(e) => setPrimarySport(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-health-500/50 appearance-none">
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
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">
                      Modalidade Secundária (Suporte)
                    </label>
                    <div className="relative">
                      <select value={secondarySport} onChange={(e) => setSecondarySport(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-health-500/50 appearance-none">
                        <option value="Musculação">Musculação (Prevenção / Suporte)</option>
                        <option value="Nenhum">Não treino mais nada explicitamente</option>
                        <option value="Cardio">Cardio Livre (Corrida / Natação)</option>
                        <option value="Yoga">Yoga / Mobilidade</option>
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">▾</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">
                      Tempo de Treino (Anos)
                    </label>
                    <input type="number" inputMode="decimal" step="0.5" min="0" value={trainingYears} onChange={(e) => setTrainingYears(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="Ex: 2.5"
                      className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-health-500/50 placeholder:text-zinc-400" />
                    <p className="text-[10px] text-zinc-400 mt-1.5">Quantos anos de treino consistente você tem?</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">
                      Sua Situação Atual (Opcional)
                    </label>
                    <textarea
                      value={trainingContext}
                      onChange={(e) => setTrainingContext(e.target.value)}
                      rows={3}
                      placeholder="Ex: Treino musculação 5x/semana há 3 anos, faço Muay Thai 2x, quero competir em 6 meses mas tenho pouco tempo livre..."
                      className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-health-500/50 placeholder:text-zinc-400 resize-none"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1.5">Quanto mais contexto, melhor os especialistas vão entender sua realidade.</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="liquid-glass p-5 md:p-8 rounded-2xl md:rounded-[2rem] grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                  {/* Row 1: Age + Gender */}
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">
                      Idade
                    </label>
                    <input type="number" inputMode="numeric" min="10" max="100" value={age} onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))} placeholder="25" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-health-500/50 placeholder:text-zinc-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">
                      Sexo Biológico
                    </label>
                    <div className="relative">
                      <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-health-500/50 appearance-none">
                        <option value="male">Masculino</option>
                        <option value="female">Feminino</option>
                        <option value="other">Outro</option>
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">▾</div>
                    </div>
                  </div>
                  {/* Row 2: Height + Weight */}
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">
                      Altura (CM)
                    </label>
                    <input type="number" inputMode="numeric" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-health-500/50" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">
                      Peso Atual (KG)
                    </label>
                    <input type="number" inputMode="decimal" step="0.1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-health-500/50" />
                  </div>
                  {/* Row 3: BF% + Activity Level (optional) */}
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">
                      Gordura Corporal % <span className="text-zinc-400 font-normal normal-case">(opcional)</span>
                    </label>
                    <input type="number" inputMode="decimal" step="0.1" min="3" max="60" value={bodyFatPct} onChange={(e) => setBodyFatPct(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Ex: 15" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-health-500/50 placeholder:text-zinc-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">
                      Nível de Atividade <span className="text-zinc-400 font-normal normal-case">(opcional)</span>
                    </label>
                    <div className="relative">
                      <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-health-500/50 appearance-none">
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
                  {/* Row 4: Conditions */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-zinc-500 tracking-[0.1em] uppercase mb-2 block">
                      Condições de Saúde Relevantes
                    </label>
                    <input type="text" value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder="Ex: Joelho valgo leve, diabetes tipo 2..." className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-health-500/50 placeholder:text-zinc-400" />
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <footer className="w-full py-6 md:py-8 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800/60 mt-auto">
          <button
            onClick={() => setStep((p) => Math.max(1, p - 1))}
            className={`text-sm font-medium py-3 px-4 -ml-4 transition-opacity ${step === 1 ? "opacity-0 pointer-events-none" : "opacity-100 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
          >
            Voltar
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full px-6 py-3.5 text-sm font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            <span>{step === 3 ? "Finalizar Setup" : "Continuar"}</span>
            <ArrowRight weight="bold" className="w-4 h-4" />
          </button>
        </footer>

      </div>
    </main>
  );
}

function GoalCard({ title, desc, icon, selected, onClick }: { title: string; desc: string; icon: React.ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-5 md:p-6 rounded-2xl md:rounded-3xl transition-all duration-300 border flex flex-col gap-3 md:gap-4 ${
        selected
          ? "bg-health-50 dark:bg-health-900/20 border-health-500/50 shadow-[0_10px_30px_-10px_rgba(34,197,94,0.2)]"
          : "bg-white/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 hover:bg-white dark:hover:bg-zinc-900"
      }`}
    >
      <div className="w-12 h-12 rounded-2xl bg-health-100 dark:bg-health-900/40 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">{title}</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}
