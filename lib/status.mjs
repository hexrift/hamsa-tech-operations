export const sources = [
  {number:'01', name:'Hamsa Tech Operations', repo:'hexrift/hamsa-tech-operations', description:'This staging portal and its deployment pipeline.'},
  {number:'02', name:'Tamperward', repo:'hexrift/tamperward', description:'Public package build and release checks.'},
  {number:'03', name:'WardOS', repo:'hexrift/WardOS', description:'Public platform and delivery checks.'}
];

export function latestRun(data) {
  const runs = Array.isArray(data?.workflow_runs) ? data.workflow_runs : [];
  return runs.filter(run => run && run.html_url && run.created_at)
    .sort((a,b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0] ?? null;
}

export function runSignal(run) {
  if (!run) return {kind:'unknown', label:'No public run', detail:'No public Actions run is available yet.'};
  if (run.status !== 'completed') return {kind:'pending', label:'In progress', detail:'The latest public check has not finished.'};
  if (run.conclusion === 'success') return {kind:'success', label:'Check passed', detail:'The latest public Actions run completed successfully.'};
  if (run.conclusion === 'failure' || run.conclusion === 'timed_out' || run.conclusion === 'action_required') return {kind:'failure', label:'Check failed', detail:'The latest public Actions run needs attention.'};
  return {kind:'unknown', label:'Check ended', detail:`The latest public Actions run concluded: ${run.conclusion ?? 'unknown'}.`};
}

export function shortCommit(run) {
  return typeof run?.head_sha === 'string' && /^[a-f0-9]{7,40}$/i.test(run.head_sha) ? run.head_sha.slice(0,7) : 'unavailable';
}
