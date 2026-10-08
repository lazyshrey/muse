import { GameContext, Mission, MissionCategory, MissionDifficulty } from '../types';

export const SEED_MISSIONS: Mission[] = [
  {
    id: 'seed_01',
    text: 'Find something that protects people.',
    category: 'structure',
    difficulty: 2,
    verificationHint: 'Look for railings, canopies, crosswalks, or safety shields.',
  },
  {
    id: 'seed_02',
    text: 'Find something that reflects the world without being a mirror.',
    category: 'reflection',
    difficulty: 2,
    verificationHint: 'Look for clean windows, still water, polished chrome, or sunglasses.',
  },
  {
    id: 'seed_03',
    text: 'Find something that was designed to make people stop.',
    category: 'human-made',
    difficulty: 1,
    verificationHint: 'Look for stop signs, bollards, barricades, red lights, or closed gates.',
  },
  {
    id: 'seed_04',
    text: 'Find something made of metal that is anchored to the ground.',
    category: 'object',
    difficulty: 1,
    verificationHint: 'Look for lamp posts, bike racks, benches, or manhole covers.',
  },
  {
    id: 'seed_05',
    text: 'Find something older than you.',
    category: 'nature',
    difficulty: 3,
    verificationHint: 'Look for a mature trunked tree, historic brickwork, or carved stone monument.',
  },
  {
    id: 'seed_06',
    text: 'Find something created by humans that mimics nature.',
    category: 'human-made',
    difficulty: 3,
    verificationHint: 'Look for architectural leaf patterns, faux wood textures, or bio-inspired structural curves.',
  },
  {
    id: 'seed_07',
    text: 'Find something that moves people without moving itself.',
    category: 'structure',
    difficulty: 2,
    verificationHint: 'Look for a staircase, pedestrian ramp, bridge, or pathway.',
  },
  {
    id: 'seed_08',
    text: 'Find something that casts an interesting geometric shadow.',
    category: 'environment',
    difficulty: 2,
    verificationHint: 'Look for railings, grates, pergolas, or window mullions under direct light.',
  },
  {
    id: 'seed_09',
    text: 'Find something bright red in an otherwise neutral space.',
    category: 'color',
    difficulty: 1,
    verificationHint: 'Look for fire equipment, signage, backpacks, or emergency buttons.',
  },
  {
    id: 'seed_10',
    text: 'Find a circular object at least as wide as your hand.',
    category: 'shape',
    difficulty: 1,
    verificationHint: 'Look for clock faces, manhole covers, logos, wheels, or architectural medallions.',
  },
];

/**
 * Validates that an object conforms to the Mission schema.
 */
export function isValidMission(candidate: any): candidate is Mission {
  if (!candidate || typeof candidate !== 'object') return false;
  if (typeof candidate.id !== 'string' || candidate.id.trim() === '') return false;
  if (typeof candidate.text !== 'string' || candidate.text.trim().length < 5) return false;
  if (![1, 2, 3].includes(candidate.difficulty)) return false;

  const validCategories: MissionCategory[] = [
    'object',
    'structure',
    'nature',
    'color',
    'shape',
    'reflection',
    'human-made',
    'environment',
  ];
  if (!validCategories.includes(candidate.category)) return false;
  if (typeof candidate.verificationHint !== 'string' || candidate.verificationHint.trim() === '') {
    return false;
  }
  return true;
}

/**
 * Parses raw JSON string into a valid Mission, returning fallback if invalid.
 */
export function parseMissionJson(rawJson: string, fallbackDifficulty: MissionDifficulty = 1): Mission {
  try {
    // Strip markdown fences if present
    const cleaned = rawJson
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    const candidate: Mission = {
      id: parsed.id || `mission_${Date.now()}`,
      text: parsed.text || '',
      category: parsed.category || 'object',
      difficulty: parsed.difficulty === 1 || parsed.difficulty === 2 || parsed.difficulty === 3 ? parsed.difficulty : fallbackDifficulty,
      verificationHint: parsed.verificationHint || 'Look around your immediate environment carefully.',
    };

    if (isValidMission(candidate)) {
      return candidate;
    }
  } catch (err) {
    // Parsing error handled by returning fallback
  }

  return generateChainedSeedMission({
    completedMissions: 0,
    totalXP: 0,
    difficulty: fallbackDifficulty,
  });
}

/**
 * Generates a contextual seed mission chained from the previous discovery.
 */
export function generateChainedSeedMission(context: GameContext): Mission {
  const { previousDiscovery, difficulty, completedMissions } = context;

  // Filter seed missions by target difficulty if possible
  const pool = SEED_MISSIONS.filter((m) => m.difficulty === difficulty);
  const candidatePool = pool.length > 0 ? pool : SEED_MISSIONS;

  // If there's a previous discovery, create an adaptive mission link
  if (previousDiscovery) {
    const discoveryLower = previousDiscovery.toLowerCase();
    if (discoveryLower.includes('tree') || discoveryLower.includes('plant') || discoveryLower.includes('nature')) {
      return {
        id: `m_${Date.now()}_chain`,
        text: 'Find something human-made that frames this natural element.',
        category: 'structure',
        difficulty,
        verificationHint: 'Look for pathways, stone borders, planter boxes, or windows looking out onto foliage.',
      };
    }
    if (discoveryLower.includes('railing') || discoveryLower.includes('metal') || discoveryLower.includes('fence')) {
      return {
        id: `m_${Date.now()}_chain`,
        text: 'Find something nearby that reflects light or casts a sharp shadow.',
        category: 'reflection',
        difficulty,
        verificationHint: 'Look for window panes, polished metal surfaces, or shadow patterns on the ground.',
      };
    }
    if (discoveryLower.includes('window') || discoveryLower.includes('glass') || discoveryLower.includes('reflection')) {
      return {
        id: `m_${Date.now()}_chain`,
        text: 'Find something designed to be entered or passed through.',
        category: 'structure',
        difficulty,
        verificationHint: 'Look for doorways, archways, corridors, or turnstiles.',
      };
    }
    if (discoveryLower.includes('sign') || discoveryLower.includes('text') || discoveryLower.includes('writing')) {
      return {
        id: `m_${Date.now()}_chain`,
        text: 'Find an object whose function is obvious without any written label.',
        category: 'human-made',
        difficulty,
        verificationHint: 'Look for benches, stairs, trash receptacles, or door handles.',
      };
    }
  }

  // Deterministic but rotating pick
  const index = completedMissions % candidatePool.length;
  const picked = candidatePool[index];
  return {
    ...picked,
    id: `m_${Date.now()}_${index}`,
    difficulty,
  };
}
