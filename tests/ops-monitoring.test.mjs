import './register-typescript.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const format = await import('../src/features/operations/model/opsFormat.ts');

test('bytes, durations and counts read like server consoles', () => {
  assert.equal(format.formatBytes(1536), '1.5 KB');
  assert.equal(format.formatBytes(1610612736), '1.5 GB');
  assert.equal(format.formatBytes(512), '512 B');
  assert.equal(format.formatBytes(null), '—');
  assert.equal(format.formatDuration(190 * 86_400 + 18 * 3_600), '190일 18시간');
  assert.equal(format.formatDuration(125), '2분');
  assert.equal(format.formatDuration(-1), '—');
  assert.equal(format.formatCount(1234), '1,234');
  assert.equal(format.formatCount(1_284_000), '128만');
  assert.equal(format.formatMs(1520), '1.52초');
  assert.equal(format.formatMs(42.4), '42ms');
});

test('relative times never go negative or invent values', () => {
  const now = Date.parse('2026-10-09T08:00:00Z');
  assert.equal(format.formatRelative('2026-10-09T07:59:30Z', now), '방금 전');
  assert.equal(format.formatRelative('2026-10-09T07:45:00Z', now), '15분 전');
  assert.equal(format.formatRelative('2026-10-06T08:00:00Z', now), '3일 전');
  assert.equal(format.formatRelative('2026-10-09T09:00:00Z', now), '방금 전');
  assert.equal(format.formatRelative(null, now), '—');
  assert.equal(format.formatRelative('garbage', now), '—');
});

test('usage levels follow the backend thresholds', () => {
  assert.equal(format.usageLevel(79.9, format.USAGE_THRESHOLDS.cpu), 'ok');
  assert.equal(format.usageLevel(80, format.USAGE_THRESHOLDS.cpu), 'warning');
  assert.equal(format.usageLevel(90, format.USAGE_THRESHOLDS.disk), 'critical');
  assert.equal(format.usageLevel(null, format.USAGE_THRESHOLDS.memory), 'unknown');
});

test('pm2 and docker processes are judged by their own running state', () => {
  assert.equal(format.processLevel({ kind: 'pm2', state: 'online', health: null }), 'ok');
  assert.equal(format.processLevel({ kind: 'pm2', state: 'errored', health: null }), 'critical');
  assert.equal(format.processLevel({ kind: 'docker', state: 'running', health: 'unhealthy' }), 'critical');
  assert.equal(format.processLevel({ kind: 'docker', state: 'running', health: 'starting' }), 'warning');
  assert.equal(format.processLevel({ kind: 'docker', state: 'missing', health: null }), 'critical');
});
