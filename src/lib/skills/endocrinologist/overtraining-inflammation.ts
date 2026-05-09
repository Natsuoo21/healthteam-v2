import type { Skill } from "../types";

export const overtrainingInflammationSkill: Skill = {
  id: "overtraining_inflammation",
  name: "Overtraining e Inflamacao",
  estimatedTokens: 500,
  priority: 9,
  isRelevant: () => true,

  render: () => {
    return `[SKILL: SINDROME DE OVERTRAINING E MARCADORES INFLAMATORIOS]

OVERTRAINING (OTS) — DIAGNOSTICO POR EXCLUSAO (Estudo EROS; ECSS/ACSM 2013):
- Nenhum marcador unico e diagnostico. Abordagem multi-marcador obrigatoria.
- Excluir PRIMEIRO: restricao calorica, deficiencia ferro/magnesio, infeccoes, disturbios sono, estresse psicologico

MARCADORES DE SCREENING:

| Marcador | Alteracao Esperada no OTS | Limiar Clinico |
|----------|--------------------------|----------------|
| Ratio T/C | Queda >30% do baseline | Sem cutoff universal; monitorar individualmente |
| Cortisol salivar (AM) | Resposta de despertar atenuada | <323 ng/dL (vs ~500 saudavel) |
| CK (creatina quinase) | Cronicamente elevada | >500 U/L persistentemente |
| hs-CRP | Cronicamente elevada | >3.0 mg/L = preocupacao; otimo <0.5 mg/L |
| Ferritina | Baixa | <30 ng/mL = depletado; <50 = subotimo |
| T livre | Suprimida | Abaixo do baseline individual >20% |
| FC repouso | Elevada ou variabilidade reduzida | >5 bpm acima do baseline individual |

PROGRESSAO DO EIXO HPA NO OVERTRAINING:
1. Adaptacao positiva: ACTH e cortisol respondem normalmente ao estresse de treino
2. Overreaching nao-funcional: resposta ACTH aumentada mas cortisol ATENUADO
3. OTS: reducao de AMBOS ACTH e cortisol (padrao de exaustao adrenal)

HRV (VARIABILIDADE DA FREQUENCIA CARDIACA):
- RMSSD e o gold standard para avaliacao parassimapatica
- Nao existe valor "normal" universal — BASELINE INDIVIDUAL em 2-4 semanas e essencial
- Medir: imediatamente ao acordar, apos urinar, antes de comida/estimulantes, supino, 1-5 min
- Usar MEDIA MOVEL de 7 dias (nao valores isolados)
- CV >10% na semana = estresse de treino excessivo provavel
- Combinar: vmHRV + FC repouso + questionarios de bem-estar = superior a HRV sozinho

INFLAMACAO — NATUREZA DUAL (adaptacao vs overtraining):

| Marcador | Pos-Treino Agudo (BOM) | Elevacao Cronica (RUIM) | Nivel Otimo Repouso |
|----------|------------------------|------------------------|---------------------|
| IL-6 | Sobe imediatamente, retorna 24-48h | Persistentemente elevada | Nao-detectavel |
| hs-CRP | Pico 24-72h pos-treino | >3.0 mg/L entre sessoes | <0.5 mg/L |
| TNF-alpha | Aumento modesto agudo | Elevada em repouso no OTS | Baixo |

PROTOCOLO ANTI-INFLAMATORIO (meta-meta-analise 2025):
- Treino regular: CRP SMD -0.380; IL-6 -0.468; TNF-alpha -0.430
- Omega-3 >2g EPA+DHA/dia (>6 semanas): reduz IL-6 e TNF-alpha — Nivel A
- Sono >7 horas: previne elevacao inflamatoria cronica
- Composicao corporal: reduzir gordura visceral reduz IL-6 e TNF-alpha basais`;
  },
};
