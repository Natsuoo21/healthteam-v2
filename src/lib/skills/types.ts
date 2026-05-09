import type { TrainingStack } from "@/stores/htStore";

/**
 * A composable skill module — a focused block of domain knowledge
 * with conditions for activation and structured prompt content.
 */
export interface Skill {
  /** Unique identifier (kebab-case) */
  id: string;
  /** Human-readable name */
  name: string;
  /** Estimated token count of the rendered prompt block */
  estimatedTokens: number;
  /** Priority weight: 10=core (always), 6-8=contextual. Higher = kept when budget is tight. */
  priority: number;
  /** Returns true if this skill is relevant for the given athlete profile. */
  isRelevant: (stack: TrainingStack) => boolean;
  /** Renders the skill's prompt block. May include conditional content based on stack. */
  render: (stack: TrainingStack) => string;
}

/**
 * Result of composing skills into a final prompt.
 */
export interface ComposedPrompt {
  /** The assembled skill blocks text */
  text: string;
  /** Skill IDs that were included */
  includedSkills: string[];
  /** Skill IDs excluded (irrelevant or over budget) */
  excludedSkills: string[];
  /** Total estimated tokens */
  estimatedTokens: number;
}
