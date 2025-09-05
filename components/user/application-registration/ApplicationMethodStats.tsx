import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';

interface StatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  isHighlight?: boolean;
  isNegative?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ icon, text, isHighlight = false, isNegative = false }) => {
  const textColorClass = isHighlight 
    ? 'text-blue-600' 
    : isNegative 
      ? 'text-gray-500' 
      : 'text-gray-600';
  
  const iconColor = isHighlight 
    ? '#3B82F6' 
    : isNegative 
      ? '#9CA3AF' 
      : '#6B7280';

  return (
    <View className="flex-row items-center mb-1.5">
      <Ionicons name={icon} size={14} color={iconColor} />
      <Text className={`text-sm ml-2 ${textColorClass} ${isHighlight ? 'font-medium' : ''}`}>
        {text}
      </Text>
    </View>
  );
};

interface ApplicationMethodStatsProps {
  type: 'regular' | 'chat';
}

const ApplicationMethodStats: React.FC<ApplicationMethodStatsProps> = ({ type }) => {
  const { t } = useTranslation();

  return (
    <View className="mt-3 pt-3 border-t border-gray-100">
      {type === 'regular' ? (
        <>
          <StatItem 
            icon="time" 
            text={t('application.regular_stat_time', '평균 답장까지 3-7일 소요')} 
            isNegative={true}
          />
          <StatItem 
            icon="bar-chart" 
            text={t('application.regular_stat_response', '응답률 32%')} 
            isNegative={true}
          />
          <StatItem 
            icon="close-circle" 
            text={t('application.regular_stat_read', '읽음 확인 불가')} 
            isNegative={true}
          />
        </>
      ) : (
        <>
          <StatItem 
            icon="checkmark-circle" 
            text={t('application.chat_stat_guarantee', '24시간 내 답장 보장')} 
            isHighlight={true}
          />
          <StatItem 
            icon="flame" 
            text={t('application.chat_stat_response', '응답률 87%')} 
            isHighlight={true}
          />
          <StatItem 
            icon="eye" 
            text={t('application.chat_stat_read', '읽음 100% 보장')} 
            isHighlight={true}
          />
        </>
      )}
    </View>
  );
};

export default ApplicationMethodStats;