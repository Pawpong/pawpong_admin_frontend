/**
 * 간단한 테스트용 Dashboard
 * 에러 없이 렌더링되는지 확인용
 */
export default function DashboardSimple() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>🐾 Pawpong Admin Dashboard</h1>
      <p style={{ fontSize: '16px', color: '#666' }}>어드민 대시보드가 정상적으로 로드되었습니다!</p>
      <div
        style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f0f0f0',
          borderRadius: '8px',
        }}
      >
        <p>
          <strong>현재 시간:</strong> {new Date().toLocaleString('ko-KR')}
        </p>
        <p>
          <strong>상태:</strong> ✅ 정상
        </p>
      </div>
    </div>
  );
}
