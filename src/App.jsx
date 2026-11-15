import React, {useState,useMemo,useEffect} from 'react';
import {RESOURCES, SOURCES, CATEGORIES, AUDIENCES} from './data.js';
import translations from './i18n.js';
import {DETAILS} from './details.js';
import {getRoute,makeInquiryText} from './routing.js';
import './styles.css';

const LANGUAGES=[['en','English'],['zh','简体中文'],['ja','日本語'],['ko','한국어']];
const CATEGORIES_ICONS={academics:'▤',administration:'⌑',funding:'◇',living:'⌂',community:'◎',career:'↗'};
const ISSUE_CARDS=[
  {id:'class',title:'issueClass',desc:'issueClassDesc',icon:'▤',resources:['writingClinic','studyMentor','ecampus','syllabus'],action:'explore'},
  {id:'friends',title:'issueFriends',desc:'issueFriendsDesc',icon:'◎',resources:['ibuddy','isv','koreanHelper','cultural'],action:'explore'},
  {id:'admin',title:'issueAdmin',desc:'issueAdminDesc',icon:'⌑',resources:[],action:'help'},
  {id:'graduation',title:'issueGraduation',desc:'issueGraduationDesc',icon:'✓',resources:[],action:'checklist'},
  {id:'money',title:'issueMoney',desc:'issueMoneyDesc',icon:'◇',resources:['intlScholarship','gksScholarship','dormApply','scholarshipChanges'],action:'explore'}
];
const QUESTIONS=['askGrad','askVisa','askFunding','askClasses','askHousing','askExchange','askOther'];
const CHECK_ITEMS={u:['checkC1','checkC2','checkC3','checkC4','checkC5','checkC6','checkC7'],g:['checkG1','checkG2','checkG3','checkG4','checkG5'],e:['checkE1','checkE2','checkE3'],l:['checkL1','checkL2']};
const STORAGE='ku-bridge-independent-v1:';
function readStorage(key,fallback){try{const val=localStorage.getItem(STORAGE+key); return val===null?fallback:JSON.parse(val)}catch{return fallback}}
function makeLabel(t,key){return t[key]||translations.en[key]||key}
function RouteIcon({name='arrow',size=18}){
 const common={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true};
 if(name==='arrow')return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6"/></svg>;
 if(name==='external')return <svg {...common}><path d="M14 4h6v6M20 4l-9 9M19 13v6H5V5h6"/></svg>;
 if(name==='search')return <svg {...common}><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>;
 if(name==='check')return <svg {...common}><path d="m5 12 5 5L20 7"/></svg>;
 if(name==='bookmark')return <svg {...common}><path d="M6 4h12v17l-6-4-6 4z"/></svg>;
 if(name==='globe')return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c4 4 4 14 0 18M12 3c-4 4-4 14 0 18"/></svg>;
 if(name==='menu')return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
 return <svg {...common}><path d="M6 6l12 12M18 6 6 18"/></svg>;
}
function sourceLink(source, content, className='') { const src=SOURCES[source];return <a className={className} href={src.url} target="_blank" rel="noopener noreferrer">{content||src.name} <RouteIcon name="external" size={14}/></a> }


export default function App(){
 const [locale,setLocale]=useState(()=>readStorage('locale','en'));
 const lang=['ko','en','zh','ja'].includes(locale)?locale:'en';
 const t=translations[lang];
 const tx=(key)=>makeLabel(t,key);
 const [page,setPage]=useState('home');
 const [audience,setAudience]=useState(()=>readStorage('audience','all'));
 const [category,setCategory]=useState('all');
 const [query,setQuery]=useState('');
 const [recommend,setRecommend]=useState(null);
 const [saved,setSaved]=useState(()=>readStorage('saved',[]));
 const [checked,setChecked]=useState(()=>readStorage('checked',{}));
 const [selected,setSelected]=useState(null);
 const [helpQuestion,setHelpQuestion]=useState('askGrad');
 const [helpAudience,setHelpAudience]=useState('u');
 const [copied,setCopied]=useState(false);
 const [mobileMenu,setMobileMenu]=useState(false);
 const [onlySaved,setOnlySaved]=useState(false);
 useEffect(()=>{document.documentElement.lang=lang==='zh'?'zh-CN':lang;document.title='KU Bridge — '+tx('brand')},[lang]);
 useEffect(()=>{try{localStorage.setItem(STORAGE+'locale',JSON.stringify(lang))}catch{}},[lang]);
 useEffect(()=>{try{localStorage.setItem(STORAGE+'audience',JSON.stringify(audience))}catch{}},[audience]);
 useEffect(()=>{try{localStorage.setItem(STORAGE+'saved',JSON.stringify(saved))}catch{}},[saved]);
 useEffect(()=>{try{localStorage.setItem(STORAGE+'checked',JSON.stringify(checked))}catch{}},[checked]);
 const activeResource=RESOURCES.find(r=>r.id===selected);
 const list=useMemo(()=>RESOURCES.filter(r=>{
  if((onlySaved||page==='saved')&&!saved.includes(r.id))return false;
  if(audience!=='all'&&!r.audience.includes(audience))return false;
  if(category!=='all'&&r.category!==category)return false;
  if(recommend&&!recommend.includes(r.id))return false;
  if(query){const haystack=[...Object.values(r.title),...Object.values(DETAILS[r.id].description),...Object.values(DETAILS[r.id].action),tx(r.category),SOURCES[r.source].name,r.id].join(' ').toLocaleLowerCase();if(!haystack.includes(query.trim().toLocaleLowerCase()))return false;}
  return true;
 }),[page,audience,category,recommend,query,saved,lang]);
 const checkAudience=['u','g','e','l'].includes(audience)?audience:'u';
 const currentChecks=CHECK_ITEMS[checkAudience];
 const completion=currentChecks.filter(k=>checked[checkAudience+':'+k]).length;
 const route=getRoute(helpQuestion,helpAudience);
 useEffect(()=>{ if(!selected)return; const onKey=(e)=>{if(e.key==='Escape')setSelected(null)};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[selected]);
 function navigate(to){setPage(to);setMobileMenu(false);setSelected(null);window.scrollTo({top:0,behavior:'smooth'});if(to==='saved'){setOnlySaved(true);setRecommend(null)}else if(to==='explore'){setOnlySaved(false)}}
 function chooseIssue(issue){setCategory('all');setQuery('');if(issue.action==='explore'){setRecommend(issue.resources);navigate('explore');setAudience('all')}else{setRecommend(null);navigate(issue.action)}}
 function toggleSaved(id){setSaved(old=>old.includes(id)?old.filter(i=>i!==id):[...old,id])}
 function toggleCheck(k){setChecked(old=>({...old,[checkAudience+':'+k]:!old[checkAudience+':'+k]}))}
 function inquiryText(){return makeInquiryText(lang,tx(helpAudience),tx(helpQuestion))}
 async function copyInquiry(){try{await navigator.clipboard.writeText(inquiryText());setCopied(true);setTimeout(()=>setCopied(false),2000)}catch{setCopied(false)}}
 function renderCards(items){return items.length?<div className="resource-grid">{items.map(item=><article className="resource-card" key={item.id}>
  <div className="resource-meta"><span className={'source-kind '+item.kind}>{tx(item.kind)}</span><span>{tx(item.category)}</span></div>
  <div className="resource-header"><div className="resource-symbol">{CATEGORIES_ICONS[item.category]}</div><button className={'save-icon '+(saved.includes(item.id)?'is-saved':'')} onClick={()=>toggleSaved(item.id)} aria-label={tx(saved.includes(item.id)?'saved':'save')+' '+item.title[lang]} title={tx(saved.includes(item.id)?'saved':'save')}><RouteIcon name="bookmark" size={18}/></button></div>
  <h3>{item.title[lang]}</h3><p className="resource-summary">{DETAILS[item.id].description[lang]}</p><p className="resource-caption">{SOURCES[item.source].name}</p>
  <div className="resource-bottom"><span>{tx(item.stage)}</span><button className="text-link" onClick={()=>setSelected(item.id)}>{tx('details')}<RouteIcon name="arrow" size={15}/></button></div>
 </article>)}</div>:<div className="empty-state"><RouteIcon name="search" size={27}/><p>{tx('noResult')}</p><button className="outline" onClick={()=>{setQuery('');setRecommend(null);setCategory('all');setAudience('all');setOnlySaved(false)}}>{tx('clear')}</button></div>}
 function filters(){return <div className="explore-filters"><label><span>{tx('studentType')}</span><select value={audience} onChange={e=>setAudience(e.target.value)}>{AUDIENCES.map(x=><option key={x} value={x}>{tx(x)}</option>)}</select></label><label><span>{tx('cat')}</span><select value={category} onChange={e=>setCategory(e.target.value)}>{CATEGORIES.map(x=><option key={x} value={x}>{tx(x)}</option>)}</select></label><label className="search-wrap"><span>{tx('navExplore')}</span><div><RouteIcon name="search" size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tx('searchPlaceholder')} aria-label={tx('searchPlaceholder')}/>{query&&<button onClick={()=>setQuery('')} title={tx('clear')} aria-label={tx('clear')}>×</button>}</div></label></div>}
 function exploreContent(){return <><div className="section-heading"><div><p className="eyebrow">KU / DIRECTORY</p><h2>{tx('sectionExplore')}</h2><p>{tx('sectionExploreDesc')}</p></div><span className="count-pill">{list.length} {tx('showing')}</span></div>{filters()}{recommend&&<button className="active-filter" onClick={()=>setRecommend(null)}>× {tx('clear')}</button>}{renderCards(list)}</>}
 return <div className="app-shell">
  <div className="topline"/>
  <header className="site-header"><div className="header-inner"><button className="brand" onClick={()=>navigate('home')} aria-label="KU Bridge Home"><span className="logo-mark">KU<span>.</span></span><span className="brand-title"><b>Bridge</b><small>INTERNATIONAL STUDENT NAVIGATOR</small></span></button>
   <nav className={'header-nav '+(mobileMenu?'open':'')} aria-label="Main navigation">{[['home','navHome'],['explore','navExplore'],['help','navHelp'],['checklist','navChecklist'],['saved','navSaved']].map(([to,key])=><button key={to} className={page===to?'active':''} onClick={()=>navigate(to)}>{tx(key)}{to==='saved'&&saved.length>0&&<span className="nav-count">{saved.length}</span>}</button>)}</nav>
   <div className="language-control"><RouteIcon name="globe" size={17}/><div className="language-buttons">{LANGUAGES.map(([code,label])=><button key={code} className={lang===code?'active':''} onClick={()=>setLocale(code)} aria-label={'Language '+label}>{label}</button>)}</div><select aria-label={tx('locale')} value={lang} onChange={e=>setLocale(e.target.value)}>{LANGUAGES.map(([code,label])=><option value={code} key={code}>{label}</option>)}</select></div>
   <button className="mobile-toggle" onClick={()=>setMobileMenu(x=>!x)} aria-label={tx('menu')} aria-expanded={mobileMenu}><RouteIcon name={mobileMenu?'x':'menu'} size={23}/></button>
  </div></header>
  <main>
  {page==='home'&&<>
   <section className="hero container"><div className="hero-text"><div className="hero-label"><span className="live-dot"/>{tx('heroEyebrow')}</div><h1>{tx('heroTitle')}</h1><p>{tx('heroDesc')}</p><div className="hero-cta"><button className="primary" onClick={()=>document.getElementById('issues')?.scrollIntoView({behavior:'smooth'})}>{tx('heroPrimary')}<RouteIcon name="arrow" size={19}/></button><button className="outline" onClick={()=>navigate('explore')}>{tx('heroSecondary')}</button></div><div className="hero-metrics"><div><strong>{RESOURCES.length}</strong><span>{tx('statsTopics')}</span></div><i/><div><strong>04</strong><span>{tx('statsLanguages')}</span></div><i/><div><strong>{Object.keys(SOURCES).length}</strong><span>{tx('statsSources')}</span></div></div></div>
   <div className="hero-visual" aria-hidden="true"><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="visual-card visual-card-main"><div className="visual-card-top"><span className="visual-k">K</span><span>KONKUK · SEOUL</span></div><div className="visual-lines"><b>Support starts here.</b><span>Explore · Connect · Thrive</span></div><div className="visual-bar"><span/><span/><span/></div></div><div className="visual-float float-one">✦ &nbsp; Campus support</div><div className="visual-float float-two">◎ &nbsp; Global community</div></div>
   </section>
   <div className="container"><div className="notice"><span>ⓘ</span><p>{tx('notice')}</p></div></div>
   <section className="container section issues-section" id="issues"><div className="section-heading"><div><p className="eyebrow">01 / START WITH YOUR NEEDS</p><h2>{tx('sectionIssues')}</h2><p>{tx('sectionIssuesDesc')}</p></div></div><div className="issue-grid">{ISSUE_CARDS.map((issue,index)=><button className={'issue-card issue-'+index} key={issue.id} onClick={()=>chooseIssue(issue)}><span className="issue-icon">{issue.icon}</span><b>{tx(issue.title)}</b><small>{tx(issue.desc)}</small><span className="issue-arrow"><RouteIcon name="arrow" size={19}/></span></button>)}</div></section>
   <section className="container section preview-section"><div className="section-heading"><div><p className="eyebrow">02 / QUICK DISCOVERY</p><h2>{tx('sectionExplore')}</h2><p>{tx('sectionExploreDesc')}</p></div><button className="outline small" onClick={()=>navigate('explore')}>{tx('viewAll')} <RouteIcon name="arrow" size={16}/></button></div>{renderCards(RESOURCES.filter(r=>['writingClinic','intlScholarship','ibuddy','gradChecklist','visa','dormApply'].includes(r.id)))}</section>
   <section className="container trust-section"><div><p className="eyebrow">TRANSPARENCY FIRST</p><h2>{tx('trustTitle')}</h2><p>{tx('trustDesc')}</p></div><div className="trust-tags"><span>{tx('direct')}</span><span>{tx('path')}</span><span>{tx('historical')}</span></div></section>
  </>}
  {['explore','saved'].includes(page)&&<section className="container section page-section">{exploreContent()}</section>}
  {page==='help'&&<section className="container page-section section narrow-page"><div className="section-heading"><div><p className="eyebrow">KU / CONTACT ROUTER</p><h2>{tx('askTitle')}</h2><p>{tx('askDesc')}</p></div></div><div className="help-form"><label>{tx('studentType')}<select value={helpAudience} onChange={e=>setHelpAudience(e.target.value)}>{AUDIENCES.filter(x=>x!=='all').map(x=><option key={x} value={x}>{tx(x)}</option>)}</select></label><label>{tx('askTopic')}<select value={helpQuestion} onChange={e=>setHelpQuestion(e.target.value)}>{QUESTIONS.map(x=><option key={x} value={x}>{tx(x)}</option>)}</select></label></div><div className="route-results"><div className="route-step"><span className="step-no">01</span><div><small>{tx('askPrimary')}</small><h3>{tx(route.primary)}</h3>{sourceLink(route.source,tx('openSource'),'inline-link')}</div></div><div className="route-step"><span className="step-no">02</span><div><small>{tx('askSecondary')}</small><h3>{tx(route.secondary)}</h3><p>{tx('verifyAlert')}</p></div></div><div className="route-step"><span className="step-no">03</span><div><small>{tx('askPrep')}</small><p>{tx('askGenericPrep')}</p></div></div></div><div className="inquiry-template"><div><h3>{tx('askTemplate')}</h3><p>{inquiryText()}</p></div><button className="outline" onClick={copyInquiry}>{copied?tx('copied'):tx('copy')}</button></div></section>}
  {page==='checklist'&&<section className="container page-section section narrow-page"><div className="section-heading"><div><p className="eyebrow">KU / YOUR JOURNEY</p><h2>{tx('checkTitle')}</h2><p>{tx('checkDesc')}</p></div></div><label className="standalone-select">{tx('studentType')}<select value={checkAudience} onChange={e=>setAudience(e.target.value)}>{AUDIENCES.filter(x=>x!=='all').map(x=><option key={x} value={x}>{tx(x)}</option>)}</select></label><div className="progress-top"><b>{completion} / {currentChecks.length} {tx('checkProgress')}</b><span>{Math.round(completion/currentChecks.length*100)}%</span></div><div className="progress-track"><div style={{width:completion/currentChecks.length*100+'%'}}/></div><div className="check-items">{currentChecks.map((key,idx)=><label key={key} className={'check-item '+(checked[checkAudience+':'+key]?'done':'')}><input type="checkbox" checked={!!checked[checkAudience+':'+key]} onChange={()=>toggleCheck(key)}/><span className="check-indicator"><RouteIcon name="check" size={15}/></span><span>{tx(key)}</span><small>{String(idx+1).padStart(2,'0')}</small></label>)}</div><div className="check-footer"><button className="outline" onClick={()=>{if(window.confirm(tx('checkReset')+'?'))setChecked(old=>Object.fromEntries(Object.entries(old).filter(([key])=>!key.startsWith(checkAudience+':'))))}}>{tx('checkReset')}</button><span>{tx('checkOfficial')}</span></div><div className="check-docs">{sourceLink(checkAudience==='e'?'exchangeGuide':'guide',tx('openSource'),'inline-link')}</div></section>}
  </main>
  <footer className="footer"><div className="container footer-inner"><div><div className="footer-logo">KU<span>.</span> Bridge</div><p>{tx('footer')}</p><small>{tx('localNotice')}</small></div><div className="footer-links">{sourceLink('ciss','International Student Center')}{sourceLink('exchange','Office of International Affairs')}{sourceLink('main','Konkuk University')}</div></div><div className="container footer-last">INDEPENDENT STUDENT NAVIGATOR · RESEARCH RECONSTRUCTION · 2026</div></footer>
  {activeResource&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><div className="modal" role="dialog" aria-modal="true" aria-label={activeResource.title[lang]} tabIndex="-1"><div className="modal-top"><span className={'source-kind '+activeResource.kind}>{tx(activeResource.kind)}</span><button onClick={()=>setSelected(null)} aria-label={tx('close')}><RouteIcon name="x" size={20}/></button></div><h2>{activeResource.title[lang]}</h2><div className="modal-detail-grid"><div><small>{tx('cat')}</small><p>{tx(activeResource.category)}</p></div><div><small>{tx('stage')}</small><p>{tx(activeResource.stage)}</p></div><div><small>{tx('studentType')}</small><p>{activeResource.audience.map(x=>tx(x)).join(' · ')}</p></div><div><small>{tx('sourceKind')}</small><p>{tx(activeResource.kind)}</p></div></div><div className="modal-content"><div className="detail-section"><b>{tx('detailAbout')}</b><p>{DETAILS[activeResource.id].description[lang]}</p></div><div className="detail-section next-step"><b>{tx('detailNext')}</b><p>{DETAILS[activeResource.id].action[lang]}</p></div><div className="detail-section"><b>{tx('source')}</b><p>{SOURCES[activeResource.source].name} · {SOURCES[activeResource.source].date}</p><p className="evidence-note">{tx(activeResource.kind)}</p></div><div className="detail-warning">{tx('verifyAlert')}</div></div><div className="modal-actions">{sourceLink(activeResource.source,tx('openSource'),'primary link-button')}<button className="outline" onClick={()=>toggleSaved(activeResource.id)}><RouteIcon name="bookmark" size={17}/> {tx(saved.includes(activeResource.id)?'saved':'save')}</button></div></div></div>}
 </div>
}
