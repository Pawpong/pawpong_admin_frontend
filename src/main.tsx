import '@ant-design/v5-patch-for-react-19';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './app/App.tsx';

createRoot(document.getElementById('root')!).render(<App />);
