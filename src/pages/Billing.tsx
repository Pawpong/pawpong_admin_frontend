import { Alert, Tabs } from 'antd';
import { PageHeading } from '../shared/components/admin/PageHeading';
import { ProductCatalog } from '../features/billing/ui/ProductCatalog';
import { FeaturePolicies } from '../features/billing/ui/FeaturePolicies';
import { PurchaseLedger } from '../features/billing/ui/PurchaseLedger';
import { BILLING_SALES_ENABLED, BILLING_SALES_HOLD_MESSAGE } from '../features/billing/model/release';

export default function Billing() {
  return (
    <div>
      <PageHeading
        title="놀이터 결제 관리"
        description="스토어 상품과 공통 이용권, 기능별 소비 정책 및 구매 원장을 관리합니다."
      />
      {!BILLING_SALES_ENABLED && (
        <Alert
          type="warning"
          showIcon
          message="인앱결제 판매 보류"
          description={`${BILLING_SALES_HOLD_MESSAGE} 상품은 판매 중지 상태로 준비할 수 있고, 무료 이용 정책과 기존 구매 원장·감사 기록은 계속 관리할 수 있습니다.`}
        />
      )}
      <Tabs
        destroyOnHidden
        items={[
          { key: 'products', label: '상품 카탈로그', children: <ProductCatalog /> },
          { key: 'policy', label: '기능별 이용 정책', children: <FeaturePolicies /> },
          { key: 'purchases', label: '구매 원장', children: <PurchaseLedger /> },
          { key: 'events', label: '감사 로그', children: <PurchaseLedger audit /> },
        ]}
      />
    </div>
  );
}
