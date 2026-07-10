# Korean Museum 100

국립중앙박물관의 대표 유물 100점을 5개 언어로 탐색하는 Next.js 애플리케이션입니다.

## 현재 기능

- 한국어(`ko`), 영어(`en`), 중국어(`zh`), 일본어(`ja`), 태국어(`th`) URL 라우팅
- 전시관·카테고리·검색어 기반 유물 탐색
- 유물 상세, 이미지 갤러리, 공유, 로컬 즐겨찾기
- 유물별 출처·메타데이터 이용조건·이미지 크레딧 표시
- 정적 메타데이터, 사이트맵, Open Graph 이미지
- PWA 매니페스트와 최소 오프라인 폴백

## URL 구조

```text
/{locale}                         홈
/{locale}/hall/{hallName}         전시관
/{locale}/artifact/{id}           유물 상세
/{locale}/favorites               즐겨찾기
```

locale이 없는 사용자 경로는 middleware가 언어 설정을 참고해 지원 locale로 리디렉션합니다. `/admin`, `/api`, `/_next`, 정적 자산은 locale middleware 대상이 아닙니다.

## 개발

필요 환경은 Node.js 20 이상과 npm입니다.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

품질 검증:

```bash
npm run type-check
npm test -- --runInBand
npm run build
```

`npm run pre-deploy`는 위 세 검증을 순서대로 실행합니다.
이 과정에는 eMuseum 스냅샷·이미지 해시·권리 manifest 검증도 포함됩니다.

보안 기준 버전은 `next@15.5.20`, `react@19.1.8`, `react-dom@19.1.8`, `postcss@8.5.16`으로 고정되어 있습니다. lockfile을 함께 갱신하고 `npm audit`과 전체 빌드를 통과한 조합입니다.

## 환경 변수

`.env.example`에서 지원하는 항목을 확인할 수 있습니다.

- `NEXT_PUBLIC_APP_URL`: canonical URL과 공유 URL의 기준
- `MUSEUM_DATA_VERIFIED`: 100건 스냅샷·이미지·권리 검증 후에만 `true`; 환경변수와 snapshot gate가 모두 통과해야 색인 허용
- `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GTM_ID`: 선택 분석 설정
- `MUSEUM_API_URL`: 로컬 eMuseum 동기화 도구 전용 endpoint
- `MUSEUM_API_ALLOW_INSECURE_HTTP`: legacy HTTP endpoint 사용을 명시적으로 허용하는 로컬 동기화 전용 flag
- `MUSEUM_API_KEY`: 로컬 eMuseum 동기화 도구 전용 secret

API key에는 절대 `NEXT_PUBLIC_` 접두사를 붙이지 마세요. `.env.local`은 커밋하지 않으며 일반 `next build`와 배포 런타임에는 API key를 전달하지 않습니다.

## 데이터 계층

현재 화면은 `lib/server/artifact-repository.ts`를 통해 로컬 카탈로그만 읽습니다. 완전한 검증 snapshot이 없으면 `data/artifacts.ts`를 사용하고, 검증된 100건 snapshot이 있으면 `data/generated/emuseum-artifacts.json`을 사용합니다. 사용자 요청, 정적 페이지 생성, sitemap, 즐겨찾기 API는 eMuseum을 직접 호출하지 않습니다.

공식 API 연동은 다음과 같이 분리되어 있습니다.

```text
eMuseum → 후보 검색 → 공식 ID 수동 확인 → 권리 검토 → 이미지 로컬 저장
        → 검증 snapshot → artifact repository → 화면
```

상세 실행 절차는 [EMUSEUM_SYNC.md](./EMUSEUM_SYNC.md), 현재 데이터 상태는 [DATA_QUALITY.md](./DATA_QUALITY.md)를 참고하세요.

## 관리자 기능

관리자 라우트는 하드코딩 계정과 `localStorage` 세션을 제거한 상태입니다. 실제 서버 인증, 권한 검사, CSRF 보호, 영속 저장소가 구축되기 전까지 `/admin`은 404로 비활성화됩니다.

## 배포 전 필수 조치

- ESLint flat config와 해당 패키지를 추가해 정적 분석 게이트 복구
- 현재 인증키를 운영 사용 전에 교체하고 공식 ID·출처·이미지 권리를 100건 모두 검토
- `npm run verify:emuseum` 통과 후에만 `MUSEUM_DATA_VERIFIED=true`로 색인 게이트 해제

자세한 배포 절차는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.
