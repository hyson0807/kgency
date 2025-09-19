import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { audioAPI } from '@/lib/core/api/audio';

interface AudioMessageCardProps {
  audioUrl: string;
  isMyMessage: boolean;
  timestamp: string;
}

export const AudioMessageCard: React.FC<AudioMessageCardProps> = ({
  audioUrl,
  isMyMessage,
  timestamp
}) => {
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const playbackTimer = useRef<NodeJS.Timeout | null>(null);

  const handleAudioPress = async () => {
    setLoadingAudio(true);
    setShowAudioModal(true);

    try {
      // audioUrl이 user_audios 테이블의 ID인지 URL인지 확인
      if (audioUrl.startsWith('http')) {
        // 이미 URL인 경우 바로 사용
        setPlaybackUrl(audioUrl);
      } else {
        // ID인 경우 presigned URL 가져오기
        const response = await audioAPI.getAudio(audioUrl);
        if (response.success && response.data?.presigned_url) {
          setPlaybackUrl(response.data.presigned_url);
        } else {
          // presigned URL이 없으면 원본 URL 시도
          setPlaybackUrl(response.data?.audio_url || audioUrl);
        }
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      Alert.alert('오류', '음성을 불러올 수 없습니다.');
      setShowAudioModal(false);
    } finally {
      setLoadingAudio(false);
    }
  };

  const playAudio = async () => {
    if (!playbackUrl) return;

    try {
      if (soundRef.current && isPlaying) {
        // 재생 중이면 일시정지
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        if (playbackTimer.current) {
          clearInterval(playbackTimer.current);
        }
      } else if (soundRef.current && !isPlaying) {
        // 일시정지 상태면 재개
        await soundRef.current.playAsync();
        setIsPlaying(true);
        startPlaybackTimer();
      } else {
        // 처음 재생
        const { sound } = await Audio.Sound.createAsync(
          { uri: playbackUrl },
          { shouldPlay: true }
        );

        soundRef.current = sound;
        setIsPlaying(true);
        setPlaybackDuration(0);

        // 전체 재생 시간 가져오기
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          setTotalDuration(Math.floor(status.durationMillis / 1000));
        }

        // 재생 완료 리스너
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
            setPlaybackDuration(0);
            if (playbackTimer.current) {
              clearInterval(playbackTimer.current);
            }
          }
        });

        startPlaybackTimer();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('오류', '음성을 재생할 수 없습니다.');
    }
  };

  const startPlaybackTimer = () => {
    playbackTimer.current = setInterval(() => {
      setPlaybackDuration(prev => {
        if (prev >= totalDuration && totalDuration > 0) {
          return totalDuration;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const closeAudioModal = async () => {
    // 재생 중지 및 정리
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    if (playbackTimer.current) {
      clearInterval(playbackTimer.current);
      playbackTimer.current = null;
    }
    setShowAudioModal(false);
    setPlaybackUrl(null);
    setLoadingAudio(false);
    setIsPlaying(false);
    setPlaybackDuration(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <View className={`mb-3 ${isMyMessage ? 'items-end' : 'items-start'}`}>
        <TouchableOpacity
          onPress={handleAudioPress}
          className={`max-w-[85%] p-4 rounded-xl shadow-sm ${
            isMyMessage ? 'bg-green-500' : 'bg-white border border-gray-200'
          }`}
          activeOpacity={0.7}
        >
          {/* 음성 헤더 */}
          <View className="flex-row items-center mb-3">
            <View className={`w-8 h-8 rounded-full items-center justify-center ${
              isMyMessage ? 'bg-green-400' : 'bg-green-100'
            }`}>
              <Ionicons
                name="mic"
                size={16}
                color={isMyMessage ? 'white' : '#10B981'}
              />
            </View>
            <Text className={`ml-2 font-semibold ${
              isMyMessage ? 'text-white' : 'text-green-700'
            }`}>
              면접 음성
            </Text>
          </View>

          {/* 음성 미리보기 영역 */}
          <View className={`rounded-lg p-4 items-center justify-center ${
            isMyMessage ? 'bg-green-400/20' : 'bg-gray-100'
          }`}>
            <Ionicons
              name="headset"
              size={32}
              color={isMyMessage ? 'white' : '#10B981'}
            />
            <Text className={`mt-2 text-sm ${
              isMyMessage ? 'text-green-100' : 'text-gray-600'
            }`}>
              음성을 재생하려면 탭하세요
            </Text>
          </View>

          {/* 안내 텍스트 */}
          <Text className={`text-xs mt-2 ${
            isMyMessage ? 'text-green-100' : 'text-gray-500'
          }`}>
            3가지 질문에 대한 면접 답변 음성입니다
          </Text>
        </TouchableOpacity>

        <Text className="text-xs text-gray-400 mt-1 mx-1">
          {timestamp}
        </Text>
      </View>

      {/* 음성 재생 모달 */}
      <Modal
        visible={showAudioModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAudioModal}
      >
        <View className="flex-1 bg-white">
          {/* 모달 헤더 */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="font-semibold text-lg">면접 음성</Text>
            <TouchableOpacity
              onPress={closeAudioModal}
              className="p-2"
            >
              <Ionicons name="close" size={30} color="#000" />
            </TouchableOpacity>
          </View>

          {/* 음성 콘텐츠 */}
          <View className="flex-1 justify-center items-center p-6">
            {loadingAudio ? (
              <>
                <ActivityIndicator size="large" color="#10B981" />
                <Text className="text-gray-600 mt-2">음성 로딩 중...</Text>
              </>
            ) : playbackUrl ? (
              <>
                {/* 오디오 아이콘 */}
                <View className="bg-green-100 rounded-full p-8 mb-6">
                  <Ionicons
                    name={isPlaying ? "pause-circle" : "play-circle"}
                    size={80}
                    color="#10B981"
                  />
                </View>

                {/* 재생 시간 */}
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                  {formatTime(playbackDuration)}
                  {totalDuration > 0 && ` / ${formatTime(totalDuration)}`}
                </Text>

                {/* 재생 진행 바 */}
                {totalDuration > 0 && (
                  <View className="w-full max-w-xs h-2 bg-gray-200 rounded-full mb-6">
                    <View
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${(playbackDuration / totalDuration) * 100}%`
                      }}
                    />
                  </View>
                )}

                {/* 재생/일시정지 버튼 */}
                <TouchableOpacity
                  onPress={playAudio}
                  className="bg-green-500 px-8 py-4 rounded-full flex-row items-center"
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={24}
                    color="white"
                  />
                  <Text className="text-white font-semibold ml-2">
                    {isPlaying ? '일시정지' : '재생'}
                  </Text>
                </TouchableOpacity>

                {/* 질문 안내 */}
                <View className="mt-8 p-4 bg-gray-50 rounded-xl">
                  <Text className="text-sm text-gray-600 text-center">
                    이 음성은 다음 질문들에 대한 답변입니다:{'\n'}
                    1. 간단한 자기소개{'\n'}
                    2. 지원 동기{'\n'}
                    3. 본인의 강점
                  </Text>
                </View>
              </>
            ) : (
              <View className="items-center">
                <Ionicons name="alert-circle" size={48} color="#EF4444" />
                <Text className="text-gray-600 mt-2">음성을 로드할 수 없습니다</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};