import type { Skill } from "../types";

const COMBAT_MODALITIES = [
  "martial_arts_striking", "martial_arts_grappling", "martial_arts_mma",
  "Striking", "Grappling", "MMA",
  "Muay Thai", "BJJ", "Boxing", "Boxe", "Jiu-Jitsu", "Judo", "Karate", "Taekwondo",
];

/** Check if a modality string is combat-related */
export function isCombatModality(mod?: string): boolean {
  if (!mod) return false;
  const lower = mod.toLowerCase();
  return COMBAT_MODALITIES.some(c => lower.includes(c.toLowerCase()));
}

export const combatSportsSkill: Skill = {
  id: "combat_sports",
  name: "Treinamento para Esportes de Combate",
  estimatedTokens: 650,
  priority: 8,

  isRelevant: (stack) =>
    isCombatModality(stack.primary) || isCombatModality(stack.secondary),

  render: (stack) => {
    const isStriking = isCombatModality(stack.primary)
      && /strik|muay|box|karate|taekwondo/i.test(stack.primary);
    const isGrappling = isCombatModality(stack.primary)
      && /grappl|bjj|jiu|judo|wrest/i.test(stack.primary);

    return `[SKILL: TREINAMENTO PARA ESPORTES DE COMBATE]

Baseado nas metodologias de Phil Daru (UFC S&C), Chad Wesley Smith (JTS), Joe DeFranco, Alexander Usyk e Firas Zahabi.

FILOSOFIA CENTRAL: "Quando dois lutadores tem nivel tecnico igual, o mais forte e mais bem condicionado vence." (Phil Daru)
O treino de S&C para lutadores NAO e bodybuilding. O objetivo e TRANSFERENCIA para o esporte — forca que se traduz em potencia de golpe, velocidade de takedown, resistencia no clinch.

6 PILARES DE MOVIMENTO (Phil Daru — UFC Performance):
1. SQUAT: back squat, front squat, goblet squat — base de potencia para MMII
2. HIP HINGE: deadlift, trap bar DL, kettlebell swing — potencia de quadril (essencial para golpes e takedowns)
3. PUSH: bench press, push-up, landmine press — empurrar no clinch, socos
4. PULL: pull-up, row, rope climb — puxar no grappling, controle de distancia
5. CARRY: farmer walk, overhead carry, sled drag — grip strength, estabilidade do core sob carga
6. CORE ROTACIONAL: pallof press, cable woodchop, med ball throw — transferencia de potencia rotacional para golpes

METODO CONJUGADO CONDENSADO (Phil Daru):
- Dia 1: MAX EFFORT — exercicio composto pesado, trabalhar ate 1-3RM (ex: back squat, deadlift)
- Dia 2: DYNAMIC EFFORT — mesmo padrao com 40-60% + bandas/correntes, 6-8x2-3 reps com velocidade MAXIMA
- Dia 3: REPETITION — volume moderado (3-4x8-12), foco em hipertrofia funcional e prevencao de lesoes
- Total: 3 sessoes S&C/semana, deixando espaco para 3-5 sessoes de modalidade

PERIODIZACAO FIGHT CAMP (5 fases):

Fase 1 — PREPARACAO GERAL (8-12 semanas antes da luta):
- Construir base de forca e capacidade aerobica.
- S&C 3x/semana, volume alto (4-6 sets de 6-8 reps, RPE 7).
- Cardio: LISS Zona 2, 3-4x/semana, 40-60 min.
- Modalidade: 3-4x/semana, foco tecnico.

Fase 2 — PREPARACAO ESPECIFICA (6-8 semanas):
- Transicao para potencia e velocidade.
- S&C 3x/semana: conjugado condensado (max effort + dynamic effort + repetition).
- Sparring: introduzir gradualmente, 30-50% do volume semanal.
- Cardio: adicionar 1-2 sessoes alaticas (sprints 10-15s, recovery total).

Fase 3 — FIGHT CAMP (4-6 semanas):
- Pico de sparring (60-70% do volume de treino).
- S&C: reduzir para 2x/semana, manter intensidade, reduzir volume 20-30%.
- Condicionamento: fight-specific (rounds simulados, circuits com tempos de round).
- Semana 1-2 do camp: CARGA — volume alto intencional (shock do sistema).
- Semana 3-4: manter intensidade, sparring de qualidade.

Fase 4 — TAPER (1-2 semanas antes):
- Semana -2: reduzir volume 40-50%, manter intensidade. S&C 1-2x leve.
- Semana -1: volume -50-60%, ativacao neural apenas (2-3 sets leves de compostos).
- 3-4 dias antes: ativacao leve ou descanso total.
- Dia anterior: descanso, visualizacao, hidratacao.

Fase 5 — TRANSICAO (1-2 semanas pos-luta):
- Recuperacao ativa: mobilidade, natacao, caminhada.
- Avaliar lesoes, qualidade de movimento.
- Zero treino de alta intensidade.

REGRAS DE TREINO CONCORRENTE:
- FORCA/POTENCIA sempre PRIMEIRO na sessao, NUNCA apos condicionamento ou modalidade intensa.
- Separacao minima de 6 horas entre sessao de S&C e modalidade. Ideal: manhã S&C, tarde modalidade.
- Maximo 3 sessoes de S&C dedicadas por semana (Phil Daru, Chad Wesley Smith).
- Principio de Dynamic Correspondence (Joe DeFranco): cada exercicio deve ter TRANSFERENCIA direta para padroes do esporte.

${isStriking ? `ESPECIFICO STRIKING:
- Enfase em potencia rotacional de quadril (med ball rotational throws, cable woodchops).
- Pliometria: box jumps, broad jumps, depth jumps — potencia de pernas para movimentacao e chutes.
- Kettlebell circuits a la Usyk: swings, snatches, clean & press — forca-resistencia funcional.
- Treino respiratorio: intervalos subaquaticos ou exercicios de controle de respiracao (Usyk method).` : ""}
${isGrappling ? `ESPECIFICO GRAPPLING:
- Enfase em grip strength: farmer walks pesados, dead hangs, towel pull-ups, fat grip training.
- Isometria: iso-holds em posicoes de luta (ex: isometric row hold, wall sit com angulo de luta).
- Neck strengthening: OBRIGATORIO — 3-4x/semana, bridges, resistencia manual, harness.
- Endurance muscular de MMSS: reps altas em pulling (3x15-20 rows, face pulls).` : ""}
INSPIRACAO ALEXANDER USYK:
- 2-3 sessoes/dia estruturadas: S&C matinal + tecnica tarde + condicionamento noite.
- Kettlebell circuits explosivos para forca-resistencia (swings, presses, snatches em circuito).
- 250+ rounds de sparring por camp — volume e rei para lutadores de elite.
- Treino subaquatico para controle respiratorio e resiliencia mental.
- Schulte table training para reflexo e percepcao — treino cognitivo integrado ao fisico.`;
  },
};
