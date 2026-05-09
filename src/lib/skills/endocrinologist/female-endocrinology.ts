import type { Skill } from "../types";

export const femaleEndocrinologySkill: Skill = {
  id: "female_endocrinology",
  name: "Endocrinologia Feminina",
  estimatedTokens: 450,
  priority: 8,
  isRelevant: (stack) => stack.gender === "female",

  render: () => {
    return `[SKILL: ENDOCRINOLOGIA FEMININA]

FASES DO CICLO MENSTRUAL E IMPACTO NO TREINO/RECUPERACAO:

| Fase | Dias (ciclo 28d) | Hormonios | Performance | Recomendacao |
|------|------------------|-----------|-------------|--------------|
| Folicular precoce (menstruacao) | 1-5 | E2 baixo, P4 baixo | Forca/aerobico levemente reduzidos | Intensidade menor; foco em recuperacao e tecnica |
| Folicular tardia | 6-13 | E2 subindo, P4 baixo | PICO de forca e potencia | Treino mais pesado, PRs, alta intensidade |
| Ovulacao | ~14 | Pico E2, pico LH | Alta potencia; risco ACL aumentado (laxidez) | Alta intensidade com consciencia de lesao |
| Lutea precoce | 15-21 | P4 subindo, E2 moderado | Endurance levemente melhorada; temperatura elevada | Foco em endurance; ajustar para calor |
| Lutea tardia (TPM) | 22-28 | E2 e P4 caindo | Pior performance; RPE mais alto | Deload; recuperacao; flexibilidade |

RESSALVA CRITICA (Frontiers 2025): variabilidade INTERindividual frequentemente excede efeitos medios por fase. Monitoramento INDIVIDUALIZADO supera prescricao generica por fase.

ANTICONCEPCIONAIS ORAIS (ACO):
- ACO combinados reduzem LEVEMENTE performance vs contracepcao nao-hormonal (meta-analise)
- ACO achatam flutuacoes hormonais → simplifica periodizacao MAS elimina pico follicular de performance
- Possivel leve atenuacao de ganho de massa magra

SOP (SINDROME DOS OVARIOS POLICISTICOS) EM ATLETAS:
- Prevalencia em atletas sem ACO: 37% (vs ~20% populacao geral)
- Paradoxo de performance: atletas com SOP mostraram VO2max significativamente MAIOR
- Niveis de androgenos correlacionaram positivamente com VO2max e massa magra
- Efeito protetor: hiperandrogenismo da SOP pode proteger contra fraturas (piloto 2024)
- Prescricao de exercicio para manejo da SOP (ESSA 2024):
  - 150-300 min aerobico moderado OU 75-150 min vigoroso/semana
  - + Fortalecimento muscular 2x/semana em dias nao-consecutivos
  - Para maior beneficio: 250 min moderado ou 150 min vigoroso + forca 2x/semana

MONITORAMENTO HORMONAL FEMININO — PAINEL ADICIONAL:
- Dias 2-5 do ciclo (fase folicular precoce): FSH, LH, Estradiol, Progesterona basal, DHEA-S, Testosterona total
- Dia 21 (fase lutea media): Progesterona (confirma ovulacao: >3 ng/mL)
- Anti-Mulleriano (AMH): reserva ovariana (se relevante)`;
  },
};
