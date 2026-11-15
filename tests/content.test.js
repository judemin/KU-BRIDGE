import test from 'node:test';
import assert from 'node:assert/strict';
import { RESOURCES, SOURCES, CATEGORIES, AUDIENCES } from '../src/data.js';
import { DETAILS } from '../src/details.js';
import translations from '../src/i18n.js';
const LOCALES = ['ko','en','zh','ja'];
const IDS = RESOURCES.map(x=>x.id);
test('45 unique topics and complete 4-language detail records',()=>{
  assert.equal(RESOURCES.length,45);
  assert.equal(new Set(IDS).size,45);
  assert.deepEqual(Object.keys(DETAILS).sort(),[...IDS].sort());
  for(const r of RESOURCES){
    for(const locale of LOCALES){
      assert.ok(r.title[locale]?.length>3, `title ${r.id} ${locale}`);
      assert.ok(DETAILS[r.id]?.description[locale]?.length>12, `summary ${r.id} ${locale}`);
      assert.ok(DETAILS[r.id]?.action[locale]?.length>12, `next step ${r.id} ${locale}`);
    }
  }
});
test('every source points to an official Konkuk URL',()=>{
  for(const [id,s] of Object.entries(SOURCES)){
    const u=new URL(s.url);
    assert.equal(u.protocol,'https:',id);
    assert.ok(u.hostname==='konkuk.ac.kr'||u.hostname.endsWith('.konkuk.ac.kr'), `${id}: ${u.hostname}`);
  }
});
test('topic filters and source references are valid',()=>{
  for(const r of RESOURCES){
    assert.ok(SOURCES[r.source],`${r.id} source`);
    assert.ok(CATEGORIES.includes(r.category),`${r.id} category`);
    assert.ok(['before','arrival','enrolled','graduating'].includes(r.stage));
    assert.ok(['direct','path','historical'].includes(r.kind));
    assert.ok(r.audience.length>0&&r.audience.every(a=>AUDIENCES.includes(a)));
  }
});
test('UI translation keys agree across all 4 languages',()=>{
  const keys=Object.keys(translations.ko);
  assert.ok(keys.length>=110);
  for(const locale of LOCALES){
    assert.deepEqual(Object.keys(translations[locale]).sort(),keys.slice().sort(),locale);
    for(const key of keys)assert.ok(translations[locale][key]?.trim(),`${locale} ${key}`);
  }
});

test('student-specific contact routes and four-language inquiry templates', async()=>{
 const {getRoute,makeInquiryText}=await import('../src/routing.js');
 const questions=['askGrad','askVisa','askFunding','askClasses','askHousing','askExchange','askOther'];
 for(const student of ['u','g','e','l']){
  for(const q of questions){
   const r=getRoute(q,student);
   assert.ok(r.primary && r.secondary && SOURCES[r.source],`${student} / ${q}`);
   for(const locale of LOCALES)assert.ok(makeInquiryText(locale,translations[locale][student],translations[locale][q]).length>30);
  }
 }
 assert.equal(getRoute('askClasses','l').primary,'askLanguageSchool');
 assert.equal(getRoute('askExchange','e').primary,'askOia');
 assert.equal(getRoute('askHousing','u').primary,'askDorm');
});
