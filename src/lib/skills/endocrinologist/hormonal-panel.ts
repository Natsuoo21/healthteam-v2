import type { Skill } from "../types";

export const hormonalPanelSkill: Skill = {
  id: "hormonal_panel",
  name: "Painel Hormonal e Ranges Funcionais",
  estimatedTokens: 600,
  priority: 10,
  isRelevant: () => true,

  render: (stack) => {
    const isMale = stack.gender !== "female";

    return `[SKILL: PAINEL HORMONAL E RANGES FUNCIONAIS]

RANGES LABORATORIAIS vs FUNCIONAIS (Endocrine Society 2018; AUA 2018):

| Hormonio | Range Lab | Range Funcional (Atletas) |
|----------|-----------|--------------------------|
${isMale ? `| Testosterona Total (H) | 264-916 ng/dL | 500-900 ng/dL |
| Testosterona Livre (H) | 5-21 ng/dL | 10-20 ng/dL |
| SHBG (H) | 10-57 nmol/L | 20-40 nmol/L |
| Estradiol (H) | 10-40 pg/mL | 20-30 pg/mL (ensaio sensivel) |` : `| Estradiol (M) | 15-350 pg/mL | Fase-dependente |
| Progesterona (M) | 0.1-25 ng/mL | Fase-dependente |
| SHBG (M) | 18-144 nmol/L | 40-80 nmol/L |`}
| TSH | 0.45-4.5 mIU/L | 0.5-2.0 mIU/L |
| T3 Livre | 2.0-4.4 pg/mL | 3.0-4.0 pg/mL |
| T4 Livre | 0.8-1.8 ng/dL | 1.0-1.5 ng/dL |
| Cortisol matinal | 6-23 mcg/dL | 10-18 mcg/dL |
| DHEA-S | 120-520 mcg/dL | 250-450 mcg/dL |
| IGF-1 | Idade-dependente | Metade superior do range ajustado por idade |
| Insulina jejum | 2-25 mU/L | 2-6 mU/L (funcional) |

OTIMIZACAO NATURAL DE TESTOSTERONA (Lazarev et al., Sports Health 2026):

| Estrategia | Protocolo Especifico | Efeito em T |
|------------|---------------------|-------------|
| Sono | 7-9h/noite; 1 sem de 5h = queda de 10-15% T | Previne declinio |
| Treino de forca | Compostos (squat, deadlift), 3-5 series, 6-12 reps | Aumento agudo 15-30% |
| Composicao corporal | Manter BF 12-20% (H); evitar <8% | Previne supressao |
| Disp. Energetica | EA >45 kcal/kg FFM/dia | Previne supressao HPA |
| Exposicao solar | >60 min/dia ao ar livre | Preditor positivo |

INDICACOES PARA TRT (Endocrine Society 2018 / AUA 2018):
- Limiar diagnostico: T total <264 ng/dL (ES) ou <300 ng/dL (AUA)
- Requisito: DUAS coletas matinais (7-10h AM), jejum, confirmando T baixa + SINTOMAS
- Confirmar: SHBG, T livre (calculada), LH, FSH, prolactina → diferenciar hipo primario vs secundario
- Contraindicacoes: cancer prostata ativo, policitemia (Hct >50%), apneia obstrutiva severa nao tratada
- Se deseja fertilidade: considerar clomifeno/HCG ao inves de TRT

TIREOIDE EM ATLETAS (Sindrome do Eutireoideo Doente):
- Deficit calorico causa queda de T3 + elevacao de rT3 = "sindrome do T3 baixo"
- Mecanismo: reducao da conversao periferica de T4→T3 (nao da secrecao tireoidiana)
- INTERVIR PRIMEIRO: corrigir deficit energetico (EA >45 kcal/kg FFM/dia)
- T3 suplementar so se disfuncao persistir apos 3-6 meses de EA adequada`;
  },
};
