# App Update System

앱 버전 관리 및 업데이트 시스템입니다. OTA(Over-The-Air) 업데이트와 스토어 업데이트를 모두 지원하며, 강제 업데이트 기능이 포함되어 있습니다.

## 주요 기능

### 1. 버전 체크 및 업데이트
- **OTA 업데이트**: Expo Updates를 통한 코드 레벨 업데이트
- **스토어 업데이트**: 앱스토어/플레이스토어 새 버전 체크 및 이동
- **강제 업데이트**: 특정 버전에 대한 필수 업데이트 기능

### 2. 캐시 관리
- **버전별 캐시 정리**: 앱 업데이트 후 호환되지 않는 데이터 정리
- **선택적 데이터 보존**: 중요한 사용자 데이터는 보존
- **초기화 실패 방지**: 업데이트 후 발생할 수 있는 초기화 문제 해결

### 3. 사용자 경험
- **스마트 모달**: 강제/선택적 업데이트에 따른 적절한 UI 제공
- **건너뛰기 기능**: 선택적 업데이트 시 사용자가 나중에 업데이트 가능
- **개발자 친화적**: 개발 환경에서는 업데이트 체크 건너뛰기

## 파일 구조

```
lib/features/updates/
├── types/index.ts              # TypeScript 타입 정의
├── services/                   # 핵심 비즈니스 로직
│   ├── storeVersionService.ts  # 스토어 버전 체크 서비스
│   ├── storeNavigationService.ts # 스토어 이동 서비스
│   └── cacheResetService.ts    # 캐시 정리 서비스
├── hooks/
│   └── useAppUpdate.ts         # 업데이트 상태 관리 훅
├── components/
│   └── StoreUpdateModal.tsx    # 업데이트 모달 컴포넌트
├── config/index.ts             # 설정 파일
├── index.ts                    # 배럴 익스포트
└── README.md                   # 이 파일
```

## 사용법

### 기본 사용법
```tsx
// 이미 _layout.tsx에 적용되어 있습니다
import { UpdateManager } from '@/components/shared/update-manager';

export default function RootLayout() {
  return (
    <UpdateManager>
      {/* 앱 컴포넌트들 */}
    </UpdateManager>
  );
}
```

### 개별 컴포넌트에서 사용
```tsx
import { useAppUpdate, StoreUpdateModal } from '@/lib/features/updates';

export function MyComponent() {
  const {
    isChecking,
    store,
    shouldForceUpdate,
    openStore,
    skipVersion,
  } = useAppUpdate({
    forceUpdateVersions: ['1.0.0', '1.0.1'],
  });

  return (
    <StoreUpdateModal
      visible={store.needsUpdate}
      updateState={{ isChecking, ota: { isAvailable: false, isDownloading: false, error: null }, store, error: null }}
      onUpdate={openStore}
      onSkip={shouldForceUpdate ? undefined : skipVersion}
    />
  );
}
```

## 설정

### 강제 업데이트 버전 추가
```tsx
// lib/features/updates/config/index.ts
export const UPDATE_CONFIG = {
  forceUpdateVersions: [
    '1.0.0',  // 보안 취약점이 있던 버전
    '1.0.1',  // 중대한 버그가 있던 버전
    // 새로운 강제 업데이트 버전 추가
  ],
};
```

### App Store ID / Package Name 수정
```tsx
// lib/features/updates/config/index.ts
export const UPDATE_CONFIG = {
  appStoreId: '실제_앱스토어_ID',
  playStorePackageName: 'com.company.appname',
};
```

## 동작 원리

### 1. 업데이트 체크 순서
1. **OTA 업데이트 체크** (우선순위 높음)
   - Expo Updates를 통한 코드 레벨 업데이트 확인
   - 있으면 자동 다운로드 후 앱 재시작
2. **스토어 버전 체크**
   - iTunes API (iOS) 또는 서버 API (Android)를 통한 버전 확인
   - 현재 버전과 비교하여 업데이트 필요성 판단
3. **캐시 정리**
   - 버전이 바뀐 경우 호환되지 않는 캐시 데이터 정리

### 2. 강제 업데이트 로직
- 현재 버전이 `forceUpdateVersions` 배열에 포함된 경우 강제 업데이트
- 강제 업데이트 시 '나중에' 또는 '닫기' 버튼 비활성화
- 사용자가 반드시 스토어에서 업데이트해야만 앱 사용 가능

### 3. 캐시 정리 전략
- **보존 데이터**: 인증 토큰, 사용자 ID, 언어 설정 등
- **정리 대상**: 임시 캐시, deprecated 설정, 버전별 특정 데이터
- **메이저 업데이트**: 전체 캐시 정리 후 중요 데이터만 복원

## 주의사항

1. **App Store ID**: 실제 앱스토어 출시 후 config에서 정확한 ID로 변경 필요
2. **Android 버전 체크**: 현재는 임시 구현, 서버 API를 통한 구현 권장
3. **강제 업데이트**: 신중하게 적용, 사용자 경험을 고려하여 설정
4. **개발 환경**: 개발 중에는 업데이트 체크가 비활성화됨

## 문제 해결

### 초기화 실패 문제
- `CacheResetService`가 자동으로 호환되지 않는 데이터 정리
- 특정 버전에서 문제가 발생하는 경우 `VERSION_CLEANUP_RULES`에 정리 규칙 추가

### 버전 체크 실패
- 네트워크 문제나 API 오류 시 graceful fallback
- 개발 환경에서는 자동으로 건너뛰기

### 강제 업데이트 해제
- 응급 상황 시 서버를 통해 `forceUpdateVersions` 배열을 비우거나
- 앱 설정에서 임시로 비활성화 가능