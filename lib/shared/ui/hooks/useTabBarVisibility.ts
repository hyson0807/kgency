import { useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useTabBar } from '@/contexts/TabBarContext';
export const useTabBarVisibility = () => {
    const { isTabBarVisible, setIsTabBarVisible } = useTabBar();
    const lastOffsetY = useRef(0);
    const scrollDirection = useRef<'up' | 'down'>('up');
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentOffsetY = event.nativeEvent.contentOffset.y;
        const threshold = 10; // 스크롤 민감도 조절
        if (Math.abs(currentOffsetY - lastOffsetY.current) < threshold) {
            return;
        }
        if (currentOffsetY > lastOffsetY.current && currentOffsetY > 100) {
            // 아래로 스크롤 중이고 일정 거리 이상 스크롤했을 때
            if (scrollDirection.current !== 'down') {
                scrollDirection.current = 'down';
                setIsTabBarVisible(false);
            }
        } else if (currentOffsetY < lastOffsetY.current) {
            // 위로 스크롤 중일 때
            if (scrollDirection.current !== 'up') {
                scrollDirection.current = 'up';
                setIsTabBarVisible(true);
            }
        }
        lastOffsetY.current = currentOffsetY;
    };
    return {
        isTabBarVisible,
        handleScroll
    };
};