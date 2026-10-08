import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import '../register-typescript.mjs';
const { supportConversationView } = await import('../../src/features/support/model/supportConversation.ts');

test('1:1 문의로 접수된 건은 유형과 참조 코드와 사용자가 보낸 초안을 정리해 보여줌', () => {
  const view = supportConversationView({
    category: 'level_exp',
    referenceCode: 'LV-2026-0001',
    draft: {
      title: ' 레벨이 내려갔어요 ',
      summary: '어제 글을 지운 뒤 레벨이 내려갔어요.',
      conditions: ['글 삭제 후', ''],
      additionalInfo: ['마이홈 기록 확인함', 3],
    },
  });
  assert.deepEqual(view, {
    categoryLabel: '레벨/EXP',
    referenceCode: 'LV-2026-0001',
    title: '레벨이 내려갔어요',
    summary: '어제 글을 지운 뒤 레벨이 내려갔어요.',
    conditions: ['글 삭제 후'],
    additionalInfo: ['마이홈 기록 확인함'],
  });
});

test('대화 정보가 없거나 모르는 유형이면 기존 접수 표시를 유지하거나 기타로 보여줌', () => {
  assert.equal(supportConversationView(undefined), null);
  assert.equal(supportConversationView(null), null);
  const unknown = supportConversationView({ category: 'new_kind' });
  assert.equal(unknown.categoryLabel, '기타');
  assert.equal(unknown.referenceCode, null);
  assert.deepEqual(unknown.conditions, []);
});

test('고객지원 화면은 대화 원문 대신 사용자가 확인한 초안만 보여줌', () => {
  const page = readFileSync('src/pages/Support.tsx', 'utf8');
  assert.match(page, /1:1 문의 · \$\{conversation\.categoryLabel\}/);
  assert.match(
    page,
    /\{selectedConversation && <SupportConversationSummary conversation=\{selectedConversation\} \/>\}/,
  );
  assert.doesNotMatch(page, /conversation\.messages|messages\.map/);
});
