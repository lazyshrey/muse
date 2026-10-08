import { Verification } from '../types';

export const MIN_CONFIDENCE_THRESHOLD = 0.6;

/**
 * Validates and extracts a structured Verification object from raw AI text response.
 */
export function parseVerificationJson(rawJson: string): Verification {
  try {
    // Strip markdown formatting fences if present
    const cleaned = rawJson
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    // Look for JSON object bounds
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    const jsonSubstring = firstBrace !== -1 && lastBrace !== -1 ? cleaned.substring(firstBrace, lastBrace + 1) : cleaned;

    const parsed = JSON.parse(jsonSubstring);

    const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.5;
    const isSuccess = Boolean(parsed.success) && confidence >= MIN_CONFIDENCE_THRESHOLD;

    return {
      success: isSuccess,
      confidence: Math.min(Math.max(confidence, 0), 1),
      detectedObject: typeof parsed.detectedObject === 'string' ? parsed.detectedObject : 'Unknown object',
      observation: typeof parsed.observation === 'string' ? parsed.observation : 'Visual analysis performed.',
      explanation:
        typeof parsed.explanation === 'string'
          ? parsed.explanation
          : isSuccess
          ? 'Matches the mission requirements.'
          : 'Does not sufficiently match the mission objectives.',
    };
  } catch (error) {
    return {
      success: false,
      confidence: 0.3,
      detectedObject: 'Unclear capture',
      observation: 'Unable to parse AI verification response format.',
      explanation: 'Please capture a clear, well-lit photo of the target object.',
    };
  }
}
