import type { Skill } from "../types";

export const ageManagementSkill: Skill = {
  id: "age_management",
  name: "Manejo Hormonal por Idade",
  estimatedTokens: 400,
  priority: 7,
  isRelevant: (stack) => (stack.age ?? 0) >= 35,

  render: (stack) => {
    const age = stack.age ?? 35;

    return `[SKILL: MANEJO HORMONAL RELACIONADO A IDADE]

TAXAS DE DECLINIO HORMONAL:

| Hormonio | Inicio Declinio | Taxa de Declinio | Aos 60 anos |
|----------|----------------|------------------|-------------|
| Testosterona total | 30-40 anos | ~1%/ano apos 30 (1-2% apos 40) | 20-30% abaixo do pico |
| Testosterona livre | 30 anos | ~2-3%/ano (mais rapida que total por SHBG subir) | 40-50% abaixo do pico |
| DHEA-S | Pico 20-24 | ~2.3%/ano (H), ~3.9%/ano (M) | 70% reducao aos 60 |
| GH/IGF-1 | 30 anos | ~14%/decada | Reducao significativa |
| SHBG | Sobe a partir de 40 | ~1.2%/ano aumento | SHBG mais alto = T livre menor |

${age >= 35 && age < 40 ? `FAIXA 35-40 ANOS:
- Monitoramento anual de painel hormonal completo
- Atencao a sinais precoces: SHBG alto, T livre baixa relativa, fadiga inexplicada
- Sensibilidade insulinica: avaliar HOMA-IR anualmente
- DHEA: considerar 25mg/dia se DHEA-S documentadamente baixo
- Priorizar: sono 7-9h, composicao corporal otima (BF 12-20%), estresse gerenciado` : ""}
${age >= 40 && age < 45 ? `FAIXA 40-45 ANOS:
- Monitoramento SEMESTRAL de painel completo
- DHEA: 25-50mg/dia se marcadores indicarem declinio (monitorar estradiol — DHEA pode aumentar E2)
- Pregnenolona: 10-50mg/dia (evidencia pre-clinica mais forte que clinica; dados humanos limitados)
- Avaliar sensibilidade insulinica: HOMA-IR + insulina jejum a cada 6 meses
- NOTA: TRT so em testosterona total <300 ng/dL + sintomas confirmados` : ""}
${age >= 45 ? `FAIXA 45+ ANOS:
- Avaliar indicacao de TRT se testosterona total <350 ng/dL com sintomas
- TRT mais eficaz que DHEA para: fragilidade, depressao, disfuncao sexual (mas NAO para declinio cognitivo)
- Monitorar a cada 6 MESES: HbA1c, PSA, lipidograma completo, PCR ultrassensivel
- Considerar DHEA 25-50mg/dia + pregnenolona se nao candidato a TRT
- Zinco quelato 30mg/dia: aumento de 10-17% T em homens com deficiencia marginal
- Ashwagandha KSM-66 600mg/dia: estabilizacao cortisol, efeito variavel em T (RCT 2026)
- NOTA: >40mg zinco/dia por >4 semanas → suplementar 2mg cobre` : ""}

QUANDO TESTAR (cronograma recomendado):

| Idade | Frequencia | Painel Core |
|-------|------------|-------------|
| 25-30 | Baseline 1x | T total, T livre, SHBG, TSH, insulina jejum, Vit D |
| 30-35 | A cada 2-3 anos | Acima + DHEA-S, IGF-1, hs-CRP |
| 35-40 | A cada 1-2 anos | Painel completo + PSA (se considerar TRT) |
| 40-45 | Anualmente | Painel completo + estradiol (sensivel), lipideos, HbA1c |
| 45+ | Anual ou semestral | Painel completo + considerar DEXA ossea |

SUPLEMENTACAO ADAPTOGENICA PARA ENVELHECIMENTO:
- Rhodiola rosea: 200-600mg/dia (melhora resistencia a fadiga, cognição sob estresse — Nivel B)
- Vitamina D3: 2000-5000 UI/dia; alvo >50 ng/mL serico
- Omega-3: 2-4g EPA+DHA/dia (anti-inflamatorio, cardiovascular — Nivel A)
- Creatina: 3-5g/dia (beneficios cognitivos ALEM de performance — Nivel A)`;
  },
};
