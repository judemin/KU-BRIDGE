export function getRoute(question,audience){
 // Routing is advisory only. The university is the final authority on ownership.
 if(question==='askHousing')return {primary:'askDorm',secondary:audience==='e'?'askOia':'askCiss',source:'dorm'};
 if(question==='askVisa')return {primary:audience==='e'?'askOia':'askCiss',secondary:audience==='l'?'askLanguageSchool':'askMain',source:audience==='e'?'exchangeGuide':'ciss'};
 if(question==='askExchange'||audience==='e')return {primary:'askOia',secondary:'askCiss',source:'exchangeGuide'};
 if(audience==='l')return {primary:'askLanguageSchool',secondary:'askCiss',source:'fli'};
 if(question==='askGrad')return {primary:'askDepartment',secondary:'askCiss',source:'guide'};
 if(question==='askClasses')return {primary:'askDepartment',secondary:'askWein',source:'ecampus'};
 if(question==='askFunding')return {primary:'askCiss',secondary:'askDepartment',source:'rule'};
 return {primary:'askCiss',secondary:'askDepartment',source:'ciss'};
}

export function makeInquiryText(lang,student,topic){
  if(lang==='ko')return `안녕하십니까. 건국대학교 외국인 유학생입니다. 학생 유형은 ${student}이며, ${topic}에 대해 문의드립니다. 해당 업무의 정확한 담당 부서와 필요한 절차 및 공식 공지를 안내해 주시면 감사하겠습니다.`;
  if(lang==='zh')return `您好，我是建国大学留学生，学生类型：${student}。我想咨询“${topic}”。烦请确认负责部门、后续手续和适用的官方公告，谢谢。`;
  if(lang==='ja')return `こんにちは。建国大学の留学生です。学生区分は${student}です。「${topic}」について、担当部署と必要な手続き、公式案内をご教示いただけますでしょうか。よろしくお願いいたします。`;
  return `Hello, I am an international student at Konkuk University (${student}). I would like guidance on ${topic}. Could you please confirm the responsible office, required next steps, and official notices? Thank you.`;
}
