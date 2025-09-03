import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabIconWithBadgeProps {
  name: keyof typeof Ionicons.glyphMap;
  size: number;
  color: string;
  badgeCount?: number;
  maxBadgeCount?: number;
}

const TabIconWithBadge: React.FC<TabIconWithBadgeProps> = ({
  name,
  size,
  color,
  badgeCount = 0,
  maxBadgeCount = 99,
}) => {
  const showBadge = badgeCount > 0;
  const displayCount = badgeCount > maxBadgeCount ? `${maxBadgeCount}+` : badgeCount.toString();

  return (
    <View className="relative">
      <Ionicons name={name} size={size} color={color} />
      {showBadge && (
        <View 
          className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1"
          style={{ minWidth: 18, height: 18 }}
        >
          <Text 
            className="text-white text-xs font-bold"
            style={{ fontSize: 10, lineHeight: 12 }}
          >
            {displayCount}
          </Text>
        </View>
      )}
    </View>
  );
};

export default TabIconWithBadge;