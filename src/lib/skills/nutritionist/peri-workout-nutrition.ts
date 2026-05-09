import type { Skill } from "../types";

export const periWorkoutNutritionSkill: Skill = {
  id: "peri_workout_nutrition",
  name: "Nutricao Peri-Treino",
  estimatedTokens: 450,
  priority: 9,
  isRelevant: () => true,

  render: () => {
    return `[SKILL: NUTRICAO PERI-TREINO]

A "JANELA ANABOLICA" — evidencia atualizada (meta-analise 2025):
- A janela e MAIS AMPLA que o mito de 30-60 min — estende-se por 4-6 horas
- Proteina total diaria e o driver PRIMARIO de hipertrofia, nao o timing exato
- Se ha refeicao proteica pre-treino (1-2h antes), o pos-treino imediato tem beneficio marginal
- REGRA PRATICA: consumir 0.4-0.5 g/kg proteina dentro de 1-2h PRE e POST treino

PRE-TREINO (2-3 horas antes):
- 0.4-0.5 g/kg proteina + 1-4 g/kg CHO (ajustar conforme tolerancia GI)
- Ex: atleta 80kg → 32-40g proteina + 80-120g CHO (arroz, batata, aveia)
- Gordura: limitar a <15g (retarda esvaziamento gastrico)

INTRA-TREINO (durante a sessao):
- Sessoes <60 min: agua e suficiente (ou mouth rinse com CHO)
- Sessoes 60-90 min: 30-60g CHO/hora (maltodextrina, dextrose, bebida esportiva)
- Sessoes >90 min ou duplas: ate 90g CHO/hora usando transporte multiplo (glicose:frutose 2:1)
- EAAs intra-treino: 6-15g (com 3-5g leucina); 10-12g e otimo para maioria dos atletas
- EAAs + CHO combinados: insulina do carboidrato potencializa captacao de aminoacidos pelo musculo

POS-TREINO (dentro de 1-2 horas):
- 0.4-0.5 g/kg proteina (whey, frango, ovos) + CHO para repor glicogenio
- Ratio CHO:proteina pos-treino: 3:1 a 4:1 para reposicao maxima de glicogenio
- Se a proxima sessao e em <8 horas: priorizar CHO agressivo (1.0-1.2 g/kg/hr por 4h)
- Se a proxima sessao e em >24 horas: CHO moderado, proteina e suficiente

"GUT TRAINING" — treinar o intestino (JISSN 2025):
- Aumentar CHO intra-treino GRADUALMENTE: comece com 20g/hr, suba 10g/semana
- Alvo: tolerar 60-90g/hr em 4-6 semanas sem desconforto GI
- Evitar fibra alta, gordura e FODMAP nas 2-3h pre-treino/competicao`;
  },
};
