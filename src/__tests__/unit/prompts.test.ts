import { describe, it, expect } from 'vitest';
import { getSystemPrompt } from '@/lib/prompts';

describe('getSystemPrompt', () => {
  const sampleStack = {
    goal: 'hypertrophy',
    primary: 'Musculação',
    secondary: 'Natação',
    height: 180,
    weight: 85,
    conditions: 'Nenhuma',
  };

  it('returns PT-BR content for trainer', () => {
    const prompt = getSystemPrompt('trainer', sampleStack as any);
    expect(prompt).toContain('Coach Mike');
    expect(prompt).toContain('Periodização');
    expect(prompt).toContain('Português (BR)');
    expect(prompt).toContain('REGRAS INVIOLÁVEIS');
  });

  it('returns PT-BR content for nutritionist', () => {
    const prompt = getSystemPrompt('nutritionist', sampleStack as any);
    expect(prompt).toContain('Dra. Sarah');
    expect(prompt).toContain('Nutricionista');
    expect(prompt).toContain('TDEE');
    expect(prompt).toContain('Macronutrientes');
  });

  it('returns PT-BR content for endocrinologist', () => {
    const prompt = getSystemPrompt('endocrinologist', sampleStack as any);
    expect(prompt).toContain('Dr. Evans');
    expect(prompt).toContain('Endocrinologista');
    expect(prompt).toContain('Hormonal');
    expect(prompt).toContain('Testosterona');
  });

  it('includes user context with stack data', () => {
    const prompt = getSystemPrompt('trainer', sampleStack as any);
    expect(prompt).toContain('Objetivo Principal: hypertrophy');
    expect(prompt).toContain('Musculação');
    expect(prompt).toContain('180cm');
    expect(prompt).toContain('85kg');
  });

  it('handles missing stack gracefully', () => {
    const prompt = getSystemPrompt('trainer');
    expect(prompt).toContain('ainda não configurou');
  });

  it('includes DM1 awareness for nutritionist with diabetic athlete', () => {
    const dm1Stack = { ...sampleStack, conditions: 'Diabetes Tipo 1' };
    const prompt = getSystemPrompt('nutritionist', dm1Stack as any);
    expect(prompt).toContain('DM1');
    expect(prompt).toContain('hipoglicemia');
  });

  it('includes evidence citation rules', () => {
    const prompt = getSystemPrompt('trainer', sampleStack as any);
    expect(prompt).toContain('CITAÇÃO DE EVIDÊNCIAS');
    expect(prompt).toContain('ACSM');
    expect(prompt).toContain('ISSN');
  });

  it('includes response dimensioning rules', () => {
    const prompt = getSystemPrompt('trainer', sampleStack as any);
    expect(prompt).toContain('DIMENSIONAMENTO DE RESPOSTA');
  });
});
