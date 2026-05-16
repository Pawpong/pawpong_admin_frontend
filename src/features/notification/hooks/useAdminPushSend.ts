import { useCallback, useState } from 'react';
import { App as AntdApp } from 'antd';

import {
  notificationAdminApi,
  type AdminPushResult,
  type SendAdminPushRequest,
} from '../api/notificationAdminApi';

/**
 * 어드민 푸시 발송 훅
 *
 * 발송 진행 상태(submitting), 마지막 발송 결과(lastResult), 발송 트리거(send)를 제공한다.
 * 결과 화면에서 토큰 카운트(시도/성공/실패/invalid)를 그대로 보여줄 수 있도록
 * 백엔드 AdminPushResultResponseDto 를 그대로 노출한다.
 */
export function useAdminPushSend() {
  const { message, modal } = AntdApp.useApp();
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<AdminPushResult | null>(null);

  const send = useCallback(
    async (payload: SendAdminPushRequest): Promise<AdminPushResult | null> => {
      // 전체 발송은 영향 범위가 크므로 한 번 더 확인 받는다.
      if (payload.target.type !== 'individual') {
        const ok = await new Promise<boolean>((resolve) => {
          modal.confirm({
            title: '전체 푸시 발송 확인',
            content:
              payload.target.type === 'all_adopters'
                ? '입양자 전체에게 푸시를 발송합니다. 진행할까요?'
                : '브리더 전체에게 푸시를 발송합니다. 진행할까요?',
            okText: '발송',
            okType: 'danger',
            cancelText: '취소',
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
          });
        });
        if (!ok) return null;
      }

      setSubmitting(true);
      try {
        const result = await notificationAdminApi.sendPush(payload);
        setLastResult(result);
        message.success(
          `발송 완료 — 대상 ${result.recipients}명, 토큰 ${result.pushSuccess}/${result.pushTokensTargeted} 성공`,
        );
        return result;
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        message.error(err.response?.data?.message ?? '푸시 발송에 실패했습니다.');
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [message, modal],
  );

  return { submitting, lastResult, send } as const;
}
