import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';

interface RegularApplicationConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onChatApplication: () => void;
}

const RegularApplicationConfirmModal: React.FC<RegularApplicationConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  onCancel,
  onChatApplication
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
        <View className="bg-white rounded-2xl mx-4 p-6 max-w-sm w-full relative">
          {/* Close Button */}
          <TouchableOpacity
            className="absolute right-4 top-4 z-10 p-1"
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>

          {/* Header */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full items-center justify-center mb-4">
              <Ionicons name="warning" size={32} color="white" />
            </View>
            <Text className="text-xl font-bold text-gray-900 text-center">
              {t('application.regular_confirm_title', '정말 일반 지원을 선택하시겠습니까?')}
            </Text>
            <Text className="text-sm text-gray-600 text-center mt-2">
              {t('application.regular_confirm_subtitle', '일반 지원의 단점을 확인해 주세요')}
            </Text>
          </View>

          {/* Disadvantages of Regular Application */}
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <Text className="text-sm font-bold text-red-900 mb-3">
              {t('application.regular_disadvantages_title', '일반 지원의 단점')}
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-start">
                <Ionicons name="close-circle" size={16} color="#DC2626" className="mt-0.5" />
                <View className="ml-2 flex-1">
                  <Text className="text-xs font-medium text-red-800">
                    {t('application.disadvantage_response', '평균 응답률 12%')}
                  </Text>
                  <Text className="text-xs text-red-600">
                    {t('application.disadvantage_response_desc', '대부분의 지원서가 무시됩니다')}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="close-circle" size={16} color="#DC2626" className="mt-0.5" />
                <View className="ml-2 flex-1">
                  <Text className="text-xs font-medium text-red-800">
                    {t('application.disadvantage_time', '답변까지 평균 7일 소요')}
                  </Text>
                  <Text className="text-xs text-red-600">
                    {t('application.disadvantage_time_desc', '긴 대기 시간과 불확실성')}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="close-circle" size={16} color="#DC2626" className="mt-0.5" />
                <View className="ml-2 flex-1">
                  <Text className="text-xs font-medium text-red-800">
                    {t('application.disadvantage_priority', '우선순위 최하위')}
                  </Text>
                  <Text className="text-xs text-red-600">
                    {t('application.disadvantage_priority_desc', '채팅 지원자 검토 후 확인')}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="close-circle" size={16} color="#DC2626" className="mt-0.5" />
                <View className="ml-2 flex-1">
                  <Text className="text-xs font-medium text-red-800">
                    {t('application.disadvantage_interaction', '추가 소통 불가')}
                  </Text>
                  <Text className="text-xs text-red-600">
                    {t('application.disadvantage_interaction_desc', '일방적인 지원서 전달만 가능')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Question */}
          <Text className="text-center text-base font-semibold text-gray-900 mb-4">
            {t('application.regular_confirm_question', '그래도 일반 지원을 진행하시겠습니까?')}
          </Text>

          {/* Action Buttons */}
          <View className="gap-3">
            {/* Switch to Chat Application Button - Primary action */}
            <TouchableOpacity
              className="bg-blue-500 rounded-xl py-3 px-4"
              onPress={onChatApplication}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-center">
                {t('application.switch_to_chat', '아니요, 채팅 지원으로 변경할게요')}
              </Text>
            </TouchableOpacity>

            {/* Confirm Regular Application - Secondary action */}
            <TouchableOpacity
              className="bg-gray-200 rounded-xl py-3 px-4"
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text className="text-gray-600 font-medium text-center">
                {t('application.regular_confirm_yes', '네, 일반 지원 진행')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RegularApplicationConfirmModal;