import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';
interface AccountManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}
export default function AccountManagementModal({
  visible,
  onClose,
  onLogout,
  onDeleteAccount,
}: AccountManagementModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-lg mx-6 p-6 w-80">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-lg font-bold text-gray-900">
              {t('settings.account_management', '계정 관리')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          {/* Options */}
          <View className="space-y-4 gap-2">
            {/* Logout */}
            <TouchableOpacity
              onPress={onLogout}
              className="flex-row items-center p-4 rounded-lg border bg-gray-50"
            >
              <MaterialIcons name="logout" size={24} color="#EF4444" />
              <Text className="ml-3 text-base font-medium text-red-500">
                {t('settings.logout', '로그아웃')}
              </Text>
            </TouchableOpacity>
            {/* Delete Account */}
            <TouchableOpacity
              onPress={onDeleteAccount}
              className="flex-row items-center p-4 rounded-lg border bg-red-50"
            >
              <MaterialIcons name="delete-forever" size={24} color="#EF4444" />
              <Text className="ml-3 text-base font-medium text-red-500">
                {t('settings.delete_account', '회원 탈퇴')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}