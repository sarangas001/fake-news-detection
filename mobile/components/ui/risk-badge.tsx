import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

interface RiskBadgeProps {
  level: RiskLevel;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const getBadgeConfig = () => {
    switch (level) {
      case 'LOW':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30',
          text: 'text-emerald-400',
          dot: 'bg-emerald-400',
          iconColor: '#34D399',
          icon: 'shield' as const,
          label: 'Low Risk',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30',
          text: 'text-amber-400',
          dot: 'bg-amber-400',
          iconColor: '#FBBF24',
          icon: 'warning' as const,
          label: 'Moderate Risk',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/15 border-orange-500/30',
          text: 'text-orange-400',
          dot: 'bg-orange-400',
          iconColor: '#FB923C',
          icon: 'gpp-maybe' as const,
          label: 'High Risk',
        };
      case 'CRITICAL':
      default:
        return {
          bg: 'bg-red-500/20 border-red-500/40 shadow-red-500/20 shadow-lg',
          text: 'text-red-400',
          dot: 'bg-red-500 animate-ping',
          iconColor: '#F87171',
          icon: 'report' as const,
          label: 'Critical Risk',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View className={`flex-row items-center px-3.5 py-1.5 rounded-full border self-start backdrop-blur-md ${config.bg}`}>
      <View className={`w-2 h-2 rounded-full mr-2 ${config.dot}`} />
      <MaterialIcons name={config.icon} size={16} color={config.iconColor} />
      <Text className={`text-xs font-black uppercase tracking-wider ml-1.5 ${config.text}`}>
        {config.label}
      </Text>
    </View>
  );
};
