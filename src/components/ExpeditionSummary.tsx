import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Expedition } from '../types';
import { THEME } from '../utils/theme';

interface ExpeditionSummaryProps {
  expedition: Expedition;
  onStartNewExpedition: () => void;
  onGoHome: () => void;
}

export const ExpeditionSummary: React.FC<ExpeditionSummaryProps> = ({
  expedition,
  onStartNewExpedition,
  onGoHome,
}) => {
  const discoveriesCount = expedition.missions.length;
  const durationMinutes = Math.max(
    1,
    Math.round(((expedition.completedAt || Date.now()) - expedition.startedAt) / 60000)
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Trophy & Celebration Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/victory_trophy.jpg')}
          style={styles.trophyIcon}
          resizeMode="cover"
        />
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>EXPEDITION VICTORY</Text>
        </View>
        <Text style={styles.title}>Quest Report</Text>
        <Text style={styles.subtitle}>
          You touched grass, explored the real world, and brought back discoveries!
        </Text>
      </View>

      {/* Chunky Colorful Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderColor: THEME.colors.primary }]}>
          <Text style={styles.statEmoji}>🔍</Text>
          <Text style={styles.statNumber}>{discoveriesCount}</Text>
          <Text style={styles.statLabel}>SPOTTED</Text>
        </View>

        <View style={[styles.statCard, { borderColor: THEME.colors.secondary }]}>
          <Text style={styles.statEmoji}>🪙</Text>
          <Text style={[styles.statNumber, { color: THEME.colors.secondary }]}>
            +{expedition.totalXP}
          </Text>
          <Text style={styles.statLabel}>XP EARNED</Text>
        </View>

        <View style={[styles.statCard, { borderColor: THEME.colors.cyan }]}>
          <Text style={styles.statEmoji}>⏱️</Text>
          <Text style={styles.statNumber}>{durationMinutes}m</Text>
          <Text style={styles.statLabel}>OUTDOORS</Text>
        </View>
      </View>

      {/* Discovery Chain Sequence */}
      {discoveriesCount > 0 && (
        <View style={styles.chainBox}>
          <Text style={styles.sectionTitle}>🗺️ YOUR DISCOVERY TRAIL</Text>
          <View style={styles.chainTrail}>
            {expedition.missions.map((m, idx) => (
              <React.Fragment key={m.mission.id + idx}>
                <View style={styles.chainNode}>
                  <View style={styles.nodeIcon}>
                    <Text style={styles.nodeNumber}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.nodeText} numberOfLines={1}>
                    {m.verification.detectedObject}
                  </Text>
                </View>
                {idx < expedition.missions.length - 1 && (
                  <Text style={styles.chainArrow}>➔</Text>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      )}

      {/* Discoveries Detailed Cards */}
      <View style={styles.logSection}>
        <Text style={styles.sectionTitle}>📸 DISCOVERY LOGBOOK</Text>
        {expedition.missions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No discoveries recorded in this run.</Text>
          </View>
        ) : (
          expedition.missions.map((item, index) => (
            <View key={item.mission.id + index} style={styles.itemCard}>
              {item.photoUri && (
                <Image source={{ uri: item.photoUri }} style={styles.itemImage} resizeMode="cover" />
              )}
              <View style={styles.itemContent}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemTitle}>{item.verification.detectedObject}</Text>
                  <View style={styles.itemXpTag}>
                    <Text style={styles.itemXpText}>+{item.xpEarned} XP</Text>
                  </View>
                </View>
                <Text style={styles.itemMissionText}>“{item.mission.text}”</Text>
                <Text style={styles.itemExplanation}>{item.verification.explanation}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* 3D Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.playAgainBtn}
          onPress={onStartNewExpedition}
          activeOpacity={0.85}
        >
          <Text style={styles.playAgainText}>START NEW EXPEDITION 🚀</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeBtn} onPress={onGoHome} activeOpacity={0.7}>
          <Text style={styles.homeBtnText}>Return to Base Camp</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  content: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  trophyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: THEME.colors.secondary,
    marginBottom: 12,
  },
  badgePill: {
    backgroundColor: '#302511',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: THEME.colors.secondary,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: THEME.colors.secondary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceCard,
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  chainBox: {
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: THEME.colors.secondary,
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  chainTrail: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  chainNode: {
    alignItems: 'center',
    gap: 4,
    maxWidth: 90,
  },
  nodeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: THEME.colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.colors.cyan,
  },
  nodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  chainArrow: {
    fontSize: 16,
    color: THEME.colors.secondary,
    fontWeight: '900',
  },
  logSection: {
    marginBottom: 32,
  },
  emptyCard: {
    backgroundColor: THEME.colors.surfaceCard,
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
  },
  emptyText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
  },
  itemCard: {
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  itemImage: {
    height: 140,
    width: '100%',
  },
  itemContent: {
    padding: 16,
    gap: 6,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  itemXpTag: {
    backgroundColor: '#302511',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.secondary,
  },
  itemXpText: {
    fontSize: 12,
    fontWeight: '900',
    color: THEME.colors.secondary,
  },
  itemMissionText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
  },
  itemExplanation: {
    fontSize: 12,
    lineHeight: 18,
    color: THEME.colors.textSecondary,
  },
  actions: {
    gap: 12,
  },
  playAgainBtn: {
    backgroundColor: THEME.colors.secondary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: THEME.colors.secondaryDark,
    shadowColor: THEME.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  playAgainText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0c0e1a',
    letterSpacing: 0.5,
  },
  homeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
});
