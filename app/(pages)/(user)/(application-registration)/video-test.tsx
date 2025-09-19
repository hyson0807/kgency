import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { audioAPI } from '@/lib/core/api/audio';
import { useModal } from '@/lib/shared/ui/hooks/useModal';
import Back from '@/components/shared/common/back';
import AudioRecorder from '@/components/audio/AudioRecorder';

// 하드코딩된 면접 질문들
const INTERVIEW_QUESTIONS = [
  "간단한 자기소개를 해주세요.",
  "이 일자리에 지원하는 이유는 무엇인가요?",
  "본인의 강점이나 특기를 말씀해주세요."
];

export default function AudioTestScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showModal, ModalComponent } = useModal();

  // URL 파라미터에서 데이터 가져오기
  const {
    resume,
    editedResume,
    isEditing,
    companyId,
    jobPostingId,
    jobTitle,
    companyName
  } = params as {
    resume: string;
    editedResume: string;
    isEditing: string;
    companyId: string;
    jobPostingId: string;
    jobTitle: string;
    companyName: string;
  };

  const [testCompleted, setTestCompleted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleAudioSaved = async (savedAudioUrl: string) => {
    // AudioRecorder에서 음성이 저장되면 호출되는 콜백
    setAudioUrl(savedAudioUrl);
    setTestCompleted(true);

    // 자동으로 지원 방식 선택 페이지로 이동
    showModal(
      '음성 테스트 완료!',
      '면접 음성이 성공적으로 저장되었습니다. 이제 지원을 진행하시겠습니까?',
      'confirm',
      () => {
        router.push({
          pathname: '/(pages)/(user)/(application-registration)/application-method',
          params: {
            resume,
            editedResume,
            isEditing,
            companyId,
            jobPostingId,
            jobTitle,
            companyName,
            audioUrl: savedAudioUrl
          }
        });
      },
      true,
      '지원하기'
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <Back />
          <Text className="text-lg font-bold ml-4">음성 면접 테스트</Text>
        </View>
      </View>

      {/* 안내 섹션 */}
      <View className="p-4">
        <View className="bg-blue-50 p-4 rounded-xl mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="mic" size={20} color="#1e40af" />
            <Text className="text-lg font-bold text-blue-900 ml-2">음성 면접 테스트</Text>
          </View>
          <Text className="text-sm text-blue-700 mb-2">
            아래 질문들에 대해 음성으로 답변해주세요.
          </Text>
          <Text className="text-sm text-blue-700">
            자유롭게 녹음하시고 만족스러운 음성을 저장해주세요.
          </Text>
        </View>

        {/* 질문 목록 */}
        <View className="bg-gray-50 p-4 rounded-xl mb-4">
          <Text className="font-semibold mb-3">💬 면접 질문</Text>
          {INTERVIEW_QUESTIONS.map((question, index) => (
            <View key={index} className="mb-2">
              <Text className="text-sm text-gray-700">
                <Text className="font-semibold">{index + 1}.</Text> {question}
              </Text>
            </View>
          ))}
        </View>

        {testCompleted && (
          <View className="bg-green-50 p-4 rounded-xl mb-4">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text className="text-green-800 font-semibold ml-2">테스트 완료!</Text>
            </View>
            <Text className="text-green-700 text-sm mt-1">
              음성이 성공적으로 저장되었습니다.
            </Text>
          </View>
        )}
      </View>

      {/* AudioRecorder 컴포넌트 */}
      <View className="flex-1">
        <AudioRecorder
          onAudioSaved={handleAudioSaved}
          title={`${jobTitle} 면접 음성`}
          description={`${companyName} 면접 음성`}
          maxDuration={90}
        />
      </View>

      {testCompleted && (
        <View className="p-4">
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: '/(pages)/(user)/(application-registration)/application-method',
                params: {
                  resume,
                  editedResume,
                  isEditing,
                  companyId,
                  jobPostingId,
                  jobTitle,
                  companyName,
                  audioUrl: audioUrl || ''
                }
              });
            }}
            className="bg-blue-500 py-4 rounded-xl"
          >
            <Text className="text-center text-white font-bold text-lg">
              지원하기
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ModalComponent />
    </SafeAreaView>
  );
}