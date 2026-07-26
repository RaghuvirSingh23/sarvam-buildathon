import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraType, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { RefObject } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS, FONTS, LAYOUT, RADIUS, SPACE, TYPE } from '../theme';

type CameraStageProps = {
  cameraRef: RefObject<CameraView | null>;
  permissionGranted: boolean;
  canAskAgain: boolean;
  facing: CameraType;
  isCameraReady: boolean;
  isCapturing: boolean;
  errorMessage?: string;
  onCameraReady: () => void;
  onCameraError: (message: string) => void;
  onRequestPermission: () => void;
  onClose: () => void;
  onFlip: () => void;
  onCapture: () => void;
};

export function CameraStage({
  cameraRef,
  permissionGranted,
  canAskAgain,
  facing,
  isCameraReady,
  isCapturing,
  errorMessage,
  onCameraReady,
  onCameraError,
  onRequestPermission,
  onClose,
  onFlip,
  onCapture,
}: CameraStageProps) {
  if (!permissionGranted) {
    return (
      <View style={styles.permissionPanel}>
        <View style={styles.permissionIcon}>
          <Ionicons color={COLORS.indigoDeep} name="camera-outline" size={27} />
        </View>
        <Text style={styles.permissionEyebrow}>CAMERA INPUT</Text>
        <Text style={styles.permissionTitle}>Let the camera add context.</Text>
        <Text style={styles.permissionCopy}>
          Drishti only opens the camera after you ask. Captured photos stay in
          this local prototype; no upload is connected.
        </Text>
        <View style={styles.permissionActions}>
          <Pressable
            accessibilityLabel={canAskAgain ? 'Allow camera access' : 'Open camera settings'}
            accessibilityRole="button"
            onPress={canAskAgain ? onRequestPermission : () => void Linking.openSettings()}
            style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
          >
            <Text style={styles.primaryActionText}>
              {canAskAgain ? 'Allow camera' : 'Open settings'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Close camera"
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryActionText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stage}>
      <CameraView
        key={facing}
        ref={cameraRef}
        animateShutter
        facing={facing}
        mode="picture"
        onCameraReady={onCameraReady}
        onMountError={(event) => onCameraError(event.message)}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(20,20,20,0.54)', 'transparent', 'rgba(20,20,20,0.72)']}
        locations={[0, 0.46, 1]}
        style={[StyleSheet.absoluteFill, styles.noPointer]}
      />

      <View style={styles.cameraHeader}>
        <View
          accessibilityLabel={isCameraReady ? 'Camera ready' : 'Camera starting'}
          accessibilityLiveRegion="polite"
          style={styles.livePill}
        >
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{isCameraReady ? 'CAMERA READY' : 'STARTING'}</Text>
        </View>
      </View>

      <View style={[styles.focusFrame, styles.noPointer]}>
        <View style={[styles.corner, styles.cornerTopLeft]} />
        <View style={[styles.corner, styles.cornerTopRight]} />
        <View style={[styles.corner, styles.cornerBottomLeft]} />
        <View style={[styles.corner, styles.cornerBottomRight]} />
        <Text style={styles.focusLabel}>FRAME WHAT YOU WANT TO ASK ABOUT</Text>
      </View>

      {errorMessage ? (
        <View
          accessibilityLiveRegion="assertive"
          accessibilityRole="alert"
          style={styles.errorPill}
        >
          <Ionicons color={COLORS.textInverse} name="alert-circle-outline" size={16} />
          <Text numberOfLines={2} style={styles.errorText}>
            {errorMessage}
          </Text>
        </View>
      ) : null}

      <View style={styles.cameraControls}>
        <View style={styles.controlSpacer} />
        <Pressable
          accessibilityLabel="Capture photo"
          accessibilityHint="Adds this view to your next chat message"
          accessibilityRole="button"
          accessibilityState={{ disabled: !isCameraReady || isCapturing }}
          disabled={!isCameraReady || isCapturing}
          onPress={onCapture}
          style={({ pressed }) => [
            styles.shutter,
            (!isCameraReady || isCapturing) && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          {isCapturing ? (
            <ActivityIndicator color={COLORS.nearBlack} />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </Pressable>
        <Pressable
          accessibilityLabel={`Use ${facing === 'back' ? 'front' : 'back'} camera`}
          accessibilityRole="button"
          accessibilityState={{ disabled: !isCameraReady || isCapturing }}
          disabled={!isCameraReady || isCapturing}
          onPress={onFlip}
          style={({ pressed }) => [
            styles.iconButton,
            (!isCameraReady || isCapturing) && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons color={COLORS.textInverse} name="camera-reverse-outline" size={24} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  noPointer: {
    pointerEvents: 'none',
  },
  stage: {
    flex: 1,
    minHeight: 360,
    marginHorizontal: SPACE[3],
    marginTop: SPACE[3],
    borderRadius: RADIUS.panel,
    overflow: 'hidden',
    backgroundColor: COLORS.nearBlack,
  },
  cameraHeader: {
    position: 'absolute',
    top: SPACE[4],
    left: SPACE[4],
    right: SPACE[4],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  livePill: {
    minHeight: 34,
    paddingHorizontal: SPACE[3],
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(20,20,20,0.54)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE[2],
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.orangeWarm,
  },
  liveText: {
    color: COLORS.textInverse,
    fontFamily: FONTS.metadataMedium,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.7,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(20,20,20,0.46)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusFrame: {
    position: 'absolute',
    top: '24%',
    left: '13%',
    right: '13%',
    bottom: '27%',
    backgroundColor: 'rgba(20,20,20,0.07)',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: 'rgba(255,255,255,0.96)',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopLeftRadius: RADIUS.control,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopRightRadius: RADIUS.control,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomLeftRadius: RADIUS.control,
  },
  cornerBottomRight: {
    right: 0,
    bottom: 0,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderBottomRightRadius: RADIUS.control,
  },
  focusLabel: {
    marginBottom: -30,
    paddingHorizontal: SPACE[3],
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    color: COLORS.textInverse,
    backgroundColor: 'rgba(20,20,20,0.52)',
    fontFamily: FONTS.metadataMedium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.65,
    ...Platform.select({
      web: {
        textShadow: '0 1px 2px rgba(0,0,0,0.55)',
      },
      default: {
        textShadowColor: 'rgba(0,0,0,0.55)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  cameraControls: {
    position: 'absolute',
    left: SPACE[5],
    right: SPACE[5],
    bottom: SPACE[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlSpacer: {
    width: 48,
    height: 48,
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: COLORS.surface,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
  },
  errorPill: {
    position: 'absolute',
    left: SPACE[4],
    right: SPACE[4],
    bottom: 112,
    minHeight: LAYOUT.touchTarget,
    paddingHorizontal: SPACE[3],
    paddingVertical: SPACE[2],
    borderRadius: RADIUS.control,
    backgroundColor: 'rgba(184,21,20,0.84)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE[2],
  },
  errorText: {
    flex: 1,
    color: COLORS.textInverse,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    lineHeight: 17,
  },
  permissionPanel: {
    flex: 1,
    minHeight: 320,
    marginHorizontal: SPACE[3],
    marginTop: SPACE[3],
    paddingHorizontal: SPACE[6],
    paddingVertical: SPACE[8],
    borderRadius: RADIUS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionIcon: {
    width: 60,
    height: 60,
    marginBottom: SPACE[5],
    borderRadius: 30,
    backgroundColor: COLORS.indigoPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionEyebrow: {
    color: COLORS.indigoDeep,
    fontFamily: FONTS.metadataMedium,
    ...TYPE.label,
  },
  permissionTitle: {
    marginTop: SPACE[3],
    color: COLORS.text,
    fontFamily: FONTS.display,
    fontSize: 29,
    lineHeight: 35,
    textAlign: 'center',
  },
  permissionCopy: {
    maxWidth: 330,
    marginTop: SPACE[3],
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    ...TYPE.body,
    textAlign: 'center',
  },
  permissionActions: {
    width: '100%',
    maxWidth: 320,
    marginTop: SPACE[6],
    gap: SPACE[3],
  },
  primaryAction: {
    minHeight: 52,
    paddingHorizontal: SPACE[5],
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.nearBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: COLORS.textInverse,
    fontFamily: FONTS.bodySemibold,
    fontSize: 15,
  },
  secondaryAction: {
    minHeight: 48,
    paddingHorizontal: SPACE[5],
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodySemibold,
    fontSize: 15,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
});
