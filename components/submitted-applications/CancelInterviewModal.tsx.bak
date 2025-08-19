
import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface CancelInterviewModalProps {
    visible: boolean
    onClose: () => void
    onConfirm: (reason: string) => void
    loading?: boolean
}

export default function CancelInterviewModal({
                                                 visible,
                                                 onClose,
                                                 onConfirm,
                                                 loading = false
                                             }: CancelInterviewModalProps) {
    const [reason, setReason] = useState('')
    const [error, setError] = useState('')

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError('취소 사유를 입력해주세요.')
            return
        }
        if (reason.trim().length < 10) {
            setError('취소 사유를 10자 이상 입력해주세요.')
            return
        }
        onConfirm(reason.trim())
    }

    const handleClose = () => {
        setReason('')
        setError('')
        onClose()
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-center items-center"
                    activeOpacity={1}
                    onPress={handleClose}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        className="bg-white rounded-2xl p-6 mx-5 w-11/12 max-w-sm"
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-gray-800">
                                면접 취소 사유
                            </Text>
                            <TouchableOpacity onPress={handleClose}>
                                <Ionicons name="close" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {/* Warning Message */}
                        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <Text className="text-red-700 text-sm">
                                ⚠️ 면접을 취소하시면 회사에 취소 사유가 전달됩니다.
                            </Text>
                        </View>

                        {/* Input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2">취소 사유를 입력해주세요</Text>
                            <TextInput
                                value={reason}
                                onChangeText={(text) => {
                                    setReason(text)
                                    setError('')
                                }}
                                placeholder="예: 갑작스러운 개인 사정으로 인해..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                className="border border-gray-300 rounded-lg p-3 min-h-[100px] text-gray-800"
                                editable={!loading}
                            />
                            {error && (
                                <Text className="text-red-500 text-sm mt-1">{error}</Text>
                            )}
                        </View>

                        {/* Buttons */}
                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={handleClose}
                                disabled={loading}
                                className="flex-1 py-3 rounded-lg border border-gray-300"
                            >
                                <Text className="text-center text-gray-700 font-medium">
                                    취소
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleConfirm}
                                disabled={loading}
                                className={`flex-1 py-3 rounded-lg ${
                                    loading ? 'bg-gray-300' : 'bg-red-600'
                                }`}
                            >
                                <Text className="text-center text-white font-medium">
                                    {loading ? '처리중...' : '면접 취소하기'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    )
}