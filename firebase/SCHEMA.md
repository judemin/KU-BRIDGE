# Firestore 모델

공간은 `global`, `anglophone`, `country-cn`, `country-jp`, `country-kr` 다섯 개입니다. UI 언어·본인 국적·참여 공간은 별개이며 익명 별칭을 사용하지 않습니다.

| 경로 | 데이터·접근 |
| --- | --- |
| users/{uid} | 비공개 locale, studentType, preferredRoom, userId, nationality, createdAt, updatedAt. 기존 ID/국적 없는 프로필 호환 |
| userIds/{id} | 비공개 ownerId, state(active/retired), createdAt. 원자적 중복 예약. 소유자/운영자 조회 |
| profiles/{id} | 회원 조회용 userId, nationality, updatedAt. 이메일·UID 없음 |
| users/{uid}/saved/{topicId} | createdAt. 기존 45개 안내만, 본인 전용 |
| users/{uid}/checklists/{type} | completed, updatedAt. 유형별 허용 키, 본인 전용 |
| users/{uid}/limits/{kind} | targetKey, lastWriteAt. 콘텐츠와 원자적 작성, 서버 시간 검사 |
| users/{uid}/blocks/{id} | userId, createdAt. 본인 화면 필터 |
| rooms/{id} | enabled, kind, countryCode, createdAt, updatedAt. CLI 초기화 |
| rooms/{id}/posts/{id} | authorId(공개 사용자 ID), nationality, title, body, category, status, createdAt, updatedAt |
| posts/{id}/comments/{id} | authorId, nationality, body, status, createdAt, updatedAt |
| rooms/{id}/messages/{id} | 댓글과 같은 필드. 최근 30개 구독 |
| contentOwners/{room~kind~parent~id} | 비공개 ownerId, roomId, kind, parentId, contentId, createdAt. 최상위 키 parent는 root, 데이터 parentId는 빈 문자열 |
| reports/{uid~contentKey} | reporterId, roomId, kind, parentId, contentId, reason, details, status, createdAt, updatedAt. 처리 시 resolution. 신고자/운영자 전용 |
| admins/{uid} | role:admin. 신뢰된 CLI/IAM만 수정 |
| moderation/{uid} | status(active/suspended), reason, updatedAt |
| moderationEvents/{id} | actorId, action, target, reason, createdAt. 운영자 전용 불변 이력 |
| serviceConfig/public | communityEnabled, chatEnabled. 비로그인 읽기 가능 |
| accountDeletions/{uid} | 최근 로그인 후 만드는 비공개 삭제 표식. 오래된 토큰의 데이터 재생성 거부 |

작성에는 인증 이메일·ID/국적·열린 공간·이용 제한 없음·삭제 진행 아님이 필요합니다. 공개 콘텐츠+소유권+전송 제한을 원자적으로 씁니다. 필드 추가·작성자/국적 위조·타인 편집·소유권 이전을 거부합니다. 카테고리는 general, question, life, study, exchange입니다.

목록은 회원 권한·공개 상태 필터·최대 50개를 요구합니다. 본인 콘텐츠 개별 조회는 숨김 상태에서도 내보내기를 위해 허용합니다. 운영자는 숨긴 콘텐츠를 조회·복구합니다. 이메일은 공개 문서에 저장하지 않습니다.

콘텐츠/신고 인덱스는 status+createdAt 내림차순입니다. 본문·신고 상세는 인덱싱하지 않습니다. 기본 거부 규칙이며 과거 aliases/roomAliases도 닫혀 있습니다. 보관·탈퇴·복구는 [운영 문서](../COMMUNITY_OPERATIONS.md)를 따릅니다.
