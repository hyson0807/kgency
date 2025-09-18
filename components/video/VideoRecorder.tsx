import React, { useState, useRef, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { videoAPI } from '@/lib/core/api/video';
import { UserVideo } from '@/lib/types/video';

export default function VideoRecorder() {
  const { user } = useAuth();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [savedVideos, setSavedVideos] = useState<UserVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<UserVideo | null>(null);
  const [videoPlaybackUrl, setVideoPlaybackUrl] = useState<string | null>(null);
  const [loadingPlayback, setLoadingPlayback] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraKey, setCameraKey] = useState(0); // 카메라 컴포넌트 재렌더링용
  const cameraRef = useRef<CameraView>(null);

  // 시뮬레이터 감지
  const isSimulator = Platform.OS === 'ios' && !Platform.isPad && Platform.select({ ios: 'simulator' }) === 'simulator';

  useEffect(() => {
    loadUserVideos();
  }, []);

  const loadUserVideos = async () => {
    try {
      const response = await videoAPI.getUserVideos();
      if (response.success && response.data) {
        setSavedVideos(response.data);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) {
      Alert.alert('오류', '카메라 참조를 찾을 수 없습니다.');
      return;
    }

    if (!isCameraReady) {
      Alert.alert('잠시만 기다려주세요', '카메라가 준비 중입니다.');
      return;
    }

    try {
      setIsRecording(true);
      // 약간의 딜레이를 추가하여 카메라가 완전히 준비되도록 함
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60, // 60초 제한
      });
      if (video?.uri) {
        setVideoUri(video.uri);
        setIsCameraReady(false); // 녹화 완료 후 카메라 상태 리셋
      }
    } catch (error: any) {
      console.error('Error recording video:', error);
      if (error.message?.includes('simulator')) {
        Alert.alert(
          '시뮬레이터 제한',
          '영상 녹화는 실제 디바이스에서만 가능합니다.\n실제 iPhone/Android 기기로 테스트해주세요.'
        );
      } else if (error.message?.includes('not ready')) {
        Alert.alert('카메라 준비 중', '카메라가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
        setIsCameraReady(false); // 에러 발생 시 카메라 상태 리셋
      } else {
        Alert.alert('오류', error.message || '영상 녹화 중 오류가 발생했습니다.');
      }
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const saveVideo = async () => {
    if (!videoUri || !user?.userId) return;

    setIsLoading(true);
    try {
      // 비디오를 로컬 갤러리에 저장
      if (mediaPermission?.status !== 'granted') {
        await requestMediaPermission();
      }
      
      await MediaLibrary.createAssetAsync(videoUri);
      
      // 서버에 업로드
      const formData = new FormData();
      const filename = `video_${Date.now()}.mp4`;
      
      // React Native FormData는 특별한 형식이 필요
      formData.append('video', {
        uri: videoUri,
        type: 'video/mp4',
        name: filename,
      } as any);
      formData.append('user_id', user.userId);
      formData.append('title', `연습 영상 ${new Date().toLocaleDateString()}`);

      const response = await videoAPI.uploadVideo(formData);

      if (!response.success) {
        if (response.error?.includes('S3 credentials')) {
          Alert.alert(
            'S3 설정 필요', 
            'AWS S3 자격 증명이 설정되지 않았습니다.\n관리자에게 문의하거나 AWS 설정을 완료해주세요.'
          );
          return;
        }
        throw new Error(response.error || '영상 저장 실패');
      }

      Alert.alert('성공', '영상이 저장되었습니다.');
      setVideoUri(null);
      await loadUserVideos();
    } catch (error) {
      console.error('Error saving video:', error);
      Alert.alert('오류', '영상 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVideo = async (videoId: string) => {
    Alert.alert(
      '영상 삭제',
      '이 영상을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await videoAPI.deleteVideo(videoId);
              
              if (!response.success) {
                throw new Error(response.error || '영상 삭제 실패');
              }
              
              Alert.alert('성공', '영상이 삭제되었습니다.');
              await loadUserVideos();
              setShowVideoModal(false);
              setSelectedVideo(null);
            } catch (error) {
              console.error('Error deleting video:', error);
              Alert.alert('오류', '영상 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const toggleCameraFacing = () => {
    if (isRecording) {
      Alert.alert('녹화 중', '녹화 중에는 카메라를 전환할 수 없습니다.');
      return;
    }
    
    console.log('🔄 Toggling camera facing...');
    setIsCameraReady(false);
    setFacing(current => (current === 'back' ? 'front' : 'back'));
    // 카메라 컴포넌트를 강제로 재렌더링하여 onCameraReady가 다시 호출되도록 함
    setCameraKey(prev => prev + 1);
  };

  if (!cameraPermission || !microphonePermission) {
    return <View />;
  }

  // 시뮬레이터에서 권한이 없는 경우 특별 처리 (재생은 가능하도록)
  if ((!cameraPermission.granted || !microphonePermission.granted) && isSimulator) {
    return (
      <ScrollView className="flex-1 bg-white">
        <View className="p-4">
          <Text className="text-xl font-bold mb-4">영상 연습</Text>

          {/* 시뮬레이터 안내 */}
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <Text className="text-yellow-800 font-semibold ml-2">시뮬레이터 모드</Text>
            </View>
            <Text className="text-yellow-700 text-sm">
              영상 녹화는 실제 디바이스에서만 가능하지만, 기존에 저장된 영상은 재생할 수 있습니다.
            </Text>
          </View>

          {/* 녹화 불가능 영역 */}
          <View className="h-96 bg-gray-100 rounded-lg mb-4 flex justify-center items-center">
            <Ionicons name="videocam-off" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2">영상 녹화 불가능</Text>
            <Text className="text-gray-400 text-sm">실제 디바이스 필요</Text>
          </View>

          {/* 저장된 영상 목록 (재생 가능) */}
          <View className="mt-6">
            <Text className="text-lg font-semibold mb-3">저장된 영상</Text>
            {savedVideos.length === 0 ? (
              <Text className="text-gray-500 text-center py-4">
                아직 저장된 영상이 없습니다.
              </Text>
            ) : (
              <View className="space-y-2">
                {savedVideos.map((video) => (
                  <TouchableOpacity
                    key={video.id}
                    onPress={async () => {
                      setSelectedVideo(video);
                      setShowVideoModal(true);
                      setLoadingPlayback(true);
                      setVideoPlaybackUrl(null);
                      
                      try {
                        const response = await videoAPI.getVideo(video.id);
                        if (response.success && response.data?.presigned_url) {
                          setVideoPlaybackUrl(response.data.presigned_url);
                        } else {
                          setVideoPlaybackUrl(video.video_url);
                        }
                      } catch (error) {
                        console.error('Error getting video playback URL:', error);
                        setVideoPlaybackUrl(video.video_url);
                      } finally {
                        setLoadingPlayback(false);
                      }
                    }}
                    className="bg-gray-50 p-4 rounded-lg flex-row justify-between items-center"
                  >
                    <View className="flex-1">
                      <Text className="font-medium">{video.title || '제목 없음'}</Text>
                      <Text className="text-sm text-gray-500">
                        {new Date(video.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-xs text-green-600 mr-2">재생 가능</Text>
                      <Ionicons name="play-circle" size={24} color="#10B981" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 영상 재생 모달 (동일하게 유지) */}
        <Modal
          visible={showVideoModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setShowVideoModal(false);
            setSelectedVideo(null);
            setVideoPlaybackUrl(null);
            setLoadingPlayback(false);
          }}
        >
          <View className="flex-1 bg-black">
            {selectedVideo && (
              <>
                <View className="flex-row justify-between items-center p-4 bg-black/50">
                  <TouchableOpacity
                    onPress={() => {
                      setShowVideoModal(false);
                      setSelectedVideo(null);
                      setVideoPlaybackUrl(null);
                      setLoadingPlayback(false);
                    }}
                    className="p-2"
                  >
                    <Ionicons name="close" size={30} color="white" />
                  </TouchableOpacity>
                  <Text className="text-white font-semibold flex-1 text-center">
                    {selectedVideo.title || '제목 없음'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteVideo(selectedVideo.id)}
                    className="p-2"
                  >
                    <Ionicons name="trash" size={24} color="red" />
                  </TouchableOpacity>
                </View>
                {loadingPlayback ? (
                  <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="white" />
                    <Text className="text-white mt-2">영상 로딩 중...</Text>
                  </View>
                ) : videoPlaybackUrl ? (
                  <Video
                    source={{ uri: videoPlaybackUrl }}
                    style={{ flex: 1 }}
                    shouldPlay
                    isLooping
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    onError={(error) => {
                      console.error('Video playback error:', error);
                      Alert.alert('영상 재생 오류', '영상을 재생할 수 없습니다.');
                    }}
                  />
                ) : (
                  <View className="flex-1 justify-center items-center">
                    <Text className="text-white">영상을 로드할 수 없습니다</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </Modal>
      </ScrollView>
    );
  }

  if (!cameraPermission.granted || !microphonePermission.granted) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Ionicons name="key" size={48} color="#3B82F6" />
        <Text className="text-center text-lg font-semibold mb-2 mt-4">
          권한이 필요합니다
        </Text>
        <Text className="text-center text-gray-600 mb-6">
          영상 녹화를 위해 카메라와 마이크 권한이 필요합니다.
        </Text>
        <TouchableOpacity
          onPress={async () => {
            try {
              const results = await Promise.all([
                !cameraPermission.granted ? requestCameraPermission() : Promise.resolve(cameraPermission),
                !microphonePermission.granted ? requestMicrophonePermission() : Promise.resolve(microphonePermission)
              ]);
              
              const [cameraResult, microphoneResult] = results;
              
              if (!cameraResult.granted || !microphoneResult.granted) {
                Alert.alert(
                  '권한 허용 실패',
                  '카메라와 마이크 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
                  [
                    { text: '취소', style: 'cancel' },
                    { text: '설정으로', onPress: () => Linking.openSettings() }
                  ]
                );
              }
            } catch (error) {
              console.error('Permission request error:', error);
              Alert.alert('오류', '권한 요청 중 오류가 발생했습니다.');
            }
          }}
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
        <Text className="text-xl font-bold mb-4">영상 연습</Text>

        {/* 카메라 뷰 */}
        {!videoUri ? (
          <View className="h-96 bg-black rounded-lg overflow-hidden mb-4 relative">
            <CameraView
              key={cameraKey} // 키 변경으로 컴포넌트 재렌더링 강제
              ref={cameraRef}
              style={{ flex: 1 }}
              facing={facing}
              mode="video"
              onCameraReady={() => {
                console.log('Camera is ready, facing:', facing);
                setIsCameraReady(true);
              }}
              onMountError={(error) => {
                console.error('Camera mount error:', error);
                Alert.alert('카메라 오류', '카메라를 초기화할 수 없습니다.');
              }}
            />
            {!isCameraReady && (
              <View className="absolute inset-0 bg-black/50 flex justify-center items-center">
                <ActivityIndicator size="large" color="white" />
                <Text className="text-white mt-2">카메라 준비 중...</Text>
              </View>
            )}
            <View className="absolute bottom-4 left-0 right-0">
              <View className="flex-row justify-center items-center space-x-6">
                {/* 카메라 전환 버튼 */}
                <TouchableOpacity
                  onPress={toggleCameraFacing}
                  className="bg-white/30 p-3 rounded-full"
                >
                  <Ionicons name="camera-reverse" size={30} color="white" />
                </TouchableOpacity>

                {/* 녹화 버튼 */}
                <TouchableOpacity
                  onPress={isRecording ? stopRecording : startRecording}
                  disabled={!isCameraReady}
                  className={`${
                    isRecording ? 'bg-red-500' : isCameraReady ? 'bg-white' : 'bg-gray-400'
                  } p-4 rounded-full`}
                >
                  <View
                    className={`w-12 h-12 rounded-full ${
                      isRecording ? 'bg-white' : isCameraReady ? 'bg-red-500' : 'bg-gray-600'
                    }`}
                  />
                </TouchableOpacity>

                {/* 빈 공간 (레이아웃 균형) */}
                <View className="w-12" />
              </View>
            </View>
          </View>
        ) : (
          /* 녹화된 영상 프리뷰 */
          <View className="h-96 bg-black rounded-lg overflow-hidden mb-4">
            <Video
              source={{ uri: videoUri }}
              style={{ flex: 1 }}
              shouldPlay
              isLooping
              resizeMode={ResizeMode.CONTAIN}
            />
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center space-x-4">
              <TouchableOpacity
                onPress={() => setVideoUri(null)}
                className="bg-white/80 px-6 py-3 rounded-lg"
              >
                <Text className="font-semibold">다시 녹화</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveVideo}
                disabled={isLoading}
                className="bg-blue-500 px-6 py-3 rounded-lg"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 저장된 영상 목록 */}
        <View className="mt-6">
          <Text className="text-lg font-semibold mb-3">저장된 영상</Text>
          {savedVideos.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">
              아직 저장된 영상이 없습니다.
            </Text>
          ) : (
            <View className="space-y-2">
              {savedVideos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  onPress={async () => {
                    setSelectedVideo(video);
                    setShowVideoModal(true);
                    setLoadingPlayback(true);
                    setVideoPlaybackUrl(null);
                    
                    try {
                      // Presigned URL을 가져와서 재생
                      const response = await videoAPI.getVideo(video.id);
                      if (response.success && response.data?.presigned_url) {
                        setVideoPlaybackUrl(response.data.presigned_url);
                      } else {
                        // Presigned URL이 없으면 원본 URL 시도
                        setVideoPlaybackUrl(video.video_url);
                      }
                    } catch (error) {
                      console.error('Error getting video playback URL:', error);
                      // 에러 시 원본 URL로 시도
                      setVideoPlaybackUrl(video.video_url);
                    } finally {
                      setLoadingPlayback(false);
                    }
                  }}
                  className="bg-gray-50 p-4 rounded-lg flex-row justify-between items-center"
                >
                  <View className="flex-1">
                    <Text className="font-medium">{video.title || '제목 없음'}</Text>
                    <Text className="text-sm text-gray-500">
                      {new Date(video.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons name="play-circle" size={24} color="#3B82F6" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* 영상 재생 모달 */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowVideoModal(false);
          setSelectedVideo(null);
          setVideoPlaybackUrl(null);
          setLoadingPlayback(false);
        }}
      >
        <View className="flex-1 bg-black">
          {selectedVideo && (
            <>
              <View className="flex-row justify-between items-center p-4 bg-black/50">
                <TouchableOpacity
                  onPress={() => {
                    setShowVideoModal(false);
                    setSelectedVideo(null);
                    setVideoPlaybackUrl(null);
                    setLoadingPlayback(false);
                  }}
                  className="p-2"
                >
                  <Ionicons name="close" size={30} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-semibold flex-1 text-center">
                  {selectedVideo.title || '제목 없음'}
                </Text>
                <TouchableOpacity
                  onPress={() => deleteVideo(selectedVideo.id)}
                  className="p-2"
                >
                  <Ionicons name="trash" size={24} color="red" />
                </TouchableOpacity>
              </View>
              {loadingPlayback ? (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="white" />
                  <Text className="text-white mt-2">영상 로딩 중...</Text>
                </View>
              ) : videoPlaybackUrl ? (
                <Video
                  source={{ uri: videoPlaybackUrl }}
                  style={{ flex: 1 }}
                  shouldPlay
                  isLooping
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  onError={(error) => {
                    console.error('Video playback error:', error);
                    Alert.alert('영상 재생 오류', '영상을 재생할 수 없습니다.');
                  }}
                />
              ) : (
                <View className="flex-1 justify-center items-center">
                  <Text className="text-white">영상을 로드할 수 없습니다</Text>
                </View>
              )}
            </>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}