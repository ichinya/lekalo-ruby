const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const {join} = require('node:path');
const {test} = require('node:test');

function inspect(paths) {
  const request = {
    protocol: 'lekalo/runtime/v1',
    request_id: 'sha256:' + 'a'.repeat(64),
    operation: 'discovery.inspect',
    input: {schema: 'lekalo/discovery/v1', files: paths.map(path => ({path})), reads: []},
  };
  const run = spawnSync(process.execPath, [join(__dirname, '../bin/discovery.cjs')], {
    input: JSON.stringify(request), encoding: 'utf8',
  });
  assert.ifError(run.error);
  assert.equal(run.status, 0, run.stderr);
  const response = JSON.parse(run.stdout);
  assert.equal(response.protocol, request.protocol);
  assert.equal(response.request_id, request.request_id);
  return response.result;
}

test('manifest discovery preserves relative paths and ignores unrelated names', () => {
  const names = ['Gemfile', 'app/Gemfile', 'Gemfile.lock', 'app/gemfile', 'pom.xml'];
  const observed = inspect(names);
  const paths = ['Gemfile', 'app/Gemfile'];
  assert.deepEqual(observed.manifests, paths.map(path => ({path, detail: 'ruby'})));
  assert.deepEqual(observed.hints, paths.map(path => ({
    path, label: 'ruby', kind: 'language', field: null, confidence: 'medium',
  })));
  assert.deepEqual(observed.workspaces, []);
});
