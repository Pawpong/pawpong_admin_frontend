import { Card, Row, Col, Statistic, Tooltip } from 'antd';
import { UserOutlined, TeamOutlined, InfoCircleOutlined } from '@ant-design/icons';

interface Props {
  adopters7: number; adopters14: number; adopters28: number;
  breeders7: number; breeders14: number; breeders28: number;
}

const TitleWithTooltip = ({ title, tooltip }: { title: string; tooltip: string }) => (
  <div className="flex items-center gap-2"><span>{title}</span><Tooltip title={tooltip}><InfoCircleOutlined className="text-gray-400 cursor-help" /></Tooltip></div>
);

export function ActiveUserStats({ adopters7, adopters14, adopters28, breeders7, breeders14, breeders28 }: Props) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title={<TitleWithTooltip title="입양자 접속 현황" tooltip="해당 기간 내 로그인한 입양자 수" />} bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
          <Row gutter={16}>
            {[{ v: adopters7, c: '#3f8600', t: '최근 7일' }, { v: adopters14, c: '#52c41a', t: '최근 14일' }, { v: adopters28, c: '#73d13d', t: '최근 28일' }].map((i) => (
              <Col span={8} key={i.t}><Statistic title={i.t} value={i.v} prefix={<UserOutlined />} suffix="명" valueStyle={{ color: i.c, fontSize: '24px' }} /></Col>
            ))}
          </Row>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title={<TitleWithTooltip title="브리더 접속 현황" tooltip="해당 기간 내 로그인한 브리더 수" />} bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
          <Row gutter={16}>
            {[{ v: breeders7, c: '#1677ff', t: '최근 7일' }, { v: breeders14, c: '#1890ff', t: '최근 14일' }, { v: breeders28, c: '#40a9ff', t: '최근 28일' }].map((i) => (
              <Col span={8} key={i.t}><Statistic title={i.t} value={i.v} prefix={<TeamOutlined />} suffix="명" valueStyle={{ color: i.c, fontSize: '24px' }} /></Col>
            ))}
          </Row>
        </Card>
      </Col>
    </Row>
  );
}
