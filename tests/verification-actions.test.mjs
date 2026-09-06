import './register-typescript.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const { canChangeVerification } = await import('../src/features/breeder/model/verificationActions.ts');
test('completed and unknown verifications cannot be approved or reopened', () => {
  for (const current of ['approved', 'rejected', undefined, 'unexpected']) {
    for (const next of ['reviewing', 'approved', 'rejected']) assert.equal(canChangeVerification(current, next), false);
  }
});
test('pending applications must enter review before a decision', () => {
  assert.equal(canChangeVerification('pending', 'reviewing'), true);
  assert.equal(canChangeVerification('pending', 'approved'), false);
  assert.equal(canChangeVerification('pending', 'rejected'), false);
});
test('reviewing applications allow decisions without repeated review transition', () => {
  assert.equal(canChangeVerification('reviewing', 'approved'), true);
  assert.equal(canChangeVerification('reviewing', 'rejected'), true);
  assert.equal(canChangeVerification('reviewing', 'reviewing'), false);
});
