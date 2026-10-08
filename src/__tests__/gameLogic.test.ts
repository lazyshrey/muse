import { describe, it, expect } from '@jest/globals';
import { calculateXP } from '../game/xp';
import { createExpedition, recordMissionResult, calculateNextDifficulty } from '../game/expedition';
import { isValidMission, parseMissionJson } from '../game/missionEngine';
import { parseVerificationJson } from '../ai/schemas';
import { AIProviderManager } from '../ai/AIProvider';
import { Mission, Verification } from '../types';

describe('XP Calculation', () => {
  it('correctly calculates XP by difficulty', () => {
    expect(calculateXP(1)).toBe(50);
    expect(calculateXP(2)).toBe(100);
    expect(calculateXP(3)).toBe(150);
  });
});

describe('Mission Parser and Validation', () => {
  it('validates compliant mission objects', () => {
    const validMission: Mission = {
      id: 'm_123',
      text: 'Find something that protects people.',
      category: 'structure',
      difficulty: 2,
      verificationHint: 'Look for safety railings or canopies.',
    };
    expect(isValidMission(validMission)).toBe(true);
  });

  it('rejects invalid mission objects', () => {
    expect(isValidMission(null)).toBe(false);
    expect(isValidMission({ text: 'hi' })).toBe(false);
    expect(isValidMission({ id: '1', text: 'too short', category: 'invalid', difficulty: 5 })).toBe(false);
  });

  it('parses valid JSON string from AI model', () => {
    const rawJson = `\`\`\`json
    {
      "id": "m_test_1",
      "text": "Find something that reflects the world without being a mirror.",
      "category": "reflection",
      "difficulty": 2,
      "verificationHint": "Look for polished metal or still water."
    }
    \`\`\``;

    const parsed = parseMissionJson(rawJson, 2);
    expect(parsed.id).toBe('m_test_1');
    expect(parsed.text).toBe('Find something that reflects the world without being a mirror.');
    expect(parsed.category).toBe('reflection');
    expect(parsed.difficulty).toBe(2);
  });

  it('falls back safely when AI returns corrupted or invalid JSON', () => {
    const brokenJson = 'Not a json response at all!';
    const fallback = parseMissionJson(brokenJson, 1);
    expect(fallback).toBeDefined();
    expect(fallback.text.length).toBeGreaterThan(5);
    expect(fallback.difficulty).toBe(1);
  });
});

describe('Verification Schema Parser', () => {
  it('parses successful verification with high confidence', () => {
    const raw = JSON.stringify({
      success: true,
      confidence: 0.94,
      detectedObject: 'metal railing',
      observation: 'Safety railing installed along a ramp.',
      explanation: 'Designed to protect pedestrians from falling.',
    });

    const result = parseVerificationJson(raw);
    expect(result.success).toBe(true);
    expect(result.confidence).toBe(0.94);
    expect(result.detectedObject).toBe('metal railing');
  });

  it('rejects low confidence verification (< 0.60)', () => {
    const raw = JSON.stringify({
      success: true,
      confidence: 0.45,
      detectedObject: 'uncertain object',
      observation: 'Blurry frame.',
      explanation: 'Might be an object.',
    });

    const result = parseVerificationJson(raw);
    expect(result.success).toBe(false);
  });
});

describe('Expedition State Management', () => {
  it('initializes new expedition with zero XP and empty mission list', () => {
    const exp = createExpedition();
    expect(exp.id).toMatch(/^exp_/);
    expect(exp.totalXP).toBe(0);
    expect(exp.missions).toHaveLength(0);
    expect(exp.startedAt).toBeGreaterThan(0);
  });

  it('progresses difficulty as missions are completed', () => {
    expect(calculateNextDifficulty(0)).toBe(1);
    expect(calculateNextDifficulty(1)).toBe(2);
    expect(calculateNextDifficulty(2)).toBe(2);
    expect(calculateNextDifficulty(3)).toBe(3);
  });

  it('records successful mission result and increments XP correctly', () => {
    const exp = createExpedition();
    const mission: Mission = {
      id: 'm1',
      text: 'Find something red.',
      category: 'color',
      difficulty: 1,
      verificationHint: 'Look for bright red objects.',
    };
    const verification: Verification = {
      success: true,
      confidence: 0.9,
      detectedObject: 'fire hydrant',
      observation: 'Red hydrant on grass.',
      explanation: 'Satisfies red requirement.',
    };

    const { updatedExpedition, xpEarned } = recordMissionResult(exp, mission, verification);

    expect(xpEarned).toBe(50);
    expect(updatedExpedition.totalXP).toBe(50);
    expect(updatedExpedition.missions).toHaveLength(1);
    expect(updatedExpedition.missions[0].mission.id).toBe('m1');
    expect(updatedExpedition.missions[0].verification.detectedObject).toBe('fire hydrant');
  });
});

describe('AI Provider Resolution Fallback', () => {
  it('falls back to FallbackProvider when Local and API keys are missing', () => {
    const manager = new AIProviderManager('');
    const active = manager.getActiveProvider();
    expect(active.id).toBe('fallback');
  });

  it('falls back gracefully on error without crashing', async () => {
    const manager = new AIProviderManager('test-key');
    // Even if remote network call throws, fallback responds
    const mission = await manager.generateMission({
      completedMissions: 0,
      totalXP: 0,
      difficulty: 1,
    });
    expect(mission).toBeDefined();
    expect(mission.text.length).toBeGreaterThan(0);
  });
});
