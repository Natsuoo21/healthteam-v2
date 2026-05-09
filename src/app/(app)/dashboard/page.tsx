"use client";

import { useState, useEffect } from "react";
import { useHTStore } from "@/stores/htStore";
import { useRouter } from "next/navigation";
import { ChartLineUp, Plus } from "@phosphor-icons/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface WeightEntry {
  date: string;
  weight: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const activeProfileId = useHTStore((s) => s.activeProfileId);
  const profiles = useHTStore((s) => s.profiles);
  const profile = profiles[activeProfileId || ""];

  const [logs, setLogs] = useState<WeightEntry[]>([]);
  const [newWeight, setNewWeight] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activeProfileId) return;
    setLoading(true);
    fetch(`/api/progress?profileId=${activeProfileId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLogs(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeProfileId]);

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!w || w <= 0 || w > 500 || !activeProfileId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: activeProfileId, weight: w }),
      });
      if (res.ok) {
        const now = new Date().toISOString();
        setLogs((prev) => [...prev, { date: now, weight: w }]);
        setNewWeight("");
      }
    } catch (e) {
      console.error("Error adding weight:", e);
    } finally {
      setSaving(false);
    }
  };

  const chartData = logs.map((l) => ({
    date: new Date(l.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    weight: l.weight,
  }));

  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : null;
  const firstWeight = logs.length > 0 ? logs[0].weight : null;
  const totalChange =
    currentWeight != null && firstWeight != null
      ? (currentWeight - firstWeight).toFixed(1)
      : null;
  const avgWeight =
    logs.length > 0
      ? (logs.reduce((sum, l) => sum + l.weight, 0) / logs.length).toFixed(1)
      : null;

  if (!activeProfileId) {
    router.push("/");
    return null;
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-zinc-200/50 dark:border-white/5 bg-white/95 dark:bg-zinc-900/95 md:bg-white/60 md:dark:bg-zinc-900/60 md:backdrop-blur-xl sticky top-0 z-20">
        <div className="p-2 rounded-xl bg-health-500/10 border border-health-500/20">
          <ChartLineUp weight="duotone" className="w-5 h-5 text-health-600" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight">Progresso</h1>
          <p className="text-[9px] text-health-500 font-bold uppercase tracking-widest">
            Tracking de Peso
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-3 md:px-8 py-6 md:py-8 space-y-6 pb-24 md:pb-16">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="liquid-glass rounded-2xl p-4 text-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                Atual
              </p>
              <p className="text-xl md:text-2xl font-display font-bold text-zinc-900 dark:text-zinc-50">
                {currentWeight != null ? `${currentWeight}` : "—"}
              </p>
              <p className="text-[10px] text-zinc-400">kg</p>
            </div>
            <div className="liquid-glass rounded-2xl p-4 text-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                Variação
              </p>
              <p
                className={`text-xl md:text-2xl font-display font-bold ${
                  totalChange != null
                    ? Number(totalChange) > 0
                      ? "text-amber-500"
                      : Number(totalChange) < 0
                      ? "text-health-500"
                      : "text-zinc-500"
                    : "text-zinc-400"
                }`}
              >
                {totalChange != null
                  ? `${Number(totalChange) > 0 ? "+" : ""}${totalChange}`
                  : "—"}
              </p>
              <p className="text-[10px] text-zinc-400">kg total</p>
            </div>
            <div className="liquid-glass rounded-2xl p-4 text-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                Média
              </p>
              <p className="text-xl md:text-2xl font-display font-bold text-zinc-900 dark:text-zinc-50">
                {avgWeight ?? "—"}
              </p>
              <p className="text-[10px] text-zinc-400">kg</p>
            </div>
          </div>

          {/* Chart */}
          <div className="liquid-glass rounded-2xl p-4 md:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">
              Evolução do Peso
            </p>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-6 h-6 border-2 border-health-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : chartData.length >= 2 ? (
              <div className="h-56 md:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      stroke="currentColor"
                      className="text-zinc-400"
                    />
                    <YAxis
                      domain={["dataMin - 2", "dataMax + 2"]}
                      tick={{ fontSize: 10 }}
                      stroke="currentColor"
                      className="text-zinc-400"
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background, rgba(255,255,255,0.95))",
                        border: "1px solid var(--foreground, #e4e4e7)",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "var(--foreground, #18181b)",
                        borderColor: "rgba(128,128,128,0.2)",
                      }}
                      labelStyle={{ fontWeight: "bold" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      dot={{ fill: "#22c55e", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: "#16a34a" }}
                      name="Peso (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <ChartLineUp className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="text-sm text-zinc-400">
                  {chartData.length === 1
                    ? "Registre mais um peso para ver o gráfico"
                    : "Nenhum registro ainda"}
                </p>
                <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1">
                  Use o formulário abaixo para adicionar seu peso
                </p>
              </div>
            )}
          </div>

          {/* Add weight form */}
          <div className="liquid-glass rounded-2xl p-4 md:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">
              Registar Peso
            </p>
            <form onSubmit={handleAddWeight} className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder={currentWeight ? `${currentWeight}` : "Ex: 85.5"}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3.5 pr-12 text-sm outline-none focus:ring-2 focus:ring-health-500/50 placeholder:text-zinc-400"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-medium">
                  kg
                </span>
              </div>
              <button
                type="submit"
                disabled={!newWeight.trim() || saving}
                className="h-[50px] px-6 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-30 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" weight="bold" />
                Registar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
