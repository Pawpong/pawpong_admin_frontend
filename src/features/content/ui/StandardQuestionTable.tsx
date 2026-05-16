import { Table, Tag, Space, Button, Switch } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import type { StandardQuestion } from '../../../shared/types/api.types';

/**
 * ID를 한글 라벨로 변환하는 매핑 객체
 */
const ID_LABEL_MAP: Record<string, string> = {
  privacyConsent: '개인정보 동의',
  selfIntroduction: '자기소개',
  familyMembers: '가족 구성원',
  allFamilyConsent: '가족 동의',
  allergyTestInfo: '알러지 검사',
  timeAwayFromHome: '부재 시간',
  livingSpaceDescription: '거주 공간',
  previousPetExperience: '반려동물 경험',
  canProvideBasicCare: '기본 케어 가능',
  canAffordMedicalExpenses: '의료비 감당 가능',
  neuteringConsent: '중성화 동의',
  preferredPetDescription: '선호 반려동물',
  desiredAdoptionTiming: '입양 희망 시기',
  additionalNotes: '추가 문의',
};

/** 질문 타입별 태그 색상/라벨 */
export function getQuestionTypeTag(type: string) {
  const typeMap: Record<string, { color: string; label: string }> = {
    text: { color: 'blue', label: '단답형' },
    textarea: { color: 'cyan', label: '장문형' },
    checkbox: { color: 'green', label: '체크박스' },
    radio: { color: 'orange', label: '라디오' },
    select: { color: 'purple', label: '선택형' },
  };
  const config = typeMap[type] || { color: 'default', label: type };
  return <Tag color={config.color}>{config.label}</Tag>;
}

interface StandardQuestionTableProps {
  questions: StandardQuestion[];
  loading: boolean;
  onEdit: (question: StandardQuestion) => void;
  onToggleStatus: (question: StandardQuestion) => void;
}

/**
 * 표준 질문 테이블 컴포넌트
 */
export function StandardQuestionTable({ questions, loading, onEdit, onToggleStatus }: StandardQuestionTableProps) {
  const columns: ColumnsType<StandardQuestion> = [
    {
      title: '순서',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a, b) => a.order - b.order,
      render: (order: number) => <span style={{ fontWeight: 500 }}>{order}</span>,
    },
    {
      title: '식별자',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      render: (id: string) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>{ID_LABEL_MAP[id] || id}</div>
          <code style={{ fontSize: '11px', color: '#999' }}>{id}</code>
        </div>
      ),
    },
    {
      title: '질문 내용',
      dataIndex: 'label',
      key: 'label',
      render: (label: string) => <span style={{ fontWeight: 500 }}>{label}</span>,
    },
    {
      title: '타입',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => getQuestionTypeTag(type),
    },
    {
      title: '필수',
      dataIndex: 'required',
      key: 'required',
      width: 80,
      render: (required: boolean) => (required ? <Tag color="red">필수</Tag> : <Tag>선택</Tag>),
    },
    {
      title: '활성',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          onChange={() => onToggleStatus(record)}
          checkedChildren="활성"
          unCheckedChildren="비활성"
        />
      ),
    },
    {
      title: '작업',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="small" onClick={(e) => e.stopPropagation()}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(record);
            }}
          >
            수정
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={questions}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 20,
        showTotal: (total) => `총 ${total}개`,
        showSizeChanger: true,
      }}
    />
  );
}
