import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('초기화 ErrorBoundary에서 에러 캐치:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center bg-white px-6">
          <Ionicons name="bug-outline" size={64} color="#ef4444" />
          
          <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
            예기치 못한 오류가 발생했습니다
          </Text>
          
          <Text className="text-sm text-gray-600 mt-2 text-center">
            앱을 다시 시작해주세요. 문제가 계속되면 고객센터에 문의해주세요.
          </Text>
          
          {/* 개발 모드에서만 에러 정보 표시 */}
          {__DEV__ && this.state.error && (
            <Text className="text-xs text-red-500 mt-4 text-center">
              {this.state.error.message}
            </Text>
          )}
          
          <TouchableOpacity
            onPress={this.handleRetry}
            className="bg-blue-500 px-6 py-3 rounded-lg mt-6"
          >
            <Text className="text-white font-semibold">다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}