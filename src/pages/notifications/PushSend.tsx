import { PageHeading } from '../../shared/components/admin/PageHeading';
import { AdminPushSendForm } from '../../features/notification/ui/AdminPushSendForm';

/**
 * 어드민 푸시 발송 페이지
 * 입양자/브리더 전체 또는 개별 사용자 대상 FCM 푸시 + in-app 알림 doc 동시 저장.
 */
export default function PushSend() {
  return (
    <div>
      <PageHeading
        title="푸시 발송"
        description="입양자·브리더 전체 또는 개별 사용자에게 푸시 알림을 보내고 발송 결과를 확인합니다."
      />
      <AdminPushSendForm />
    </div>
  );
}
