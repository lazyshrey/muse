import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { CameraView as ExpoCamera, useCameraPermissions } from 'expo-camera';
import { THEME } from '../utils/theme';

interface CameraViewProps {
  onCapture: (photoUri: string) => void;
  onCancel: () => void;
  missionPrompt: string;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onCapture,
  onCancel,
  missionPrompt,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const cameraRef = useRef<any>(null);

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isTakingPhoto) return;
    try {
      setIsTakingPhoto(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });
      if (photo?.uri) {
        setCapturedUri(photo.uri);
      }
    } catch (err) {
      console.warn('Failed to take photo with camera:', err);
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const handleWebFileSelect = (event: any) => {
    const file = event?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setCapturedUri(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator color={THEME.colors.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionEmoji}>📸</Text>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionDesc}>
            MUSE needs camera permissions to see your real-world discoveries!
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
            activeOpacity={0.85}
          >
            <Text style={styles.permissionButtonText}>ALLOW CAMERA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelTextBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Back to Quest</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Viewport or Preview */}
      {capturedUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedUri }} style={styles.previewImage as any} resizeMode="cover" />
          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>✨ Target Captured!</Text>
          </View>
        </View>
      ) : Platform.OS === 'web' ? (
        <View style={styles.webFallbackContainer}>
          <Text style={styles.webEmoji}>📸</Text>
          <Text style={styles.webHintTitle}>Camera Capture Station</Text>
          <Text style={styles.webHintDesc}>
            Take a photo or upload an image of your discovery from this device.
          </Text>
          {typeof document !== 'undefined' && (
            <label style={styles.webUploadLabel as any}>
              SELECT / CAPTURE IMAGE
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleWebFileSelect}
              />
            </label>
          )}
        </View>
      ) : (
        <>
          <ExpoCamera
            style={styles.camera}
            ref={cameraRef}
            facing="back"
            mode="picture"
          />

          {/* Sleek Modern Viewfinder Overlay */}
          <View style={styles.reticleOverlay} pointerEvents="none">
            <View style={styles.reticleBox}>
              <View style={[styles.bracket, styles.bracketTL]} />
              <View style={[styles.bracket, styles.bracketTR]} />
              <View style={[styles.bracket, styles.bracketBL]} />
              <View style={[styles.bracket, styles.bracketBR]} />

              <View style={styles.focusRing}>
                <View style={styles.focusCenterDot} />
              </View>
            </View>

            <View style={styles.alignPill}>
              <Text style={styles.alignText}>SCAN OBJECT IN FRAME</Text>
            </View>
          </View>
        </>
      )}

      {/* Top Floating Goal Pill */}
      <View style={styles.topHud}>
        <TouchableOpacity style={styles.closeBtn} onPress={onCancel} activeOpacity={0.7}>
          <Text style={styles.closeBtnText}>✕ Close</Text>
        </TouchableOpacity>
        <View style={styles.targetPill}>
          <Text style={styles.targetPillIcon}>🎯</Text>
          <Text style={styles.targetPillText} numberOfLines={1}>
            {missionPrompt}
          </Text>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomHud}>
        {capturedUri ? (
          <View style={styles.confirmRow}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => setCapturedUri(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.retakeButtonText}>🔄 Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.usePhotoButton}
              onPress={() => onCapture(capturedUri)}
              activeOpacity={0.85}
            >
              <Text style={styles.usePhotoButtonText}>Verify Target ✨</Text>
            </TouchableOpacity>
          </View>
        ) : (
          Platform.OS !== 'web' && (
            <View style={styles.shutterRow}>
              <TouchableOpacity
                style={styles.shutterOuter}
                onPress={handleTakePhoto}
                disabled={isTakingPhoto}
                activeOpacity={0.85}
              >
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            </View>
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionCard: {
    backgroundColor: THEME.colors.surfaceCard,
    padding: 28,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
  },
  permissionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  permissionDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 16,
    borderRadius: 18,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: THEME.colors.primaryDark,
  },
  permissionButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  cancelTextBtn: {
    marginTop: 14,
  },
  cancelText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
  },
  topHud: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  closeBtn: {
    backgroundColor: 'rgba(23, 26, 48, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: THEME.colors.borderHighlight,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  targetPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(23, 26, 48, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: THEME.colors.borderHighlight,
  },
  targetPillIcon: {
    fontSize: 14,
  },
  targetPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.secondary,
    flex: 1,
  },
  cameraWrap: {
    flex: 1,
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webFallbackContainer: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  webEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  webHintTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  webHintDesc: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  webUploadLabel: {
    backgroundColor: THEME.colors.primary,
    color: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    fontWeight: 'bold',
  } as any,
  reticleOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticleBox: {
    width: '74%',
    height: '48%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bracket: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: THEME.colors.cyan,
  },
  bracketTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 16 },
  bracketTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 16 },
  bracketBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 16 },
  bracketBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 16 },
  focusRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(6, 214, 160, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 214, 160, 0.08)',
  },
  focusCenterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.cyan,
  },
  alignPill: {
    marginTop: 18,
    backgroundColor: 'rgba(12, 14, 26, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  alignText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewBadge: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(23, 26, 48, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: THEME.colors.cyan,
  },
  previewBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: THEME.colors.cyan,
  },
  bottomHud: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 55 : 40,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  shutterRow: {
    alignItems: 'center',
  },
  shutterOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  shutterInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: THEME.colors.primary,
  },
  confirmRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceCard,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.borderHighlight,
  },
  retakeButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  usePhotoButton: {
    flex: 1.4,
    backgroundColor: THEME.colors.cyan,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: THEME.colors.cyanDark,
  },
  usePhotoButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0c0e1a',
  },
});
