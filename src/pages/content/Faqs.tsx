import React from 'react';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useFaqCrud } from '../../features/content/hooks/useFaqCrud';
import { FaqTable } from '../../features/content/ui/FaqTable';
import { FaqModal } from '../../features/content/ui/FaqModal';

/**
 * FAQ 관리 페이지
 * 자주 묻는 질문을 관리합니다.
 */
const Faqs: React.FC = () => {
  const { faqs, loading, error, refetch, modal, handleDelete } = useFaqCrud();

  return (
    <div>
      <PageHeading
        title="자주 묻는 질문"
        description="입양자·브리더에게 보여줄 질문과 답변을 카테고리, 대상, 노출 순서별로 관리합니다."
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
            FAQ 추가
          </Button>
        }
      />
      <LoadError error={error} retry={refetch} />
      <FaqTable faqs={faqs} loading={loading} onEdit={modal.openEdit} onDelete={handleDelete} />

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
