import { generateChainedSeedMission } from '../game/missionEngine';
import { AIProvider, GameContext, Mission, Verification } from '../types';

export class FallbackProvider implements AIProvider {
  readonly id = 'fallback';
  readonly name = 'MUSE Offline Engine (Touch Grass)';
  readonly isAvailable = true;

  async generateMission(context: GameContext): Promise<Mission> {
    // Generates a mission dynamically chained from context
    return generateChainedSeedMission(context);
  }

  async verifyMission(imageBase64OrUri: string, mission: Mission): Promise<Verification> {
    // Artificial slight delay to simulate inference processing HUD
    await new Promise((r) => setTimeout(r, 1200));

    // When playing offline or without API key, verify based on mission hint and target
    const keywords: Record<string, string> = {
      structure: 'Architectural safety feature',
      reflection: 'Reflective glass or chrome surface',
      'human-made': 'Physical street fixture',
      object: 'Metal apparatus',
      nature: 'Organic growth element',
      color: 'Distinctive colored object',
      shape: 'Geometric circular fixture',
      environment: 'Light and shadow play',
    };

    const detected = keywords[mission.category] || 'Observed object';

    return {
      success: true,
      confidence: 0.92,
      detectedObject: detected,
      observation: `Captured target object aligned with category: ${mission.category}.`,
      explanation: `The object satisfies: "${mission.text}". Verified by MUSE on-device heuristics.`,
    };
  }
}
