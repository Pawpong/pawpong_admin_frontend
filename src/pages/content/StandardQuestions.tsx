import React from 'react';
import { LoadError, Metric, PageHeading } from '../../shared/components/admin/PageHeading';
import { Button, Space, Popconfirm } from 'antd';
import { SortAscendingOutlined, ReloadOutlined } from '@ant-design/icons';

import { useStandardQuestionCrud } from '../../features/content/hooks/useStandardQuestionCrud';
import { StandardQuestionTable } from '../../features/content/ui/StandardQuestionTable';
import { StandardQuestionModal } from '../../features/content/ui/StandardQuestionModal';
import { StandardQuestionReorderModal } from '../../features/content/ui/StandardQuestionReorderModal';

/**
 * 표준 질문 관리 페이지
 * 입양 신청서의 17가지 표준 질문을 관리합니다.
 */
const StandardQuestions: React.FC = () => {
  const { questions, loading, error, refetch, modal, reorder, handleToggleStatus, handleReseed } = useStandardQuestionCrud();

  return (
    <div>
      <PageHeading
        title="표준 질문 관리"
        description="입양 신청서에 쓰는 표준 질문의 내용, 응답 타입, 필수 여부와 노출 순서를 관리합니다."
        action={
          <Space>
            <Button icon={<SortAscendingOutlined />} onClick={reorder.openReorder}>
              순서 변경
            </Button>
            <Popconfirm
              title="표준 질문 초기화"
              description="모든 질문을 기본 설정으로 초기화하시겠습니까?"
              onConfirm={handleReseed}
              okText="초기화"
              cancelText="취소"
              okButtonProps={{ danger: true }}
            >
              <Button icon={<ReloadOutlined />} danger>
                초기화
              </Button>
            </Popconfirm>
          </Space>
        }
      />
      <LoadError error={error} retry={refetch} />
      <div className="metric-grid metric-grid-single">
        <Metric label="등록된 질문" value={`${questions.length.toLocaleString()}개`} />
      </div>
      <StandardQuestionTable
        questions={questions}
        loading={loading}
        onEdit={modal.openEdit}
        onToggleStatus={handleToggleStatus}
      />

      <StandardQuestionModal
        visible={modal.modalVisible}
        editingQuestion={modal.editingQuestion}
        form={modal.form}
        onOk={modal.handleSubmit}
        onCancel={modal.closeModal}
      />

      <StandardQuestionReorderModal
        visible={reorder.reorderModalVisible}
        questions={questions}
        form={reorder.reorderForm}
        onOk={reorder.handleReorderSubmit}
        onCancel={reorder.closeReorder}
      />
    </div>
  );
};

export default StandardQuestions;
