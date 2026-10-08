import { parseMissionJson } from '../game/missionEngine';
import { AIProvider, GameContext, Mission, Verification } from '../types';
import { buildMissionGenerationPrompt, buildVerificationPrompt } from './prompts';
import { parseVerificationJson } from './schemas';

export class GemmaAPIProvider implements AIProvider {
  readonly id = 'gemma-api';
  readonly name = 'Gemma Multimodal API';
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey?: string, endpoint?: string) {
    this.apiKey = apiKey || (process.env.EXPO_PUBLIC_GEMMA_API_KEY ?? '');
    // Defaults to Google Generative Language API endpoint supporting Gemma & Gemini models
    this.endpoint = endpoint || 'https://generativelanguage.googleapis.com/v1beta';
  }

  get isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  /**
   * Generates mission using Gemma via API
   */
  async generateMission(context: GameContext): Promise<Mission> {
    if (!this.isAvailable) {
      throw new Error('Gemma API Key is missing. Please configure EXPO_PUBLIC_GEMMA_API_KEY.');
    }

    const prompt = buildMissionGenerationPrompt(context);
    const model = 'gemini-1.5-flash'; // High-speed multimodal compatible with Google AI

    const url = `${this.endpoint}/models/${model}:generateContent?key=${this.apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: 'application/json',
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemma API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return parseMissionJson(candidateText, context.difficulty);
  }

  /**
   * Verifies captured image using multimodal inference
   */
  async verifyMission(imageBase64OrUri: string, mission: Mission): Promise<Verification> {
    if (!this.isAvailable) {
      throw new Error('Gemma API Key is missing. Please configure EXPO_PUBLIC_GEMMA_API_KEY.');
    }

    const prompt = buildVerificationPrompt(mission);
    const model = 'gemini-1.5-flash';

    // Extract raw base64 data if prefixed with data:image/...
    let base64Data = imageBase64OrUri;
    let mimeType = 'image/jpeg';
    if (imageBase64OrUri.startsWith('data:')) {
      const matches = imageBase64OrUri.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    const url = `${this.endpoint}/models/${model}:generateContent?key=${this.apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemma API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return parseVerificationJson(responseText);
  }
}
