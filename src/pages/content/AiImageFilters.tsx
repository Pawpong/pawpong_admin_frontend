import { Button } from 'antd';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
import { PlusOutlined } from '@ant-design/icons';

import { useAiImageAgentHealth } from '../../features/ai-image/hooks/useAiImageAgentHealth';
import { useAiImageFilterCrud } from '../../features/ai-image/hooks/useAiImageFilterCrud';
import { AiImageAgentStatus } from '../../features/ai-image/ui/AiImageAgentStatus';
import { AiImageFilterModal } from '../../features/ai-image/ui/AiImageFilterModal';
import { AiImageFilterTable } from '../../features/ai-image/ui/AiImageFilterTable';

/**
 * AI 필터 관리 페이지.
 *
 * 사용자가 반려동물 사진을 변환할 때 고르는 필터를 등록·수정한다.
 * 저장 전에 프롬프트를 시험할 수 있고, 그 시험은 AI Agent 를 동기(gRPC)로 호출하므로
 * 에이전트 상태를 화면 위에 함께 띄운다.
 */
const AiImageFilters = () => {
  const { filters, loading, error, refetch, modal, assets, preview, handleDelete, handleToggleActive } = useAiImageFilterCrud();
  const { health, loading: healthLoading, refetch: refetchHealth } = useAiImageAgentHealth();

  return (
    <div>
      <PageHeading
        title="AI 이미지 필터 관리"
        description="반려동물 사진 변환 필터의 프롬프트, 생성 모델, 레퍼런스 이미지와 노출 순서를 관리합니다."
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
            필터 추가
          </Button>
        }
      />
      <LoadError error={error} retry={refetch} />
      <AiImageAgentStatus health={health} loading={healthLoading} onRefresh={refetchHealth} />
      <AiImageFilterTable
        filters={filters}
        loading={loading}
        onEdit={modal.openEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      <AiImageFilterModal
        visible={modal.modalVisible}
        editingFilter={modal.editingFilter}
        form={modal.form}
        onOk={modal.handleSubmit}
        onCancel={modal.closeModal}
        uploadingPurpose={assets.uploadingPurpose}
        thumbnailPreview={assets.thumbnailPreview}
        references={assets.references}
        onThumbnailUpload={assets.handleThumbnailUpload}
        onReferenceUpload={assets.handleReferenceUpload}
        onRemoveReference={assets.handleRemoveReference}
        previewing={preview.previewing}
        previewResult={preview.previewResult}
        previewSourcePreview={preview.previewSourcePreview}
        onPreviewSourceUpload={preview.handlePreviewSourceUpload}
        onPreview={preview.handlePreview}
      />
    </div>
  );
};

export default AiImageFilters;
