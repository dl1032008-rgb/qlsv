import React, { useState } from 'react';
import { UserCheck, Shield, Phone, LogOut, Info, Settings, Sparkles, Palette, Users, KeyRound, ShieldAlert, Cloud } from 'lucide-react';
import { ActiveTab, ThemeSettings, UserAccount } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickTools: () => void;
  onOpenThemeModal: () => void;
  themeSettings: ThemeSettings;
  currentUser?: UserAccount | null;
  onOpenUserManagement?: () => void;
  onLogout?: () => void;
  pendingUsersCount?: number;
  onOpenDriveSync?: () => void;
  onSwitchUserRole?: (role: 'admin' | 'teacher' | 'student') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickTools,
  onOpenThemeModal,
  themeSettings,
  currentUser,
  onOpenUserManagement,
  onLogout,
  pendingUsersCount = 0,
  onOpenDriveSync,
  onSwitchUserRole
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  return (
    <>
      <header 
        style={{
          background: `linear-gradient(to right, ${themeSettings.headerBgStart}, ${themeSettings.headerBgEnd})`
        }}
        className="relative z-[100] border-b-2 border-black/20 shadow-md px-4 py-2 text-white select-none transition-colors duration-300"
      >
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          {/* Left: Brand Crest & Header Titles */}
          <div 
            onClick={() => {
              if (currentUser?.role !== 'student') {
                setActiveTab('home');
              }
            }}
            className="flex items-center gap-3.5 cursor-pointer group transition-transform active:scale-[0.99]"
            title={currentUser?.role !== 'student' ? "Quay lại Màn hình chính" : "Giao diện Sinh viên Điểm danh"}
          >
            {/* Crest Logo: Custom uploaded or default emblem */}
            <div className="w-12 h-12 bg-white rounded-lg p-1 shadow-md border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
              {themeSettings.logoUrl ? (
                <img 
                  src={themeSettings.logoUrl} 
                  alt="Logo Trường" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                  <defs>
                    <linearGradient id="crestRed" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d32f2f" />
                      <stop offset="100%" stopColor="#9a0007" />
                    </linearGradient>
                    <linearGradient id="crestBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0288d1" />
                      <stop offset="100%" stopColor="#01579b" />
                    </linearGradient>
                    <linearGradient id="crestDark" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#37474f" />
                      <stop offset="100%" stopColor="#212121" />
                    </linearGradient>
                  </defs>
                  {/* Stylized Automotive Piston/Crest Shape */}
                  <polygon points="50,4 94,28 94,76 50,96 6,76 6,28" fill="#f8fafc" stroke="#cfd8dc" strokeWidth="2" />
                  <path d="M50 14 L82 32 L50 50 L18 32 Z" fill="url(#crestDark)" />
                  <path d="M18 38 L48 55 L48 88 L18 70 Z" fill="url(#crestBlue)" />
                  <path d="M52 55 L82 38 L82 70 L52 88 Z" fill="url(#crestRed)" />
                  {/* Center Stylized Gear / Hub */}
                  <circle cx="50" cy="50" r="10" fill="#ffffff" stroke="#263238" strokeWidth="2.5" />
                  <circle cx="50" cy="50" r="4.5" fill="#d32f2f" />
                </svg>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg lg:text-[1.2rem] font-bold tracking-tight text-white drop-shadow-sm uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                {themeSettings.systemTitle || 'HỆ THỐNG QUẢN LÝ SINH VIÊN ĐIỆN TỬ - KHOA CÔNG NGHỆ Ô TÔ'}
              </h1>
              <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-sky-100/90 font-medium">
                <span className="hidden sm:inline font-semibold text-yellow-300">
                  {themeSettings.schoolName}
                </span>
                <span className="opacity-60 hidden sm:inline">•</span>
                <span>Tác giả: <strong className="text-white">{themeSettings.authorName || 'ThS: Nguyễn Chí Dũng'}</strong></span>
                <span className="opacity-60">•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-yellow-300" />
                  Zalo: <span className="font-semibold text-yellow-200">{themeSettings.authorPhone || '0865.074.668'}</span>
                </span>
                <span className="opacity-60 hidden md:inline">•</span>
                <span className="text-[11px] bg-black/20 px-2 py-0.5 rounded text-sky-200 border border-white/20 hidden md:inline">
                  Thông tư 04/2022/TT-BLĐTBXH & NĐ 238/2025/NĐ-CP
                </span>
              </div>
            </div>
          </div>


          {/* Right: User Pill Badge & Exit/Close Button */}
          <div className="flex items-center gap-2">
            {/* Nút SAO LƯU ĐỒNG BỘ: CHỈ HIỂN THỊ CHO ADMIN (Giao diện người dùng và Sinh viên đều ẩn) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={onOpenDriveSync}
                className="flex items-center gap-1.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-500 border border-teal-300/50 text-white font-extrabold rounded-full px-3.5 py-1.5 text-xs shadow-md hover:shadow-lg transition cursor-pointer select-none active:scale-95 shrink-0"
                title="Mục SAO LƯU: Đồng bộ Google Drive & Google Sheets của Admin"
              >
                <Cloud className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <span className="tracking-wide text-yellow-200">SAO LƯU</span>
              </button>
            )}

            {/* User Badge: (AD/GV/SV) Name v */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-black/30 hover:bg-black/50 border border-white/40 rounded-full px-3 py-1 text-sm font-medium shadow-sm transition hover:shadow-md cursor-pointer"
              >
                <span className={`w-6 h-6 rounded-full border border-white/70 text-[11px] font-black flex items-center justify-center text-white ${
                  currentUser?.role === 'admin' 
                    ? 'bg-amber-600' 
                    : currentUser?.role === 'teacher' 
                    ? 'bg-blue-600' 
                    : 'bg-emerald-600'
                }`}>
                  {currentUser?.role === 'admin' ? 'AD' : currentUser?.role === 'teacher' ? 'GV' : 'SV'}
                </span>
                <span className="text-xs sm:text-sm text-white font-semibold max-w-[130px] sm:max-w-[180px] truncate">
                  {currentUser ? (
                    currentUser.role === 'admin'
                      ? `Admin: ${currentUser.fullName.replace('ThS. ', '')}`
                      : currentUser.role === 'teacher'
                      ? `GV: ${currentUser.fullName.replace('ThS. ', '')}`
                      : `SV: ${currentUser.fullName}`
                  ) : (
                    `GV: ${themeSettings.authorName || 'Nguyễn Chí Dũng'}`
                  )}
                </span>
                <span className="text-xs text-sky-200">▼</span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 py-2 z-[1000] text-xs animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/80">
                    <p className="font-bold text-slate-900 text-sm">{currentUser?.fullName || themeSettings.authorName || 'ThS. Nguyễn Chí Dũng'}</p>
                    <p className="text-slate-500 text-[11px] font-mono mt-0.5">{currentUser?.email || 'nguyenchidung1278@gmail.com'}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        currentUser?.role === 'admin'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : currentUser?.role === 'teacher'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }`}>
                        {currentUser?.role === 'admin' 
                          ? '👑 Quản trị viên (Toàn quyền)' 
                          : currentUser?.role === 'teacher' 
                          ? '👨‍🏫 Người dùng (Giảng viên/GVCN)' 
                          : `🎓 Sinh viên Điểm danh (${currentUser?.studentRole || 'Cán bộ lớp'})`}
                      </span>
                      {currentUser?.canTakeAttendance && currentUser.role === 'student' && (
                        <span className="px-1.5 py-0.2 bg-teal-50 text-teal-700 text-[10px] font-bold rounded border border-teal-200">
                          ✓ Quyền điểm danh
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nút Quản lý người dùng & Phân quyền: CHỈ HIỂN THỊ CHO ADMIN */}
                  {currentUser?.role === 'admin' && onOpenUserManagement && (
                    <button 
                      onClick={() => { onOpenUserManagement(); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-amber-50/70 flex items-center justify-between text-amber-900 font-bold border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-600" />
                        <span>Quản lý Tài khoản & Phân quyền</span>
                      </div>
                      {pendingUsersCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-bold">
                          {pendingUsersCount} chờ duyệt
                        </span>
                      )}
                    </button>
                  )}

                  {/* Nút SAO LƯU: CHỈ HIỂN THỊ CHO ADMIN (Người dùng & Sinh viên ẩn) */}
                  {currentUser?.role === 'admin' && (
                    <button 
                      onClick={() => { onOpenDriveSync?.(); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-teal-50 flex items-center gap-2 text-teal-800 font-bold border-b border-slate-100"
                    >
                      <Cloud className="w-4 h-4 text-teal-600" />
                      <span>Mục SAO LƯU: Đồng Bộ Google Drive</span>
                    </button>
                  )}

                  {/* Nút SETUP ADMIN: CHỈ HIỂN THỊ CHO ADMIN (Người dùng & Sinh viên ẩn) */}
                  {currentUser?.role === 'admin' && (
                    <button 
                      onClick={() => { onOpenThemeModal(); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-700 font-bold border-b border-slate-100"
                    >
                      <Palette className="w-4 h-4 text-teal-600" />
                      <span>Setup Giao Diện Admin (Logo, Màu, Banner)</span>
                    </button>
                  )}



                  {/* Chuyển đổi nhanh vai trò để kiểm tra 3 giao diện */}
                  {onSwitchUserRole && (
                    <div className="border-t border-slate-100 mt-1 pt-1.5 px-3 pb-1 bg-slate-50/50">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Chuyển đổi giao diện kiểm tra:
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSwitchUserRole('admin');
                            setShowUserMenu(false);
                          }}
                          className={`px-1.5 py-1 rounded text-[10px] font-bold border transition text-center cursor-pointer ${
                            currentUser?.role === 'admin'
                              ? 'bg-amber-100 text-amber-900 border-amber-400 font-black'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Giao diện Admin Master (Hiện đầy đủ tất cả các mục)"
                        >
                          👑 Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSwitchUserRole('teacher');
                            setShowUserMenu(false);
                          }}
                          className={`px-1.5 py-1 rounded text-[10px] font-bold border transition text-center cursor-pointer ${
                            currentUser?.role === 'teacher'
                              ? 'bg-blue-100 text-blue-900 border-blue-400 font-black'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Giao diện Người dùng (Ẩn: TT đơn vị, QL lớp, Sao lưu, Setup admin)"
                        >
                          👨‍🏫 Người dùng
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSwitchUserRole('student');
                            setShowUserMenu(false);
                          }}
                          className={`px-1.5 py-1 rounded text-[10px] font-bold border transition text-center cursor-pointer ${
                            currentUser?.role === 'student'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-black'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Giao diện Sinh viên Điểm danh (Chỉ hiển thị lớp & mục điểm danh)"
                        >
                          🎓 Sinh viên
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button 
                      onClick={() => { 
                        setShowUserMenu(false); 
                        if (onLogout) {
                          onLogout();
                        } else {
                          setShowExitModal(true);
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Đăng xuất khỏi hệ thống
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Exit Button: Circular Red Button with Bold White X */}
            <button
              onClick={() => {
                if (activeTab !== 'home') {
                  setActiveTab('home');
                } else {
                  setShowExitModal(true);
                }
              }}
              title={activeTab !== 'home' ? "Quay về Màn hình Đồ họa Xưởng" : "Đóng phiên làm việc"}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 border-2 border-white/90 text-white flex items-center justify-center shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <svg className="w-5 h-5 drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Exit / Session Dialog */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div 
              style={{ background: `linear-gradient(to right, ${themeSettings.headerBgStart}, ${themeSettings.headerBgEnd})` }}
              className="px-6 py-4 text-white flex items-center justify-between"
            >
              <h3 className="font-bold text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-sky-200" />
                Hệ thống Quản lý Sinh viên Điện tử
              </h3>
              <button 
                onClick={() => setShowExitModal(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 text-slate-700 text-sm">
              <p className="font-semibold text-slate-900 mb-2">
                Bạn đang đăng nhập: {currentUser?.fullName || themeSettings.authorName} ({currentUser?.email || 'nguyenchidung1278@gmail.com'}).
              </p>
              <p className="text-slate-600 mb-4">
                Dữ liệu học tập, điểm danh chuyên cần và sổ quỹ tài chính đã được tự động lưu trữ an toàn trong phiên làm việc.
              </p>
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-800 space-y-1">
                <p><strong>Vai trò:</strong> {currentUser?.role === 'admin' ? 'Quản trị viên (Master Admin)' : currentUser?.role === 'teacher' ? 'Giáo viên Chủ nhiệm' : 'Cán bộ lớp'}</p>
                <p><strong>Đơn vị:</strong> {themeSettings.schoolName}</p>
                <p><strong>Căn cứ:</strong> Thông tư 04/2022/TT-BLĐTBXH & Nghị định 238/2025/NĐ-CP</p>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between gap-3">
              {onLogout && (
                <button
                  onClick={() => {
                    setShowExitModal(false);
                    onLogout();
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Đăng xuất
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setShowExitModal(false);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-xs cursor-pointer"
                >
                  Về Màn hình Đồ họa
                </button>
                <button
                  onClick={() => setShowExitModal(false)}
                  style={{ backgroundColor: themeSettings.tableHeaderBg }}
                  className="px-4 py-2 text-white font-medium rounded-lg text-xs shadow-sm cursor-pointer"
                >
                  Tiếp tục Làm việc
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
