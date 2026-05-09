import type { Skill } from "../types";

export const hydrationProtocolSkill: Skill = {
  id: "hydration_protocol",
  name: "Protocolo de Hidratacao",
  estimatedTokens: 400,
  priority: 8,
  isRelevant: () => true,

  render: (stack) => {
    const baseWater = Math.round(stack.weight * 0.037 * 10) / 10;

    return `[SKILL: PROTOCOLO DE HIDRATACAO (ACSM/NATA 2025)]

HIDRATACAO BASAL:
- Base diaria: 35-40 mL/kg/dia → para ${stack.weight}kg = ${baseWater}-${Math.round(stack.weight * 0.04 * 10) / 10}L/dia (fora do treino)

PRE-TREINO:
- 5-10 mL/kg nas 2-4 horas antes do treino → ${Math.round(stack.weight * 0.005 * 1000)}-${Math.round(stack.weight * 0.01 * 1000)} mL
- Urina amarelo-claro antes de treinar = hidratacao adequada

INTRA-TREINO:
- 400-800 mL/hora (ajustar por tamanho corporal e clima)
- Atletas maiores/clima quente: lado superior do range
- Atletas menores/clima frio: lado inferior
- Bebida esportiva (6-8% CHO + sodio 300-800 mg/L) se sessao >60 min

POS-TREINO:
- Repor 150% do peso perdido durante a sessao
- Incluir sodio (~1.5g/L de fluido) para otimizar retencao
- Ex: perdeu 0.5kg → beber 750 mL nas 2-6 horas seguintes

CALCULO DE TAXA DE SUDORESE:
- Formula: Perda de Suor (L) = (Peso Pre - Peso Pos em kg) + Fluido Ingerido (L)
- Taxa de Sudorese (L/hr) = Perda de Suor / Duracao (horas)
- Range tipico: 0.3-2.5 L/hr (recreativo: 0.5-1.5 | elite no calor: >2.0)

SODIO LOADING (competicao/calor intenso):
- 30 mL/kg massa magra com 7.5g NaCl/L, 2 horas antes do exercicio
- Aumenta retencao de fluidos em ~509 mL (estudo 2025)
- Concentracao de sodio: 120-130 mmol/L (276-300 mg/100mL); nao exceder 145 mmol/L

SINAIS DE DESIDRATACAO: >2% perda de peso corporal → queda de performance; >4% → risco de saude.`;
  },
};
