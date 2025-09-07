import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';
import { RecommendationBadge, ApplicationMethodStats } from '../ui';

interface ApplicationMethodCardProps {
  type: 'regular' | 'chat';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  userTokens?: number;
}

const ApplicationMethodCard: React.FC<ApplicationMethodCardProps> = ({ 
  type, 
  onPress, 
  disabled = false,
  loading = false,
  userTokens = 0 
}) => {
  const { t } = useTranslation();
  
  const isChat = type === 'chat';
  const isPremium = isChat;
  const hasInsufficientTokens = isChat && userTokens < 1;

  const cardStyle = isPremium 
    ? 'bg-white border-2 border-blue-500 shadow-md relative' 
    : 'bg-white border border-gray-200 shadow-sm';

  const gradientStyle = isPremium 
    ? 'bg-gradient-to-br from-blue-50 to-white' 
    : 'bg-white';

  const iconBgColor = isChat ? 'bg-green-100' : 'bg-blue-100';
  const iconColor = isChat ? '#10B981' : '#3B82F6';
  const iconName = isChat ? 'chatbubbles' : 'document-text';

  const title = isChat 
    ? t('application.chat_title', '채팅 지원')
    : t('application.regular_title', '일반 지원');

  const description = isChat 
    ? t('application.chat_description', '즉시 기업과 1:1 채팅 연결')
    : t('application.regular_description', '이력서를 첨부하고 기업에 지원합니다');

  return (
    <View className="relative">
      {isPremium && <RecommendationBadge />}
      
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
              {isChat && (
                <View className="bg-orange-100 px-2 py-1 rounded-md">
                  <Text className="text-orange-600 text-xs font-medium">
                    {t('application.token_price', '토큰 1개')}
                  </Text>
                </View>
              )}
            </View>
            
            <Text className="text-sm text-gray-600 mb-2">
              {description}
            </Text>

            <ApplicationMethodStats type={type} />

            {isChat && (
              <View className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                <Text className="text-orange-800 text-xs font-medium text-center">
                  🛡️ {t('application.guarantee', '답장 없으면 100% 환불')}
                </Text>
              </View>
            )}

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