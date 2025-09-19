import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';
import { RecommendationBadge, ApplicationMethodStats } from '../ui';

interface ApplicationMethodCardProps {
  type: 'chat';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ApplicationMethodCard: React.FC<ApplicationMethodCardProps> = ({
  type,
  onPress,
  disabled = false,
  loading = false
}) => {
  const { t } = useTranslation();
  
  const cardStyle = 'bg-white border-2 border-blue-500 shadow-md relative';
  const gradientStyle = 'bg-gradient-to-br from-blue-50 to-white';
  const iconBgColor = 'bg-green-100';
  const iconColor = '#10B981';
  const iconName = 'chatbubbles';
  const title = t('application.chat_title', '채팅 지원');
  const description = t('application.chat_description', '즉시 기업과 1:1 채팅 연결');

  return (
    <View className="relative">
      <RecommendationBadge />
      
      <TouchableOpacity
        className={`${cardStyle} rounded-xl p-5 mb-4 ${gradientStyle} ${disabled || loading ? 'opacity-60' : ''}`}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        <View className="flex-row items-start">
          <View className={`w-12 h-12 ${iconBgColor} rounded-full items-center justify-center mr-4 mt-1`}>
            <Ionicons name={iconName} size={24} color={iconColor} />
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-800 mb-1">
                {title}
              </Text>
              <View className="bg-green-100 px-2 py-1 rounded-md">
                <Text className="text-green-600 text-xs font-medium">
                  {t('application.free', '무료')}
                </Text>
              </View>
            </View>
            
            <Text className="text-sm text-gray-600 mb-2">
              {description}
            </Text>

            <ApplicationMethodStats type={type} />

            <View className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
              <Text className="text-green-800 text-xs font-medium text-center">
                ⚡ {t('application.instant_connection', '즉시 기업과 채팅 연결')}
              </Text>
            </View>

          </View>
          
          <View className="ml-2 mt-1">
            {loading ? (
              <ActivityIndicator size="small" color="#9CA3AF" />
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ApplicationMethodCard;