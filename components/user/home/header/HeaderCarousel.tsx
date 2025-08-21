import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { InstantInterviewCard } from './cards/InstantInterviewCard';
import { ProfileBoostCard } from './cards/ProfileBoostCard';

const { width } = Dimensions.get('window');

export const HeaderCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(1); // 가운데(실제 첫번째) 카드부터 시작
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const originalCards = [InstantInterviewCard, ProfileBoostCard];
  // 무한 스크롤을 위해 앞뒤로 복사본 추가
  const cards = [
    originalCards[originalCards.length - 1], // 마지막 카드 복사본
    ...originalCards,
    originalCards[0] // 첫번째 카드 복사본
  ];

  const startAutoScroll = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true
      });
    }, 4000);
  };

  useEffect(() => {
    // 초기 위치 설정 (가운데 카드로)
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: width,
        animated: false
      });
    }, 0);
  }, []);

  useEffect(() => {
    startAutoScroll();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    
    if (index !== currentIndex) {
      setCurrentIndex(index);
      
      // 무한 스크롤 처리 - 스크롤 애니메이션이 완전히 끝난 후 처리
      if (index === 0) {
        // 첫번째 복사본(마지막 카드)에 도달하면 실제 마지막 카드로 이동
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: originalCards.length * width,
            animated: false
          });
          setCurrentIndex(originalCards.length);
        }, 50); // 타이밍을 줄여서 더 자연스럽게
      } else if (index === cards.length - 1) {
        // 마지막 복사본(첫번째 카드)에 도달하면 실제 첫번째 카드로 이동
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: width,
            animated: false
          });
          setCurrentIndex(1);
        }, 50); // 타이밍을 줄여서 더 자연스럽게
      }
    }
  };

  // 인디케이터를 위한 실제 인덱스 계산
  const getRealIndex = () => {
    if (currentIndex === 0) return originalCards.length - 1;
    if (currentIndex === cards.length - 1) return 0;
    return currentIndex - 1;
  };

  return (
    <View style={{ marginHorizontal: -16 }}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        onScrollBeginDrag={() => {
          // 사용자가 스크롤 시작하면 자동 스크롤 중지
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        }}
        onScrollEndDrag={() => {
          // 스크롤 끝나면 자동 스크롤 재시작
          startAutoScroll();
        }}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="start"
      >
        {cards.map((Card, index) => (
          <View key={index} style={{ width: width, paddingHorizontal: 16 }}>
            <Card />
          </View>
        ))}
      </ScrollView>
      
      {/* 인디케이터 */}
      <View className="flex-row justify-center mt-2 space-x-2">
        {originalCards.map((_, index) => (
          <View
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === getRealIndex() ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </View>
    </View>
  );
};