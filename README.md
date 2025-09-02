# kgency

스마트한 구인구직 매칭 플랫폼

## 📱 프로젝트 개요

kgency는 React Native Expo 기반의 모바일 애플리케이션으로, AI 기반 매칭 알고리즘을 통해 구직자와 기업을 연결하는 플랫폼입니다.

### 🎯 주요 기능

- **AI 매칭 시스템**: 키워드 기반 적합도 계산 (0-100점)
- **이중 역할 시스템**: 구직자/기업 분리된 인터페이스
- **면접 일정 관리**: 캘린더 기반 면접 스케줄링
- **실시간 채팅**: WebSocket(Socket.io) 기반 즉시 메시징 ⚡
- **다국어 지원**: 12개 언어 지원

### 🛠 기술 스택

**Frontend (Mobile)**
- React Native with Expo SDK 53
- TypeScript
- NativeWind (Tailwind CSS)
- Expo Router
- Socket.io Client (실시간 채팅)

**Backend**
- Node.js + Express
- Socket.io (WebSocket 서버)
- PostgreSQL (Supabase)
- JWT Authentication
- Google Translate API
- OpenAI API

## 🚀 빠른 시작

### 모바일 앱
```bash
npm install
npm start
```

### 서버
```bash
cd ../kgency_server
npm install
npm run dev
```

## 📚 문서 구조

- [`docs/development/`](./docs/development/) - 개발 환경 설정 및 가이드
- [`docs/api/`](./docs/api/) - API 문서 및 엔드포인트
- [`docs/features/`](./docs/features/) - 주요 기능 명세
- [`docs/support/`](./docs/support/) - 사용자 지원 문서

## 🏗 아키텍처

```
kgency/
├── app/                 # React Native 앱
│   ├── (auth)/         # 인증 화면
│   ├── (user)/         # 구직자 인터페이스
│   ├── (company)/      # 기업 인터페이스
│   └── (pages)/        # 공통 페이지
├── lib/                # 핵심 라이브러리
├── hooks/              # 커스텀 훅
└── contexts/           # Context API

kgency_server/
├── src/
│   ├── controllers/    # 요청 처리
│   ├── services/       # 비즈니스 로직
│   ├── routes/         # API 라우트
│   └── middlewares/    # 미들웨어
```

## 🔑 환경 변수

### 모바일 앱
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 서버
```bash
KEY_1=supabase_key_1
KEY_2=supabase_key_2
JWT_SECRET=your_jwt_secret
SOLAPI_API_KEY=your_solapi_key
GOOGLE_TRANSLATE_API_KEY=your_translate_key
```

## 🤝 기여하기

1. 프로젝트 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📞 문의

- **이메일**: simsgood0807@gmail.com
- **업무시간**: 평일 오전 9시 - 오후 6시

## 📄 라이센스

Welkit
