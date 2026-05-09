import type { Skill } from "../types";

export const macroPeriodizationSkill: Skill = {
  id: "macro_periodization",
  name: "Periodizacao de Macronutrientes e TDEE",
  estimatedTokens: 650,
  priority: 10,
  isRelevant: () => true,

  render: (stack) => {
    const isCutting = /cut|defic|seca|emagrec|perd/i.test(stack.goal);
    const isBulking = /bulk|massa|ganho|hiper|hyper/i.test(stack.goal);
    const isRecomp = /recomp/i.test(stack.goal);

    return `[SKILL: PERIODIZACAO DE MACRONUTRIENTES E CALCULO DE TDEE]

CALCULO OBRIGATORIO DE TDEE — Equacao de Mifflin-St Jeor:
- Homens: (10 x peso_kg) + (6.25 x altura_cm) - (5 x idade) + 5
- Mulheres: (10 x peso_kg) + (6.25 x altura_cm) - (5 x idade) - 161
- Multiplicar por fator de atividade: Sedentario 1.2 | Leve 1.375 | Moderado 1.55 | Ativo 1.725 | Muito Ativo 1.9
- MOSTRAR A CONTA ao atleta. Nao dar numeros sem justificativa.

ALVOS CALORICOS POR OBJETIVO:
${isCutting ? `- CUTTING: Deficit de 300-500 kcal/dia (moderado). Maximo 0.5-1.0% do peso corporal/semana.
- Deficits agressivos (>500 kcal) aumentam perda de massa magra mesmo com treino de forca.
- Proteina em deficit: 2.3-3.1 g/kg de massa magra/dia (Helms et al., JISSN 2014; meta-regressao 2025).
- Gordura: 15-30% das calorias totais. Abaixo de 15% compromete hormonios.
- Carboidrato: restante das calorias apos proteina e gordura.` : ""}
${isBulking ? `- BULKING: Superavit de 250-500 kcal/dia. Taxa de ganho: 0.25-0.5% do peso/semana para treinados.
- Proteina: 1.6-2.2 g/kg/dia (ISSN 2017).
- Gordura: 20-35% das calorias.
- Carboidrato: restante (priorizar para performance e recuperacao).` : ""}
${isRecomp ? `- RECOMPOSICAO: Ver skill especifica de body recomposition.` : ""}
${!isCutting && !isBulking && !isRecomp ? `- MANUTENCAO: Calorias no TDEE. Proteina 1.6-2.2 g/kg/dia. Gordura 20-35%. CHO restante.
- CUTTING: Deficit 300-500 kcal/dia. Proteina 2.3-3.1 g/kg massa magra. Max 0.5-1% peso/semana.
- BULKING: Superavit 250-500 kcal/dia. Taxa 0.25-0.5% peso/semana.` : ""}

CARB CYCLING — Periodizar CHO conforme demanda de treino (Impey et al., Sports Medicine 2018):
- DIA DE TREINO PESADO (high carb): 5-8 g/kg/dia CHO
- DIA DE TREINO LEVE/MODERADO (moderate carb): 3-5 g/kg/dia CHO
- DIA DE DESCANSO (low carb): 2-3 g/kg/dia CHO
- Ajustar gordura inversamente ao CHO para manter calorias totais estaveis.
- Proteina FIXA todos os dias — nao reduzir em dias low carb.

FORMATO OBRIGATORIO: Apresentar plano nutricional em TABELA Markdown:
| Refeicao | Horario | Proteina (g) | CHO (g) | Gordura (g) | Kcal | Alimentos |`;
  },
};
