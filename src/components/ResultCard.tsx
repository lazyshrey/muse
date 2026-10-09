import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Mission, Verification } from '../types';
import { THEME } from '../utils/theme';

interface ResultCardProps {
  mission: Mission;
  verification: Verification;
  xpEarned: number;
  photoUri?: string;
  onNextMission: () => void;
  onRetry: () => void;
  onPauseExpedition: () => void;
  onFinishExpedition: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  mission,
  verification,
  xpEarned,
  photoUri,
  onNextMission,
  onRetry,
  onPauseExpedition,
  onFinishExpedition,
}) => {
  const isSuccess = verification.success;
  const bounceAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.card}>
      {/* Success Celebration Trophy or Miss Banner */}
      {isSuccess ? (
        <View style={styles.trophyBanner}>
          <Image
            source={require('../../assets/victory_trophy.jpg')}
            style={styles.trophyImage}
            resizeMode="cover"
          />
          <View style={styles.bannerTag}>
            <Text style={styles.bannerTagText}>🎉 MISSION COMPLETE! 🎉</Text>
          </View>
        </View>
      ) : (
        <View style={styles.retryBanner}>
          <Text style={styles.retryEmoji}>🧐</Text>
          <Text style={styles.retryTitle}>Not Quite A Match!</Text>
          <Text style={styles.retrySub}>The AI spotted something else. Let's try again!</Text>
        </View>
      )}

      {/* Floating Animated XP Pop */}
      {isSuccess && (
        <Animated.View
          style={[
            styles.xpPopBadge,
            {
              transform: [{ scale: bounceAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.xpPopText}>⭐ +{xpEarned} XP AWARDED! ⭐</Text>
        </Animated.View>
      )}

      {/* Captured Photo */}
      {photoUri && (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
          <View style={styles.photoLabel}>
            <Text style={styles.photoLabelText}>Your Discovery</Text>
          </View>
        </View>
      )}

      {/* Discovery Details */}
      <View style={styles.detailsBox}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>WHAT AI SPOTTED</Text>
          <Text style={styles.detectedObject}>{verification.detectedObject}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {isSuccess ? 'WHY THIS WINS' : 'WHAT HAPPENED'}
          </Text>
          <Text style={styles.explanation}>{verification.explanation}</Text>
        </View>
      </View>

      {/* 3D Action Buttons */}
      <View style={styles.actionRow}>
        {isSuccess ? (
          <>
            <TouchableOpacity
              style={styles.nextQuestBtn}
              onPress={onNextMission}
              activeOpacity={0.85}
            >
              <Text style={styles.nextQuestText}>NEXT QUEST 🚀</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.summaryBtn}
              onPress={onPauseExpedition}
              activeOpacity={0.7}
            >
              <Text style={styles.summaryBtnText}>💾 Save Progress & Base Camp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.summaryBtn, { marginTop: -4 }]}
              onPress={onFinishExpedition}
              activeOpacity={0.7}
            >
              <Text style={[styles.summaryBtnText, { color: THEME.colors.textMuted }]}>
                End Expedition & View Report 🏆
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.tryAgainBtn}
              onPress={onRetry}
              activeOpacity={0.85}
            >
              <Text style={styles.tryAgainText}>📸 TRY ANOTHER SHOT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.summaryBtn}
              onPress={onPauseExpedition}
              activeOpacity={0.7}
            >
              <Text style={styles.summaryBtnText}>💾 Save Progress & Base Camp</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  trophyBanner: {
    alignItems: 'center',
    marginBottom: 16,
  },
  trophyImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: THEME.colors.secondary,
    marginBottom: 12,
  },
  bannerTag: {
    backgroundColor: '#302511',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: THEME.colors.secondary,
  },
  bannerTagText: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.colors.secondary,
    letterSpacing: 0.5,
  },
  retryBanner: {
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 16,
  },
  retryEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  retryTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  retrySub: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },
  xpPopBadge: {
    backgroundColor: THEME.colors.cyan,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 4,
    borderBottomColor: THEME.colors.cyanDark,
    shadowColor: THEME.colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  xpPopText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0c0e1a',
    letterSpacing: 0.5,
  },
  photoContainer: {
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: THEME.colors.borderHighlight,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  photoLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  detailsBox: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.borderHighlight,
    gap: 12,
    marginBottom: 22,
  },
  detailRow: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.colors.secondary,
    letterSpacing: 0.8,
  },
  detectedObject: {
    fontSize: 20,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  explanation: {
    fontSize: 13,
    lineHeight: 19,
    color: THEME.colors.textSecondary,
  },
  actionRow: {
    gap: 12,
  },
  nextQuestBtn: {
    backgroundColor: THEME.colors.cyan,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: THEME.colors.cyanDark,
    shadowColor: THEME.colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  nextQuestText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0c0e1a',
    letterSpacing: 0.8,
  },
  tryAgainBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: THEME.colors.primaryDark,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  tryAgainText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.8,
  },
  summaryBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  summaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
});
