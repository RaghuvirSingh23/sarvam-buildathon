import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { COLORS } from '../theme';

export function SpectrumBackdrop() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.noPointer]}>
      <LinearGradient
        colors={[
          COLORS.heroFade,
          COLORS.heroIndigo,
          COLORS.heroWarm,
          COLORS.heroOrange,
        ]}
        locations={[0, 0.42, 0.72, 1]}
        start={{ x: 0.2, y: 0.15 }}
        end={{ x: 0.9, y: 0.85 }}
        style={styles.spectrum}
      />
      <View style={styles.indigoHalo} />
      <View style={styles.hairlineOne} />
      <View style={styles.hairlineTwo} />
    </View>
  );
}

const styles = StyleSheet.create({
  noPointer: {
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  spectrum: {
    position: 'absolute',
    top: -218,
    right: -178,
    width: 470,
    height: 470,
    borderRadius: 235,
    opacity: 0.34,
    transform: [{ rotate: '18deg' }],
  },
  indigoHalo: {
    position: 'absolute',
    top: 118,
    left: -116,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.indigoPale,
    opacity: 0.48,
  },
  hairlineOne: {
    position: 'absolute',
    top: 185,
    right: -48,
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(51, 51, 204, 0.12)',
  },
  hairlineTwo: {
    position: 'absolute',
    top: 221,
    right: -12,
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 1,
    borderColor: 'rgba(230, 101, 27, 0.15)',
  },
});
