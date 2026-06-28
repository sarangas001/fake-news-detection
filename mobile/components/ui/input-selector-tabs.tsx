import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export type InputMode = 'text' | 'url' | 'image';

interface InputSelectorTabsProps {
  activeMode: InputMode;
  onSelectMode: (mode: InputMode) => void;
}

const TABS: { mode: InputMode; label: string; icon: keyof typeof MaterialIcons.glyphMap; color: string }[] = [
  { mode: 'text',  label: 'Text',       icon: 'segment',              color: '#A855F7' },
  { mode: 'url',   label: 'URL',        icon: 'language',             color: '#22D3EE' },
  { mode: 'image', label: 'Screenshot', icon: 'center-focus-strong',  color: '#EC4899' },
];

function Tab({ tab, isActive, onPress }: { tab: typeof TABS[0]; isActive: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = isActive ? withSpring(1.03, { damping: 10, stiffness: 200 }) : withTiming(1, { duration: 200 });
    bgOpacity.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onPress();
  };

  return (
    <Animated.View style={[style, { flex: 1 }]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 11,
          paddingHorizontal: 6,
          borderRadius: 14,
          backgroundColor: isActive ? `${tab.color}18` : 'transparent',
          borderWidth: isActive ? 1 : 0,
          borderColor: isActive ? `${tab.color}40` : 'transparent',
          minHeight: 48,
        }}>
        <MaterialIcons name={tab.icon} size={16} color={isActive ? tab.color : '#475569'} />
        <Text style={{
          marginLeft: 6,
          fontSize: 11,
          fontWeight: isActive ? '800' : '600',
          color: isActive ? tab.color : '#475569',
          letterSpacing: 0.5,
        }}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export const InputSelectorTabs: React.FC<InputSelectorTabsProps> = ({
  activeMode,
  onSelectMode,
}) => {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.07)',
      padding: 4,
      borderRadius: 18,
      marginBottom: 16,
      gap: 4,
    }}>
      {TABS.map((tab) => (
        <Tab
          key={tab.mode}
          tab={tab}
          isActive={activeMode === tab.mode}
          onPress={() => onSelectMode(tab.mode)}
        />
      ))}
    </View>
  );
};
