import React from 'react';
import { Modal, View, Image, TouchableOpacity, Dimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileImageModalProps {
  visible: boolean;
  imageUrl: string | null;
  userName?: string;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ProfileImageModal: React.FC<ProfileImageModalProps> = ({
  visible,
  imageUrl,
  userName,
  onClose
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/10 justify-center items-center">
        {/* Close button */}
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-12 right-4 z-10 w-10 h-10 bg-black/50 rounded-full justify-center items-center"
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>

        {/* Image container */}
        <View className="justify-center items-center px-4">
          {imageUrl ? (
            <View
              style={{
                width: screenWidth - 32,
                height: screenWidth - 32,
                maxWidth: screenHeight * 0.6,
                maxHeight: screenHeight * 0.6
              }}
              className="rounded-full overflow-hidden bg-gray-200 shadow-lg"
            >
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: '100%',
                  height: '100%'
                }}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View 
              style={{
                width: screenWidth - 32,
                height: screenWidth - 32,
                maxWidth: screenHeight * 0.6,
                maxHeight: screenHeight * 0.6
              }}
              className="bg-gray-200 rounded-full justify-center items-center"
            >
              <Text className="text-8xl font-bold text-gray-400">
                {userName?.charAt(0) || '?'}
              </Text>
            </View>
          )}
        </View>

        {/* Tap anywhere to close */}
        <TouchableOpacity
          className="absolute inset-0"
          onPress={onClose}
          activeOpacity={1}
        />
      </View>
    </Modal>
  );
};