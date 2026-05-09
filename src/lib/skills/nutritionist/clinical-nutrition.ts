import type { Skill } from "../types";

function hasRelevantCondition(conditions: string): boolean {
  if (!conditions) return false;
  return /diabet|dm1|dm2|insulina|glicemi|tireoide|hipotireoid|hashimoto|crohn|colite|ibs|intestin|celiac|intoler|alerg|renal|hepat|cardiac/i.test(conditions);
}

export const clinicalNutritionSkill: Skill = {
  id: "clinical_nutrition",
  name: "Nutricao Clinica e Populacoes Especiais",
  estimatedTokens: 500,
  priority: 8,
  isRelevant: (stack) => {
    return hasRelevantCondition(stack.conditions) ||
      stack.gender === "female" ||
      /veg|plant|vegano/i.test(stack.conditions || "");
  },

  render: (stack) => {
    const isDM1 = /diabet|dm1|insulina|glicemi/i.test(stack.conditions || "");
    const isFemale = stack.gender === "female";

    return `[SKILL: NUTRICAO CLINICA E POPULACOES ESPECIAIS]

${isDM1 ? `ATLETA COM DIABETES TIPO 1 (ADA Standards of Care 2025):
- Macronutrientes: mesmos requisitos de atletas nao-diabeticos
- DIFERENCA: modular CHO e insulina baseado em glicemia e CGM

Fueling por contexto de exercicio:
| Contexto | CHO Recomendado |
|----------|-----------------|
| Intensidade baixa-moderada, 30-60min, insulina baixa | 10-15g CHO para prevenir hipo |
| Intensidade moderada-alta com hiperinsulinemia relativa | 30-60g CHO/hora |
| Glicemia pre-treino 100-150 mg/dL | 15-30g CHO pre-treino |
| Glicemia pre-treino >250 mg/dL | NAO treinar; checar cetonas |
| Glicemia pre-treino <100 mg/dL | Consumir CHO antes de iniciar |

Estrategia guiada por CGM:
- Alvo pre-treino: 126-180 mg/dL (7-10 mmol/L)
- Seta para baixo no CGM = consumir CHO ANTES de iniciar
- Seta para cima = pode prosseguir com cautela
- Pos-treino: reduzir insulina basal 20-50% por 6-12 horas
- Risco de hipoglicemia noturna: maior apos treino vespertino → lanche antes de dormir
- Monitorar glicemia ate 24h pos-treino (sensibilidade insulinica elevada persiste)` : ""}

${isFemale ? `ATLETA FEMININA — Necessidades Especificas (ISSN 2023):
- FERRO: prevalencia de deficiencia 20-40% em atletas femininas
  - Alvo ferritina: >50 ng/mL
  - Se deficiente: 100mg/dia ferro elemental + vitamina C, por 8 semanas
  - Evitar tomar com calcio, cha, cafe (reduzem absorcao)
  - Priorizar alimentos ricos em ferro durante menstruacao
- CALCIO: 1000-1300 mg/dia (critico com disfuncao menstrual ou LEA)
- ENERGIA: Disponibilidade Energetica (EA) >45 kcal/kg FFM/dia para funcao fisiologica plena
  - EA <30 kcal/kg FFM/dia = LEA problematica → supressao hormonal em 5 dias
  - Se amenorreia ou oligomenorreia: AUMENTAR calorias IMEDIATAMENTE (+300-500 kcal/dia)
- FASE LUTEAL (dias 15-28): taxa metabolica aumenta ~5-10%
  - Considerar aumento discreto de calorias
  - Maior utilizacao de gordura como substrato` : ""}

SAUDE INTESTINAL PARA ATLETAS:
- Probioticos: 30-60 bilhoes CFU/dia; cepas eficazes: L. rhamnosus, L. plantarum, B. lactis, B. longum
- Duracao minima: 4-6 semanas; melhor evidencia com >12 semanas
- Beneficios: reducao de infeccoes respiratorias, menos distress GI, funcao imune
- Prevencao de desconforto GI:
  - "Gut training": aumentar CHO intra-treino gradualmente (20g/hr ate 60-90g/hr)
  - Low FODMAP: 2-6 semanas fase estrita se sintomas persistentes, depois reintroduzir
  - Pre-competicao: evitar fibra alta, gordura alta e FODMAP 24-48h antes`;
  },
};
