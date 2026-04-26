import { TrainingStack } from "@/stores/htStore";

/**
 * MOCK DATA
 * Utilizado para manter a UI viva enquanto não finalizamos a conexão do Backend com o Banco de Dados.
 * Reflete exatamente os requisitos das personas (Powerlifting e MMA) solicitados.
 */

export const MOCK_TRAINING_STACKS: Record<string, TrainingStack> = {
  powerlifting_prep: {
    goal: "hypertrophy",
    primary: "powerlifting",
    secondary: "bodybuilding",
    height: 180,
    weight: 88.5,
    conditions: "Joelho valgo leve estabilizado, Foco em pico de força (Peaking Phase)",
  },
  mma_conditioning: {
    goal: "conditioning",
    primary: "martial_arts_mma",
    secondary: "calisthenics",
    height: 175,
    weight: 77.0,
    conditions: "Recuperando de lesão no manguito rotador direito",
  },
};

export const MOCK_ROUND_TABLE_DELIBERATIONS = [
  {
    topic: "Quero competir de Powerlifting daqui a 4 meses, mas estou treinando JJ 2x na semana. Como não estourar o corpo?",
    responses: [
      {
        specialist: "trainer",
        content: "Para a periodização do Powerlifting a 4 meses, recomendo reduzir o Jiu Jitsu para evitar overtraining e conflito de recuperação nas semanas finais (peaking). Os treinos de JJ devem ser focados apenas em técnica, sem rolas pesados.",
      },
      {
        specialist: "nutritionist",
        content: "Apoiado. Modificarei os dias de carboidrato alto (high carb) estritamente para os dias de agachamento e levantamento terra. No dia do Jiu Jitsu, manteremos proteína alta e carbo apenas antes da sessão para fornecer energia rápida.",
      },
      {
        specialist: "endocrinologist",
        content: "Do lado clínico, adicionarei protocolo de saturação com creatina no mês 3. Faremos um painel de Testosterona Livre, CPK e Cortisol na semana 8 para identificar indícios de fadiga central (overreaching) precocemente.",
      }
    ]
  }
];
