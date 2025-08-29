// components/app-initializer/SkeletonScreen.tsx
// 스켈레톤 로딩 UI 컴포넌트

import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

interface SkeletonScreenProps {
  variant?: 'home' | 'profile' | 'list' | 'card';
  userType?: 'user' | 'company';
  animated?: boolean;
}

export const SkeletonScreen: React.FC<SkeletonScreenProps> = ({
  variant = 'home',
  userType = 'user',
  animated = true
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animated, animatedValue]);

  const shimmerStyle = {
    opacity: animated ? animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }) : 0.4,
  };

  const SkeletonBox = ({ width: w, height: h, style = {} }: { width: number | string, height: number, style?: any }) => (
    <Animated.View
      style={[
        styles.skeletonBox,
        { width: w, height: h },
        shimmerStyle,
        style,
      ]}
    />
  );

  const renderHomeSkeleton = () => (
    <View style={styles.container}>
      {/* 헤더 영역 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <SkeletonBox width={120} height={20} />
          <SkeletonBox width={24} height={24} style={styles.roundBox} />
        </View>
        <SkeletonBox width={200} height={16} style={{ marginTop: 8 }} />
      </View>

      {/* 메인 컨텐츠 */}
      <View style={styles.content}>
        {userType === 'user' ? renderUserHomeSkeleton() : renderCompanyHomeSkeleton()}
      </View>

      {/* 하단 탭 바 */}
      <View style={styles.tabBar}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={styles.tabItem}>
            <SkeletonBox width={24} height={24} style={styles.roundBox} />
            <SkeletonBox width={40} height={12} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>
    </View>
  );

  const renderUserHomeSkeleton = () => (
    <>
      {/* 검색 바 */}
      <SkeletonBox width={width - 32} height={48} style={[styles.rounded, { marginBottom: 20 }]} />
      
      {/* 추천 카드들 */}
      <View style={styles.section}>
        <SkeletonBox width={120} height={18} style={{ marginBottom: 16 }} />
        <View style={styles.cardGrid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.jobCard}>
              <SkeletonBox width={60} height={60} style={[styles.roundBox, { marginBottom: 8 }]} />
              <SkeletonBox width="80%" height={16} style={{ marginBottom: 4 }} />
              <SkeletonBox width="60%" height={14} />
            </View>
          ))}
        </View>
      </View>

      {/* 최근 지원 현황 */}
      <View style={styles.section}>
        <SkeletonBox width={100} height={18} style={{ marginBottom: 16 }} />
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={[styles.listItem, { marginBottom: 12 }]}>
            <SkeletonBox width={40} height={40} style={[styles.roundBox, { marginRight: 12 }]} />
            <View style={{ flex: 1 }}>
              <SkeletonBox width="70%" height={16} style={{ marginBottom: 4 }} />
              <SkeletonBox width="50%" height={14} />
            </View>
            <SkeletonBox width={60} height={24} style={styles.rounded} />
          </View>
        ))}
      </View>
    </>
  );

  const renderCompanyHomeSkeleton = () => (
    <>
      {/* 통계 카드들 */}
      <View style={[styles.cardGrid, { marginBottom: 24 }]}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.statCard}>
            <SkeletonBox width={32} height={32} style={[styles.roundBox, { marginBottom: 8 }]} />
            <SkeletonBox width="80%" height={18} style={{ marginBottom: 4 }} />
            <SkeletonBox width="60%" height={14} />
          </View>
        ))}
      </View>

      {/* 채용 공고 목록 */}
      <View style={styles.section}>
        <View style={[styles.row, { marginBottom: 16 }]}>
          <SkeletonBox width={120} height={18} />
          <SkeletonBox width={80} height={32} style={styles.rounded} />
        </View>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={[styles.jobPostingCard, { marginBottom: 16 }]}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <SkeletonBox width="80%" height={18} style={{ marginBottom: 8 }} />
                <SkeletonBox width="60%" height={14} style={{ marginBottom: 8 }} />
                <SkeletonBox width="40%" height={12} />
              </View>
              <View style={styles.postingStats}>
                <SkeletonBox width={40} height={32} style={[styles.rounded, { marginBottom: 4 }]} />
                <SkeletonBox width={60} height={12} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </>
  );

  const renderProfileSkeleton = () => (
    <View style={styles.container}>
      {/* 프로필 헤더 */}
      <View style={[styles.section, { alignItems: 'center' }]}>
        <SkeletonBox width={80} height={80} style={[styles.roundBox, { marginBottom: 16 }]} />
        <SkeletonBox width={140} height={20} style={{ marginBottom: 8 }} />
        <SkeletonBox width={100} height={16} />
      </View>

      {/* 프로필 정보 */}
      <View style={styles.section}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} style={[styles.profileItem, { marginBottom: 20 }]}>
            <SkeletonBox width={80} height={14} style={{ marginBottom: 8 }} />
            <SkeletonBox width="100%" height={40} style={styles.rounded} />
          </View>
        ))}
      </View>
    </View>
  );

  const renderListSkeleton = () => (
    <View style={styles.container}>
      {Array.from({ length: 8 }).map((_, index) => (
        <View key={index} style={[styles.listItem, { marginBottom: 16 }]}>
          <SkeletonBox width={50} height={50} style={[styles.roundBox, { marginRight: 16 }]} />
          <View style={{ flex: 1 }}>
            <SkeletonBox width="80%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonBox width="60%" height={14} style={{ marginBottom: 4 }} />
            <SkeletonBox width="40%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderCardSkeleton = () => (
    <View style={styles.cardGrid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View key={index} style={styles.card}>
          <SkeletonBox width="100%" height={120} style={[styles.rounded, { marginBottom: 12 }]} />
          <SkeletonBox width="80%" height={16} style={{ marginBottom: 8 }} />
          <SkeletonBox width="60%" height={14} />
        </View>
      ))}
    </View>
  );

  switch (variant) {
    case 'profile':
      return renderProfileSkeleton();
    case 'list':
      return renderListSkeleton();
    case 'card':
      return renderCardSkeleton();
    case 'home':
    default:
      return renderHomeSkeleton();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  jobCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  statCard: {
    width: '30%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  jobPostingCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  postingStats: {
    alignItems: 'center',
  },
  card: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  profileItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  skeletonBox: {
    backgroundColor: '#e1e5e9',
    borderRadius: 4,
  },
  roundBox: {
    borderRadius: 50,
  },
  rounded: {
    borderRadius: 8,
  },
});

export default SkeletonScreen;