import { useCallback, useRef, useState } from 'react';
import { App as AntdApp } from 'antd';

import { notificationAdminApi, type AdminPushResult, type SendAdminPushRequest } from '../api/notificationAdminApi';

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
  const inFlight = useRef(false);

  const send = useCallback(
    async (payload: SendAdminPushRequest): Promise<AdminPushResult | null> => {
      if (inFlight.current) return null;
      inFlight.current = true;
      setSubmitting(true);
      try {
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

        setLastResult(null);
        const result = await notificationAdminApi.sendPush(payload);
        setLastResult(result);
        const detail = `대상 ${result.recipients}명, 앱 알림 ${result.notificationsCreated}건, FCM 접수 ${result.pushSuccess}/${result.pushTokensTargeted}개`;
        if (
          result.pushFailed > 0 ||
          result.pushTokensTargeted === 0 ||
          result.notificationsCreated < result.recipients
        ) {
          message.warning(`발송 결과 확인 필요 — ${detail}`);
        } else message.success(`발송 요청 처리 완료 — ${detail}`);
        return result;
      } catch (error: unknown) {
        const err = error as { code?: string; response?: { data?: { message?: string | string[] } } };
        const detail = err.response?.data?.message;
        message.error(
          err.code === 'ECONNABORTED'
            ? '발송 결과를 기다리는 시간이 초과되었습니다. 중복 발송을 피하려면 알림 이력을 확인한 후 다시 시도해주세요.'
            : Array.isArray(detail)
              ? detail.join(' / ')
              : (detail ?? '푸시 발송에 실패했습니다.'),
        );
        return null;
      } finally {
        inFlight.current = false;
        setSubmitting(false);
      }
    },
    [message, modal],
  );

  return { submitting, lastResult, send } as const;
}
