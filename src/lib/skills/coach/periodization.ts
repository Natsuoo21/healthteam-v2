import type { Skill } from "../types";

function getLevel(years?: number): string {
  if (years == null) return "intermediario";
  if (years < 1) return "iniciante";
  if (years <= 3) return "intermediario";
  return "avancado";
}

export const periodizationSkill: Skill = {
  id: "periodization",
  name: "Periodizacao e Estrutura de Mesociclo",
  estimatedTokens: 600,
  priority: 10,
  isRelevant: () => true,

  render: (stack) => {
    const level = getLevel(stack.trainingYears);

    return `[SKILL: PERIODIZACAO E ESTRUTURA DE MESOCICLO]

Selecione o modelo de periodizacao com base no nivel do atleta e JUSTIFIQUE a escolha:

INICIANTE (<1 ano de treino consistente):
- Periodizacao LINEAR. Progresso sessao-a-sessao e viavel.
- Mesociclo de 4-6 semanas. Foco em aprender padroes motores e ganhar forca neural.
- Split: Full Body 3x/semana ou Upper/Lower 3-4x.
- Referencia: Progressao linear tipo Starting Strength/StrongLifts e suficiente neste estagio (NSCA, Baechle & Earle).

INTERMEDIARIO (1-3 anos):
- Periodizacao ONDULADA DIARIA (DUP). Meta-analise de Nuckols (Stronger By Science) demonstra ganhos ~2x superiores vs linear neste nivel.
- Variar estimulo por sessao: Dia A (hipertrofia 8-12 reps), Dia B (forca 3-5 reps), Dia C (potencia/endurance muscular 15-20 reps).
- Mesociclo de 4 semanas + 1 semana deload.
- Split: Upper/Lower 4x, Push/Pull/Legs 5-6x, ou Full Body 4x com enfases diferentes.

AVANCADO (3+ anos):
- Periodizacao por BLOCOS (Chad Wesley Smith / Juggernaut Training Systems).
- Blocos de 3-4 semanas com foco unico: Acumulacao (volume alto, 10s-8s) → Intensificacao (carga alta, 5s-3s) → Realizacao (pico, 1-3 reps).
- OU DUP avancada com tecnicas especiais (cluster sets, myo-reps, rest-pause).
- Eric Helms: ciclos de especializacao por grupo muscular para atletas avancados.

NIVEL DO ATLETA ATUAL: ${level}${stack.trainingYears != null ? ` (${stack.trainingYears} anos de treino)` : ""}

REGRAS DE MESOCICLO:
- Durar 3-5 semanas de trabalho + 1 semana de deload.
- Semana 1: volume no MEV (Minimum Effective Volume). Progredir +1-2 series/grupo/semana.
- Semana final: volume proximo ao MAV (Maximum Adaptive Volume). NAO ultrapassar MRV.
- Deload: reducao de 40-50% do volume, manter intensidade em ~70% da carga habitual.

EXEMPLO DE DECISAO:
"Atleta intermediario, 2 anos de treino, objetivo hipertrofia → DUP com Upper/Lower 4x/semana, mesociclo de 4 semanas + 1 deload. Justificativa: DUP proporciona variacao de estimulo session-to-session, demonstrado superior a linear para este nivel (Nuckols, SBS meta-review)."`;
  },
};
