import type { Skill } from "../types";

export const biomarkerPanelsSkill: Skill = {
  id: "biomarker_panels",
  name: "Paineis de Biomarcadores",
  estimatedTokens: 450,
  priority: 9,
  isRelevant: () => true,

  render: () => {
    return `[SKILL: PAINEIS DE BIOMARCADORES PARA ATLETAS]

PAINEL TRIMESTRAL (temporada de competicao):

| Categoria | Marcadores | Justificativa |
|-----------|------------|---------------|
| Hormonal | T total, T livre (calc), SHBG, Cortisol (AM), DHEA-S | Balanco anabolico/catabolico, screening OTS |
| Tireoide | TSH, T3L, T4L | Avaliacao de disp. energetica, screening RED-S |
| Inflamatorio | hs-CRP, Ferritina | Inflamacao cronica, status de ferro |
| Metabolico | Glicemia jejum, Insulina jejum, HbA1c, HOMA-IR | Saude metabolica, sensibilidade insulinica |
| Hematologico | Hemograma completo, Painel ferro (ferritina, ferro serico, TIBC, sat. transferrina) | Screening anemia, status imune |

PAINEL ANUAL COMPLETO — todos os trimestrais MAIS:

| Categoria | Marcadores | Justificativa |
|-----------|------------|---------------|
| Hormonal estendido | LH, FSH, Estradiol (sensivel), Prolactina, IGF-1 | Funcao hipofisaria, quadro endocrino completo |
| Tireoide estendido | rT3, Anticorpos (anti-TPO, anti-TG) | Tireoide autoimune, NTIS |
| Lipideos | Colesterol total, LDL, HDL, Triglicerideos, ApoB | Risco CV (dislipidemia em 20.4% atletas olimpicos) |
| Metabolico estendido | Acido urico, Homocisteina | Inflamacao, metilacao |
| Micronutrientes | 25-OH Vitamina D, Magnesio (RBC), Zinco, B12, Folato | Screening de deficiencias |
| Funcao organica | CMP, Enzimas hepaticas (AST, ALT, GGT) | Funcao organica basal |

PROTOCOLO PRE-COLETA:
- Horario: manha cedo (7-10h AM), JEJUM de 8-12 horas
- Preparacao: evitar treino intenso 24-48h antes
- Hidratacao: normal (nao desidratado nem hiper-hidratado)
- Timing vs competicao: minimo 72h apos competicao para valores basais
- Follow-up: 8-12 semanas apos implementar intervencoes (ex: vitamina D, ferro)

HOMA-IR (Sensibilidade Insulinica):
- Formula: (Insulina jejum [mU/L] x Glicemia jejum [mmol/L]) / 22.5
- <1.0 = sensibilidade otima | 1.0-1.9 = normal | 2.0-2.9 = resistencia precoce | >3.0 = resistencia significativa
- Treino de forca + corrida = maior reducao de HOMA-IR (meta-analise mesh 2025)`;
  },
};
