import { MissionDifficulty } from '../types';

export const XP_TABLE: Record<MissionDifficulty, number> = {
  1: 50,
  2: 100,
  3: 150,
};

/**
 * Calculates XP earned for completing a mission based on difficulty.
 */
export function calculateXP(difficulty: MissionDifficulty): number {
  return XP_TABLE[difficulty] ?? 50;
}
