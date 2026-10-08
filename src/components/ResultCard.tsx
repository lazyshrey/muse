import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Mission, Verification } from '../types';
import { THEME } from '../utils/theme';

interface ResultCardProps {
  mission: Mission;
  verification: Verification;
  xpEarned: number;
  photoUri?: string;
  onNextMission: () => void;
  onRetry: () => void;
  onFinishExpedition: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  mission,
  verification,
  xpEarned,
  photoUri,
  onNextMission,
  onRetry,
  onFinishExpedition,
}) => {
  const isSuccess = verification.success;

  return (
    <View style={styles.card}>
      {/* Header Badge */}
      <View style={styles.header}>
        <View
          style={[
            styles.statusBadge,
            isSuccess ? styles.statusBadgeSuccess : styles.statusBadgeFail,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isSuccess ? styles.statusDotSuccess : styles.statusDotFail,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isSuccess ? styles.statusTextSuccess : styles.statusTextFail,
            ]}
          >
            {isSuccess ? 'MISSION COMPLETE // VERIFIED' : 'CALIBRATION MISMATCH'}
          </Text>
        </View>

        {isSuccess && (
          <View style={styles.xpPill}>
            <Text style={styles.xpPillText}>+{xpEarned} XP</Text>
          </View>
        )}
      </View>

      {/* Captured Photo Thumbnail */}
      {photoUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: photoUri }} style={styles.thumbnail} resizeMode="cover" />
          <View style={styles.imageOverlay}>
            <Text style={styles.imageTag}>GEMMA 4 SCAN</Text>
          </View>
        </View>
      )}

      {/* Content Section */}
      <View style={styles.contentWrap}>
        <View style={styles.sectionBlock}>
          <Text style={styles.label}>AI DETECTED OBJECT</Text>
          <Text style={styles.detectedTitle}>{verification.detectedObject}</Text>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.label}>
            {isSuccess ? 'WHY IT COUNTS' : 'AI OBSERVATION'}
          </Text>
          <Text style={styles.explanationText}>{verification.explanation}</Text>
        </View>

        {/* Confidence metric */}
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>VERIFICATION CONFIDENCE</Text>
          <Text style={styles.metricValue}>
            {(verification.confidence * 100).toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        {isSuccess ? (
          <>
            <TouchableOpacity
              style={styles.primarySuccessBtn}
              onPress={onNextMission}
              activeOpacity={0.8}
            >
              <Text style={styles.primarySuccessBtnText}>NEXT MISSION ▶</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onFinishExpedition}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnText}>END EXPEDITION & REVIEW</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={onRetry}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>TRY AGAIN // RE-SCAN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onFinishExpedition}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnText}>ABORT EXPEDITION</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  statusBadgeSuccess: {
    backgroundColor: THEME.colors.accentMuted,
    borderColor: THEME.colors.accentBorder,
  },
  statusBadgeFail: {
    backgroundColor: THEME.colors.dangerMuted,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotSuccess: {
    backgroundColor: THEME.colors.accent,
  },
  statusDotFail: {
    backgroundColor: THEME.colors.danger,
  },
  statusText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statusTextSuccess: {
    color: THEME.colors.accentLight,
  },
  statusTextFail: {
    color: THEME.colors.danger,
  },
  xpPill: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.accentBorder,
  },
  xpPillText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.accentLight,
  },
  imageContainer: {
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageTag: {
    fontFamily: THEME.fonts.mono,
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.accentLight,
    letterSpacing: 0.5,
  },
  contentWrap: {
    gap: 16,
    marginBottom: 24,
  },
  sectionBlock: {
    gap: 4,
  },
  label: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
  },
  detectedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.3,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 22,
    color: THEME.colors.textSecondary,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  metricLabel: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  metricValue: {
    fontFamily: THEME.fonts.mono,
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.textSecondary,
  },
  actionRow: {
    gap: 12,
  },
  primarySuccessBtn: {
    backgroundColor: THEME.colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: THEME.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primarySuccessBtnText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 13,
    fontWeight: '900',
    color: '#09090b',
    letterSpacing: 1,
  },
  retryBtn: {
    backgroundColor: THEME.colors.warning,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  retryBtnText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 13,
    fontWeight: '900',
    color: '#09090b',
    letterSpacing: 1,
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
  },
});
