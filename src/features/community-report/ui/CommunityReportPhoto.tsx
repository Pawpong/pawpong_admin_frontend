import { useEffect, useState } from 'react';
import { Alert, Button, Image, Spin } from 'antd';
import { getCommunityReportPhoto } from '../api/communityReportApi';
import { captureAdminRequestSession, isCurrentAdminRequestSession } from '../../../shared/api/adminRequestSession';

interface Props {
  reportId: string;
  index: number;
  sourceVersion: string;
}

export function CommunityReportPhoto({ reportId, index, sourceVersion }: Props) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ attempt: number; url?: string; error?: string }>();
  useEffect(() => {
    if (!attempt) return;
    const controller = new AbortController();
    const session = captureAdminRequestSession();
    let url: string | undefined;
    getCommunityReportPhoto(reportId, index, sourceVersion, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted || !isCurrentAdminRequestSession(session)) return;
        url = URL.createObjectURL(blob);
        setResult({ attempt, url });
      })
      .catch(() => {
        if (!controller.signal.aborted && isCurrentAdminRequestSession(session)) {
          setResult({
            attempt,
            error: '사진 또는 접근 권한이 변경되었을 수 있어요. 다시 시도하거나 상세 내용을 새로 확인해 주세요.',
          });
        }
      });
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [attempt, reportId, index, sourceVersion]);
  const current = result?.attempt === attempt ? result : undefined;
  return (
    <div style={{ border: '1px solid #e8e3d9', borderRadius: 12, padding: 12, minWidth: 0 }}>
      <p style={{ marginTop: 0 }}>첨부 사진 {index + 1}</p>
      {current?.url ? (
        <Image
          src={current.url}
          alt={`신고된 글의 첨부 사진 ${index + 1}`}
          style={{ width: '100%', maxHeight: 320, objectFit: 'contain' }}
        />
      ) : attempt > 0 && !current ? (
        <Spin aria-label={`첨부 사진 ${index + 1} 확인 중`} />
      ) : (
        <>
          {current?.error && <Alert type="warning" message={current.error} style={{ marginBottom: 8 }} />}
          <Button onClick={() => setAttempt((value) => value + 1)}>
            {current?.error ? '사진 다시 확인' : '사진 보기'}
          </Button>
        </>
      )}
    </div>
  );
}
