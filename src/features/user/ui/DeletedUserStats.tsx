import React from 'react';
import { Card, Statistic, Row, Col, Tag } from 'antd';
import dayjs from 'dayjs';

import type { DeletedUserStats as DeletedUserStatsType } from '../api/userApi';

interface DeletedUserStatsProps {
  stats: DeletedUserStatsType | null;
}

/** 탈퇴 사용자 통계 카드 및 사유별 통계 섹션 */
export function DeletedUserStatsSection({ stats }: DeletedUserStatsProps) {
  if (!stats) return null;

  return (
    <>
      {/* 통계 카드 */}
      <Row gutter={[16, 16]} className="mb-6 sm:mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="전체 탈퇴 사용자" value={stats.totalDeletedUsers} suffix="명" valueStyle={{ color: '#3c3c3c' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="탈퇴한 입양자" value={stats.totalDeletedAdopters} suffix="명" valueStyle={{ color: '#005df9' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="탈퇴한 브리더" value={stats.totalDeletedBreeders} suffix="명" valueStyle={{ color: '#4f3b2e' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="최근 7일 탈퇴" value={stats.last7DaysCount} suffix="명" valueStyle={{ color: '#d97706' }} />
          </Card>
        </Col>
      </Row>

      {/* 입양자 탈퇴 사유 통계 */}
      {stats.adopterReasonStats.length > 0 && (
        <Card className="mb-6 sm:mb-8" title="입양자 탈퇴 사유 통계" style={{ marginBottom: '2rem' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.adopterReasonStats.map((stat) => (
              <div key={stat.reason} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">{stat.reasonLabel}</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-700">{stat.count}명</div>
                  <div className="text-xs text-blue-600">{stat.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 브리더 탈퇴 사유 통계 */}
      {stats.breederReasonStats.length > 0 && (
        <Card className="mb-6 sm:mb-8" title="브리더 탈퇴 사유 통계" style={{ marginBottom: '2rem' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.breederReasonStats.map((stat) => (
              <div key={stat.reason} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">{stat.reasonLabel}</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-700">{stat.count}명</div>
                  <div className="text-xs text-green-600">{stat.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 기타 사유 상세 목록 */}
      {stats.otherReasonDetails.length > 0 && (
        <Card className="mb-6 sm:mb-8" title="기타 탈퇴 사유 상세 (최근 50개)" style={{ marginBottom: '2rem' }}>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stats.otherReasonDetails.map((detail, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Tag color={detail.userType === 'adopter' ? 'blue' : 'green'}>
                  {detail.userType === 'adopter' ? '입양자' : '브리더'}
                </Tag>
                <div className="flex-1">
                  <div className="text-sm text-gray-700">{detail.reason}</div>
                  <div className="text-xs text-gray-500 mt-1">{dayjs(detail.deletedAt).format('YYYY-MM-DD HH:mm')}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
