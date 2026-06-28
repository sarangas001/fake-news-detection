import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { RiskBadge, RiskLevel } from '@/components/ui/risk-badge';
import { AnimatedPress } from '@/components/ui/animated-press';

const AnimatedView = Animated.View;

interface HistoryItem {
  id: string;
  title: string;
  snippet: string;
  score: number;
  riskLevel: RiskLevel;
  date: string;
  type: 'Real' | 'Fake' | 'Misleading';
}

const historyItems: HistoryItem[] = [
  {
    id: 'rep_101',
    title: 'Solar Efficiency Laboratory Breakthrough Claims',
    snippet: 'Scientists report groundbreaking discovery in renewable solar energy efficiency reaching 45%...',
    score: 88,
    riskLevel: 'LOW',
    date: 'Today · 2:15 PM',
    type: 'Real',
  },
  {
    id: 'rep_102',
    title: 'Miracle Health Drink Cures All Viral Infections',
    snippet: 'Viral audio claims drinking lemon water mixed with baking soda destroys viruses instantly...',
    score: 15,
    riskLevel: 'CRITICAL',
    date: 'Yesterday',
    type: 'Fake',
  },
  {
    id: 'rep_103',
    title: 'New Tax Regulations to Double Property Rates',
    snippet: 'Sensational article claims unprecedented housing tax increases across major metro cities...',
    score: 52,
    riskLevel: 'MODERATE',
    date: '3 days ago',
    type: 'Misleading',
  },
];

type FilterType = 'All' | 'Real' | 'Fake' | 'Misleading';

const FILTER_CONFIG: Record<FilterType, { color: string; borderColor: string; bg: string; icon: string }> = {
  All:        { color: '#22D3EE', borderColor: 'rgba(34,211,238,0.35)', bg: 'rgba(34,211,238,0.1)',   icon: 'grid-view' },
  Real:       { color: '#34D399', borderColor: 'rgba(52,211,153,0.35)', bg: 'rgba(52,211,153,0.1)',   icon: 'verified' },
  Misleading: { color: '#FBBF24', borderColor: 'rgba(251,191,36,0.35)', bg: 'rgba(251,191,36,0.1)',   icon: 'warning' },
  Fake:       { color: '#F87171', borderColor: 'rgba(248,113,113,0.35)', bg: 'rgba(248,113,113,0.1)', icon: 'gpp-bad' },
};

const SCORE_COLOR = (s: number) => s >= 80 ? '#34D399' : s >= 40 ? '#FBBF24' : '#F87171';
const SCORE_GLOW  = (s: number) => s >= 80 ? 'rgba(52,211,153,0.3)' : s >= 40 ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)';

function FilterChip({ label, active, cfg, onPress }: { label: FilterType; active: boolean; cfg: typeof FILTER_CONFIG[FilterType]; onPress: () => void }) {
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    bgOpacity.value = withTiming(active ? 1 : 0, { duration: 200 });
    scale.value = active ? withSpring(1.05, { damping: 12 }) : withTiming(1, { duration: 150 });
  }, [active]);

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPress onPress={onPress} scaleAmount={0.9}>
      <AnimatedView style={[chipStyle, {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        backgroundColor: active ? cfg.bg : 'rgba(255,255,255,0.03)',
        borderColor: active ? cfg.borderColor : 'rgba(255,255,255,0.07)',
        shadowColor: active ? cfg.color : 'transparent',
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }]}>
        <MaterialIcons name={cfg.icon as any} size={14} color={active ? cfg.color : '#475569'} />
        <Text style={{
          color: active ? cfg.color : '#64748B',
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 1,
          marginLeft: 6,
          textTransform: 'uppercase',
        }}>{label}</Text>
      </AnimatedView>
    </AnimatedPress>
  );
}

function HistoryCard({ item, index, onPress }: { item: HistoryItem; index: number; onPress: () => void }) {
  const scoreColor = SCORE_COLOR(item.score);
  const scoreGlow = SCORE_GLOW(item.score);
  const progressW = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      progressW.value = withTiming(item.score, { duration: 800, easing: Easing.out(Easing.ease) });
    }, index * 80);
    return () => clearTimeout(timeout);
  }, []);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressW.value}%` as any,
  }));

  return (
    <AnimatedPress onPress={onPress} scaleAmount={0.97} style={{ marginBottom: 12 }}>
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.07)',
          borderRadius: 24,
          padding: 18,
          overflow: 'hidden',
        }}>
        {/* Top accent bar */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: scoreColor, opacity: 0.35, borderRadius: 24 }} />
        {/* Score glow blob */}
        <View style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: scoreGlow, opacity: 0.3 }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <RiskBadge level={item.riskLevel} />
          <Text style={{ color: '#334155', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>{item.date}</Text>
        </View>

        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginBottom: 6, lineHeight: 20 }} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={{ color: '#475569', fontSize: 12, marginBottom: 14, lineHeight: 17 }} numberOfLines={2}>
          {item.snippet}
        </Text>

        {/* Bottom row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
            <View style={{ flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginRight: 10 }}>
              <AnimatedView style={[progressStyle, { height: '100%', backgroundColor: scoreColor, borderRadius: 2, shadowColor: scoreColor, shadowOpacity: 0.8, shadowRadius: 4 }]} />
            </View>
            <Text style={{ color: scoreColor, fontSize: 12, fontWeight: '900', letterSpacing: -0.3 }}>
              {item.score}%
            </Text>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(168,85,247,0.1)',
            borderWidth: 1,
            borderColor: 'rgba(168,85,247,0.25)',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
          }}>
            <MaterialIcons name="open-in-new" size={12} color="#C084FC" />
            <Text style={{ color: '#C084FC', fontSize: 10, fontWeight: '800', marginLeft: 4, letterSpacing: 1 }}>INSPECT</Text>
          </View>
        </View>
      </Animated.View>
    </AnimatedPress>
  );
}

export default function VerificationHistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const filteredItems = activeFilter === 'All' ? historyItems : historyItems.filter((i) => i.type === activeFilter);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050008' }}>
      <StatusBar barStyle="light-content" backgroundColor="#050008" />

      {/* Ambient orb */}
      <View style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(168,85,247,0.07)' }} />
      <View style={{ position: 'absolute', bottom: 100, left: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(34,211,238,0.05)' }} />

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>

        {/* Header */}
        <Animated.View entering={FadeInDown.springify()} style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#A855F7', marginRight: 8 }} />
            <Text style={{ color: '#A855F7', fontSize: 10, fontWeight: '800', letterSpacing: 4 }}>CORE TELEMETRY LOGS</Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginBottom: 4 }}>History</Text>
          <Text style={{ color: '#334155', fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>
            {historyItems.length} verification reports synced
          </Text>
        </Animated.View>

        {/* Filter chips */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {(Object.keys(FILTER_CONFIG) as FilterType[]).map((f) => (
            <FilterChip
              key={f}
              label={f}
              active={activeFilter === f}
              cfg={FILTER_CONFIG[f]}
              onPress={() => setActiveFilter(f)}
            />
          ))}
        </View>

        {/* List */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item, index }) => (
            <HistoryCard
              item={item}
              index={index}
              onPress={() => router.push(`/analysis/${item.id}`)}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}
