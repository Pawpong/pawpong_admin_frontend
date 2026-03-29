import React from 'react';
import { Modal, Input } from 'antd';

import type { DeletedUser } from '../api/userApi';

interface DeletedUserHardDeleteModalProps {
  visible: boolean;
  user: DeletedUser | null;
  confirmInput: string;
  onConfirmInputChange: (value: string) => void;
  onOk: () => void;
  onCancel: () => void;
}

/** 사용자 영구 삭제 확인 모달 */
export function DeletedUserHardDeleteModal({
  visible,
  user,
  confirmInput,
  onConfirmInputChange,
  onOk,
  onCancel,
}: DeletedUserHardDeleteModalProps) {
  return (
    <Modal
      title="⚠️ 사용자 영구 삭제"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="영구 삭제"
      cancelText="취소"
      okButtonProps={{ danger: true, disabled: confirmInput !== user?.nickname }}
    >
      {user && (
        <div>
          <div
            className="p-4 mb-4"
            style={{
              backgroundColor: '#fff1f0',
              border: '1px solid #ffa39e',
              borderRadius: '8px',
            }}
          >
            <p className="text-sm mb-2" style={{ color: '#cf1322', fontWeight: 'bold' }}>
              ⚠️ 경고: 이 작업은 되돌릴 수 없습니다
            </p>
            <p className="text-sm" style={{ color: '#cf1322' }}>
              사용자의 모든 데이터가 데이터베이스에서 영구적으로 삭제됩니다.
            </p>
          </div>

          <div className="mb-4">
            <p className="mb-2">
              <strong>사용자 정보:</strong>
            </p>
            <p className="text-sm">이름: {user.nickname}</p>
            <p className="text-sm">이메일: {user.email}</p>
            <p className="text-sm">역할: {user.userRole === 'adopter' ? '입양자' : '브리더'}</p>
          </div>

          <div>
            <p className="mb-2" style={{ fontWeight: 'bold' }}>
              계속하려면 사용자 이름을 입력하세요:
            </p>
            <Input
              placeholder={user.nickname}
              value={confirmInput}
              onChange={(e) => onConfirmInputChange(e.target.value)}
              status={confirmInput && confirmInput !== user.nickname ? 'error' : ''}
            />
            {confirmInput && confirmInput !== user.nickname && (
              <p className="text-sm mt-1" style={{ color: '#cf1322' }}>
                이름이 일치하지 않습니다
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
