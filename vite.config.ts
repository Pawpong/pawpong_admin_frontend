import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const backend = new URL(env.VITE_API_BASE_URL || 'http://localhost:8080/api');
  return {
    plugins: [react()],
    server: {
      // 개발 포트가 바뀌어도 브라우저는 같은 출처로 요청하고, Vite가 지정한 백엔드에 전달한다.
      proxy: { '/api': { target: backend.origin, changeOrigin: true } },
    },
  };
});
