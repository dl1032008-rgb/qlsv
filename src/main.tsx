import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle Google Identity Services & Firebase Auth popup closed events gracefully
if (typeof window !== 'undefined') {
  const isPopupClosedError = (errStr: string) => {
    const s = String(errStr || '').toLowerCase();
    return (
      s.includes('popup window closed') ||
      s.includes('popup_closed') ||
      s.includes('popup-closed-by-user') ||
      s.includes('cancelled-popup-request') ||
      s.includes('cửa sổ đăng nhập google đã được đóng') ||
      s.includes('cancelled by user')
    );
  };

  window.addEventListener('error', (event) => {
    const msg = String(event.message || event.error?.message || '');
    if (isPopupClosedError(msg)) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('[Handled Notice] Cửa sổ Google OAuth popup đã được đóng an toàn:', msg);
      return true;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = String(event.reason?.message || event.reason || '');
    if (isPopupClosedError(reason)) {
      event.preventDefault();
      console.warn('[Handled Notice] Cửa sổ Google OAuth popup đã được đóng an toàn:', reason);
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);

