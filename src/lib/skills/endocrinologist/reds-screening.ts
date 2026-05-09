import type { Skill } from "../types";

export const redsScreeningSkill: Skill = {
  id: "reds_screening",
  name: "Screening RED-S",
  estimatedTokens: 400,
  priority: 8,
  isRelevant: (stack) => {
    const isFemale = stack.gender === "female";
    const isDeficit = /cut|defic|seca|emagrec|perd|recomp/i.test(stack.goal);
    return isFemale || isDeficit;
  },

  render: (stack) => {
    const isFemale = stack.gender === "female";

    return `[SKILL: SCREENING RED-S (IOC Consensus 2023)]

RED-S = Relative Energy Deficiency in Sport. Afeta AMBOS os sexos.

LIMIARES DE DISPONIBILIDADE ENERGETICA (EA):

| Classificacao | EA (kcal/kg FFM/dia) | Implicacoes |
|---------------|----------------------|-------------|
| Otima | >45 | Funcao fisiologica plena |
| Reduzida (subclinica) | 30-45 | Comprometimento sutil possivel |
| Baixa (clinica — mulher) | <30 | Disfuncao menstrual, perda ossea, supressao metabolica |
| Baixa (clinica — homem) | <25 (provisorio) | Supressao T, perda ossea, disfuncao imune |

SISTEMA SEMAFORO IOC REDs CAT2:
- VERDE: Baixo risco, sem indicadores RED-S, participacao plena
- AMARELO: Severidade leve, indicadores secundarios, participar com monitoramento
- LARANJA: Severidade moderada, indicadores primarios presentes, participacao restrita com plano
- VERMELHO: Severidade alta, multiplos indicadores primarios → AFASTAR do esporte ate resolucao

INDICADORES PRIMARIOS (maior peso):
${isFemale ? `- Amenorreia funcional hipotalamica (FHA) ou oligomenorreia` : `- Supressao de testosterona`}
- Baixa DMO (Z-score < -1.0)
- Fraturas de estresse
- T3 baixo com EA baixa

INDICADORES SECUNDARIOS:
- Deficiencia de ferro, cortisol elevado, instabilidade de peso, doenca recorrente

BIOMARCADORES MAIS USADOS (76.9% dos 13 estudos revisados): DMO, IMC, massa corporal, massa gorda, T3

ACHADOS MAIS COMUNS EM ATLETAS OLIMPICOS:
- Dislipidemia (20.4%), hipercortisolemia (15%), deficiencia ferro (9.7%), intolerancia glicose (8.4%)

INTERVENCAO IMEDIATA SE >=2 INDICADORES PRIMARIOS:
- Aumento calorico de +300-500 kcal/dia ANTES de otimizar qualquer outra variavel
- Prioridade: restaurar EA >30 kcal/kg FFM/dia
- Se sinais persistirem >3 meses: DEXA para densidade ossea
- Coordenar com Dra. Sarah para ajuste calorico e com Coach Mike para reducao de volume`;
  },
};
