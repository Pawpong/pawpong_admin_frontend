import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const dependency = require(
  require.resolve('minimatch', {
    paths: [path.dirname(require.resolve('eslint/package.json'))],
  }),
);
const matches = typeof dependency === 'function' ? dependency : dependency.minimatch;

test('자동 배포는 개발과 운영 브랜치만 명시적으로 허용함', () => {
  assert.deepEqual(config.git.deploymentEnabled, { '**': false, dev: true, main: true });
});

test('슬래시와 중첩 경로가 있는 기능 브랜치는 배포하지 않음', () => {
  const allowed = (branch) => {
    const rules = Object.entries(config.git.deploymentEnabled).filter(([pattern]) => matches(branch, pattern));
    return rules.length ? rules.some(([, enabled]) => enabled) : true;
  };
  for (const branch of ['dev', 'main']) assert.equal(allowed(branch), true, branch);
  for (const branch of ['kscold/admin-noindex-main', 'feature/nested/change', 'test', 'dev-backup', 'main-fix'])
    assert.equal(allowed(branch), false, branch);
});

test('관리자 경로 재작성은 보존하고 사후 빌드 건너뛰기를 사용하지 않음', () => {
  assert.deepEqual(config.rewrites, [{ source: '/(.*)', destination: '/index.html' }]);
  assert.equal(config.ignoreCommand, undefined);
});
