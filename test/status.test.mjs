import test from 'node:test';
import assert from 'node:assert/strict';
import {latestRun,runSignal,shortCommit,sources,repository} from '../lib/status.mjs';

test('shows the newest source run, regardless of API array order',() => {
  const old={event:'push',created_at:'2026-10-20T10:00:00Z',html_url:'https://github.com/old'};
  const recent={event:'push',created_at:'2026-10-21T10:00:00Z',html_url:'https://github.com/recent'};
  const other={event:'pull_request',created_at:'2026-10-22T10:00:00Z',html_url:'https://github.com/other'};
  assert.equal(latestRun({workflow_runs:[old,other,recent]},'push'),recent);
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
  assert.equal(repository,'hexrift/hamsa-tech-operations');
  assert.deepEqual(sources.map(source=>source.event),['pull_request','push','workflow_dispatch']);
});
