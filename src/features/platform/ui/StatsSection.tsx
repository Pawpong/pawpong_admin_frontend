import { Card, Row, Col, Statistic } from 'antd';
import type { ReactNode } from 'react';

interface StatItem {
  title: string;
  value: number;
  icon: ReactNode;
  color?: string;
}

interface StatsSectionProps {
  title: string;
  items: StatItem[];
}

/**
 * 통계 섹션 컴포넌트 - 제목 + 4열 카드 그리드
 */
export function StatsSection({ title, items }: StatsSectionProps) {
  return (
    <section className="mb-6 sm:mb-8">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <Row gutter={[16, 16]}>
        {items.map((item) => (
          <Col xs={24} sm={12} lg={6} key={item.title}>
            <Card>
              <Statistic
                title={item.title}
                value={item.value}
                prefix={item.icon}
                valueStyle={item.color ? { color: item.color } : undefined}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}
