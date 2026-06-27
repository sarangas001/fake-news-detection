import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  StatusBar,
  Dimensions,
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
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { InputSelectorTabs, InputMode } from '@/components/ui/input-selector-tabs';
import { AnimatedPress } from '@/components/ui/animated-press';

const AnimatedView = Animated.View;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Floating ambient orbs ──
function Orb({ size, color, top, left, duration, delay }: any) {
  const y = useSharedValue(0);
  const scale = useSharedValue(1);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: duration, easing: Easing.inOut(Easing.sin) }),
      ), -1, false
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: duration * 0.8 }),
        withTiming(1, { duration: duration * 0.8 }),
      ), -1, true
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { scale: scale.value }],
  }));
  return (
    <AnimatedView style={[style, {
      position: 'absolute', top, left, width: size, height: size,
      borderRadius: size / 2, backgroundColor: color,
    }]} />
  );
}

// ── Pulsing scan ring ──
function ScanRing({ active, color }: { active: boolean; color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 900, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 900, easing: Easing.in(Easing.ease) }),
        ), -1, false
      );
      opacity.value = withRepeat(
        withSequence(withTiming(0, { duration: 900 }), withTiming(0.5, { duration: 900 })),
        -1, false
      );
    } else {
      scale.value = withTiming(1, { duration: 400 });
      opacity.value = withTiming(0.3, { duration: 400 });
    }
  }, [active]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  return (
    <AnimatedView style={[style, {
      position: 'absolute',
      width: 160, height: 160, borderRadius: 80,
      borderWidth: 2, borderColor: color,
    }]} />
  );
}

// ── Central Analysis Blob ──
function AnalysisBlob({ state }: { state: 'idle' | 'scanning' }) {
  const rotation = useSharedValue(0);
  const innerScale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: state === 'scanning' ? 2000 : 6000, easing: Easing.linear }),
      -1, false
    );
    innerScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.95, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ), -1, false
    );
  }, [state]);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
  }));

  const color1 = state === 'scanning' ? '#A855F7' : '#6366F1';
  const color2 = state === 'scanning' ? '#22D3EE' : '#818CF8';

  return (
    <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer spinning ring */}
      <AnimatedView style={[outerStyle, {
        position: 'absolute', width: 140, height: 140, borderRadius: 70,
        borderWidth: 2, borderColor: 'transparent',
        borderTopColor: color1, borderRightColor: color2,
      }]} />
      {/* Second ring counter-rotating */}
      <AnimatedView style={[outerStyle, {
        position: 'absolute', width: 110, height: 110, borderRadius: 55,
        borderWidth: 1.5, borderColor: 'transparent',
        borderBottomColor: color1, borderLeftColor: color2,
      }]} />
      {/* Inner pulsing blob */}
      <AnimatedView style={[innerStyle, {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: state === 'scanning' ? 'rgba(168,85,247,0.2)' : 'rgba(99,102,241,0.15)',
        borderWidth: 1,
        borderColor: state === 'scanning' ? 'rgba(168,85,247,0.5)' : 'rgba(99,102,241,0.3)',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: color1, shadowOpacity: 0.6, shadowRadius: 20, elevation: 10,
      }]}>
        <MaterialIcons
          name={state === 'scanning' ? 'wifi-tethering' : 'radar'}
          size={32}
          color={color1}
        />
      </AnimatedView>
      {/* Scan rings */}
      <ScanRing active={state === 'scanning'} color={color1} />
    </View>
  );
}

// ── Animated progress bar ──
function ProgressBar({ progress }: { progress: number }) {
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(progress, { duration: 600, easing: Easing.out(Easing.ease) });
  }, [progress]);
  const style = useAnimatedStyle(() => ({ width: `${width.value}%` as any }));
  return (
    <View style={{ width: 220, height: 3, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
      <AnimatedView style={[style, {
        height: '100%', backgroundColor: '#A855F7',
        shadowColor: '#A855F7', shadowOpacity: 1, shadowRadius: 6,
      }]} />
    </View>
  );
}

export default function VerifyHomeScreen() {
  const router = useRouter();
  const { simpleMode } = useAuth();
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [focusedInput, setFocusedInput] = useState(false);

  const analysisSteps = [
    'ACQUIRING NEURAL CHANNELS...',
    'CROSS-MATCHING TELEMETRY STREAMS...',
    'EXTRACTING BIAS VECTOR SHAPES...',
    'SYNTHESIZING CREDIBILITY RATIO...',
  ];

  const headerY = useSharedValue(-30);
  const headerOpacity = useSharedValue(0);
  useEffect(() => {
    headerY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.back(1.1)) });
    headerOpacity.value = withTiming(1, { duration: 500 });
  }, []);
  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerY.value }],
    opacity: headerOpacity.value,
  }));

  const handlePaste = () => {
    if (inputMode === 'url') {
      setInputText('https://example-news.com/solar-energy-breakthrough-2026');
    } else {
      setInputText('Scientists report a groundbreaking discovery in renewable solar energy efficiency reaching 45% in laboratory testing, promising cheaper energy within 3 years.');
    }
  };

  const handleStartAnalysis = () => {
    if (!inputText.trim() && inputMode !== 'image') return;
    setIsAnalyzing(true);
    setAnalysisStep(0);
    const interval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev >= analysisSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAnalyzing(false);
            router.push('/analysis/rep_101');
          }, 700);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const canScan = inputText.trim().length > 0 || inputMode === 'image';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050008' }}>
      <StatusBar barStyle="light-content" backgroundColor="#050008" />

      {/* Ambient orbs */}
      <Orb size={150} color="rgba(168,85,247,0.10)" top={-40} left={-40} duration={3500} delay={0} />
      <Orb size={90} color="rgba(34,211,238,0.08)" top={200} left={280} duration={4000} delay={500} />
      <Orb size={70} color="rgba(236,72,153,0.07)" top={550} left={30} duration={3200} delay={200} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <AnimatedView style={[headerStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, marginTop: 4 }]}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
              <View style={{
                width: 8, height: 8, borderRadius: 4, backgroundColor: '#22D3EE',
                shadowColor: '#22D3EE', shadowOpacity: 1, shadowRadius: 6, marginRight: 8,
              }} />
              <Text style={{ color: '#22D3EE', fontSize: 10, fontWeight: '800', letterSpacing: 4 }}>TRUTHGUARD AI CORE</Text>
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 }}>Fact Engine</Text>
          </View>
          <View style={{
            backgroundColor: 'rgba(34,211,238,0.08)',
            borderWidth: 1,
            borderColor: 'rgba(34,211,238,0.25)',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
          }}>
            <Text style={{ color: '#22D3EE', fontSize: 9, fontWeight: '800', letterSpacing: 2 }}>NODE: ACTIVE</Text>
          </View>
        </AnimatedView>

        {/* ── Central Blob ── */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <AnalysisBlob state="idle" />
          <Text style={{ color: '#334155', fontSize: 9, fontWeight: '800', letterSpacing: 4, marginTop: 12, textTransform: 'uppercase' }}>
            Hub: Waiting for Input
          </Text>
        </View>

        {/* ── Input Panel ── */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderWidth: 1,
          borderColor: focusedInput ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.07)',
          borderRadius: 28,
          padding: 20,
          marginBottom: 16,
          shadowColor: focusedInput ? '#A855F7' : 'transparent',
          shadowOpacity: 0.15,
          shadowRadius: 20,
        }}>
          {/* Corner accent lines */}
          <View style={{ position: 'absolute', top: 0, right: 40, width: 40, height: 1.5, backgroundColor: '#22D3EE', borderRadius: 1 }} />
          <View style={{ position: 'absolute', bottom: 40, left: 0, width: 1.5, height: 40, backgroundColor: '#A855F7', borderRadius: 1 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>Input Terminal</Text>
            <AnimatedPress onPress={handlePaste} scaleAmount={0.9}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(168,85,247,0.1)',
                borderWidth: 1,
                borderColor: 'rgba(168,85,247,0.3)',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
              }}>
                <MaterialIcons name="bolt" size={12} color="#C084FC" />
                <Text style={{ color: '#C084FC', fontSize: 10, fontWeight: '800', marginLeft: 4, letterSpacing: 1.5 }}>LOAD SAMPLE</Text>
              </View>
            </AnimatedPress>
          </View>

          <InputSelectorTabs activeMode={inputMode} onSelectMode={setInputMode} />

          {inputMode === 'image' ? (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(168,85,247,0.2)',
              borderStyle: 'dashed',
              borderRadius: 20,
              padding: 32,
              marginBottom: 8,
            }}>
              <View style={{
                backgroundColor: 'rgba(168,85,247,0.1)',
                borderWidth: 1,
                borderColor: 'rgba(168,85,247,0.25)',
                width: 56,
                height: 56,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}>
                <MaterialIcons name="center-focus-strong" size={28} color="#C084FC" />
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginBottom: 6 }}>ATTACH SCREENSHOT</Text>
              <Text style={{ color: '#64748B', fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 16 }}>
                System will scan pixels and transcribe texts
              </Text>
              <AnimatedPress onPress={() => setInputText('Screenshot_Attach_Core.png')}>
                <View style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: inputText ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)',
                  borderWidth: 1,
                  borderColor: inputText ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)',
                }}>
                  <Text style={{ color: inputText ? '#34D399' : '#94A3B8', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 }}>
                    {inputText ? '✓ LINKED' : 'SELECT FROM DISK'}
                  </Text>
                </View>
              </AnimatedPress>
            </View>
          ) : (
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={inputMode === 'url'
                ? 'Enter HTTP news URL string...'
                : 'Paste article text or headline to analyze...'}
              placeholderTextColor="#1E293B"
              multiline={inputMode === 'text'}
              numberOfLines={inputMode === 'text' ? 4 : 1}
              textAlignVertical={inputMode === 'text' ? 'top' : 'center'}
              onFocus={() => setFocusedInput(true)}
              onBlur={() => setFocusedInput(false)}
              style={{
                color: '#FFFFFF',
                fontSize: 13,
                fontFamily: 'monospace',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderWidth: 1,
                borderColor: inputText ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.06)',
                padding: 14,
                borderRadius: 16,
                minHeight: inputMode === 'text' ? 110 : 52,
                marginBottom: 12,
              }}
            />
          )}

          {/* SCAN button */}
          <AnimatedPress onPress={handleStartAnalysis} disabled={!canScan} scaleAmount={0.95}>
            <View style={{
              minHeight: 58,
              borderRadius: 18,
              backgroundColor: canScan ? '#7C3AED' : 'rgba(255,255,255,0.03)',
              borderWidth: 1,
              borderColor: canScan ? '#A855F7' : 'rgba(255,255,255,0.06)',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: canScan ? '#A855F7' : 'transparent',
              shadowOpacity: 0.5,
              shadowRadius: 18,
              elevation: 8,
            }}>
              {canScan && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18 }} />}
              <MaterialIcons name="bolt" size={22} color={canScan ? '#FFFFFF' : '#334155'} />
              <Text style={{
                color: canScan ? '#FFFFFF' : '#334155',
                fontSize: 13,
                fontWeight: '800',
                letterSpacing: 3,
                marginLeft: 8,
              }}>INITIATE SCAN</Text>
            </View>
          </AnimatedPress>
        </View>

        {/* ── System info bar ── */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
          borderRadius: 20,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: 'rgba(34,211,238,0.08)',
            borderWidth: 1,
            borderColor: 'rgba(34,211,238,0.15)',
            padding: 8,
            borderRadius: 12,
            marginRight: 12,
          }}>
            <MaterialIcons name="settings-ethernet" size={18} color="#22D3EE" />
          </View>
          <Text style={{ color: '#475569', fontSize: 11, flex: 1, lineHeight: 16 }}>
            FACTCHECK SYSTEM: 12K+ GLOBAL SOURCES RETRIEVED
          </Text>
          <Text style={{ color: '#22D3EE', fontSize: 9, fontWeight: '800', letterSpacing: 2 }}>v1.0</Text>
        </View>

      </ScrollView>

      {/* ── Scan Modal ── */}
      <Modal visible={isAnalyzing} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(5,0,8,0.97)', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Orb size={200} color="rgba(168,85,247,0.12)" top={-60} left={-60} duration={3000} delay={0} />
          <Orb size={120} color="rgba(34,211,238,0.08)" top={400} left={200} duration={3500} delay={300} />

          <AnalysisBlob state="scanning" />

          <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginTop: 32, letterSpacing: -0.5 }}>
            Processing Signal
          </Text>
          <Text style={{ color: '#A855F7', fontSize: 10, fontWeight: '800', letterSpacing: 4, marginTop: 6, marginBottom: 28, textAlign: 'center' }}>
            {analysisSteps[analysisStep]}
          </Text>
          <ProgressBar progress={((analysisStep + 1) / analysisSteps.length) * 100} />
          <Text style={{ color: '#334155', fontSize: 10, fontWeight: '700', marginTop: 12, letterSpacing: 2 }}>
            STEP {analysisStep + 1} / {analysisSteps.length}
          </Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
