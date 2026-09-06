import { Component, Suspense, type ReactNode } from 'react';
import { Button, Result, Spin } from 'antd';

export function PageLoading() {
  return (
    <div
      role="status"
      aria-label="화면을 불러오는 중"
      style={{ minHeight: 240, display: 'grid', placeItems: 'center' }}
    >
      <Spin size="large" />
    </div>
  );
}

/** 배포 후 오래된 청크 또는 화면 오류가 생겨도 메뉴와 복구 버튼을 유지한다. */
export class PageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <Result
          status="error"
          title="화면을 불러오지 못했어요"
          subTitle="새로고침 후 다시 시도해주세요."
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              새로고침
            </Button>
          }
        />
      );
    return <Suspense fallback={<PageLoading />}>{this.props.children}</Suspense>;
  }
}
