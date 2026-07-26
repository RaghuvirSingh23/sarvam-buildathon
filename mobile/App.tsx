import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display/400Regular';
import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono/400Regular';
import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono/500Medium';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { File } from 'expo-file-system';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useEffect, useMemo, useRef, useState } from 'react';

import { BrandHeader } from './src/components/BrandHeader';
import { CameraStage } from './src/components/CameraStage';
import { ChatComposer } from './src/components/ChatComposer';
import { ChatMessageCard } from './src/components/ChatMessageCard';
import { SpectrumBackdrop } from './src/components/SpectrumBackdrop';
import { COLORS, FONTS, LAYOUT, RADIUS, SPACE, TYPE } from './src/theme';
import { ChatMessage } from './src/types';

const QUICK_PROMPTS = [
  { icon: 'text-outline' as const, label: 'Read this text' },
  { icon: 'sparkles-outline' as const, label: 'Explain this object' },
  { icon: 'language-outline' as const, label: 'Translate a sign' },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Point your camera at something or type a question. Your photo and message stay together in this conversation.',
    timestamp: 'NOW',
  },
];

function currentTime() {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

function deleteTemporaryPhoto(uri?: string) {
  if (!uri || Platform.OS === 'web' || !uri.startsWith('file://')) {
    return;
  }

  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Cache cleanup should never interrupt the conversation.
  }
}

function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <View style={styles.loadingGlyph}>
        <ActivityIndicator color={COLORS.indigoDeep} />
      </View>
      <Text style={styles.loadingText}>Preparing Drishti</Text>
    </View>
  );
}

function ConversationIntro({
  onPrompt,
}: {
  onPrompt: (prompt: string) => void;
}) {
  return (
    <View style={styles.intro}>
      <View style={styles.eyebrowRow}>
        <View style={styles.eyebrowLine} />
        <Text style={styles.eyebrow}>SEE · ASK · UNDERSTAND</Text>
        <View style={styles.eyebrowLine} />
      </View>
      <Text style={styles.heroTitle}>See it. Ask it.</Text>
      <Text style={styles.heroCopy}>
        Bring the world into the conversation with one tap.
      </Text>
      <View accessibilityLabel="Suggested questions" style={styles.promptRow}>
        {QUICK_PROMPTS.map((prompt) => (
          <Pressable
            accessibilityRole="button"
            key={prompt.label}
            onPress={() => onPrompt(prompt.label)}
            style={({ pressed }) => [styles.promptChip, pressed && styles.pressed]}
          >
            <Ionicons color={COLORS.indigoDeep} name={prompt.icon} size={16} />
            <Text style={styles.promptText}>{prompt.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function DrishtiApp() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= LAYOUT.tabletBreakpoint;
  const cameraRef = useRef<CameraView>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const responseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captureGeneration = useRef(0);

  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const [attachmentUri, setAttachmentUri] = useState<string>();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string>();
  const [capturing, setCapturing] = useState(false);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    return () => {
      if (responseTimer.current) {
        clearTimeout(responseTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void getPermission();
      }
    });

    return () => subscription.remove();
  }, [getPermission]);

  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: messages.length > 1 });
    }, 90);

    return () => clearTimeout(scrollTimer);
  }, [attachmentUri, messages.length]);

  const listContentStyle = useMemo(
    () => [
      styles.listContent,
      isWide && styles.listContentWide,
      { paddingBottom: SPACE[5] },
    ],
    [isWide],
  );

  const closeCamera = () => {
    captureGeneration.current += 1;
    setCameraOpen(false);
    setCameraReady(false);
    setCameraError(undefined);
    setCapturing(false);
  };

  const requestCameraAccess = async () => {
    const result = await requestPermission();
    if (result.granted) {
      setCameraError(undefined);
    }
  };

  const toggleCamera = async () => {
    void Haptics.selectionAsync();

    if (cameraOpen) {
      closeCamera();
      return;
    }

    Keyboard.dismiss();
    setCameraOpen(true);
    setCameraError(undefined);

    if (!permission?.granted && permission?.canAskAgain !== false) {
      await requestCameraAccess();
    }
  };

  const capturePhoto = async () => {
    if (!cameraRef.current || !cameraReady || capturing) {
      return;
    }

    const activeGeneration = captureGeneration.current;

    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.76,
        exif: false,
        skipProcessing: false,
      });

      if (activeGeneration !== captureGeneration.current) {
        deleteTemporaryPhoto(photo?.uri);
        return;
      }

      if (photo?.uri) {
        deleteTemporaryPhoto(attachmentUri);
        setAttachmentUri(photo.uri);
        setDraft((current) => current || 'What can you tell me about this?');
        closeCamera();
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      if (activeGeneration === captureGeneration.current) {
        setCameraError('The photo could not be captured. Please try again.');
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      if (activeGeneration === captureGeneration.current) {
        setCapturing(false);
      }
    }
  };

  const sendMessage = () => {
    const messageText = draft.trim();
    if ((!messageText && !attachmentUri) || responding) {
      return;
    }

    const now = Date.now();
    const nextMessage: ChatMessage = {
      id: `user-${now}`,
      role: 'user',
      text: messageText || 'What can you tell me about this?',
      timestamp: currentTime(),
      imageUri: attachmentUri,
    };

    setMessages((current) => [...current, nextMessage]);
    setDraft('');
    setAttachmentUri(undefined);
    setResponding(true);
    closeCamera();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    responseTimer.current = setTimeout(() => {
      const reply: ChatMessage = {
        id: `assistant-${now + 1}`,
        role: 'assistant',
        text: nextMessage.imageUri
          ? 'The camera and chat flow are ready. Connect a Sarvam vision endpoint to turn this photo into a live visual answer.'
          : 'Your message is in the conversation. Connect the Sarvam inference endpoint to return a live answer here.',
        timestamp: currentTime(),
      };
      setMessages((current) => [...current, reply]);
      setResponding(false);
      responseTimer.current = null;
    }, 720);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar animated style="dark" />
      <SpectrumBackdrop />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardRoot}
      >
        <BrandHeader wide={isWide} />

        {cameraOpen ? (
          <CameraStage
            cameraRef={cameraRef}
            canAskAgain={permission?.canAskAgain !== false}
            errorMessage={cameraError}
            facing={cameraFacing}
            isCameraReady={cameraReady}
            isCapturing={capturing}
            onCameraError={(message) => setCameraError(message)}
            onCameraReady={() => setCameraReady(true)}
            onCapture={capturePhoto}
            onClose={closeCamera}
            onFlip={() => {
              if (capturing) {
                return;
              }
              setCameraReady(false);
              setCameraFacing((current) => (current === 'back' ? 'front' : 'back'));
              void Haptics.selectionAsync();
            }}
            onRequestPermission={() => void requestCameraAccess()}
            permissionGranted={Boolean(permission?.granted)}
          />
        ) : (
          <FlatList
            ref={listRef}
            contentContainerStyle={listContentStyle}
            data={messages}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              messages.length === 1 && !attachmentUri ? (
                <ConversationIntro
                  onPrompt={(prompt) => {
                    setDraft(prompt);
                    void Haptics.selectionAsync();
                  }}
                />
              ) : null
            }
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: messages.length > 1 })
            }
            renderItem={({ item }) => <ChatMessageCard message={item} />}
            showsVerticalScrollIndicator={false}
          />
        )}

        <ChatComposer
          attachmentUri={attachmentUri}
          bottomInset={insets.bottom}
          cameraBusy={capturing}
          cameraOpen={cameraOpen}
          onCameraToggle={() => void toggleCamera()}
          onChangeText={setDraft}
          onInputFocus={() => {
            if (cameraOpen && !capturing) {
              closeCamera();
            }
          }}
          onRemoveAttachment={() => {
            deleteTemporaryPhoto(attachmentUri);
            setAttachmentUri(undefined);
          }}
          onSend={sendMessage}
          responding={responding}
          value={draft}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    DMSerifDisplay_400Regular,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <DrishtiApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  keyboardRoot: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingGlyph: {
    width: 52,
    height: 52,
    marginBottom: SPACE[4],
    borderRadius: 26,
    backgroundColor: COLORS.indigoPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: SPACE[4],
    paddingTop: SPACE[5],
  },
  listContentWide: {
    width: '100%',
    maxWidth: LAYOUT.wideContent,
    alignSelf: 'center',
  },
  intro: {
    paddingTop: SPACE[5],
    paddingBottom: SPACE[8],
    alignItems: 'center',
  },
  eyebrowRow: {
    width: '100%',
    maxWidth: 310,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACE[3],
  },
  eyebrowLine: {
    width: 42,
    height: 1,
    backgroundColor: 'rgba(85, 106, 220, 0.28)',
  },
  eyebrow: {
    color: COLORS.indigoDeep,
    fontFamily: FONTS.metadataMedium,
    fontSize: 9,
    lineHeight: 15,
    letterSpacing: 0.85,
  },
  heroTitle: {
    marginTop: SPACE[4],
    color: COLORS.text,
    fontFamily: FONTS.display,
    ...TYPE.hero,
    textAlign: 'center',
  },
  heroCopy: {
    maxWidth: 315,
    marginTop: SPACE[3],
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    ...TYPE.body,
    textAlign: 'center',
  },
  promptRow: {
    width: '100%',
    marginTop: SPACE[6],
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACE[2],
  },
  promptChip: {
    minHeight: LAYOUT.touchTarget,
    paddingHorizontal: SPACE[3],
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(51,51,204,0.10)',
    backgroundColor: 'rgba(232,239,252,0.74)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  promptText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    lineHeight: 19,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
});
