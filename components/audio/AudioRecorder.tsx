import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { audioAPI } from '@/lib/core/api/audio';

interface AudioRecorderProps {
  onAudioSaved?: (audioUrl: string) => void;
  title?: string;
  description?: string;
  maxDuration?: number; // 최대 녹음 시간 (초)
}

interface SavedAudio {
  id: string;
  audio_url: string;
  title?: string;
  description?: string;
  duration?: number;
  created_at: string;
}

export default function AudioRecorder({
  onAudioSaved,
  title,
  description,
  maxDuration = 90 // 기본 90초 (3개 질문 x 30초)
}: AudioRecorderProps = {}) {
  const { user } = useAuth();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [savedAudios, setSavedAudios] = useState<SavedAudio[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<SavedAudio | null>(null);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const playbackTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadUserAudios();
    return () => {
      // Cleanup
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      if (playbackTimer.current) {
        clearInterval(playbackTimer.current);
      }
    };
  }, []);

  const loadUserAudios = async () => {
    try {
      const response = await audioAPI.getUserAudios();
      if (response.success && response.data) {
        setSavedAudios(response.data);
      }
    } catch (error) {
      console.error('Error loading audios:', error);
    }
  };

  const startRecording = async () => {
    try {
      // 권한 확인
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
        return;
      }

      // 오디오 모드 설정
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: 1, // InterruptionModeIOS.DoNotMix
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1, // InterruptionModeAndroid.DoNotMix
        playThroughEarpieceAndroid: false,
      });

      // 녹음 시작
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      // 녹음 시간 타이머 시작
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          // 최대 시간 도달 시 자동 중지
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('오류', '녹음을 시작할 수 없습니다.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      // 타이머 중지
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      setIsRecording(false);
      await recording.stopAndUnloadAsync();

      // 오디오 모드 재설정
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      if (uri) {
        setAudioUri(uri);
        setRecording(null);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('오류', '녹음 중지 중 오류가 발생했습니다.');
    }
  };

  const playRecording = async () => {
    if (!audioUri) return;

    try {
      if (sound && isPlaying) {
        // 재생 중이면 일시정지
        await sound.pauseAsync();
        setIsPlaying(false);
        if (playbackTimer.current) {
          clearInterval(playbackTimer.current);
        }
      } else if (sound && !isPlaying) {
        // 일시정지 상태면 재개
        await sound.playAsync();
        setIsPlaying(true);
        startPlaybackTimer();
      } else {
        // 처음 재생
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );

        setSound(newSound);
        setIsPlaying(true);
        setPlaybackDuration(0);

        // 재생 완료 리스너
        newSound.setOnPlaybackStatusUpdate((status) => {
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
      console.error('Error playing recording', error);
      Alert.alert('오류', '녹음 재생 중 오류가 발생했습니다.');
    }
  };

  const startPlaybackTimer = () => {
    playbackTimer.current = setInterval(() => {
      setPlaybackDuration(prev => prev + 1);
    }, 1000);
  };

  const saveAudio = async () => {
    if (!audioUri || !user?.userId) return;

    setIsLoading(true);
    try {
      // FormData 생성
      const formData = new FormData();
      const filename = `audio_${Date.now()}.m4a`;

      // React Native FormData는 특별한 형식이 필요
      formData.append('audio', {
        uri: audioUri,
        type: Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mp4',
        name: filename,
      } as any);
      formData.append('user_id', user.userId);
      formData.append('title', title || `면접 음성 ${new Date().toLocaleDateString()}`);
      if (description) {
        formData.append('description', description);
      }
      formData.append('duration', recordingDuration.toString());

      const response = await audioAPI.uploadAudio(formData);

      if (!response.success) {
        throw new Error(response.error || '음성 저장 실패');
      }

      Alert.alert('성공', '음성이 저장되었습니다.');

      // onAudioSaved 콜백 호출
      if (onAudioSaved && response.data?.audio_url) {
        onAudioSaved(response.data.audio_url);
      }

      // 상태 초기화
      setAudioUri(null);
      setRecordingDuration(0);
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      await loadUserAudios();
    } catch (error) {
      console.error('Error saving audio:', error);
      Alert.alert('오류', '음성 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAudio = async (audioId: string) => {
    Alert.alert(
      '음성 삭제',
      '이 음성을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await audioAPI.deleteAudio(audioId);

              if (!response.success) {
                throw new Error(response.error || '음성 삭제 실패');
              }

              Alert.alert('성공', '음성이 삭제되었습니다.');
              await loadUserAudios();
              setShowAudioModal(false);
              setSelectedAudio(null);
            } catch (error) {
              console.error('Error deleting audio:', error);
              Alert.alert('오류', '음성 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!permissionResponse?.granted) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Ionicons name="mic-off" size={48} color="#3B82F6" />
        <Text className="text-center text-lg font-semibold mb-2 mt-4">
          마이크 권한이 필요합니다
        </Text>
        <Text className="text-center text-gray-600 mb-6">
          음성 녹음을 위해 마이크 권한이 필요합니다.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">권한 허용</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-xl font-bold mb-4">음성 녹음</Text>

        {/* 녹음 인터페이스 */}
        <View className="bg-gray-50 rounded-xl p-6 mb-4">
          {/* 녹음 상태 표시 */}
          <View className="items-center mb-4">
            {isRecording ? (
              <View className="items-center">
                <View className="bg-red-100 rounded-full p-4 mb-2">
                  <Ionicons name="mic" size={48} color="#EF4444" />
                </View>
                <Text className="text-red-600 font-semibold text-lg">녹음 중...</Text>
                <Text className="text-2xl font-bold mt-2">{formatTime(recordingDuration)}</Text>
                <Text className="text-gray-500 text-sm">최대 {formatTime(maxDuration)}</Text>
              </View>
            ) : audioUri ? (
              <View className="items-center">
                <View className="bg-green-100 rounded-full p-4 mb-2">
                  <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                </View>
                <Text className="text-green-600 font-semibold">녹음 완료</Text>
                <Text className="text-lg font-semibold mt-2">{formatTime(recordingDuration)}</Text>
              </View>
            ) : (
              <View className="items-center">
                <View className="bg-gray-200 rounded-full p-4 mb-2">
                  <Ionicons name="mic-outline" size={48} color="#6B7280" />
                </View>
                <Text className="text-gray-600">녹음 준비</Text>
              </View>
            )}
          </View>

          {/* 컨트롤 버튼 */}
          <View className="flex-row justify-center space-x-4">
            {!isRecording && !audioUri && (
              <TouchableOpacity
                onPress={startRecording}
                className="bg-red-500 px-6 py-3 rounded-full flex-row items-center"
              >
                <Ionicons name="mic" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">녹음 시작</Text>
              </TouchableOpacity>
            )}

            {isRecording && (
              <TouchableOpacity
                onPress={stopRecording}
                className="bg-gray-500 px-6 py-3 rounded-full flex-row items-center"
              >
                <Ionicons name="stop" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">중지</Text>
              </TouchableOpacity>
            )}

            {audioUri && (
              <>
                <TouchableOpacity
                  onPress={playRecording}
                  className="bg-blue-500 px-4 py-3 rounded-full"
                >
                  <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setAudioUri(null);
                    setRecordingDuration(0);
                    if (sound) {
                      sound.unloadAsync();
                      setSound(null);
                    }
                  }}
                  className="bg-gray-400 px-4 py-3 rounded-full"
                >
                  <Ionicons name="refresh" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={saveAudio}
                  disabled={isLoading}
                  className="bg-green-500 px-6 py-3 rounded-full flex-row items-center"
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="save" size={20} color="white" />
                      <Text className="text-white font-semibold ml-2">저장</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* 재생 중 진행 표시 */}
          {isPlaying && (
            <View className="mt-4">
              <Text className="text-center text-gray-600">
                재생 중: {formatTime(playbackDuration)} / {formatTime(recordingDuration)}
              </Text>
            </View>
          )}
        </View>

        {/* 저장된 음성 목록 */}
        <View className="mt-6">
          <Text className="text-lg font-semibold mb-3">저장된 음성</Text>
          {savedAudios.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">
              아직 저장된 음성이 없습니다.
            </Text>
          ) : (
            <View className="space-y-2">
              {savedAudios.map((audio) => (
                <TouchableOpacity
                  key={audio.id}
                  onPress={async () => {
                    setSelectedAudio(audio);
                    setShowAudioModal(true);
                  }}
                  className="bg-gray-50 p-4 rounded-lg flex-row justify-between items-center"
                >
                  <View className="flex-1">
                    <Text className="font-medium">{audio.title || '제목 없음'}</Text>
                    <Text className="text-sm text-gray-500">
                      {new Date(audio.created_at).toLocaleDateString()}
                    </Text>
                    {audio.duration && (
                      <Text className="text-xs text-gray-400">
                        {formatTime(audio.duration)}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="play-circle" size={24} color="#3B82F6" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* 음성 재생 모달 */}
      <Modal
        visible={showAudioModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAudioModal(false);
          setSelectedAudio(null);
        }}
      >
        <View className="flex-1 bg-white">
          {selectedAudio && (
            <>
              <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                <TouchableOpacity
                  onPress={() => {
                    setShowAudioModal(false);
                    setSelectedAudio(null);
                  }}
                  className="p-2"
                >
                  <Ionicons name="close" size={30} color="#000" />
                </TouchableOpacity>
                <Text className="font-semibold flex-1 text-center">
                  {selectedAudio.title || '제목 없음'}
                </Text>
                <TouchableOpacity
                  onPress={() => deleteAudio(selectedAudio.id)}
                  className="p-2"
                >
                  <Ionicons name="trash" size={24} color="red" />
                </TouchableOpacity>
              </View>

              <View className="flex-1 justify-center items-center p-6">
                <View className="bg-blue-100 rounded-full p-8 mb-6">
                  <Ionicons name="headset" size={64} color="#3B82F6" />
                </View>

                <Text className="text-xl font-semibold mb-2">
                  {selectedAudio.title}
                </Text>
                <Text className="text-gray-500 mb-6">
                  {new Date(selectedAudio.created_at).toLocaleString()}
                </Text>

                <TouchableOpacity
                  className="bg-blue-500 px-8 py-4 rounded-full"
                  onPress={async () => {
                    // 여기에 음성 재생 로직 추가
                    try {
                      const response = await audioAPI.getAudio(selectedAudio.id);
                      if (response.success && response.data?.presigned_url) {
                        const { sound } = await Audio.Sound.createAsync(
                          { uri: response.data.presigned_url },
                          { shouldPlay: true }
                        );
                        // 재생 완료 후 정리
                        sound.setOnPlaybackStatusUpdate((status) => {
                          if (status.isLoaded && status.didJustFinish) {
                            sound.unloadAsync();
                          }
                        });
                      }
                    } catch (error) {
                      Alert.alert('오류', '음성을 재생할 수 없습니다.');
                    }
                  }}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="play" size={24} color="white" />
                    <Text className="text-white font-semibold ml-2">재생</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}