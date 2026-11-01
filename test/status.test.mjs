import test from 'node:test';
import assert from 'node:assert/strict';
import {latestRun,runSignal,shortCommit,sources} from '../lib/status.mjs';

test('shows the newest source run, regardless of API array order',() => {
  const old={created_at:'2026-10-20T10:00:00Z',html_url:'https://github.com/old'};
  const recent={created_at:'2026-10-21T10:00:00Z',html_url:'https://github.com/recent'};
  assert.equal(latestRun({workflow_runs:[old,recent]}),recent);
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
test('all sources are public GitHub repositories',() => {
  assert.equal(sources.length,3);
  for (const source of sources) assert.match(source.repo,/^hexrift\/[A-Za-z0-9_.-]+$/);
});
