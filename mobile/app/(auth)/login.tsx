import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { AnimatedPress } from '@/components/ui/animated-press';

const AnimatedView = Animated.View;

function FloatingOrb({ delay, size, color, top, left }: { delay: number; size: number; color: string; top: number; left: number }) {
  const y = useSharedValue(0);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(-18, { duration: 2800 + delay, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2800 + delay, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000 + delay }),
        withTiming(0.2, { duration: 2000 + delay }),
      ),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedView
      style={[
        style,
        {
          position: 'absolute',
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.8,
          shadowRadius: 20,
          elevation: 5,
        },
      ]}
    />
  );
}

function PulsingDot() {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 700, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedView style={[style, { width: 8, height: 8, borderRadius: 4, backgroundColor: '#A855F7' }]} />
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const logoRotate = useSharedValue(0);
  const formSlide = useSharedValue(40);
  const formOpacity = useSharedValue(0);

  useEffect(() => {
    logoRotate.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
    formSlide.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.back(1.2)) });
    formOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${logoRotate.value}deg` }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formSlide.value }],
    opacity: formOpacity.value,
  }));

  const handleLogin = async () => {
    setLoading(true);
    await login(email, password);
    setLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050008' }}>
      <StatusBar barStyle="light-content" backgroundColor="#050008" />

      {/* Floating ambient orbs */}
      <FloatingOrb delay={0} size={120} color="rgba(168,85,247,0.12)" top={-30} left={-40} />
      <FloatingOrb delay={400} size={80} color="rgba(34,211,238,0.10)" top={180} left={280} />
      <FloatingOrb delay={800} size={60} color="rgba(139,92,246,0.15)" top={400} left={20} />
      <FloatingOrb delay={200} size={90} color="rgba(236,72,153,0.08)" top={600} left={260} />

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>

        {/* ── Brand Hero ── */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          {/* Spinning outer ring */}
          <View style={{ width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <AnimatedView style={[logoStyle, {
              position: 'absolute',
              width: 96,
              height: 96,
              borderRadius: 48,
              borderWidth: 2,
              borderColor: 'transparent',
              borderTopColor: '#A855F7',
              borderRightColor: '#22D3EE',
            }]} />
            <View style={{
              width: 78,
              height: 78,
              borderRadius: 39,
              backgroundColor: 'rgba(139,92,246,0.15)',
              borderWidth: 1,
              borderColor: 'rgba(139,92,246,0.3)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#A855F7',
              shadowOpacity: 0.6,
              shadowRadius: 20,
              elevation: 10,
            }}>
              <MaterialIcons name="security" size={36} color="#C084FC" />
            </View>
          </View>

          <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: '900', letterSpacing: -0.5 }}>
            TruthGuard AI
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <PulsingDot />
            <Text style={{ color: '#A855F7', fontSize: 10, fontWeight: '800', letterSpacing: 4, marginLeft: 8 }}>
              FACT DETECTION SYSTEM
            </Text>
          </View>
          <Text style={{ color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 10, lineHeight: 20 }}>
            AI-powered news verification for everyone
          </Text>
        </View>

        {/* ── Glassmorphic Login Card ── */}
        <AnimatedView style={[formStyle, {
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderWidth: 1,
          borderColor: 'rgba(168,85,247,0.2)',
          borderRadius: 28,
          padding: 24,
          marginBottom: 20,
          shadowColor: '#A855F7',
          shadowOpacity: 0.15,
          shadowRadius: 30,
          elevation: 8,
        }]}>
          {/* Top accent line */}
          <View style={{ position: 'absolute', top: 0, left: 40, right: 40, height: 1, backgroundColor: 'rgba(168,85,247,0.5)', borderRadius: 1 }} />

          <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 4 }}>Welcome back</Text>
          <Text style={{ color: '#64748B', fontSize: 12, marginBottom: 24 }}>Sign in to your account</Text>

          {/* Email */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>Email</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderWidth: 1,
              borderColor: focusedField === 'email' ? 'rgba(168,85,247,0.6)' : 'rgba(255,255,255,0.08)',
              borderRadius: 16,
              paddingHorizontal: 16,
              minHeight: 54,
              shadowColor: focusedField === 'email' ? '#A855F7' : 'transparent',
              shadowOpacity: 0.3,
              shadowRadius: 10,
            }}>
              <MaterialIcons name="alternate-email" size={18} color={focusedField === 'email' ? '#C084FC' : '#475569'} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="enter@example.com"
                placeholderTextColor="#334155"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                style={{ flex: 1, color: '#F1F5F9', fontSize: 14, marginLeft: 12 }}
              />
            </View>
          </View>

          {/* Password */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>Password</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderWidth: 1,
              borderColor: focusedField === 'password' ? 'rgba(168,85,247,0.6)' : 'rgba(255,255,255,0.08)',
              borderRadius: 16,
              paddingHorizontal: 16,
              minHeight: 54,
              shadowColor: focusedField === 'password' ? '#A855F7' : 'transparent',
              shadowOpacity: 0.3,
              shadowRadius: 10,
            }}>
              <MaterialIcons name="lock-outline" size={18} color={focusedField === 'password' ? '#C084FC' : '#475569'} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••"
                placeholderTextColor="#334155"
                secureTextEntry={!showPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                style={{ flex: 1, color: '#F1F5F9', fontSize: 14, marginLeft: 12 }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={18} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Animated Sign In Button */}
          <AnimatedPress onPress={handleLogin} haptic>
            <View style={{
              minHeight: 58,
              borderRadius: 18,
              backgroundColor: loading ? 'rgba(139,92,246,0.4)' : '#7C3AED',
              borderWidth: 1,
              borderColor: '#A855F7',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#A855F7',
              shadowOpacity: 0.5,
              shadowRadius: 20,
              elevation: 8,
            }}>
              {/* Top shimmer */}
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 18 }} />
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="autorenew" size={20} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14, letterSpacing: 2, marginLeft: 8 }}>SIGNING IN...</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="login" size={20} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14, letterSpacing: 2, marginLeft: 8 }}>SIGN IN</Text>
                </View>
              )}
            </View>
          </AnimatedPress>
        </AnimatedView>

        {/* Register link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ color: '#64748B', fontSize: 14 }}>{"Don't have an account? "}</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={{ color: '#C084FC', fontWeight: '800', fontSize: 14 }}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Trust indicators */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          {[
            { icon: 'lock', label: 'Secure' },
            { icon: 'flash-on', label: 'Fast AI' },
            { icon: 'public', label: '12K+ Sources' },
          ].map((item, idx) => (
            <View key={idx} style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.07)',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 20,
            }}>
              <MaterialIcons name={item.icon as any} size={12} color="#A855F7" />
              <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700', marginLeft: 4 }}>{item.label}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
