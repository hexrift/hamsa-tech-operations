import {sources,latestRun,runSignal,shortCommit} from './lib/status.mjs';

const grid = document.querySelector('[data-operations-grid]');
const refreshed = document.querySelector('[data-refreshed-at]');
const revision = document.querySelector('[data-revision]');

function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function card(source, result) {
  const article = element('article','signal-card');
  article.dataset.sourceCard = source.repo;
  const top = element('div','card-top');
  top.append(element('span','card-number',source.number));
  const signal = result.run ? runSignal(result.run) : {kind:'unknown',label:result.unavailable ? 'Source unavailable':'No public run',detail:result.unavailable ? 'GitHub did not return this source signal. Open the repository for current status.' : 'No public Actions run is available yet.'};
  top.append(element('span',`signal-tag ${signal.kind}`,signal.label));
  article.append(top,element('h3','',source.name),element('p','',signal.detail));
  article.append(element('div','card-rule'));
  const meta = element('div','card-meta');
  meta.append(element('span','',result.run ? `Run #${result.run.run_number ?? '—'} · ${shortCommit(result.run)}` : source.description));
  meta.append(element('span','',result.run ? new Date(result.run.created_at).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}) : 'Public GitHub source'));
  article.append(meta);
  const link = element('a','card-source');
  link.href = result.run?.html_url ?? `https://github.com/${source.repo}/actions`;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.append(element('span','',result.run ? 'View source run':'View GitHub Actions'),element('span','','↗'));
  article.append(link);
  return article;
}

async function readSource(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`https://api.github.com/repos/${source.repo}/actions/runs?per_page=10`,{headers:{Accept:'application/vnd.github+json'},signal:controller.signal});
    if (!response.ok) return {unavailable:true};
    return {run:latestRun(await response.json())};
  } catch { return {unavailable:true}; }
  finally { clearTimeout(timer); }
}

async function start() {
  try {
    const response = await fetch('./build.json',{cache:'no-store'});
    if (response.ok) {
      const build = await response.json();
      revision.textContent = typeof build.commit === 'string' ? build.commit.slice(0,7) : 'unavailable';
    } else revision.textContent = 'unavailable';
  } catch { revision.textContent = 'unavailable'; }
  const results = await Promise.all(sources.map(readSource));
  grid.replaceChildren(...sources.map((source,index) => card(source,results[index])));
  grid.dataset.pulseState = 'complete';
  refreshed.textContent = `Observed ${new Date().toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'})}`;
}

start();
