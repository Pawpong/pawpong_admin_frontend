import React from 'react';
import { Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useFaqCrud } from '../../features/content/hooks/useFaqCrud';
import { FaqTable } from '../../features/content/ui/FaqTable';
import { FaqModal } from '../../features/content/ui/FaqModal';

/**
 * FAQ 관리 페이지
 * 자주 묻는 질문을 관리합니다.
 */
const Faqs: React.FC = () => {
  const { faqs, loading, modal, handleDelete } = useFaqCrud();

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>FAQ 관리</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
          FAQ 추가
        </Button>
      </div>

      <Card>
        <FaqTable faqs={faqs} loading={loading} onEdit={modal.openEdit} onDelete={handleDelete} />
      </Card>

      <FaqModal
        visible={modal.modalVisible}
        editingFaq={modal.editingItem}
        form={modal.form}
        submitting={modal.submitting}
        onOk={modal.handleSubmit}
        onCancel={modal.closeModal}
      />
    </div>
  );
};

export default Faqs;
