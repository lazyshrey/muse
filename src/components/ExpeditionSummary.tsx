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
      {/* Complete Banner */}
      <View style={styles.banner}>
        <View style={styles.completedTag}>
          <Text style={styles.completedTagText}>EXPEDITION CONCLUDED</Text>
        </View>
        <Text style={styles.title}>Field Report</Text>
        <Text style={styles.subtitle}>
          The physical world was your game board. Here is what you uncovered.
        </Text>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{discoveriesCount}</Text>
          <Text style={styles.metricLabel}>DISCOVERIES</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={[styles.metricNumber, { color: THEME.colors.accentLight }]}>
            +{expedition.totalXP}
          </Text>
          <Text style={styles.metricLabel}>TOTAL XP</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{durationMinutes}m</Text>
          <Text style={styles.metricLabel}>EXPEDITION TIME</Text>
        </View>
      </View>

      {/* Stretch Feature: Discovery Chain Visualization */}
      {discoveriesCount > 0 && (
        <View style={styles.chainSection}>
          <Text style={styles.sectionHeader}>DISCOVERY CHAIN SEQUENCE</Text>
          <View style={styles.chainRow}>
            {expedition.missions.map((m, idx) => (
              <React.Fragment key={m.mission.id + idx}>
                <View style={styles.chainNode}>
                  <View style={styles.chainIconCircle}>
                    <Text style={styles.chainNumber}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.chainNodeName} numberOfLines={1}>
                    {m.verification.detectedObject}
                  </Text>
                </View>
                {idx < expedition.missions.length - 1 && (
                  <View style={styles.chainArrow}>
                    <Text style={styles.chainArrowText}>→</Text>
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      )}

      {/* Discoveries Detailed List */}
      <View style={styles.logSection}>
        <Text style={styles.sectionHeader}>DISCOVERY LOG</Text>
        {expedition.missions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No discoveries recorded in this expedition.</Text>
          </View>
        ) : (
          expedition.missions.map((item, index) => (
            <View key={item.mission.id + index} style={styles.discoveryCard}>
              {item.photoUri && (
                <Image source={{ uri: item.photoUri }} style={styles.logImage} resizeMode="cover" />
              )}
              <View style={styles.logInfo}>
                <View style={styles.logHeader}>
                  <Text style={styles.logTitle}>{item.verification.detectedObject}</Text>
                  <View style={styles.logXpPill}>
                    <Text style={styles.logXpText}>+{item.xpEarned} XP</Text>
                  </View>
                </View>
                <Text style={styles.logMissionText}>“{item.mission.text}”</Text>
                <Text style={styles.logExplanation}>{item.verification.explanation}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Action CTAs */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onStartNewExpedition}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>START NEW EXPEDITION</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeBtn} onPress={onGoHome} activeOpacity={0.7}>
          <Text style={styles.homeBtnText}>RETURN TO HEADQUARTERS</Text>
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
    paddingTop: 48,
    paddingBottom: 60,
  },
  banner: {
    marginBottom: 28,
  },
  completedTag: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.colors.accentMuted,
    borderWidth: 1,
    borderColor: THEME.colors.accentBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  completedTagText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.accentLight,
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: THEME.colors.textSecondary,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  metricCard: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    fontFamily: THEME.fonts.mono,
    marginBottom: 4,
  },
  metricLabel: {
    fontFamily: THEME.fonts.mono,
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  chainSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontFamily: THEME.fonts.mono,
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 14,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  chainNode: {
    alignItems: 'center',
    gap: 4,
    maxWidth: 90,
  },
  chainIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chainNumber: {
    fontFamily: THEME.fonts.mono,
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.accentLight,
  },
  chainNodeName: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  chainArrow: {
    paddingHorizontal: 2,
  },
  chainArrowText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 14,
    color: THEME.colors.textMuted,
  },
  logSection: {
    marginBottom: 36,
  },
  emptyCard: {
    backgroundColor: THEME.colors.surface,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
  },
  emptyText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
  },
  discoveryCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 14,
    overflow: 'hidden',
  },
  logImage: {
    height: 140,
    width: '100%',
  },
  logInfo: {
    padding: 16,
    gap: 6,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  logXpPill: {
    backgroundColor: THEME.colors.accentMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  logXpText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.accentLight,
  },
  logMissionText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
  },
  logExplanation: {
    fontSize: 12,
    lineHeight: 18,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: THEME.colors.accent,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: THEME.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 13,
    fontWeight: '900',
    color: '#09090b',
    letterSpacing: 1,
  },
  homeBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  homeBtnText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
  },
});
