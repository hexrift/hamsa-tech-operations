import test from 'node:test';
import assert from 'node:assert/strict';
import {latestRun,runSignal,shortCommit,sources,repository} from '../lib/status.mjs';

test('shows the newest source run, regardless of API array order',() => {
  const old={event:'push',created_at:'2026-10-20T10:00:00Z',html_url:'https://github.com/old'};
  const recent={event:'push',created_at:'2026-10-21T10:00:00Z',html_url:'https://github.com/recent'};
  const other={event:'pull_request',created_at:'2026-10-22T10:00:00Z',html_url:'https://github.com/other'};
  assert.equal(latestRun({workflow_runs:[old,other,recent]},'push'),recent);
});
test('platform signals stay on the main release and hosted browser workflows',() => {
  const main={event:'push',head_branch:'main',path:'hexrift/meridian-vale-platform/.github/workflows/ci.yml',created_at:'2026-11-01T10:00:00Z',html_url:'https://github.com/main'};
  const branch={...main,head_branch:'feature',created_at:'2026-11-01T11:00:00Z',html_url:'https://github.com/branch'};
  assert.equal(latestRun({workflow_runs:[branch,main]},'push',sources[1]),main);
  const hosted={event:'workflow_dispatch',path:'hexrift/meridian-vale-platform/.github/workflows/browser-journey.yml',created_at:'2026-11-01T10:00:00Z',html_url:'https://github.com/hosted'};
  const other={...hosted,path:'hexrift/meridian-vale-platform/.github/workflows/other.yml',created_at:'2026-11-01T11:00:00Z',html_url:'https://github.com/other'};
  assert.equal(latestRun({workflow_runs:[other,hosted]},'workflow_dispatch',sources[2]),hosted);
});
test('distinguishes a passed check from a failed or pending check',() => {
  assert.equal(runSignal({status:'completed',conclusion:'success'}).label,'Check passed');
  assert.equal(runSignal({status:'completed',conclusion:'failure'}).label,'Check failed');
  assert.equal(runSignal({status:'in_progress'}).label,'In progress');
});
test('only displays a plausible commit prefix',() => {
  assert.equal(shortCommit({head_sha:'abcdef1234567890'}),'abcdef1');
  assert.equal(shortCommit({head_sha:'bad sha'}),'unavailable');
});
test('all signals come from the Meridian Vale staging repository',() => {
  assert.equal(sources.length,3);
  assert.equal(repository,'hexrift/meridian-vale-platform');
  assert.deepEqual(sources.map(source=>source.event),['pull_request','push','workflow_dispatch']);
});
