import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { Animated, LayoutAnimation, Platform } from 'react-native';
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
        if (Platform.OS === 'ios') {
            // iOS: LayoutAnimation 사용 (부드러운 애니메이션)
            LayoutAnimation.configureNext({
                duration: 300,
                create: {
                    type: LayoutAnimation.Types.easeInEaseOut,
                    property: LayoutAnimation.Properties.opacity,
                },
                update: {
                    type: LayoutAnimation.Types.easeInEaseOut,
                },
                delete: {
                    type: LayoutAnimation.Types.easeInEaseOut,
                    property: LayoutAnimation.Properties.opacity,
                },
            });
            setIsTabBarVisible(visible);
        } else {
            // Android: 즉시 변경 (빈 공간 문제 방지)
            setIsTabBarVisible(visible);
        }
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