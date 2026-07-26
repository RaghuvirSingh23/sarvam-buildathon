import { Platform, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, RADIUS, SPACE } from '../theme';

function OriginalGlyph() {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.glyph}>
      <View style={styles.glyphIndigo} />
      <View style={styles.glyphOrange} />
      <View style={styles.glyphCore} />
    </View>
  );
}

export function BrandHeader({ wide = false }: { wide?: boolean }) {
  return (
    <View style={[styles.shell, wide && styles.shellWide]}>
      <View style={styles.identity}>
        <OriginalGlyph />
        <View>
          <Text style={styles.wordmark}>drishti</Text>
          <Text style={styles.subtitle}>VISUAL ASSISTANT</Text>
        </View>
      </View>

      <View accessibilityLabel="Local prototype" style={styles.status}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>LOCAL</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    minHeight: 64,
    marginHorizontal: SPACE[2],
    marginTop: SPACE[2],
    paddingHorizontal: SPACE[4],
    paddingVertical: 10,
    borderRadius: RADIUS.nav,
    borderWidth: 1,
    borderColor: 'rgba(31, 31, 31, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 12px rgba(20,20,20,0.05)',
      },
      default: {
        shadowColor: COLORS.nearBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
      },
    }),
  },
  shellWide: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE[3],
  },
  glyph: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glyphIndigo: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 5,
    borderColor: COLORS.indigo,
    left: 5,
    top: 6,
  },
  glyphOrange: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 4,
    borderColor: COLORS.orange,
    right: 4,
    bottom: 5,
  },
  glyphCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.nearBlack,
  },
  wordmark: {
    color: COLORS.text,
    fontFamily: FONTS.display,
    fontSize: 21,
    lineHeight: 23,
    letterSpacing: -0.35,
  },
  subtitle: {
    marginTop: 1,
    color: COLORS.textTertiary,
    fontFamily: FONTS.metadata,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.9,
  },
  status: {
    minHeight: 34,
    paddingHorizontal: SPACE[3],
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE[2],
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.positive,
  },
  statusText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.metadataMedium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
});
