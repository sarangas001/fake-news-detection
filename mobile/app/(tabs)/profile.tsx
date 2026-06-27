import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { AnimatedPress } from '@/components/ui/animated-press';

const AnimatedView = Animated.View;

const STATS = [
  { value: '3',   label: 'Verified',    color: '#34D399', icon: 'verified', glow: 'rgba(52,211,153,0.15)' },
  { value: '1',   label: 'Fake Caught', color: '#F87171', icon: 'gpp-bad',  glow: 'rgba(248,113,113,0.15)' },
  { value: '98%', label: 'Accuracy',    color: '#C084FC', icon: 'bolt',     glow: 'rgba(192,132,252,0.15)' },
];

const MENU_ITEMS = [
  { icon: 'security',      label: 'Security & Privacy',       color: '#C084FC', sub: 'Manage your data controls' },
  { icon: 'notifications', label: 'Fact-Check Alerts',        color: '#22D3EE', sub: 'Push notification settings' },
  { icon: 'info',          label: 'About TruthGuard AI v1.0', color: '#64748B', sub: 'Version info & licenses' },
];

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000 + index * 300, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2000 + index * 300, easing: Easing.inOut(Easing.sin) }),
      ), -1, false
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={{ flex: 1, alignItems: 'center' }}>
      <AnimatedView style={[style, {
        width: 48, height: 48, borderRadius: 14,
        backgroundColor: stat.glow,
        borderWidth: 1,
        borderColor: `${stat.color}40`,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 8,
        shadowColor: stat.color, shadowOpacity: 0.4, shadowRadius: 10,
      }]}>
        <MaterialIcons name={stat.icon as any} size={20} color={stat.color} />
      </AnimatedView>
      <Text style={{ color: stat.color, fontSize: 20, fontWeight: '900' }}>{stat.value}</Text>
      <Text style={{ color: '#475569', fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{stat.label}</Text>
    </Animated.View>
  );
}

function AvatarRing({ initials }: { initials: string }) {
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 10000, easing: Easing.linear }), -1, false);
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  return (
    <View style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
      <AnimatedView style={[style, {
        position: 'absolute', width: 72, height: 72, borderRadius: 36,
        borderWidth: 2, borderColor: 'transparent',
        borderTopColor: '#A855F7', borderRightColor: '#22D3EE',
      }]} />
      <View style={{
        width: 60, height: 60, borderRadius: 18,
        backgroundColor: 'rgba(124,58,237,0.3)',
        borderWidth: 1, borderColor: 'rgba(168,85,247,0.4)',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#A855F7', shadowOpacity: 0.5, shadowRadius: 10,
      }}>
        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900' }}>{initials}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, simpleMode, toggleSimpleMode, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050008' }}>
      <StatusBar barStyle="light-content" backgroundColor="#050008" />

      {/* Ambient orbs */}
      <View style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(168,85,247,0.08)' }} />
      <View style={{ position: 'absolute', bottom: 80, left: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(34,211,238,0.05)' }} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View entering={FadeInDown.springify()} style={{ marginBottom: 24, marginTop: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22D3EE', marginRight: 8 }} />
            <Text style={{ color: '#22D3EE', fontSize: 10, fontWeight: '800', letterSpacing: 4 }}>USER NODE CONTROL</Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '900' }}>Profile</Text>
        </Animated.View>

        {/* ── User card ── */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderWidth: 1,
          borderColor: 'rgba(168,85,247,0.2)',
          borderRadius: 24,
          padding: 20,
          marginBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          overflow: 'hidden',
          shadowColor: '#A855F7', shadowOpacity: 0.1, shadowRadius: 20,
        }}>
          {/* top accent */}
          <View style={{ position: 'absolute', top: 0, left: 30, right: 30, height: 1, backgroundColor: 'rgba(168,85,247,0.4)', borderRadius: 1 }} />

          <AvatarRing initials={initials} />

          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>{user?.name || 'Fact Checker'}</Text>
            <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>{user?.email || 'user@example.com'}</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(168,85,247,0.1)',
              borderWidth: 1,
              borderColor: 'rgba(168,85,247,0.3)',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              alignSelf: 'flex-start',
              marginTop: 8,
            }}>
              <MaterialIcons name="workspace-premium" size={12} color="#C084FC" />
              <Text style={{ color: '#C084FC', fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginLeft: 4 }}>FREE LICENSE</Text>
            </View>
          </View>
          <AnimatedPress onPress={() => {}} scaleAmount={0.85}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
              padding: 10,
              borderRadius: 12,
            }}>
              <MaterialIcons name="edit" size={16} color="#64748B" />
            </View>
          </AnimatedPress>
        </Animated.View>

        {/* ── Stats Bar ── */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
          borderRadius: 24,
          padding: 20,
          marginBottom: 20,
          flexDirection: 'row',
        }}>
          {STATS.map((stat, i) => (
            <React.Fragment key={stat.label}>
              <StatCard stat={stat} index={i} />
              {i < STATS.length - 1 && (
                <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 8 }} />
              )}
            </React.Fragment>
          ))}
        </Animated.View>

        {/* ── Accessibility ── */}
        <Text style={{ color: '#334155', fontSize: 10, fontWeight: '800', letterSpacing: 3, marginBottom: 10, paddingLeft: 4, textTransform: 'uppercase' }}>
          Accessibility
        </Text>
        <Animated.View entering={FadeInDown.delay(200).springify()} style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderWidth: 1,
          borderColor: simpleMode ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.07)',
          borderRadius: 22,
          padding: 18,
          marginBottom: 20,
          flexDirection: 'row',
          alignItems: 'center',
          overflow: 'hidden',
          shadowColor: simpleMode ? '#FBBF24' : 'transparent',
          shadowOpacity: 0.15, shadowRadius: 12,
        }}>
          <View style={{ position: 'absolute', bottom: 0, right: 0, width: 60, height: 2, backgroundColor: simpleMode ? 'rgba(251,191,36,0.3)' : 'transparent' }} />
          <View style={{
            backgroundColor: 'rgba(251,191,36,0.1)',
            borderWidth: 1,
            borderColor: 'rgba(251,191,36,0.25)',
            padding: 12, borderRadius: 16, marginRight: 14,
          }}>
            <MaterialIcons name="accessibility-new" size={24} color="#FBBF24" />
          </View>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>Simple Mode</Text>
            <Text style={{ color: '#64748B', fontSize: 12, marginTop: 3, lineHeight: 17 }}>
              Convert analysis values to plain text layouts automatically.
            </Text>
            <Text style={{ color: simpleMode ? '#FBBF24' : '#334155', fontSize: 9, fontWeight: '800', marginTop: 6, letterSpacing: 2 }}>
              {simpleMode ? 'ENABLED' : 'DISABLED'}
            </Text>
          </View>
          <Switch
            value={simpleMode}
            onValueChange={toggleSimpleMode}
            trackColor={{ false: 'rgba(255,255,255,0.08)', true: 'rgba(124,58,237,0.5)' }}
            thumbColor={simpleMode ? '#A855F7' : '#475569'}
          />
        </Animated.View>

        {/* ── Menu ── */}
        <Text style={{ color: '#334155', fontSize: 10, fontWeight: '800', letterSpacing: 3, marginBottom: 10, paddingLeft: 4, textTransform: 'uppercase' }}>
          System Preferences
        </Text>
        <Animated.View entering={FadeInDown.delay(250).springify()} style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.07)',
          borderRadius: 22,
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          {MENU_ITEMS.map((item, i) => (
            <AnimatedPress key={item.label} onPress={() => {}} scaleAmount={0.98}>
              <View style={{
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomWidth: i < MENU_ITEMS.length - 1 ? 1 : 0,
                borderBottomColor: 'rgba(255,255,255,0.04)',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.07)',
                    padding: 8, borderRadius: 12, marginRight: 12,
                  }}>
                    <MaterialIcons name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <View>
                    <Text style={{ color: '#E2E8F0', fontSize: 13, fontWeight: '700' }}>{item.label}</Text>
                    <Text style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>{item.sub}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#334155" />
              </View>
            </AnimatedPress>
          ))}
        </Animated.View>

        {/* ── Logout button ── */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <AnimatedPress onPress={handleLogout} haptic scaleAmount={0.95}>
            <View style={{
              minHeight: 58,
              borderRadius: 18,
              backgroundColor: 'rgba(239,68,68,0.1)',
              borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.3)',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#EF4444', shadowOpacity: 0.2, shadowRadius: 12,
            }}>
              <MaterialIcons name="logout" size={18} color="#F87171" />
              <Text style={{ color: '#F87171', fontSize: 14, fontWeight: '800', letterSpacing: 2, marginLeft: 10 }}>
                DISCONNECT NODE
              </Text>
            </View>
          </AnimatedPress>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
