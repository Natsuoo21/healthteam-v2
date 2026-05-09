import type { Skill } from "../types";

export const sleepRecoverySkill: Skill = {
  id: "sleep_recovery",
  name: "Ciencia do Sono e Recuperacao",
  estimatedTokens: 500,
  priority: 10,
  isRelevant: () => true,

  render: () => {
    return `[SKILL: CIENCIA DO SONO E RECUPERACAO (AASM; Walker 2017/2025)]

METAS DE ARQUITETURA DO SONO:

| Parametro | Meta para Atletas | Referencia |
|-----------|-------------------|------------|
| Duracao total | 7-9h (elite: 8.5-9.25h) | AASM; Mah et al. 2011 |
| Sono profundo (N3/SWS) | 15-25% do total (~70-110 min) | Walker 2017 |
| Sono REM | 20-25% do total (~90-120 min) | Walker 2017 |
| Eficiencia do sono | >85% | AASM |
| Latencia de inicio | <20 min | AASM |

IMPACTO HORMONAL: 1 semana de 5h de sono/noite = reducao de 10-15% na testosterona (Leproult & Van Cauter, JAMA 2011).

HIGIENE DO SONO (prioridade sobre suplementacao — Walker 2025):
- Horario CONSISTENTE de dormir e acordar (mesmo fins de semana)
- Temperatura do quarto: 18-19°C (65-67°F)
- Escuridao total (blackout curtains, sem telas 1h antes)
- Cafeina: corte 8-10h antes de dormir

PROTOCOLOS DE SUPLEMENTACAO PARA SONO:

| Suplemento | Dose | Timing | Evidencia |
|------------|------|--------|-----------|
| Magnesio L-treonato | 144mg Mg elemental (~2g MgT) | 30-60 min antes de dormir | B (RCT 2024: melhora significativa sono + alerta diurno) |
| Magnesio glicinato | 200-400mg Mg elemental | 30-60 min antes de dormir | B (boa absorcao, menos efeitos GI) |
| Melatonina | 0.3-0.5mg (dose FISIOLOGICA) | 30-60 min antes de dormir | A (doses altas >3mg podem ser contraprodutivas) |
| Tart cherry juice | 240 mL 2x/dia | Manha e noite | B (RCT: +34 min sono total) |
| L-teanina | 200-400mg | Antes de dormir | B (relaxamento via GABA) |
| Apigenina | 50mg | Antes de dormir | C (sem RCT humano nesta dose; dado mecanistico) |

WEARABLES PARA MONITORAMENTO DO SONO (validacao 2025):

| Dispositivo | Precisao HRV (CCC vs ECG) | Estadiamento do Sono | Melhor Para |
|-------------|---------------------------|----------------------|-------------|
| Oura Ring Gen 4 | 0.99 | Mais forte em todos os estagios | HRV + sono |
| WHOOP 4.0 | 0.94 | Proximo do Oura para REM/leve | Strain em tempo real |
| Polar H10 | Gold standard (ECG-grade) | N/A | Gravacao HRV |
| Garmin | Menor precisao | 29% especificidade wake (ruim) | Tracking de atividade |
| Apple Watch | Moderada | 53% precisao estadiamento | Bem-estar geral |

METRICAS-ALVO: >20% sono profundo, >20% REM, latencia <15 min, eficiencia >85%.
Usar PSQI (Pittsburgh Sleep Quality Index) e ISI (Insomnia Severity Index) para baseline.`;
  },
};
