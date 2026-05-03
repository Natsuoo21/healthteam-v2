/**
 * Parses the Phase 1 output (Coach Mike + Dra. Sarah) from a single LLM response.
 * Tries multiple header formats with fallbacks.
 */
export function parsePhase1(text: string): { coach: string; nutri: string } {
  // Try exact headers: ## COACH MIKE ... ## DRA. SARAH
  const exactCoach = text.match(/## COACH MIKE([\s\S]*?)(?=## DRA\.?\s*SARAH|$)/i);
  const exactNutri = text.match(/## DRA\.?\s*SARAH([\s\S]*?)$/i);
  if (exactCoach && exactNutri) {
    return { coach: exactCoach[1].trim(), nutri: exactNutri[1].trim() };
  }

  // Try bold headers: **COACH MIKE** ... **DRA. SARAH**
  const boldCoach = text.match(/\*\*COACH MIKE\*\*([\s\S]*?)(?=\*\*DRA\.?\s*SARAH\*\*|$)/i);
  const boldNutri = text.match(/\*\*DRA\.?\s*SARAH\*\*([\s\S]*?)$/i);
  if (boldCoach && boldNutri) {
    return { coach: boldCoach[1].trim(), nutri: boldNutri[1].trim() };
  }

  // Try BLOCO markers: BLOCO 1 ... BLOCO 2
  const bloco1 = text.match(/BLOCO\s*1[^\n]*([\s\S]*?)(?=BLOCO\s*2|$)/i);
  const bloco2 = text.match(/BLOCO\s*2[^\n]*([\s\S]*?)$/i);
  if (bloco1 && bloco2) {
    return { coach: bloco1[1].trim(), nutri: bloco2[1].trim() };
  }

  // Try horizontal rule separator ---
  const parts = text.split(/\n---+\n/);
  if (parts.length >= 2) {
    return { coach: parts[0].trim(), nutri: parts.slice(1).join('\n---\n').trim() };
  }

  // Ultimate fallback: everything is coach, nutri empty
  console.warn('[deliberation-parser] Could not parse Phase 1 — using full text as coach');
  return { coach: text.trim(), nutri: "" };
}
