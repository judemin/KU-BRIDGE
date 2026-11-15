# 3단계 — Cloudflare Pages 공개 배포

## 현재 준비 상태

- Firebase 실제 프로젝트: `ku-bridge`.
- 서울 `asia-northeast3`, Standard, 기본 DB `(default)`, 무료 할당량 대상 확인.
- Billing 미연결, 이메일/비밀번호 로그인 활성화, 이메일 링크 로그인 비활성화 확인.
- 로컬 웹 앱 설정 네 값이 실제 Firebase 웹 앱과 일치함을 확인.
- Firestore Rules 배포와 로컬 규칙 일치 확인. 게시글·댓글·메시지·신고용 복합 인덱스 네 개 모두 `READY` 확인.
- 실제 Firebase SDK의 비로그인 개인 데이터 조회 거부 확인. 테스트 문서·계정은 생성하지 않음.
- FE는 회원·커뮤니티 UI를 제공하기 전까지 기존 안내·브라우저 저장만 제공.

Cloudflare 계정 가입만으로 GitHub 자동 배포 연결이 만들어지지는 않습니다. 현재 자동 조작 가능한 브라우저·Cloudflare CLI 인증이 연결되어 있지 않아 아래 콘솔 작업은 사용자가 진행합니다. 공개 URL이 준비되면 나머지 HTTP·경로·배포 결과 검증을 이어갑니다.

## 1. 저장소 변경 반영

이번 변경을 기존 방식으로 커밋하고 GitHub `main`에 푸시합니다. 특히 `public/_headers`가 포함되어야 합니다. `.env.local`은 Git에서 제외된 상태를 유지합니다.

## 2. Pages 프로젝트 만들기

1. [Cloudflare 대시보드](https://dash.cloudflare.com/)에 로그인합니다.
2. `Workers & Pages` → `Create application`으로 이동합니다.
3. **Pages**를 선택합니다. Workers 생성 화면이라면 Pages 시작 링크나 탭으로 이동합니다.
4. `Import an existing Git repository` 또는 `Connect to Git`을 선택합니다. 파일 직접 업로드 방식은 사용하지 않습니다.
5. GitHub 연결 화면에서 `judemin` 계정을 선택합니다.
6. Cloudflare GitHub 앱 설치·권한 요청이 나오면 `Only select repositories`로 `KU-BRIDGE`만 선택해 허용합니다.
7. 저장소 `judemin/KU-BRIDGE`를 선택하고 설정 화면으로 진행합니다.

저장소가 Public이어도 자동 배포를 위한 GitHub 앱 연결은 필요합니다. 이 연결은 선택한 브랜치의 push를 배포로 이어 줍니다.

## 3. 빌드 설정 입력

| 항목 | 값 |
| --- | --- |
| 프로젝트 이름 | `ku-bridge` — 사용 중이면 다른 고유 이름 선택 |
| Production branch | `main` |
| Framework preset | `React (Vite)` — 없으면 `None` 선택 후 아래 값 직접 입력 |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | 기본값 유지 — 저장소 최상위 |

Workers용 deploy command나 `wrangler deploy`는 입력하지 않습니다. 이 프로젝트는 Pages 정적 사이트입니다.

## 4. 빌드 환경변수 입력

생성 화면의 환경변수 항목에 아래 값을 등록합니다. 생성 화면에 없으면 프로젝트 생성 후 `Settings` → `Variables and Secrets` 또는 `Environment variables`에서 등록하고 다시 배포합니다. **Production과 Preview 모두** 같은 설정을 적용합니다.

| 변수 이름 | 입력할 값 |
| --- | --- |
| `NODE_VERSION` | `22.12.0` |
| `VITE_FIREBASE_API_KEY` | `.env.local`의 같은 변수 값 |
| `VITE_FIREBASE_AUTH_DOMAIN` | `.env.local`의 같은 변수 값 |
| `VITE_FIREBASE_PROJECT_ID` | `ku-bridge` |
| `VITE_FIREBASE_APP_ID` | `.env.local`의 같은 변수 값 |
| `VITE_FIREBASE_USE_EMULATORS` | `false` |

변수 값을 입력할 때는 `=` 앞의 이름과 오른쪽 값을 각각 나누어 입력합니다. 따옴표나 쉼표를 붙이지 않습니다. Cloudflare의 Git 빌드는 로컬 `.env.local`을 읽지 않으므로 별도 등록이 필요합니다.

Firebase의 네 값은 웹 앱 공개 설정이며, 관리자 서비스 계정 JSON이나 Google/Firebase CLI 로그인 토큰을 등록하지 않습니다. 변수 변경은 **새 빌드**에 반영되므로 저장 후 다시 배포해야 합니다.

## 5. 배포와 Firebase 도메인 등록

1. `Save and Deploy`를 누릅니다.
2. 배포 로그에서 `Firebase configuration: ready`, Vite 빌드 성공, 배포 성공을 확인합니다.
3. 생성된 고정 Production 주소 `https://선택한이름.pages.dev`를 엽니다. 커밋별 임시 주소와 구분합니다.
4. Firebase 콘솔 → `Authentication` → `Settings` → `Authorized domains` → `Add domain`으로 이동합니다.
5. 실제 Production 주소의 호스트명 `선택한이름.pages.dev`만 등록합니다. `https://`·경로·포트는 붙이지 않습니다.
6. 이 대화에 고정 Production URL과 배포 성공 여부를 알려 줍니다.

이 단계에서는 도메인 구매·DNS 변경·카드 등록·유료 요금제 선택이 필요하지 않습니다. 계정 기능은 4단계에서 구현하므로 현재 로그인 버튼이 없어도 정상입니다.

## 6. 공개 배포 후 검증

공개 주소가 준비되면 다음을 확인하고 결과를 기록합니다.

- HTTPS, 최신 HTML·JS·CSS 정상 응답, `public/_headers`의 보안·캐시 헤더 적용.
- `/`, `/guide?student=g&category=funding`, `/contacts`, `/my/checklist`, `/my/saved` 직접 진입과 새로고침.
- 알 수 없는 주소에서 앱의 복구 화면 표시.
- 언어 전환, 검색·필터, 상세 창, 저장과 체크리스트.
- 실제 브라우저 연결 후 PC·모바일 레이아웃, 애니메이션, 동작 줄이기 설정.
- 이후 `main`의 변경사항 push가 새 자동 배포로 이어지는지 확인.

`public/_headers`는 Vite 빌드 때 `dist/_headers`로 복사됩니다. 해시가 포함된 `/assets/*`만 장기 캐시하고 HTML 캐시는 Pages 기본 재검증 동작을 사용합니다. 최상위 `404.html`을 추가하지 않아 Pages 기본 SPA 처리가 깊은 경로에도 `index.html`을 제공합니다. `_redirects`로 모든 파일 요청을 HTML로 덮어쓰는 규칙은 추가하지 않습니다.

연결 가능한 브라우저가 없으면 HTTP 응답과 빌드 검증까지만 완료로 기록하며 PC·모바일 시각 검증은 남겨 둡니다. 공개 배포와 자동 배포 확인 전에는 3단계 전체를 완료로 표시하지 않습니다.

## 공식 문서

- [Git 연동으로 Pages 배포](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [React 배포 설정](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)
- [빌드 환경변수](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [SPA 경로·기본 캐시 동작](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [응답 헤더 설정](https://developers.cloudflare.com/pages/configuration/headers/)
