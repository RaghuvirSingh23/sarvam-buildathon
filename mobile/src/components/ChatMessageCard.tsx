import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, RADIUS, SPACE, TYPE } from '../theme';
import { ChatMessage } from '../types';

export function ChatMessageCard({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  const content = (
    <>
      {message.imageUri ? (
        <Image
          accessibilityLabel="Photo attached to this message"
          resizeMode="cover"
          source={{ uri: message.imageUri }}
          style={styles.image}
        />
      ) : null}
      <Text style={[styles.text, isUser && styles.userText]}>{message.text}</Text>
      <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
        {isUser ? 'YOU' : 'DRISHTI'} · {message.timestamp}
      </Text>
    </>
  );

  return (
    <View style={[styles.row, isUser && styles.userRow]}>
      {isUser ? (
        <LinearGradient
          colors={[COLORS.buttonTop, COLORS.buttonBottom]}
          style={[styles.bubble, styles.userBubble]}
        >
          {content}
        </LinearGradient>
      ) : (
        <View
          accessibilityLiveRegion="polite"
          style={[styles.bubble, styles.assistantBubble]}
        >
          {content}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: SPACE[4],
  },
  userRow: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '86%',
    paddingHorizontal: SPACE[4],
    paddingVertical: 14,
    borderRadius: RADIUS.card,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 6,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  text: {
    color: COLORS.text,
    fontFamily: FONTS.body,
    ...TYPE.body,
  },
  userText: {
    color: COLORS.textInverse,
  },
  timestamp: {
    marginTop: SPACE[2],
    color: COLORS.textTertiary,
    fontFamily: FONTS.metadata,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.65,
  },
  userTimestamp: {
    color: 'rgba(250, 248, 245, 0.66)',
  },
  image: {
    width: 220,
    maxWidth: '100%',
    aspectRatio: 4 / 3,
    marginBottom: SPACE[3],
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.surfaceTertiary,
  },
});
