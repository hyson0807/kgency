# kgency

스마트한 구인구직 매칭 플랫폼

## 📱 프로젝트 개요

kgency는 React Native Expo 기반의 모바일 애플리케이션으로, 구직자와 기업을 연결하는 정교한 매칭 플랫폼입니다. 이중 역할 시스템으로 구직자와 기업 모두를 위한 전용 인터페이스를 제공하며, 정교한 키워드 기반 매칭 알고리즘과 면접 스케줄링 기능을 특징으로 합니다.

### 🎯 주요 기능

- **정교한 매칭 시스템**: 5단계 적합도 계산 (perfect/excellent/good/fair/low)
- **이중 역할 시스템**: 구직자/기업 완전 분리된 인터페이스 
- **하이브리드 데이터 아키텍처**: Server API + 직접 Supabase 접근
- **면접 일정 관리**: 캘린더 기반 면접 슬롯 및 스케줄링
- **실시간 메시징**: 구직자-기업 간 실시간 소통
- **다국어 지원**: 12개 언어 번역 시스템 (en, ja, zh, vi, hi, si, ar, tr, my, ky, ha, mn)
- **OTP 인증 시스템**: 휴대폰 번호 기반 Solapi SMS 인증

### 🛠 기술 스택

**Frontend (Mobile)**
- React Native with Expo SDK 53
- TypeScript with strict mode
- NativeWind (Tailwind CSS for React Native)
- Expo Router (file-based routing)
- Hybrid State Management (Context API + Zustand)

**Backend**
- Node.js + Express 5.x
- PostgreSQL (Supabase)
- JWT Authentication with 7-day expiry
- Solapi SMS API (OTP)
- Google Translate API
- OpenAI API integration

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
npm run dev          # 개발 서버 (nodemon)
npm start           # 프로덕션 서버
```

### 추가 개발 명령어
```bash
# 모바일 앱
npm run ios         # iOS 시뮬레이터
npm run android     # Android 에뮬레이터  
npm run web         # 웹 버전
npm run lint        # ESLint 코드 품질 검사

# EAS 빌드 (Expo Application Services)
eas build --platform ios --profile development
eas build --platform android --profile development
eas build --platform all --profile production
```

## 📚 문서 구조

- [`/development`](./development/) - 개발 환경 설정 및 가이드
- [`/api`](./api/) - API 문서 및 엔드포인트
- [`/features`](./features/) - 주요 기능 명세
- [`/support`](./support/) - 사용자 지원 문서

## 🏗 아키텍처

### 하이브리드 데이터 아키텍처
이 프로젝트는 **Server API**와 **직접 Supabase 접근**을 혼합한 독특한 아키텍처를 사용합니다:

- **Server API**: 인증 (OTP), 일부 프로필 작업, 계정 관리
- **Direct Supabase**: 프로필, 키워드, 지원서, 메시징, 채용공고, 면접 데이터

### 파일 구조
```
kgency/
├── app/                        # Expo Router 기반 파일 라우팅
│   ├── (auth)/                # 인증 화면 (start, login)
│   ├── (user)/                # 구직자 탭 인터페이스
│   ├── (company)/             # 기업 탭 인터페이스  
│   ├── (pages)/               # 기능별 페이지
│   │   ├── (user)/           # 구직자 전용 플로우
│   │   └── (company)/        # 기업 전용 플로우
│   └── _layout.tsx           # Context Provider 설정
├── lib/
│   ├── suitability/          # 5단계 매칭 알고리즘 
│   ├── api.ts               # Server API 설정
│   └── supabase.ts          # Direct DB 클라이언트
├── stores/                   # Zustand 상태 관리
│   ├── jobPostingStore.ts   # 채용공고 폼 상태
│   └── applicationFormStore.ts # 지원서 폼 상태
├── contexts/                # React Context API
│   ├── AuthContext.tsx      # 인증 + API 클라이언트
│   └── TranslationContext.tsx # 12개 언어 지원
└── hooks/                   # 데이터 관리 훅
    ├── useProfile.ts        # 프로필 CRUD
    ├── useUserKeywords.ts   # 키워드 관리
    └── useApplications.ts   # 지원서 추적

kgency_server/              # Node.js Express 서버
├── src/
│   ├── controllers/        # MVC 컨트롤러
│   ├── services/          # 비즈니스 로직 (JWT, SMS, 번역)
│   ├── routes/            # API 엔드포인트
│   └── middlewares/       # 인증, 검증, 속도제한
└── server.js              # 환경 검증 + 앱 시작
```

### 상태 관리 전략
- **Context API**: 전역 상태 (인증, 다국어)
- **Zustand**: 복잡한 폼 상태 (채용공고, 지원서)
- **Custom Hooks**: 데이터 페칭 및 캐싱

## 🗄 데이터베이스 스키마

### 핵심 테이블
- **profiles** - 사용자/기업 프로필 (user_type: 'user'|'company')  
- **user_info** - 구직자 상세 정보 (나이, 경력, 비자상태 등)
- **keyword** - 마스터 키워드 사전 (11개 카테고리)
- **user_keyword/company_keyword** - 키워드 연결 테이블
- **job_postings** - 채용공고 (제목, 설명, 급여, 근무조건)
- **applications** - 지원서 (상태별 추적, 스냅샷 저장)
- **messages** - 실시간 메시징 시스템
- **interview_slots/proposals/schedules** - 면접 스케줄링 시스템
- **translations** - 12개 언어 번역 데이터

### 주요 데이터 패턴
- **UUID 기반 ID**: 대부분 테이블에서 사용
- **JSONB 스냅샷**: 지원 시점 데이터 보존
- **Soft Delete**: deleted_at으로 논리 삭제
- **RLS (Row Level Security)**: 사용자별 데이터 접근 제어
- **실시간 구독**: Supabase Realtime으로 라이브 업데이트

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

이 프로젝트는 개인 프로젝트입니다.