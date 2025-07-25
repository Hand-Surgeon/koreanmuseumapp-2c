# 배포 가이드

## 개요

Korean Museum App은 Vercel을 통해 자동으로 배포됩니다. 이 문서는 배포 프로세스와 관련 설정을 설명합니다.

## 사전 요구사항

- Node.js 20.x 이상
- npm 또는 yarn
- Vercel 계정
- GitHub 계정

## 환경 변수

배포 전 다음 환경 변수를 Vercel 대시보드에서 설정해야 합니다:

```env
# 필수
NEXT_PUBLIC_APP_URL=https://museum100.kr

# 분석 도구 (선택)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# 에러 추적 (선택)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# 이미지 CDN (선택)
NEXT_PUBLIC_IMAGE_CDN=https://cdn.museum100.kr
```

## 로컬 빌드 테스트

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 환경 변수 입력

# 빌드
npm run build

# 프로덕션 모드로 실행
npm start
```

## Vercel 배포

### 1. 초기 설정

1. [Vercel](https://vercel.com)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 연결
4. 프로젝트 설정:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next

### 2. 환경 변수 설정

1. Vercel 대시보드에서 프로젝트 선택
2. Settings → Environment Variables
3. 필요한 환경 변수 추가

### 3. 도메인 설정

1. Settings → Domains
2. 커스텀 도메인 추가 (예: museum100.kr)
3. DNS 설정:
   ```
   A Record: @ → 76.76.21.21
   CNAME: www → cname.vercel-dns.com
   ```

### 4. 자동 배포

- `main` 브랜치에 push하면 자동으로 프로덕션 배포
- Pull Request를 생성하면 프리뷰 배포 생성

## 배포 전 체크리스트

```bash
# 배포 전 체크 스크립트 실행
node scripts/pre-deploy-check.js

# 테스트 실행
npm test

# 린트 체크
npm run lint

# TypeScript 타입 체크
npx tsc --noEmit
```

## 성능 최적화

### 1. 이미지 최적화
- Next.js Image 컴포넌트 사용
- WebP/AVIF 포맷 자동 변환
- 적절한 sizes 속성 설정

### 2. 코드 분할
- 동적 import 사용
- 페이지별 번들 분리
- 사용하지 않는 코드 제거

### 3. 캐싱 전략
- 정적 자산: 1년 캐시
- API 응답: 적절한 캐시 헤더 설정
- Service Worker를 통한 오프라인 지원

## 모니터링

### 1. Google Analytics
- 페이지뷰 추적
- 사용자 행동 분석
- 성능 지표 모니터링

### 2. Sentry
- 에러 추적
- 성능 모니터링
- 사용자 피드백 수집

### 3. Vercel Analytics
- 실시간 트래픽 모니터링
- Core Web Vitals 추적
- 지역별 성능 분석

## 롤백 절차

문제 발생 시:

1. Vercel 대시보드 → Deployments
2. 이전 안정적인 배포 선택
3. "Promote to Production" 클릭

또는 Git을 통한 롤백:
```bash
git revert HEAD
git push origin main
```

## 문제 해결

### 빌드 실패
- 로그 확인: Vercel 대시보드 → Functions → Logs
- 일반적인 원인:
  - 환경 변수 누락
  - TypeScript 에러
  - 의존성 문제

### 성능 문제
- Lighthouse 점수 확인
- 번들 크기 분석: `npx next-bundle-analyzer`
- 이미지 최적화 확인

### 배포 후 404 에러
- `vercel.json`의 rewrites 규칙 확인
- 동적 라우트 설정 확인
- 빌드 시 생성된 페이지 확인

## 지원

문제가 지속되면:
- GitHub Issues에 문제 제출
- Vercel Support 문의
- 개발팀에 연락