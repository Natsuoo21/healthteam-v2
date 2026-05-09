import type { Skill } from "../types";

export const proteinStrategySkill: Skill = {
  id: "protein_strategy",
  name: "Estrategia de Proteina e Distribuicao",
  estimatedTokens: 500,
  priority: 10,
  isRelevant: () => true,

  render: (stack) => {
    const isPlantBased = /veg|plant|vegano|vegetarian/i.test(stack.conditions || "");
    const isOlder = (stack.age ?? 0) >= 50;

    return `[SKILL: ESTRATEGIA DE PROTEINA E DISTRIBUICAO]

DOSE POR REFEICAO (ISSN 2017; meta-analise 2024):
- Dose otima por refeicao: 0.40-0.55 g/kg de peso corporal
- Distribuir em 3-6 refeicoes/dia — distribuicao UNIFORME supera distribuicao desigual
- Exemplo: atleta de 80kg → 32-44g proteina por refeicao, 4 refeicoes = 128-176g/dia

LIMIAR DE LEUCINA — gatilho para sintese proteica muscular (MPS):
- Adultos jovens: 2.5g leucina/refeicao (equivale a ~25-30g proteina animal)
${isOlder ? `- Adultos >50 anos: 3.0g leucina/refeicao (~30-40g proteina por refeicao) — resistencia anabolica requer dose maior` : `- Adultos >50 anos: 3.0g leucina/refeicao (resistencia anabolica)`}
- Cruzar o limiar de leucina em CADA refeicao e mais importante que proteina total sozinha

FONTES PROTEICAS POR CONTEUDO DE LEUCINA (por 100g):
- Whey protein: ~11g leucina/100g proteina (melhor fonte isolada)
- Frango/peru: ~7.5g leucina/100g proteina
- Carne bovina: ~8g leucina/100g proteina
- Ovos: ~8.5g leucina/100g proteina
- Soja: ~7.5g leucina/100g proteina (melhor fonte vegetal)
- Leguminosas: ~6-7g leucina/100g proteina

${isPlantBased ? `AJUSTES PARA DIETA PLANT-BASED (Academy of Nutrition and Dietetics 2025):
- Aumentar proteina total em 10-20%: alvo 1.8-2.4 g/kg/dia (vs 1.6-2.0 omnivoro)
- LISINA e o aminoacido limitante — priorizar leguminosas, soja, lentilha, quinoa
- Combinar fontes complementares no mesmo DIA (arroz + feijao, ervilha + cereal)
- Considerar suplementar leucina isolada: 2-3g por refeicao
- Suplementar B12 (250 mcg/dia), omega-3 algal (250-500mg EPA+DHA/dia), zinco (+50% vs omnivoro)
- Ferro: fonte nao-heme tem biodisponibilidade 5-12% vs 15-35% heme → combinar com vitamina C` : ""}

PROTEINA EM DEFICIT CALORICO:
- Limiar minimo para preservar massa magra: >1.3 g/kg/dia (meta-regressao 2024)
- Otimo para cutting: 2.3-3.1 g/kg de massa MAGRA/dia (Helms/Aragon 2014)
- Contest prep extremo: 2.4 g/kg/dia em deficit de 40% → ganho de 1.2kg massa magra (Longland et al.)`;
  },
};
