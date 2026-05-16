import { Card, Row, Col, Statistic, Tooltip } from 'antd';

interface Props {
  totalRejections: number; resubmissions: number; resubmissionRate: number; resubmissionApprovalRate: number;
}

const ITEMS: { key: keyof Props; title: string; tooltip: string; color: string; suffix?: string }[] = [
  { key: 'totalRejections', title: '총 반려 건수', tooltip: '인증 심사에서 반려된 총 건수', color: '#ff4d4f' },
  { key: 'resubmissions', title: '재제출 건수', tooltip: '반려 후 서류를 다시 제출한 건수', color: '#1890ff' },
  { key: 'resubmissionRate', title: '재제출 비율', tooltip: '반려 건 중 재제출한 비율', color: '#722ed1', suffix: '%' },
  { key: 'resubmissionApprovalRate', title: '재제출 후 승인율', tooltip: '재제출 후 최종 승인된 비율', color: '#52c41a', suffix: '%' },
];

export function ResubmissionStats(props: Props) {
  return (
    <Row gutter={[16, 16]}>
      {ITEMS.map((item) => (
        <Col xs={24} sm={12} lg={6} key={item.key}>
          <Card className="shadow-sm hover:shadow-md transition-shadow text-center">
            <Statistic
              title={<Tooltip title={item.tooltip}><span className="cursor-help">{item.title}</span></Tooltip>}
              value={props[item.key]}
              suffix={item.suffix || '건'}
              precision={item.suffix === '%' ? 0 : undefined}
              valueStyle={{ color: item.color }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
