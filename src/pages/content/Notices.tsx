import { useEffect } from 'react';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
import { Button, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useNoticeCrud } from '../../features/notice/hooks/useNoticeCrud';
import { NoticeTable } from '../../features/notice/ui/NoticeTable';
import { NoticeModal } from '../../features/notice/ui/NoticeModal';
import { NoticeDetailModal } from '../../features/notice/ui/NoticeDetailModal';

/**
 * 공지사항 관리 페이지
 */
const Notices = () => {
  const {
    notices, loading, loadError, currentPage, totalItems, limit, statusFilter,
    setCurrentPage, handleFilterChange, fetchNotices,
    modal, detail, handleDelete,
  } = useNoticeCrud();

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  return (
    <div>
      <PageHeading
        title="공지사항 관리"
        description="서비스 공지 게시글의 게시 상태, 상단 고정, 작성자와 조회수를 관리합니다."
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
            공지사항 추가
          </Button>
        }
      />
      <LoadError error={loadError} retry={fetchNotices} />
      <div className="filter-bar">
        <span>게시 상태</span>
        <Select
          placeholder="전체 상태"
          allowClear
          className="filter-control"
          value={statusFilter}
          onChange={handleFilterChange}
          options={[
            { value: 'published', label: '게시' },
            { value: 'draft', label: '임시저장' },
            { value: 'archived', label: '보관' },
          ]}
        />
      </div>
      <NoticeTable
        notices={notices}
        loading={loading}
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={limit}
        onPageChange={setCurrentPage}
        onView={detail.openDetail}
        onEdit={modal.openEdit}
        onDelete={handleDelete}
      />

      <NoticeModal
        visible={modal.modalVisible}
        editingNotice={modal.editingNotice}
        form={modal.form}
        onOk={modal.handleSubmit}
        onCancel={modal.closeModal}
      />

      <NoticeDetailModal
        visible={detail.detailModalVisible}
        notice={detail.viewingNotice}
        onClose={detail.closeDetail}
      />
    </div>
  );
};

export default Notices;
