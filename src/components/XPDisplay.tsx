import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
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
}) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // Small celebratory bounce whenever XP changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.15,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [totalXP]);

  const difficultyStars = '⭐'.repeat(difficulty);

  return (
    <View style={styles.container}>
      {/* Quest badge */}
      <View style={styles.questPill}>
        <Text style={styles.questIcon}>🎯</Text>
        <Text style={styles.questText}>Quest #{missionNumber}</Text>
      </View>

      {/* Difficulty badge */}
      <View style={styles.difficultyPill}>
        <Text style={styles.difficultyStars}>{difficultyStars}</Text>
      </View>

      {/* Animated XP badge */}
      <Animated.View
        style={[
          styles.xpPill,
          { transform: [{ scale: bounceAnim }] },
        ]}
      >
        <Text style={styles.xpCoin}>🪙</Text>
        <Text style={styles.xpText}>{totalXP} XP</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: THEME.colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  questPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.borderHighlight,
  },
  questIcon: {
    fontSize: 14,
  },
  questText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  difficultyPill: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },
  difficultyStars: {
    fontSize: 12,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#302611',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: THEME.colors.secondary,
  },
  xpCoin: {
    fontSize: 14,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '900',
    color: THEME.colors.secondary,
  },
});
