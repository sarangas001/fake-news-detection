import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface AnimatedPressProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  className?: string;
  haptic?: boolean;
  scaleAmount?: number;
  disabled?: boolean;
}

export const AnimatedPress: React.FC<AnimatedPressProps> = ({
  children,
  onPress,
  style,
  className,
  haptic = true,
  scaleAmount = 0.93,
  disabled = false,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleAmount, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.85, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 250 });
    opacity.value = withTiming(1, { duration: 120 });
  };

  const handlePress = () => {
    if (disabled) return;
    if (haptic) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    }
    onPress?.();
  };

  return (
    <Animated.View style={[animStyle, style]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={disabled}
        className={className}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};
