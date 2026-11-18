import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import test from 'node:test';

test('locked discovery finds the project from a nested directory', t => {
  const scratch = mkdtempSync(join(process.env.BB_THREAD_STORAGE ?? tmpdir(), 'lekalo-discovery-'));
  t.after(() => rmSync(scratch, {recursive: true, force: true}));
  const env = {...process.env, LEKALO_PACKAGE_HOME: join(scratch, 'cache')};
  delete env.LEKALO_SERVICES;
  delete env.LEKALO_PROJECT;
  function invoke(cwd, ...args) {
    const binary = process.env.LEKALO_BIN ?? resolve('target/debug/lekalo');
    const run = spawnSync(binary, ['--json', ...args], {cwd, env, encoding: 'utf8', timeout: 120_000});
    assert.ifError(run.error);
    assert.equal(run.status, 0, run.stderr);
    return JSON.parse(run.stdout);
  }
  for (const [language, marker, basis] of [
    ['ruby', 'Gemfile', 'manifest'],
  ]) {
    const root = join(scratch, marker);
    const nested = join(root, 'subdirectory');
    mkdirSync(nested, {recursive: true});
    writeFileSync(join(root, marker), '');
    const adopt = () => invoke(nested, 'init', '--adopt', '--dry-run').detection;
    // Manifest names alone no longer grant the host a language selection.
    assert.equal(adopt().basis, 'invocation-directory');
    writeFileSync(join(root, 'lekalo.yaml'), JSON.stringify({
      schema: 'lekalo/runtime-config/v1', components: {},
      services: {['discovery/' + language]: 'path:' + process.cwd()},
    }));
    invoke(root, 'runtime', 'lock');
    const detection = adopt();
    assert.equal(detection.basis, basis);
    assert.deepEqual(detection.candidates, ['..']);
    assert.ok(detection.manifests.some(m => m.path === marker && m.detail === language));
  }
});
