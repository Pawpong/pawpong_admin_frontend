import { useEffect, useRef, useState } from 'react';
import { Alert, App, Button, Card, Popconfirm, Space, Table, Tag } from 'antd';
import { backupApi, type BackupJob } from '../../features/operations/api/backupApi';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useRemoteData } from '../../shared/hooks/useRemoteData';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';

function BackupContent() {
  const state = useRemoteData(backupApi.list);
  const { message } = App.useApp();
  const [pending, setPending] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    const timer = window.setInterval(state.reload, 15000);
    return () => window.clearInterval(timer);
  }, [state.reload]);
  const active = state.data?.jobs.some(job => ['active', 'waiting', 'delayed'].includes(job.status));
  async function requestBackup() {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    try {
      const result = await backupApi.request();
      message.success(`백업 요청 접수 · ${result.jobId}`);
      state.reload();
    } catch {
      message.error('요청 상태를 확인하지 못했습니다. 목록을 새로고침한 뒤 다시 시도하세요.');
      state.reload();
    } finally { lock.current = false; setPending(false); }
  }
  return <>
    <PageHeading title="운영 DB 백업" description="prod 데이터베이스만 암호화해 비공개 S3에 보관합니다."
      action={<Space wrap>
        <Button onClick={state.reload}>새로고침</Button>
        <Popconfirm title="prod 백업을 실행할까요?" description="데이터는 변경하지 않으며 완료까지 시간이 걸릴 수 있습니다."
          onConfirm={requestBackup} okText="백업 요청" cancelText="취소" disabled={!state.data?.enabled || active || pending}>
          <Button type="primary" loading={pending} disabled={!state.data?.enabled || active}>지금 백업</Button>
        </Popconfirm>
      </Space>} />
    <LoadError error={state.error} retry={state.reload} />
    {state.data && !state.data.enabled && <Alert type="warning" showIcon message="운영 백업이 아직 활성화되지 않았습니다."
      description="Control의 전용 키 설정과 백업 워커 준비를 확인하세요. 로컬에서는 실행할 수 없습니다." />}
    <Alert type="info" showIcon message="완료는 암호화 파일 업로드 완료를 뜻합니다."
      description="실시간 논리 백업은 단일 시점 스냅샷이 아닙니다. 복원 검증은 별도 격리 DB에서 진행하며 이 화면에서는 운영 복원·삭제를 제공하지 않습니다." />
    <Card title="최근 백업 50건">
      <Table<BackupJob> rowKey="jobId" loading={state.loading} dataSource={state.data?.jobs || []} scroll={{ x: 760 }}
        locale={{ emptyText: state.error ? '조회 실패' : '백업 이력이 없습니다.' }} columns={[
          { title: '요청 ID', dataIndex: 'jobId' },
          { title: '실행', dataIndex: 'trigger', render: value => value === 'scheduled' ? '자동' : '수동' },
          { title: '상태', dataIndex: 'status', render: value => <Tag color={value === 'completed' ? 'green' : value === 'failed' ? 'red' : 'blue'}>
            {({ completed: '업로드 완료', failed: '실패', active: '진행 중', waiting: '대기 중' } as Record<string, string>)[value] || value}</Tag> },
          { title: '요청 시각', dataIndex: 'createdAt', render: value => new Date(value).toLocaleString('ko-KR') },
          { title: '암호화 크기', render: (_, row) => row.result ? `${(row.result.bytes / 1024 / 1024).toFixed(1)} MB` : '—' },
          { title: '복원 검증', render: (_, row) => row.result?.restoreVerified ? '검증됨' : '미검증' },
        ]} />
    </Card>
  </>;
}
export default function ProductionBackups() {
  const allowed = useAuthStore(state => state.user?.permissions?.canManageAdmins);
  return allowed ? <BackupContent /> : <Alert type="warning" message="백업 관리 권한이 필요합니다." />;
}
