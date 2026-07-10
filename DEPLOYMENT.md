# 배포 가이드

이 프로젝트는 Next.js App Router 애플리케이션이며 `vercel.json`과 GitHub Actions 워크플로를 포함합니다. 실제 배포 연결 상태는 호스팅 계정에서 별도로 확인해야 합니다.

## 1. 사전 조건

- Node.js 20 이상
- lockfile을 지원하는 npm
- 배포 프로젝트와 연결된 Git 저장소

## 2. 환경 변수

배포 환경의 secret store에서 설정합니다.

| 변수 | 필수 여부 | 설명 |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | 권장 | `https://` 기반 운영 도메인 |
| `MUSEUM_DATA_VERIFIED` | 필수 | 검증 완료 전 `false`; 완료 후만 `true` |
| `NEXT_PUBLIC_GA_ID` | 선택 | Google Analytics ID |
| `NEXT_PUBLIC_GTM_ID` | 선택 | Google Tag Manager ID |
| `MUSEUM_API_URL` | 배포하지 않음 | 로컬/별도 동기화 작업 전용 endpoint |
| `MUSEUM_API_ALLOW_INSECURE_HTTP` | 배포하지 않음 | legacy HTTP 위험을 승인한 로컬 동기화에서만 사용하는 flag |
| `MUSEUM_API_KEY` | 배포하지 않음 | 로컬/별도 동기화 작업 전용 secret |

`MUSEUM_API_KEY`를 클라이언트 코드, 로그, Git 이력, 일반 CI, `next build`, 배포 런타임, `NEXT_PUBLIC_*` 변수에 노출하지 마세요. 애플리케이션은 검증된 로컬 snapshot만 읽으므로 세 API 변수가 없어야 정상적으로 빌드됩니다.

`MUSEUM_DATA_VERIFIED=true`만으로는 색인이 열리지 않습니다. `data/generated/emuseum-artifacts.json`의 100건과 이미지·권리가 모두 검증되어야 메타데이터, JSON-LD, sitemap, `robots.txt`가 활성화됩니다. 현재는 운영 환경에서도 `false`를 유지하세요.

## 3. 로컬 릴리스 검증

```bash
npm ci
cp .env.example .env.local
npm run pre-deploy
```

`pre-deploy`는 다음을 순서대로 실행합니다.

1. `npm run verify:emuseum`
2. `npm run type-check`
3. `npm test -- --runInBand`
4. `npm run build`

빌드 후 산출물을 확인하려면:

```bash
npm start
```

최소 smoke test 경로:

```text
/ko
/en
/ko/hall/고고관
/en/artifact/1
/manifest.json
/sw.js
```

## 4. Vercel 설정

1. Git 저장소를 Vercel 프로젝트와 연결합니다.
2. Framework Preset은 Next.js, 루트 디렉터리는 저장소 루트로 설정합니다.
3. Install Command는 `npm ci`, Build Command는 `npm run build`를 사용합니다.
4. Preview·Production 환경 변수를 각각 등록합니다.
5. 운영 도메인을 연결한 후 `NEXT_PUBLIC_APP_URL`을 같은 URL로 맞춥니다.

`.vercelignore`는 현재 데이터에서 참조하지 않는 동일 이미지 복사본(`* 2.jpg`) 81개를 배포 업로드에서 제외합니다. 원본 파일이 정본이며 유물 데이터는 복사본을 참조하지 않습니다.

DNS 레코드 값은 고정하지 말고 호스팅 대시보드가 현재 제시하는 값을 사용하세요.

## 5. CI/CD

`.github/workflows/ci.yml`은 타입 검사, Jest, 프로덕션 빌드, smoke/Lighthouse 검증, 취약점 스캔을 실행합니다. `.github/workflows/deploy.yml`은 배포 워크플로 설정을 담고 있으므로, 저장소 secret과 호스팅 프로젝트 연결을 먼저 확인하세요.

배포 전 반드시 CI의 필수 작업이 모두 성공해야 합니다. 현재 ESLint 패키지/config가 준비되지 않아 lint는 필수 작업에 포함되지 않습니다.

## 6. PWA 배포 주의사항

- `/sw.js`는 재검증 캐시 헤더로 배포합니다.
- 서비스 워커 캐시 버전을 변경하면 기존 사용자의 구버전 캐시를 정리합니다.
- 네비게이션 실패 시 `offline.html`만 폴백하며, 사용자 데이터를 서비스 워커에 저장하지 않습니다.

## 7. 운영 전 릴리스 게이트

다음 항목은 운영 배포 전 별도로 해결해야 합니다.

- lockfile의 Next.js/React를 공식 보안 패치 버전으로 업그레이드하고 회귀 검증
- ESLint flat config·패키지 구성 후 lint를 CI에 복구
- 운영 전 eMuseum key를 교체하고 100개 공식 ID를 검토하며, key는 로컬 동기화 작업에만 사용
- 모든 이미지의 출처, 저작권, 제3자 권리, 재배포 허용 범위 확인
- 검증 snapshot을 게시하고 `npm run verify:emuseum`을 통과한 후에만 색인 게이트 해제
- 동기화 상세 절차는 [EMUSEUM_SYNC.md](./EMUSEUM_SYNC.md)에 따라 수행
- 관리자 기능은 서버 인증·권한·CSRF·영속 저장소가 구축되기 전까지 비활성 유지

## 8. 롤백

배포 이상 시 호스팅 대시보드에서 이전의 검증된 배포를 Production으로 재지정합니다. 코드 롤백은 이력을 보존하는 `git revert` 커밋을 사용하고, 롤백 후에도 동일한 릴리스 검증을 실행합니다.
