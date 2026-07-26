import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { COLORS, FONTS, LAYOUT, RADIUS, SPACE, TYPE } from '../theme';

type ChatComposerProps = {
  value: string;
  attachmentUri?: string;
  cameraBusy: boolean;
  cameraOpen: boolean;
  responding: boolean;
  bottomInset: number;
  onChangeText: (value: string) => void;
  onCameraToggle: () => void;
  onInputFocus: () => void;
  onRemoveAttachment: () => void;
  onSend: () => void;
};

export function ChatComposer({
  value,
  attachmentUri,
  cameraBusy,
  cameraOpen,
  responding,
  bottomInset,
  onChangeText,
  onCameraToggle,
  onInputFocus,
  onRemoveAttachment,
  onSend,
}: ChatComposerProps) {
  const canSend = value.trim().length > 0 || Boolean(attachmentUri);

  return (
    <View style={[styles.safeShell, { paddingBottom: Math.max(bottomInset, SPACE[3]) }]}>
      <View style={styles.composer}>
        {attachmentUri ? (
          <View style={styles.attachment}>
            <Image
              accessibilityLabel="Photo ready to attach"
              source={{ uri: attachmentUri }}
              style={styles.attachmentImage}
            />
            <View style={styles.attachmentCopy}>
              <Text style={styles.attachmentLabel}>PHOTO ATTACHED</Text>
              <Text numberOfLines={1} style={styles.attachmentTitle}>
                Ready for your question
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Remove attached photo"
              accessibilityRole="button"
              accessibilityState={{ disabled: cameraBusy }}
              disabled={cameraBusy}
              hitSlop={8}
              onPress={onRemoveAttachment}
              style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
            >
              <Ionicons color={COLORS.textSecondary} name="close" size={18} />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.inputRow}>
          <Pressable
            accessibilityLabel={cameraOpen ? 'Close camera' : 'Open camera'}
            accessibilityHint="Toggles camera input for the conversation"
            accessibilityRole="button"
            accessibilityState={{ disabled: cameraBusy, selected: cameraOpen }}
            disabled={cameraBusy}
            onPress={onCameraToggle}
            style={({ pressed }) => [
              styles.cameraButton,
              cameraOpen && styles.cameraButtonActive,
              cameraBusy && styles.controlDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              color={cameraOpen ? COLORS.textInverse : COLORS.indigoDeep}
              name={cameraOpen ? 'close' : 'camera-outline'}
              size={22}
            />
          </Pressable>

          <TextInput
            accessibilityLabel="Message"
            maxLength={800}
            multiline
            editable={!cameraBusy}
            onChangeText={onChangeText}
            onFocus={onInputFocus}
            placeholder={cameraOpen ? 'Ask about what you see…' : 'Ask in your language…'}
            placeholderTextColor={COLORS.textTertiary}
            style={styles.input}
            value={value}
          />

          <Pressable
            accessibilityLabel={responding ? 'Preparing response' : 'Send message'}
            accessibilityRole="button"
            accessibilityState={{
              busy: responding,
              disabled: !canSend || responding,
            }}
            disabled={!canSend || responding}
            onPress={onSend}
            style={({ pressed }) => [
              styles.sendButton,
              (!canSend || responding) && styles.sendButtonDisabled,
              pressed && canSend && !responding && styles.pressed,
            ]}
          >
            <LinearGradient
              colors={[COLORS.buttonTop, COLORS.buttonBottom]}
              style={styles.sendGradient}
            >
              {responding ? (
                <ActivityIndicator color={COLORS.textInverse} size="small" />
              ) : (
                <Ionicons color={COLORS.textInverse} name="arrow-up" size={21} />
              )}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.composerMeta}>
          <Text style={styles.metaText}>
            {cameraOpen ? 'CAMERA MODE' : 'LOCAL PROTOTYPE'}
          </Text>
          <View style={styles.privateNote}>
            <Ionicons color={COLORS.textTertiary} name="lock-closed-outline" size={11} />
            <Text style={styles.privateText}>No upload</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeShell: {
    width: '100%',
    paddingHorizontal: SPACE[2],
    paddingTop: SPACE[2],
    backgroundColor: 'rgba(250,250,250,0.94)',
  },
  composer: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: SPACE[2],
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(31,31,31,0.10)',
    backgroundColor: COLORS.surface,
    ...Platform.select({
      web: {
        boxShadow: '0 3px 18px rgba(20,20,20,0.08)',
      },
      default: {
        shadowColor: COLORS.nearBlack,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
      },
    }),
  },
  inputRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACE[2],
  },
  cameraButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.indigoPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtonActive: {
    backgroundColor: COLORS.orange,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 112,
    paddingHorizontal: SPACE[3],
    paddingTop: 12,
    paddingBottom: 10,
    color: COLORS.text,
    fontFamily: FONTS.body,
    ...TYPE.body,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.38,
  },
  sendGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerMeta: {
    minHeight: 32,
    paddingHorizontal: SPACE[2],
    paddingTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACE[2],
  },
  metaText: {
    flex: 1,
    color: COLORS.textTertiary,
    fontFamily: FONTS.metadata,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  privateNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  privateText: {
    color: COLORS.textTertiary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
  },
  attachment: {
    minHeight: 64,
    marginBottom: SPACE[2],
    paddingRight: SPACE[2],
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surfaceSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE[3],
    overflow: 'hidden',
  },
  attachmentImage: {
    width: 72,
    height: 64,
    backgroundColor: COLORS.surfaceTertiary,
  },
  attachmentCopy: {
    flex: 1,
  },
  attachmentLabel: {
    color: COLORS.indigoDeep,
    fontFamily: FONTS.metadataMedium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.6,
  },
  attachmentTitle: {
    marginTop: 3,
    color: COLORS.text,
    fontFamily: FONTS.bodySemibold,
    fontSize: 13,
  },
  removeButton: {
    minWidth: LAYOUT.touchTarget,
    minHeight: LAYOUT.touchTarget,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
  controlDisabled: {
    opacity: 0.5,
  },
});
