import { Card, Row, Col, Statistic, Tooltip, Typography } from 'antd';
import { FormOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Props {
  days7: number; days14: number; days28: number;
}

export function ConsultationStats({ days7, days14, days28 }: Props) {
  return (
    <Card
      title={<div className="flex items-center gap-2"><span>상담 신청 현황</span><Tooltip title="입양자가 브리더에게 제출한 상담 신청서 총 건수"><InfoCircleOutlined className="text-gray-400 cursor-help" /></Tooltip></div>}
      bordered={false} className="shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="mb-3"><Text type="secondary" className="text-xs">포퐁에서 입양자가 제출한 전체 상담 신청 건수입니다.</Text></div>
      <Row gutter={16}>
        {[{ v: days7, c: '#722ed1', t: '최근 7일' }, { v: days14, c: '#9254de', t: '최근 14일' }, { v: days28, c: '#b37feb', t: '최근 28일' }].map((i) => (
          <Col xs={24} sm={8} key={i.t}><Statistic title={i.t} value={i.v} prefix={<FormOutlined />} suffix="건" valueStyle={{ color: i.c, fontSize: '24px' }} /></Col>
        ))}
      </Row>
    </Card>
  );
}
