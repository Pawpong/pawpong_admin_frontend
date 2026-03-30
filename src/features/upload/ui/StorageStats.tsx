import { Card, Statistic, Row, Col } from 'antd';
import { CloudOutlined, FileImageOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';

import { formatFileSize } from '../hooks/useStorageManager';

interface Props {
  totalFiles: number;
  totalSize: number;
  globalStats: { referenced: number; orphaned: number };
}

export function StorageStats({ totalFiles, totalSize, globalStats }: Props) {
  return (
    <Row gutter={16}>
      <Col xs={24} sm={6}><Card><Statistic title="전체 파일" value={totalFiles} prefix={<CloudOutlined />} suffix="개" /></Card></Col>
      <Col xs={24} sm={6}><Card><Statistic title="전체 용량" value={formatFileSize(totalSize)} prefix={<FileImageOutlined />} /></Card></Col>
      <Col xs={24} sm={6}><Card><Statistic title="DB 참조 중" value={globalStats.referenced} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} suffix="개" valueStyle={{ color: '#52c41a' }} /></Card></Col>
      <Col xs={24} sm={6}><Card><Statistic title="미사용 (고아 파일)" value={globalStats.orphaned} prefix={<WarningOutlined style={{ color: '#faad14' }} />} suffix="개" valueStyle={{ color: '#faad14' }} /></Card></Col>
    </Row>
  );
}
