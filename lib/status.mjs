export const repository='hexrift/hamsa-tech-operations';
export const sources=[
  {number:'01',name:'Change checks',event:'pull_request',description:'Latest pull request CI check.'},
  {number:'02',name:'Staging deployment',event:'push',description:'Latest main-branch build and Pages deployment.'},
  {number:'03',name:'Shipment journey',event:'workflow_dispatch',description:'Rendered browser check of shipment tracking.'}
];

export function latestRun(data,event){
  const runs=Array.isArray(data?.workflow_runs)?data.workflow_runs:[];
  return runs.filter(run=>run?.event===event&&run?.html_url&&run?.created_at)
    .sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at))[0]??null;
}

export function runSignal(run){
  if(!run)return {kind:'unknown',label:'Awaiting check',detail:'This source check has not been run yet.'};
  if(run.status!=='completed')return {kind:'pending',label:'In progress',detail:'The latest source check has not finished.'};
  if(run.conclusion==='success')return {kind:'success',label:'Check passed',detail:'The latest source check completed successfully.'};
  if(['failure','timed_out','action_required'].includes(run.conclusion))return {kind:'failure',label:'Check failed',detail:'The latest source check needs attention.'};
  return {kind:'unknown',label:'Check ended',detail:`The latest source check concluded: ${run.conclusion??'unknown'}.`};
}

export function shortCommit(run){return typeof run?.head_sha==='string'&&/^[a-f0-9]{7,40}$/i.test(run.head_sha)?run.head_sha.slice(0,7):'unavailable';}
