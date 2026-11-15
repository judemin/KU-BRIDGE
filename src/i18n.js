import authCopy from "./authCopy.js";
import communityCopy from "./communityCopy.js";
import interfaceCopy from "./interfaceCopy.js";
// Locale dictionary. Translations are informational, not official university translations.
const rows = `brand|건국대 유학생 생활 안내|Konkuk international student guide|建国大学留学生指南|建国大学 留学生ガイド
subbrand|건국대학교 서울캠퍼스 독립 안내 서비스|Independent guide for Konkuk University Seoul Campus|建国大学首尔校区独立信息指南|建国大学ソウルキャンパス非公式ガイド
navHome|홈|Home|首页|ホーム
navExplore|학교생활 안내|Student guide|校园指南|学生生活ガイド
navHelp|문의처 찾기|Contact offices|咨询部门|問い合わせ先
navChecklist|나의 체크리스트|My checklist|我的清单|チェックリスト
navSaved|저장한 항목|Saved|已收藏|保存済み
locale|언어|Language|语言|言語
heroEyebrow|KONKUK UNIVERSITY  /  SEOUL CAMPUS|KONKUK UNIVERSITY  /  SEOUL CAMPUS|建国大学  /  首尔校区|建国大学  /  ソウルキャンパス
heroTitle|건국대 생활, 필요한 정보부터.|A practical guide to life at Konkuk.|在建国大学，从这里了解校园生活。|建国大学の学生生活に、必要な情報を。
heroDesc|수강신청, 장학금, 비자, 졸업 준비. 여러 곳에 흩어진 학교 안내와 문의처를 한곳에서 찾아보세요.|Find university information and the right office for course registration, scholarships, visas and graduation.|选课、奖学金、签证、毕业准备。在这里查找学校信息和咨询部门。|履修登録、奨学金、ビザ、卒業準備。大学の案内と問い合わせ先をまとめました。
heroPrimary|내 상황으로 찾기|Find help for my situation|按我的情况查找|悩みから探す
heroSecondary|모든 안내 보기|Browse all topics|查看全部指南|すべての案内を見る
statsTopics|탐색 주제|Topics|导航主题|案内テーマ
statsLanguages|지원 언어|Languages|支持语言|対応言語
statsSources|공식 자료 연결|Official references|官方资料入口|公式資料リンク
notice|건국대 학생을 위한 비공식 안내입니다. 신청 기간과 세부 조건은 연결된 학교 공지를 확인해 주세요.|An independent student guide. Check the linked university notices for current dates and requirements.|本网站为非官方学生指南。申请时间和具体要求请查看链接中的学校公告。|学生向けの非公式ガイドです。申請期間や詳しい条件は、リンク先の大学のお知らせをご確認ください。
sectionIssues|어떤 정보가 필요한가요?|What are you looking for?|你需要哪方面的信息？|何を調べたいですか？
sectionIssuesDesc|궁금한 내용을 선택하면 관련 안내로 이동합니다.|Choose a topic to see the relevant information.|选择主题，查看相关信息。|項目を選ぶと、関連する案内を確認できます。
sectionExplore|학교생활 안내|Student guide|校园生活指南|学生生活ガイド
sectionExploreDesc|학생 유형과 분야별로 학교 안내를 찾아보세요.|Browse university information by student type and category.|按学生类型和类别查找学校信息。|学生区分や分野で大学の案内を探せます。
studentType|학생 유형|Student type|学生类型|学生区分
cat|분야|Category|类别|カテゴリ
searchPlaceholder|장학금, 졸업, 비자, 수업 등 검색|Search scholarships, graduation, visas, classes…|搜索奖学金、毕业、签证、选课等|奨学金・卒業・ビザ・授業などを検索
all|전체|All|全部|すべて
u|학부 학위과정|Undergraduate degree|本科生|学部正規課程
g|대학원 학위과정|Graduate degree|研究生|大学院正規課程
e|교환 / 방문학생|Exchange / visiting|交换 / 访问生|交換・ビジティング学生
l|어학연수생|Language program|语言研修生|語学研修生
academics|수업 / 학업|Classes & academics|课程与学业|授業・学修
administration|학사 / 행정|Academic administration|教务与行政|学務・手続き
funding|장학 / 등록금|Scholarships & fees|奖学金与学费|奨学金・学費
living|비자 / 생활|Visa & daily life|签证与生活|ビザ・生活
community|친구 / 교류|Community & friends|交友与交流|友人・交流
career|진로 / 취업|Career|职业与就业|進路・就職
openSource|공식 원문 열기|Open official reference|查看官方原文|公式資料を開く
details|자세히 보기|View details|查看详情|詳しく見る
save|저장|Save|收藏|保存
saved|저장됨|Saved|已收藏|保存済み
noResult|조건에 맞는 항목이 없습니다. 검색어 또는 필터를 변경해 보세요.|No matching topics. Try changing your search or filters.|没有符合条件的内容，请调整搜索或筛选。|該当する項目がありません。検索条件を変えてください。
showing|개 안내|topics|项内容|件の案内
stage|관련 시점|When to check|适用阶段|確認時期
before|입학 전|Before admission|入学前|入学前
arrival|입국 / 적응|Arrival|入境与适应|渡韓・生活開始
enrolled|재학 중|During studies|在学期间|在学中
graduating|졸업 준비|Preparing to graduate|毕业准备|卒業準備
source|연결 자료|Reference|参考资料|参照資料
sourceKind|자료 성격|Information type|资料类型|資料区分
direct|관련 내용 확인|Topic mentioned in source|来源提及该主题|資料内に関連記載あり
path|공식 안내 경로|Official information path|官方信息入口|公式情報への案内
historical|과거 모집 사례|Historical notice|往期公告|過去の募集案内
verifyAlert|이 화면은 지원 자격이나 현재 모집 여부를 확정하지 않습니다. 최신 공식 공지를 확인하세요.|This page does not confirm your eligibility or current application availability. Check the latest official notices.|本页不确认个人资格或当前报名状态，请核对最新官方公告。|申請資格や現在の募集状況を確定するものではありません。最新の公式情報をご確認ください。
askTitle|문의처 찾기|Find a contact office|查找咨询部门|問い合わせ先を探す
askDesc|학생 유형과 문의 내용을 선택하면 참고할 부서와 문의 문안을 안내합니다. 문의는 해당 부서에 직접 보내 주세요. 이 사이트는 접수 / 전달 / 행정 처리를 하지 않습니다.|Choose your student type and topic to find an office and sample message. Contact the office directly; this site does not accept, forward or process requests.|选择学生类型和咨询主题，查看咨询部门及邮件示例。请直接联系相关部门，本站不受理、转交或代办手续。|学生区分と相談内容を選ぶと、窓口と文面の例を確認できます。連絡は各窓口へ直接お願いします。本サイトでは受付・転送・手続きの代行は行いません。
askTopic|문의 내용|Question topic|咨询主题|相談内容
askGo|문의 경로 확인|Show contact route|查看咨询路径|問い合わせ先を見る
askPrimary|우선 문의처|Suggested first contact|建议首先联系|最初の相談先
askSecondary|추가 확인 경로|If unresolved|未解决时的查询途径|解決しない場合
askPrep|문의 전 준비할 내용|Prepare before contacting|咨询前准备|問い合わせ前の準備
askTemplate|문의 문안 예시|Sample inquiry text|咨询邮件示例|問い合わせ文の例
copy|문안 복사|Copy text|复制文本|文面をコピー
copied|복사됨|Copied|已复制|コピー済み
askGrad|졸업 / 학점|Graduation & credits|毕业与学分|卒業・単位
askVisa|비자 / 체류|Visa & stay|签证与居留|ビザ・在留
askFunding|장학 / 등록금|Scholarships & fees|奖学金与学费|奨学金・学費
askClasses|수업 / 성적|Classes & grades|课程与成绩|授業・成績
askHousing|기숙사 / 생활|Dorm & housing|宿舍与生活|寮・住居
askExchange|교환 / 방문학생|Exchange / visiting|交换 / 访问生|交換・ビジティング
askOther|기타 문의|Something else|其他问题|その他
askDepartment|소속 학과 사무실 (학과별 담당 확인)|Your department office (verify locally)|所属院系办公室（需确认）|所属学科事務室（要確認）
askCiss|국제처 외국인학생센터|International Student Center|国际处外国留学生中心|国際処 外国人学生センター
askOia|국제처 국제교류 프로그램 담당|Office of International Affairs – International Programs|国际处国际交流项目办公室|国際交流プログラム担当
askWein|WE人 / eCampus 프로그램 공지|WE人 / eCampus notices|WE人 / eCampus公告|WE人 / eCampusのお知らせ
askDorm|쿨하우스 기숙사 안내|KU:L House dormitory|KU:L House宿舍|KU:L House学生寮
askMain|건국대학교 학교 공식 안내|University official information|建国大学官方信息|大学公式案内
askGenericPrep|학적 유형, 학과, 학번(실제 문의 시에만), 상황 설명, 관련 공지 링크와 문의 이력을 정리하세요.|Prepare your student type, department, student ID (only when contacting staff), issue description, official notice link and previous inquiry history.|准备学生类型、院系、学号（仅与校方联系时）、问题说明、公告链接和既往咨询记录。|学生区分・学科・学籍番号（実際の連絡時のみ）・状況・公式リンク・問い合わせ履歴を整理します。
askTemplateText|안녕하세요. 저는 건국대학교 외국인 유학생입니다. [학생 유형/학과] 소속이며 [문의 주제]에 대해 확인하고 싶습니다. 담당 부서와 필요한 절차를 안내해 주시면 감사하겠습니다.|Hello, I am an international student at Konkuk University ([student type / department]). I would like to ask about [topic]. Could you please confirm the responsible office and the next steps? Thank you.|您好，我是建国大学的留学生（[学生类型/院系]）。想咨询[主题]，烦请告知负责部门和所需手续。谢谢。|こんにちは。建国大学の留学生（[学生区分・学科]）です。[相談内容]について、担当部署と必要な手続きを教えていただけますでしょうか。よろしくお願いいたします。
checkTitle|졸업 / 학사 준비 체크리스트|Graduation & academic checklist|毕业与学业准备清单|卒業・学修チェックリスト
checkDesc|개인 점검용입니다. 체크 완료가 실제 학교의 졸업 사정을 의미하지는 않습니다.|Personal planning only. Completion does not mean you have officially met graduation requirements.|仅供个人管理，勾选并不代表学校已确认毕业资格。|個人の確認用です。チェック完了は大学の卒業認定を意味しません。
checkProgress|완료|completed|已完成|完了
checkReset|내 체크 초기화|Reset my checklist|重置我的清单|チェックをリセット
checkOfficial|졸업요건은 소속 학과와 최신 대학 규정으로 반드시 확인해야 합니다.|Always confirm requirements with your department and current university regulations.|毕业要求务必向所属院系和学校最新规定核实。|卒業要件は所属学科と最新の大学規程で必ず確認してください。
checkC1|소속 학과의 졸업기준 확인|Review departmental graduation rules|确认院系毕业要求|学科の卒業要件を確認
checkC2|교양 및 전공 이수요건 점검|Review general/major credit requirements|核查通识及专业学分要求|教養・専攻単位要件を確認
checkC3|이수학점과 성적 확인|Review earned credits and grades|核对已修学分及成绩|単位・成績を確認
checkC4|TOPIK 및 언어 요건 적용 여부 확인|Check applicable language/TOPIK rules|确认TOPIK及语言要求是否适用|TOPIK・語学要件の適用を確認
checkC5|미이수 필수과목 확인|Identify missing required courses|确认未修必修课|未修得の必修科目を確認
checkC6|학과 행정실에 졸업사정 문의|Ask department about graduation review|向院系办公室咨询毕业审核|学科事務室に卒業審査を相談
checkC7|최종 졸업 신청 / 서류 / 기한 확인|Verify final forms, deadlines and graduation status|核对毕业申请材料和期限|卒業申請・書類・期限を確認
checkG1|지도교수 / 학과 졸업규정 상담|Discuss degree rules with advisor/department|咨询导师及院系学位要求|指導教員・学科に学位要件を相談
checkG2|이수학점 및 성적 확인|Review credit and grade requirements|核对学分与成绩要求|単位・成績要件を確認
checkG3|종합시험 / 외국어시험 해당 여부 확인|Check examination requirements|确认综合考试与外语考试要求|総合試験・語学試験の要否を確認
checkG4|논문/연구보고서 및 심사 일정 확인|Review thesis/project and examination timeline|核对论文与答辩安排|論文・審査日程を確認
checkG5|졸업 / 수료 요건 최종 확인|Confirm graduation vs. completion status|最终确认毕业或修了条件|卒業・修了条件を最終確認
checkE1|소속 대학 / 건국대 학점인정 기준 확인|Check home/host university credit transfer rules|核对双方学校学分认定规定|所属大学と建国大の単位認定規則を確認
checkE2|수강신청 및 강의계획서 확인|Confirm registration and syllabi|确认选课及教学大纲|履修登録とシラバスを確認
checkE3|성적표 및 종료 서류 확인|Review transcript and departure documents|核对成绩单与离校材料|成績証明書・帰国書類を確認
checkL1|어학과정의 출석 / 수료 기준 확인|Check language program attendance rules|确认语言课程出勤与结业标准|語学課程の出席・修了基準を確認
checkL2|체류 상태와 다음 과정 계획 점검|Review stay status and next study plans|核对居留状态及后续学习计划|在留資格と次の進路を確認
trustTitle|학교 공지를 확인할 때|Reading university notices|查看学校公告时|大学のお知らせを確認するとき
trustDesc|안내마다 공식 자료 링크와 자료 유형을 표시했습니다. 과거 모집 공지는 참고용이며, 현재 신청 일정은 해당 부서의 최신 공지를 확인해 주세요.|Each topic includes its university reference and information type. Past notices are for reference; check with the office for current application dates.|每个主题均附有学校资料链接及类型。往期公告仅供参考，当前申请时间请查看相关部门的最新公告。|各項目に大学の資料リンクと種類を記載しています。過去の募集は参考用です。現在の日程は担当部署の最新情報をご確認ください。
footer|건국대학교와 독립된 학생용 안내입니다. 학사 / 행정 업무를 접수하거나 대행하지 않습니다.|An independent student guide. We do not accept or process university administrative requests.|本网站为独立学生指南，不受理或代办学校教务及行政手续。|大学とは独立した学生向けガイドです。学務・行政手続きの受付や代行は行いません。
viewAll|모든 자료로 이동|Browse all topics|浏览所有主题|すべてを見る
close|닫기|Close|关闭|閉じる
clear|검색 초기화|Clear search|清除搜索|検索をクリア
menu|메뉴 열기|Open menu|打开菜单|メニューを開く
issueClass|수업 / 학습 지원|Classes & study support|课程与学习支持|授業・学修支援
issueFriends|친구 / 학생 교류|Friends & student exchange|交友与学生交流|友人・学生交流
issueAdmin|행정 문의|Administrative questions|教务与行政咨询|学務・手続きの相談
issueGraduation|졸업 준비|Preparing to graduate|毕业准备|卒業準備
issueMoney|장학금 / 주거 지원|Scholarships & housing|奖学金与住宿|奨学金・住まい
issueClassDesc|글쓰기, 학습 지원 및 강의 정보를 찾아보세요.|Explore writing, study support and course information.|查找写作、学习支持及课程信息。|文章指導、学修支援、授業情報を探せます。
issueFriendsDesc|학생 교류, Buddy 및 한국어 프로그램을 살펴보세요.|Discover student connections, buddies and language support.|探索同学交流、学伴和语言项目。|交流、Buddy、韓国語プログラムを探せます。
issueAdminDesc|학생 유형에 따라 문의 시작점을 안내합니다.|Find the suggested starting office for your situation.|按学生类型查找咨询入口。|学生区分に応じた相談先を探せます。
issueGraduationDesc|학과별 확인사항을 체크리스트로 정리해 보세요.|Organize requirements with your personal checklist.|用个人清单整理毕业要求。|チェックリストで必要事項を整理します。
issueMoneyDesc|장학규정, 외국인 장학 공지와 기숙사 정보를 확인하세요.|Check scholarship rules, student notices and housing.|查看奖学金规定、公告及住宿信息。|奨学金規程と住まいの情報を確認できます。
localNotice|저장 정보는 이 브라우저에만 보관합니다.|Your saved items stay in this browser only.|收藏和勾选信息仅保存在本浏览器。|保存情報はこのブラウザ内にのみ残ります。
askLanguageSchool|언어교육원 / 어학과정 담당|Language Institute / program office|语言教育院 / 课程负责部门|語学教育機関・課程担当
detailAbout|무엇을 안내하나요?|What this covers|项目说明|この案内について
detailNext|지금 할 일|Recommended next step|建议下一步|次に確認すること
detailAudience|관련 대상|Relevant students|相关学生|対象学生
detailEvidence|확인한 근거|Evidence and status|资料依据|根拠と状況
search|검색|Search|搜索|検索
quickTopics|자주 찾는 정보|Quick links|常用信息|よく使う情報
quickGuide|바로 가기|Where to start|快捷入口|クイックアクセス
quickExploreDesc|수업부터 생활까지, 분야별 안내|Information for classes and daily life|课程及日常生活信息|授業から暮らしまで、分野別の案内
quickHelpDesc|내 질문을 담당하는 학교 부서|The university office for your question|找到负责你问题的学校部门|相談内容に合う大学の窓口
quickCheckDesc|학점 / 서류 / 졸업요건 확인|Keep track of credits and requirements|核对学分、材料及毕业要求|単位・書類・卒業要件を確認
savedDesc|저장한 안내를 다시 확인하세요. 이 브라우저에 보관됩니다.|Revisit your saved topics. They are stored in this browser.|查看收藏的信息。收藏保存在本浏览器。|保存した案内を確認できます。このブラウザに保存されます。
copyFailed|자동 복사를 사용할 수 없습니다. 위 문안을 선택해 복사해 주세요.|Copy is unavailable. Select and copy the message above.|无法自动复制，请选择上方文字并复制。|自動コピーできません。上の文面を選択してコピーしてください。
skipContent|본문으로 이동|Skip to content|跳至正文|本文へ移動
loading|화면을 불러오는 중입니다.|Loading this page…|正在加载页面。|ページを読み込んでいます。
notFoundTitle|페이지를 찾을 수 없습니다.|Page not found|找不到页面。|ページが見つかりません。
notFoundDesc|주소를 확인하거나 홈에서 필요한 안내를 찾아보세요.|Check the address or return home to find the information you need.|请检查网址，或返回首页查找所需信息。|アドレスをご確認いただくか、ホームから案内をお探しください。
errorTitle|화면을 불러오지 못했습니다.|This page could not be loaded|页面加载失败。|ページを読み込めませんでした。
errorDesc|다시 시도하거나 홈으로 이동해 주세요. 저장한 기록은 초기화하지 않습니다.|Try again or return home. Your saved records will be kept.|请重试或返回首页，已保存的记录不会被重置。|再試行するかホームへ移動してください。保存した記録は削除されません。
retry|다시 시도|Try again|重试|再試行
`;
const translations = { ko: {}, en: {}, zh: {}, ja: {} };
for (const line of rows.trim().split("\n")) {
  const [key, ko, en, zh, ja] = line.split("|");
  translations.ko[key] = ko;
  translations.en[key] = en;
  translations.zh[key] = zh;
  translations.ja[key] = ja;
}
for (const locale of Object.keys(translations))
  Object.assign(
    translations[locale],
    authCopy[locale],
    communityCopy[locale],
    interfaceCopy[locale],
  );
export default translations;
