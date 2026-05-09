import type { TrainingStack } from "@/stores/htStore";
import type { Skill, ComposedPrompt } from "../types";

import { periodizationSkill } from "./periodization";
import { exerciseSelectionSkill } from "./exercise-selection";
import { volumeManagementSkill } from "./volume-management";
import { progressiveOverloadSkill } from "./progressive-overload";
import { conditioningSkill } from "./conditioning";
import { combatSportsSkill } from "./combat-sports";
import { warmupPrehabSkill } from "./warmup-prehab";

/** All registered Coach Mike skills */
const ALL_SKILLS: Skill[] = [
  periodizationSkill,
  exerciseSelectionSkill,
  volumeManagementSkill,
  progressiveOverloadSkill,
  conditioningSkill,
  combatSportsSkill,
  warmupPrehabSkill,
];

/** Default token budget for skill blocks (excludes identity preamble + context) */
const DEFAULT_SKILL_TOKEN_BUDGET = 4000;

/**
 * Composes Coach Mike's prompt by selecting relevant skills,
 * sorting by priority, and assembling within token budget.
 */
export function composeCoachPrompt(
  stack?: TrainingStack,
  tokenBudget: number = DEFAULT_SKILL_TOKEN_BUDGET,
): ComposedPrompt {
  if (!stack) {
    // No training stack — return all always-relevant skills with a default stack
    const defaultStack: TrainingStack = {
      primary: "Musculação", goal: "hypertrophy",
      height: 175, weight: 80, conditions: "",
    };
    return composeCoachPrompt(defaultStack, tokenBudget);
  }

  const relevant = ALL_SKILLS.filter((s) => s.isRelevant(stack));
  const irrelevant = ALL_SKILLS.filter((s) => !s.isRelevant(stack));

  // Sort by priority descending (highest priority kept first)
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
