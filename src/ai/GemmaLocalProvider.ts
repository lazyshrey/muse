import { generateChainedSeedMission } from '../game/missionEngine';
import { AIProvider, GameContext, Mission, Verification } from '../types';
import { parseVerificationJson } from './schemas';

/**
 * On-device Gemma 4 E2B Provider via Google AI Edge / LiteRT-LM.
 * Designed for local edge execution without round-trips to the cloud.
 */
export class GemmaLocalProvider implements AIProvider {
  readonly id = 'gemma-local';
  readonly name = 'Gemma 4 E2B (On-Device)';
  private isModelLoaded: boolean = false;

  constructor() {
    this.checkLocalEnvironment();
  }

  get isAvailable(): boolean {
    return this.isModelLoaded;
  }

  private checkLocalEnvironment() {
    // In React Native Expo Go / standard build without local weights embedded,
    // local on-device weight files are not loaded by default.
    // When LiteRT / Mediapipe native bindings are provided with model file,
    // this flips to true.
    this.isModelLoaded = false;
  }

  async generateMission(context: GameContext): Promise<Mission> {
    if (!this.isAvailable) {
      throw new Error('Local Gemma 4 E2B model is not initialized on this device.');
    }
    return generateChainedSeedMission(context);
  }

  async verifyMission(imageBase64OrUri: string, mission: Mission): Promise<Verification> {
    if (!this.isAvailable) {
      throw new Error('Local Gemma 4 E2B model is not initialized on this device.');
    }
    return parseVerificationJson('{}');
  }
}
