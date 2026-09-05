import { Button, Popconfirm } from 'antd';
import { useStorageManager } from '../../features/upload/hooks/useStorageManager';
import { StorageStats } from '../../features/upload/ui/StorageStats';
import { StorageExplorer } from '../../features/upload/ui/StorageExplorer';

/**
 * 스토리지 파일 관리 페이지
 * S3 호환 스토리지의 파일을 탐색하고 관리합니다.
 */
const StorageManager = () => {
  const {
    currentItems, currentFiles, currentPath, selectedItems, totalFiles, totalSize, currentStats, globalStats,
    loading, referenceLoading, handleDeleteFolder,
    handleFolderClick, handleBreadcrumbClick, handleGoBack,
    handleSelectItem, handleSelectAll, handleDelete, handleBulkDelete, handleRefresh,
  } = useStorageManager();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {currentPath.length > 0 && <Popconfirm title="현재 폴더 전체를 삭제할까요?" description="하위 폴더와 파일이 모두 삭제됩니다." onConfirm={handleDeleteFolder} okText="폴더 삭제" cancelText="취소" okButtonProps={{ danger: true }}><Button danger style={{ alignSelf: 'flex-end' }}>현재 폴더 전체 삭제</Button></Popconfirm>}
      <StorageStats totalFiles={totalFiles} totalSize={totalSize} globalStats={globalStats} />
      <StorageExplorer
        currentItems={currentItems} currentFiles={currentFiles} currentPath={currentPath}
        selectedItems={selectedItems} currentStats={currentStats} loading={loading} referenceLoading={referenceLoading}
        onFolderClick={handleFolderClick} onBreadcrumbClick={handleBreadcrumbClick} onGoBack={handleGoBack}
        onSelectItem={handleSelectItem} onSelectAll={handleSelectAll} onDelete={handleDelete} onBulkDelete={handleBulkDelete} onRefresh={handleRefresh}
      />
    </div>
  );
};

export default StorageManager;
