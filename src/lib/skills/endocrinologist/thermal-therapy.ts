import type { Skill } from "../types";

export const thermalTherapySkill: Skill = {
  id: "thermal_therapy",
  name: "Terapia Termica (Frio e Calor)",
  estimatedTokens: 450,
  priority: 7,
  isRelevant: () => true,

  render: () => {
    return `[SKILL: TERAPIA TERMICA — CRIOTERAPIA E SAUNA]

EXPOSICAO AO FRIO — Protocolos e Evidencia:

Efeito na hipertrofia (Pinero et al., meta-analise 2024, EJSS):
- CWI imediatamente apos treino de forca ATENUA hipertrofia (cSMD = -0.22)
- Mecanismo: reduz sintese proteica miofibrilar em ~20% nas 5h pos-treino
- Vias atenuadas: sinalizacao mTOR, p38-MNK1-eIF4E, proliferacao de celulas satelite

Protocolos recomendados:

| Protocolo | Parametros | Proposito |
|-----------|-----------|-----------|
| Soberg | 11 min/semana CWI, 2-3 sessoes de 1-3 min a 10-15°C | Saude metabolica, ativacao gordura marrom |
| Huberman | Mesmo volume semanal, pode consolidar | Dopamina (2-3x sustentada), norepinefrina (+200-300%) |
| Timing pos-treino | Esperar >6-8 HORAS apos musculacao | Evitar atenuacao de hipertrofia |
| Pos-endurance | Dentro de 4h de treino aerobico/tecnico | Recuperacao para competicao |

REGRA: Se o objetivo e HIPERTROFIA → frio ANTES do treino ou em dias de descanso, NUNCA imediatamente apos.

SAUNA / EXPOSICAO AO CALOR:

Mortalidade cardiovascular (Laukkanen et al., JAMA Internal Medicine 2015 — 2315 homens, 20.7 anos):

| Frequencia | Reducao Morte Subita | Reducao Mortalidade CV | Reducao Mortalidade Geral |
|------------|---------------------|----------------------|--------------------------|
| 2-3x/sem vs 1x | 22% | 27% | ~24% |
| 4-7x/sem vs 1x | 63% | 50% | 40% |

Protocolo GH (Leppaluoto et al., 1986):
- 2 sessoes de 20 min a 80°C, intervalo de 30 min entre elas
- Resultado: aumento de GH ate 16x no Dia 1
- Habituacao: cai para 3-4x no Dia 3, 2-3x no Dia 7
- Usar 1x/semana para maximizar GH; uso mais frequente atenua a resposta
- Otimizar: estado semi-jejum (2-3h apos refeicao; glicemia mais baixa aumenta GH)

Heat Shock Proteins:
- HSP70 e HSP90 ativadas a >77°C (170°F)
- Funcao: reparo de proteinas mal-formadas, protecao contra estresse oxidativo
- Sauna seca tradicional (77-100°C) e superior a infravermelha (49-60°C) para HSP

PROTOCOLO RECOMENDADO:
- Frequencia: 4-7x/semana para beneficio cardiovascular; 1x/semana para protocolo GH
- Temperatura: 80-100°C sauna seca
- Duracao: 15-20 min por sessao
- CONTRAINDICACOES: desidratacao ativa, pos-treino sem reidratacao, gestantes, hipertensos nao controlados, DM1 em hipoglicemia`;
  },
};
