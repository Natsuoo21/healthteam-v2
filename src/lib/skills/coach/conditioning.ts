import type { Skill } from "../types";
import { isCombatModality } from "./combat-sports";

export const conditioningSkill: Skill = {
  id: "conditioning",
  name: "Sistemas Energeticos e Condicionamento",
  estimatedTokens: 550,
  priority: 7,

  isRelevant: (stack) => {
    return stack.goal === "conditioning"
      || stack.goal === "recomp"
      || isCombatModality(stack.primary)
      || isCombatModality(stack.secondary);
  },

  render: (stack) => {
    const isCombat = isCombatModality(stack.primary) || isCombatModality(stack.secondary);

    return `[SKILL: SISTEMAS ENERGETICOS E CONDICIONAMENTO]

Framework de Joel Jamieson (8 Weeks Out) — 3 sistemas energeticos:

1. SISTEMA AEROBICO (Fosforilacao Oxidativa):
   - Funcao: base de recuperacao entre esforcos, sustenta toda a sessao de treino.
   - Treino: LISS (Low Intensity Steady State) — corrida, bicicleta, natacao, remo.
   - Intensidade: Zona 2, 60-70% da FC maxima (conversacional).
   - Duracao: 30-60 minutos.
   - Frequencia: 2-4x/semana.
   - Este e o sistema MAIS IMPORTANTE e mais negligenciado. Base aerobica forte = recuperacao entre series, entre sessoes, e entre rounds.

2. SISTEMA ALATICO (ATP-PC / Fosfocreatina):
   - Funcao: esforcos explosivos de 0-10 segundos (golpes, takedowns, sprints).
   - Treino: sprints curtos, saltos pliometricos, arremessos de medicine ball, levantamentos olimpicos.
   - Intensidade: MAXIMA — 100% de esforco.
   - Duracao do esforco: 5-15 segundos.
   - Descanso: 2-3 minutos de recuperacao COMPLETA (ratio 1:10 a 1:12).
   - Frequencia: 2x/semana.
   - REGRA: Baixo volume, alta qualidade. 6-10 repeticoes por sessao. Nao confundir com HIIT.

3. SISTEMA LATICO (Glicolitico Anaerobico):
   - Funcao: esforcos sustentados de 30 segundos a 3 minutos (exchanges em luta, sequencias intensas).
   - Treino: HIIT — intervalos de 30-90 segundos a 90-95% FC max.
   - Ratios trabalho:descanso: 1:1, 1:1.5, ou 1:2 dependendo da fase.
   - Frequencia: MAXIMO 1-2x/semana (gera fadiga significativa).
   - Exemplos: 6x30s sprint / 90s recuperacao, ou 4x2min assault bike / 2min descanso.

PRESCRICAO POR OBJETIVO:
${stack.goal === "hypertrophy" ? `- HIPERTROFIA: LISS 3-4x/semana, 30-40 min, Zona 2. Impacto minimo na hipertrofia se mantido em zona 2 (principio da interferencia — Hickson 1980, posicionamento ACSM). Posicionar em dias separados de treino pesado de MMII quando possivel.` : ""}${stack.goal === "recomp" ? `- RECOMPOSICAO: LISS 3-4x Zona 2 (30-40 min) + 1 sessao threshold Zona 4 (20-25 min com intervalos). O LISS maximiza oxidacao de gordura sem comprometer forca. A sessao threshold aumenta EPOC.` : ""}${stack.goal === "conditioning" ? `- CONDICIONAMENTO: LISS Zona 2 (3x, 40-60 min) como base + 1-2 sessoes threshold Zona 4 + 1 sessao HIIT. Construir base aerobica nas primeiras 4 semanas antes de intensificar HIIT.` : ""}${isCombat ? `- COMBATE: Ver skill de Esportes de Combate para protocolo detalhado de condicionamento fight-specific.` : ""}

REGRA DA CONSISTENCIA (Firas Zahabi — Tristar Gym):
"6 dias a 70% de intensidade produzem MAIS volume total que 3 dias a 100%."
- Nao redline o corpo exceto durante fight camp ou fases de pico.
- Consistencia > Intensidade para desenvolvimento de base aerobica.

INTERFERENCIA CONCORRENTE:
- Realizar treino de FORCA/POTENCIA PRIMEIRO na sessao, DEPOIS condicionamento (nunca o inverso).
- Separacao ideal entre sessoes de forca e cardio: 6-24 horas.
- Maximo 3x/semana de condicionamento dedicado para nao comprometer ganhos de forca/hipertrofia.
- Modalidades com menor interferencia: bicicleta, remo, natacao (menor demanda neuromuscular que corrida).`;
  },
};
