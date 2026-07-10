# eMuseum 검증 동기화

이 프로젝트는 eMuseum API를 사용자 요청이나 `next build` 중에 호출하지 않습니다. API 호출은 별도 동기화 도구에서만 수행하고, 애플리케이션은 키가 제거된 검증 스냅샷과 로컬 이미지만 읽습니다.

## 확정된 API 계약

- 상품: 문화체육관광부 국립중앙박물관_전국 박물관 유물정보 상세설명
- 공공데이터 상품 ID: `3036708`
- 공식 legacy base URL: `http://www.emuseum.go.kr/openapi`
- 코드 목록: `GET /code`
- 소장품 목록: `GET /relic/list`
- 소장품 상세: `GET /relic/detail`
- 인증: query parameter `serviceKey`
- 응답: JSON 또는 XML이며 이 프로젝트는 JSON만 허용
- 일일 한도: 1,000회; 자동 도구 hard limit은 800회
- 갱신주기: 일 1회

기술문서와 공공데이터포털은 HTTP endpoint만 제공합니다. HTTPS 호출은 현재 `4012`로 거부됩니다. 동기화 도구는 기본적으로 HTTPS만 허용하며, 사용자가 평문 전송 위험을 승인하고 `MUSEUM_API_ALLOW_INSECURE_HTTP=true`를 설정한 경우에만 정확한 legacy HTTP origin을 허용합니다. redirect는 항상 거부합니다.

목록 응답에는 영문명이 없고 `nameCn`은 중국어 번역이 아니라 한자 명칭입니다. 따라서 기존 `en/zh/ja/th` 콘텐츠와 전시관·featured 값은 편집 오버레이로 유지합니다. 상세 응답은 `list` 배열과 `{ totalCount, list }` 형태의 `imageList`, `relationList`로 구성됩니다.

## 먼저 해야 할 보안 조치

대화, 이슈, 메일 등에 입력한 인증키는 운영 사용 전에 폐기하고 새 키를 발급합니다. 키는 `.env.local`에만 저장하며 CLI 인자, Git, 배포 환경, 브라우저 코드에는 넣지 않습니다.

```dotenv
MUSEUM_API_URL=http://www.emuseum.go.kr/openapi
MUSEUM_API_ALLOW_INSECURE_HTTP=true
MUSEUM_API_KEY=새로_발급한_Decoding_키
```

공공데이터포털의 Encoding 키를 넣어도 한 번 decode한 뒤 한 번만 URL encoding하지만, 혼동을 줄이기 위해 Decoding 키 사용을 권장합니다.

## 1. 후보 검색

먼저 소량으로 계약과 결과를 확인합니다.

```bash
npm run emuseum:discover -- --limit 5
```

진행 중에는 `.cache/emuseum/candidates.partial.json`이 매 항목마다 갱신되고, 완료되면 `.cache/emuseum/candidates.json`과 `.cache/emuseum/selection-template.json`이 생성됩니다. 개별 API 오류는 해당 레코드에 안전한 오류 정보만 남기고 계속 진행하되, 연속 5회 실패하면 중단합니다. 출력에는 API key와 원격 이미지 URL이 포함되지 않습니다.

각 후보의 박물관, 유물번호, 명칭을 원 출처와 대조한 뒤 검토한 항목을 `data/emuseum-selections.json`으로 옮깁니다. 자동으로 제안된 `sourceId`도 사람이 확인하기 전에는 신뢰하지 않습니다.

```json
{
  "schemaVersion": 1,
  "datasetId": "3036708",
  "records": [
    {
      "localId": 1,
      "sourceId": "공식_소장품_ID",
      "acceptedOfficialNames": [],
      "identityReviewed": true
    }
  ]
}
```

## 2. 상세·이미지 ID 점검

```bash
npm run emuseum:inspect -- --limit 5
```

`.cache/emuseum/inspection.json`에는 공식 상세 필드와 이미지 고유 ID만 남고, 키가 포함된 이미지 URL은 제거됩니다. `.cache/emuseum/rights-review-template.json`을 참고해 메타데이터와 이미지 권리를 각각 검토합니다.

`data/emuseum-selections.json`의 최종 항목은 다음 정보를 포함해야 합니다.

```json
{
  "localId": 1,
  "sourceId": "공식_소장품_ID",
  "acceptedOfficialNames": [],
  "identityReviewed": true,
  "metadataRights": {
    "basis": "kogl-1",
    "attribution": "제공기관과 자료명을 포함한 출처표시 문구",
    "evidenceUrl": "https://권리-근거-페이지",
    "verifiedAt": "2026-07-10",
    "reviewer": "검토자 또는 검토 역할"
  },
  "images": [
    {
      "sourceImageId": "공식_이미지_ID",
      "rightsStatus": "kogl-1",
      "credit": "화면에 표시할 이미지 크레딧",
      "evidenceUrl": "https://이미지-권리-근거-페이지",
      "verifiedAt": "2026-07-10"
    }
  ]
}
```

제3자 허락을 근거로 사용하는 이미지는 `rightsStatus`를 `third-party-permitted`로 두고 `rightsHolder`와 허락 근거 URL을 반드시 기록합니다. 데이터셋의 공공누리 제1유형 조건을 개별 이미지에 자동 적용하면 안 됩니다.

## 3. dry run과 게시

100개 내부 ID와 100개 공식 ID를 모두 검토한 뒤 dry run을 실행합니다.

```bash
npm run emuseum:sync -- --dry-run
```

도구는 상세 응답과 이미지 MIME·magic bytes·크기·SHA-256을 검증합니다. 결과는 `.cache/emuseum/emuseum-artifacts.preview.json`과 staging 이미지에만 기록되며 현재 앱 데이터는 바뀌지 않습니다.

검토가 끝나면 실제 게시를 실행합니다.

```bash
npm run emuseum:sync
npm run verify:emuseum
```

이미지는 `public/artworks/emuseum/{snapshotId}`의 새 디렉터리에 저장되고, 모든 작업이 성공한 뒤 `data/generated/emuseum-artifacts.json`이 원자적으로 교체됩니다. 실패하면 기존 스냅샷은 유지됩니다. 이전 이미지 디렉터리는 자동 삭제하지 않습니다.

## 4. 공개 게이트

`npm run verify:emuseum`은 다음을 검사합니다.

- ID 1–100과 공식 source ID의 완전성·고유성
- 5개 locale 필수 텍스트
- 로컬 이미지 경로, MIME, SHA-256
- 동일 이미지가 서로 다른 유물에 연결되지 않았는지 여부
- 메타데이터와 이미지 권리의 분리
- 출처표시, 권리 근거 URL, 검토일, 제3자 권리자
- snapshot이나 로그용 JSON에 `serviceKey`가 없는지 여부

검증을 통과한 스냅샷이 없으면 `MUSEUM_DATA_VERIFIED=true`를 설정해도 색인은 열리지 않습니다. 두 조건이 모두 충족된 뒤에만 운영 환경에서 값을 `true`로 설정합니다.

## 호출 한도 주의

도구는 실행 한 번당 최대 800회, 초당 약 2회로 제한하며 자동 재시도하지 않습니다. 같은 날 여러 번 실행한 총량까지 보장하려면 외부의 날짜별 durable counter가 필요합니다. 후보 검색과 점검은 항상 `--limit`으로 소량부터 시작하세요.
