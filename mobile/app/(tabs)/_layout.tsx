import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View, Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#C084FC', // Purple-400
        tabBarInactiveTintColor: '#475569', // Slate-600
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#050008', // Void dark black/purple
          borderTopColor: 'rgba(168, 85, 247, 0.2)', // Neon purple border
          borderTopWidth: 1.5,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 84 : 66,
          shadowColor: '#A855F7',
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '900',
          letterSpacing: 1,
          marginTop: 2,
          textTransform: 'uppercase',
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Verify',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 6,
              borderRadius: 12,
              backgroundColor: focused ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              borderWidth: focused ? 1 : 0,
              borderColor: 'rgba(168, 85, 247, 0.3)',
            }}>
              <MaterialIcons name="radar" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 6,
              borderRadius: 12,
              backgroundColor: focused ? 'rgba(34, 211, 238, 0.15)' : 'transparent',
              borderWidth: focused ? 1 : 0,
              borderColor: 'rgba(34, 211, 238, 0.3)',
            }}>
              <MaterialIcons name="history" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Fact Chat',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 6,
              borderRadius: 12,
              backgroundColor: focused ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              borderWidth: focused ? 1 : 0,
              borderColor: 'rgba(168, 85, 247, 0.3)',
            }}>
              <MaterialIcons name="smart-toy" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 6,
              borderRadius: 12,
              backgroundColor: focused ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
              borderWidth: focused ? 1 : 0,
              borderColor: 'rgba(236, 72, 153, 0.3)',
            }}>
              <MaterialIcons name="person" size={20} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
