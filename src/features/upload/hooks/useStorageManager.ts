import { useState, useEffect, useMemo, useCallback } from 'react';
import { message } from 'antd';

import {
  storageApi,
  type StorageFile,
  type FolderStats,
  type FileReference,
} from '../api/storageApi';

/**
 * 폴더 아이템 타입
 */
export interface FolderItem {
  name: string;
  type: 'folder';
  stats: FolderStats;
}

/**
 * 파일 아이템 타입 (참조 정보 포함)
 */
export interface FileItem extends StorageFile {
  type: 'file';
  isReferenced?: boolean;
  references?: FileReference['references'];
}

export type ExplorerItem = FolderItem | FileItem;

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 파일명 추출 유틸
 */
export const getFileName = (key: string): string => {
  const parts = key.split('/');
  return parts[parts.length - 1];
};

/**
 * 이미지 파일 여부 판별
 */
export const isImageFile = (key: string): boolean => {
  const ext = key.toLowerCase().split('.').pop();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
};

/**
 * 현재 폴더 통계 타입
 */
export interface CurrentFolderStats {
  total: number;
  referenced: number;
  orphaned: number;
  totalSize: number;
}

/**
 * 전체 통계 타입
 */
export interface GlobalStats {
  referenced: number;
  orphaned: number;
}

/**
 * 스토리지 관리 비즈니스 로직 훅
 * 파일 탐색, 참조 추적, 삭제 등 전체 기능을 관리합니다.
 */
export function useStorageManager() {
  const [allFiles, setAllFiles] = useState<StorageFile[]>([]);
  const [folderStats, setFolderStats] = useState<Record<string, FolderStats>>({});
  const [loading, setLoading] = useState(false);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [referencedFiles, setReferencedFiles] = useState<Set<string>>(new Set());
  const [fileReferences, setFileReferences] = useState<Map<string, FileReference['references']>>(new Map());

  useEffect(() => {
    fetchFiles();
    fetchReferencedFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await storageApi.getFiles();
      setAllFiles(response.data.files);
      setFolderStats(response.data.folderStats);
      setTotalFiles(response.data.totalFiles);
    } catch {
      message.error('파일 목록 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferencedFiles = async () => {
    try {
      setReferenceLoading(true);
      const response = await storageApi.getReferencedFiles();
      setReferencedFiles(new Set(response.data));
    } catch {
      console.error('DB 참조 파일 조회 실패');
    } finally {
      setReferenceLoading(false);
    }
  };

  // 현재 경로의 파일 및 폴더 목록 계산
  const currentItems = useMemo((): ExplorerItem[] => {
    const currentPrefix = currentPath.length > 0 ? currentPath.join('/') + '/' : '';
    const items: ExplorerItem[] = [];
    const seenFolders = new Set<string>();

    if (currentPath.length === 0) {
      // 루트 레벨: 폴더만 표시
      Object.entries(folderStats).forEach(([folder, stats]) => {
        if (folder !== 'root') {
          items.push({
            name: folder,
            type: 'folder' as const,
            stats,
          });
        }
      });

      // root 폴더 파일들 (폴더 없는 파일)
      allFiles
        .filter((file) => file.folder === 'root')
        .forEach((file) => {
          items.push({
            ...file,
            type: 'file' as const,
            isReferenced: referencedFiles.has(file.key),
            references: fileReferences.get(file.key),
          });
        });
    } else {
      // 하위 폴더 레벨
      allFiles.forEach((file) => {
        if (file.key.startsWith(currentPrefix)) {
          const remainingPath = file.key.slice(currentPrefix.length);
          const parts = remainingPath.split('/');

          if (parts.length > 1) {
            // 하위 폴더가 있음
            const subFolder = parts[0];
            if (!seenFolders.has(subFolder)) {
              seenFolders.add(subFolder);
              // 해당 하위 폴더의 통계 계산
              const subPrefix = currentPrefix + subFolder + '/';
              const subFiles = allFiles.filter((f) => f.key.startsWith(subPrefix));
              items.push({
                name: subFolder,
                type: 'folder' as const,
                stats: {
                  count: subFiles.length,
                  totalSize: subFiles.reduce((acc, f) => acc + f.size, 0),
                },
              });
            }
          } else {
            // 현재 폴더의 파일
            items.push({
              ...file,
              type: 'file' as const,
              isReferenced: referencedFiles.has(file.key),
              references: fileReferences.get(file.key),
            });
          }
        }
      });
    }

    // 폴더를 먼저, 그 다음 파일 (이름순 정렬)
    return items.sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      const nameA = a.type === 'folder' ? a.name : a.key;
      const nameB = b.type === 'folder' ? b.name : b.key;
      return nameA.localeCompare(nameB);
    });
  }, [allFiles, folderStats, currentPath, referencedFiles, fileReferences]);

  // 현재 경로의 파일들만 추출
  const currentFiles = useMemo(() => {
    return currentItems.filter((item): item is FileItem => item.type === 'file');
  }, [currentItems]);

  // 현재 경로 통계
  const currentStats = useMemo((): CurrentFolderStats => {
    const files = currentFiles;
    const referenced = files.filter((f) => f.isReferenced).length;
    const orphaned = files.filter((f) => !f.isReferenced).length;
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    return { total: files.length, referenced, orphaned, totalSize };
  }, [currentFiles]);

  // 전체 용량 계산
  const totalSize = useMemo(() => {
    return allFiles.reduce((acc, file) => acc + file.size, 0);
  }, [allFiles]);

  // 전체 참조/고아 파일 수
  const globalStats = useMemo((): GlobalStats => {
    const referenced = allFiles.filter((f) => referencedFiles.has(f.key)).length;
    return { referenced, orphaned: allFiles.length - referenced };
  }, [allFiles, referencedFiles]);

  const handleFolderClick = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
    setSelectedItems([]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, index + 1));
    }
    setSelectedItems([]);
  };

  const handleGoBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedItems([]);
    }
  };

  const handleDelete = async (fileKey: string) => {
    try {
      await storageApi.deleteFile(fileKey);
      message.success('파일이 삭제되었습니다');
      fetchFiles();
      setSelectedItems(selectedItems.filter((k) => k !== fileKey));
    } catch {
      message.error('파일 삭제 실패');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      message.warning('삭제할 파일을 선택해주세요');
      return;
    }

    try {
      const response = await storageApi.deleteMultipleFiles(selectedItems);
      message.success(`${response.data.deletedCount}개 파일이 삭제되었습니다`);
      if (response.data.failedFiles.length > 0) {
        message.warning(`${response.data.failedFiles.length}개 파일 삭제 실패`);
      }
      setSelectedItems([]);
      fetchFiles();
    } catch {
      message.error('파일 삭제 실패');
    }
  };

  const handleSelectItem = (key: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, key]);
    } else {
      setSelectedItems(selectedItems.filter((k) => k !== key));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allFileKeys = currentFiles.map((f) => f.key);
      setSelectedItems(allFileKeys);
    } else {
      setSelectedItems([]);
    }
  };

  // 선택된 파일들의 DB 참조 상세 정보 조회
  const checkSelectedReferences = useCallback(async () => {
    const fileKeys = currentFiles.map((f) => f.key);
    if (fileKeys.length === 0) return;

    try {
      setReferenceLoading(true);
      const response = await storageApi.checkFileReferences(fileKeys);
      const newReferences = new Map<string, FileReference['references']>();
      response.data.files.forEach((file) => {
        newReferences.set(file.fileKey, file.references);
      });
      setFileReferences(newReferences);
    } catch {
      console.error('참조 정보 조회 실패');
    } finally {
      setReferenceLoading(false);
    }
  }, [currentFiles]);

  // 현재 폴더 진입 시 참조 정보 조회
  useEffect(() => {
    if (currentFiles.length > 0 && currentFiles.length <= 100) {
      checkSelectedReferences();
    }
  }, [currentPath, allFiles.length]);

  const handleRefresh = () => {
    fetchFiles();
    fetchReferencedFiles();
  };

  return {
    // 데이터
    currentItems,
    currentFiles,
    currentPath,
    selectedItems,
    totalFiles,
    totalSize,
    currentStats,
    globalStats,
    // 상태
    loading,
    referenceLoading,
    // 네비게이션
    handleFolderClick,
    handleBreadcrumbClick,
    handleGoBack,
    // 선택
    handleSelectItem,
    handleSelectAll,
    // 삭제
    handleDelete,
    handleBulkDelete,
    // 새로고침
    handleRefresh,
  };
}
