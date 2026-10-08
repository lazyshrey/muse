import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { AppSettings, saveSettings } from '../storage/storage';
import { THEME } from '../utils/theme';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  lifetimeXP: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  settings,
  onUpdateSettings,
  lifetimeXP,
}) => {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [provider, setProvider] = useState<AppSettings['preferredProvider']>(
    settings.preferredProvider
  );

  const handleSave = async () => {
    const updated: AppSettings = {
      ...settings,
      apiKey: apiKey.trim(),
      preferredProvider: provider,
    };
    await saveSettings(updated);
    onUpdateSettings(updated);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTag}>SYSTEM TELEMETRY</Text>
              <Text style={styles.title}>MUSE Configuration</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {/* Lifetime Stats */}
            <View style={styles.statsCard}>
              <Text style={styles.statsLabel}>LIFETIME DISCOVERY XP</Text>
              <Text style={styles.statsValue}>{lifetimeXP} XP</Text>
            </View>

            {/* AI Provider Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI INFERENCE ENGINE</Text>
              <Text style={styles.sectionDesc}>
                Select how MUSE processes missions and visual observations.
              </Text>

              <View style={styles.optionsWrap}>
                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    provider === 'auto' && styles.optionRowActive,
                  ]}
                  onPress={() => setProvider('auto')}
                >
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionName}>Auto-Detect (Recommended)</Text>
                    <Text style={styles.optionDetail}>Local Gemma 4 → Remote API → Offline fallback</Text>
                  </View>
                  {provider === 'auto' && <View style={styles.activeDot} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    provider === 'gemma-api' && styles.optionRowActive,
                  ]}
                  onPress={() => setProvider('gemma-api')}
                >
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionName}>Gemma Multimodal API</Text>
                    <Text style={styles.optionDetail}>Google AI endpoint using Gemma/Gemini vision</Text>
                  </View>
                  {provider === 'gemma-api' && <View style={styles.activeDot} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    provider === 'gemma-local' && styles.optionRowActive,
                  ]}
                  onPress={() => setProvider('gemma-local')}
                >
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionName}>Gemma 4 E2B (On-Device)</Text>
                    <Text style={styles.optionDetail}>LiteRT-LM local edge model weights</Text>
                  </View>
                  {provider === 'gemma-local' && <View style={styles.activeDot} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    provider === 'fallback' && styles.optionRowActive,
                  ]}
                  onPress={() => setProvider('fallback')}
                >
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionName}>Offline Engine (Touch Grass)</Text>
                    <Text style={styles.optionDetail}>Simulated heuristics, no cloud or cell data used</Text>
                  </View>
                  {provider === 'fallback' && <View style={styles.activeDot} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* API Key Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>GEMMA / GOOGLE AI KEY</Text>
              <Text style={styles.sectionDesc}>
                Enter your Google Generative Language API key for live remote multimodal inference.
              </Text>
              <TextInput
                style={styles.textInput}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="AIzaSy..."
                placeholderTextColor={THEME.colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </ScrollView>

          {/* Footer Save */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>SAVE CONFIGURATION</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTag: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.accentLight,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    fontSize: 18,
    color: THEME.colors.textMuted,
  },
  body: {
    padding: 24,
  },
  statsCard: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    marginBottom: 24,
  },
  statsLabel: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  statsValue: {
    fontFamily: THEME.fonts.mono,
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.accentLight,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: THEME.fonts.mono,
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: THEME.colors.textMuted,
    marginBottom: 12,
  },
  optionsWrap: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surfaceElevated,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  optionRowActive: {
    borderColor: THEME.colors.accent,
    backgroundColor: '#0c1612',
  },
  optionInfo: {
    flex: 1,
    gap: 2,
  },
  optionName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  optionDetail: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.accent,
  },
  textInput: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: THEME.colors.textPrimary,
    fontFamily: THEME.fonts.mono,
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  saveBtn: {
    backgroundColor: THEME.colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 12,
    fontWeight: '900',
    color: '#09090b',
    letterSpacing: 1,
  },
});
