import type { Skill } from "../types";

export const progressiveOverloadSkill: Skill = {
  id: "progressive_overload",
  name: "Progressao de Carga e Deload",
  estimatedTokens: 450,
  priority: 8,
  isRelevant: () => true,

  render: () => `[SKILL: PROGRESSAO DE CARGA E PROTOCOLOS DE DELOAD]

ESCALA RPE/RIR — use SEMPRE para prescrever intensidade:
| RPE | RIR | Descricao |
|-----|-----|-----------|
| 10 | 0 | Falha muscular — nenhuma rep a mais possivel |
| 9.5 | 0-1 | Falha ou talvez +1 rep |
| 9 | 1 | Poderia fazer +1 rep |
| 8 | 2 | Poderia fazer +2 reps — ZONA DE TRABALHO IDEAL para hipertrofia |
| 7 | 3 | Moderado — bom para volume e tecnica |
| 6 | 4 | Aquecimento pesado / sets de ativacao |

METODO DE PROGRESSAO — Double Progression (Eric Helms):
1. Defina um RANGE de repeticoes alvo (ex: 8-12 reps).
2. Quando o atleta completar TODAS as series no TOPO do range (12 reps) com RPE <= 8:
   → Aumentar carga em 2.5-5% na proxima sessao.
   - Membros superiores: +1-2.5 kg
   - Membros inferiores: +2.5-5 kg
3. Apos aumento de carga, as reps cairao para o fundo do range (ex: 8 reps).
4. Trabalhar novamente ate atingir o topo. Repetir o ciclo.

PROGRESSAO ALTERNATIVA — Progressao de Volume (Israetel):
- Semana a semana, adicionar +1 serie por grupo se performance se manteve ou melhorou.
- Se performance caiu → manter volume ou reduzir. NAO forcar progressao.

PROTOCOLO DE DELOAD (Israetel + Helms):
- Frequencia: a cada 3-5 semanas de treino progressivo (3 para avancados, 5 para iniciantes).
- Volume: reduzir 40-50% das series semanais.
- Intensidade: manter em ~70% da carga habitual. NAO treinar leve demais — manter o estimulo neural.
- Duracao: 1 semana (5-7 dias).

TRIGGERS PARA DELOAD ANTECIPADO:
- Queda de performance >10% por 2 sessoes consecutivas.
- Qualidade de sono degradada por 5+ dias seguidos.
- RPE subjetivo >8 em cargas que normalmente sao RPE 6-7.
- Dor articular persistente (nao DOMS — dor aguda).
- Motivacao/disposicao consistentemente baixa (sinal de fadiga do SNC).

REGRA: Sempre inclua criterios de progressao CONCRETOS na ficha. Nunca prescreva "ajuste conforme necessario" sem dar o numero base.`,
};
