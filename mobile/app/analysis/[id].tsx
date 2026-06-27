import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { AnimatedPress } from '@/components/ui/animated-press';

const AnimatedView = Animated.View;

// ── Floating ambient orb ──
function Orb({ size, color, top, left, duration }: { size: number; color: string; top: number; left: number; duration: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(-18, { duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.sin) }),
      ), -1, false
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <AnimatedView style={[style, { position: 'absolute', top, left, width: size, height: size, borderRadius: size / 2, backgroundColor: color }]} />
  );
}

// ── Animated trust score counter ──
function AnimatedScore({ score, color }: { score: number; color: string }) {
  const displayScore = useSharedValue(0);
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    let current = 0;
    const step = score / 40;
    const timer = setInterval(() => {
      current = Math.min(current + step, score);
      setDisplayValue(Math.round(current));
      if (current >= score) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [score]);

  return (
    <Text style={{ color, fontSize: 80, fontWeight: '900', letterSpacing: -4, lineHeight: 88 }}>
      {displayValue}
      <Text style={{ fontSize: 36, letterSpacing: 0 }}>%</Text>
    </Text>
  );
}

// ── Spinning verdict ring ──
function VerdictRing({ isVerified }: { isVerified: boolean }) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }), -1, false
    );
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));
  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const primaryColor = isVerified ? '#34D399' : '#F87171';
  const secondaryColor = isVerified ? '#22D3EE' : '#FB923C';

  return (
    <View style={{ width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginVertical: 16 }}>
      {/* Outer spinning ring */}
      <AnimatedView style={[outerStyle, {
        position: 'absolute', width: 160, height: 160, borderRadius: 80,
        borderWidth: 2.5, borderColor: 'transparent',
        borderTopColor: primaryColor, borderRightColor: secondaryColor,
      }]} />
      {/* Second ring (slower, counter) */}
      <AnimatedView style={[{ transform: [{ rotate: '45deg' }] }, {
        position: 'absolute', width: 130, height: 130, borderRadius: 65,
        borderWidth: 1.5, borderColor: 'transparent',
        borderBottomColor: `${primaryColor}60`, borderLeftColor: `${secondaryColor}60`,
      }]} />
      {/* Inner glow orb */}
      <AnimatedView style={[innerStyle, {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: isVerified ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
        borderWidth: 1.5,
        borderColor: isVerified ? 'rgba(52,211,153,0.35)' : 'rgba(248,113,113,0.35)',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: primaryColor, shadowOpacity: 0.6, shadowRadius: 20, elevation: 10,
      }]}>
        <MaterialIcons
          name={isVerified ? 'verified' : 'gpp-bad'}
          size={40}
          color={primaryColor}
        />
      </AnimatedView>
    </View>
  );
}

// ── Accordion section ──
function AccordionSection({
  sectionKey, expandedSection, onToggle, icon, iconColor, title, children,
}: {
  sectionKey: string; expandedSection: string | null; onToggle: (key: string) => void;
  icon: string; iconColor: string; title: string; children: React.ReactNode;
}) {
  const isOpen = expandedSection === sectionKey;
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    height.value = withTiming(isOpen ? 1 : 0, { duration: 280, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(isOpen ? 1 : 0, { duration: 220 });
  }, [isOpen]);

  const contentStyle = useAnimatedStyle(() => ({
    maxHeight: height.value * 600,
    opacity: opacity.value,
    overflow: 'hidden',
  }));

  return (
    <View style={{
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderWidth: 1,
      borderColor: isOpen ? `${iconColor}30` : 'rgba(255,255,255,0.07)',
      borderRadius: 22,
      marginBottom: 12,
      overflow: 'hidden',
      shadowColor: isOpen ? iconColor : 'transparent',
      shadowOpacity: 0.1, shadowRadius: 12,
    }}>
      <AnimatedPress onPress={() => onToggle(sectionKey)} scaleAmount={0.98}>
        <View style={{
          padding: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              backgroundColor: `${iconColor}15`,
              borderWidth: 1,
              borderColor: `${iconColor}30`,
              padding: 10, borderRadius: 14, marginRight: 14,
            }}>
              <MaterialIcons name={icon as any} size={18} color={iconColor} />
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 }}>{title}</Text>
          </View>
          <Animated.View style={{
            transform: [{ rotate: isOpen ? '180deg' : '0deg' }],
          }}>
            <MaterialIcons name="keyboard-arrow-down" size={22} color="#475569" />
          </Animated.View>
        </View>
      </AnimatedPress>

      <AnimatedView style={contentStyle}>
        <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', padding: 18, paddingTop: 14 }}>
          {children}
        </View>
      </AnimatedView>
    </View>
  );
}

export default function IntelligenceReportScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { simpleMode } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>('indicators');

  const report = {
    id: id || 'rep_101',
    title: 'Solar Efficiency Laboratory Breakthrough Claims',
    score: 98,
    riskLevel: 'LOW' as const,
    timestamp: 'Just now',
    simpleSummary: 'Safe to Share. This news is backed by verified scientific research. The claims are accurate and the source is trustworthy.',
    detailedSummary: 'Multi-layer AI analysis cross-referenced this article against 12,400+ global repositories, peer-reviewed publications, and primary source interviews. Zero clickbait signals detected. Credibility vectors show high scientific fidelity.',
    keyIndicators: [
      { type: 'positive', text: 'Cites peer-reviewed research papers with verifiable DOI references.' },
      { type: 'positive', text: 'Publisher domain holds a 94% historic trust rating across neutral fact-checkers.' },
      { type: 'neutral', text: 'Lab-stage efficiency — commercial availability is estimated 3+ years away.' },
    ],
    biasMetrics: {
      politicalBias: 'Neutral / Minimal',
      emotionalTone: 'Objective Scientific',
      clickbaitScore: '12% (Very Low)',
      sourceCredibility: '94%',
    },
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const isVerified = report.score >= 80;
  const primaryColor = isVerified ? '#34D399' : '#F87171';
  const glowColor = isVerified ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050008' }}>
      <StatusBar barStyle="light-content" backgroundColor="#050008" />

      {/* Custom Premium Header Panel */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(5,0,8,0.95)',
        zIndex: 10,
      }}>
        <AnimatedPress onPress={() => router.back()} scaleAmount={0.88}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
          }}>
            <MaterialIcons name="arrow-back" size={16} color="#94A3B8" />
            <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '800', marginLeft: 4 }}>BACK</Text>
          </View>
        </AnimatedPress>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 2 }}>INTELLIGENCE REPORT</Text>
          <Text style={{ color: '#475569', fontSize: 8, fontWeight: '800', letterSpacing: 1, marginTop: 2 }}>TELEMETRY NODE</Text>
        </View>

        <View style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: 'rgba(34,211,238,0.1)',
          borderWidth: 1,
          borderColor: 'rgba(34,211,238,0.25)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <MaterialIcons name="insights" size={18} color="#22D3EE" />
        </View>
      </View>

      {/* Ambient orbs */}
      <Orb size={180} color={isVerified ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)'} top={-60} left={-40} duration={4000} />
      <Orb size={100} color="rgba(168,85,247,0.07)" top={300} left={260} duration={3500} />
      <Orb size={80} color="rgba(34,211,238,0.05)" top={600} left={20} duration={3200} />

      <ScrollView contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>

        {/* ── Hero Verdict Card ── */}
        <Animated.View entering={FadeInDown.springify()} style={{
          margin: 16,
          marginBottom: 12,
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderWidth: 1,
          borderColor: `${primaryColor}25`,
          borderRadius: 28,
          padding: 24,
          alignItems: 'center',
          overflow: 'hidden',
          shadowColor: primaryColor,
          shadowOpacity: 0.15,
          shadowRadius: 30,
          elevation: 10,
        }}>
          {/* Top glow accent */}
          <View style={{ position: 'absolute', top: 0, left: 40, right: 40, height: 1.5, backgroundColor: primaryColor, opacity: 0.6, borderRadius: 1 }} />
          {/* Background glow blob */}
          <View style={{ position: 'absolute', top: -40, alignSelf: 'center', width: 200, height: 200, borderRadius: 100, backgroundColor: glowColor }} />

          {/* Report telemetry ID */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: primaryColor, marginRight: 8 }} />
            <Text style={{ color: '#475569', fontSize: 9, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase' }}>
              Report Node // {report.id}
            </Text>
          </View>

          {/* Status badge */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isVerified ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
            borderWidth: 1,
            borderColor: isVerified ? 'rgba(52,211,153,0.35)' : 'rgba(248,113,113,0.35)',
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: 20,
            marginBottom: 4,
          }}>
            <MaterialIcons name={isVerified ? 'verified' : 'gpp-bad'} size={14} color={primaryColor} />
            <Text style={{ color: primaryColor, fontSize: 11, fontWeight: '800', letterSpacing: 2, marginLeft: 6 }}>
              {isVerified ? 'VERIFIED CREDIBLE' : 'MISINFORMATION DETECTED'}
            </Text>
          </View>

          {/* Spinning verdict ring */}
          <VerdictRing isVerified={isVerified} />

          {/* Animated trust score */}
          <AnimatedScore score={report.score} color={primaryColor} />
          <Text style={{ color: '#475569', fontSize: 11, fontWeight: '800', letterSpacing: 4, marginTop: 6, marginBottom: 16 }}>
            TRUST COEFFICIENT
          </Text>

          {/* Article title */}
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800', textAlign: 'center', lineHeight: 22, paddingHorizontal: 8, marginBottom: 8 }}>
            {report.title}
          </Text>
          <Text style={{ color: '#334155', fontSize: 10, fontWeight: '600', letterSpacing: 2 }}>
            SYNTHESIZED: {report.timestamp.toUpperCase()}
          </Text>
        </Animated.View>

        {/* ── Verdict summary panel ── */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={{
          marginHorizontal: 16,
          marginBottom: 12,
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderWidth: 1,
          borderColor: `${primaryColor}20`,
          borderRadius: 24,
          padding: 20,
          overflow: 'hidden',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <View style={{
              backgroundColor: `${primaryColor}15`,
              borderWidth: 1,
              borderColor: `${primaryColor}30`,
              padding: 10, borderRadius: 14, marginRight: 14,
            }}>
              <MaterialIcons
                name={simpleMode ? 'check-circle' : 'psychology'}
                size={22}
                color={primaryColor}
              />
            </View>
            <View>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 }}>
                {simpleMode ? 'Simple Summary' : 'Intelligence Verdict'}
              </Text>
              <Text style={{ color: '#334155', fontSize: 9, fontWeight: '700', letterSpacing: 2, marginTop: 2 }}>
                {simpleMode ? 'PLAIN ENGLISH' : 'NEURAL CORE ANALYSIS'}
              </Text>
            </View>
          </View>
          <Text style={{ color: '#94A3B8', fontSize: 13, lineHeight: 21, fontWeight: '500' }}>
            {simpleMode ? report.simpleSummary : report.detailedSummary}
          </Text>
        </Animated.View>

        {/* ── Metric cards row ── */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, gap: 10 }}>
          {[
            { label: 'SOURCE TRUST', value: report.biasMetrics.sourceCredibility, color: '#34D399', icon: 'verified', glow: 'rgba(52,211,153,0.1)' },
            { label: 'CLICKBAIT RATIO', value: report.biasMetrics.clickbaitScore, color: '#F87171', icon: 'gpp-bad', glow: 'rgba(248,113,113,0.1)' },
          ].map((m) => (
            <View key={m.label} style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderWidth: 1,
              borderColor: `${m.color}25`,
              borderRadius: 20,
              padding: 16,
              overflow: 'hidden',
            }}>
              <View style={{ position: 'absolute', top: -20, right: -20, width: 70, height: 70, borderRadius: 35, backgroundColor: m.glow }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ color: '#475569', fontSize: 9, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' }}>{m.label}</Text>
                <View style={{ backgroundColor: `${m.color}15`, borderRadius: 8, padding: 4 }}>
                  <MaterialIcons name={m.icon as any} size={14} color={m.color} />
                </View>
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 }}>{m.value}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ── Accordions ── */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginHorizontal: 16 }}>

          <AccordionSection
            sectionKey="indicators"
            expandedSection={expandedSection}
            onToggle={toggleSection}
            icon="fact-check"
            iconColor="#34D399"
            title="Telemetry Signals"
          >
            {report.keyIndicators.map((item, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 }}>
                <View style={{
                  backgroundColor: item.type === 'positive' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                  borderWidth: 1,
                  borderColor: item.type === 'positive' ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)',
                  padding: 6, borderRadius: 10, marginRight: 12, marginTop: 1,
                }}>
                  <MaterialIcons
                    name={item.type === 'positive' ? 'check-circle' : 'info'}
                    size={14}
                    color={item.type === 'positive' ? '#34D399' : '#FBBF24'}
                  />
                </View>
                <Text style={{ color: '#94A3B8', fontSize: 13, flex: 1, lineHeight: 20 }}>{item.text}</Text>
              </View>
            ))}
          </AccordionSection>

          <AccordionSection
            sectionKey="bias"
            expandedSection={expandedSection}
            onToggle={toggleSection}
            icon="analytics"
            iconColor="#A855F7"
            title="Bias Dimensions"
          >
            {[
              { label: 'Political Leanings', value: report.biasMetrics.politicalBias },
              { label: 'Emotional Spectrum', value: report.biasMetrics.emotionalTone },
              { label: 'Headline Sensation', value: report.biasMetrics.clickbaitScore },
            ].map((row, i, arr) => (
              <View key={row.label} style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                borderBottomColor: 'rgba(255,255,255,0.05)',
              }}>
                <Text style={{ color: '#475569', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>{row.label.toUpperCase()}</Text>
                <Text style={{ color: '#E2E8F0', fontSize: 13, fontWeight: '800' }}>{row.value}</Text>
              </View>
            ))}
          </AccordionSection>

        </Animated.View>

        {/* ── Chat CTA ── */}
        <Animated.View entering={FadeInDown.delay(280).springify()} style={{ marginHorizontal: 16, marginTop: 4 }}>
          <AnimatedPress
            onPress={() => router.push({
              pathname: '/(tabs)/chat',
              params: { reportId: String(report.id), reportTitle: report.title },
            })}
            haptic
            scaleAmount={0.95}
          >
            <View style={{
              minHeight: 58,
              borderRadius: 20,
              backgroundColor: 'rgba(168,85,247,0.1)',
              borderWidth: 1,
              borderColor: 'rgba(168,85,247,0.3)',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#A855F7',
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 6,
            }}>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(168,85,247,0.3)', borderRadius: 20 }} />
              <MaterialIcons name="forum" size={20} color="#C084FC" />
              <Text style={{ color: '#C084FC', fontSize: 13, fontWeight: '800', letterSpacing: 2.5, marginLeft: 10 }}>
                OPEN NEURAL DISCUSSION
              </Text>
            </View>
          </AnimatedPress>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
