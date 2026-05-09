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

  it('includes age when present', () => {
    const stack = { goal: 'hypertrophy', primary: 'Musculação', height: 180, weight: 85, conditions: '', age: 30 };
    const result = buildContext(stack, 'João');
    expect(result).toContain('IDADE: 30 anos');
  });

  it('includes gender when present', () => {
    const stack = { goal: 'hypertrophy', primary: 'Musculação', height: 180, weight: 85, conditions: '', gender: 'male' };
    const result = buildContext(stack, 'João');
    expect(result).toContain('SEXO BIOLOGICO: Masculino');
  });

  it('includes training level classification', () => {
    const beginner = { goal: 'hypertrophy', primary: 'Musculação', height: 180, weight: 85, conditions: '', trainingYears: 0.5 };
    expect(buildContext(beginner, 'A')).toContain('NIVEL DE TREINO: Iniciante');

    const intermediate = { ...beginner, trainingYears: 2 };
    expect(buildContext(intermediate, 'B')).toContain('NIVEL DE TREINO: Intermediario');

    const advanced = { ...beginner, trainingYears: 5 };
    expect(buildContext(advanced, 'C')).toContain('NIVEL DE TREINO: Avancado');
  });

  it('includes body fat percentage when present', () => {
    const stack = { goal: 'recomp', primary: 'Musculação', height: 175, weight: 80, conditions: '', bodyFatPct: 18.5 };
    const result = buildContext(stack, 'Ana');
    expect(result).toContain('BF: 18.5%');
  });

  it('includes activity level when present', () => {
    const stack = { goal: 'conditioning', primary: 'CrossFit', height: 170, weight: 70, conditions: '', activityLevel: 'very_active' };
    const result = buildContext(stack, 'Pedro');
    expect(result).toContain('NIVEL DE ATIVIDADE: very_active');
  });

  it('omits new fields when not present (backward compat)', () => {
    const stack = { goal: 'hypertrophy', primary: 'Musculação', height: 180, weight: 85, conditions: '' };
    const result = buildContext(stack, 'Legacy');
    expect(result).not.toContain('IDADE:');
    expect(result).not.toContain('SEXO BIOLOGICO:');
    expect(result).not.toContain('NIVEL DE TREINO:');
    expect(result).not.toContain('BF:');
    expect(result).not.toContain('NIVEL DE ATIVIDADE:');
  });
});
