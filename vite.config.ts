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
      proxy: {
        '/api': {
          target: backend.origin,
          changeOrigin: true,
          configure: (proxy) => {
            // 어드민은 Bearer 토큰으로만 인증한다. 그런데 백엔드 JwtStrategy는 쿠키의
            // accessToken 을 헤더보다 먼저 읽는다. 같은 localhost 에서 서비스 프런트에
            // 로그인해 둔 adopter/breeder 쿠키가 남아 있으면 그 토큰이 관리자 토큰을
            // 덮어써 모든 관리자 API가 403 으로 떨어진다. 개발 프록시에서 쿠키를 떼어
            // 관리자 요청이 항상 Authorization 헤더로만 인증되게 한다.
            proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('cookie'));
          },
        },
      },
    },
  };
});
