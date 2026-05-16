import { Card, Table, Tabs, Typography } from 'antd';
import { EnvironmentOutlined, FilterOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface FilterItem { filterValue: string; usageCount: number; }
interface Props { topLocations: FilterItem[]; topBreeds: FilterItem[]; }

const rankColumn = { title: '순위', dataIndex: 'rank', key: 'rank', width: 80, render: (_: unknown, __: unknown, i: number) => <span className="font-semibold text-gray-600">{i + 1}</span> };
const valueColumn = { title: '필터 값', dataIndex: 'filterValue', key: 'filterValue', render: (v: string) => <span className="font-medium">{v || '-'}</span> };

export function FilterUsageStats({ topLocations, topBreeds }: Props) {
  return (
    <Card className="shadow-sm">
      <div className="mb-3"><Text type="secondary" className="text-xs">승인된 브리더들의 지역 및 품종별 분포입니다.</Text></div>
      <Tabs defaultActiveKey="locations" items={[
        {
          key: 'locations',
          label: <span className="flex items-center gap-1"><EnvironmentOutlined />지역별 브리더</span>,
          children: <Table dataSource={topLocations} columns={[rankColumn, valueColumn, { title: '브리더 수', dataIndex: 'usageCount', key: 'usageCount', render: (c: number) => <span className="text-blue-600 font-semibold">{c.toLocaleString()}명</span> }]} rowKey="filterValue" pagination={false} size="small" locale={{ emptyText: '데이터가 없습니다.' }} />,
        },
        {
          key: 'breeds',
          label: <span className="flex items-center gap-1"><FilterOutlined />품종별 분양 개체</span>,
          children: <Table dataSource={topBreeds} columns={[rankColumn, valueColumn, { title: '분양 개체 수', dataIndex: 'usageCount', key: 'usageCount', render: (c: number) => <span className="text-purple-600 font-semibold">{c.toLocaleString()}마리</span> }]} rowKey="filterValue" pagination={false} size="small" locale={{ emptyText: '데이터가 없습니다.' }} />,
        },
      ]} />
    </Card>
  );
}
