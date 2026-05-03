import { describe, it, expect } from 'vitest';
import { parsePhase1 } from '@/lib/deliberation-parser';

describe('parsePhase1', () => {
  it('parses ## COACH MIKE and ## DRA. SARAH headers', () => {
    const text = `## COACH MIKE
Treino completo aqui com tabelas.

## DRA. SARAH
Plano nutricional aqui.`;
    const result = parsePhase1(text);
    expect(result.coach).toContain('Treino completo aqui');
    expect(result.nutri).toContain('Plano nutricional aqui');
  });

  it('parses **bold** headers', () => {
    const text = `**COACH MIKE**
Conteudo do coach em bold.

**DRA. SARAH**
Conteudo da nutri em bold.`;
    const result = parsePhase1(text);
    expect(result.coach).toContain('Conteudo do coach em bold');
    expect(result.nutri).toContain('Conteudo da nutri em bold');
  });

  it('parses BLOCO markers', () => {
    const text = `BLOCO 1 — COACH MIKE
Conteudo bloco 1.

BLOCO 2 — DRA. SARAH
Conteudo bloco 2.`;
    const result = parsePhase1(text);
    expect(result.coach).toContain('Conteudo bloco 1');
    expect(result.nutri).toContain('Conteudo bloco 2');
  });

  it('parses horizontal rule separator', () => {
    const text = `Parte do coach aqui.
---
Parte da nutri aqui.`;
    const result = parsePhase1(text);
    expect(result.coach).toContain('Parte do coach');
    expect(result.nutri).toContain('Parte da nutri');
  });

  it('falls back to full text as coach when no pattern matches', () => {
    const text = `Texto sem nenhum marcador reconhecido. Tudo junto.`;
    const result = parsePhase1(text);
    expect(result.coach).toBe(text.trim());
    expect(result.nutri).toBe('');
  });

  it('handles empty input', () => {
    const result = parsePhase1('');
    expect(result.coach).toBe('');
    expect(result.nutri).toBe('');
  });
});
