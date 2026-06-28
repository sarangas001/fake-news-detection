import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
} from 'react-native-reanimated';
import { AnimatedPress } from '@/components/ui/animated-press';

const AnimatedView = Animated.View;

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

function TypingDots() {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    dot1.value = withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1, false);
    setTimeout(() => {
      dot2.value = withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1, false);
    }, 150);
    setTimeout(() => {
      dot3.value = withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1, false);
    }, 300);
  }, []);

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value }));
  const dotStyle = { width: 7, height: 7, borderRadius: 4, backgroundColor: '#A855F7', marginHorizontal: 2 };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
      <AnimatedView style={[s1, dotStyle]} />
      <AnimatedView style={[s2, dotStyle]} />
      <AnimatedView style={[s3, dotStyle]} />
    </View>
  );
}

function AIStatusDot() {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 700, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 700 })
      ), -1, false
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <View style={{ position: 'relative', width: 10, height: 10, marginRight: 8 }}>
      <AnimatedView style={[style, { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(52,211,153,0.3)' }]} />
      <View style={{ position: 'absolute', top: 2, left: 2, width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399' }} />
    </View>
  );
}

export default function AIChatAssistantScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reportId?: string; reportTitle?: string }>();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_1',
      sender: 'ai',
      text: params?.reportTitle
        ? `Loaded node #${params.reportId}: **"${params.reportTitle}"**.\n\nReady to analyze credibility markers or claims regarding this source.`
        : `AI assistant active. Ask me anything about current news, verification logic, or factual cross-verification.`,
      timestamp: 'Now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [focusedInput, setFocusedInput] = useState(false);

  const suggestedQuestions = [
    'Why was this rated trustworthy?',
    'What evidence supports this?',
    'How do I spot fake news?',
    'Is this source reliable?',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;
    const userMsg: Message = { id: `msg_${Date.now()}`, sender: 'user', text, timestamp: 'Now' };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        sender: 'ai',
        text: `Cross-referencing index metrics for "${text.slice(0, 30)}...". Our system evaluates structural biases, factual references, and clickbait anomalies dynamically. Factual correlation is high.`,
        timestamp: 'Now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050008' }}>
      <StatusBar barStyle="light-content" backgroundColor="#050008" />

      {/* Ambient glow orbs */}
      <View style={{ position: 'absolute', top: -30, left: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(168,85,247,0.07)' }} />
      <View style={{ position: 'absolute', bottom: 120, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(34,211,238,0.05)' }} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        {/* ── Header ── */}
        <View style={{
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.05)',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(5,0,8,0.95)',
        }}>
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: 'rgba(168,85,247,0.12)',
            borderWidth: 1,
            borderColor: 'rgba(168,85,247,0.3)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            shadowColor: '#A855F7',
            shadowOpacity: 0.3,
            shadowRadius: 10,
          }}>
            <MaterialIcons name="smart-toy" size={22} color="#C084FC" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>Fact Assistant</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <AIStatusDot />
              <Text style={{ color: '#34D399', fontSize: 9, fontWeight: '800', letterSpacing: 2 }}>
                {isTyping ? 'THINKING...' : 'ONLINE · READY'}
              </Text>
            </View>
          </View>
        </View>

        {/* Context banner */}
        {params?.reportTitle ? (
          <Animated.View entering={FadeInUp.springify()} style={{
            backgroundColor: 'rgba(168,85,247,0.07)',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(168,85,247,0.15)',
            paddingHorizontal: 20,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
              <MaterialIcons name="description" size={14} color="#C084FC" />
              <Text style={{ color: '#C084FC', fontSize: 11, fontWeight: '700', marginLeft: 8 }} numberOfLines={1}>
                TARGET: {params.reportTitle.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.setParams({ reportId: '', reportTitle: '' })}>
              <MaterialIcons name="close" size={16} color="#475569" />
            </TouchableOpacity>
          </Animated.View>
        ) : null}

        {/* ── Messages ── */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const isAI = item.sender === 'ai';
            return (
              <Animated.View
                entering={isAI ? FadeInLeft.delay(50).springify() : FadeInRight.delay(50).springify()}
                style={{ marginBottom: 14, flexDirection: 'row', justifyContent: isAI ? 'flex-start' : 'flex-end' }}>
                {isAI && (
                  <View style={{
                    width: 32, height: 32, borderRadius: 10, marginRight: 8,
                    backgroundColor: 'rgba(168,85,247,0.1)',
                    borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)',
                    alignItems: 'center', justifyContent: 'center',
                    alignSelf: 'flex-end', marginBottom: 4,
                  }}>
                    <MaterialIcons name="smart-toy" size={14} color="#C084FC" />
                  </View>
                )}
                <View style={{
                  maxWidth: '78%',
                  padding: 14,
                  borderRadius: 20,
                  borderBottomLeftRadius: isAI ? 4 : 20,
                  borderBottomRightRadius: isAI ? 20 : 4,
                  backgroundColor: isAI ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.7)',
                  borderWidth: 1,
                  borderColor: isAI ? 'rgba(255,255,255,0.07)' : 'rgba(168,85,247,0.5)',
                  shadowColor: isAI ? 'transparent' : '#A855F7',
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                }}>
                  <Text style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 19, color: isAI ? '#CBD5E1' : '#FFFFFF' }}>
                    {item.text}
                  </Text>
                  <Text style={{ fontSize: 9, fontWeight: '700', marginTop: 8, color: isAI ? '#334155' : 'rgba(255,255,255,0.35)', letterSpacing: 1 }}>
                    {item.timestamp}
                  </Text>
                </View>
              </Animated.View>
            );
          }}
          ListFooterComponent={isTyping ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{
                width: 32, height: 32, borderRadius: 10, marginRight: 8,
                backgroundColor: 'rgba(168,85,247,0.1)',
                borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <MaterialIcons name="smart-toy" size={14} color="#C084FC" />
              </View>
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.07)',
                borderRadius: 20,
                borderBottomLeftRadius: 4,
              }}>
                <TypingDots />
              </View>
            </View>
          ) : null}
        />

        {/* ── Suggestion chips ── */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={suggestedQuestions}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <AnimatedPress onPress={() => handleSendMessage(item)} scaleAmount={0.92} style={{ marginRight: 8 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.08)',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                }}>
                  <MaterialIcons name="lightbulb" size={12} color="#A855F7" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>{item}</Text>
                </View>
              </AnimatedPress>
            )}
          />
        </View>

        {/* ── Input ── */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: 'rgba(5,0,8,0.9)',
        }}>
          <TextInput
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Input query details..."
            placeholderTextColor="#1E293B"
            onFocus={() => setFocusedInput(true)}
            onBlur={() => setFocusedInput(false)}
            style={{
              flex: 1,
              color: '#FFFFFF',
              fontSize: 13,
              fontFamily: 'monospace',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderWidth: 1,
              borderColor: focusedInput ? 'rgba(168,85,247,0.35)' : 'rgba(255,255,255,0.07)',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 16,
              minHeight: 48,
            }}
            onSubmitEditing={() => handleSendMessage()}
            returnKeyType="send"
          />
          <AnimatedPress onPress={() => handleSendMessage()} disabled={!inputMessage.trim()} scaleAmount={0.88}>
            <View style={{
              width: 48, height: 48, borderRadius: 14,
              backgroundColor: inputMessage.trim() ? '#7C3AED' : 'rgba(255,255,255,0.03)',
              borderWidth: 1,
              borderColor: inputMessage.trim() ? '#A855F7' : 'rgba(255,255,255,0.07)',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: inputMessage.trim() ? '#A855F7' : 'transparent',
              shadowOpacity: 0.5, shadowRadius: 12, elevation: 6,
            }}>
              <MaterialIcons name="send" size={18} color={inputMessage.trim() ? '#FFFFFF' : '#334155'} />
            </View>
          </AnimatedPress>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
