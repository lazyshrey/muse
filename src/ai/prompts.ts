import { GameContext, Mission } from '../types';

export function buildMissionGenerationPrompt(context: GameContext): string {
  const { previousDiscovery, difficulty } = context;

  return `You are the mission engine for MUSE, a real-world physical exploration game.

Generate ONE physical-world observation challenge for a university campus / outdoor setting.

The challenge must:
- require the player to physically explore their surroundings;
- be observable with a smartphone camera;
- be safe (no climbing, no crossing highways, no restricted areas);
- be achievable without interacting with strangers;
- not require precise GPS coordinates;
- not require purchasing anything;
- not be impossible to verify visually.

Previous discovery by player:
${previousDiscovery ? `"${previousDiscovery}"` : 'None (first mission of expedition)'}

Difficulty Level: ${difficulty} (1 = Simple visual feature, 2 = Functional/semantic purpose, 3 = Abstract/philosophical observation)

Return ONLY valid JSON matching this exact schema:
{
  "id": "mission_${Date.now()}",
  "text": "The mission prompt for the player, e.g. Find something that...",
  "category": "object" | "structure" | "nature" | "color" | "shape" | "reflection" | "human-made" | "environment",
  "difficulty": ${difficulty},
  "verificationHint": "A short hint guiding what physical attributes to search for"
}`;
}

export function buildVerificationPrompt(mission: Mission): string {
  return `You are the visual verification engine for MUSE, an AI-powered physical exploration scavenger hunt.

The user was given this mission:
"${mission.text}"
Category: ${mission.category}
Difficulty: ${mission.difficulty}
Verification Hint: ${mission.verificationHint}

Analyze the provided image.

Determine:
1. What object or scene is visibly present.
2. Whether the detected object/scene honestly satisfies the user's mission.
3. Your confidence score between 0.00 and 1.00.
4. A concise explanation of why it does or does not count.

Strict Rules:
- Do not assume objects that are not visibly present in the frame.
- If the image is blurry, blank, or does not clearly contain the requested item, set "success": false.
- Confidence must be between 0.0 and 1.0.

Return ONLY valid JSON matching this schema:
{
  "success": true | false,
  "confidence": 0.95,
  "detectedObject": "short name of primary detected object",
  "observation": "one sentence describing what is visible",
  "explanation": "one sentence explaining why it counts or why it doesn't match"
}`;
}
