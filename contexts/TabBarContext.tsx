import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


interface TabBarContextType {
    isTabBarVisible: boolean;
    setIsTabBarVisible: (visible: boolean) => void;
    tabBarHeight: number;
    translateY: Animated.Value;
}
const TabBarContext = createContext<TabBarContextType | undefined>(undefined);
interface TabBarProviderProps {
    children: ReactNode;
}
export const TabBarProvider: React.FC<TabBarProviderProps> = ({ children }) => {
    const [isTabBarVisible, setIsTabBarVisible] = useState(true);
    const insets = useSafeAreaInsets();
    
    // 탭바 전체 높이 계산 (높이 + 패딩)
    const tabBarHeight = (Platform.OS === 'ios' ? 50 : 60) + insets.bottom + 10;
    const translateY = useRef(new Animated.Value(0)).current;
    const setIsTabBarVisibleWithAnimation = (visible: boolean) => {
        // 부드러운 애니메이션으로 탭바를 올리고 내림
        Animated.timing(translateY, {
            toValue: visible ? 0 : tabBarHeight, // 보일 때는 0, 숨길 때는 탭바 높이만큼 아래로
            duration: 250,
            useNativeDriver: true,
        }).start();
        
        // 상태는 즉시 업데이트 (애니메이션과 독립적으로)
        setIsTabBarVisible(visible);
    };
    return (
        <TabBarContext.Provider value={{ 
            isTabBarVisible, 
            setIsTabBarVisible: setIsTabBarVisibleWithAnimation, 
            tabBarHeight,
            translateY
        }}>
            {children}
        </TabBarContext.Provider>
    );
};
export const useTabBar = () => {
    const context = useContext(TabBarContext);
    if (context === undefined) {
        throw new Error('useTabBar must be used within a TabBarProvider');
    }
    return context;
};