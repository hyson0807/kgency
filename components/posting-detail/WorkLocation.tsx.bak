import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import openNaverMap from '@/lib/functions/openNaverMap'
import { useModal } from '@/hooks/useModal';

interface WorkLocationComponentProps {
    posting: {
        job_address?: string;
    };
    isTranslated: boolean;
    translatedData?: {
        job_address?: string;
    } | null;
    t: (key: string, defaultValue: string) => string;
}

const WorkLocationComponent = ({posting, isTranslated, translatedData, t}: WorkLocationComponentProps) => {
    const { showModal } = useModal();

    const address = isTranslated && translatedData?.job_address
        ? translatedData.job_address
        : posting.job_address;

    const handlePress = () => {
        if (!address) return;

        openNaverMap(address, {
            onError: () => {
                showModal(
                    '오류',
                    '네이버 지도를 열 수 없습니다.',
                    'warning'
                );
            }
        });
    };

    if (!posting.job_address || posting.job_address.length === 0) {
        return null;
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                    <Ionicons name="location-outline" size={18} color="#3b82f6" />
                </View>
                <View className="ml-3 flex-1">
                    <Text className="text-xs text-gray-500">
                        {t('posting_detail.work_location', '근무지역')}
                    </Text>
                    <View className="flex-row items-center">
                        <Text className="text-base text-gray-800 flex-1">
                            {address}
                        </Text>
                        <Ionicons
                            name="chevron-forward-outline"
                            size={16}
                            color="#9ca3af"
                            style={{ marginLeft: 4 }}
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default WorkLocationComponent;