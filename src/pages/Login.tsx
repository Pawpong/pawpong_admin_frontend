import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import { authApi } from '../features/auth/api/authApi';
import { useAuthStore } from '../features/auth/store/authStore';
import type { LoginRequest } from '../shared/types/api.types';

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authApi.login(values);

      // Zustand store에 사용자 정보 저장 및 토큰 로컬스토리지 저장
      login(response);
      message.success(`${response.name}님, 환영합니다!`);

      // 대시보드로 이동
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error || '로그인에 실패했습니다.')
        : '로그인에 실패했습니다.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2">
            🐾 Pawpong Admin
          </Title>
          <Text type="secondary">관리자 로그인</Text>
        </div>

        <Form name="login" onFinish={onFinish} autoComplete="off" size="large" layout="vertical">
          <Form.Item
            name="email"
            label="이메일"
            rules={[
              { required: true, message: '이메일을 입력해주세요!' },
              { type: 'email', message: '올바른 이메일 형식이 아닙니다!' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="admin@pawpong.com" />
          </Form.Item>

          <Form.Item name="password" label="비밀번호" rules={[{ required: true, message: '비밀번호를 입력해주세요!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="비밀번호" />
          </Form.Item>

          <Form.Item className="!mb-0">
            <Button type="primary" htmlType="submit" block loading={loading} className="h-12 text-lg font-semibold">
              {loading ? <Spin /> : '로그인'}
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-6 text-center">
          <Text type="secondary" className="text-xs">
            © 2025 Pawpong. All rights reserved.
          </Text>
        </div>
      </Card>
    </div>
  );
}
