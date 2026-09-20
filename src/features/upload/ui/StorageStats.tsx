import { Metric } from '../../../shared/components/admin/PageHeading';

import { formatFileSize } from '../hooks/useStorageManager';

interface Props {
  totalFiles: number;
  totalSize: number;
  globalStats: { referenced: number; orphaned: number };
}

export function StorageStats({ totalFiles, totalSize, globalStats }: Props) {
  return (
    <div className="metric-grid">
      <Metric label="전체 파일" value={`${totalFiles.toLocaleString()}개`} />
      <Metric label="전체 용량" value={formatFileSize(totalSize)} />
      <Metric label="DB 참조 중" value={`${globalStats.referenced.toLocaleString()}개`} />
      <Metric label="미사용 (고아 파일)" value={`${globalStats.orphaned.toLocaleString()}개`} />
    </div>
  );
}
