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

  return `ATLETA: ${profileName}
OBJETIVO: ${goals[stack?.goal] || stack?.goal}
MODALIDADE PRINCIPAL: ${stack?.primary}
MODALIDADE SECUNDARIA: ${stack?.secondary && stack.secondary !== "Nenhum" ? stack.secondary : "Nenhuma"}
ALTURA: ${stack?.height}cm | PESO: ${stack?.weight}kg
CONDICOES DE SAUDE: ${conditions}${stack?.trainingContext ? `\nCONTEXTO DE TREINO: ${stack.trainingContext}` : ""}${hasDM1 ? `

ALERTA DM1 ATIVO: O atleta tem Diabetes Tipo 1. Todas as recomendacoes devem considerar:
- Risco de hipoglicemia durante e apos exercicio (especialmente aerobico)
- Ajustes de insulina basal/bolus peri-treino
- Carbs de seguranca obrigatorios (15-30g fast-acting) disponiveis durante treino
- Monitoramento via CGM — alertas de glicemia <80 mg/dL para pausar treino
- Evitar jejum prolongado sem protocolo de seguranca
- Peri-treino: reduzir bolus em 50% na refeicao pre-treino, considerar reduzir basal em 20-30%` : ""}`.trim();
}
