// Independently reconstructed navigation data. Not an export of the previously deployed KU Bridge.
// The "direct" tag indicates that the named subject was mentioned in the cited KU document,
// NOT that applications are currently open or eligibility is guaranteed.
export const SOURCES = {
  ciss: { name:'KU International Student Center', url:'https://ciss.konkuk.ac.kr/', date:'Portal' },
  undergrad: {name:'2026 Fall undergraduate international admission guide',url:'https://www.konkuk.ac.kr/bbs/ciss/1482/1206283/download.do',date:'2026'},
  graduate: {name:'2026 international graduate admission guide',url:'https://www.konkuk.ac.kr/sites/ciss/files/260310_%EA%B1%B4%EA%B5%AD%EB%8C%80%ED%95%99%EC%9B%90%ED%9B%84%EA%B8%B0%EB%AA%A8%EC%A7%91%EC%9A%94%EA%B0%95%EA%B5%AD%EB%AC%B8_v3.pdf',date:'2026'},
  guide: {name:'2026 Konkuk freshman guidebook',url:'https://www.konkuk.ac.kr/sites/konkuk/down/konkuk_guide_freshman_2026_eng.pdf',date:'2026'},
  gks: {name:'2026 GKS semester guide',url:'https://www.konkuk.ac.kr/bbs/ciss/6225/1208955/download.do',date:'2026-03'},
  rule: {name:'Konkuk scholarship regulations: revision record',url:'https://rule.konkuk.ac.kr/lmxsrv/law/lawRevisionInfo.do?SEQ_HISTORY=3601',date:'2025-12'},
  ecampus: {name:'Konkuk eCampus notices',url:'https://community.konkuk.ac.kr/ilos/community/notice_list_form.acl',date:'Continuously updated'},
  mentor: {name:'2026-1 Academic UP mentoring announcement',url:'https://ecampus.konkuk.ac.kr/ilos/community/notice_view_form.acl?ARTL_NUM=13431223',date:'2026-03'},
  writing: {name:'Writing Clinic announcement (historical)',url:'https://ecampus.konkuk.ac.kr/ilos/community/notice_view_form.acl?ARTL_NUM=13003483',date:'2025-11'},
  wein: {name:'WE人 student program system',url:'https://wein.konkuk.ac.kr/',date:'Portal'},
  exchange: {name:'Office of International Affairs: Exchange Students',url:'https://www.konkuk.ac.kr/oiaeng/18828/subview.do',date:'Portal'},
  visiting: {name:'Office of International Affairs: Visiting Students',url:'https://www.konkuk.ac.kr/oiaeng/18829/subview.do',date:'Portal'},
  buddy: {name:'Konkuk i-Buddy Program',url:'https://www.konkuk.ac.kr/oia/18788/subview.do',date:'Portal'},
  exchangeGuide: {name:'Office of International Affairs Exchange / Visiting Guidebook',url:'https://www.konkuk.ac.kr/oiaeng/18827/subview.do',date:'Guidebook'},
  exchSupport: {name:'OIA student services',url:'https://www.konkuk.ac.kr/oiaeng/18827/subview.do',date:'Guidebook'},
  dorm: {name:'KU:L House accommodation',url:'https://kulhouse.konkuk.ac.kr/home/lan/eng/e_index_01.asp',date:'Portal'},
  fli: {name:'Konkuk Foreign Language Institute: Helper',url:'https://fli.konkuk.ac.kr/en/interkor/helper/',date:'Portal'},
  main: {name:'Konkuk University',url:'https://www.konkuk.ac.kr/konkuk/index.do',date:'Portal'}
};

// Each resource is a discovery TOPIC, not necessarily a separately confirmed benefit.
// categories: academics, administration, funding, living, community, career.
// audience: u (undergrad), g (graduate), e (exchange/visiting), l (language program).
// stages: before, arrival, enrolled, graduating.
const TOPICS = [
['undergradApply','administration','u','before','undergrad','direct','학부 외국인특별전형','Undergraduate international admission','本科留学生招生','本科外国人特別選考'],
['gradApply','administration','g','before','graduate','direct','대학원 외국인전형','Graduate international admission','研究生留学生招生','大学院留学生入試'],
['documents','administration','u,g','before','undergrad','direct','입학 서류 및 공증','Admission documents and legalization','入学材料与认证','入学書類と認証'],
['languageReq','academics','u,g','before','undergrad','direct','입학 한국어 / 어학 요건','Admission language requirements','入学语言要求','出願時の語学要件'],
['admissionResult','administration','u,g','before','undergrad','direct','합격 발표 및 확인','Admission results','录取结果查询','合格発表・確認'],
['tuitionFirst','funding','u,g','before','undergrad','direct','최초 등록금 납부','Initial tuition payment','首学期学费缴纳','初回学費の納付'],
['certificateAdmission','administration','u,g','arrival','undergrad','direct','표준입학허가서 안내','Certificate of Admission','标准入学许可书','標準入学許可書'],
['visa','administration','u,g,e,l','arrival','ciss','path','비자 및 체류 안내','Visa and stay guidance','签证及居留指南','ビザ・在留案内'],
['alien','administration','u,g,e,l','arrival','exchangeGuide','direct','외국인등록 안내','Foreign resident registration','外国人登录手续','外国人登録'],
['address','administration','u,g,e,l','enrolled','gks','direct','주소 변경 신고 안내','Change of address reporting','住址变更申报','住所変更届'],
['insurance','living','u,g,e,l','arrival','gks','direct','건강보험 확인','Health insurance guidance','健康保险指南','健康保険案内'],
['emergency','living','u,g,e,l','enrolled','gks','direct','긴급 연락처','Emergency contacts','紧急联系方式','緊急連絡先'],
['dormApply','living','u,g,e,l','arrival','dorm','path','기숙사 신청 안내','Dormitory application','宿舍申请','学生寮の申込'],
['dormRules','living','u,g,e,l','enrolled','dorm','path','기숙사 생활 규정','Dormitory rules','宿舍生活规定','寮の生活規則'],
['campusMap','living','u,g,e,l','arrival','main','path','캠퍼스 위치 및 시설','Campus and facilities','校园地图和设施','キャンパス施設'],
['course','academics','u,g,e','enrolled','guide','path','수강신청 절차','Course registration','选课流程','履修登録'],
['ecampus','academics','u,g,e','enrolled','ecampus','direct','eCampus 강의 시스템','eCampus course system','eCampus课程系统','eCampus授業システム'],
['syllabus','academics','u,g,e','enrolled','exchangeGuide','direct','강의계획서 확인','Find course syllabi','课程大纲查询','シラバス確認'],
['englishCourses','academics','u,g,e','enrolled','exchangeGuide','direct','영어 강의 찾기','Find English-taught courses','查找英语授课课程','英語開講科目を探す'],
['credits','academics','u,g,e','enrolled','guide','path','학점 이수 확인','Track earned credits','学分修读情况','取得単位の確認'],
['grades','academics','u,g,e','enrolled','guide','path','성적 확인 및 문의','Grades and academic inquiries','成绩查询与咨询','成績確認・相談'],
['leave','administration','u,g','enrolled','ciss','path','휴학 및 복학 문의','Leave and readmission inquiries','休学与复学咨询','休学・復学の相談'],
['academicWarning','academics','u','enrolled','mentor','direct','학사경고 후 학습 지원','Support after academic probation','学业警告后的学习支持','学業警告後の学修支援'],
['writingClinic','academics','u','enrolled','writing','historical','외국인 학생 글쓰기 클리닉','Writing clinic for international students','留学生写作辅导','留学生向け文章指導'],
['studyMentor','academics','u','enrolled','mentor','historical','학업 멘토링 참여','Academic mentoring','学业辅导项目','学修メンタリング'],
['studyCommunity','academics','u,g','enrolled','ecampus','path','학습공동체 공지','Study community programs','学习共同体项目','学修コミュニティ'],
['wein','academics','u,g','enrolled','wein','direct','WE人 비교과 프로그램','WE人 extracurricular programs','WE人课外项目','WE人課外プログラム'],
['topik','academics','u,g,l','enrolled','ciss','path','TOPIK 안내 및 공지','TOPIK notices and guidance','TOPIK考试公告','TOPIK試験案内'],
['koreanHelper','community','l','enrolled','fli','direct','한국어 연수생 헬퍼','Korean language learner helper','韩语研修生学伴','韓国語研修生ヘルパー'],
['exchangeProg','community','e','before','exchange','direct','교환학생 프로그램 안내','Exchange student program','交换生项目','交換留学プログラム'],
['visitingProg','community','e','before','visiting','direct','방문학생 프로그램 안내','Visiting student program','访问生项目','ビジティング留学'],
['exchangeCourses','academics','e','arrival','exchangeGuide','direct','교환 / 방문학생 수강 안내','Exchange / visiting course registration','交换访问生选课','交換・ビジティング学生の履修'],
['isv','community','e','arrival','exchSupport','direct','국제학생 도우미(ISV)','International Student Volunteers','国际学生志愿者','国際学生ボランティア'],
['ibuddy','community','e','enrolled','buddy','direct','i-Buddy 교류 프로그램','i-Buddy connections','i-Buddy同伴项目','i-Buddy交流プログラム'],
['cultural','community','e','enrolled','exchSupport','direct','문화교류 행사','Cultural and exchange events','文化交流活动','文化交流イベント'],
['exchangeFaq','administration','e','enrolled','exchangeGuide','direct','교환학생 FAQ','Exchange / visiting FAQ','交换访问生常见问题','交換留学FAQ'],
['gradChecklist','academics','u,g','graduating','guide','path','졸업요건 점검','Graduation requirement review','毕业要求核查','卒業要件の確認'],
['department','administration','u,g','graduating','gks','direct','학과 사무실 졸업 상담','Departmental graduation consultation','院系毕业咨询','学科事務室の卒業相談'],
['thesis','academics','g','graduating','gks','direct','대학원 논문 및 종합시험','Graduate thesis and comprehensive exam','研究生论文与综合考试','大学院論文・総合試験'],
['gksScholarship','funding','u,g','enrolled','gks','direct','정부초청장학생(GKS) 안내','GKS scholarship guidance','GKS政府奖学金','GKS政府奨学金'],
['intlScholarship','funding','u','enrolled','rule','direct','우수외국인장학 규정','Outstanding international student scholarship','优秀留学生奖学金','優秀外国人奨学金'],
['scholarshipChanges','funding','u,g','enrolled','rule','direct','장학 규정 변경사항','Scholarship rule revisions','奖学金规定变更','奨学金規程の改定'],
['tuitionSupport','funding','u,g','enrolled','guide','path','장학 / 등록금 지원 정보','Scholarship and tuition support','奖学金与学费支持','奨学金・学費支援'],
['certificate','administration','u,g','graduating','guide','path','재학 / 성적 / 졸업 증명서','Enrollment, grade and graduation certificates','在读成绩毕业证明','在学・成績・卒業証明書'],
['future','career','u,g','graduating','wein','path','진로 / 취업 프로그램 탐색','Explore career support','就业与职业规划支持','キャリア・就職支援']
];
export const RESOURCES=TOPICS.map(([id,category,audience,stage,source,kind,ko,en,zh,ja])=>({
  id,category,audience:audience.split(','),stage,source,kind,title:{ko,en,zh,ja}
}));
export const CATEGORIES=['all','academics','administration','funding','living','community','career'];
export const AUDIENCES=['all','u','g','e','l'];
