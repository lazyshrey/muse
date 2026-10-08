import { Expedition, Mission, MissionDifficulty, MissionResult, Verification } from '../types';
import { calculateXP } from './xp';

/**
 * Creates a brand new expedition.
 */
export function createExpedition(): Expedition {
  return {
    id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    startedAt: Date.now(),
    missions: [],
    totalXP: 0,
  };
}

/**
 * Calculates difficulty for the next mission based on completed missions count.
 * Level 1 for 0 completed, Level 2 for 1-2 completed, Level 3 for 3+ completed.
 */
export function calculateNextDifficulty(completedCount: number): MissionDifficulty {
  if (completedCount <= 0) return 1;
  if (completedCount <= 2) return 2;
  return 3;
}

/**
 * Records a successful mission verification into the expedition.
 */
export function recordMissionResult(
  expedition: Expedition,
  mission: Mission,
  verification: Verification,
  photoUri?: string
): { updatedExpedition: Expedition; xpEarned: number } {
  const xpEarned = calculateXP(mission.difficulty);
  const result: MissionResult = {
    mission,
    verification,
    completedAt: Date.now(),
    xpEarned,
    photoUri,
  };

  const updatedExpedition: Expedition = {
    ...expedition,
    missions: [...expedition.missions, result],
    totalXP: expedition.totalXP + xpEarned,
  };

  return { updatedExpedition, xpEarned };
}

/**
 * Finalizes the expedition.
 */
export function completeExpedition(expedition: Expedition): Expedition {
  return {
    ...expedition,
    completedAt: Date.now(),
  };
}
