// KU Bridge independently authored content. Discovery summaries, not official translations.
// Data line format: id | ko | en | zh-Hans | ja. Every entry has an individual
// summary and an individual next action in all four languages.
const summaries = String.raw`
undergradApply|외국인특별전형으로 학부에 지원할 때 모집 시기, 학과, 제출 자격을 확인하는 안내입니다.|Check entry terms, departments and eligibility for the international undergraduate admission track.|查询外国人本科特别招生的学期、院系和申请条件。|外国人向け学部入試の募集時期、学科、出願資格を確認する案内です。
gradApply|대학원 외국인전형의 지원 자격과 전공별 모집 절차를 살펴봅니다.|Review admission procedures and department-level conditions for international graduate applicants.|了解研究生留学生招生流程及各专业要求。|外国人大学院入試の条件と専攻ごとの募集手続きを確認します。
documents|지원 과정에서 학력 증명, 번역, 공증 또는 아포스티유 등이 필요한지 확인합니다.|Find which academic documents, translations, notarization or apostilles may be needed.|确认学历证明、翻译、公证或海牙认证等材料要求。|学歴書類、翻訳、公証、アポスティーユ等の要否を確認します。
languageReq|전형과 학과에 따라 TOPIK, 영어성적 또는 별도 언어 기준이 달라질 수 있습니다.|Language evidence such as TOPIK or English tests depends on the admission track and department.|不同招生类别及院系对TOPIK、英语成绩等语言证明的要求可能不同。|TOPIKや英語成績等の語学要件は入試区分や学科で異なります。
admissionResult|합격 여부, 등록 안내, 추가 서류 요청을 공식 입학 공지에서 확인합니다.|Check official admissions notices for decisions, enrolment instructions and extra documents.|在官方招生公告中确认录取结果、注册安排和补充材料。|合否、登録案内、追加書類の依頼を公式入試情報で確認します。
tuitionFirst|첫 학기 등록금은 합격자 안내의 납부 기한과 방법을 기준으로 준비해야 합니다.|Your first tuition payment follows the deadline and method specified in the offer instructions.|首学期学费应按录取通知中的缴费期限与方式办理。|初回学費は合格者案内の期限と方法に従って納入します。
certificateAdmission|비자 신청에 필요한 입학 관련 문서는 학교에서 안내하는 발급 절차를 확인하세요.|For visa paperwork, verify how the university issues its admission documentation.|办理签证前确认学校入学许可文件的签发手续。|ビザ申請用の入学書類について大学の発行手順を確認します。
visa|학적 형태와 국적에 따라 필요한 체류 자격, 연장 및 신고 사항이 다릅니다.|Visa categories, extensions and reporting obligations differ by nationality and enrolment type.|签证类别、延期与申报义务因国籍和学籍类型而异。|在留資格、延長、届出事項は国籍や在学形態によって異なります。
alien|한국에 장기 체류하는 학생에게 외국인등록 및 체류지 신고 절차가 적용될 수 있습니다.|Foreign resident registration and residence reporting may apply to longer stays in Korea.|长期在韩国居留时可能需要办理外国人登录及居住地申报。|長期滞在者には外国人登録や居住地の届出が必要な場合があります。
address|이사 등으로 거주지가 바뀌면 관련 법령상 신고 기한을 확인해야 합니다.|Moving to a new address may trigger an immigration reporting deadline.|搬家后可能需要按法定期限申报地址变更。|転居した場合は法令上の住所変更届の期限を確認してください。
insurance|체류 자격과 체류기간에 따라 국민건강보험 적용 여부와 절차를 확인합니다.|Review national health insurance participation by visa status and duration of stay.|按签证类别和居留期限核对韩国国民健康保险手续。|在留資格や滞在期間に応じて健康保険の扱いを確認します。
emergency|건강, 안전 또는 긴급 상황에 대비해 학교와 지역 긴급 연락 경로를 확인합니다.|Know which campus and public emergency channels to use in health or safety situations.|提前了解校园及公共紧急求助渠道。|健康や安全の緊急時に利用する大学・公共の連絡先を確認します。
dormApply|쿨하우스 입사 가능 대상, 신청기간, 비용과 선발 절차를 확인합니다.|Review KU:L House residence eligibility, application windows, fees and selection.|核对KU:L House宿舍申请资格、时间、费用及选拔流程。|KU:L Houseの入寮対象、募集時期、費用、選考を確認します。
dormRules|기숙사 입사 이후 적용되는 시설 이용, 출입 및 생활 규정을 확인하세요.|Read the residence rules for facilities, access and daily life after move-in.|入住宿舍后应了解设施使用、出入及生活守则。|入寮後の施設利用、出入り、生活規則を確認してください。
campusMap|수업 건물, 학사 지원 시설 및 캠퍼스 동선을 파악하는 데 도움이 되는 안내입니다.|Locate teaching buildings, student services and key campus facilities.|了解教学楼、学生服务设施和校园路线。|授業棟、学生窓口、キャンパス施設の位置を調べます。
course|수강신청은 학위과정, 학기별 학사일정 및 소속 학과 규칙에 따라 달라집니다.|Registration procedures and restrictions depend on degree track, calendar and department.|选课流程受学位类型、学期日程和院系规定影响。|履修登録は課程、学事暦、学科の規則によって異なります。
ecampus|eCampus에서 수업 공지, 과제 및 온라인 학습 활동을 확인할 수 있습니다.|eCampus is a starting point for course notices, assignments and online learning.|可在eCampus查看课程公告、作业及线上学习活动。|eCampusでは授業のお知らせ、課題、オンライン学修を確認できます。
syllabus|수업 방식과 평가 기준을 이해하려면 강의계획서를 미리 확인하세요.|Read syllabi to understand learning objectives, teaching language and assessment.|提前阅读教学大纲，了解课程目标、授课语言和评分方法。|シラバスで授業内容、使用言語、評価方法を確認します。
englishCourses|영어 강의는 개설 학기와 수강제한이 달라질 수 있어 강의별 확인이 필요합니다.|English-taught offerings and enrolment restrictions may vary by semester.|英语授课课程及选课限制可能因学期变化。|英語開講科目と履修制限は学期によって変わる場合があります。
credits|총 취득학점뿐 아니라 필수 교양, 전공 및 졸업 세부 기준을 따로 점검합니다.|Review both total earned credits and required major or general-education components.|不仅核对总学分，还应检查专业及通识必修要求。|総修得単位に加えて教養・専攻の必修条件を確認します。
grades|성적 확인과 정정은 정해진 일정과 담당 교과목 안내에 따라 진행합니다.|Grade viewing and correction follow scheduled periods and instructor procedures.|成绩查询与更正需遵循规定时间及授课教师的程序。|成績照会・訂正は指定期間と担当教員の手順に従います。
leave|휴학이나 복학 시 학적, 등록금, 체류 자격에 미치는 영향을 모두 확인하세요.|Taking leave or returning can affect status, tuition and immigration permissions.|休学或复学可能影响学籍、学费及居留资格。|休学・復学は学籍、学費、在留資格にも関わるため事前確認が必要です。
academicWarning|성적 부진 또는 학사경고를 받은 경우 개별 학습 지원과 학과 상담을 찾아보세요.|If facing academic probation, seek academic advice and check available study-support programs.|面临学业警告时，可咨询院系并查看学习辅导项目。|学業不振や警告時は学科相談と学修支援を調べましょう。
writingClinic|과거 유학생 대상 글쓰기 첨삭 프로그램이 안내된 사례가 있습니다. 상시 운영 여부는 별도 확인이 필요합니다.|A writing-support program for international students was advertised previously; current availability is unconfirmed.|校方曾发布留学生写作辅导项目；目前是否开放需另行确认。|留学生向け文章添削の過去案内があります。現在の受付は未確認です。
studyMentor|학업 멘토링 모집 사례가 있지만 모든 유학생이 자동으로 신청 가능한 것은 아닙니다.|Academic mentoring has been advertised, but eligibility is program-specific.|学校曾招募学业辅导项目，但申请资格因项目而异。|学修メンタリングの募集例がありますが、参加資格はプログラムごとに異なります。
studyCommunity|함께 공부하는 비교과 학습공동체 프로그램을 공지에서 찾아볼 수 있습니다.|Look for peer learning or study-community notices in the learning platform.|可在学习平台公告中查找学习共同体项目。|学修コミュニティや共同学習プログラムをお知らせから探せます。
wein|WE人은 교내 비교과 활동을 탐색할 수 있는 경로입니다. 개별 프로그램의 대상을 확인하세요.|WE人 provides a route to extracurricular opportunities; check each program's criteria.|WE人平台提供课外活动信息，需逐项核对参加条件。|WE人から課外プログラムを探せます。各募集の参加資格を確認します。
topik|TOPIK 관련 공지와 언어 기준은 입학, 장학 또는 졸업에서 각각 다르게 적용될 수 있습니다.|TOPIK rules may differ for admission, scholarships and graduation.|TOPIK要求在入学、奖学金及毕业环节可能不同。|TOPIKの条件は入試、奨学金、卒業で異なる場合があります。
koreanHelper|어학연수생의 한국어 학습과 캠퍼스 적응을 돕는 헬퍼 활동 안내입니다.|Explore helper activities supporting language students with Korean learning and campus adjustment.|了解面向语言研修生的韩语学习和校园适应帮助项目。|語学研修生の韓国語学習や大学生活への適応を支援するヘルパー案内です。
exchangeProg|건국대학교 교환학생의 파견·수학 조건과 국제처 안내를 확인합니다.|Check the exchange program's eligibility, nominated-student process and office guidance.|核对交换项目资格、提名流程及国际处安排。|交換留学制度の資格、推薦手続き、国際交流担当の案内を確認します。
visitingProg|교환학생과 방문학생의 등록 절차와 비용 등은 서로 다를 수 있습니다.|Visiting students may follow procedures and fees different from exchange students.|访问生与交换生的入学程序和费用可能不同。|ビジティング学生は交換留学生とは手続きや費用が異なる場合があります。
exchangeCourses|교환·방문학생의 수강 가능 과목과 신청 일정은 국제처 가이드로 확인하세요.|Use OIA guidance to check available courses and registration rules for visiting students.|通过国际处指南查看交换及访问生选课范围和时间。|交換・ビジティング学生の履修対象と日程を国際交流案内で確認します。
isv|교환·방문학생의 초기 적응을 돕는 국제학생 도우미 활동을 확인합니다.|Student volunteers may help exchange and visiting students settle in.|国际学生志愿者可协助交换及访问生适应校园生活。|交換・ビジティング学生の適応を助ける学生ボランティア案内です。
ibuddy|i-Buddy는 국제교류 관련 교류 기회를 소개하는 프로그램입니다.|i-Buddy introduces social connection opportunities for eligible international participants.|i-Buddy为符合条件的国际学生提供交流机会。|i-Buddyは対象となる留学生の交流機会を紹介します。
cultural|문화교류 행사는 학기마다 달라지며 참여 조건을 확인해야 합니다.|Cultural events vary by term; always confirm registration and eligibility.|文化交流活动每学期可能变化，请核实报名与参加条件。|文化交流イベントは学期ごとに変わり、参加条件の確認が必要です。
exchangeFaq|교환·방문학생이 자주 묻는 학사와 생활 질문의 기본 안내 경로입니다.|Find frequently asked questions about exchange or visiting student procedures.|查阅交换及访问生有关学业与生活的常见问题。|交換・ビジティング学生の学務・生活のよくある質問を探します。
gradChecklist|학과별 이수 학점, 전공 요건, 어학 조건 등 졸업 전 확인 항목을 정리합니다.|Prepare a graduation review covering department rules, credits and language criteria.|整理毕业前需要核查的院系规定、学分和语言要求。|学科の規則、修得単位、語学条件など卒業前の確認項目を整理します。
department|졸업 사정과 미이수 과목 등 학과 고유 기준은 소속 학과 사무실에 확인하세요.|Your department is an important contact for degree-specific graduation questions.|涉及院系毕业审核及未修课程时，应联系所属院系办公室。|卒業判定や未修得科目など学科固有の要件は所属学科事務室に確認します。
thesis|대학원 학위 취득에 논문, 학위시험 또는 심사가 필요한지 과정별로 확인하세요.|Graduate degree requirements may include a thesis, comprehensive exam or review.|研究生学位可能要求论文、综合考试或答辩，需按专业确认。|大学院の学位に論文、試験、審査などが必要か課程別に確認します。
gksScholarship|정부초청장학생(GKS)의 학사 관리와 지원 기준은 별도 안내가 적용될 수 있습니다.|Government Scholarship (GKS) recipients may have separate academic and funding conditions.|政府邀请奖学金（GKS）学生可能适用专门的学业及资助规定。|政府招請奨学金（GKS）には独自の学務・支援条件がある場合があります。
intlScholarship|외국인특별전형 장학 기준은 입학 연도, 성적 및 규정 개정에 따라 달라질 수 있습니다.|International scholarship criteria can change by entry year, grades and policy revision.|外国留学生奖学金标准可能随入学年份、成绩和制度修订而变化。|外国人向け奨学金の基準は入学年度、成績、規程改定で変わります。
scholarshipChanges|장학 규정이 개정될 수 있으므로 과거 금액과 현재 적용 기준을 구분해야 합니다.|Scholarship rules may be revised. Do not treat past amounts as current entitlements.|奖学金规定可能修订，请勿把往年金额当作当前待遇。|奨学金規程は改正されます。過去の金額を現在の権利とみなさないでください。
tuitionSupport|등록금 납부, 장학금 신청, 감면 또는 환급 절차를 유형별로 확인합니다.|Find the relevant notices for tuition payment, scholarship requests, reductions or refunds.|按项目查询学费缴纳、奖学金申请、减免及退费手续。|学費納入、奨学金申請、減免・返金の手続きを項目別に確認します。
certificate|재학, 성적, 졸업 관련 증명서의 발급 방법과 수수료를 학교에서 확인합니다.|Check issuance channels and possible fees for enrolment, transcripts and graduation certificates.|查询在读、成绩及毕业证明的开具方式与收费。|在学・成績・卒業証明書の発行方法と手数料を確認します。
future|외국인 유학생이 참여 가능한 진로·취업 프로그램과 상담 공지를 찾아봅니다.|Explore career guidance and job-support programs open to international students.|查找留学生可参与的职业规划、就业指导及咨询项目。|留学生が参加できる進路・就職支援プログラムと相談情報を探します。
`;
const nextSteps = String.raw`
undergradApply|지원 학기 모집요강의 모집단위와 원서 일정을 확인하세요.|Open the guide for your intake and check majors and deadlines.|打开对应学期招生简章并核实院系及截止日期。|志望学期の募集要項で学科と出願期限を確認してください。
gradApply|지원 대학원과 전공의 모집 공고를 대조하세요.|Check the precise graduate school and major requirements.|核对目标研究生院及专业的最新公告。|志望研究科・専攻の最新要項を確認してください。
documents|지원서 제출 전 원본, 번역본, 인증 형식을 확인하세요.|Check originals, translations and authentication requirements before submitting.|提交前核对原件、译本及认证格式。|提出前に原本、翻訳、認証形式を確認してください。
languageReq|본인 전형에 적용되는 어학성적 종류와 유효기간을 확인하세요.|Confirm accepted tests, scores and validity for your track.|核实本招生类别认可的考试、分数与有效期。|出願区分で認められる試験・点数・有効期間を確認してください。
admissionResult|학교 공식 합격 발표 페이지와 안내 메일을 확인하세요.|Check the official result page and university messages.|核对学校官方录取网页及通知邮件。|公式合否ページと大学からの通知を確認してください。
tuitionFirst|등록금 고지서의 계좌, 금액, 기한을 확인하세요.|Verify account, amount and deadline on your official invoice.|核对学校缴费单上的账户、金额及期限。|大学発行の納付書で口座、金額、期限を確認してください。
certificateAdmission|비자 신청 전에 공식 입학허가 관련 안내를 문의하세요.|Ask your admissions office about admission papers required for your visa.|向招生部门确认办理签证所需的入学许可文件。|ビザ用の入学許可書類を入試担当に確認してください。
visa|외국인학생센터 안내와 출입국 관련 공식 안내를 대조하세요.|Cross-check CISS guidance with Korean immigration requirements.|对照留学生中心与韩国出入境部门的正式要求。|外国人学生センターと出入国管理の公式案内を照合してください。
alien|거주 형태에 맞는 등록 장소와 필요한 서류를 확인하세요.|Verify your applicable immigration office, deadline and required documents.|核实适用的出入境窗口、期限与资料。|管轄窓口、期限、必要書類を確認してください。
address|새 주소 신고가 필요한지 관련 관청에 확인하세요.|Check whether and where to report your new residence address.|向有关部门确认新住址申报手续。|新住所の届出先と要否を確認してください。
insurance|본인에게 적용되는 건강보험 자격과 납부 방식을 확인하세요.|Confirm your own coverage, premium and enrolment conditions.|确认个人参保资格、保费和办理要求。|ご自身の加入資格、保険料、手続きを確認してください。
emergency|긴급 연락처를 미리 저장하고 상황별 담당 기관을 확인하세요.|Save relevant emergency numbers and campus contacts in advance.|预先保存紧急号码及校园联系人。|緊急連絡先を保存し、状況別の窓口を確認してください。
dormApply|해당 학기 쿨하우스 모집 공고에서 자격과 기한을 확인하세요.|Use the current KU:L House notice for eligibility and dates.|以当期KU:L House宿舍公告为准核对资格与日期。|当該学期のKU:L House募集要項を確認してください。
dormRules|기숙사 공식 생활 안내와 계약 조건을 읽으세요.|Read current dormitory living and contract rules.|阅读宿舍现行生活守则与住宿合同。|寮の最新生活規則と契約条件を確認してください。
campusMap|공식 홈페이지에서 건물 위치와 운영 시간을 확인하세요.|Find locations and current office hours on official campus pages.|在学校官网核对设施位置与开放时间。|公式サイトで施設の場所と窓口時間を確認してください。
course|수강신청 일정과 학과별 제한을 확인하세요.|Check the semester schedule and your department's registration rules.|核对本学期选课时间及院系限制。|履修登録日程と学科の制限を確認してください。
ecampus|본인 수업에 로그인하고 담당 교수 공지를 확인하세요.|Sign in to your enrolled courses and read instructor notices.|登录已选课程并阅读教师公告。|履修科目にログインし、担当教員のお知らせを確認してください。
syllabus|희망 강의의 수업 언어와 평가방식을 확인하세요.|Review the chosen course's language and grading scheme.|核对目标课程的授课语言与评分方式。|対象科目の使用言語と評価方法を確認してください。
englishCourses|해당 학기 개설목록을 조회하고 수강 가능 여부를 문의하세요.|Check that term's list and confirm enrolment eligibility.|查询当期开课清单并确认是否可选。|その学期の開講一覧と履修資格を確認してください。
credits|학과 졸업요건과 본인의 성적표를 나란히 비교하세요.|Compare the current department rules against your transcript.|对照院系毕业要求与本人成绩单。|学科の要件と自分の成績表を照合してください。
grades|성적 이의 신청 기간과 교수님 안내를 확인하세요.|Check the grade appeal window and instructor instructions.|核对成绩异议期限及授课教师指引。|成績異議申立期間と担当教員の指示を確認してください。
leave|신청 전 학과와 외국인학생센터에 학적·체류 영향을 확인하세요.|Before filing, check both academic and immigration consequences.|申请前向院系和留学生中心咨询学籍及签证影响。|申請前に学科と外国人学生センターへ学籍・在留への影響を確認してください。
academicWarning|학교 공지에서 지원 자격을 확인한 뒤 학과에 상담을 요청하세요.|Check support criteria and ask your department for guidance.|核对辅导资格后向院系寻求咨询。|支援条件を確認し、学科に相談してください。
writingClinic|WE人 또는 eCampus에서 이번 학기 모집 공고를 검색하세요.|Search WE人 or eCampus for a current writing-clinic notice.|在WE人或eCampus搜索本学期写作辅导公告。|WE人やeCampusで今学期の募集を検索してください。
studyMentor|프로그램별 성적, 학적 및 선발 조건을 확인하세요.|Verify academic standing, student status and eligibility for each call.|核对每期项目的成绩、学籍及选拔条件。|募集ごとの成績・学籍・選考条件を確認してください。
studyCommunity|지원 기간과 팀 구성 요건을 최신 모집 공고에서 확인하세요.|Look for the latest recruitment window and team requirements.|在最新公告中核对申请期限与组队要求。|最新募集で応募期間とチーム条件を確認してください。
wein|포털에서 프로그램별 신청 자격과 운영 일정을 확인하세요.|Open the portal and verify each program's eligibility and dates.|进入平台逐项查看报名资格与时间。|ポータルで各プログラムの資格と日程を確認してください。
topik|입학·장학·졸업 중 자신의 목적에 해당하는 공지를 선택하세요.|Choose the correct notice for admission, scholarship or graduation.|按入学、奖学金或毕业目的查看对应公告。|入試・奨学金・卒業の目的に合う案内を確認してください。
koreanHelper|어학기관의 현재 헬퍼 모집 여부를 확인하세요.|Ask the language institute whether helper activities are running now.|向语言教育机构确认当前学伴活动是否开放。|語学機関にヘルパー募集の有無を確認してください。
exchangeProg|본교 추천 절차와 건국대 국제처 일정을 함께 확인하세요.|Confirm nomination by your home school and OIA procedures.|同时核对本校提名程序与建国大学国际处安排。|所属大学の推薦と建国大国際交流の手続きを確認してください。
visitingProg|방문학생 전용 비용과 서류를 교환학생 조건과 구분하세요.|Check visiting-specific fees and documents separately from exchange rules.|区分访问生和交换生的费用与所需资料。|ビジティング学生独自の費用・書類を確認してください。
exchangeCourses|국제처 수강 안내에서 학기별 일정과 제한을 확인하세요.|Use the OIA course guide for current enrolment limits.|通过国际处选课指南确认本学期限制。|国際交流の履修案内で学期の制限を確認してください。
isv|해당 학기 도우미 운영 여부를 국제처에 확인하세요.|Ask OIA about student-volunteer availability for your term.|向国际处确认本学期是否提供志愿者帮助。|その学期の学生ボランティア提供状況を国際交流担当に確認してください。
ibuddy|참여 대상과 신청 방법을 공식 i-Buddy 안내에서 확인하세요.|Check official i-Buddy eligibility and enrolment instructions.|查看官方i-Buddy的参加资格及申请方式。|i-Buddy公式案内で対象者と申込方法を確認してください。
cultural|국제처 공지에서 행사 시간, 장소, 신청을 확인하세요.|Verify time, venue and registration on current OIA announcements.|在国际处最新公告中核对时间、地点及报名要求。|国際交流の最新告知で日時・場所・申込を確認してください。
exchangeFaq|해당 질문의 공식 안내를 찾고 필요한 경우 국제처에 문의하세요.|Find the matching FAQ and contact OIA if your case is not covered.|查找对应常见问题，未涵盖时联系国际处。|該当FAQを確認し、不明点は国際交流担当に相談してください。
gradChecklist|체크리스트를 정리한 뒤 학과 사무실과 공식 기준을 대조하세요.|Use the checklist, then verify every requirement with your department.|整理清单后逐项与院系正式要求核对。|チェック後、所属学科の公式要件と照合してください。
department|학과 사무실에 해당 학번과 적용 교육과정 기준을 문의하세요.|Ask your department which curriculum and graduating rules apply to your cohort.|向院系确认自己入学年份适用的培养方案。|入学年度に適用される教育課程を学科事務室に確認してください。
thesis|지도교수, 학과 및 대학원 공지에서 심사 조건을 확인하세요.|Check examination milestones with your advisor and graduate office.|向导师及研究生院确认论文审核及考试节点。|指導教員と大学院窓口に審査の手順を確認してください。
gksScholarship|GKS 담당 공지와 본인 수혜 조건을 별도로 확인하세요.|Read GKS-specific notices for your scholarship cohort.|按所属GKS批次核对相关通知和规定。|ご自身のGKS対象年度の通知を確認してください。
intlScholarship|입학년도와 이번 학기 규정의 최신 개정본을 확인하세요.|Verify the latest rule and the cohort-specific criteria.|查阅最新规定及本人入学年度适用标准。|最新規程と入学年度別の適用条件を確認してください。
scholarshipChanges|규정의 시행일과 경과 조치를 확인한 뒤 문의하세요.|Review effective dates and transitional provisions before relying on amounts.|确认新规生效日期及过渡条款后再咨询。|施行日と経過措置を確認してから問い合わせてください。
tuitionSupport|희망 지원제도의 공지에서 신청기간과 제출 서류를 확인하세요.|For each support scheme, check the current call's deadline and paperwork.|逐个核对资助项目的申请期限与材料。|各制度の募集案内で期限と必要書類を確認してください。
certificate|증명서 용도와 제출 기관이 요구하는 언어·형식을 확인하세요.|Check the certificate type, language and format required by the recipient.|确认收件机构需要的证明种类、语言与格式。|提出先が求める証明書の種類・言語・形式を確認してください。
future|지원 가능한 학생 유형, 모집 일정과 참가 방식을 확인하세요.|Verify participant eligibility, dates and application routes.|核对求职项目面向的学生类型、报名时间和方式。|参加資格、募集期間、申込方法を確認してください。
`;
function readRows(input, label){
 const data={};
 for(const row of input.trim().split('\n')){
  const cols=row.split('|');
  if(cols.length!==5) throw new Error(`Bad ${label} row: ${row.slice(0,80)}`);
  const [id,ko,en,zh,ja]=cols;
  if(data[id]) throw new Error(`Duplicate ${label} ${id}`);
  data[id]={ko,en,zh,ja};
 }
 return data;
}
const actions=readRows(nextSteps,'action');
export const DETAILS=Object.fromEntries(Object.entries(readRows(summaries,'summary')).map(([id,description])=>[id,{description,action:actions[id]}]));
