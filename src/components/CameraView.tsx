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

  // Take photo with Expo Camera
  const handleTakePhoto = async () => {
    if (!cameraRef.current || isTakingPhoto) return;
    try {
      setIsTakingPhoto(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
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

  // Web / fallback file picker input handler
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

  // Permission handling
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator color={THEME.colors.accent} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTag}>PERMISSION REQUIRED</Text>
          <Text style={styles.permissionTitle}>Optical Sensor Required</Text>
          <Text style={styles.permissionDesc}>
            MUSE needs camera access to visually analyze and verify discoveries in your physical environment.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionButtonText}>ENABLE CAMERA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelTextBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>RETURN TO BRIEFING</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top HUD Bar */}
      <View style={styles.topHud}>
        <TouchableOpacity style={styles.closeBtn} onPress={onCancel} activeOpacity={0.7}>
          <Text style={styles.closeBtnText}>✕ ABORT</Text>
        </TouchableOpacity>
        <View style={styles.targetPill}>
          <Text style={styles.targetPillText} numberOfLines={1}>
            TARGET: {missionPrompt}
          </Text>
        </View>
      </View>

      {/* Main Viewport */}
      {capturedUri ? (
        // Preview Screen
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedUri }} style={styles.previewImage as any} resizeMode="cover" />
          <View style={styles.previewOverlay}>
            <Text style={styles.previewStatusText}>FRAME CAPTURED // READY TO ANALYZE</Text>
          </View>
        </View>
      ) : (
        // Live Camera Viewfinder
        <View style={styles.cameraWrap}>
          {Platform.OS === 'web' ? (
            <View style={styles.webFallbackContainer}>
              <Text style={styles.webHintTitle}>OPTICAL CAPTURE STATION</Text>
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
            <ExpoCamera style={styles.camera} ref={cameraRef} facing="back">
              {/* HUD Reticle */}
              <View style={styles.reticleContainer}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                <View style={styles.centerCrosshair} />
              </View>
            </ExpoCamera>
          )}
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomHud}>
        {capturedUri ? (
          <View style={styles.confirmRow}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => setCapturedUri(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.retakeButtonText}>RETAKE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.usePhotoButton}
              onPress={() => onCapture(capturedUri)}
              activeOpacity={0.8}
            >
              <Text style={styles.usePhotoButtonText}>VERIFY DISCOVERY</Text>
            </TouchableOpacity>
          </View>
        ) : (
          Platform.OS !== 'web' && (
            <View style={styles.shutterRow}>
              <TouchableOpacity
                style={styles.shutterOuter}
                onPress={handleTakePhoto}
                disabled={isTakingPhoto}
                activeOpacity={0.8}
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
    backgroundColor: THEME.colors.surface,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    maxWidth: 380,
    width: '100%',
  },
  permissionTag: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.warning,
    letterSpacing: 1,
    marginBottom: 10,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: THEME.colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  permissionButtonText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 12,
    fontWeight: '800',
    color: '#09090b',
    letterSpacing: 1,
  },
  cancelTextBtn: {
    marginTop: 14,
    paddingVertical: 6,
  },
  cancelText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 11,
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
    gap: 12,
  },
  closeBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  closeBtnText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  targetPill: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  targetPillText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    color: THEME.colors.accentLight,
  },
  cameraWrap: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  webFallbackContainer: {
    flex: 1,
    backgroundColor: '#121216',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  webHintTitle: {
    fontFamily: THEME.fonts.mono,
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.accentLight,
    letterSpacing: 1,
    marginBottom: 8,
  },
  webHintDesc: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 320,
  },
  webUploadLabel: {
    backgroundColor: THEME.colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    letterSpacing: 1,
  } as any,
  reticleContainer: {
    position: 'absolute',
    top: '25%',
    left: '12%',
    right: '12%',
    bottom: '25%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerCrosshair: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: THEME.colors.accentLight,
    borderRadius: 10,
    opacity: 0.8,
  },
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: THEME.colors.accent,
  },
  cornerTL: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    alignItems: 'center',
  },
  previewStatusText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.accentLight,
    letterSpacing: 1,
  },
  bottomHud: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterRow: {
    alignItems: 'center',
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
  confirmRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  retakeButtonText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  usePhotoButton: {
    flex: 1.4,
    backgroundColor: THEME.colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  usePhotoButtonText: {
    fontFamily: THEME.fonts.mono,
    fontSize: 12,
    fontWeight: '900',
    color: '#09090b',
    letterSpacing: 1,
  },
});
