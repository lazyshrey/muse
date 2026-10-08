import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expedition } from '../types';

const STORAGE_KEYS = {
  CURRENT_EXPEDITION: '@muse_current_expedition',
  EXPEDITION_HISTORY: '@muse_expedition_history',
  LIFETIME_XP: '@muse_lifetime_xp',
  SETTINGS: '@muse_settings',
};

export type AppSettings = {
  preferredProvider: 'auto' | 'gemma-local' | 'gemma-api' | 'fallback';
  apiKey?: string;
  hasSeenOnboarding: boolean;
};

const DEFAULT_SETTINGS: AppSettings = {
  preferredProvider: 'auto',
  hasSeenOnboarding: false,
};

// In-memory cache fallback if AsyncStorage is unavailable in certain testing environments
const memoryStore: Record<string, string> = {};

async function getItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (err) {
    return memoryStore[key] ?? null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (err) {
    memoryStore[key] = value;
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    delete memoryStore[key];
  }
}

export async function saveCurrentExpedition(expedition: Expedition | null): Promise<void> {
  if (!expedition) {
    await removeItem(STORAGE_KEYS.CURRENT_EXPEDITION);
  } else {
    await setItem(STORAGE_KEYS.CURRENT_EXPEDITION, JSON.stringify(expedition));
  }
}

export async function loadCurrentExpedition(): Promise<Expedition | null> {
  const data = await getItem(STORAGE_KEYS.CURRENT_EXPEDITION);
  if (!data) return null;
  try {
    return JSON.parse(data) as Expedition;
  } catch {
    return null;
  }
}

export async function saveExpeditionToHistory(expedition: Expedition): Promise<void> {
  const history = await loadExpeditionHistory();
  const existingIdx = history.findIndex((h) => h.id === expedition.id);
  let updated: Expedition[];
  if (existingIdx >= 0) {
    updated = [...history];
    updated[existingIdx] = expedition;
  } else {
    updated = [expedition, ...history];
  }
  await setItem(STORAGE_KEYS.EXPEDITION_HISTORY, JSON.stringify(updated));

  // Update total lifetime XP
  const lifetimeXP = await loadLifetimeXP();
  await saveLifetimeXP(lifetimeXP + expedition.totalXP);
}

export async function loadExpeditionHistory(): Promise<Expedition[]> {
  const data = await getItem(STORAGE_KEYS.EXPEDITION_HISTORY);
  if (!data) return [];
  try {
    return JSON.parse(data) as Expedition[];
  } catch {
    return [];
  }
}

export async function saveLifetimeXP(xp: number): Promise<void> {
  await setItem(STORAGE_KEYS.LIFETIME_XP, String(xp));
}

export async function loadLifetimeXP(): Promise<number> {
  const val = await getItem(STORAGE_KEYS.LIFETIME_XP);
  if (!val) return 0;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export async function loadSettings(): Promise<AppSettings> {
  const data = await getItem(STORAGE_KEYS.SETTINGS);
  if (!data) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
