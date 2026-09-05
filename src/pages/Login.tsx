import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message } from 'antd';
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
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || '로그인에 실패했습니다.'
          : '로그인에 실패했습니다.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-story">
        <img className="login-logo" src="/brand/pawpong-logo.svg" width={95.676} height={32} alt="Pawpong" />
        <div>
          <span className="page-eyebrow">PAWPONG WORKSPACE</span>
          <h1>
            좋은 만남의 시작,
            <br />
            함께 만드는 포퐁.
          </h1>
          <p>
            새로운 가족을 만나는 설렘이
            <br />
            안전하고 따뜻한 경험이 될 수 있도록.
          </p>
          <div className="login-mascot">
            <img src="/brand/pawpong-dog.svg" width={155} height={155} alt="포퐁 픽셀 강아지" />
          </div>
        </div>
        <small>© {new Date().getFullYear()} PAWPONG</small>
      </section>
      <section className="login-form-panel">
        <div className="login-form-inner">
          <span className="login-admin-label">ADMIN</span>
          <Title level={2}>관리자 로그인</Title>
          <Text type="secondary">포퐁 운영 워크스페이스에 오신 것을 환영해요.</Text>
          <Form name="login" onFinish={onFinish} autoComplete="on" size="large" layout="vertical" className="mt-8">
            <Form.Item
              name="email"
              label="이메일"
              rules={[
                { required: true, message: '이메일을 입력해주세요.' },
                { type: 'email', message: '올바른 이메일 형식이 아닙니다.' },
              ]}
            >
              <Input autoComplete="username" prefix={<UserOutlined />} placeholder="관리자 이메일 입력" />
            </Form.Item>
            <Form.Item
              name="password"
              label="비밀번호"
              rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
            >
              <Input.Password autoComplete="current-password" prefix={<LockOutlined />} placeholder="비밀번호 입력" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                로그인
              </Button>
            </Form.Item>
          </Form>
          <p className="login-help">
            이 공간은 포퐁 관리자 전용입니다.
            <br />
            계정 접근이 필요한 경우 운영 담당자에게 문의해주세요.
          </p>
        </div>
      </section>
    </div>
  );
}
