import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mission } from '../types';
import { THEME } from '../utils/theme';

interface MissionCardProps {
  mission: Mission;
  onOpenCamera: () => void;
  onPauseExpedition: () => void;
  onFinishExpedition?: () => void;
  isGenerating?: boolean;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onOpenCamera,
  onPauseExpedition,
  onFinishExpedition,
  isGenerating = false,
}) => {
  const [showHint, setShowHint] = useState(false);

  const categoryMeta: Record<string, { label: string; icon: string; color: string }> = {
    object: { label: 'Scavenger Hunt', icon: '🎒', color: THEME.colors.primary },
    structure: { label: 'Architecture & Places', icon: '🏛️', color: THEME.colors.blue },
    nature: { label: 'Nature & Wildlife', icon: '🌿', color: THEME.colors.cyan },
    color: { label: 'Color Hunt', icon: '🎨', color: '#ff70a6' },
    shape: { label: 'Shape Spotter', icon: '📐', color: THEME.colors.purple },
    reflection: { label: 'Specular Magic', icon: '✨', color: THEME.colors.secondary },
    'human-made': { label: 'Human Craft', icon: '🛠️', color: THEME.colors.primary },
    environment: { label: 'Outdoor World', icon: '🏞️', color: THEME.colors.cyan },
  };

  const meta = categoryMeta[mission.category] || {
    label: 'Secret Mission',
    icon: '🔮',
    color: THEME.colors.secondary,
  };

  return (
    <View style={styles.card}>
      {/* Playful Top Badge */}
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: meta.color + '25', borderColor: meta.color }]}>
          <Text style={styles.badgeIcon}>{meta.icon}</Text>
          <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>

        <View style={styles.difficultyTag}>
          <Text style={styles.difficultyText}>Level {mission.difficulty}</Text>
        </View>
      </View>

      {/* Main Mission Text */}
      <View style={styles.textContainer}>
        <Text style={styles.questLabel}>YOUR ACTIVE QUEST</Text>
        <Text style={styles.missionText}>{mission.text}</Text>
      </View>

      {/* Touch Grass Field Reminder */}
      <View style={styles.touchGrassBox}>
        <Text style={styles.touchGrassIcon}>🌱</Text>
        <View style={styles.touchGrassContent}>
          <Text style={styles.touchGrassTitle}>Real-World Objective</Text>
          <Text style={styles.touchGrassDesc}>
            Pocket your phone and wander around! Return once you find a match in the wild.
          </Text>
        </View>
      </View>

      {/* Playful Hint Accordion */}
      <TouchableOpacity
        style={styles.hintButton}
        onPress={() => setShowHint(!showHint)}
        activeOpacity={0.7}
      >
        <Text style={styles.hintButtonText}>
          {showHint ? '🙈 Hide Explorer Hint' : '💡 Need an Explorer Hint?'}
        </Text>
      </TouchableOpacity>

      {showHint && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>{mission.verificationHint}</Text>
        </View>
      )}

      {/* 3D Tactile Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.snapButton}
          onPress={onOpenCamera}
          disabled={isGenerating}
          activeOpacity={0.85}
        >
          <Text style={styles.snapButtonText}>📸 SNAP PHOTO & VERIFY</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={onPauseExpedition}
            activeOpacity={0.7}
          >
            <Text style={styles.pauseButtonText}>💾 Pause & Save Progress</Text>
          </TouchableOpacity>

          {onFinishExpedition && (
            <TouchableOpacity
              style={styles.finishButton}
              onPress={onFinishExpedition}
              activeOpacity={0.7}
            >
              <Text style={styles.finishButtonText}>🏁 Complete Hunt</Text>
            </TouchableOpacity>
          )}
        </View>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  badgeIcon: {
    fontSize: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  difficultyTag: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  textContainer: {
    marginBottom: 20,
  },
  questLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: THEME.colors.secondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  missionText: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
  },
  touchGrassBox: {
    flexDirection: 'row',
    backgroundColor: '#122521',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: THEME.colors.cyan + '40',
    padding: 14,
    marginBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  touchGrassIcon: {
    fontSize: 24,
  },
  touchGrassContent: {
    flex: 1,
  },
  touchGrassTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.cyan,
    marginBottom: 2,
  },
  touchGrassDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: THEME.colors.textSecondary,
  },
  hintButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 6,
  },
  hintButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.secondary,
  },
  hintContainer: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.borderHighlight,
    marginBottom: 16,
  },
  hintText: {
    fontSize: 13,
    lineHeight: 19,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
  },
  actions: {
    gap: 12,
    marginTop: 10,
  },
  snapButton: {
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
  snapButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.8,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  pauseButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  pauseButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.secondary,
  },
  finishButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  finishButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
});
