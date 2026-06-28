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
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 3000 + delay, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 3000 + delay, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <AnimatedView style={[style, { position: 'absolute', top, left, width: size, height: size, borderRadius: size / 2, backgroundColor: color }]} />
  );
}

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const formSlide = useSharedValue(50);
  const formOpacity = useSharedValue(0);

  useEffect(() => {
    formSlide.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.back(1.15)) });
    formOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const formStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formSlide.value }],
    opacity: formOpacity.value,
  }));

  const handleRegister = async () => {
    setLoading(true);
    await register(name, email, password);
    setLoading(false);
    router.replace('/(tabs)');
  };

  const fields = [
    { key: 'name', label: 'Full Name', icon: 'badge', value: name, set: setName, placeholder: 'Nisal Sanjaya', keyboardType: 'default' as const, secure: false },
    { key: 'email', label: 'Email Address', icon: 'alternate-email', value: email, set: setEmail, placeholder: 'enter@example.com', keyboardType: 'email-address' as const, secure: false },
    { key: 'password', label: 'Password', icon: 'lock-outline', value: password, set: setPassword, placeholder: '••••••••••', keyboardType: 'default' as const, secure: true },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050008' }}>
      <StatusBar barStyle="light-content" backgroundColor="#050008" />
      <FloatingOrb delay={0} size={140} color="rgba(236,72,153,0.09)" top={-50} left={200} />
      <FloatingOrb delay={500} size={80} color="rgba(168,85,247,0.12)" top={300} left={-30} />
      <FloatingOrb delay={300} size={60} color="rgba(34,211,238,0.08)" top={600} left={290} />

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }} showsVerticalScrollIndicator={false}>

        {/* Back button */}
        <AnimatedPress onPress={() => router.back()} style={{ alignSelf: 'flex-start', marginTop: 8, marginBottom: 28 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 14,
          }}>
            <MaterialIcons name="arrow-back" size={18} color="#94A3B8" />
            <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700', marginLeft: 6 }}>Back</Text>
          </View>
        </AnimatedPress>

        {/* Header */}
        <View style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#EC4899', marginRight: 8 }} />
            <Text style={{ color: '#EC4899', fontSize: 10, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase' }}>
              TruthGuard AI
            </Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: '900', marginBottom: 8 }}>Create Account</Text>
          <Text style={{ color: '#64748B', fontSize: 13, lineHeight: 20 }}>
            Join millions verifying news with AI-powered fact detection.
          </Text>
        </View>

        {/* Form */}
        <AnimatedView style={[formStyle, {
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderWidth: 1,
          borderColor: 'rgba(236,72,153,0.2)',
          borderRadius: 28,
          padding: 24,
          marginBottom: 20,
          shadowColor: '#EC4899',
          shadowOpacity: 0.12,
          shadowRadius: 30,
          elevation: 8,
        }]}>
          <View style={{ position: 'absolute', top: 0, left: 40, right: 40, height: 1, backgroundColor: 'rgba(236,72,153,0.4)', borderRadius: 1 }} />

          {fields.map((field) => (
            <View key={field.key} style={{ marginBottom: 16 }}>
              <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
                {field.label}
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderWidth: 1,
                borderColor: focusedField === field.key ? 'rgba(236,72,153,0.5)' : 'rgba(255,255,255,0.08)',
                borderRadius: 16,
                paddingHorizontal: 16,
                minHeight: 54,
                shadowColor: focusedField === field.key ? '#EC4899' : 'transparent',
                shadowOpacity: 0.25,
                shadowRadius: 10,
              }}>
                <MaterialIcons name={field.icon as any} size={18} color={focusedField === field.key ? '#F472B6' : '#475569'} />
                <TextInput
                  value={field.value}
                  onChangeText={field.set}
                  placeholder={field.placeholder}
                  placeholderTextColor="#334155"
                  keyboardType={field.keyboardType}
                  autoCapitalize={field.keyboardType === 'email-address' ? 'none' : 'words'}
                  secureTextEntry={field.secure}
                  onFocus={() => setFocusedField(field.key)}
                  onBlur={() => setFocusedField(null)}
                  style={{ flex: 1, color: '#F1F5F9', fontSize: 14, marginLeft: 12 }}
                />
              </View>
            </View>
          ))}

          <View style={{ marginTop: 8 }}>
            <AnimatedPress onPress={handleRegister} haptic>
              <View style={{
                minHeight: 58,
                borderRadius: 18,
                backgroundColor: loading ? 'rgba(236,72,153,0.4)' : '#BE185D',
                borderWidth: 1,
                borderColor: '#EC4899',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#EC4899',
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 8,
              }}>
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18 }} />
                <MaterialIcons name={loading ? 'autorenew' : 'person-add'} size={20} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14, letterSpacing: 2, marginLeft: 8 }}>
                  {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
                </Text>
              </View>
            </AnimatedPress>
          </View>
        </AnimatedView>

        {/* Features */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {[
            { icon: 'bolt', label: 'AI Powered', color: '#A855F7' },
            { icon: 'public', label: 'Global DB', color: '#22D3EE' },
            { icon: 'lock', label: 'Encrypted', color: '#34D399' },
          ].map((feat) => (
            <View key={feat.label} style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.07)',
              padding: 14,
              borderRadius: 18,
              alignItems: 'center',
            }}>
              <MaterialIcons name={feat.icon as any} size={20} color={feat.color} />
              <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700', marginTop: 6 }}>{feat.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#64748B', fontSize: 14 }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: '#C084FC', fontWeight: '800', fontSize: 14 }}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
