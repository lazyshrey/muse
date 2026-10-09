import { FallbackProvider } from './FallbackProvider';
import { GemmaAPIProvider } from './GemmaAPIProvider';
import { GemmaLocalProvider } from './GemmaLocalProvider';
import { AIProvider, GameContext, Mission, Verification } from '../types';

export class AIProviderManager implements AIProvider {
  readonly id = 'manager';
  readonly name = 'MUSE Dynamic Provider';
  private localProvider: GemmaLocalProvider;
  private apiProvider: GemmaAPIProvider;
  private fallbackProvider: FallbackProvider;
  private preferredMode: 'auto' | 'gemma-local' | 'gemma-api' | 'fallback' = 'auto';

  constructor(apiKey?: string) {
    this.localProvider = new GemmaLocalProvider();
    this.apiProvider = new GemmaAPIProvider(apiKey);
    this.fallbackProvider = new FallbackProvider();
  }

  get isAvailable(): boolean {
    return true;
  }

  setPreferredMode(mode: 'auto' | 'gemma-local' | 'gemma-api' | 'fallback') {
    this.preferredMode = mode;
  }

  setApiKey(key: string) {
    this.apiProvider.setApiKey(key);
  }

  getActiveProvider(): AIProvider {
    if (this.preferredMode === 'gemma-local' && this.localProvider.isAvailable) {
      return this.localProvider;
    }
    if (this.preferredMode === 'gemma-api' && this.apiProvider.isAvailable) {
      return this.apiProvider;
    }
    if (this.preferredMode === 'fallback') {
      return this.fallbackProvider;
    }

    // Auto resolution: Local -> API -> Fallback
    if (this.localProvider.isAvailable) {
      return this.localProvider;
    }
    if (this.apiProvider.isAvailable) {
      return this.apiProvider;
    }
    return this.fallbackProvider;
  }

  async generateMission(context: GameContext): Promise<Mission> {
    const provider = this.getActiveProvider();
    try {
      return await provider.generateMission(context);
    } catch (error) {
      console.warn(`[AIProviderManager] Primary provider (${provider.name}) failed, using fallback:`, error);
      return await this.fallbackProvider.generateMission(context);
    }
  }

  async verifyMission(imageBase64OrUri: string, mission: Mission): Promise<Verification> {
    const provider = this.getActiveProvider();
    if (provider.id === 'fallback') {
      return await this.fallbackProvider.verifyMission(imageBase64OrUri, mission);
    }

    try {
      return await provider.verifyMission(imageBase64OrUri, mission);
    } catch (error) {
      console.warn(`[AIProviderManager] Primary provider (${provider.name}) failed:`, error);
      return {
        success: false,
        confidence: 0,
        detectedObject: 'AI Vision Notice',
        observation: 'Unable to reach the multimodal vision API.',
        explanation:
          error instanceof Error
            ? error.message
            : 'Please check your internet connection or Google AI Studio key in Settings.',
      };
    }
  }
}

export const defaultAIProvider = new AIProviderManager();
