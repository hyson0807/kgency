# 실시간 배지 시스템 개선 가이드

## 📋 문서 개요
kgency 앱의 실시간 배지 업데이트 성능을 **WhatsApp/Instagram 수준**으로 개선하기 위한 핵심 기술 문서입니다.

## 🎯 개선 목표
- **현재**: 새 메시지 도착 후 1-3초 지연으로 배지 업데이트
- **목표**: 0.3초 이내 즉시 배지 업데이트 (80% 성능 개선)

## 📚 문서 구성

### [1. Redis 캐시 시스템](./redis-cache-implementation.md)
**우선순위: ⭐⭐⭐ (필수)**
- DB 쿼리 → Redis 캐시로 전환
- **효과**: 3초 → 0.3초 (80% 개선)
- **구현 시간**: 2-3일

### [2. 이벤트 기반 병렬 처리](./event-driven-architecture.md)  
**우선순위: ⭐⭐⭐ (필수)**
- 순차 처리 → 병렬 처리로 전환
- **효과**: 즉시 배지 업데이트 보장
- **구현 시간**: 1-2일

### [3. 디바운싱 최적화](./debouncing-optimization.md)
**우선순위: ⭐⭐ (효과적)**
- 연속 메시지 시 배치 처리
- **효과**: 서버 부하 70% 감소  
- **구현 시간**: 1일

## 🚀 구현 순서 권장사항

### Phase 1: Redis 캐시 도입 (즉시 효과)
1. `kgency_server`에 Redis 설치 및 설정
2. `UnreadCountManager` 클래스 구현
3. 기존 `sendTotalUnreadCount` 메서드 교체
4. **결과**: 80% 성능 개선 즉시 체감

### Phase 2: 이벤트 기반 처리 (안정성 확보)
1. `EventBus` 및 `BadgeEventHandler` 구현
2. `ChatSocket` 클래스 병렬 처리로 수정
3. **결과**: 네트워크 지연 상황에서도 안정적 배지 업데이트

### Phase 3: 디바운싱 적용 (최적화)
1. `BadgeDebouncer` 클래스 구현
2. 연속 메시지 상황에서 배치 처리 적용
3. **결과**: 서버 리소스 효율성 대폭 개선

## 💡 핵심 아키텍처 변화

### 기존 구조
```
새 메시지 → DB 쿼리 → 총 카운트 계산 → 배지 전송 (1-3초)
```

### 개선된 구조  
```
새 메시지 → Redis 즉시 업데이트 → 이벤트 발생 → 배지 전송 (0.1-0.3초)
                ↓
           디바운싱으로 배치 최적화
```

## 🔧 필수 환경 설정

### 서버 환경 변수
```bash
# kgency_server/.env.local (실제 환경변수)
REDIS_PASSWORD=your_actual_redis_password
REDIS_URL=redis://default:your_password@your_host:port

# kgency_server/.env (템플릿 - Git에 커밋됨)  
REDIS_PASSWORD=your_redis_password_here
REDIS_URL=redis://default:your_redis_password@your_redis_host:port
```

### 의존성 설치
```bash
cd ../kgency_server
npm install redis
```

### Railway 배포 시 Redis 설정
1. Railway 대시보드에서 Redis 애드온 추가
2. 환경변수 자동 설정됨 (`REDIS_PASSWORD`, `REDIS_URL`)
3. 추가 설정 불필요

## 📊 예상 성능 개선 효과

| 지표 | 현재 | 개선 후 | 개선율 |
|-----|------|--------|--------|
| **배지 업데이트 속도** | 1-3초 | 0.1-0.3초 | **80%** |
| **서버 DB 부하** | 100% | 30% | **70%** |
| **네트워크 트래픽** | 100% | 40% | **60%** |
| **사용자 체감 반응성** | 보통 | 매우 빠름 | **대폭 개선** |

## 🎉 최종 달성 목표
- **WhatsApp 수준 실시간성**: 즉시 배지 업데이트
- **Instagram 수준 안정성**: 99.9% 배지 동기화  
- **업계 표준 성능**: 0.1초 이내 응답 시간
- **서버 효율성**: 70% 리소스 절약

---

**💬 문의사항이나 구현 중 이슈가 있다면 각 문서의 "주의사항" 섹션을 참고하거나 개발팀에 문의해주세요.**