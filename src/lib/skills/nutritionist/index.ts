import type { TrainingStack } from "@/stores/htStore";
import type { Skill, ComposedPrompt } from "../types";

import { macroPeriodizationSkill } from "./macro-periodization";
import { proteinStrategySkill } from "./protein-strategy";
import { periWorkoutNutritionSkill } from "./peri-workout-nutrition";
import { hydrationProtocolSkill } from "./hydration-protocol";
import { supplementationSkill } from "./supplementation";
import { bodyRecompositionSkill } from "./body-recomposition";
import { clinicalNutritionSkill } from "./clinical-nutrition";

/** All registered Dra. Sarah skills */
const ALL_SKILLS: Skill[] = [
  macroPeriodizationSkill,
  proteinStrategySkill,
  periWorkoutNutritionSkill,
  hydrationProtocolSkill,
  supplementationSkill,
  bodyRecompositionSkill,
  clinicalNutritionSkill,
];

/** Default token budget for nutritionist skill blocks */
const DEFAULT_SKILL_TOKEN_BUDGET = 4000;

/**
 * Composes Dra. Sarah's prompt by selecting relevant skills,
 * sorting by priority, and assembling within token budget.
 */
export function composeNutriPrompt(
  stack?: TrainingStack,
  tokenBudget: number = DEFAULT_SKILL_TOKEN_BUDGET,
): ComposedPrompt {
  if (!stack) {
    const defaultStack: TrainingStack = {
      primary: "Musculação", goal: "hypertrophy",
      height: 175, weight: 80, conditions: "",
    };
    return composeNutriPrompt(defaultStack, tokenBudget);
  }

  const relevant = ALL_SKILLS.filter((s) => s.isRelevant(stack));
  const irrelevant = ALL_SKILLS.filter((s) => !s.isRelevant(stack));

  relevant.sort((a, b) => b.priority - a.priority);

  const included: Skill[] = [];
  const excluded: Skill[] = [];
  let totalTokens = 0;

  for (const skill of relevant) {
    if (totalTokens + skill.estimatedTokens <= tokenBudget) {
      included.push(skill);
      totalTokens += skill.estimatedTokens;
    } else {
      excluded.push(skill);
    }
  }

  const skillBlocks = included.map((s) => s.render(stack));

  return {
    text: skillBlocks.join("\n\n"),
    includedSkills: included.map((s) => s.id),
    excludedSkills: [
      ...excluded.map((s) => s.id),
      ...irrelevant.map((s) => s.id),
    ],
    estimatedTokens: totalTokens,
  };
}
