function getTrainingLevel(years?: number): string {
  if (years == null) return "";
  if (years < 1) return "Iniciante";
  if (years <= 3) return "Intermediario";
  return "Avancado";
}

function getGenderLabel(gender?: string): string {
  if (!gender) return "";
  if (gender === "male") return "Masculino";
  if (gender === "female") return "Feminino";
  return "Outro";
}

/**
 * Builds the athlete context string used in deliberation prompts.
 */
export function buildContext(stack: any, profileName: string): string {
  const goals: Record<string, string> = {
    hypertrophy: "Forca & Hipertrofia",
    conditioning: "Condicionamento & Performance",
    recomp: "Recomposicao Corporal",
  };
  const conditions = stack?.conditions || "Nenhuma reportada";
  const hasDM1 = /diabet|dm1|tipo 1|type 1/i.test(conditions);

  let ctx = `ATLETA: ${profileName}
OBJETIVO: ${goals[stack?.goal] || stack?.goal}
MODALIDADE PRINCIPAL: ${stack?.primary}
MODALIDADE SECUNDARIA: ${stack?.secondary && stack.secondary !== "Nenhum" ? stack.secondary : "Nenhuma"}
ALTURA: ${stack?.height}cm | PESO: ${stack?.weight}kg`;

  if (stack?.age) ctx += `\nIDADE: ${stack.age} anos`;
  if (stack?.gender) ctx += `\nSEXO BIOLOGICO: ${getGenderLabel(stack.gender)}`;
  if (stack?.trainingYears != null) {
    const level = getTrainingLevel(stack.trainingYears);
    ctx += `\nNIVEL DE TREINO: ${level} (${stack.trainingYears} anos)`;
  }
  if (stack?.bodyFatPct) ctx += `\nBF: ${stack.bodyFatPct}%`;
  if (stack?.activityLevel) ctx += `\nNIVEL DE ATIVIDADE: ${stack.activityLevel}`;

  ctx += `\nCONDICOES DE SAUDE: ${conditions}`;
  if (stack?.trainingContext) ctx += `\nCONTEXTO DE TREINO: ${stack.trainingContext}`;

  if (hasDM1) {
    ctx += `

ALERTA DM1 ATIVO: O atleta tem Diabetes Tipo 1. Todas as recomendacoes devem considerar:
- Risco de hipoglicemia durante e apos exercicio (especialmente aerobico)
- Ajustes de insulina basal/bolus peri-treino
- Carbs de seguranca obrigatorios (15-30g fast-acting) disponiveis durante treino
- Monitoramento via CGM — alertas de glicemia <80 mg/dL para pausar treino
- Evitar jejum prolongado sem protocolo de seguranca
- Peri-treino: reduzir bolus em 50% na refeicao pre-treino, considerar reduzir basal em 20-30%`;
  }

  return ctx.trim();
}
