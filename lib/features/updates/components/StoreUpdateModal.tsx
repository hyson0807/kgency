import React from 'react';
import { View, Text, Modal, TouchableOpacity, Image, Alert } from 'react-native';
import { UpdateState } from '../types';

interface StoreUpdateModalProps {
  visible: boolean;
  updateState: UpdateState;
  onUpdate: () => void;
  onSkip?: () => void;
  onClose?: () => void;
}

export const StoreUpdateModal: React.FC<StoreUpdateModalProps> = ({
  visible,
  updateState,
  onUpdate,
  onSkip,
  onClose,
}) => {
  const { store } = updateState;
  const isForced = store.isForced;

  const handleSkip = () => {
    if (isForced) {
      Alert.alert(
        '업데이트 필수',
        '이 업데이트는 필수 업데이트입니다. 앱을 계속 사용하려면 업데이트해야 합니다.',
        [{ text: '확인', style: 'default' }]
      );
      return;
    }
    onSkip?.();
  };

  const handleClose = () => {
    if (isForced) {
      Alert.alert(
        '업데이트 필수',
        '이 업데이트는 필수 업데이트입니다. 앱을 계속 사용하려면 업데이트해야 합니다.',
        [{ text: '확인', style: 'default' }]
      );
      return;
    }
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          {/* 앱 아이콘 */}
          <View className="items-center mb-4">
            <Image 
              source={require('@/assets/images/kgency_logo.png')}
              className="w-16 h-16 mb-3"
              resizeMode="contain"
            />
            <Text className="text-xl font-bold text-gray-900 text-center">
              {isForced ? '필수 업데이트' : '새로운 업데이트'}
            </Text>
          </View>

          {/* 업데이트 정보 */}
          <View className="mb-6">
            <View className="bg-gray-50 rounded-lg p-4 mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">현재 버전</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {store.currentVersion}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-600">최신 버전</Text>
                <Text className="text-sm font-medium text-blue-600">
                  {store.latestVersion}
                </Text>
              </View>
            </View>

            <Text className="text-sm text-gray-600 text-center leading-5">
              {isForced 
                ? '보안 및 안정성 향상을 위해 반드시 업데이트가 필요합니다.'
                : '새로운 기능과 버그 수정이 포함된 업데이트가 있습니다.'
              }
            </Text>
          </View>

          {/* 버튼들 */}
          <View className="space-y-3">
            {/* 업데이트 버튼 */}
            <TouchableOpacity 
              onPress={onUpdate}
              className="bg-blue-600 rounded-xl py-4 px-6"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-center text-base">
                {isForced ? '지금 업데이트' : '업데이트'}
              </Text>
            </TouchableOpacity>

            {/* 건너뛰기/닫기 버튼 (강제 업데이트가 아닌 경우에만) */}
            {!isForced && (
              <View className="flex-row space-x-3">
                {onSkip && (
                  <TouchableOpacity 
                    onPress={handleSkip}
                    className="flex-1 bg-gray-100 rounded-xl py-4 px-6"
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-700 font-medium text-center text-base">
                      나중에
                    </Text>
                  </TouchableOpacity>
                )}
                
                {onClose && (
                  <TouchableOpacity 
                    onPress={handleClose}
                    className="flex-1 bg-gray-100 rounded-xl py-4 px-6"
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-700 font-medium text-center text-base">
                      닫기
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* 강제 업데이트 안내 */}
          {isForced && (
            <View className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <Text className="text-xs text-amber-800 text-center">
                ⚠️ 이 업데이트는 앱의 정상적인 작동을 위해 필수입니다
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};