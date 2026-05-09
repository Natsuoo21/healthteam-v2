import type { Skill } from "../types";

export const supplementationSkill: Skill = {
  id: "supplementation",
  name: "Suplementacao Baseada em Evidencia",
  estimatedTokens: 550,
  priority: 8,
  isRelevant: () => true,

  render: () => {
    return `[SKILL: SUPLEMENTACAO BASEADA EM EVIDENCIA (AIS/ISSN)]

CLASSIFICACAO AIS — Grupo A (evidencia forte, aprovados para uso no esporte):

| Suplemento | Dose | Timing | Beneficio | Nivel |
|------------|------|--------|-----------|-------|
| Creatina monohidratada | 3-5g/dia (ou loading: 0.3g/kg/dia x 5-7d) | Qualquer horario | Forca, potencia, massa magra | A |
| Cafeina | 3-6 mg/kg (ideal 4-6) | 30-60 min pre-treino | Endurance, forca, cognição | A |
| Beta-alanina | 4-6g/dia (dividir em doses de 0.8-1.6g) | Diario (loading cronico, 4+ semanas) | Capacidade de tamponamento, esforcos 1-4 min | A |
| Bicarbonato de sodio | 0.2-0.3 g/kg | 60-150 min pre-treino | Tamponamento extracelular, sprints repetidos | A |
| Suco de beterraba/Nitrato | 6-12 mmol NO3 (~370-740mg) | 2-3h pre-treino (agudo) ou >3 dias cronico | Endurance, reducao custo O2 | A |

GRUPO B (evidencia emergente):
- Colageno + vitamina C: 15g colageno + 50mg vit C, 30-60min pre-treino (suporte tendineo)
- Tart cherry juice: 240 mL 2x/dia (+34 min sono total, anti-inflamatorio)
- Omega-3: 2-4g EPA+DHA/dia (>6 semanas para efeito anti-inflamatorio) — Nivel B
- Curcumina: 500mg 2x/dia (recuperacao, inflamacao)

GRUPO C (sem beneficio comprovado quando proteina total e adequada):
- BCAAs isolados (redundante com proteina total adequada)
- Glutamina para performance
- Tribulus terrestris
- CLA

HMB (ISSN 2024):
- Dose: 38 mg/kg/dia (~3g/dia para adultos)
- Melhor evidencia: iniciantes, preservacao de massa magra em deficit calorico, recuperacao
- Seguro para uso cronico (>1 ano confirmado)

MICRONUTRIENTES ESSENCIAIS PARA ATLETAS:
- Vitamina D3: 2000-5000 UI/dia; alvo serico >40 ng/mL (>50 ideal); se <30 → 5000 UI x 8 sem
- Magnesio: 300-400mg/dia elemental (glicinato para sono, citrato para absorcao, malato para energia)
- Zinco: 15-30mg/dia (quelato ou citrato); >40mg/dia por >4 sem → suplementar 2mg cobre
- Ferro (se deficiente): 100mg/dia elemental + vitamina C; alvo ferritina >50 ng/mL; tomar longe de calcio/cha/cafe

REGRA: Classificar CADA suplemento recomendado com nivel de evidencia (A/B/C) e dose especifica.`;
  },
};
