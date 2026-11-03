import { Platform, type ColorValue } from 'react-native';
import { elevation } from '@shopsphere/config';

type ElevationLevel = keyof typeof elevation;

/** Platform shadow from a shared elevation token — iOS shadow* props, Android `elevation`. */
export function shadow(level: ElevationLevel, color: ColorValue = '#000') {
  const token = elevation[level];
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: token.offsetY },
      shadowOpacity: token.opacity,
      shadowRadius: token.blur
    },
    android: { elevation: Math.max(1, Math.round(token.offsetY + token.blur / 3)) },
    default: {}
  });
}
