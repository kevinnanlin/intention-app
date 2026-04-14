import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#34D399',
        tabBarInactiveTintColor: '#555',
        tabBarStyle: { backgroundColor: '#0f0f0f', borderTopColor: '#1f1f1f' },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Swipe',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="hand.draw.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Cards',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="rectangle.stack.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
