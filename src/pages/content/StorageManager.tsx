import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Card,
    Button,
    Space,
    Tag,
    Popconfirm,
    message,
    Image,
    Breadcrumb,
    Statistic,
    Row,
    Col,
    Tooltip,
    Spin,
    Empty,
    Checkbox,
    Badge,
} from 'antd';
import {
    DeleteOutlined,
    ReloadOutlined,
    FolderOutlined,
    FolderOpenOutlined,
    FileImageOutlined,
    FileOutlined,
    HomeFilled,
    ArrowLeftOutlined,
    CloudOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    DatabaseOutlined,
} from '@ant-design/icons';
import {
    storageApi,
    type StorageFile,
    type FolderStats,
    type FileReference,
} from '../../features/upload/api/storageApi';
import dayjs from 'dayjs';

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 */
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 폴더 아이템 타입
 */
interface FolderItem {
    name: string;
    type: 'folder';
    stats: FolderStats;
}

/**
 * 파일 아이템 타입 (참조 정보 포함)
 */
interface FileItem extends StorageFile {
    type: 'file';
    isReferenced?: boolean;
    references?: FileReference['references'];
}

type ExplorerItem = FolderItem | FileItem;

/**
 * 스토리지 관리 페이지 (파일 탐색기 스타일)
 */
const StorageManager = () => {
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
                        type: 'folder',
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
                        type: 'file',
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
                                type: 'folder',
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
                            type: 'file',
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
    const currentStats = useMemo(() => {
        const files = currentFiles;
        const referenced = files.filter((f) => f.isReferenced).length;
        const orphaned = files.filter((f) => !f.isReferenced).length;
        const totalSize = files.reduce((acc, f) => acc + f.size, 0);
        return { total: files.length, referenced, orphaned, totalSize };
    }, [currentFiles]);

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

    const getFileName = (key: string) => {
        const parts = key.split('/');
        return parts[parts.length - 1];
    };

    const isImageFile = (key: string) => {
        const ext = key.toLowerCase().split('.').pop();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
    };

    // 전체 용량 계산
    const totalSize = useMemo(() => {
        return allFiles.reduce((acc, file) => acc + file.size, 0);
    }, [allFiles]);

    // 전체 참조/고아 파일 수
    const globalStats = useMemo(() => {
        const referenced = allFiles.filter((f) => referencedFiles.has(f.key)).length;
        return { referenced, orphaned: allFiles.length - referenced };
    }, [allFiles, referencedFiles]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 통계 카드 */}
            <Row gutter={16}>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic title="전체 파일" value={totalFiles} prefix={<CloudOutlined />} suffix="개" />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic title="전체 용량" value={formatFileSize(totalSize)} prefix={<FileImageOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="DB 참조 중"
                            value={globalStats.referenced}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            suffix="개"
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="미사용 (고아 파일)"
                            value={globalStats.orphaned}
                            prefix={<WarningOutlined style={{ color: '#faad14' }} />}
                            suffix="개"
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 파일 탐색기 */}
            <Card
                title={
                    <Space>
                        <FolderOpenOutlined />
                        <span>스토리지 파일 탐색기</span>
                        {referenceLoading && <Spin size="small" />}
                    </Space>
                }
                extra={
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={() => { fetchFiles(); fetchReferencedFiles(); }} loading={loading}>
                            새로고침
                        </Button>
                        {selectedItems.length > 0 && (
                            <Popconfirm
                                title={`${selectedItems.length}개 파일을 삭제하시겠습니까?`}
                                description="삭제된 파일은 복구할 수 없습니다."
                                onConfirm={handleBulkDelete}
                                okText="삭제"
                                cancelText="취소"
                                okButtonProps={{ danger: true }}
                            >
                                <Button danger icon={<DeleteOutlined />}>
                                    선택 삭제 ({selectedItems.length})
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                }
            >
                {/* 상단 네비게이션 */}
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        disabled={currentPath.length === 0}
                        onClick={handleGoBack}
                    >
                        뒤로
                    </Button>
                    <Breadcrumb
                        items={[
                            {
                                title: (
                                    <span
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleBreadcrumbClick(-1)}
                                    >
                                        <HomeFilled /> 루트
                                    </span>
                                ),
                            },
                            ...currentPath.map((folder, index) => ({
                                title: (
                                    <span
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleBreadcrumbClick(index)}
                                    >
                                        {folder}
                                    </span>
                                ),
                            })),
                        ]}
                    />
                </div>

                {/* 현재 폴더 통계 */}
                {currentPath.length > 0 && (
                    <div style={{ marginBottom: 16, padding: '8px 16px', background: '#fafafa', borderRadius: 8 }}>
                        <Space size="large">
                            <span>현재 폴더: <strong>{currentStats.total}</strong>개 파일</span>
                            <span>용량: <strong>{formatFileSize(currentStats.totalSize)}</strong></span>
                            <span style={{ color: '#52c41a' }}>
                                <CheckCircleOutlined /> 참조 중: {currentStats.referenced}개
                            </span>
                            <span style={{ color: '#faad14' }}>
                                <WarningOutlined /> 미사용: {currentStats.orphaned}개
                            </span>
                        </Space>
                    </div>
                )}

                {/* 전체 선택 체크박스 (파일이 있는 경우만) */}
                {currentFiles.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                        <Checkbox
                            checked={selectedItems.length === currentFiles.length && currentFiles.length > 0}
                            indeterminate={selectedItems.length > 0 && selectedItems.length < currentFiles.length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                        >
                            전체 선택 ({currentFiles.length}개 파일)
                        </Checkbox>
                    </div>
                )}

                {/* 파일/폴더 그리드 */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 48 }}>
                        <Spin size="large" />
                    </div>
                ) : currentItems.length === 0 ? (
                    <Empty description="파일이 없습니다" />
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: 16,
                        }}
                    >
                        {currentItems.map((item) => {
                            if (item.type === 'folder') {
                                return (
                                    <div
                                        key={item.name}
                                        onClick={() => handleFolderClick(item.name)}
                                        style={{
                                            border: '1px solid #e8e8e8',
                                            borderRadius: 8,
                                            padding: 16,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 8,
                                            transition: 'all 0.2s',
                                            background: '#fafafa',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#e6f4ff';
                                            e.currentTarget.style.borderColor = '#1890ff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#fafafa';
                                            e.currentTarget.style.borderColor = '#e8e8e8';
                                        }}
                                    >
                                        <FolderOutlined style={{ fontSize: 48, color: '#faad14' }} />
                                        <div style={{ fontWeight: 500, textAlign: 'center', wordBreak: 'break-all' }}>
                                            {item.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#888' }}>
                                            {item.stats.count}개 파일 · {formatFileSize(item.stats.totalSize)}
                                        </div>
                                    </div>
                                );
                            } else {
                                const isSelected = selectedItems.includes(item.key);
                                return (
                                    <div
                                        key={item.key}
                                        style={{
                                            border: `1px solid ${isSelected ? '#1890ff' : '#e8e8e8'}`,
                                            borderRadius: 8,
                                            padding: 12,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 8,
                                            background: isSelected ? '#e6f4ff' : '#fff',
                                            position: 'relative',
                                        }}
                                    >
                                        {/* 체크박스 */}
                                        <Checkbox
                                            checked={isSelected}
                                            onChange={(e) => handleSelectItem(item.key, e.target.checked)}
                                            style={{ position: 'absolute', top: 8, left: 8 }}
                                        />

                                        {/* DB 참조 상태 뱃지 */}
                                        <div style={{ position: 'absolute', top: 8, right: 8 }}>
                                            {item.isReferenced ? (
                                                <Tooltip
                                                    title={
                                                        item.references && item.references.length > 0 ? (
                                                            <div>
                                                                <strong>DB 참조 위치:</strong>
                                                                {item.references.map((ref, i) => (
                                                                    <div key={i}>
                                                                        {ref.collection}.{ref.field} ({ref.count})
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            'DB에서 사용 중'
                                                        )
                                                    }
                                                >
                                                    <Badge
                                                        count={<DatabaseOutlined style={{ color: '#52c41a' }} />}
                                                    />
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title="미사용 파일 (삭제 가능)">
                                                    <Badge
                                                        count={<WarningOutlined style={{ color: '#faad14' }} />}
                                                    />
                                                </Tooltip>
                                            )}
                                        </div>

                                        {/* 썸네일 */}
                                        <div style={{ width: '100%', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {isImageFile(item.key) ? (
                                                <Image
                                                    src={item.url}
                                                    width={80}
                                                    height={80}
                                                    style={{ objectFit: 'cover', borderRadius: 4 }}
                                                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                                                />
                                            ) : (
                                                <FileOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                                            )}
                                        </div>

                                        {/* 파일명 */}
                                        <Tooltip title={item.key}>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    textAlign: 'center',
                                                    wordBreak: 'break-all',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    lineHeight: '1.4',
                                                    height: '2.8em',
                                                }}
                                            >
                                                {getFileName(item.key)}
                                            </div>
                                        </Tooltip>

                                        {/* 파일 정보 */}
                                        <div style={{ fontSize: 11, color: '#888', textAlign: 'center' }}>
                                            {formatFileSize(item.size)}
                                            <br />
                                            {dayjs(item.lastModified).format('YYYY-MM-DD')}
                                        </div>

                                        {/* 참조 상태 태그 */}
                                        <Tag
                                            color={item.isReferenced ? 'success' : 'warning'}
                                            style={{ fontSize: 10 }}
                                        >
                                            {item.isReferenced ? '사용 중' : '미사용'}
                                        </Tag>

                                        {/* 삭제 버튼 */}
                                        <Popconfirm
                                            title="이 파일을 삭제하시겠습니까?"
                                            description={
                                                item.isReferenced
                                                    ? '이 파일은 DB에서 사용 중입니다. 삭제하면 문제가 발생할 수 있습니다.'
                                                    : '삭제된 파일은 복구할 수 없습니다.'
                                            }
                                            onConfirm={() => handleDelete(item.key)}
                                            okText="삭제"
                                            cancelText="취소"
                                            okButtonProps={{ danger: true }}
                                        >
                                            <Button
                                                type="text"
                                                size="small"
                                                danger
                                                icon={<DeleteOutlined />}
                                            >
                                                삭제
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                );
                            }
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default StorageManager;
