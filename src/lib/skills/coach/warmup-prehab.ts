import type { Skill } from "../types";
import { isCombatModality } from "./combat-sports";

export const warmupPrehabSkill: Skill = {
  id: "warmup_prehab",
  name: "Aquecimento e Prevencao de Lesoes",
  estimatedTokens: 350,
  priority: 6,
  isRelevant: () => true,

  render: (stack) => {
    const isCombat = isCombatModality(stack.primary) || isCombatModality(stack.secondary);

    return `[SKILL: AQUECIMENTO E PREVENCAO DE LESOES]

PROTOCOLO DE AQUECIMENTO PADRAO (3 etapas, 10-15 min total):

1. CARDIO GERAL (5-10 min):
   - Intensidade: 60-65% FC maxima (leve, conversacional).
   - Modalidade: bicicleta ergometrica, remo, pular corda, caminhada inclinada.
   - Objetivo: elevar temperatura central, aumentar fluxo sanguineo.

2. MOBILIDADE ARTICULAR ESPECIFICA (3-5 min):
   - Dia de PUSH: circulos de ombro, dislocates com bastao, rotacao toracica, abertura peitoral.
   - Dia de PULL: rotacao toracica, Cat-Cow, mobilidade escapular, flexao de quadril.
   - Dia de LEGS: 90/90 hip switches, ankle rocks, goblet squat hold, walking lunges.
   - Dia FULL BODY: combinar 2-3 exercicios de cada grupo.

3. ATIVACAO NEUROMUSCULAR (2-3 min):
   - 1-2 series do exercicio principal a 40-60% da carga de trabalho.
   - Foco em padrão motor, velocidade concentrica, controle excentrico.
   - Ex: se o exercicio principal e Squat a 100kg, fazer 1x8 a 40kg e 1x5 a 60kg.

TRABALHO DE PREHAB — incluir no FINAL da sessao ou como warm-up ativo:
- Face pulls: 3x15-20 (saude do manguito rotador — obrigatorio para quem faz supino/desenvolvimento).
- Band pull-aparts: 3x15-20 (equilibrio push/pull, postura).
- Rotacao externa com banda: 2x15 por lado (prevencao de lesao de ombro).
- Dead bugs ou Pallof press: 2x10-12 (estabilidade core anti-rotacional).
${isCombat ? `
PREHAB ESPECIFICO PARA LUTADORES:
- Fortalecimento cervical: 3-4x/semana, bridges frontais e laterais, resistencia manual isometrica (3x10s cada direcao). OBRIGATORIO para quem leva impacto na cabeca.
- Grip/antebraco: farmer walks, dead hangs, wrist curls (prevencao de lesoes de mao/punho).
- Tornozelo: mobilidade em dorsiflexao (ankle rocks, wall slides) — essencial para estabilidade em posicoes de luta.` : ""}
SE O ATLETA REPORTAR DOR:
- Dor aguda/articular: PARAR o exercicio, substituir por alternativa que nao reproduza a dor.
- Nao confundir DOMS (dor muscular tardia, 24-72h apos treino) com lesao.
- Se dor persistir >1 semana: encaminhar ao Dr. Evans para avaliacao clinica.`;
  },
};
