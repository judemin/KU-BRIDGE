# 커뮤니티 운영

운영자는 `judemin2087@naver.com`입니다. Firebase 소유 계정과 서비스 운영 계정은 별개입니다. 초기화 스크립트는 지정 이메일의 가입 / 인증을 확인한 뒤 관리자 역할을 부여합니다. 브라우저에서는 관리자 승격을 허용하지 않습니다.

## 처음 사용할 때

1. `/account`에서 기존 이메일/비밀번호로 로그인합니다.
2. 공개 사용자 ID와 본인 국적을 저장합니다. 기존 관심 공간을 국적으로 변환하지 않습니다. ID는 소문자로 정규화하며 3~20자, 첫 글자 영문, 이후 영문 / 숫자 / 밑줄만 허용합니다. 등록 후 변경 / 탈퇴 후 재사용은 제한합니다.
3. 이메일 인증을 마칩니다. 국적은 본인 설정값이며 학교 / 재학 / 국적 인증이 아닙니다.
4. 운영자 역할 부여 직후 새로고침 또는 재로그인하고 내 계정의 **커뮤니티 관리**에 들어갑니다.
5. `/community`는 게시판, `/chat`은 실시간 채팅 전용 화면입니다. 각각 전체 / 영미권 / 중국 / 일본 / 한국을 선택할 수 있습니다. 모든 국적 회원이 다섯 공간에 참여할 수 있습니다. 게시글과 댓글, 채팅에는 국가명 오른쪽에 국기를 표시합니다.
6. 게시판의 글쓰기 버튼은 `/community/new` 전용 편집기로 이동합니다. 게시판 목록에는 10개씩 표시하며 페이지 번호와 이전/다음 버튼으로 이동합니다. 로그인과 회원가입 성공 후에는 홈으로 이동합니다. 내 계정은 헤더의 사람 아이콘으로 들어갑니다.

## 신고 / 장애 / 보관

- 관리자 화면에서 신고 대상을 확인하고 사유를 입력한 뒤 숨김 / 복구 / 이용 제한 / 제한 해제 / 신고 종결을 선택합니다. 처리 이력이 남습니다. 개인 차단은 본인 화면의 ID 필터이며 상대의 읽기 권한을 차단하지 않습니다.
- 장애나 사용량 급증 시 관리자 화면에서 채팅 또는 전체 커뮤니티를 일시중지합니다. 이미 전달된 데이터는 회수할 수 없습니다. 기존 정적 안내는 계속 열 수 있습니다.
- 글 4,000자/제목 120자, 댓글 1,000자, 채팅 500자. 계정당 글 60초 / 댓글 3초 / 채팅 2초 / 신고 30초 간격을 DB 규칙으로 검사합니다. 여러 계정을 이용하는 공격까지 자동 해결하지는 않습니다.
- 최근 채팅 / 댓글 각 30개만 구독하며 과거 기록은 버튼으로 읽습니다. 채팅은 방 변경 / 로그아웃 / 백그라운드 전환 시 구독을 정리합니다. 글 목록은 새로고침/페이지네이션 방식입니다.
- 채팅은 **30일 경과 시 운영자가 정리**합니다. 정리 버튼은 방별 최대 50개, 총 250개씩 삭제하므로 적체가 있으면 반복합니다. 예약 작업을 사용하지 않아 30일째 자동 삭제되는 것은 아닙니다.
- 내 계정에서 프로필 / 저장 / 체크리스트 / 본인 콘텐츠를 JSON으로 내려받을 수 있습니다.
- 탈퇴: 비밀번호 확인 → 삭제 표식 → 본인 메시지 / 댓글 / 신고 / 개인 기록 정리 → 본인 글 제목/본문/작성자 비우기 → 공개 프로필 삭제/ID 은퇴 → Auth 삭제. 다른 회원의 댓글은 남습니다. 실패하면 탈퇴를 재시도합니다. 재생성 방지 표식과 은퇴 ID는 비공개로 보관합니다. 제한 계정 / 운영 계정의 자동 탈퇴는 보호합니다.
- 학교 행정 처리 / 재학 확인 / 학사 판단은 제공하지 않습니다. 오래된 정보 / 잘못된 링크 제보, 다국어 행정 / 학사 용어 사전은 제외합니다.

## 반복 가능한 운영 명령

프로젝트 루트에서 Firebase CLI 로그인 후 실행합니다. 서비스 계정 키는 필요 없습니다.

```powershell
node scripts/community-admin.mjs bootstrap ku-bridge
npm run firebase:deploy-rules -- ku-bridge
node scripts/community-admin.mjs pause ku-bridge
node scripts/community-admin.mjs open ku-bridge
node scripts/community-admin.mjs backup ku-bridge
```

`bootstrap`은 인증된 운영자와 다섯 방을 준비하며 기존 공개 스위치를 보존합니다. `open`은 배포 / 자동 검증 후 베타 확인을 위해 사용합니다. 정식 출시는 실기기 / 참여자 검증 후 결정합니다. `backup`은 Git에서 제외된 `.private-backups/`에 논리 백업을 저장합니다. 개인정보가 있으므로 공개 저장소 / 빌드 / 채팅에 첨부하지 않습니다. Auth 비밀번호는 포함하지 않으며 동시 변경에 대한 시점 일관성은 보장하지 않습니다. 중요한 작업 전에는 커뮤니티를 중지하고 백업을 별도 비공개 보관합니다.

복구는 **로컬 demo 에뮬레이터만 허용**하며 복원 필드를 다시 읽어 대조합니다. 운영 DB 덮어쓰기는 지원하지 않습니다. 실제 복구 때는 삭제 표식 / 은퇴 ID / 후속 변경을 검토해 선택 복구해야 합니다. 과거 백업 전체를 덮으면 탈퇴 데이터가 되살아날 수 있습니다.

```powershell
# 터미널 1
npm run emulators
# 터미널 2: 실제 백업 파일명을 사용
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:15808'
node scripts/community-admin.mjs restore-emulator ku-bridge .private-backups/BACKUP_FILE.json
```

Windows에서 IPv4 에뮬레이터가 `EFAULT`로 시작되지 않으면 로컬 IPv6 실행을 사용할 수 있습니다. 이번 백업 8개 문서의 복원 / 필드 대조는 다음 경로로 통과했습니다. 이 명령은 Auth와 분리된 복구 확인용이며 브라우저 앱의 기본 에뮬레이터 주소를 바꾸지 않습니다.

```powershell
# 터미널 1
java -jar .cache/firebase/emulators/cloud-firestore-emulator-v1.22.0.jar --host ::1 --port 5184 --project_id demo-ku-bridge --single_project_mode --single_project_mode_error --rules firebase/firestore.rules
# 터미널 2
$env:FIRESTORE_EMULATOR_HOST = '[::1]:5184'
node scripts/community-admin.mjs restore-emulator ku-bridge .private-backups/BACKUP_FILE.json
```

## 무료 운영과 정식 공개 전 베타

결제 미연결 Firebase Spark와 Cloudflare Pages 정적 배포를 사용합니다. 별도 인프라 / Storage / Functions / 예약 백업을 추가하지 않습니다. 메시지 수신자별 읽기, 규칙 조회와 재연결도 사용량에 영향을 줍니다. Firebase Usage에서 읽기 / 쓰기 / 저장량을 확인하고 필요하면 관리자 중지 기능을 사용합니다. 무제한 운영을 보장하지 않습니다. [Firestore 한도](https://firebase.google.com/docs/firestore/quotas), [과금](https://firebase.google.com/docs/firestore/pricing), [Pages 한도](https://developers.cloudflare.com/pages/platform/limits/)

1. PC에서 운영자 로그인 / ID/국적 저장 / 관리 화면 확인.
2. 휴대폰의 별도 계정 가입 / 이메일 인증 / ID/국적 표시 확인.
3. 게시판에서 채팅이 표시되지 않는지, 채팅에서 게시판이 표시되지 않는지 확인합니다. 글쓰기 전용 경로, 10개 페이지 전환, 채팅 방 이동 시 이전 구독 정리와 메시지 격리를 확인합니다.
4. 모바일 키보드 / 터치 / 스크롤 / 접기, 새로고침 / 뒤로 가기 확인.
5. 신고 → 관리자 숨김/복구, 개인 차단/해제, 같은 계정 다른 기기의 북마크/체크리스트 동기화 확인.
6. 소수 참여자의 사용성과 실제 Usage를 확인한 후 정식 공개. 연결되지 않은 실제 브라우저나 참여자 피드백을 자동 테스트 통과로 대신 기록하지 않습니다.
