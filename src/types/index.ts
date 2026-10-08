export type MissionCategory =
  | 'object'
  | 'structure'
  | 'nature'
  | 'color'
  | 'shape'
  | 'reflection'
  | 'human-made'
  | 'environment';

export type MissionDifficulty = 1 | 2 | 3;

export type Mission = {
  id: string;
  text: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  verificationHint: string;
};

export type Verification = {
  success: boolean;
  confidence: number;
  detectedObject: string;
  observation: string;
  explanation: string;
};

export type GameContext = {
  previousMission?: Mission;
  previousDiscovery?: string;
  completedMissions: number;
  totalXP: number;
  difficulty: MissionDifficulty;
};

export type MissionResult = {
  mission: Mission;
  verification: Verification;
  completedAt: number;
  xpEarned: number;
  photoUri?: string;
};

export type Expedition = {
  id: string;
  startedAt: number;
  completedAt?: number;
  missions: MissionResult[];
  totalXP: number;
};

export interface AIProvider {
  readonly id: string;
  readonly name: string;
  readonly isAvailable: boolean;
  generateMission(context: GameContext): Promise<Mission>;
  verifyMission(imageBase64OrUri: string, mission: Mission): Promise<Verification>;
}
