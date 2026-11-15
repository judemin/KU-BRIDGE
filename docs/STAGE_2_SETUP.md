# 2단계 — 사용자가 해야 하는 설정 순서

2026-11-15: 아래 설정을 마치고 실제 프로젝트 `ku-bridge`의 웹 앱·Auth·서울 Standard DB와 결제 미연결을 확인했습니다. Rules·인덱스를 배포하고 로컬 Rules 일치·실제 SDK의 비로그인 개인 정보 조회 거부를 검증했습니다. 현재는 [3단계 FE 공개 배포](STAGE_3_DEPLOY.md)를 진행합니다. 아래는 설정 재현을 위한 안내입니다. 비밀번호·관리자 JSON 키·인증 토큰을 대화나 저장소에 올릴 필요는 없습니다.

## 1. Firebase 프로젝트 생성

1. [Firebase 콘솔](https://console.firebase.google.com/)에 Google 계정으로 로그인합니다.
2. 프로젝트 추가를 선택하고 표시 이름을 `KU Bridge`로 설정합니다. 프로젝트 ID는 사용 가능한 고유 값으로 선택하고 기록합니다. `demo-ku-bridge`는 로컬 테스트 전용이므로 실제 ID로 쓰지 않습니다.
3. Analytics와 AI 도구 등 선택 기능은 이번 설정에 필요하지 않습니다. 생성 중 선택 항목을 끄고 프로젝트를 생성합니다.
4. 프로젝트 요금제가 **Spark**인지 확인합니다. Billing 계정·카드를 연결하거나 Blaze로 전환하지 않습니다.

Spark의 카드 미등록 무료 범위와 제품별 제한은 [Firebase 요금제](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans)를 기준으로 확인했습니다. 무료 한도를 넘으면 기능 사용이 제한될 수 있습니다.

## 2. Firestore 생성

1. 프로젝트에서 Build → Firestore Database → 데이터베이스 만들기로 이동합니다.
2. 에디션 선택이 있으면 **Standard**, DB ID는 기본 `(default)`를 선택합니다.
3. 위치는 **`asia-northeast3` (Seoul)**를 선택합니다. 기존 프로젝트에서 이미 다른 위치가 지정되어 있으면 새로 덮어쓰지 말고 그 상태를 알려 주세요.
4. **프로덕션 모드**로 생성합니다. 공개 테스트 모드나 `allow read, write: if true` 규칙을 적용하지 않습니다.
5. 이 시점에는 데이터 문서나 운영자 계정을 수동으로 만들 필요가 없습니다. Storage·Functions·Extensions도 만들지 않습니다.

서울은 공식 지원 위치이며 DB 생성 후 위치를 변경할 수 없습니다. [위치 안내](https://firebase.google.com/docs/firestore/locations)

## 3. 웹 앱 등록과 로컬 환경변수

1. 프로젝트 설정 → 일반 → 내 앱에서 웹 아이콘 `</>`을 눌러 앱 이름 `ku-bridge-web`으로 등록합니다.
2. **Firebase Hosting 설정은 선택하지 않습니다.** FE 호스팅은 Cloudflare Pages를 사용할 예정입니다.
3. 표시되는 웹 설정에서 `apiKey`, `authDomain`, `projectId`, `appId` 네 값을 확인합니다. Analytics의 measurementId나 Storage bucket은 이번 설정에 필요하지 않습니다.
4. 프로젝트 폴더의 PowerShell에서 실행합니다.

```powershell
Copy-Item -LiteralPath .env.example -Destination .env.local
```

이미 `.env.local`이 있으면 복사해서 덮어쓰지 말고 기존 파일에 필요한 항목만 추가합니다. 텍스트 편집기로 `.env.local`을 열어 다음에 본인의 웹 설정 값을 넣습니다.

```dotenv
VITE_FIREBASE_API_KEY=본인_웹_apiKey
VITE_FIREBASE_AUTH_DOMAIN=본인_authDomain
VITE_FIREBASE_PROJECT_ID=본인_projectId
VITE_FIREBASE_APP_ID=본인_appId
VITE_FIREBASE_USE_EMULATORS=false
```

검증은 아래 명령으로 합니다. 이 검사는 값 자체를 출력하지 않고 설정 상태만 표시하며, 실제 네트워크 연결·프로젝트 소유권·메일 발송 성공까지 검사하지는 않습니다.

```powershell
npm run firebase:check
npm run firebase:check -- production
```

`ready`면 설정 형식이 준비된 것입니다. `unconfigured`면 기존 FE는 정상 사용하지만 Firebase는 아직 미연결입니다. `invalid`면 표시된 항목을 수정합니다. 네 값은 웹 클라이언트의 공개 식별 설정이고, 관리자 비밀은 아닙니다. 그래도 `.env.local`은 Git에서 제외합니다. `VITE_*`에 관리자 키나 서비스 계정 JSON을 넣지 않습니다.

## 4. 인증 제공자 준비

1. Build → Authentication → 시작하기로 이동합니다.
2. 로그인 방법에서 **이메일/비밀번호**를 활성화합니다. 비밀번호 없는 이메일 링크 방식은 켜지 않습니다.
3. Settings → Authorized domains에서 로컬 확인용 `localhost`를 확인하고 없으면 추가합니다.
4. 이메일 템플릿의 발신 표시 이름·지원 이메일을 본인 서비스에 맞게 확인합니다.
5. 공개 `pages.dev` 주소는 3단계 배포 후 추가합니다. Google 로그인·SMS·학교 재학 인증은 지금 설정하지 않습니다.

실제 가입·이메일 인증·로그인 화면과 메일 수신 테스트는 4단계에서 구현합니다. 지금은 제공자 설정만 준비하며 테스트 사용자를 직접 만들 필요는 없습니다. 인증 방식별 무료 메일 한도는 [Auth 한도](https://firebase.google.com/docs/auth/limits)에 정리되어 있습니다.

## 5. Cloudflare 계정과 저장소 권한 준비

1. [Cloudflare 대시보드](https://dash.cloudflare.com/sign-up)에 가입하고 이메일 인증을 완료합니다.
2. 3단계에서 Pages 프로젝트를 만들 수 있도록 GitHub의 `judemin/KU-BRIDGE` 저장소에 본인이 접근할 수 있는지 확인합니다.
3. GitHub 연동 화면이 나오면 **이 저장소만** 선택해 접근을 허용합니다. 다른 저장소 전체 권한을 줄 필요는 없습니다.
4. 도메인 구매·네임서버 변경·유료 플랜·카드 등록은 하지 않습니다. 실제 Pages 프로젝트 생성·빌드 설정·공개 배포는 3단계에서 진행합니다.

[React/Pages 배포 방식](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)에 맞춰 이 저장소의 `npm run build`와 `dist`를 사용할 예정입니다.

## 6. 실제 DB에 규칙 반영

계정·프로젝트 ID가 준비된 뒤 수행합니다. 제가 이어서 작업할 때는 프로젝트 ID와 계정 준비 완료 여부만 알려 주시면 됩니다. 아래처럼 직접 진행해도 됩니다.

```powershell
npm exec -- firebase login
npm run firebase:deploy-rules -- 실제_프로젝트_ID
```

첫 명령은 본인 브라우저에서 로그인합니다. 두 번째 명령은 **지정한 실제 프로젝트의 Firestore Rules·인덱스**만 반영합니다. 다른 앱이 사용 중인 프로젝트를 지정하지 않습니다. FE·Storage·Functions·결제 설정을 배포하거나 변경하지 않습니다.

실수로 기본 프로젝트에 배포하지 않도록 `.firebaserc`는 로컬 `demo-ku-bridge`를 유지하며, 배포 스크립트는 실제 프로젝트 ID를 명시하지 않거나 demo ID를 전달하면 종료합니다. 프로젝트 ID는 프로젝트 설정에서 복사한 값을 사용하세요.

콘솔의 Firestore Rules에 이 저장소의 규칙이 반영됐는지, 인덱스가 준비됐는지 확인하면 외부 설정 부분이 끝납니다. 현재 규칙에서 게시판·채팅·신고·익명 작성자 연결과 관리자 권한 쓰기는 모두 닫혀 있습니다.

## 개발자가 준비·검증한 내용

- `firebase.json`, `.firebaserc`: 실제 DB를 기본 대상으로 삼지 않는 로컬 Emulator 구성.
- `firebase/firestore.rules`: 본인 개인 데이터의 제한적 허용과 나머지 기본 거부.
- `firebase/firestore.indexes.json`, `firebase/SCHEMA.md`: 이후 기능에 사용할 모델·쿼리·공개/비공개 구분.
- `.env.example`, `src/services/firebaseConfig.js`: 공개 설정·부분 설정·잘못된 설정 검사.
- `src/services/firebase.js`: 실제 기능에서 호출할 때만 SDK를 초기화하는 진입점. 기존 안내는 Firebase 없이 동작.
- `npm run test:rules`: 로컬 Emulator에서 실행하는 실제 권한 테스트. 첫 실행은 Emulator 파일을 내려받으며 Java 21과 인터넷 연결이 필요합니다.
- `npm run build`: 프로덕션 Firebase 설정 검사 후 FE 빌드. 완전 미설정은 허용하고 부분 설정·잘못된 설정·프로덕션 Emulator 설정은 차단합니다.

로컬 Emulator 확인용 `.env.local` 예시는 다음과 같습니다. 실제 프로젝트 설정과 혼합하지 않고 **개발 서버에서만** 사용합니다.

```dotenv
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=demo-ku-bridge.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-ku-bridge
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef1234
VITE_FIREBASE_USE_EMULATORS=true
```

이 설정에서는 `npm run emulators`와 `npm run dev`를 각각 실행합니다. 프로덕션 빌드는 거부되므로 빌드·배포 전에 실제 설정으로 교체하거나 개발용 `.env.local`을 제거해야 합니다. 자동 규칙 테스트는 이 파일 없이도 동작합니다.

## 현재 완료와 남은 일

코드·모델·로컬 검증과 실제 계정 연결은 구분합니다. 로컬 테스트 통과가 실제 DB에 규칙이 배포됐음을 뜻하지 않습니다. 사용자의 외부 계정·프로젝트 생성과 배포 확인 전에는 2단계 전체를 완료로 표시하지 않습니다. 위 1~6이 끝나면 3단계 FE 공개 배포로 진행합니다.
