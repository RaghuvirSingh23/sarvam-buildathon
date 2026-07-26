import { StatusBar } from 'expo-status-bar';
import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  AppState,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { HeroBackground } from './src/components/HeroBackground';
import { RecordButton } from './src/components/RecordButton';
import { sarvamColors, sarvamType } from './src/theme';

type RecorderPhase =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'saving'
  | 'saved'
  | 'error';

type StopReason = 'manual' | 'background' | 'interruption';

function formatDuration(durationMillis: number) {
  const totalSeconds = Math.floor(durationMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

function createRecordingName() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `voice-note-${timestamp}.m4a`;
}

function RecorderScreen() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);

  const [phase, setPhaseState] = useState<RecorderPhase>('idle');
  const [message, setMessage] = useState('Tap the microphone to begin.');
  const [lastDuration, setLastDuration] = useState(0);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const phaseRef = useRef<RecorderPhase>('idle');
  const durationRef = useRef(0);
  const actionLockedRef = useRef(false);
  const observedActiveRecordingRef = useRef(false);

  const setPhase = useCallback((nextPhase: RecorderPhase) => {
    phaseRef.current = nextPhase;
    setPhaseState(nextPhase);
  }, []);

  useEffect(() => {
    durationRef.current = recorderState.durationMillis;
  }, [recorderState.durationMillis]);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) {
        setReduceMotion(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const announce = useCallback((announcement: string) => {
    AccessibilityInfo.announceForAccessibility(announcement);
  }, []);

  const persistRecording = useCallback((temporaryUri: string) => {
    if (Platform.OS === 'web') {
      return temporaryUri;
    }

    const temporaryFile = new File(temporaryUri);
    const savedFile = new File(Paths.document, createRecordingName());
    temporaryFile.move(savedFile);
    return savedFile.uri;
  }, []);

  const stopRecording = useCallback(
    async (reason: StopReason = 'manual') => {
      if (
        phaseRef.current !== 'recording' ||
        actionLockedRef.current
      ) {
        return;
      }

      actionLockedRef.current = true;
      const completedDuration = durationRef.current;
      setPhase('saving');
      setMessage('Saving your recording on this iPhone…');

      try {
        await recorder.stop();

        if (!recorder.uri) {
          throw new Error('The recorder did not return an audio file.');
        }

        persistRecording(recorder.uri);
        setLastDuration(completedDuration);
        setPermissionBlocked(false);
        setPhase('saved');
        setMessage(
          reason === 'background'
            ? 'Saved when the app left the foreground.'
            : reason === 'interruption'
              ? 'Saved after the recording was interrupted.'
            : 'Saved privately on this iPhone.',
        );
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
        announce('Recording stopped and saved on this iPhone.');
      } catch {
        setPhase('error');
        setMessage(
          'The recording could not be saved. Please try again.',
        );
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error,
        );
        announce('The recording could not be saved.');
      } finally {
        actionLockedRef.current = false;
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        }).catch(() => undefined);
      }
    },
    [announce, persistRecording, recorder, setPhase],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (
        nextState !== 'active' &&
        phaseRef.current === 'recording'
      ) {
        void stopRecording('background');
      }
    });

    return () => subscription.remove();
  }, [stopRecording]);

  useEffect(() => {
    if (phase !== 'recording') {
      observedActiveRecordingRef.current = false;
      return;
    }

    if (recorderState.isRecording) {
      observedActiveRecordingRef.current = true;
      return;
    }

    if (
      observedActiveRecordingRef.current ||
      recorderState.mediaServicesDidReset
    ) {
      void stopRecording('interruption');
    }
  }, [
    phase,
    recorderState.isRecording,
    recorderState.mediaServicesDidReset,
    stopRecording,
  ]);

  const ensureMicrophonePermission = useCallback(async () => {
    const currentPermission = await getRecordingPermissionsAsync();
    if (currentPermission.granted) {
      return true;
    }

    const permission = currentPermission.canAskAgain
      ? await requestRecordingPermissionsAsync()
      : currentPermission;

    if (permission.granted) {
      return true;
    }

    const isBlocked = !permission.canAskAgain;
    setPermissionBlocked(isBlocked);
    setPhase('error');
    setMessage(
      isBlocked
        ? 'Microphone access is off. Enable it in iPhone Settings.'
        : 'Microphone access is needed to record.',
    );
    announce('Microphone access is needed to record audio.');
    return false;
  }, [announce, setPhase]);

  const startRecording = useCallback(async () => {
    if (actionLockedRef.current) {
      return;
    }

    actionLockedRef.current = true;
    setPhase('requesting');
    setMessage('Checking microphone access…');

    try {
      const hasPermission = await ensureMicrophonePermission();
      if (!hasPermission) {
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      durationRef.current = 0;
      recorder.record();

      setPermissionBlocked(false);
      setPhase('recording');
      setMessage('Tap the button again when you are done.');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      announce('Recording started.');
    } catch {
      setPhase('error');
      setMessage('The microphone could not start. Please try again.');
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error,
      );
      announce('The microphone could not start.');
    } finally {
      actionLockedRef.current = false;
    }
  }, [announce, ensureMicrophonePermission, recorder, setPhase]);

  const handleRecordPress = useCallback(() => {
    if (phaseRef.current === 'recording') {
      void stopRecording();
      return;
    }

    void startRecording();
  }, [startRecording, stopRecording]);

  const isRecording = phase === 'recording';
  const isBusy = phase === 'requesting' || phase === 'saving';
  const visibleDuration = isRecording
    ? recorderState.durationMillis
    : lastDuration;

  const stateLabel =
    phase === 'recording'
      ? `RECORDING  ${formatDuration(visibleDuration)}`
      : phase === 'saving'
        ? 'SAVING'
        : phase === 'saved'
          ? `SAVED  ${formatDuration(visibleDuration)}`
          : phase === 'error'
            ? 'NEEDS ATTENTION'
            : phase === 'requesting'
              ? 'GETTING READY'
              : 'READY';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'bottom', 'left']}>
      <HeroBackground />
      <StatusBar style="dark" backgroundColor={sarvamColors.heroCanvas} />

      <View style={styles.screen}>
        <View style={styles.header}>
          <Text maxFontSizeMultiplier={2} style={styles.eyebrow}>
            VOICE NOTE
          </Text>
          <View style={styles.headerRule} />
        </View>

        <View style={styles.content}>
          <View style={styles.introduction}>
            <Text maxFontSizeMultiplier={2} style={styles.title}>
              Record your voice.
            </Text>
            <Text maxFontSizeMultiplier={2} style={styles.subtitle}>
              One tap to start. One tap to save.
            </Text>
          </View>

          <RecordButton
            disabled={isBusy}
            isRecording={isRecording}
            onPress={handleRecordPress}
            reduceMotion={reduceMotion}
          />

          <View
            accessibilityLiveRegion="polite"
            style={styles.status}
          >
            <Text maxFontSizeMultiplier={2} style={styles.stateLabel}>
              {stateLabel}
            </Text>
            <Text maxFontSizeMultiplier={2} style={styles.message}>
              {message}
            </Text>
          </View>

          {permissionBlocked ? (
            <Pressable
              accessibilityHint="Opens this app's settings so microphone access can be enabled."
              accessibilityLabel="Open iPhone Settings"
              accessibilityRole="button"
              onPress={() => void Linking.openSettings()}
              style={({ pressed }) => [
                styles.settingsButton,
                pressed && styles.settingsButtonPressed,
              ]}
            >
              <Text maxFontSizeMultiplier={2} style={styles.settingsButtonLabel}>
                OPEN SETTINGS
              </Text>
            </Pressable>
          ) : null}
        </View>

        <Text maxFontSizeMultiplier={2} style={styles.privacyNote}>
          AUDIO STAYS ON THIS DEVICE
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <RecorderScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: sarvamColors.heroCanvas,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    alignSelf: 'stretch',
    gap: 10,
  },
  eyebrow: {
    color: sarvamColors.black,
    fontFamily: sarvamType.metadata,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    lineHeight: 18,
  },
  headerRule: {
    width: 44,
    height: 2,
    backgroundColor: sarvamColors.black,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingVertical: 24,
  },
  introduction: {
    alignItems: 'center',
    gap: 8,
    maxWidth: 320,
  },
  title: {
    color: sarvamColors.black,
    fontFamily: sarvamType.display,
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: -0.7,
    lineHeight: 40,
    textAlign: 'center',
  },
  subtitle: {
    color: sarvamColors.black,
    fontFamily: sarvamType.body,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    textAlign: 'center',
  },
  status: {
    alignItems: 'center',
    gap: 6,
    minHeight: 54,
    maxWidth: 320,
  },
  stateLabel: {
    color: sarvamColors.black,
    fontFamily: sarvamType.metadata,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 18,
    textAlign: 'center',
  },
  message: {
    color: sarvamColors.black,
    fontFamily: sarvamType.body,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    textAlign: 'center',
  },
  settingsButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: sarvamColors.black,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  settingsButtonPressed: {
    opacity: 0.78,
  },
  settingsButtonLabel: {
    color: sarvamColors.offWhite,
    fontFamily: sarvamType.metadata,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 18,
  },
  privacyNote: {
    color: sarvamColors.black,
    fontFamily: sarvamType.metadata,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 18,
    textAlign: 'center',
  },
});
