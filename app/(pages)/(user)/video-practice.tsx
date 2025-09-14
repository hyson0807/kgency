import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import VideoRecorder from '@/components/video/VideoRecorder';
import { useTranslation } from '@/contexts/TranslationContext';

export default function VideoPractice() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-3">
          {t('settings.video_practice', '영상 연습')}
        </Text>
      </View>

      {/* 비디오 레코더 컴포넌트 */}
      <VideoRecorder />
    </View>
  );
}