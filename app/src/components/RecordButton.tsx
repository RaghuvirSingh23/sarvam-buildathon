import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { sarvamColors } from '../theme';

type RecordButtonProps = {
  disabled: boolean;
  isRecording: boolean;
  onPress: () => void;
  reduceMotion: boolean;
};

export function RecordButton({
  disabled,
  isRecording,
  onPress,
  reduceMotion,
}: RecordButtonProps) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const pulseProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pulseProgress.stopAnimation();
    pulseProgress.setValue(0);

    if (!isRecording || reduceMotion) {
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseProgress, {
          duration: 900,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulseProgress, {
          duration: 900,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    return () => pulse.stop();
  }, [isRecording, pulseProgress, reduceMotion]);

  const handlePressIn = () => {
    Animated.timing(pressScale, {
      duration: reduceMotion ? 0 : 150,
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(pressScale, {
      duration: reduceMotion ? 0 : 150,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const pulseStyle = {
    opacity: pulseProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.34, 0],
    }),
    transform: [
      {
        scale: pulseProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.28],
        }),
      },
    ],
  };

  return (
    <View style={styles.frame}>
      <Animated.View
        pointerEvents="none"
        style={[styles.pulse, pulseStyle]}
      />

      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <Pressable
          accessibilityHint={
            isRecording
              ? 'Stops and saves the current recording.'
              : 'Starts recording from the microphone.'
          }
          accessibilityLabel={
            isRecording ? 'Stop and save recording' : 'Start recording'
          }
          accessibilityRole="button"
          accessibilityState={{ disabled, selected: isRecording }}
          disabled={disabled}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.button, disabled && styles.buttonDisabled]}
        >
          {isRecording ? (
            <View style={[styles.face, styles.recordingFace]}>
              <View style={styles.stopGlyph} />
            </View>
          ) : (
            <LinearGradient
              colors={[sarvamColors.buttonTop, sarvamColors.buttonBottom]}
              end={{ x: 0.82, y: 1 }}
              start={{ x: 0.18, y: 0 }}
              style={styles.face}
            >
              <View style={styles.microphone}>
                <View style={styles.microphoneCapsule} />
                <View style={styles.microphoneArc} />
                <View style={styles.microphoneStem} />
                <View style={styles.microphoneBase} />
              </View>
            </LinearGradient>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 176,
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: sarvamColors.deepIndigo,
  },
  button: {
    width: 144,
    height: 144,
    borderRadius: 72,
    overflow: 'hidden',
    shadowColor: sarvamColors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 12,
  },
  buttonDisabled: {
    opacity: 0.56,
  },
  face: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingFace: {
    backgroundColor: sarvamColors.black,
    borderWidth: 4,
    borderColor: sarvamColors.deepIndigo,
  },
  stopGlyph: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: sarvamColors.offWhite,
  },
  microphone: {
    width: 54,
    height: 66,
    alignItems: 'center',
  },
  microphoneCapsule: {
    position: 'absolute',
    top: 0,
    width: 26,
    height: 39,
    borderWidth: 4,
    borderColor: sarvamColors.offWhite,
    borderRadius: 14,
  },
  microphoneArc: {
    position: 'absolute',
    top: 25,
    width: 44,
    height: 27,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: sarvamColors.offWhite,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  microphoneStem: {
    position: 'absolute',
    top: 50,
    width: 4,
    height: 12,
    borderRadius: 2,
    backgroundColor: sarvamColors.offWhite,
  },
  microphoneBase: {
    position: 'absolute',
    bottom: 0,
    width: 26,
    height: 4,
    borderRadius: 2,
    backgroundColor: sarvamColors.offWhite,
  },
});
