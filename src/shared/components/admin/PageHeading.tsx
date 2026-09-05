import type { ReactNode } from 'react';
import { Alert, Button } from 'antd';

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="page-eyebrow">PAWPONG WORKSPACE</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action && <div className="page-actions">{action}</div>}
    </div>
  );
}
export function LoadError({ error, retry }: { error?: string; retry: () => void }) {
  return error ? (
    <Alert
      type="error"
      showIcon
      message="데이터를 불러오지 못했어요"
      description={error}
      action={<Button onClick={retry}>다시 시도</Button>}
    />
  ) : null;
}
export function Metric({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}
