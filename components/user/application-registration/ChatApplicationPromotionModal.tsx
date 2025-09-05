import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';

interface ChatApplicationPromotionModalProps {
  visible: boolean;
  onClose: () => void;
  onChatApplication: () => void;
  onRegularApplication: () => void;
  userTokens: number;
}

const ChatApplicationPromotionModal: React.FC<ChatApplicationPromotionModalProps> = ({
  visible,
  onClose,
  onChatApplication,
  onRegularApplication,
  userTokens
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl mx-4 p-6 max-w-sm w-full">
          {/* Header */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full items-center justify-center mb-4">
              <Ionicons name="chatbubbles" size={32} color="white" />
            </View>
            <Text className="text-xl font-bold text-gray-900 text-center">
              {t('application.promotion_title', '채팅 지원을 추천드려요!')}
            </Text>
            <Text className="text-sm text-gray-600 text-center mt-2">
              {t('application.promotion_subtitle', '더 빠르고 확실한 면접 기회를 잡으세요')}
            </Text>
          </View>

          {/* Benefits */}
          <View className="space-y-3 mb-6">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="flash" size={16} color="#10B981" />
              </View>
              <Text className="text-sm text-gray-700 flex-1">
                {t('application.benefit_instant', '즉시 기업과 1:1 채팅 연결')}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="time" size={16} color="#3B82F6" />
              </View>
              <Text className="text-sm text-gray-700 flex-1">
                {t('application.benefit_24h', '24시간 내 답장 보장')}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={16} color="#8B5CF6" />
              </View>
              <Text className="text-sm text-gray-700 flex-1">
                {t('application.benefit_refund', '답장 없으면 100% 환불')}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="trending-up" size={16} color="#F59E0B" />
              </View>
              <Text className="text-sm text-gray-700 flex-1">
                {t('application.benefit_stats', '면접 성공률 3배 증가')}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View>
            {/* Chat Application Button */}
            <TouchableOpacity
              className="bg-green-500 rounded-xl py-4 px-6 min-h-[56px]"
              onPress={onChatApplication}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="chatbubbles" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">
                  {t('application.choose_chat', '채팅 지원하기')}
                </Text>
                <View className="bg-white/20 px-2 py-1 rounded-md ml-2">
                  <Text className="text-white text-xs font-medium">
                    {t('application.recommended', '추천')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Regular Application Button */}
            <TouchableOpacity
              className="bg-gray-100 border border-gray-200 rounded-xl py-4 px-6 mt-3 min-h-[56px]"
              onPress={onRegularApplication}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="document-text" size={20} color="#6B7280" />
                <Text className="text-gray-700 font-medium text-base ml-2">
                  {t('application.choose_regular', '일반 지원하기')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              className="py-3 mt-3"
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text className="text-center text-gray-500 text-sm">
                {t('common.cancel', '취소')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ChatApplicationPromotionModal;