import { useEffect, useState } from 'react';
import { Alert, Spin, Tabs } from 'antd';
import { PageHeading, LoadError } from '../../shared/components/admin/PageHeading';
import { appSplashApi, type AppSplash as SplashConfig } from '../../features/app-splash/api/appSplashApi';
import { SplashEditor } from '../../features/app-splash/ui/SplashEditor';
import './app-splash.css';

/** 앱 시작 화면을 플랫폼별로 관리한다. 조회 실패 시 저장 폼을 열지 않는다. */
export default function AppSplash() {
  const [items, setItems] = useState<SplashConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    appSplashApi.list().then((data) => { if (active) { setItems(data); setError(null); } })
      .catch(() => { if (active) setError('스플래시 설정을 불러오지 못했습니다.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  return (
    <div>
      <PageHeading title="앱 시작 화면" description="iOS·Android 앱의 시작 이미지와 표시 시간을 관리합니다." />
      <Alert type="info" showIcon message="저장하면 다음 앱 실행부터 적용됩니다." description="통신이나 이미지 로딩에 실패하면 기본 포퐁 로고를 사용합니다. 앱 아이콘과 OS가 처음 표시하는 로고는 앱 업데이트로 변경됩니다." style={{ marginBottom: 24 }} />
      <LoadError error={error ?? undefined} retry={() => { setLoading(true); setAttempt((value) => value + 1); }} />
      {loading ? <Spin aria-label="스플래시 설정 불러오는 중" /> : !error && (
        <Tabs items={items.map((item) => ({ key: item.platform, label: item.platform === 'ios' ? 'iOS' : 'Android', children: <SplashEditor initial={item} /> }))} />
      )}
    </div>
  );
}
