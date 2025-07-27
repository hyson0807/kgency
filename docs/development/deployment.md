# 배포 가이드

## 🚀 배포 환경 개요

### 환경 구성

| 환경 | 모바일 앱 | 서버 | 데이터베이스 |
|------|-----------|------|---------------|
| **Development** | Expo Go/Dev Build | Local/Railway | Supabase Cloud |
| **Staging** | TestFlight/Internal Testing | Railway | Supabase Cloud |
| **Production** | App Store/Google Play | Railway | Supabase Cloud |

## 📱 모바일 앱 배포

### EAS (Expo Application Services) 설정

#### 1. EAS CLI 설치 및 로그인
```bash
npm install -g eas-cli
eas login
```

#### 2. 프로젝트 설정
```bash
eas build:configure
```

#### 3. 빌드 프로필 설정 (`eas.json`)
```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "default"
      },
      "android": {
        "resourceClass": "default"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "default"
      },
      "android": {
        "resourceClass": "default"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "default"
      },
      "android": {
        "resourceClass": "default"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 개발 빌드 (Development Build)

#### iOS 개발 빌드
```bash
eas build --platform ios --profile development
```

#### Android 개발 빌드
```bash
eas build --platform android --profile development
```

#### 빌드 설치
```bash
# iOS (시뮬레이터)
eas build --platform ios --profile development --local

# Android (에뮬레이터/디바이스)
eas build --platform android --profile development --local
```

### 프로덕션 빌드

#### 전체 플랫폼 빌드
```bash
eas build --platform all --profile production
```

#### 개별 플랫폼 빌드
```bash
# iOS만
eas build --platform ios --profile production

# Android만
eas build --platform android --profile production
```

### 앱스토어 제출

#### iOS App Store
```bash
eas submit --platform ios
```

#### Google Play Store
```bash
eas submit --platform android
```

### 자동화된 배포 워크플로우

#### GitHub Actions 설정 (`.github/workflows/eas-build.yml`)
```yaml
name: EAS Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    name: Build and Submit
    runs-on: ubuntu-latest
    steps:
      - name: Check for EXPO_TOKEN
        run: |
          if [ -z "${{ secrets.EXPO_TOKEN }}" ]; then
            echo "You must provide an EXPO_TOKEN secret linked to this project's Expo account in this repo's secrets. Learn more: https://docs.expo.dev/eas-update/github-actions"
            exit 1
          fi

      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
          cache: npm

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build on EAS
        run: eas build --platform all --non-interactive
```

## 🖥 서버 배포 (Railway)

### Railway 설정

#### 1. Railway CLI 설치
```bash
npm install -g @railway/cli
```

#### 2. 프로젝트 연결
```bash
railway login
railway link
```

#### 3. 환경 변수 설정
```bash
# Railway 대시보드에서 설정하거나 CLI 사용
railway variables set KEY_1=your_supabase_key_1
railway variables set KEY_2=your_supabase_key_2
railway variables set JWT_SECRET=your_jwt_secret
railway variables set SOLAPI_API_KEY=your_solapi_key
railway variables set SOLAPI_API_SECRET=your_solapi_secret
railway variables set SENDER_PHONE=your_sender_phone
railway variables set GOOGLE_TRANSLATE_API_KEY=your_translate_key
```

### 배포 명령어

#### 수동 배포
```bash
cd kgency_server
railway up
```

#### 자동 배포 (Git 연동)
Railway는 GitHub 저장소와 연결하면 자동으로 배포됩니다.

### Railway 설정 파일 (`railway.toml`)
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
restartPolicyType = "always"

[environments.production]
variables = { NODE_ENV = "production" }
```

### 도메인 설정
```bash
# 커스텀 도메인 추가
railway domain add yourdomain.com
```

## 🗄 데이터베이스 관리 (Supabase)

### 환경별 데이터베이스

#### Production Database
- **URL**: `https://your-project.supabase.co`
- **용도**: 실제 서비스 데이터
- **백업**: 자동 백업 설정

#### Development Database
- **URL**: 동일 (Row Level Security로 격리)
- **용도**: 개발 및 테스트
- **백업**: 필요시 수동 백업

### 마이그레이션 관리

#### Supabase CLI 설치
```bash
npm install -g supabase
```

#### 로컬 개발 환경
```bash
supabase init
supabase start
```

#### 마이그레이션 생성
```bash
supabase migration new migration_name
```

#### 마이그레이션 적용
```bash
supabase db push
```

### 데이터베이스 백업

#### 자동 백업 설정
- Supabase 대시보드에서 자동 백업 설정
- 일일/주간 백업 스케줄

#### 수동 백업
```bash
# PostgreSQL 덤프
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

## 🔧 환경 변수 관리

### 환경별 변수 설정

#### Development
```bash
# 모바일 앱 (.env)
EXPO_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dev_anon_key

# 서버 (.env)
NODE_ENV=development
KEY_1=dev_supabase_key_1
KEY_2=dev_supabase_key_2
JWT_SECRET=dev_jwt_secret
```

#### Production
```bash
# 모바일 앱 (Expo 환경변수)
EXPO_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=prod_anon_key

# 서버 (Railway 환경변수)
NODE_ENV=production
KEY_1=prod_supabase_key_1
KEY_2=prod_supabase_key_2
JWT_SECRET=prod_jwt_secret
```

### 보안 고려사항

#### 민감한 정보 관리
- **절대 커밋하지 말 것**: API 키, 시크릿
- **환경 변수 사용**: 모든 민감한 설정
- **암호화**: 프로덕션 시크릿 암호화

#### .gitignore 설정
```gitignore
# 환경 변수
.env
.env.local
.env.development
.env.production

# Expo
.expo/
dist/

# Node
node_modules/

# 로그
*.log
npm-debug.log*
```

## 📊 모니터링 및 로깅

### 서버 모니터링 (Railway)

#### 기본 메트릭
- **CPU 사용률**
- **메모리 사용률**
- **네트워크 I/O**
- **응답 시간**

#### 로그 확인
```bash
railway logs
```

### 모바일 앱 모니터링

#### Expo 분석
- **크래시 리포트**
- **성능 메트릭**
- **사용자 분석**

#### 사용자 피드백
- **앱스토어 리뷰**
- **크래시 리포트**
- **성능 이슈**

### 에러 추적

#### 서버 에러 로깅
```javascript
// 에러 미들웨어
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // 프로덕션에서는 상세한 에러 숨김
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal Server Error' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});
```

## 🚨 장애 대응

### 일반적인 문제들

#### 1. 빌드 실패
```bash
# 캐시 클리어 후 재빌드
npm run clean
npm install
eas build --platform all --clear-cache
```

#### 2. 서버 배포 실패
```bash
# 로그 확인
railway logs

# 환경 변수 확인
railway variables

# 수동 재배포
railway up --detach
```

#### 3. 데이터베이스 연결 문제
```bash
# 연결 상태 확인
supabase status

# 재시작
supabase restart
```

### 롤백 절차

#### 모바일 앱 롤백
1. **이전 빌드로 되돌리기**
   ```bash
   eas build:list
   eas submit --id=previous_build_id
   ```

#### 서버 롤백
1. **Railway에서 이전 배포로 롤백**
   ```bash
   railway rollback
   ```

#### 데이터베이스 롤백
1. **백업에서 복원**
   ```bash
   psql -h db.project.supabase.co -U postgres -d postgres < backup.sql
   ```

## 📋 배포 체크리스트

### 배포 전 확인사항

#### 모바일 앱
- [ ] 모든 테스트 통과
- [ ] 빌드 에러 없음
- [ ] 환경 변수 설정 확인
- [ ] 앱 아이콘/스플래시 스크린 업데이트
- [ ] 버전 번호 증가

#### 서버
- [ ] 모든 테스트 통과
- [ ] 환경 변수 설정 확인
- [ ] 의존성 보안 업데이트
- [ ] API 문서 업데이트

#### 데이터베이스
- [ ] 마이그레이션 테스트
- [ ] 백업 생성
- [ ] RLS 정책 확인

### 배포 후 확인사항

#### 즉시 확인
- [ ] 앱 정상 실행
- [ ] 로그인 기능 동작
- [ ] 주요 기능 테스트
- [ ] API 응답 확인

#### 24시간 내 확인
- [ ] 에러 로그 모니터링
- [ ] 성능 메트릭 확인
- [ ] 사용자 피드백 확인
- [ ] 앱스토어 승인 상태