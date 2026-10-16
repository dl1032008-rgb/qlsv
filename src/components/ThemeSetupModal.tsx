import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, 
  Upload, 
  Link, 
  Image as ImageIcon, 
  Building2, 
  Check, 
  RotateCcw, 
  X, 
  ShieldCheck, 
  Sparkles,
  Sliders,
  Eye,
  Trash2
} from 'lucide-react';
import { ThemeSettings, DEFAULT_THEME_SETTINGS } from '../types';

export const LOGO_PRESETS = [
  {
    id: 'default-crest',
    name: 'Huy hiệu Piston Kỹ thuật Gốc',
    url: '',
    desc: 'Emblem kim cương hình học động cơ & bánh răng'
  },
  {
    id: 'gear-wrench',
    name: 'Bánh Răng & Cờ Lê Kỹ Thuật Động Lực',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%2301427a"/><circle cx="50" cy="50" r="40" fill="%23ffffff"/><path d="M46 16 h8 v10 h-8 z M46 74 h8 v10 h-8 z M16 46 h10 v8 h-10 z M74 46 h10 v8 h-10 z M25 25 l7 7 -6 6 -7 -7 z M68 68 l7 7 -6 6 -7 -7 z M25 75 l7 -7 6 6 -7 7 z M68 32 l7 -7 6 6 -7 7 z" fill="%2301427a"/><circle cx="50" cy="50" r="26" fill="%23004e92"/><path d="M42 35 l16 16 -6 6 -16 -16 z M58 45 l8 -8 5 5 -8 8 z" fill="%23fbbf24"/><circle cx="50" cy="50" r="10" fill="%23ffffff"/></svg>',
    desc: 'Cơ khí ô tô truyền thống - Vector sắc nét'
  },
  {
    id: 'v-speed',
    name: 'VinFast / Chữ V Kỹ Thuật Ô Tô',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23881337"/><path d="M22 26 L50 78 L78 26 L65 26 L50 56 L35 26 Z" fill="%23ffffff"/><path d="M28 26 L50 68 L72 26 L65 26 L50 52 L35 26 Z" fill="%23fbbf24"/></svg>',
    desc: 'Phong cách thương hiệu ô tô Việt Nam'
  },
  {
    id: 'engine-blue',
    name: 'Động Cơ EFI & Điện Tử Ô Tô',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%230369a1"/><circle cx="50" cy="50" r="40" fill="%23ffffff"/><rect x="28" y="34" width="44" height="32" rx="6" fill="%230284c7"/><rect x="38" y="28" width="24" height="6" fill="%2301427a"/><circle cx="50" cy="50" r="9" fill="%23facc15"/></svg>',
    desc: 'Khối động cơ điện tử thông minh'
  },
  {
    id: 'college-shield',
    name: 'Huy Hiệu Trường Cao Đẳng Nghề GDNN',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,6 90,26 90,74 50,94 10,74 10,26" fill="%23047857"/><circle cx="50" cy="50" r="32" fill="%23ffffff"/><polygon points="50,28 62,50 38,50" fill="%23f59e0b"/><path d="M30 60 Q50 50 70 60 Q50 68 30 60 Z" fill="%23047857"/></svg>',
    desc: 'Đào tạo giáo dục nghề nghiệp chuẩn'
  }
];

export const COLOR_PRESETS = [
  {
    id: 'classic-blue',
    name: 'Xanh Lam Kỹ Thuật (Mặc định)',
    headerStart: '#01427a',
    headerEnd: '#014c8a',
    tableHeader: '#004e92',
    sidebarStart: '#006bb6',
    sidebarEnd: '#004883',
    cardBg: '#ffffff',
    tagColor: 'bg-blue-600'
  },
  {
    id: 'midnight-navy',
    name: 'Xanh Navy Đậm Quản Trị',
    headerStart: '#0f172a',
    headerEnd: '#1e293b',
    tableHeader: '#0f172a',
    sidebarStart: '#1e293b',
    sidebarEnd: '#0f172a',
    cardBg: '#ffffff',
    tagColor: 'bg-slate-800'
  },
  {
    id: 'burgundy-red',
    name: 'Đỏ Đô VinFast / Thaco Auto',
    headerStart: '#881337',
    headerEnd: '#9f1239',
    tableHeader: '#881337',
    sidebarStart: '#9f1239',
    sidebarEnd: '#4c0519',
    cardBg: '#ffffff',
    tagColor: 'bg-rose-700'
  },
  {
    id: 'emerald-tech',
    name: 'Xanh Xưởng Toyota / Denso',
    headerStart: '#064e3b',
    headerEnd: '#065f46',
    tableHeader: '#047857',
    sidebarStart: '#059669',
    sidebarEnd: '#064e3b',
    cardBg: '#ffffff',
    tagColor: 'bg-emerald-600'
  },
  {
    id: 'titanium-dark',
    name: 'Xám Titan Cơ Khí Chính Xác',
    headerStart: '#18181b',
    headerEnd: '#27272a',
    tableHeader: '#27272a',
    sidebarStart: '#3f3f46',
    sidebarEnd: '#18181b',
    cardBg: '#ffffff',
    tagColor: 'bg-zinc-700'
  },
  {
    id: 'amber-industrial',
    name: 'Cam Cơ Giới Công Trình Heavy Duty',
    headerStart: '#7c2d12',
    headerEnd: '#9a3412',
    tableHeader: '#c2410c',
    sidebarStart: '#ea580c',
    sidebarEnd: '#9a3412',
    cardBg: '#ffffff',
    tagColor: 'bg-amber-600'
  }
];

export const BANNER_PRESETS = [
  {
    id: 'chassis-svg',
    name: 'Khung Gầm & Hệ Dẫn Động 3D Cắt Bổ (Mặc định)',
    url: '',
    desc: 'Đồ họa cắt bổ hệ thống truyền lực xe ô tô tương tác'
  },
  {
    id: 'workshop-1',
    name: 'Xưởng Thực Hành Ô Tô Hiện Đại',
    url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
    desc: 'Cầu nâng thủy lực và khu vực bảo dưỡng chuyên nghiệp'
  },
  {
    id: 'engine-bay',
    name: 'Khoang Động Cơ & Chẩn Đoán Quét Lỗi',
    url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
    desc: 'Khối động cơ tăng áp và máy quét mã lỗi OBD-II'
  },
  {
    id: 'assembly-line',
    name: 'Dây Chuyền Lắp Ráp & Kiểm Định Ô Tô',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    desc: 'Nhà máy sản xuất và thử nghiệm kỹ thuật hiện đại'
  },
  {
    id: 'auto-mechanic',
    name: 'Thực Hành Cân Bằng Lốp & Hệ Thống Phanh',
    url: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=1200&q=80',
    desc: 'Thiết bị căn chỉnh góc đặt bánh xe và phanh đĩa ABS'
  }
];

interface ThemeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeSettings: ThemeSettings;
  onSaveTheme: (newSettings: ThemeSettings) => void;
}

export const ThemeSetupModal: React.FC<ThemeSetupModalProps> = ({
  isOpen,
  onClose,
  themeSettings,
  onSaveTheme
}) => {
  const [activeTab, setActiveTab] = useState<'logo' | 'banner' | 'colors'>('logo');
  const [currentTheme, setCurrentTheme] = useState<ThemeSettings>(themeSettings);
  const [logoInputUrl, setLogoInputUrl] = useState('');
  const [bannerInputUrl, setBannerInputUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentTheme(themeSettings);
      setErrorMessage(null);
    }
  }, [isOpen, themeSettings]);

  if (!isOpen) return null;

  // Handle Logo File Upload
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Vui lòng chọn tệp ảnh logo dung lượng dưới 2MB để đảm bảo hiệu năng lưu trữ.');
        return;
      }
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCurrentTheme(prev => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Banner File Upload
  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setErrorMessage('Vui lòng chọn tệp ảnh banner dung lượng dưới 3MB.');
        return;
      }
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCurrentTheme(prev => ({ ...prev, bannerUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyLogoUrl = () => {
    if (logoInputUrl.trim()) {
      setCurrentTheme(prev => ({ ...prev, logoUrl: logoInputUrl.trim() }));
      setLogoInputUrl('');
    }
  };

  const handleApplyBannerUrl = () => {
    if (bannerInputUrl.trim()) {
      setCurrentTheme(prev => ({ ...prev, bannerUrl: bannerInputUrl.trim() }));
      setBannerInputUrl('');
    }
  };

  const handleApplyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setCurrentTheme(prev => ({
      ...prev,
      presetTheme: preset.id,
      headerBgStart: preset.headerStart,
      headerBgEnd: preset.headerEnd,
      tableHeaderBg: preset.tableHeader,
      sidebarBtnBgStart: preset.sidebarStart,
      sidebarBtnBgEnd: preset.sidebarEnd,
      cardBg: preset.cardBg
    }));
  };

  const handleResetToDefault = () => {
    if (window.confirm('Khôi phục lại cấu hình giao diện mặc định ban đầu?')) {
      setCurrentTheme(DEFAULT_THEME_SETTINGS);
    }
  };

  const handleComplete = () => {
    onSaveTheme(currentTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-300 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header (Mô phỏng chính xác Hình 2) */}
        <div className="bg-[#101b33] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800/80 border border-teal-500/50 flex items-center justify-center text-teal-300 shadow-sm shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">Setup Giao Diện Admin</h3>
                <span className="flex items-center gap-1 bg-teal-900/90 text-teal-300 border border-teal-500/60 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Quyền Quản Trị Viên
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Tùy biến Logo Nhà trường, Màu Head/Foot, Thanh tiêu đề, Khung bảng & Banner ảnh bìa (như Hình 2)
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 px-5 py-2.5 text-xs font-semibold flex items-center justify-between">
            <span>⚠️ {errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-800">✕</button>
          </div>
        )}

        {/* Modal Tabs Navigation: Gồm 3 tab lớn theo đúng 4 chức năng yêu cầu */}
        <div className="flex border-b border-slate-200 bg-slate-100/80 px-4 pt-2 gap-2 text-xs font-bold select-none overflow-x-auto shrink-0">
          {/* 1. THAY ĐỔI LOGO */}
          <button
            onClick={() => setActiveTab('logo')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'logo'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>1. Thay đổi LOGO</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold border border-amber-300">
              Logo & Đơn vị
            </span>
          </button>

          {/* 2. THAY ĐỔI ẢNH BÌA, BANNER */}
          <button
            onClick={() => setActiveTab('banner')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'banner'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-sky-600" />
            <span>2. Thay đổi Ảnh bìa, Banner</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold border border-blue-300">
              Xưởng & 3D
            </span>
          </button>

          {/* 3. THAY ĐỔI MÀU HEAD, FOOT & BẢNG */}
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'colors'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Palette className="w-4 h-4 text-purple-600" />
            <span>3. Màu Head, Foot & Khung Bảng</span>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold border border-purple-300">
              Màu sắc
            </span>
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-800 flex-1">
          
          {/* ========================================================= */}
          {/* CHỨC NĂNG 1: THAY ĐỔI LOGO                                */}
          {/* ========================================================= */}
          {activeTab === 'logo' && (
            <div className="space-y-4">
              {/* Header Preview Box with Live Logo */}
              <div 
                style={{ 
                  background: `linear-gradient(to right, ${currentTheme.headerBgStart}, ${currentTheme.headerBgEnd})` 
                }}
                className="rounded-xl p-4 sm:p-5 text-white shadow-md flex items-center gap-4 transition-all"
              >
                {/* Logo Display */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center shrink-0 border border-white/60">
                  {currentTheme.logoUrl ? (
                    <img 
                      src={currentTheme.logoUrl} 
                      alt="Logo Trường" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                      <polygon points="50,4 94,28 94,76 50,96 6,76 6,28" fill="#f8fafc" stroke="#cfd8dc" strokeWidth="2" />
                      <path d="M50 14 L82 32 L50 50 L18 32 Z" fill="#212121" />
                      <path d="M18 38 L48 55 L48 88 L18 70 Z" fill="#01579b" />
                      <path d="M52 55 L82 38 L82 70 L52 88 Z" fill="#d32f2f" />
                      <circle cx="50" cy="50" r="10" fill="#ffffff" stroke="#263238" strokeWidth="2.5" />
                      <circle cx="50" cy="50" r="4.5" fill="#d32f2f" />
                    </svg>
                  )}
                </div>

                {/* Institution Text */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-black tracking-tight text-white uppercase drop-shadow-xs truncate">
                    {currentTheme.schoolName}
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-sky-200 uppercase mt-0.5 truncate">
                    {currentTheme.facultyName}
                  </p>
                  <p className="text-[11px] text-yellow-300 font-medium mt-1 truncate">
                    {currentTheme.systemTitle}
                  </p>
                </div>

                {currentTheme.logoUrl && (
                  <button
                    onClick={() => setCurrentTheme(prev => ({ ...prev, logoUrl: '' }))}
                    className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                    title="Xóa logo tùy biến, quay về logo gốc"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Về Logo Gốc</span>
                  </button>
                )}
              </div>

              {/* Upload Box (Từ Máy Tính) */}
              <div className="border-2 border-dashed border-blue-300 bg-blue-50/40 hover:bg-blue-50/70 transition rounded-xl p-5 sm:p-6 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2.5 shadow-md shadow-blue-500/20">
                  <Upload className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Tải Tệp Ảnh Logo Từ Máy Tính (Quyền Quản Trị Viên)
                </h4>
                <p className="text-slate-500 text-xs mt-1 max-w-lg">
                  Hỗ trợ định dạng <strong>SVG, PNG trong suốt, JPG, WebP</strong>. Tự động chuyển đổi và lưu vào hệ thống.
                </p>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/png, image/jpeg, image/svg+xml, image/webp" 
                  onChange={handleLogoFileUpload} 
                  className="hidden" 
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95 text-xs sm:text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Chọn Tệp Ảnh Logo Từ Máy Tính
                </button>
              </div>

              {/* Thư viện Logo Mẫu Kỹ thuật Ô tô Có Sẵn */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs uppercase">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Hoặc Chọn Nhanh Logo Mẫu Kỹ Thuật Có Sẵn:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {LOGO_PRESETS.map((item) => {
                    const isSelected = currentTheme.logoUrl === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setCurrentTheme(prev => ({ ...prev, logoUrl: item.url }))}
                        className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30'
                            : 'border-slate-200 hover:border-blue-300 bg-white'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-md bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                          {item.url ? (
                            <img src={item.url} alt={item.name} className="w-full h-full object-contain" />
                          ) : (
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                              <polygon points="50,4 94,28 94,76 50,96 6,76 6,28" fill="#01579b" />
                              <circle cx="50" cy="50" r="10" fill="#ffffff" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-[11px] truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 font-bold shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* URL Option */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                  <Link className="w-4 h-4 text-blue-600" />
                  Hoặc Nhập Đường Dẫn Ảnh Logo Trực Tuyến (URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/logo-truong.png hoặc data:image/png..."
                    value={logoInputUrl}
                    onChange={(e) => setLogoInputUrl(e.target.value)}
                    className="flex-1 p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleApplyLogoUrl}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-bold text-xs cursor-pointer"
                  >
                    Áp Dụng
                  </button>
                </div>
              </div>

              {/* Edit School, Faculty & System Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h5 className="font-bold text-slate-800 text-xs uppercase flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  Chỉnh Sửa Tên Trường, Khoa & Thông Tin Tiêu Đề
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-600">Tên Nhà Trường:</label>
                    <input
                      type="text"
                      value={currentTheme.schoolName}
                      onChange={(e) => setCurrentTheme(prev => ({ ...prev, schoolName: e.target.value }))}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-slate-600">Tên Khoa / Bộ môn:</label>
                    <input
                      type="text"
                      value={currentTheme.facultyName}
                      onChange={(e) => setCurrentTheme(prev => ({ ...prev, facultyName: e.target.value }))}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold block mb-1 text-slate-600">Tiêu đề Hệ thống:</label>
                    <input
                      type="text"
                      value={currentTheme.systemTitle}
                      onChange={(e) => setCurrentTheme(prev => ({ ...prev, systemTitle: e.target.value }))}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-bold text-blue-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CHỨC NĂNG 2: THAY ĐỔI ẢNH BÌA, BANNER                     */}
          {/* ========================================================= */}
          {activeTab === 'banner' && (
            <div className="space-y-4">
              {/* Banner Live Preview Box */}
              <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-md h-52 sm:h-56 bg-slate-900 flex items-center justify-center">
                {currentTheme.bannerUrl ? (
                  <img 
                    src={currentTheme.bannerUrl} 
                    alt="Banner Lớp Học" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-[11px] bg-blue-500/30 text-blue-300 border border-blue-400/40 px-3 py-1 rounded-full uppercase tracking-wider font-bold mb-2">
                      Mô hình hệ dẫn động & Khung gầm ô tô 3D (Đồ họa kỹ thuật gốc)
                    </span>
                    <p className="text-white font-bold text-sm sm:text-base">
                      {currentTheme.bannerTitle || 'MÔ HÌNH HỆ DẪN ĐỘNG & KHUNG GẦM Ô TÔ THỰC HÀNH XƯỞNG'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Đang sử dụng mô hình cắt bổ tương tác cơ cấu truyền động
                    </p>
                  </div>
                )}
                
                {/* Title overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 sm:p-4 text-white flex items-end justify-between">
                  <div>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {currentTheme.bannerUrl ? 'ẢNH BÌA TÙY BIẾN' : 'ĐỒ HỌA 3D MẶC ĐỊNH'}
                    </span>
                    <p className="text-xs sm:text-sm font-bold uppercase mt-1 drop-shadow-sm">
                      {currentTheme.bannerTitle || 'MÔ HÌNH HỆ DẪN ĐỘNG & KHUNG GẦM Ô TÔ THỰC HÀNH XƯỞNG'}
                    </p>
                  </div>

                  {currentTheme.bannerUrl && (
                    <button
                      onClick={() => setCurrentTheme(prev => ({ ...prev, bannerUrl: '' }))}
                      className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Về Đồ Họa 3D</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Upload Ảnh Bìa từ máy tính */}
              <div className="border-2 border-dashed border-sky-300 bg-sky-50/40 rounded-xl p-5 text-center flex flex-col items-center justify-center">
                <input 
                  type="file" 
                  ref={bannerFileInputRef} 
                  accept="image/*" 
                  onChange={handleBannerFileUpload} 
                  className="hidden" 
                />
                <button
                  onClick={() => bannerFileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer text-xs sm:text-sm active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  Chọn Tệp Ảnh Bìa Từ Máy Tính
                </button>
                <p className="text-slate-500 text-[11px] mt-2">Hỗ trợ ảnh JPG, PNG, WebP kích thước khuyến nghị 1200x500 px</p>
              </div>

              {/* Banner Presets */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 text-xs block uppercase">
                  Hoặc Chọn Mẫu Ảnh Bìa Kỹ Thuật Có Sẵn:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BANNER_PRESETS.map(preset => (
                    <div
                      key={preset.id}
                      onClick={() => setCurrentTheme(prev => ({ ...prev, bannerUrl: preset.url }))}
                      className={`p-3 rounded-lg border cursor-pointer transition flex items-start gap-2.5 ${
                        currentTheme.bannerUrl === preset.url
                          ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/30'
                          : 'border-slate-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className="w-14 h-11 rounded bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                        {preset.url ? (
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-900 text-white flex items-center justify-center text-[11px] font-bold">3D</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-xs truncate">{preset.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{preset.desc}</p>
                      </div>
                      {currentTheme.bannerUrl === preset.url && (
                        <Check className="w-4 h-4 text-blue-600 font-bold shrink-0 self-center" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Nhập URL và Tiêu đề Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="font-bold block text-slate-700 text-xs">Đường Dẫn URL Ảnh Bìa Online:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={bannerInputUrl}
                      onChange={(e) => setBannerInputUrl(e.target.value)}
                      className="flex-1 p-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
                    />
                    <button
                      onClick={handleApplyBannerUrl}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-bold text-xs cursor-pointer"
                    >
                      Gán
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="font-bold block text-slate-700 text-xs">Tiêu Đề Chú Thích Banner:</label>
                  <input
                    type="text"
                    value={currentTheme.bannerTitle || ''}
                    onChange={(e) => setCurrentTheme(prev => ({ ...prev, bannerTitle: e.target.value }))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                    placeholder="VD: MÔ HÌNH HỆ DẪN ĐỘNG & KHUNG GẦM Ô TÔ THỰC HÀNH XƯỞNG"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CHỨC NĂNG 3 & 4: MÀU HEAD, FOOT & THANH TIÊU ĐỀ, NỀN BẢNG  */}
          {/* ========================================================= */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              
              {/* Presets Gallery */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Chọn Bộ Phối Màu Nhanh (Theme Presets Chuẩn GDNN):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {COLOR_PRESETS.map(preset => {
                    const isSelected = currentTheme.presetTheme === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/30 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-7 h-7 rounded-full border border-white shadow-xs shrink-0" 
                            style={{ background: `linear-gradient(135deg, ${preset.headerStart}, ${preset.tableHeader})` }}
                          />
                          <span className="font-bold text-slate-800 text-xs">{preset.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 font-bold" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tùy biến chi tiết từng vùng màu: Head/Foot, Thanh Tiêu Đề, Nền Khung Bảng */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h5 className="font-bold text-slate-800 text-xs uppercase flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Sliders className="w-4 h-4 text-slate-600" />
                  Tùy Biến Chi Tiết Từng Vùng Màu Sắc:
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. MÀU HEAD, FOOT */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                        1. Màu Head & Foot (Dải Gradient):
                      </span>
                      <span 
                        className="text-[10px] text-white px-2 py-0.5 rounded font-bold"
                        style={{ background: `linear-gradient(to right, ${currentTheme.headerBgStart}, ${currentTheme.headerBgEnd})` }}
                      >
                        Xem trước Head/Foot
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentTheme.headerBgStart}
                          onChange={(e) => setCurrentTheme(prev => ({ ...prev, headerBgStart: e.target.value, presetTheme: 'custom' }))}
                          className="w-9 h-9 rounded-md border border-slate-300 cursor-pointer shadow-xs"
                        />
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold">Màu Đầu (Start):</p>
                          <span className="text-xs font-mono font-bold text-slate-700">{currentTheme.headerBgStart}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentTheme.headerBgEnd}
                          onChange={(e) => setCurrentTheme(prev => ({ ...prev, headerBgEnd: e.target.value, presetTheme: 'custom' }))}
                          className="w-9 h-9 rounded-md border border-slate-300 cursor-pointer shadow-xs"
                        />
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold">Màu Cuối (End):</p>
                          <span className="text-xs font-mono font-bold text-slate-700">{currentTheme.headerBgEnd}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. MÀU THANH TIÊU ĐỀ KHUNG BẢNG (thead) */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        2. Màu Thanh Tiêu Đề Bảng (thead / Title):
                      </span>
                      <span 
                        className="text-[10px] text-white px-2 py-0.5 rounded font-bold"
                        style={{ backgroundColor: currentTheme.tableHeaderBg }}
                      >
                        Tiêu đề Cột
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={currentTheme.tableHeaderBg}
                        onChange={(e) => setCurrentTheme(prev => ({ ...prev, tableHeaderBg: e.target.value, presetTheme: 'custom' }))}
                        className="w-9 h-9 rounded-md border border-slate-300 cursor-pointer shadow-xs"
                      />
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold">Mã Màu Tiêu Đề:</p>
                        <span className="text-xs font-mono font-bold text-slate-700">{currentTheme.tableHeaderBg}</span>
                      </div>

                      {/* Quick Swatches for Table Header */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        {['#004e92', '#0f172a', '#881337', '#047857', '#18181b', '#c2410c'].map((c) => (
                          <button
                            key={c}
                            onClick={() => setCurrentTheme(prev => ({ ...prev, tableHeaderBg: c, presetTheme: 'custom' }))}
                            style={{ backgroundColor: c }}
                            className="w-5 h-5 rounded-full border border-white shadow-xs cursor-pointer hover:scale-110 transition-transform"
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. MÀU NỀN CÁC KHUNG BẢNG & CARD */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        3. Màu Nền Các Khung Bảng & Thẻ Card:
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {currentTheme.cardBg}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={currentTheme.cardBg}
                        onChange={(e) => setCurrentTheme(prev => ({ ...prev, cardBg: e.target.value, presetTheme: 'custom' }))}
                        className="w-9 h-9 rounded-md border border-slate-300 cursor-pointer shadow-xs"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentTheme(prev => ({ ...prev, cardBg: '#ffffff' }))}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[11px] font-semibold text-slate-700 cursor-pointer"
                        >
                          Trắng (#ffffff)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentTheme(prev => ({ ...prev, cardBg: '#f8fafc' }))}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[11px] font-semibold text-slate-700 cursor-pointer"
                        >
                          Xám Slate (#f8fafc)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentTheme(prev => ({ ...prev, cardBg: '#fefce8' }))}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded text-[11px] font-semibold text-amber-800 cursor-pointer"
                        >
                          Kem Xưởng (#fefce8)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 4. MÀU NÚT MENU SIDEBAR TRÁI */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                        4. Màu Nút Menu Sidebar:
                      </span>
                      <span 
                        className="text-[10px] text-white px-2 py-0.5 rounded font-bold"
                        style={{ background: `linear-gradient(to bottom, ${currentTheme.sidebarBtnBgStart}, ${currentTheme.sidebarBtnBgEnd})` }}
                      >
                        NÚT MENU
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentTheme.sidebarBtnBgStart}
                          onChange={(e) => setCurrentTheme(prev => ({ ...prev, sidebarBtnBgStart: e.target.value, presetTheme: 'custom' }))}
                          className="w-9 h-9 rounded-md border border-slate-300 cursor-pointer shadow-xs"
                        />
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold">Start:</p>
                          <span className="text-xs font-mono font-bold text-slate-700">{currentTheme.sidebarBtnBgStart}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentTheme.sidebarBtnBgEnd}
                          onChange={(e) => setCurrentTheme(prev => ({ ...prev, sidebarBtnBgEnd: e.target.value, presetTheme: 'custom' }))}
                          className="w-9 h-9 rounded-md border border-slate-300 cursor-pointer shadow-xs"
                        />
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold">End:</p>
                          <span className="text-xs font-mono font-bold text-slate-700">{currentTheme.sidebarBtnBgEnd}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MÔ HÌNH XEM TRƯỚC BẢNG BIỂU DỮ LIỆU THỰC TẾ (Live Preview) */}
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <p className="font-bold text-slate-700 text-xs mb-2 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-blue-600" />
                    Khung Xem Trước Bảng Biểu & Card Dữ Liệu Theo Màu Đã Chọn:
                  </p>
                  
                  <div 
                    style={{ backgroundColor: currentTheme.cardBg }}
                    className="rounded-xl border border-slate-300 p-3 shadow-xs space-y-2 transition-colors"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="font-bold text-slate-800 text-xs">Mô phỏng Khung Bảng Điểm & Danh Sách HSSV</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Trạng thái Hoạt động</span>
                    </div>

                    {/* Table Simulation */}
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr style={{ backgroundColor: currentTheme.tableHeaderBg }} className="text-white font-bold">
                            <th className="p-2">STT</th>
                            <th className="p-2">Mã SV</th>
                            <th className="p-2">Họ và Tên</th>
                            <th className="p-2">Mô đun Thực Hành</th>
                            <th className="p-2 text-center">Điểm HP</th>
                            <th className="p-2 text-center">Xếp Loại</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          <tr>
                            <td className="p-2 font-bold">01</td>
                            <td className="p-2 font-mono text-blue-700">25CD-OT01</td>
                            <td className="p-2 font-bold">Nguyễn Văn An</td>
                            <td className="p-2">Bảo dưỡng Động cơ Xăng EFI</td>
                            <td className="p-2 text-center font-bold text-emerald-700">8.8</td>
                            <td className="p-2 text-center"><span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Giỏi</span></td>
                          </tr>
                          <tr className="bg-slate-50/50">
                            <td className="p-2 font-bold">02</td>
                            <td className="p-2 font-mono text-blue-700">25CD-OT02</td>
                            <td className="p-2 font-bold">Trần Minh Bình</td>
                            <td className="p-2">Điện - Điện tử Ô tô Cơ bản</td>
                            <td className="p-2 text-center font-bold text-blue-700">9.2</td>
                            <td className="p-2 text-center"><span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">Xuất sắc</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Action Bar (Mô phỏng chính xác Hình 2) */}
        <div className="bg-slate-100 px-5 sm:px-6 py-3.5 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="text-teal-600 font-bold">🛡</span>
            <span>Chế độ Quản Trị Viên: Tùy biến được lưu vào bộ nhớ trình duyệt và áp dụng đồng bộ.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleResetToDefault}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Mặc Định
            </button>
            <button
              onClick={handleComplete}
              className="px-6 py-2.5 bg-[#101b33] hover:bg-slate-900 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              Hoàn Tất & Lưu Cấu Hình
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
