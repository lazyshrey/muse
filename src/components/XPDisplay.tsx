import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../utils/theme';

interface XPDisplayProps {
  totalXP: number;
  missionNumber: number;
  difficulty: number;
  providerName?: string;
}

export const XPDisplay: React.FC<XPDisplayProps> = ({
  totalXP,
  missionNumber,
  difficulty,
  providerName = 'GEMMA 4',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <View style={styles.radarDot} />
        <Text style={styles.missionText}>
          EXPEDITION // M-{missionNumber.toString().padStart(2, '0')}
        </Text>
      </View>

      <View style={styles.rightGroup}>
        <View style={styles.diffBadge}>
          <Text style={styles.diffText}>LVL {difficulty}</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{totalXP} XP</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.accent,
  },
  missionText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  diffText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  xpBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: THEME.colors.accentMuted,
    borderWidth: 1,
    borderColor: THEME.colors.accentBorder,
  },
  xpText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.accentLight,
  },
});
