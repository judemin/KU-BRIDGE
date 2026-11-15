const rows = `authAccount|내 계정|My account|我的账户|アカウント
authLogin|로그인|Log in|登录|ログイン
authRegister|회원가입|Create account|注册|新規登録
authLogout|로그아웃|Log out|退出登录|ログアウト
authEmail|이메일|Email|邮箱|メールアドレス
authPassword|비밀번호|Password|密码|パスワード
authConfirmPassword|비밀번호 확인|Confirm password|确认密码|パスワードの確認
authPasswordHint|비밀번호는 8자 이상으로 입력하세요.|Use at least 8 characters.|密码至少为8个字符。|8文字以上で入力してください。
authIntro|학교와 별개로 운영하는 KU Bridge 계정입니다. 학교 이메일이 아니어도 가입할 수 있습니다.|A KU Bridge account is independent of the university. You can use any email address.|KU Bridge账户独立于学校，可使用非学校邮箱注册。|大学とは別のKU Bridgeアカウントです。大学以外のメールでも登録できます。
authReset|비밀번호 재설정|Reset password|重置密码|パスワードの再設定
authResetIntro|가입한 이메일 주소를 입력하세요.|Enter the email address you used to register.|请输入注册时使用的邮箱。|登録したメールアドレスを入力してください。
authSendReset|재설정 메일 보내기|Send reset email|发送重置邮件|再設定メールを送信
authResetSent|가입된 이메일이라면 재설정 안내가 발송됩니다. 받은편지함과 스팸함을 확인하세요.|If the email is registered, reset instructions will be sent. Check your inbox and spam folder.|如果该邮箱已注册，将发送重置说明。请查看收件箱和垃圾邮件。|登録済みのメールアドレスの場合、再設定の案内が届きます。迷惑メールもご確認ください。
authVerified|이메일 인증 완료|Email verified|邮箱已验证|メール認証済み
authUnverified|이메일 인증 필요|Verify your email|需要验证邮箱|メール認証が必要です
authVerifyIntro|이메일의 인증 링크를 누른 다음 아래에서 상태를 확인하세요. 이메일 인증은 재학 인증이 아닙니다.|Open the verification link in your email, then check the status below. This does not verify university enrollment.|请点击邮件中的验证链接，然后在下方检查状态。邮箱验证不代表学籍认证。|メールの認証リンクを開いた後、下で状態を確認してください。在学認証ではありません。
authSendVerification|인증 메일 다시 보내기|Resend verification email|重新发送验证邮件|認証メールを再送信
authCheckVerification|인증 상태 확인|Check verification status|检查验证状态|認証状態を確認
authVerificationSent|인증 메일을 보냈습니다. 받은편지함과 스팸함을 확인하세요.|Verification email sent. Check your inbox and spam folder.|验证邮件已发送，请查看收件箱和垃圾邮件。|認証メールを送信しました。迷惑メールもご確認ください。
authStillUnverified|아직 인증이 확인되지 않았습니다. 메일의 링크를 누른 후 다시 확인하세요.|Your email is not verified yet. Open the email link and check again.|尚未确认验证。请点击邮件链接后重试。|まだ認証を確認できません。メールのリンクを開いて再度確認してください。
authPreferences|계정 설정|Account preferences|账户设置|アカウント設定
authRoom|관심 국가 커뮤니티|Preferred country community|感兴趣的国家社区|関心のある国のコミュニティ
authGlobal|국가 선택 안 함|No country preference|不选择国家|国を指定しない
authRoomHint|커뮤니티가 열리면 사용할 기본 선택입니다. 국적이나 재학 여부를 확인하지 않습니다.|A preference for when communities open. It does not verify nationality or enrollment.|社区开放后将使用此偏好，不验证国籍或学籍。|コミュニティ公開後の初期設定です。国籍や在学状況の確認ではありません。
authSave|설정 저장|Save preferences|保存设置|設定を保存
authSaved|계정 설정을 저장했습니다.|Preferences saved.|设置已保存。|設定を保存しました。
authProfileMissing|계정 설정을 아직 저장하지 못했습니다. 아래에서 저장해 주세요.|Your preferences have not been saved yet. Save them below.|账户设置尚未保存，请在下方保存。|設定が未保存です。下で保存してください。
authProfileError|계정 설정을 불러오지 못했습니다. 다시 불러온 뒤 수정해 주세요.|Could not load your preferences. Reload them before editing.|无法加载账户设置，请重新加载后编辑。|設定を読み込めませんでした。再読み込み後に編集してください。
authReload|설정 다시 불러오기|Reload preferences|重新加载设置|設定を再読み込み
authLocalRecords|현재 저장 항목과 체크리스트는 이 브라우저에 보관됩니다. 계정 간 동기화는 아직 제공하지 않습니다.|Saved topics and checklists currently stay in this browser. Account sync is not available yet.|收藏和清单目前保存在本浏览器，尚不支持账户同步。|保存項目とチェックリストは現在このブラウザに保存されます。アカウント同期は未提供です。
authPrivacy|개인정보 처리 안내|Privacy information|个人信息处理说明|個人情報の取り扱い
authAcknowledge|비공식 서비스 및 개인정보 처리 안내를 확인했습니다.|I have read the independent service and privacy information.|我已阅读非官方服务及个人信息处理说明。|非公式サービスと個人情報の取り扱いを確認しました。
authBusy|처리 중…|Please wait…|处理中…|処理中…
authUnavailable|현재 계정 기능을 사용할 수 없습니다. 학교생활 안내는 계속 이용할 수 있습니다.|Accounts are currently unavailable. You can still use the student guide.|账户功能暂不可用，校园指南仍可使用。|現在アカウント機能は利用できません。学生ガイドは引き続き利用できます。
authMismatch|비밀번호 확인이 일치하지 않습니다.|The passwords do not match.|两次密码不一致。|パスワードが一致しません。
authReadPrivacy|개인정보 처리 안내를 확인해 주세요.|Please read and acknowledge the privacy information.|请阅读并确认个人信息处理说明。|個人情報の取り扱いをご確認ください。
authDelete|회원 탈퇴|Delete account|删除账户|退会
authDeleteIntro|비밀번호를 재확인한 후 계정 설정과 서버의 개인 저장 기록을 삭제합니다. 삭제를 시작하면 되돌릴 수 없습니다. 이 브라우저에 저장한 비회원 기록은 유지됩니다.|After confirming your password, your preferences and server-side personal records are deleted. Starting deletion cannot be undone. Guest records in this browser stay.|确认密码后，将删除账户设置和服务器上的个人记录。删除开始后不可撤销。本浏览器的访客记录保留。|パスワード確認後、設定とサーバー上の個人記録を削除します。開始後は取り消せません。このブラウザのゲスト記録は残ります。
authDeleteConfirm|삭제 안내를 확인했고 탈퇴를 진행하겠습니다.|I understand and want to delete my account.|我已了解并确认删除账户。|案内を確認し、退会します。
authDeleteAction|개인 데이터와 계정 삭제|Delete personal data and account|删除个人数据及账户|個人データとアカウントを削除
authCancel|취소|Cancel|取消|キャンセル
authDeleted|개인 데이터와 계정을 삭제했습니다. 이 브라우저의 비회원 저장 기록은 유지했습니다.|Your personal data and account were deleted. Guest records in this browser were kept.|个人数据和账户已删除，本浏览器的访客记录已保留。|個人データとアカウントを削除しました。このブラウザのゲスト記録は保持しました。
authDeletionPending|탈퇴가 진행 중입니다. 다른 설정은 변경할 수 없습니다. 비밀번호를 입력해 탈퇴를 다시 진행해 주세요.|Deletion is in progress. Other settings cannot be changed. Enter your password to retry deletion.|账户删除处理中，无法修改其他设置。请输入密码重试删除。|退会処理中です。他の設定は変更できません。パスワードを入力して再試行してください。
authDeleteFailure|탈퇴가 완료되지 않았습니다. 일부 개인 데이터가 이미 삭제됐을 수 있습니다. 같은 계정으로 다시 시도해 주세요.|Deletion did not finish. Some personal data may already be deleted. Retry with the same account.|删除尚未完成，部分个人数据可能已删除。请使用同一账户重试。|退会は完了していません。一部のデータは削除済みの場合があります。同じアカウントで再試行してください。
authErrorEmail|올바른 이메일 주소를 입력하세요.|Enter a valid email address.|请输入有效的邮箱地址。|有効なメールアドレスを入力してください。
authErrorCredentials|이메일 또는 비밀번호를 확인해 주세요.|Check your email and password.|请检查邮箱和密码。|メールアドレスとパスワードをご確認ください。
authErrorEmailUsed|가입을 진행할 수 없습니다. 기존 계정으로 로그인하거나 비밀번호를 재설정해 주세요.|Unable to register. Try logging in or resetting your password.|无法注册，请尝试登录或重置密码。|登録できません。ログインまたはパスワードの再設定をお試しください。
authErrorPassword|비밀번호는 8자 이상이며 서비스의 비밀번호 조건을 충족해야 합니다.|Use at least 8 characters and meet the service password requirements.|密码须至少8个字符并符合服务要求。|8文字以上で、サービスのパスワード条件を満たしてください。
authErrorRate|요청이 많습니다. 잠시 후 다시 시도해 주세요.|Too many requests. Please try again later.|请求过多，请稍后重试。|リクエストが多いため、しばらくしてからお試しください。
authErrorNetwork|연결을 확인한 뒤 다시 시도해 주세요.|Check your connection and try again.|请检查网络连接后重试。|接続を確認して再試行してください。
authErrorDisabled|현재 사용할 수 없는 계정입니다.|This account is currently unavailable.|此账户当前不可用。|現在このアカウントは利用できません。
authErrorRecent|로그인 상태를 확인할 수 없습니다. 다시 로그인한 뒤 시도해 주세요.|Please log in again and retry.|请重新登录后重试。|再度ログインしてお試しください。
authErrorUnavailable|인증 요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.|Authentication is unavailable. Please try again later.|认证暂不可用，请稍后重试。|認証を処理できません。しばらくしてからお試しください。
authErrorProtected|운영 또는 이용 제한 기록이 있는 계정은 일반 탈퇴로 삭제할 수 없습니다.|Accounts with administration or moderation records need a separate deletion process.|有管理或使用限制记录的账户需单独处理删除。|運営・利用制限の記録があるアカウントは別途削除手続きが必要です。
authErrorPermission|계정 데이터를 처리할 권한이 없습니다. 다시 로그인하거나 잠시 후 시도해 주세요.|Account data access was denied. Log in again or retry later.|无权处理账户数据，请重新登录或稍后重试。|アカウントデータにアクセスできません。再ログインまたは後で再試行してください。
authErrorGeneric|요청을 완료하지 못했습니다. 다시 시도해 주세요.|Could not complete the request. Please try again.|请求未完成，请重试。|処理を完了できませんでした。再試行してください。
privacyIntro|KU Bridge는 건국대학교와 별개로 운영하는 학생용 서비스입니다. 계정은 선택 사항이며 학교생활 안내는 가입 없이 이용할 수 있습니다.|KU Bridge is an independent student service. Accounts are optional; the student guide is available without registration.|KU Bridge是独立于建国大学的学生服务。账户为可选，校园指南无需注册。|KU Bridgeは大学とは別の学生向けサービスです。登録は任意で、ガイドは登録なしで利用できます。
privacyDataTitle|저장하는 정보|Information we store|保存的信息|保存する情報
privacyData|이메일과 인증 정보는 Firebase Authentication에서 처리합니다. 계정 설정에는 언어, 학생 유형, 관심 커뮤니티와 생성·수정 시각만 저장합니다. 실명·학번·재학 서류는 받지 않습니다.|Firebase Authentication handles email and credentials. Account preferences contain language, student type, preferred community and timestamps. We do not collect names, student IDs or enrollment documents.|Firebase Authentication处理邮箱和认证信息。账户设置仅保存语言、学生类型、社区偏好及时间。不收集姓名、学号或在学材料。|メールと認証情報はFirebase Authenticationが処理します。設定には言語・学生区分・関心コミュニティ・日時を保存します。氏名・学籍番号・在学書類は収集しません。
privacyUseTitle|이용 목적과 보관|Purpose and retention|用途与保存|利用目的と保管
privacyUse|로그인과 개인 설정 제공을 위해 계정이 유지되는 동안 보관합니다. 이메일은 다른 이용자에게 공개하지 않습니다. 이메일 인증은 이메일 소유 확인이며 재학·국적 인증이 아닙니다.|We retain account information while the account exists to provide login and preferences. Email is not public. Email verification confirms access to an email address, not enrollment or nationality.|账户存在期间，为登录和个人设置保留信息。邮箱不向其他用户公开。邮箱验证不代表学籍或国籍认证。|ログインと設定の提供のため、アカウント存続中に保管します。メールは他の利用者に公開しません。メール認証は在学・国籍認証ではありません。
privacyDeleteTitle|탈퇴와 삭제|Deletion|退会与删除|退会と削除
privacyDelete|내 계정에서 비밀번호 확인 후 계정과 서버의 개인 데이터를 삭제할 수 있습니다. 다른 탭의 재기록을 막기 위해 내부 계정 식별자와 삭제 요청 시각만 담은 비공개 삭제 처리 기록은 별도 보관합니다. 삭제 실패 시 같은 계정으로 재시도할 수 있습니다.|Delete your account and server-side personal data from My account after confirming your password. A private deletion record with only the internal account ID and request time is retained to prevent stale sessions from recreating data. Failed deletion can be retried.|可在我的账户中确认密码后删除账户及服务器上的个人数据。为防止旧会话重新写入，仅保留含内部账户ID及请求时间的私有删除记录。删除失败可重试。|アカウント画面でパスワード確認後、アカウントとサーバー上の個人データを削除できます。古いセッションからの再作成を防ぐため、内部IDと依頼日時のみの非公開削除記録を別途保管します。失敗時は再試行できます。
privacyLocalTitle|이 브라우저의 기록|Records in this browser|本浏览器的记录|このブラウザの記録
privacyLocal|언어·검색 설정·저장 항목·체크리스트 중 브라우저에 저장한 기록은 회원 탈퇴로 지워지지 않습니다. 이 기기의 사이트 데이터를 삭제하면 제거할 수 있습니다. 계정 동기화와 공개 커뮤니티 기능은 아직 제공하지 않습니다.|Locally stored preferences, saved topics and checklists are not erased by account deletion. Clear this site's browser data to remove them. Account sync and public communities are not available yet.|删除账户不会清除本地偏好、收藏及清单，可通过清除此网站的浏览器数据移除。账户同步及公开社区尚未开放。|ブラウザに保存した設定・保存項目・チェックリストは退会しても消えません。このサイトのブラウザデータを消去すると削除できます。同期と公開コミュニティは未提供です。`;
const copy = { ko: {}, en: {}, zh: {}, ja: {} };
for (const row of rows.split("\n")) {
  const [key, ...values] = row.split("|");
  ["ko", "en", "zh", "ja"].forEach((locale, index) => {
    copy[locale][key] = values[index];
  });
}
export default copy;
