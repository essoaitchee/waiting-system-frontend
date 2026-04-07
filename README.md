# Waiting System Frontend

Spring Boot REST API 기반 대기열 시스템을 시연하기 위한 프론트엔드 프로젝트입니다.

React, Vite, TypeScript, Tailwind CSS, axios, React Router로 구성되어 있고 아래 기능을 바로 테스트할 수 있습니다.

- 홈 대시보드
- 대기열 입장
- 대기열 상태 조회와 3초 폴링
- admission token 소비
- 상품 목록 조회
- 쿠폰 발급 테스트

## 실행 방법

```bash
npm install
npm run dev
```

빌드 확인:

```bash
npm run build
```

개발 서버 기본 주소:

- Frontend: `http://localhost:5173`
- Backend example: `http://localhost:8081`

## 환경변수

`.env.example`

```bash
VITE_API_BASE_URL=http://localhost:8081
```

`.env` 파일로 복사해서 백엔드 주소를 맞춰 주세요.

## 주요 페이지

### 1. 홈 페이지

- 서비스 소개
- 대기열 입장하기 버튼
- 상품 보기 버튼
- 쿠폰 발급 테스트 버튼

### 2. 대기열 입장 페이지

- `eventId`, `userId` 입력
- `POST /api/v1/queue/enter` 호출
- 응답 요약 표시
- 성공 후 상태 조회 페이지로 자동 이동

### 3. 대기열 상태 조회 페이지

- `GET /api/v1/queue/status` 호출
- 현재 순번, 상태, admission token 표시
- 3초 간격 폴링
- 폴링 시작/중지 버튼 제공
- admission token 소비 액션 제공

### 4. 상품 목록 페이지

- `GET /api/v1/products` 호출
- 카드 리스트 UI
- 로딩, 빈 목록, 에러 상태 처리
- 카테고리와 페이지 파라미터 테스트 가능

### 5. 쿠폰 발급 테스트 페이지

- `couponId`, `userId` 입력
- `POST /api/v1/coupons/issue` 호출
- 성공, 중복, 품절, 오류 메시지 구분 표시

## 폴더 구조

```text
src/
  api/
    client.ts
    queue.ts
    products.ts
    coupons.ts
    mappers/
  components/
    common/
    product/
    queue/
    ui/
  hooks/
    usePolling.ts
  layouts/
    AppLayout.tsx
  pages/
    HomePage.tsx
    QueueEnterPage.tsx
    QueueStatusPage.tsx
    ProductsPage.tsx
    CouponIssuePage.tsx
  router/
    index.tsx
  types/
    api.ts
    queue.ts
    product.ts
    coupon.ts
    mockExamples.ts
  utils/
    cn.ts
    constants.ts
    error.ts
    format.ts
    storage.ts
  App.tsx
  index.css
  main.tsx
```

## 먼저 수정하면 좋은 파일

- API base URL 변경: `src/utils/constants.ts`
- 대기열 응답 매핑: `src/api/mappers/queueMappers.ts`
- 상품 응답 매핑: `src/api/mappers/productMappers.ts`
- 쿠폰 응답 매핑: `src/api/mappers/couponMappers.ts`
- 공통 에러 메시지 처리: `src/utils/error.ts`
- 폴링 간격 변경: `src/utils/constants.ts`

## 백엔드 DTO와 안 맞을 때 어디를 수정하나

페이지 컴포넌트는 가능한 한 정규화된 타입만 사용하도록 만들었습니다.

즉, 백엔드 응답 필드명이 다를 경우 페이지를 수정하지 말고 아래 mapper 파일만 수정하면 됩니다.

- 대기열 입장/상태/토큰 소비: `src/api/mappers/queueMappers.ts`
- 상품 목록: `src/api/mappers/productMappers.ts`
- 쿠폰 발급: `src/api/mappers/couponMappers.ts`

후보 키 배열 예시:

```ts
pickString(source, ['status', 'queueStatus', 'state'])
```

여기서 실제 DTO 필드명에 맞게 키를 추가하거나 교체하면 됩니다.

## 참고 DTO 예시

프론트에서 가정한 예시 타입은 아래 파일에 정리되어 있습니다.

- `src/types/mockExamples.ts`

## 추후 개선 포인트

- React Query 같은 서버 상태 라이브러리 도입
- 운영자용 `admit` 화면 별도 추가
- 인증/인가 및 사용자 세션 연동
- SSE 또는 WebSocket 기반 실시간 상태 반영
