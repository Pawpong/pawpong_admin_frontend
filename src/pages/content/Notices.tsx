import { useEffect } from 'react';
import { Card, Button, Space, Select } from 'antd';
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
    notices, loading, currentPage, totalItems, limit, statusFilter,
    setCurrentPage, handleFilterChange, fetchNotices,
    modal, detail, handleDelete,
  } = useNoticeCrud();

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  return (
    <Card
      title="공지사항 관리"
      extra={
        <Space>
          <Select
            placeholder="상태 필터"
            allowClear
            style={{ width: 120 }}
            value={statusFilter}
            onChange={handleFilterChange}
            options={[
              { value: 'published', label: '게시' },
              { value: 'draft', label: '임시저장' },
              { value: 'archived', label: '보관' },
            ]}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
            공지사항 추가
          </Button>
        </Space>
      }
    >
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
    </Card>
  );
};

export default Notices;
