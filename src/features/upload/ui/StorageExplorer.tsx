import { Card, Button, Space, Popconfirm, Breadcrumb, Spin, Empty, Checkbox, Tag, Tooltip, Badge, Image } from 'antd';
import { DeleteOutlined, ReloadOutlined, FolderOutlined, FolderOpenOutlined, FileImageOutlined, FileOutlined, HomeFilled, ArrowLeftOutlined, CheckCircleOutlined, WarningOutlined, DatabaseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import type { ExplorerItem } from '../hooks/useStorageManager';
import { formatFileSize } from '../hooks/useStorageManager';

const getFileName = (key: string) => key.split('/').pop() || key;
const isImageFile = (key: string) => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes((key.toLowerCase().split('.').pop() || ''));

interface Props {
  currentItems: ExplorerItem[];
  currentFiles: { key: string }[];
  currentPath: string[];
  selectedItems: string[];
  currentStats: { total: number; totalSize: number; referenced: number; orphaned: number };
  loading: boolean;
  referenceLoading: boolean;
  onFolderClick: (name: string) => void;
  onBreadcrumbClick: (index: number) => void;
  onGoBack: () => void;
  onSelectItem: (key: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDelete: (key: string) => void;
  onBulkDelete: () => void;
  onRefresh: () => void;
}

export function StorageExplorer({ currentItems, currentFiles, currentPath, selectedItems, currentStats, loading, referenceLoading, onFolderClick, onBreadcrumbClick, onGoBack, onSelectItem, onSelectAll, onDelete, onBulkDelete, onRefresh }: Props) {
  return (
    <Card
      title={<Space><FolderOpenOutlined /><span>스토리지 파일 탐색기</span>{referenceLoading && <Spin size="small" />}</Space>}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>새로고침</Button>
          {selectedItems.length > 0 && (
            <Popconfirm title={`${selectedItems.length}개 파일을 삭제하시겠습니까?`} description="삭제된 파일은 복구할 수 없습니다." onConfirm={onBulkDelete} okText="삭제" cancelText="취소" okButtonProps={{ danger: true }}>
              <Button danger icon={<DeleteOutlined />}>선택 삭제 ({selectedItems.length})</Button>
            </Popconfirm>
          )}
        </Space>
      }
    >
      {/* 네비게이션 */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button icon={<ArrowLeftOutlined />} disabled={currentPath.length === 0} onClick={onGoBack}>뒤로</Button>
        <Breadcrumb items={[
          { title: <span style={{ cursor: 'pointer' }} onClick={() => onBreadcrumbClick(-1)}><HomeFilled /> 루트</span> },
          ...currentPath.map((folder, i) => ({ title: <span style={{ cursor: 'pointer' }} onClick={() => onBreadcrumbClick(i)}>{folder}</span> })),
        ]} />
      </div>

      {/* 현재 폴더 통계 */}
      {currentPath.length > 0 && (
        <div style={{ marginBottom: 16, padding: '8px 16px', background: '#fafafa', borderRadius: 8 }}>
          <Space size="large">
            <span>현재 폴더: <strong>{currentStats.total}</strong>개 파일</span>
            <span>용량: <strong>{formatFileSize(currentStats.totalSize)}</strong></span>
            <span style={{ color: '#52c41a' }}><CheckCircleOutlined /> 참조 중: {currentStats.referenced}개</span>
            <span style={{ color: '#faad14' }}><WarningOutlined /> 미사용: {currentStats.orphaned}개</span>
          </Space>
        </div>
      )}

      {/* 전체 선택 */}
      {currentFiles.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <Checkbox checked={selectedItems.length === currentFiles.length && currentFiles.length > 0} indeterminate={selectedItems.length > 0 && selectedItems.length < currentFiles.length} onChange={(e) => onSelectAll(e.target.checked)}>
            전체 선택 ({currentFiles.length}개 파일)
          </Checkbox>
        </div>
      )}

      {/* 그리드 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
      ) : currentItems.length === 0 ? (
        <Empty description="파일이 없습니다" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {currentItems.map((item) => {
            if (item.type === 'folder') {
              return (
                <div key={item.name} onClick={() => onFolderClick(item.name)} style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: '#fafafa' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e6f4ff'; e.currentTarget.style.borderColor = '#1890ff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = '#e8e8e8'; }}>
                  <FolderOutlined style={{ fontSize: 48, color: '#faad14' }} />
                  <div style={{ fontWeight: 500, textAlign: 'center', wordBreak: 'break-all' }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{item.stats.count}개 파일 · {formatFileSize(item.stats.totalSize)}</div>
                </div>
              );
            } else {
              const isSelected = selectedItems.includes(item.key);
              return (
                <div key={item.key} style={{ border: `1px solid ${isSelected ? '#1890ff' : '#e8e8e8'}`, borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: isSelected ? '#e6f4ff' : '#fff', position: 'relative' }}>
                  <Checkbox checked={isSelected} onChange={(e) => onSelectItem(item.key, e.target.checked)} style={{ position: 'absolute', top: 8, left: 8 }} />
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    {item.isReferenced ? (
                      <Tooltip title={item.references?.length ? <div><strong>DB 참조 위치:</strong>{item.references.map((ref, i) => <div key={i}>{ref.collection}.{ref.field} ({ref.count})</div>)}</div> : 'DB에서 사용 중'}>
                        <Badge count={<DatabaseOutlined style={{ color: '#52c41a' }} />} />
                      </Tooltip>
                    ) : (
                      <Tooltip title="미사용 파일 (삭제 가능)"><Badge count={<WarningOutlined style={{ color: '#faad14' }} />} /></Tooltip>
                    )}
                  </div>
                  <div style={{ width: '100%', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isImageFile(item.key) ? <Image src={item.url} width={80} height={80} style={{ objectFit: 'cover', borderRadius: 4 }} fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" /> : <FileOutlined style={{ fontSize: 48, color: '#1890ff' }} />}
                  </div>
                  <Tooltip title={item.key}><div style={{ fontSize: 12, textAlign: 'center', wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4', height: '2.8em' }}>{getFileName(item.key)}</div></Tooltip>
                  <div style={{ fontSize: 11, color: '#888', textAlign: 'center' }}>{formatFileSize(item.size)}<br />{dayjs(item.lastModified).format('YYYY-MM-DD')}</div>
                  <Tag color={item.isReferenced ? 'success' : 'warning'} style={{ fontSize: 10 }}>{item.isReferenced ? '사용 중' : '미사용'}</Tag>
                  <Popconfirm title="이 파일을 삭제하시겠습니까?" description={item.isReferenced ? 'DB에서 사용 중입니다. 삭제하면 문제가 발생할 수 있습니다.' : '삭제된 파일은 복구할 수 없습니다.'} onConfirm={() => onDelete(item.key)} okText="삭제" cancelText="취소" okButtonProps={{ danger: true }}>
                    <Button type="text" size="small" danger icon={<DeleteOutlined />}>삭제</Button>
                  </Popconfirm>
                </div>
              );
            }
          })}
        </div>
      )}
    </Card>
  );
}
