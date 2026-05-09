import type { Skill } from "../types";

function getLevel(years?: number): "iniciante" | "intermediario" | "avancado" {
  if (years == null) return "intermediario";
  if (years < 1) return "iniciante";
  if (years <= 3) return "intermediario";
  return "avancado";
}

export const volumeManagementSkill: Skill = {
  id: "volume_management",
  name: "Volume Semanal e Landmarks",
  estimatedTokens: 500,
  priority: 9,
  isRelevant: () => true,

  render: (stack) => {
    const level = getLevel(stack.trainingYears);

    const volumeTable: Record<string, { mev: string; mav: string; mrv: string }> = {
      iniciante:     { mev: "~6",  mav: "~10", mrv: "~14" },
      intermediario: { mev: "~8",  mav: "~16", mrv: "~20" },
      avancado:      { mev: "~10", mav: "~20", mrv: "~25+" },
    };

    const v = volumeTable[level];

    return `[SKILL: VOLUME SEMANAL E LANDMARKS DE VOLUME]

Framework de Mike Israetel (Renaissance Periodization) — os 4 landmarks de volume por grupo muscular:

| Landmark | Definicao | ${level.toUpperCase()} |
|----------|-----------|------------|
| MV (Maintenance Volume) | Volume minimo para NAO perder ganhos | ~4-6 series/semana |
| MEV (Minimum Effective Volume) | Minimo para gerar adaptacao | ${v.mev} series/semana |
| MAV (Maximum Adaptive Volume) | Ponto otimo de custo-beneficio | ${v.mav} series/semana |
| MRV (Maximum Recoverable Volume) | Limite maximo antes de overreaching | ${v.mrv} series/semana |

RANGE OTIMO DE VOLUME (consenso Israetel + Helms + Nippard): 10-20 series efetivas por grupo muscular por semana para a maioria dos atletas.

FREQUENCIA SEMANAL POR GRUPO MUSCULAR:
- Minimo: 2x/semana por grupo muscular (Eric Helms — Muscle & Strength Pyramid).
- Ideal: 2-3x/semana para intermediarios.
- Avancado: 3-4x/semana permite distribuir volume sem ultrapassar cap por sessao (Greg Nuckols — cada dia adicional aumenta crescimento semanal em ~0.11%).

PROGRESSAO DE VOLUME INTRA-MESOCICLO:
- Semana 1: Comecar no MEV ou ligeiramente acima.
- Semana 2: Adicionar +1-2 series por grupo em relacao a semana anterior.
- Semana 3-4: Atingir MAV. Monitorar fadiga, qualidade de sono, performance.
- Semana 5 (deload): Voltar ao MV ou abaixo. Recuperacao completa.
- NUNCA ultrapassar MRV — sinais: queda de performance >10%, dor articular, sono comprometido.

TABELA DE VOLUME — inclua no protocolo:
| Grupo Muscular | Series/Semana | Frequencia | Nota |
|----------------|---------------|------------|------|
| Quadriceps | X | Yx/sem | ... |
| Posteriores | X | Yx/sem | ... |
| Peito | X | Yx/sem | ... |
| Costas (largura) | X | Yx/sem | ... |
| Costas (espessura) | X | Yx/sem | ... |
| Deltoides | X | Yx/sem | ... |
| Biceps | X | Yx/sem | ... |
| Triceps | X | Yx/sem | ... |

Preencha com valores concretos baseados no nivel ${level} do atleta.`;
  },
};
