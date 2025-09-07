import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';
import RegularApplicationConfirmModal from './RegularApplicationConfirmModal';

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleRegularApplicationClick = () => {
    console.log('일반 지원 버튼 클릭됨');
    // 먼저 프로모션 모달을 닫고
    onClose();
    // 약간의 딜레이 후 확인 모달을 표시
    setTimeout(() => {
      setShowConfirmModal(true);
    }, 300);
  };

  useEffect(() => {
    console.log('showConfirmModal 상태 변경:', showConfirmModal);
  }, [showConfirmModal]);

  // 프로모션 모달이 닫힐 때 확인 모달도 초기화
  useEffect(() => {
    if (!visible) {
      setShowConfirmModal(false);
    }
  }, [visible]);

  const handleConfirmRegularApplication = () => {
    setShowConfirmModal(false);
    onClose(); // 프로모션 모달도 닫기
    onRegularApplication();
  };

  const handleCancelRegularApplication = () => {
    setShowConfirmModal(false);
  };

  const handleSwitchToChatApplication = () => {
    setShowConfirmModal(false);
    // 프로모션 모달을 닫지 않고 바로 채팅 지원 프로세스 시작
    // onChatApplication이 handlePromotionChatApplication을 호출하면
    // 그 함수가 프로모션 모달을 닫음
    onChatApplication();
  };

  return (
    <>
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
            <View className="gap-3 mb-6">
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
              
              {/*<View className="flex-row items-center">*/}
              {/*  <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">*/}
              {/*    <Ionicons name="shield-checkmark" size={16} color="#8B5CF6" />*/}
              {/*  </View>*/}
              {/*  <Text className="text-sm text-gray-700 flex-1">*/}
              {/*    {t('application.benefit_refund', '답장 없으면 100% 환불')}*/}
              {/*  </Text>*/}
              {/*</View>*/}
              
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
                <View className="items-center justify-center">
                  <View className="flex-row items-center justify-center mb-1">
                    <Ionicons name="chatbubbles" size={20} color="white" />
                    <Text className="text-white font-bold text-base ml-2">
                      {t('application.choose_chat', '채팅 지원하기')}
                    </Text>
                  </View>
                  <View className="bg-white/20 px-2 py-1 rounded-md">
                    <Text className="text-white text-xs font-medium text-center">
                      {t('application.recommended', '추천')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Regular Application Button - Styled as decline option */}
              <TouchableOpacity
                className="py-3 mt-4"
                onPress={handleRegularApplicationClick}
                activeOpacity={0.7}
              >
                <Text className="text-center text-gray-500 text-sm underline">
                  {t('application.decline_chat', '아니요, 일반 지원으로 할게요')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Regular Application Confirmation Modal - 별도로 렌더링 */}
      <RegularApplicationConfirmModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmRegularApplication}
        onCancel={handleCancelRegularApplication}
        onChatApplication={handleSwitchToChatApplication}
      />
    </>
  );
};

export default ChatApplicationPromotionModal;