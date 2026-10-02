import { Tabs } from 'antd';
import { PageHeading } from '../shared/components/admin/PageHeading';
import { ProductCatalog } from '../features/billing/ui/ProductCatalog';
import { FeaturePolicies } from '../features/billing/ui/FeaturePolicies';
import { PurchaseLedger } from '../features/billing/ui/PurchaseLedger';

export default function Billing() {
  return (
    <div>
      <PageHeading
        title="놀이터 결제 관리"
        description="스토어 상품과 공통 이용권, 기능별 소비 정책 및 구매 원장을 관리합니다."
      />
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
