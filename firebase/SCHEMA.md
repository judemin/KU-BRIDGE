# 2단계 데이터 모델과 권한 계약

현재 단계의 실행 규칙은 `firestore.rules`입니다. 아래에서 **잠김**으로 표시한 컬렉션은 모델과 인덱스만 준비했고 읽기·쓰기를 모두 차단합니다. 기능을 구현하는 단계에서 허용·거부 테스트를 추가하기 전에는 열지 않습니다. Firebase Admin SDK·콘솔 소유자는 Rules를 우회할 수 있으므로 관리자 자격 증명은 브라우저에 넣지 않습니다.

## 현재 허용하는 개인 데이터

| 경로 | 필드 | 허용 |
| --- | --- | --- |
| `users/{uid}` | `locale: en/ko/zh/ja`, `studentType: all/u/g/e/l`, `preferredRoom: global/country-xx`, `createdAt`, `updatedAt` | 로그인한 본인의 단일 조회·생성·수정. 전체 회원 조회·단독 삭제 금지 |
| `users/{uid}/saved/{topicId}` | `createdAt` | 본인 조회·목록·생성·삭제. 실제 안내 45개 ID만 허용. 기존 항목의 생성 시각 변경 금지 |
| `users/{uid}/checklists/{type}` | `completed: string[]`, `updatedAt` | 본인 조회·목록·생성·수정·삭제. u/g/e/l별 기존 체크 키만 허용하며 중복 키 금지 |

모든 시각은 Firestore `serverTimestamp()`를 사용합니다. 프로필의 `createdAt`은 생성 후 변경하지 않습니다. 프로필에 이메일·실명·학번·관리자 역할·학교 승인 정보를 추가할 수 없습니다. 이메일은 Firebase Auth가 보관하며 공개 프로필에 복제하지 않습니다.

로그인과 이메일 인증은 구분합니다. 미인증 계정도 자신의 개인 기록은 관리할 수 있지만, 공개 커뮤니티 작성은 이후 단계에서 이메일 인증을 필수로 검사합니다. 현재 커뮤니티는 인증 여부와 무관하게 잠겨 있습니다.

북마크 생성이 다른 기기와 경합하면 기존 항목을 다시 조회해 병합합니다. 변경 불가능한 생성 시각을 덮어쓰는 방식으로 동기화하지 않습니다. 삭제된 안내 ID를 임의의 새 ID로 교체하지 않으며 카탈로그가 바뀌면 Rules의 허용 목록과 테스트를 함께 변경합니다.

## 공개 공간·익명 콘텐츠 모델 — 현재 잠김

| 경로 | 필드 계약 | 공개 범위·도입 단계 |
| --- | --- | --- |
| `rooms/{roomId}` | `kind: global/country`, `countryCode: global/ISO 2자리`, `enabled`, `createdAt`, `updatedAt` | 국가/언어 공간 설정. 운영자가 활성화. 6·7단계 |
| `rooms/{roomId}/aliases/{aliasId}` | `createdAt` | 방별 무작위 별칭 ID. 계정 UID·이메일 없음. 6단계 |
| `roomAliases/{roomId}/members/{uid}` | `aliasId`, `createdAt` | 본인·필요한 운영자만 보는 계정 연결. 방 간 동일인 연결은 공개하지 않음. 6단계 |
| `rooms/{roomId}/posts/{postId}` | `aliasId`, `title`, `body`, `category`, `status: visible/hidden/deleted`, `createdAt`, `updatedAt` | 회원용 익명 게시글. 7단계 |
| `rooms/{roomId}/posts/{postId}/comments/{commentId}` | `aliasId`, `body`, `status`, `createdAt`, `updatedAt` | 회원용 댓글. 부모 글의 공개 상태도 검사. 7단계 |
| `rooms/{roomId}/messages/{messageId}` | `aliasId`, `body`, `status`, `createdAt`, `updatedAt` | 회원용 텍스트 채팅. 8단계 |
| `contentOwners/{contentKey}` | `ownerId`, `roomId`, `kind: post/comment/message`, `parentId`, `contentId`, `createdAt` | 수정·삭제 권한을 위한 비공개 연결. 6·7·8단계 |
| `users/{uid}/blocks/{aliasKey}` | `roomId`, `aliasId`, `createdAt` | 본인의 차단 목록. 6단계 |
| `users/{uid}/limits/{bucket}` | `targetKey`, `lastWriteAt` | 게시·채팅·신고 속도 제한용. 공개 쓰기와 원자적으로 갱신. 6·7·8단계 |
| `reports/{reportId}` | `reporterId`, `roomId`, `kind`, `parentId`, `contentId`, `reason`, `details`, `status: open/reviewed/closed`, `createdAt`, `updatedAt` | 커뮤니티 이용규칙 위반 신고. 신고자·운영자만. 6단계 |

`roomId`는 `global` 또는 `country-cn` 같은 값입니다. `aliasId`는 UID·이메일의 해시나 일부 문자열로 만들지 않고 방마다 독립적인 난수를 사용합니다. `aliasKey`는 방과 별칭 ID의 조합입니다. `contentKey`는 방·종류·부모 ID·콘텐츠 ID의 조합으로 고정하고 작성자 UID를 공개 문서에 넣지 않습니다.

별칭 공개 문서와 비공개 계정 연결은 하나의 원자적 쓰기에서 예약·생성하도록 6단계에서 검증합니다. 게시글·댓글·메시지와 `contentOwners`도 함께 생성되도록 검사해야 합니다. 표시용 별칭만 같게 만들어 타인의 소유권을 가져갈 수 없어야 합니다.

속도 제한은 프론트엔드 버튼 비활성화만으로 구현하지 않습니다. 서버 시각과 `getAfter()` 등으로 작성 대상과 카운터를 묶어 한 번의 카운터 갱신으로 여러 메시지를 보내는 우회도 막습니다. 해당 검증이 없는 현재 Rules에서는 공개 쓰기를 계속 차단합니다.

신고의 `reason`은 spam/harassment/personal_info/other 등 커뮤니티 이용규칙 사유로 제한합니다. 학교 안내의 최신성·링크 제보, 학사·행정 업무 접수, 다국어 행정·학사 용어 사전은 모델과 기능 범위에 포함하지 않습니다.

## 운영 정보

| 경로 | 필드 | 현재 권한 |
| --- | --- | --- |
| `admins/{uid}` | `role: admin`, `createdAt` | 본인 단일 조회만. 모든 브라우저 쓰기·목록 조회 금지 |
| `moderation/{uid}` | `status: active/suspended`, `reason`, `updatedAt` | 본인 단일 조회만. 운영 도구 구현 전까지 브라우저 쓰기 금지 |
| `serviceConfig/public` | `communityEnabled`, `chatEnabled` 두 boolean만 | 비회원도 단일 조회 가능. 브라우저 수정·컬렉션 목록 조회 금지 |

운영자 권한을 사용자 수정 가능한 프로필에서 읽지 않습니다. 현재 Rules에서는 운영자 문서나 `admin: true` 토큰이 있어도 잠긴 콘텐츠를 읽거나 권한·기능 플래그를 변경할 수 없습니다. 실제 운영자용 허용은 6단계의 테스트와 함께 도입합니다. `serviceConfig/public`에는 공개해도 되는 플래그만 넣고, 문서가 없으면 기능은 닫힌 상태로 간주합니다. 지금은 이 문서의 생성도 필수가 아닙니다.

프로필 단독 삭제는 하위 컬렉션과 Auth 계정까지 삭제하지 않습니다. 탈퇴·보관·삭제 복구 절차는 4단계에서 구현하며, 관리자 경로의 데이터 삭제는 필요할 때 별도로 수행합니다. 아직 회원 UI가 없으므로 이번 단계에서 계정을 생성하거나 사용자 데이터를 이관하지 않습니다.

## 쿼리·비용·보관

- `posts`: `status == visible`, `createdAt DESC`, 한 번에 최대 20~50개.
- `comments`: 특정 게시글의 `status == visible`, `createdAt ASC`, 커서 페이지네이션.
- `messages`: 활성 방의 `status == visible`, `createdAt DESC`, 최신 30~50개만 구독.
- `reports`: 운영 도구에서 `status`와 `createdAt DESC`로 조회.
- 위 복합 인덱스는 `firestore.indexes.json`에 준비했습니다. 본문과 신고 상세는 검색 인덱스를 만들지 않습니다.
- 본인 작성 글 모아보기·전체 방 미리보기 같은 추가 쿼리는 아직 허용·구현하지 않습니다.
- 학교 안내는 정적 데이터로 유지합니다. 채팅 보관 기간·탈퇴 데이터 정리·백업 자동화는 실제 구현 단계에서 무료 한도와 운영 절차를 함께 확정합니다. TTL과 자동 백업을 현재 설정에 추가하지 않았습니다.

## 실제 테스트

`npm run test:rules`는 `demo-ku-bridge`와 루프백 Emulator만 사용합니다. 실제 프로젝트 ID나 원격 호스트를 테스트에 사용하지 않습니다. 비로그인·타인 데이터 접근, 관리자 위조, 임의 필드·시각·체크 키, 잠긴 콘텐츠와 비공개 계정 연결 접근을 거부하고, 올바른 본인 데이터 처리는 허용하는 양방향 검증을 수행합니다.
