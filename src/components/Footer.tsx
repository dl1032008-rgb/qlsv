import React from 'react';
import { ClassId, ThemeSettings } from '../types';

interface FooterProps {
  currentClass: ClassId;
  onOpenThemeModal?: () => void;
  themeSettings: ThemeSettings;
}

export const Footer: React.FC<FooterProps> = ({ currentClass, themeSettings }) => {
  return (
    <footer 
      style={{
        background: `linear-gradient(to right, ${themeSettings.headerBgStart}, ${themeSettings.headerBgEnd})`
      }}
      className="fixed bottom-0 left-0 w-full z-50 border-t-2 border-black/20 px-4 py-2 text-white select-none shadow-inner transition-colors duration-300"
    >
      <div className="max-w-[1920px] mx-auto flex items-center justify-between">
        {/* Left Info */}
        <div className="text-left">
          <p className="text-xs sm:text-sm font-bold tracking-wide text-white drop-shadow-xs">
            {themeSettings.systemTitle || 'HỆ THỐNG QUẢN LÝ SINH VIÊN ĐIỆN TỬ - KHOA CÔNG NGHỆ Ô TÔ'}
          </p>
          <p className="text-[11px] sm:text-xs text-sky-200">
            Tác giả: <strong className="text-white">{themeSettings.authorName || 'ThS: Nguyễn Chí Dũng'}</strong> • Lớp <span className="bg-black/30 text-yellow-300 font-bold px-1.5 py-0.5 rounded border border-white/20">{currentClass}</span>
          </p>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs sm:text-sm font-bold text-yellow-300 tracking-wide drop-shadow-xs">
              Chính sách NĐ 238/2025/NĐ-CP
            </p>
            <p className="text-[11px] text-sky-200">
              Phiên bản 1.0 © 2026
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

