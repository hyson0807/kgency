# 개발 환경 설정

## 📋 필수 요구사항

### Node.js & npm
- **Node.js**: 18.x 이상
- **npm**: 9.x 이상

### 모바일 개발 환경

#### iOS (Mac only)
- **Xcode**: 최신 버전
- **iOS Simulator**: Xcode에 포함
- **CocoaPods**: `sudo gem install cocoapods`

#### Android
- **Android Studio**: 최신 버전
- **Android SDK**: API Level 33 이상
- **Android Emulator** 또는 **실제 디바이스**

### 기타 도구
- **Git**: 버전 관리
- **Expo CLI**: `npm install -g @expo/cli`
- **EAS CLI**: `npm install -g eas-cli`

## 🚀 프로젝트 설정

### 1. 저장소 클론
```bash
git clone <repository-url>
cd kgency
```

### 2. 모바일 앱 설정
```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에 Supabase 키 입력
```

### 3. 서버 설정
```bash
cd ../kgency_server
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에 필요한 키들 입력
```

## 🔑 환경 변수 설정

### 모바일 앱 (.env)
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 서버 (.env)
```bash
# Supabase 키
KEY_1=your_supabase_key_1
KEY_2=your_supabase_key_2

# JWT 시크릿
JWT_SECRET=your_jwt_secret

# SMS 서비스 (Solapi)
SOLAPI_API_KEY=your_solapi_key
SOLAPI_API_SECRET=your_solapi_secret
SENDER_PHONE=your_sender_phone

# Google Translate API
GOOGLE_TRANSLATE_API_KEY=your_translate_key

# OpenAI (선택사항)
OPENAI_API_KEY=your_openai_key
```

## 🏃‍♂️ 개발 서버 실행

### 1. 서버 시작 (터미널 1)
```bash
cd kgency_server
npm run dev
```

### 2. 모바일 앱 시작 (터미널 2)
```bash
cd kgency
npm start
```

### 3. 플랫폼별 실행
```bash
# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android

# 웹 브라우저
npm run web
```

## 📱 디바이스 테스트

### Expo Go 앱 사용
1. **App Store** 또는 **Google Play**에서 **Expo Go** 설치
2. `npm start` 실행 후 QR 코드 스캔
3. 앱이 디바이스에서 실행됨

### 개발 빌드 사용
```bash
# 개발 빌드 생성
eas build --platform ios --profile development
eas build --platform android --profile development

# 빌드 설치 후 앱 실행
```

## 🛠 유용한 명령어

### 개발 중
```bash
# 캐시 클리어
npm start -- --clear

# 타입 체크
npm run lint

# 의존성 설치 (새로운 패키지 추가 후)
npx expo install
```

### 빌드 & 배포
```bash
# 프로덕션 빌드
eas build --platform all --profile production

# 앱스토어 제출
eas submit --platform ios
eas submit --platform android
```

## 🔧 문제 해결

### 일반적인 문제들

#### Metro 번들러 오류
```bash
npx expo start --clear
```

#### iOS 시뮬레이터 문제
```bash
npx expo run:ios --device
```

#### Android 에뮬레이터 연결 문제
```bash
adb devices
adb reverse tcp:8081 tcp:8081
```

#### 패키지 버전 충돌
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### 환경별 설정

#### macOS (M1/M2)
```bash
# Rosetta 2 설치 (필요시)
softwareupdate --install-rosetta

# iOS 시뮬레이터
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

#### Windows
- **WSL2** 사용 권장
- **Android Studio** 설정 주의

#### Linux
- **Android Studio** 수동 설치
- **JDK 11** 설치 필요

## 📚 추가 자료

- [Expo 공식 문서](https://docs.expo.dev/)
- [React Native 가이드](https://reactnative.dev/docs/getting-started)
- [Supabase 문서](https://supabase.com/docs)
- [NativeWind 가이드](https://www.nativewind.dev/)