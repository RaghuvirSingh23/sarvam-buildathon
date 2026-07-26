import { StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  FeGaussianBlur,
  Filter,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { sarvamColors } from '../theme';

/**
 * Native translation of Sarvam's live desktop hero background:
 * the cropped orange → periwinkle → off-white field plus its indigo atmosphere.
 * The official SVG and other protected assets are not bundled or hotlinked.
 */
export function HeroBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 390 844"
        width="100%"
      >
        <Defs>
          <Filter
            height="150%"
            id="hero-spectrum-blur"
            width="150%"
            x="-25%"
            y="-25%"
          >
            <FeGaussianBlur stdDeviation="24" />
          </Filter>
          <RadialGradient
            cx="195"
            cy="-260"
            gradientUnits="userSpaceOnUse"
            id="hero-spectrum"
            r="580"
          >
            <Stop
              offset="0.75"
              stopColor={sarvamColors.heroOrange}
            />
            <Stop
              offset="0.78"
              stopColor={sarvamColors.heroWarmOrange}
            />
            <Stop
              offset="0.8"
              stopColor={sarvamColors.heroIndigo}
            />
            <Stop
              offset="1"
              stopColor={sarvamColors.heroOuter}
            />
          </RadialGradient>
          <RadialGradient
            cx="195"
            cy="390"
            gradientUnits="userSpaceOnUse"
            id="hero-indigo-atmosphere"
            r="330"
          >
            <Stop
              offset="0"
              stopColor={sarvamColors.heroIndigo}
              stopOpacity={0.3}
            />
            <Stop
              offset="0.4"
              stopColor={sarvamColors.heroIndigoSoft}
              stopOpacity={0.3}
            />
            <Stop
              offset="0.7"
              stopColor={sarvamColors.heroIndigoSoft}
              stopOpacity={0}
            />
            <Stop
              offset="1"
              stopColor={sarvamColors.heroCanvas}
              stopOpacity={0}
            />
          </RadialGradient>
          <LinearGradient
            id="hero-top-fade"
            x1="0"
            x2="0"
            y1="0"
            y2="112"
            gradientUnits="userSpaceOnUse"
          >
            <Stop
              offset="0"
              stopColor={sarvamColors.heroCanvas}
              stopOpacity={0.82}
            />
            <Stop
              offset="1"
              stopColor={sarvamColors.heroCanvas}
              stopOpacity={0}
            />
          </LinearGradient>
        </Defs>

        <Rect
          fill="url(#hero-spectrum)"
          filter="url(#hero-spectrum-blur)"
          height="844"
          width="390"
        />
        <Rect
          fill="url(#hero-indigo-atmosphere)"
          height="844"
          width="390"
        />
        <Rect
          fill="url(#hero-top-fade)"
          height="112"
          width="390"
        />
      </Svg>
    </View>
  );
}
