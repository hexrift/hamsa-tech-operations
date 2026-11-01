import {repository,sources,latestRun,runSignal,shortCommit} from './lib/status.mjs';
const grid=document.querySelector('[data-operations-grid]');
const refreshed=document.querySelector('[data-refreshed-at]');
const revision=[...document.querySelectorAll('[data-revision]')];
const refreshButton=document.querySelector('[data-refresh-signals]');
function element(tag,className,content){const node=document.createElement(tag);if(className)node.className=className;if(content!==undefined)node.textContent=content;return node;}
function card(source,run,unavailable){
  const article=element('article','signal-card');article.dataset.sourceCard=source.event;
  const signal=unavailable?{kind:'unknown',label:'Source unavailable',detail:'GitHub did not return this signal. Open Actions for current status.'}:runSignal(run);
  const top=element('div','card-top');top.append(element('span','card-number',source.number),element('span',`signal-tag ${signal.kind}`,signal.label));
  article.append(top,element('h3','',source.name),element('p','',signal.detail));article.append(element('div','card-rule'));
  const meta=element('div','card-meta');meta.append(element('span','',run?`Run #${run.run_number??'—'} · ${shortCommit(run)}`:source.description),element('span','',run?new Date(run.created_at).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}):'Meridian Vale staging'));
  article.append(meta);
  const link=element('a','card-source');link.href=run?.html_url??`https://github.com/${repository}/actions`;link.target='_blank';link.rel='noreferrer';link.append(element('span','',run?'View source run':'View GitHub Actions'),element('span','','↗'));article.append(link);
  return article;
}
async function start(){
  refreshButton.disabled=true;
  refreshed.textContent='Connecting to GitHub…';
  let currentRevision='unavailable';
  try{const response=await fetch('./build.json',{cache:'no-store'});if(!response.ok)throw new Error('build unavailable');const build=await response.json();currentRevision=typeof build.commit==='string'?build.commit.slice(0,7):'unavailable';}catch{}
  for(const target of revision)target.textContent=currentRevision;
  let runs=null;
  try{const response=await fetch(`https://api.github.com/repos/${repository}/actions/runs?per_page=50`,{headers:{Accept:'application/vnd.github+json'}});if(response.ok)runs=await response.json();}catch{}
  grid.replaceChildren(...sources.map(source=>card(source,runs?latestRun(runs,source.event,source):null,runs===null)));
  grid.dataset.pulseState='complete';refreshed.textContent=`Observed ${new Date().toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'})}`;
  refreshButton.disabled=false;
}
refreshButton.addEventListener('click',start);
start();
