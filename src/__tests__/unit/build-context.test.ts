import { describe, it, expect } from 'vitest';
import { buildContext } from '@/lib/deliberation-context';

describe('buildContext', () => {
  it('builds full context with all fields', () => {
    const stack = {
      goal: 'hypertrophy',
      primary: 'Musculação',
      secondary: 'Natação',
      height: 180,
      weight: 85,
      conditions: 'Nenhuma',
    };
    const result = buildContext(stack, 'João Silva');
    expect(result).toContain('ATLETA: João Silva');
    expect(result).toContain('Forca & Hipertrofia');
    expect(result).toContain('Musculação');
    expect(result).toContain('Natação');
    expect(result).toContain('180cm');
    expect(result).toContain('85kg');
  });

  it('includes DM1 alert for diabetic athletes', () => {
    const stack = {
      goal: 'recomp',
      primary: 'Crossfit',
      secondary: 'Nenhum',
      height: 175,
      weight: 78,
      conditions: 'Diabetes Tipo 1',
    };
    const result = buildContext(stack, 'Maria');
    expect(result).toContain('ALERTA DM1 ATIVO');
    expect(result).toContain('hipoglicemia');
    expect(result).toContain('CGM');
    expect(result).toContain('bolus em 50%');
  });

  it('detects DM1 with various spellings', () => {
    const variants = ['dm1', 'DM1', 'Diabetes Tipo 1', 'type 1 diabetes', 'diabetico tipo 1'];
    for (const condition of variants) {
      const stack = { goal: 'hypertrophy', primary: 'Musculação', height: 175, weight: 80, conditions: condition };
      const result = buildContext(stack, 'Teste');
      expect(result).toContain('ALERTA DM1 ATIVO');
    }
  });

  it('handles missing secondary sport', () => {
    const stack = {
      goal: 'conditioning',
      primary: 'Corrida',
      secondary: 'Nenhum',
      height: 170,
      weight: 65,
      conditions: '',
    };
    const result = buildContext(stack, 'Pedro');
    expect(result).toContain('MODALIDADE SECUNDARIA: Nenhuma');
  });

  it('handles missing stack gracefully', () => {
    const result = buildContext(null, 'Anon');
    expect(result).toContain('ATLETA: Anon');
  });

  it('includes training context when present', () => {
    const stack = {
      goal: 'hypertrophy',
      primary: 'Musculação',
      height: 180,
      weight: 90,
      conditions: '',
      trainingContext: 'Treino em casa com equipamento limitado',
    };
    const result = buildContext(stack, 'Carlos');
    expect(result).toContain('CONTEXTO DE TREINO: Treino em casa');
  });
});
