import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Alert, ActivityIndicator, ActionSheetIOS, Platform, Modal, Text } from 'react-native';
import { launchImageLibraryAsync, launchCameraAsync, requestMediaLibraryPermissionsAsync, requestCameraPermissionsAsync } from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileImageUploaderProps {
  currentImageUrl?: string | null;
  onImageUpdate?: (url: string | null) => void;
}

export default function ProfileImageUploader({ currentImageUrl, onImageUpdate }: ProfileImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setImageUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  const requestPermission = async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await launchImageLibraryAsync({
      mediaTypes: 'images' as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const mimeType = result.assets[0].mimeType || 'image/jpeg';
      await uploadImage(result.assets[0].base64, mimeType);
    }
  };

  const takePhoto = async () => {
    const { status } = await requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const mimeType = result.assets[0].mimeType || 'image/jpeg';
      await uploadImage(result.assets[0].base64, mimeType);
    }
  };

  const uploadImage = async (base64Image: string, mimeType: string) => {
    setLoading(true);
    try {
      // Base64 이미지 크기 체크 (약 8MB 제한)
      const sizeInBytes = (base64Image.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 8) {
        Alert.alert(
          '이미지 크기 초과', 
          `선택한 이미지가 너무 큽니다. (${sizeInMB.toFixed(1)}MB)\n8MB 이하의 이미지를 선택해주세요.`
        );
        setLoading(false);
        setModalVisible(false);
        return;
      }

      const endpoint = imageUrl ? '/api/profiles/image' : '/api/profiles/image';
      const method = imageUrl ? 'PUT' : 'POST';
      
      const response = await api(method, endpoint, {
        base64Image: `data:${mimeType};base64,${base64Image}`,
        mimeType
      });

      if (response.success) {
        setImageUrl(response.data.url);
        onImageUpdate?.(response.data.url);
        Alert.alert('성공', '프로필 이미지가 업데이트되었습니다.');
      }
    } catch (error: any) {
      console.error('이미지 업로드 실패:', error);
      
      // 서버 에러 타입에 따른 메시지 처리
      let errorMessage = '이미지 업로드에 실패했습니다.';
      
      if (error?.response?.status === 413) {
        errorMessage = '이미지 파일이 너무 큽니다.\n더 작은 크기의 이미지를 선택해주세요.';
      } else if (error?.response?.status === 400) {
        errorMessage = '올바르지 않은 이미지 형식입니다.\nJPEG 또는 PNG 파일을 선택해주세요.';
      } else if (error?.response?.status === 500) {
        errorMessage = '서버에서 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.';
      } else if (error?.message?.includes('Network Error') || error?.code === 'NETWORK_ERROR') {
        errorMessage = '네트워크 연결을 확인해주세요.';
      }
      
      Alert.alert('업로드 실패', errorMessage);
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  const deleteImage = async () => {
    Alert.alert(
      '프로필 이미지 삭제',
      '프로필 이미지를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await api('DELETE', '/api/profiles/image');
              if (response.success) {
                setImageUrl(null);
                onImageUpdate?.(null);
                Alert.alert('성공', '프로필 이미지가 삭제되었습니다.');
              }
            } catch (error) {
              console.error('이미지 삭제 실패:', error);
              Alert.alert('오류', '이미지 삭제에 실패했습니다.');
            } finally {
              setLoading(false);
              setModalVisible(false);
            }
          }
        }
      ]
    );
  };

  const showImageOptions = () => {
    if (Platform.OS === 'ios') {
      const options = imageUrl ? 
        ['사진 보관함에서 선택', '카메라로 촬영', '이미지 삭제', '취소'] :
        ['사진 보관함에서 선택', '카메라로 촬영', '취소'];
      
      const destructiveButtonIndex = imageUrl ? 2 : -1;
      const cancelButtonIndex = imageUrl ? 3 : 2;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) pickImage();
          else if (buttonIndex === 1) takePhoto();
          else if (imageUrl && buttonIndex === 2) deleteImage();
        }
      );
    } else {
      setModalVisible(true);
    }
  };

  return (
    <View className="items-center">
      <TouchableOpacity 
        onPress={showImageOptions}
        disabled={loading}
        className="relative"
      >
        {loading && (
          <View className="absolute inset-0 bg-black/50 rounded-full z-10 justify-center items-center">
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
        
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            className="w-24 h-24 rounded-full bg-gray-200"
            resizeMode="cover"
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-gray-200 justify-center items-center">
            <Ionicons name="person" size={50} color="#9CA3AF" />
          </View>
        )}
        
        <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2">
          <Ionicons name="camera" size={20} color="white" />
        </View>
      </TouchableOpacity>

      {/* Android Modal */}
      {Platform.OS === 'android' && (
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          animationType="slide"
        >
          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-4">
              <TouchableOpacity
                onPress={pickImage}
                className="py-4 border-b border-gray-200"
              >
                <Text className="text-center text-base">사진 보관함에서 선택</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={takePhoto}
                className="py-4 border-b border-gray-200"
              >
                <Text className="text-center text-base">카메라로 촬영</Text>
              </TouchableOpacity>
              
              {imageUrl && (
                <TouchableOpacity
                  onPress={deleteImage}
                  className="py-4 border-b border-gray-200"
                >
                  <Text className="text-center text-base text-red-500">이미지 삭제</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="py-4"
              >
                <Text className="text-center text-base text-gray-500">취소</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}