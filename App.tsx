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
  saveExpeditionToHistory,
  loadLifetimeXP,
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
  const [loadingMessage, setLoadingMessage] = useState('Generating mission...');
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
      setSettings(savedSettings);
      if (savedSettings.apiKey) {
        defaultAIProvider.setApiKey(savedSettings.apiKey);
      }
      defaultAIProvider.setPreferredMode(savedSettings.preferredProvider);

      const savedXp = await loadLifetimeXP();
      setLifetimeXP(savedXp);

      const savedExpedition = await loadCurrentExpedition();
      if (savedExpedition && !savedExpedition.completedAt) {
        setExpedition(savedExpedition);
      }
    }
    init();
  }, []);

  // Update AI provider settings
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (newSettings.apiKey) {
      defaultAIProvider.setApiKey(newSettings.apiKey);
    }
    defaultAIProvider.setPreferredMode(newSettings.preferredProvider);
  };

  // Start new expedition (FR-02)
  const handleStartExpedition = async () => {
    setIsLoading(true);
    setLoadingMessage('Gemma 4 is synthesizing your first challenge...');
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
      setScreen('MISSION');
    } catch (err) {
      console.warn('Failed to start expedition:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Resume active expedition if present
  const handleResumeExpedition = async () => {
    if (!expedition) return;
    setIsLoading(true);
    setLoadingMessage('Resuming expedition...');
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
      setScreen('MISSION');
    } catch (err) {
      console.warn('Failed to resume expedition:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Open camera viewfinder (FR-04)
  const handleOpenCamera = () => {
    setScreen('CAMERA');
  };

  // Process captured image and verify (FR-05)
  const handlePhotoCaptured = async (photoUri: string) => {
    if (!mission || !expedition) return;

    setScreen('ANALYZING');
    setLoadingMessage('Gemma 4 is inspecting discovery...');

    try {
      // Image preprocessing: resize & compress
      const processed = await processImageForAI(photoUri);
      const imagePayload = processed.base64 ? `data:image/jpeg;base64,${processed.base64}` : processed.uri;

      // Multimodal verification
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
      // Fallback verification if catastrophic error
      setVerificationResult({
        verification: {
          success: false,
          confidence: 0.3,
          detectedObject: 'Visual anomaly',
          observation: 'Unable to analyze image cleanly.',
          explanation: 'Please capture a steady, well-lit shot of your target.',
        },
        xpEarned: 0,
        photoUri,
      });
      setScreen('RESULT');
    }
  };

  // Next Mission after success (Dynamic Mission Chaining - FR-14)
  const handleNextMission = async () => {
    if (!expedition || !verificationResult) return;

    setIsLoading(true);
    setLoadingMessage('Synthesizing next chained mission...');
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
      setVerificationResult(null);
      setScreen('MISSION');
    } catch (err) {
      console.warn('Failed to generate next mission:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry failed mission
  const handleRetry = () => {
    setVerificationResult(null);
    setScreen('CAMERA');
  };

  // Finish expedition and view summary (FR-24)
  const handleFinishExpedition = async () => {
    if (!expedition) return;
    const finished = completeExpedition(expedition);
    setExpedition(finished);
    await saveExpeditionToHistory(finished);
    await saveCurrentExpedition(null);

    const updatedLifetime = await loadLifetimeXP();
    setLifetimeXP(updatedLifetime);

    setScreen('SUMMARY');
  };

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: THEME.colors.bg }}>
      <SafeAreaView style={styles.safeArea}>
        <ExpoStatusBar style="light" />

      {/* Screen: HOME (FR-01) */}
      {screen === 'HOME' && (
        <ScrollView contentContainerStyle={styles.homeContainer}>
          {/* Top Bar with Settings */}
          <View style={styles.homeTopBar}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>SYSTEM ONLINE</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsIconBtn}
              onPress={() => setIsSettingsOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.settingsIconText}>⚙ TELEMETRY</Text>
            </TouchableOpacity>
          </View>

          {/* Main Title Hero */}
          <View style={styles.heroSection}>
            <Text style={styles.heroPreTitle}>AI-POWERED REAL-WORLD EXPEDITION</Text>
            <Text style={styles.heroTitle}>MUSE</Text>
            <Text style={styles.tagline}>See the world differently.</Text>
            <Text style={styles.subTagline}>
              An AI that needs you to stop looking at it.
            </Text>
          </View>

          {/* Core Concept Banner */}
          <View style={styles.conceptCard}>
            <View style={styles.conceptBadge}>
              <Text style={styles.conceptBadgeText}>TOUCH GRASS // HACKTOBERFEST</Text>
            </View>
            <Text style={styles.conceptText}>
              The phone is not the game board. The physical campus is. Receive short observation challenges powered by Gemma 4, explore offline, and capture your discoveries.
            </Text>
          </View>

          {/* Lifetime XP Banner */}
          {lifetimeXP > 0 && (
            <View style={styles.lifetimeBox}>
              <Text style={styles.lifetimeLabel}>LIFETIME DISCOVERIES</Text>
              <Text style={styles.lifetimeXP}>+{lifetimeXP} XP</Text>
            </View>
          )}

          {/* CTA Buttons */}
          <View style={styles.homeActions}>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={handleStartExpedition}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#09090b" />
              ) : (
                <Text style={styles.startBtnText}>START EXPEDITION ▶</Text>
              )}
            </TouchableOpacity>

            {expedition && !expedition.completedAt && (
              <TouchableOpacity
                style={styles.resumeBtn}
                onPress={handleResumeExpedition}
                activeOpacity={0.7}
              >
                <Text style={styles.resumeBtnText}>
                  RESUME EXPEDITION ({expedition.missions.length} COMPLETED)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      {/* Screen: MISSION HUD (FR-03) */}
      {screen === 'MISSION' && mission && expedition && (
        <ScrollView contentContainerStyle={styles.missionContainer}>
          <XPDisplay
            totalXP={expedition.totalXP}
            missionNumber={expedition.missions.length + 1}
            difficulty={mission.difficulty}
          />
          <MissionCard
            mission={mission}
            onOpenCamera={handleOpenCamera}
            onEndExpedition={handleFinishExpedition}
            isGenerating={isLoading}
          />
        </ScrollView>
      )}

      {/* Screen: CAMERA (FR-04) */}
      {screen === 'CAMERA' && mission && (
        <CameraView
          missionPrompt={mission.text}
          onCapture={handlePhotoCaptured}
          onCancel={() => setScreen('MISSION')}
        />
      )}

      {/* Screen: ANALYZING OVERLAY (FR-05) */}
      {screen === 'ANALYZING' && (
        <View style={styles.analyzingContainer}>
          <View style={styles.analyzingBox}>
            <View style={styles.radarRing}>
              <ActivityIndicator color={THEME.colors.accent} size="large" />
            </View>
            <Text style={styles.analyzingTag}>GEMMA 4 // MULTIMODAL INFERENCE</Text>
            <Text style={styles.analyzingTitle}>Analyzing Discovery...</Text>
            <Text style={styles.analyzingSub}>
              Inspecting visual features, shadows, and semantic context.
            </Text>
          </View>
        </View>
      )}

      {/* Screen: RESULT (FR-12, FR-13) */}
      {screen === 'RESULT' && verificationResult && mission && (
        <ScrollView contentContainerStyle={styles.resultContainer}>
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
            onFinishExpedition={handleFinishExpedition}
          />
        </ScrollView>
      )}

      {/* Screen: EXPEDITION SUMMARY (FR-24) */}
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  homeContainer: {
    padding: 24,
    paddingTop: 36,
    paddingBottom: 48,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  homeTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.accent,
  },
  liveText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.accentLight,
    letterSpacing: 1,
  },
  settingsIconBtn: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  settingsIconText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    letterSpacing: 0.8,
  },
  heroSection: {
    marginBottom: 32,
  },
  heroPreTitle: {
    fontFamily: THEME.fonts.mono,
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.accentLight,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 54,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    letterSpacing: -2,
    lineHeight: 60,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subTagline: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
  },
  conceptCard: {
    backgroundColor: THEME.colors.surface,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 24,
  },
  conceptBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.colors.accentBorder,
    marginBottom: 10,
  },
  conceptBadgeText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.accentLight,
    letterSpacing: 0.8,
  },
  conceptText: {
    fontSize: 13,
    lineHeight: 20,
    color: THEME.colors.textSecondary,
  },
  lifetimeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 32,
  },
  lifetimeLabel: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  lifetimeXP: {
    fontFamily: THEME.fonts.mono,
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.accentLight,
  },
  homeActions: {
    gap: 12,
    marginTop: 20,
  },
  startBtn: {
    backgroundColor: THEME.colors.accent,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: THEME.colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  startBtnText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 14,
    fontWeight: '900',
    color: '#09090b',
    letterSpacing: 1,
  },
  resumeBtn: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  resumeBtnText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.accentLight,
    letterSpacing: 0.8,
  },
  missionContainer: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  resultContainer: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  analyzingContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  analyzingBox: {
    backgroundColor: THEME.colors.surface,
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
  },
  radarRing: {
    marginBottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.accentBorder,
  },
  analyzingTag: {
    fontFamily: THEME.fonts.mono,
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.accentLight,
    letterSpacing: 1,
    marginBottom: 8,
  },
  analyzingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  analyzingSub: {
    fontSize: 12,
    lineHeight: 18,
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },
});
