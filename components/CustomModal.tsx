// components/CustomModal.tsx
import { View, Text, Modal, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
interface CustomModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'confirm' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    showCancel?: boolean;
    icon?: string;
}
const CustomModal: React.FC<CustomModalProps> = ({
                                                     visible,
                                                     onClose,
                                                     title,
                                                     message,
                                                     type = 'info',
                                                     confirmText = '확인',
                                                     cancelText = '취소',
                                                     onConfirm,
                                                     showCancel = true,
                                                     icon
                                                 }) => {
    const getIconConfig = () => {
        switch (type) {
            case 'warning':
                return {
                    name: icon || 'warning',
                    color: '#ef4444',
                    bgColor: 'bg-red-100'
                };
            case 'confirm':
                return {
                    name: icon || 'checkmark-circle',
                    color: '#3b82f6',
                    bgColor: 'bg-blue-100'
                };
            default:
                return {
                    name: icon || 'information-circle',
                    color: '#3b82f6',
                    bgColor: 'bg-blue-100'
                };
        }
    };
    const iconConfig = getIconConfig();
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center px-4">
                <View className="bg-white rounded-2xl p-6">
                    {/* 아이콘 */}
                    <View className="items-center mb-4">
                        <View className={`w-16 h-16 ${iconConfig.bgColor} rounded-full items-center justify-center mb-3`}>
                            <Ionicons
                                name={iconConfig.name as any}
                                size={32}
                                color={iconConfig.color}
                            />
                        </View>
                        <Text className="text-xl font-bold text-gray-900 text-center">
                            {title}
                        </Text>
                    </View>
                    {/* 메시지 */}
                    <Text className="text-gray-600 text-center mb-6">
                        {message}
                    </Text>
                    {/* 버튼들 */}
                    <View className={showCancel ? "flex-row gap-3" : ""}>
                        {showCancel && (
                            <TouchableOpacity
                                onPress={onClose}
                                className="flex-1 py-3 rounded-xl bg-gray-100"
                            >
                                <Text className="text-center text-gray-700 font-medium">
                                    {cancelText}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => {
                                if (onConfirm) {
                                    onConfirm();
                                } else {
                                    onClose();
                                }
                            }}
                            className={`${showCancel ? 'flex-1' : 'w-full'} py-3 rounded-xl ${
                                type === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                        >
                            <Text className="text-center text-white font-medium">
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
export default CustomModal;