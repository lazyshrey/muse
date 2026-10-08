import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mission } from '../types';
import { THEME } from '../utils/theme';

interface MissionCardProps {
  mission: Mission;
  onOpenCamera: () => void;
  onEndExpedition: () => void;
  isGenerating?: boolean;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onOpenCamera,
  onEndExpedition,
  isGenerating = false,
}) => {
  const [showHint, setShowHint] = useState(false);

  const categoryLabels: Record<string, string> = {
    object: 'PHYSICAL OBJECT',
    structure: 'STRUCTURAL ELEMENT',
    nature: 'NATURAL ARTIFACT',
    color: 'CHROMATIC FOCUS',
    shape: 'GEOMETRIC FORM',
    reflection: 'SPECULAR SURFACE',
    'human-made': 'MANUFACTURED ELEMENT',
    environment: 'ENVIRONMENTAL PATTERN',
  };

  return (
    <View style={styles.card}>
      {/* Category Header */}
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {categoryLabels[mission.category] || mission.category.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.idLabel}>ID // {mission.id.slice(-6)}</Text>
      </View>

      {/* Primary Mission Prompt */}
      <View style={styles.promptContainer}>
        <Text style={styles.missionQuote}>“</Text>
        <Text style={styles.missionText}>{mission.text}</Text>
      </View>

      {/* Field Directive Note */}
      <View style={styles.directiveBox}>
        <View style={styles.directiveIcon}>
          <Text style={styles.glyphText}>🌿</Text>
        </View>
        <View style={styles.directiveTextWrap}>
          <Text style={styles.directiveTitle}>FIELD DIRECTIVE</Text>
          <Text style={styles.directiveBody}>
            Put your phone away. Walk and observe your physical environment. Return only when you have discovered your target.
          </Text>
        </View>
      </View>

      {/* Expandable Hint */}
      <TouchableOpacity
        style={styles.hintToggle}
        onPress={() => setShowHint(!showHint)}
        activeOpacity={0.7}
      >
        <Text style={styles.hintToggleText}>
          {showHint ? '▼ HIDE FIELD HINT' : '▶ REVEAL FIELD HINT'}
        </Text>
      </TouchableOpacity>

      {showHint && (
        <View style={styles.hintContent}>
          <Text style={styles.hintText}>{mission.verificationHint}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={onOpenCamera}
          disabled={isGenerating}
          activeOpacity={0.8}
        >
          <View style={styles.cameraIconDot} />
          <Text style={styles.cameraButtonText}>OPEN CAMERA // SCAN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endButton}
          onPress={onEndExpedition}
          activeOpacity={0.7}
        >
          <Text style={styles.endButtonText}>FINISH EXPEDITION</Text>
        </TouchableOpacity>
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
  categoryBadge: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.borderHighlight,
  },
  categoryText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.accentLight,
    letterSpacing: 0.8,
  },
  idLabel: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  promptContainer: {
    marginBottom: 24,
    position: 'relative',
    paddingLeft: 4,
  },
  missionQuote: {
    position: 'absolute',
    top: -20,
    left: -8,
    fontSize: 48,
    color: THEME.colors.borderHighlight,
    fontFamily: THEME.fonts.mono,
  },
  missionText: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
  },
  directiveBox: {
    flexDirection: 'row',
    backgroundColor: '#0c1410',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  directiveIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    fontSize: 14,
  },
  directiveTextWrap: {
    flex: 1,
  },
  directiveTitle: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.accentLight,
    letterSpacing: 1,
    marginBottom: 2,
  },
  directiveBody: {
    fontSize: 12,
    lineHeight: 18,
    color: THEME.colors.textSecondary,
  },
  hintToggle: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  hintToggleText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  hintContent: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
  },
  hintText: {
    fontSize: 13,
    lineHeight: 19,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
  },
  actionRow: {
    gap: 12,
    marginTop: 8,
  },
  cameraButton: {
    backgroundColor: THEME.colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: THEME.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  cameraIconDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#09090b',
  },
  cameraButtonText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 13,
    fontWeight: '900',
    color: '#09090b',
    letterSpacing: 1,
  },
  endButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  endButtonText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
  },
});
