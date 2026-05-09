import type { Skill } from "../types";

export const exerciseSelectionSkill: Skill = {
  id: "exercise_prescription",
  name: "Selecao de Exercicios e Padroes de Movimento",
  estimatedTokens: 500,
  priority: 10,
  isRelevant: () => true,

  render: () => `[SKILL: SELECAO DE EXERCICIOS E PADROES DE MOVIMENTO]

COBERTURA OBRIGATORIA POR SESSAO — 7 padroes de movimento (DeFranco + Phil Daru):
1. SQUAT (agachamento, front squat, goblet squat, leg press)
2. HIP HINGE (deadlift, RDL, hip thrust, swing)
3. PUSH HORIZONTAL (supino, flexao, chest press)
4. PUSH VERTICAL (desenvolvimento, overhead press, landmine press)
5. PULL HORIZONTAL (remada, seal row, cable row)
6. PULL VERTICAL (pullup, lat pulldown, chin-up)
7. CARRY / CORE (farmer walk, pallof press, plank, ab wheel)

Cada sessao deve cobrir pelo menos 3-4 padroes. A semana completa deve cobrir TODOS os 7.

HIERARQUIA DE EXERCICIOS:
1. Compostos multiarticulares pesados (squat, deadlift, bench, OHP, row) — PRIMEIRO na sessao
2. Compostos acessorios (leg press, incline press, pulldown) — SEGUNDO
3. Isolacao (curl, extensao, lateral raise) — TERCEIRO
4. Prehab/acessorios (face pull, band pull-apart, rotacao externa) — FINAL

FORMATO OBRIGATORIO — Use TABELA MARKDOWN para TODA ficha de treino:
| Exercicio | Series | Reps | Descanso | RPE/RIR |
|-----------|--------|------|----------|---------|
| Agachamento Back Squat | 4 | 6-8 | 3 min | RPE 8 (2 RIR) |
| RDL | 3 | 10-12 | 2 min | RPE 7 (3 RIR) |

ZONAS DE REPETICAO (Andy Galpin, PhD — Cal State Fullerton):
- FORCA MAXIMA: 3-5 reps @ 85%+ 1RM, descanso 3-5 min. Driver primario: intensidade.
- HIPERTROFIA: 8-15 reps @ 65-85% 1RM, descanso 60-120s. Driver primario: volume. Enfase excentrica 2-4 segundos (Nippard).
- POTENCIA: 1-5 reps @ 40-70% 1RM com intencao de velocidade MAXIMA, descanso 2-3 min.
- ENDURANCE MUSCULAR: 15-25 reps @ 40-65% 1RM, descanso 30-60s.

LIMITES POR SESSAO (Jeff Nippard):
- Musculos pequenos (biceps, triceps, deltoide lateral, panturrilha): 6-8 series efetivas por sessao.
- Musculos grandes (peito, costas, quadriceps, gluteos): 10-12 series efetivas por sessao.
- Acima deste cap, o estimulo adicional por serie cai drasticamente (junk volume).`,
};
