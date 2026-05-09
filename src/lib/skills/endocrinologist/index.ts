import type { TrainingStack } from "@/stores/htStore";
import type { Skill, ComposedPrompt } from "../types";

import { hormonalPanelSkill } from "./hormonal-panel";
import { sleepRecoverySkill } from "./sleep-recovery";
import { biomarkerPanelsSkill } from "./biomarker-panels";
import { overtrainingInflammationSkill } from "./overtraining-inflammation";
import { thermalTherapySkill } from "./thermal-therapy";
import { redsScreeningSkill } from "./reds-screening";
import { femaleEndocrinologySkill } from "./female-endocrinology";
import { ageManagementSkill } from "./age-management";

/** All registered Dr. Evans skills */
const ALL_SKILLS: Skill[] = [
  hormonalPanelSkill,
  sleepRecoverySkill,
  biomarkerPanelsSkill,
  overtrainingInflammationSkill,
  thermalTherapySkill,
  redsScreeningSkill,
  femaleEndocrinologySkill,
  ageManagementSkill,
];

/** Default token budget for endocrinologist skill blocks */
const DEFAULT_SKILL_TOKEN_BUDGET = 4000;

/**
 * Composes Dr. Evans's prompt by selecting relevant skills,
 * sorting by priority, and assembling within token budget.
 */
export function composeEndoPrompt(
  stack?: TrainingStack,
  tokenBudget: number = DEFAULT_SKILL_TOKEN_BUDGET,
): ComposedPrompt {
  if (!stack) {
    const defaultStack: TrainingStack = {
      primary: "Musculação", goal: "hypertrophy",
      height: 175, weight: 80, conditions: "",
    };
    return composeEndoPrompt(defaultStack, tokenBudget);
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
