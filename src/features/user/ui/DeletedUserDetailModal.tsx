import React from 'react';
import { Modal } from 'antd';
import dayjs from 'dayjs';

import type { DeletedUser } from '../api/userApi';
import { getUserRoleTag, getDeleteReasonLabel } from './deletedUserHelpers';

interface DeletedUserDetailModalProps {
  visible: boolean;
  user: DeletedUser | null;
  onCancel: () => void;
}

/** 탈퇴 사용자 상세 정보 모달 */
export function DeletedUserDetailModal({ visible, user, onCancel }: DeletedUserDetailModalProps) {
  return (
    <Modal
      title="탈퇴 사용자 상세 정보"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      {user && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">사용자 ID</div>
              <div className="font-medium">{user.userId}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">역할</div>
              <div>{getUserRoleTag(user.userRole)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">닉네임</div>
              <div className="font-medium">{user.nickname}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">이메일</div>
              <div className="font-medium">{user.email}</div>
            </div>
            {user.phone && (
              <div>
                <div className="text-sm text-gray-500 mb-1">전화번호</div>
                <div className="font-medium">{user.phone}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-500 mb-1">가입일</div>
              <div className="font-medium">{dayjs(user.createdAt).format('YYYY-MM-DD')}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">탈퇴일</div>
              <div className="font-medium">{dayjs(user.deletedAt).format('YYYY-MM-DD HH:mm:ss')}</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">탈퇴 사유</div>
            <div className="font-medium">
              {getDeleteReasonLabel(user.deleteReason, user.userRole)}
            </div>
          </div>
          {user.deleteReasonDetail && (
            <div>
              <div className="text-sm text-gray-500 mb-1">상세 사유</div>
              <div className="p-3 bg-gray-50 rounded-lg">{user.deleteReasonDetail}</div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
