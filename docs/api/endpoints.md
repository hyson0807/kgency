# API 엔드포인트

## 🌐 Base URL

### Development
- **서버**: `http://192.168.0.15:5004`
- **Supabase**: `https://your-project.supabase.co`

### Production
- **서버**: `https://kgencyserver-production.up.railway.app`
- **Supabase**: `https://your-project.supabase.co`

## 🔐 인증

### 인증 방식
- **JWT Token**: Authorization 헤더에 Bearer 토큰 포함
- **OTP 인증**: SMS 기반 휴대폰 번호 인증

### 헤더 설정
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 📱 인증 API

### POST `/api/auth/send-otp`
휴대폰 번호로 OTP 발송

#### Request
```json
{
  "phoneNumber": "01012345678",
  "userType": "user" // "user" | "company"
}
```

#### Response
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### POST `/api/auth/verify-otp`
OTP 검증 및 JWT 토큰 발급

#### Request
```json
{
  "phoneNumber": "01012345678",
  "otp": "123456",
  "userType": "user"
}
```

#### Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "phone_number": "01012345678",
    "user_type": "user",
    "name": "홍길동"
  }
}
```

### POST `/api/auth/refresh`
토큰 갱신

#### Request
```json
{
  "token": "current_jwt_token"
}
```

#### Response
```json
{
  "success": true,
  "token": "new_jwt_token"
}
```

## 👤 프로필 API

### GET `/api/profile`
현재 사용자 프로필 조회

#### Response
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "name": "홍길동",
    "phone_number": "01012345678",
    "user_type": "user",
    "email": "user@example.com",
    "onboarding_completed": true,
    "job_seeking_active": true,
    "user_info": {
      "age": 25,
      "gender": "male",
      "visa": "F-4",
      "korean_level": "고급",
      "experience": "1-3년"
    }
  }
}
```

### PUT `/api/profile`
프로필 정보 업데이트

#### Request
```json
{
  "name": "홍길동",
  "email": "newemail@example.com",
  "user_info": {
    "age": 26,
    "gender": "male",
    "visa": "F-4",
    "korean_level": "고급"
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

## 📋 지원서 관리 API

### GET `/api/applications`
사용자의 지원서 목록 조회

#### Query Parameters
- `status`: 지원서 상태 필터 (`pending`, `accepted`, `rejected`)
- `page`: 페이지 번호 (기본: 1)
- `limit`: 페이지당 항목 수 (기본: 20)

#### Response
```json
{
  "success": true,
  "applications": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "company_id": "uuid",
      "job_posting_id": "uuid",
      "type": "user_initiated",
      "status": "pending",
      "applied_at": "2025-01-01T00:00:00Z",
      "job_posting": {
        "title": "프론트엔드 개발자",
        "company": {
          "name": "테크 컴퍼니"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### POST `/api/applications`
새 지원서 생성

#### Request
```json
{
  "job_posting_id": "uuid",
  "type": "user_initiated"
}
```

#### Response
```json
{
  "success": true,
  "application": {
    "id": "uuid",
    "status": "pending",
    "applied_at": "2025-01-01T00:00:00Z"
  }
}
```

### PATCH `/api/applications/:id/status`
지원서 상태 업데이트 (기업용)

#### Request
```json
{
  "status": "accepted", // "accepted" | "rejected"
  "message": "면접 일정을 조율하겠습니다."
}
```

#### Response
```json
{
  "success": true,
  "message": "Application status updated"
}
```

## 💼 채용공고 API

### GET `/api/jobpostings`
채용공고 목록 조회

#### Query Parameters
- `company_id`: 특정 회사의 공고만 조회
- `is_active`: 활성 공고만 조회 (true/false)
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수

#### Response
```json
{
  "success": true,
  "jobPostings": [
    {
      "id": "uuid",
      "title": "프론트엔드 개발자",
      "description": "React Native 개발자를 모집합니다.",
      "hiring_count": 2,
      "working_hours": "09:00-18:00",
      "salary_range": "3000-4000만원",
      "job_address": "서울시 강남구",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "company": {
        "name": "테크 컴퍼니",
        "address": "서울시 강남구"
      }
    }
  ]
}
```

### POST `/api/jobpostings`
새 채용공고 생성 (기업용)

#### Request
```json
{
  "title": "백엔드 개발자",
  "description": "Node.js 백엔드 개발자를 모집합니다.",
  "hiring_count": 1,
  "working_hours": "09:00-18:00",
  "working_hours_negotiable": true,
  "working_days": ["월", "화", "수", "목", "금"],
  "working_days_negotiable": false,
  "salary_range": "4000-5000만원",
  "salary_range_negotiable": true,
  "salary_type": "월급",
  "pay_day": "매월 25일",
  "job_address": "서울시 강남구",
  "keywords": ["nodejs", "javascript", "backend"]
}
```

#### Response
```json
{
  "success": true,
  "jobPosting": {
    "id": "uuid",
    "title": "백엔드 개발자",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### PUT `/api/jobpostings/:id`
채용공고 수정 (기업용)

#### Request
```json
{
  "title": "시니어 백엔드 개발자",
  "description": "경력 3년 이상의 Node.js 개발자를 모집합니다.",
  "salary_range": "5000-6000만원"
}
```

#### Response
```json
{
  "success": true,
  "message": "Job posting updated successfully"
}
```

### DELETE `/api/jobpostings/:id`
채용공고 삭제 (소프트 삭제)

#### Response
```json
{
  "success": true,
  "message": "Job posting deleted successfully"
}
```

## 📅 면접 관리 API

### GET `/api/interview/slots`
기업의 면접 가능 시간 조회

#### Query Parameters
- `date`: 특정 날짜 (YYYY-MM-DD)
- `available`: 예약 가능한 슬롯만 조회 (true/false)

#### Response
```json
{
  "success": true,
  "slots": [
    {
      "id": "uuid",
      "start_time": "2025-01-01T10:00:00Z",
      "end_time": "2025-01-01T11:00:00Z",
      "interview_type": "대면",
      "is_available": true
    }
  ]
}
```

### POST `/api/interview/slots`
면접 시간 슬롯 생성 (기업용)

#### Request
```json
{
  "start_time": "2025-01-01T10:00:00Z",
  "end_time": "2025-01-01T11:00:00Z",
  "interview_type": "대면"
}
```

#### Response
```json
{
  "success": true,
  "slot": {
    "id": "uuid",
    "start_time": "2025-01-01T10:00:00Z",
    "end_time": "2025-01-01T11:00:00Z"
  }
}
```

### POST `/api/interview/proposals`
면접 제안 생성 (기업용)

#### Request
```json
{
  "application_id": "uuid",
  "location": "서울시 강남구 회사 사무실",
  "message": "면접 일정을 조율하겠습니다."
}
```

#### Response
```json
{
  "success": true,
  "proposal": {
    "id": 1,
    "application_id": "uuid",
    "location": "서울시 강남구 회사 사무실",
    "status": "pending"
  }
}
```

### POST `/api/interview/schedules`
면접 일정 확정 (구직자용)

#### Request
```json
{
  "proposal_id": 1,
  "interview_slot_id": "uuid"
}
```

#### Response
```json
{
  "success": true,
  "schedule": {
    "id": 1,
    "proposal_id": 1,
    "interview_slot_id": "uuid",
    "status": "confirmed",
    "confirmed_at": "2025-01-01T00:00:00Z"
  }
}
```

## 🌐 번역 API

### POST `/api/translate`
텍스트 번역

#### Request
```json
{
  "text": "안녕하세요",
  "targetLanguage": "en"
}
```

#### Response
```json
{
  "success": true,
  "translatedText": "Hello",
  "sourceLanguage": "ko",
  "targetLanguage": "en"
}
```

### POST `/api/translate/batch`
여러 텍스트 일괄 번역

#### Request
```json
{
  "texts": ["안녕하세요", "감사합니다"],
  "targetLanguage": "en"
}
```

#### Response
```json
{
  "success": true,
  "translations": [
    {
      "original": "안녕하세요",
      "translated": "Hello"
    },
    {
      "original": "감사합니다",
      "translated": "Thank you"
    }
  ]
}
```

## 🤖 AI API (선택사항)

### POST `/api/ai/match-analysis`
매칭 분석 (OpenAI 기반)

#### Request
```json
{
  "user_profile": {
    "keywords": ["javascript", "react", "frontend"],
    "experience": "1-3년"
  },
  "job_posting": {
    "title": "프론트엔드 개발자",
    "keywords": ["react", "typescript", "frontend"]
  }
}
```

#### Response
```json
{
  "success": true,
  "analysis": {
    "compatibility_score": 85,
    "strengths": ["React 경험", "프론트엔드 전문성"],
    "improvements": ["TypeScript 학습 권장"],
    "recommendation": "높은 매칭도를 보입니다."
  }
}
```

## 📊 에러 코드

### 일반 에러
- `400` - Bad Request (잘못된 요청)
- `401` - Unauthorized (인증 필요)
- `403` - Forbidden (권한 없음)
- `404` - Not Found (리소스 없음)
- `429` - Too Many Requests (요청 제한 초과)
- `500` - Internal Server Error (서버 오류)

### 커스텀 에러 코드
```json
{
  "success": false,
  "error": {
    "code": "INVALID_OTP",
    "message": "잘못된 OTP입니다.",
    "details": "OTP가 만료되었거나 올바르지 않습니다."
  }
}
```

#### 인증 관련
- `INVALID_OTP` - 잘못된 OTP
- `EXPIRED_OTP` - 만료된 OTP
- `INVALID_TOKEN` - 잘못된 JWT 토큰
- `TOKEN_EXPIRED` - 만료된 JWT 토큰

#### 비즈니스 로직
- `APPLICATION_EXISTS` - 이미 지원한 공고
- `JOB_POSTING_INACTIVE` - 비활성화된 공고
- `INTERVIEW_SLOT_TAKEN` - 이미 예약된 면접 시간
- `PROFILE_INCOMPLETE` - 불완전한 프로필

## 🔄 Rate Limiting

### 제한 사항
- **일반 API**: 분당 100회
- **인증 API**: 분당 10회
- **번역 API**: 분당 50회

### 헤더 정보
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📝 요청/응답 예시

### 성공적인 응답
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Required field missing",
    "details": {
      "field": "phoneNumber",
      "reason": "Phone number is required"
    }
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```