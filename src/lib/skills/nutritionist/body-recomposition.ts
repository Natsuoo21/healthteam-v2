import type { Skill } from "../types";

export const bodyRecompositionSkill: Skill = {
  id: "body_recomposition",
  name: "Protocolo de Recomposicao Corporal",
  estimatedTokens: 450,
  priority: 7,
  isRelevant: (stack) => /recomp/i.test(stack.goal),

  render: () => {
    return `[SKILL: PROTOCOLO DE RECOMPOSICAO CORPORAL]

RECOMPOSICAO E POSSIVEL — nao e limitada a "newbie gains" (meta-analises 2024-2025):
- Melhores candidatos: iniciantes, destreinados (memoria muscular), BF% mais alto, novos em musculacao

PROTOCOLO ESPECIFICO:

| Variavel | Recomendacao | Evidencia |
|----------|-------------|-----------|
| Deficit calorico | 200-500 kcal/dia (MODERADO) | Meta-analise 2025 |
| Proteina minima | >1.3 g/kg/dia para evitar perda de massa magra | A |
| Proteina otima | 2.2-2.5 g/kg/dia | B |
| Treino | Musculacao progressiva 3-5x/semana | B |
| Taxa de perda de peso | Max 0.5-1.0% peso corporal/semana | B |
| Alternativa | 2.5 g/kg/dia proteina em calorias de manutencao tambem produz recomp | B |

INSIGHT-CHAVE: Deficits maiores = maior perda de massa magra MESMO com treino de forca.
A magnitude do deficit e o mediador principal da perda de FFM.

ABORDAGEM PRATICA:
1. Calcular TDEE normalmente
2. Deficit LEVE: 200-300 kcal (nao mais, para proteger massa magra)
3. Proteina ALTA: 2.2-2.5 g/kg/dia, distribuida em 4 refeicoes
4. Carboidrato periodizado: high carb em dias de treino pesado, low carb em descanso
5. Treino de musculacao com sobrecarga progressiva e OBRIGATORIO — sem ele nao ha recomp
6. Sono >7 horas e recuperacao sao criticos (cortisol alto bloqueia recomposicao)
7. Monitorar BF% e circunferencias a cada 2-4 semanas (o peso na balanca pode nao mudar)
8. Recomp e mais LENTA que cut+bulk sequenciais — expectativa realista: 1-3 meses para resultados visiveis

QUANDO RECOMP NAO E IDEAL:
- BF% muito baixo (<12% homens, <18% mulheres): melhor fazer bulk limpo
- BF% muito alto (>25% homens, >35% mulheres): melhor cortar primeiro
- Atleta avancado (>3 anos treino): recomp e extremamente lenta — cut/bulk faseado e mais eficiente`;
  },
};
