import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Platform,
  Image,
  ImageBackground,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import { Expedition, Mission, Verification } from './src/types';
import {
  createExpedition,
  recordMissionResult,
  completeExpedition,
  calculateNextDifficulty,
} from './src/game/expedition';
import { defaultAIProvider } from './src/ai/AIProvider';
import {
  saveCurrentExpedition,
  loadCurrentExpedition,
  saveCurrentMission,
  loadCurrentMission,
  saveExpeditionToHistory,
  loadExpeditionHistory,
  loadLifetimeXP,
  addLifetimeXP,
  loadSettings,
  AppSettings,
} from './src/storage/storage';
import { processImageForAI } from './src/utils/imageProcessing';
import { THEME } from './src/utils/theme';

import { XPDisplay } from './src/components/XPDisplay';
import { MissionCard } from './src/components/MissionCard';
import { CameraView } from './src/components/CameraView';
import { ResultCard } from './src/components/ResultCard';
import { ExpeditionSummary } from './src/components/ExpeditionSummary';
import { SettingsModal } from './src/components/SettingsModal';

type ScreenState = 'HOME' | 'MISSION' | 'CAMERA' | 'ANALYZING' | 'RESULT' | 'SUMMARY';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('HOME');
  const [expedition, setExpedition] = useState<Expedition | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    verification: Verification;
    xpEarned: number;
    photoUri?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Generating quest...');
  const [lifetimeXP, setLifetimeXP] = useState(0);
  const [settings, setSettings] = useState<AppSettings>({
    preferredProvider: 'auto',
    hasSeenOnboarding: false,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize and load saved state
  useEffect(() => {
    async function init() {
      const savedSettings = await loadSettings();
      const envKey = process.env.EXPO_PUBLIC_GEMMA_API_KEY || '';
      const initialKey = savedSettings.apiKey || envKey;
      if (initialKey) {
        defaultAIProvider.setApiKey(initialKey);
        savedSettings.apiKey = initialKey;
      }
      setSettings(savedSettings);
      defaultAIProvider.setPreferredMode(savedSettings.preferredProvider);

      const savedXp = await loadLifetimeXP();
      setLifetimeXP(savedXp);

      const savedExpedition = await loadCurrentExpedition();
      if (savedExpedition && !savedExpedition.completedAt) {
        setExpedition(savedExpedition);
        const savedMission = await loadCurrentMission();
        if (savedMission) {
          setMission(savedMission);
        }
      }
    }
    init();
  }, []);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (newSettings.apiKey) {
      defaultAIProvider.setApiKey(newSettings.apiKey);
    }
    defaultAIProvider.setPreferredMode(newSettings.preferredProvider);
  };

  const startFreshExpedition = async () => {
    setIsLoading(true);
    setLoadingMessage('Gemma is crafting your first challenge...');
    try {
      const newExp = createExpedition();
      setExpedition(newExp);
      await saveCurrentExpedition(newExp);

      const firstMission = await defaultAIProvider.generateMission({
        completedMissions: 0,
        totalXP: 0,
        difficulty: 1,
      });

      setMission(firstMission);
      await saveCurrentMission(firstMission);
      setVerificationResult(null);
      setScreen('MISSION');
    } catch (err) {
      console.warn('Failed to start expedition:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartExpedition = async () => {
    // If there is an active expedition with progress, confirm before overwriting
    if (expedition && !expedition.completedAt && expedition.missions.length > 0) {
      Alert.alert(
        'Active Hunt in Progress',
        `You currently have a hunt underway with ${expedition.missions.length} discovery${
          expedition.missions.length > 1 ? 'ies' : ''
        } and ${expedition.totalXP} XP. Starting a new hunt will archive this run to your history.`,
        [
          { text: 'Keep Active Hunt', style: 'cancel' },
          {
            text: 'Save & Start New',
            style: 'destructive',
            onPress: async () => {
              const finished = completeExpedition(expedition);
              await saveExpeditionToHistory(finished);
              const updatedLifetime = await loadLifetimeXP();
              setLifetimeXP(updatedLifetime);
              await startFreshExpedition();
            },
          },
        ]
      );
      return;
    }

    await startFreshExpedition();
  };

  const handleResumeExpedition = async () => {
    if (!expedition) return;

    // Fast-path: If mission already in state or storage, resume instantly without waiting!
    let activeMission = mission;
    if (!activeMission) {
      activeMission = await loadCurrentMission();
    }

    if (activeMission) {
      setMission(activeMission);
      setVerificationResult(null);
      setScreen('MISSION');
      return;
    }

    // Otherwise generate the next chained mission
    setIsLoading(true);
    setLoadingMessage('Resuming your outdoor hunt...');
    try {
      const diff = calculateNextDifficulty(expedition.missions.length);
      const prevDiscovery =
        expedition.missions.length > 0
          ? expedition.missions[expedition.missions.length - 1].verification.detectedObject
          : undefined;

      const nextMission = await defaultAIProvider.generateMission({
        completedMissions: expedition.missions.length,
        totalXP: expedition.totalXP,
        difficulty: diff,
        previousDiscovery: prevDiscovery,
      });

      setMission(nextMission);
      await saveCurrentMission(nextMission);
      setVerificationResult(null);
      setScreen('MISSION');
    } catch (err) {
      console.warn('Failed to resume expedition:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseAndSave = async () => {
    if (expedition) {
      await saveCurrentExpedition(expedition);
    }
    if (mission) {
      await saveCurrentMission(mission);
    }
    const xp = await loadLifetimeXP();
    setLifetimeXP(xp);
    setVerificationResult(null);
    setScreen('HOME');
  };

  const handleOpenCamera = () => {
    setScreen('CAMERA');
  };

  const handlePhotoCaptured = async (photoUri: string) => {
    if (!mission || !expedition) return;

    setScreen('ANALYZING');
    setLoadingMessage('Gemma is checking your target photo...');

    try {
      const processed = await processImageForAI(photoUri);
      const imagePayload = processed.base64 ? `data:image/jpeg;base64,${processed.base64}` : processed.uri;

      const verification = await defaultAIProvider.verifyMission(imagePayload, mission);

      if (verification.success) {
        const { updatedExpedition, xpEarned } = recordMissionResult(
          expedition,
          mission,
          verification,
          photoUri
        );
        setExpedition(updatedExpedition);
        await saveCurrentExpedition(updatedExpedition);
        const newLifetime = await addLifetimeXP(xpEarned);
        setLifetimeXP(newLifetime);

        setVerificationResult({
          verification,
          xpEarned,
          photoUri,
        });
      } else {
        setVerificationResult({
          verification,
          xpEarned: 0,
          photoUri,
        });
      }

      setScreen('RESULT');
    } catch (err) {
      console.warn('Verification error:', err);
      setVerificationResult({
        verification: {
          success: false,
          confidence: 0.3,
          detectedObject: 'Visual blur',
          observation: 'Unable to analyze image cleanly.',
          explanation: 'Try capturing a steady, bright photo of your target.',
        },
        xpEarned: 0,
        photoUri,
      });
      setScreen('RESULT');
    }
  };

  const handleNextMission = async () => {
    if (!expedition || !verificationResult) return;

    setIsLoading(true);
    setLoadingMessage('Crafting next chained outdoor mission...');
    try {
      const nextDiff = calculateNextDifficulty(expedition.missions.length);
      const nextMission = await defaultAIProvider.generateMission({
        previousMission: mission || undefined,
        previousDiscovery: verificationResult.verification.detectedObject,
        completedMissions: expedition.missions.length,
        totalXP: expedition.totalXP,
        difficulty: nextDiff,
      });

      setMission(nextMission);
      await saveCurrentMission(nextMission);
      setVerificationResult(null);
      setScreen('MISSION');
    } catch (err) {
      console.warn('Failed to generate next mission:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setVerificationResult(null);
    setScreen('CAMERA');
  };

  const handleFinishExpedition = async () => {
    if (!expedition) return;
    const finished = completeExpedition(expedition);
    setExpedition(finished);
    await saveExpeditionToHistory(finished);
    await saveCurrentExpedition(null);
    await saveCurrentMission(null);

    const updatedLifetime = await loadLifetimeXP();
    setLifetimeXP(updatedLifetime);

    setScreen('SUMMARY');
  };

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: THEME.colors.bg }}>
      <SafeAreaView
        style={styles.safeArea}
        edges={screen === 'CAMERA' ? [] : ['top', 'left', 'right']}
      >
        <ExpoStatusBar style="light" />

        {/* SCREEN: HOME / WELCOME */}
        {screen === 'HOME' && (
          <View style={styles.homeWrapper}>
            <Image
              source={require('./assets/home_bg.jpg')}
              style={styles.homeBgImage}
              resizeMode="cover"
            />

            <ScrollView contentContainerStyle={styles.homeContainer} showsVerticalScrollIndicator={false}>
              {/* Top Bar */}
              <View style={styles.homeTopBar}>
                <View style={styles.logoTag}>
                  <Text style={styles.logoEmoji}>✦</Text>
                  <Text style={styles.logoText}>M U S E</Text>
                </View>

                <View style={styles.topBarRight}>
                  {lifetimeXP > 0 && (
                    <View style={styles.topScorePill}>
                      <Text style={styles.topScoreEmoji}>🏆</Text>
                      <Text style={styles.topScoreText}>{lifetimeXP} XP</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.settingsBtn}
                    onPress={() => setIsSettingsOpen(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.settingsIcon}>⚙️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Cinematic Center Hero (Clean, cardless, matching anime exploration theme) */}
              <View style={styles.cinematicHero}>
                <View style={styles.starSymbolRing}>
                  <Text style={styles.starSymbol}>✦</Text>
                </View>
                <Text style={styles.cinematicTitle}>M  U  S  E</Text>
                <Text style={styles.cinematicTagline}>SEE THE WORLD DIFFERENTLY.</Text>
                <Text style={styles.cinematicSubtitle}>
                  Put your phone away. Step outside. Seek the hidden details of reality.
                </Text>
              </View>

              {/* Action Section: Ivory Pill Button + Subtle Status */}
              {expedition && !expedition.completedAt ? (
                <View style={styles.actionContainer}>
                  <View style={styles.activeQuestNotice}>
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>
                        QUEST #{expedition.missions.length + 1} IN PROGRESS
                      </Text>
                    </View>
                    <Text style={styles.activeQuestSub}>
                      {expedition.missions.length === 0
                        ? 'Trail initiated · Ready for target'
                        : `${expedition.missions.length} discovery${
                            expedition.missions.length > 1 ? 'ies' : ''
                          } · +${expedition.totalXP} XP logged`}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.ivoryPillBtn}
                    onPress={handleResumeExpedition}
                    disabled={isLoading}
                    activeOpacity={0.88}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={THEME.colors.ivoryText} />
                    ) : (
                      <Text style={styles.ivoryPillBtnText}>RESUME QUEST ➔</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.freshTrailLink}
                    onPress={handleStartExpedition}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.freshTrailLinkText}>Start fresh trail 🔄</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.actionContainer}>
                  <TouchableOpacity
                    style={styles.ivoryPillBtn}
                    onPress={handleStartExpedition}
                    disabled={isLoading}
                    activeOpacity={0.88}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={THEME.colors.ivoryText} />
                    ) : (
                      <Text style={styles.ivoryPillBtnText}>START EXPLORING ➔</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* SCREEN: MISSION HUD */}
        {screen === 'MISSION' && mission && expedition && (
          <ScrollView contentContainerStyle={styles.missionContainer} showsVerticalScrollIndicator={false}>
            <XPDisplay
              totalXP={expedition.totalXP}
              missionNumber={expedition.missions.length + 1}
              difficulty={mission.difficulty}
            />
            <MissionCard
              mission={mission}
              onOpenCamera={handleOpenCamera}
              onPauseExpedition={handlePauseAndSave}
              onFinishExpedition={handleFinishExpedition}
              isGenerating={isLoading}
            />
          </ScrollView>
        )}

        {/* SCREEN: CAMERA */}
        {screen === 'CAMERA' && mission && (
          <CameraView
            missionPrompt={mission.text}
            onCapture={handlePhotoCaptured}
            onCancel={() => setScreen('MISSION')}
          />
        )}

        {/* SCREEN: ANALYZING OVERLAY */}
        {screen === 'ANALYZING' && (
          <View style={styles.analyzingContainer}>
            <View style={styles.analyzingCard}>
              <View style={styles.magnifierCircle}>
                <Text style={styles.magnifierEmoji}>🔍</Text>
              </View>
              <Text style={styles.analyzingTitle}>Gemma is Inspecting...</Text>
              <Text style={styles.analyzingSub}>
                Examining your photo to verify your real-world discovery!
              </Text>
              <ActivityIndicator color={THEME.colors.primary} style={{ marginTop: 16 }} size="large" />
            </View>
          </View>
        )}

        {/* SCREEN: RESULT */}
        {screen === 'RESULT' && verificationResult && mission && (
          <ScrollView contentContainerStyle={styles.resultContainer} showsVerticalScrollIndicator={false}>
            {expedition && (
              <XPDisplay
                totalXP={expedition.totalXP}
                missionNumber={expedition.missions.length}
                difficulty={mission.difficulty}
              />
            )}
            <ResultCard
              mission={mission}
              verification={verificationResult.verification}
              xpEarned={verificationResult.xpEarned}
              photoUri={verificationResult.photoUri}
              onNextMission={handleNextMission}
              onRetry={handleRetry}
              onPauseExpedition={handlePauseAndSave}
              onFinishExpedition={handleFinishExpedition}
            />
          </ScrollView>
        )}

        {/* SCREEN: EXPEDITION SUMMARY */}
        {screen === 'SUMMARY' && expedition && (
          <ExpeditionSummary
            expedition={expedition}
            onStartNewExpedition={handleStartExpedition}
            onGoHome={() => setScreen('HOME')}
          />
        )}

        {/* Settings Modal */}
        <SettingsModal
          visible={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          lifetimeXP={lifetimeXP}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  homeWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: THEME.colors.bg,
  },
  homeBgImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    opacity: 0.45,
  },
  homeContainer: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 44,
    flexGrow: 1,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  homeTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoEmoji: {
    fontSize: 16,
    color: THEME.colors.secondary,
  },
  logoText: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: 3,
  },
  settingsBtn: {
    backgroundColor: THEME.colors.surfaceCard,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  settingsIcon: {
    fontSize: 16,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 190, 108, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 190, 108, 0.35)',
  },
  topScoreEmoji: {
    fontSize: 12,
  },
  topScoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.secondary,
    letterSpacing: 0.5,
  },
  cinematicHero: {
    alignItems: 'center',
    marginVertical: 40,
  },
  starSymbolRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 190, 108, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(22, 40, 64, 0.5)',
  },
  starSymbol: {
    fontSize: 32,
    color: THEME.colors.textPrimary,
  },
  cinematicTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    letterSpacing: 8,
    marginBottom: 10,
    textAlign: 'center',
  },
  cinematicTagline: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.secondary,
    letterSpacing: 3,
    marginBottom: 14,
    textAlign: 'center',
  },
  cinematicSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 290,
  },
  actionContainer: {
    gap: 14,
    width: '100%',
    marginTop: 'auto',
  },
  activeQuestNotice: {
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  activeBadge: {
    backgroundColor: 'rgba(245, 190, 108, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 190, 108, 0.4)',
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.secondary,
    letterSpacing: 1,
  },
  activeQuestSub: {
    fontSize: 13,
    color: THEME.colors.textMuted,
  },
  ivoryPillBtn: {
    backgroundColor: THEME.colors.ivory,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ivoryPillBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.ivoryText,
    letterSpacing: 2,
  },
  freshTrailLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  freshTrailLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  missionContainer: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  resultContainer: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  analyzingContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  analyzingCard: {
    backgroundColor: THEME.colors.surfaceCard,
    padding: 32,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  magnifierCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: THEME.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },
  magnifierEmoji: {
    fontSize: 32,
  },
  analyzingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  analyzingSub: {
    fontSize: 13,
    lineHeight: 18,
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },
});
