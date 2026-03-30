import { Card } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface Props {
  stats: { totalApproved: number; eliteCount: number; newCount: number };
}

export function ManagementStats({ stats }: Props) {
  const items = [
    { label: '전체 승인된 브리더', value: stats.totalApproved, bg: 'var(--color-tertiary-500)', color: 'var(--color-primary-500)' },
    { label: '엘리트 브리더', value: stats.eliteCount, bg: 'var(--color-level-elite-100)', color: 'var(--color-level-elite-500)' },
    { label: '뉴 브리더', value: stats.newCount, bg: 'var(--color-level-new-100)', color: 'var(--color-level-new-500)' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {items.map((item) => (
        <Card key={item.label} style={{ borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg" style={{ backgroundColor: item.bg }}>
              <UserOutlined style={{ fontSize: '24px', color: item.color }} />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">{item.label}</p>
              <p className="text-xl sm:text-2xl font-bold" style={{ color: item.color }}>{item.value}명</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
