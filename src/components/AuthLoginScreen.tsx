import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  LogIn, 
  GraduationCap, 
  Sparkles, 
  KeyRound, 
  Eye, 
  EyeOff,
  Clock,
  BookOpen,
  Search,
  ArrowRight
} from 'lucide-react';
import { UserAccount, ClassItem, ThemeSettings } from '../types';

interface AuthLoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  users: UserAccount[];
  onRegisterTeacher: (newUser: UserAccount) => void;
  classes: ClassItem[];
  themeSettings?: ThemeSettings;
  onOpenPublicPortal?: () => void;
}

export const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({
  onLoginSuccess,
  users,
  onRegisterTeacher,
  classes,
  themeSettings,
  onOpenPublicPortal
}) => {
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDepartment, setRegDepartment] = useState('Khoa Công nghệ Ô tô');
  const [regClassId, setRegClassId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);
  const [regErrorMsg, setRegErrorMsg] = useState<string | null>(null);

  // Xử lý đăng nhập
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailTrim = loginEmail.trim().toLowerCase();
    const passTrim = loginPassword.trim();

    if (!emailTrim || !passTrim) {
      setLoginError('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }

    // Tìm kiếm tài khoản
    const foundUser = users.find(u => u.email.trim().toLowerCase() === emailTrim);

    if (!foundUser) {
      setLoginError('Email đăng nhập không tồn tại trên hệ thống!');
      return;
    }

    if (foundUser.password !== passTrim) {
      setLoginError('Mật khẩu không chính xác! Vui lòng kiểm tra lại.');
      return;
    }

    if (foundUser.status === 'pending') {
      setLoginError('⚠️ Tài khoản của Thầy/Cô đang ở trạng thái CHỜ ADMIN DUYỆT. Vui lòng liên hệ Quản trị viên (nguyenchidung1278@gmail.com - 0865.074.668) để được kích hoạt!');
      return;
    }

    if (foundUser.status === 'locked') {
      setLoginError('⛔ Tài khoản này đã bị khóa hoặc tạm dừng quyền truy cập. Vui lòng liên hệ Admin!');
      return;
    }

    // Đăng nhập thành công
    onLoginSuccess(foundUser);
  };

  // Xử lý đăng ký giáo viên
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg(null);
    setRegSuccessMsg(null);

    if (!regFullName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setRegErrorMsg('Vui lòng điền đầy đủ tất cả các trường bắt buộc!');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegErrorMsg('Mật khẩu xác nhận không khớp! Vui lòng nhập lại.');
      return;
    }

    if (regPassword.length < 3) {
      setRegErrorMsg('Mật khẩu phải có tối thiểu 3 ký tự!');
      return;
    }

    const emailTrim = regEmail.trim().toLowerCase();
    const existing = users.find(u => u.email.trim().toLowerCase() === emailTrim);
    if (existing) {
      setRegErrorMsg('Email này đã được đăng ký trên hệ thống! Vui lòng dùng email khác hoặc liên hệ Admin.');
      return;
    }

    const newUser: UserAccount = {
      id: `USR_${Date.now()}`,
      email: emailTrim,
      password: regPassword,
      fullName: regFullName.trim(),
      phone: regPhone.trim(),
      role: 'teacher',
      status: 'pending', // Luôn ở trạng thái chờ admin duyệt theo yêu cầu
      department: regDepartment.trim(),
      assignedClassIds: regClassId ? [regClassId] : [],
      canTakeAttendance: true,
      createdAt: new Date().toLocaleString('vi-VN'),
      note: regClassId ? `Xin phụ trách lớp ${regClassId}` : 'Giảng viên đăng ký mới'
    };

    onRegisterTeacher(newUser);
    setRegSuccessMsg(`✅ Đăng ký thành công! Tài khoản "${newUser.fullName}" đã được gửi lên hệ thống. Vui lòng đợi Admin phê duyệt trước khi đăng nhập.`);
    
    // Reset form
    setRegFullName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegClassId('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row h-[85vh]">
        
        {/* Left Col: Cột Nhận Diện Thương Hiệu */}
        <div 
          style={{
            background: `linear-gradient(180deg, ${themeSettings?.headerBgStart || '#013a6b'} 0%, ${themeSettings?.headerBgEnd || '#014c8a'} 100%)`
          }}
          className="md:w-[40%] px-8 py-10 text-white flex flex-col justify-between relative overflow-hidden shrink-0"
        >
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center shrink-0">
              {themeSettings?.logoUrl ? (
                <img src={themeSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M50 12 L84 32 L50 50 L16 32 Z" fill="#212121" />
                  <path d="M16 38 L48 56 L48 90 L16 72 Z" fill="#0284c7" />
                  <path d="M52 56 L84 38 L84 72 L52 90 Z" fill="#dc2626" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="font-black text-white uppercase tracking-tight leading-tight">
                HỆ THỐNG QUẢN LÝ ĐIỆN TỬ
              </h2>
              <p className="text-sm text-sky-100 font-medium mt-1">
                Phát triển bởi: {themeSettings?.authorName || 'ThS: Nguyễn Chí Dũng'}
              </p>
            </div>
          </div>

          {/* Centered Main School & Faculty Titles */}
          <div className="text-center space-y-3">
            <h3 className="text-sm font-bold text-sky-200 uppercase tracking-wider">
              {themeSettings?.schoolName || 'TRƯỜNG CAO ĐẲNG KỸ THUẬT – CÔNG NGHỆ VĨNH PHÚC'}
            </h3>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-tight">
              {themeSettings?.facultyName ? themeSettings.facultyName.split('•')[0].trim() : 'KHOA CÔNG NGHỆ Ô TÔ'}
            </h2>
          </div>

          {/* Footer badge */}
          <div className="flex justify-center">
            <span className="text-xs text-sky-200 bg-white/10 px-4 py-2 rounded-full border border-white/20 tracking-wide uppercase font-semibold">
              Quản trị Đào tạo & Cố vấn GDNN
            </span>
          </div>
        </div>

        {/* Right Col: Form Đăng Nhập & Đăng Ký */}
        <div className="md:w-[60%] p-10 flex flex-col bg-white overflow-y-auto">
          {/* Header Switch Tabs */}
          <div className="flex items-center gap-3 mb-8">
            <button
              type="button"
              onClick={() => { setActiveMode('login'); setLoginError(null); }}
              className={`px-6 py-2.5 font-bold text-sm rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeMode === 'login'
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" /> ĐĂNG NHẬP
            </button>
            <button
              type="button"
              onClick={() => { setActiveMode('register'); setRegErrorMsg(null); setRegSuccessMsg(null); }}
              className={`px-6 py-2.5 font-bold text-sm rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeMode === 'register'
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" /> ĐĂNG KÝ GIÁO VIÊN
            </button>
            {onOpenPublicPortal && (
              <button
                type="button"
                onClick={onOpenPublicPortal}
                className="ml-auto px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-amber-600" /> Tra Cứu HSSV ↗
              </button>
            )}
            <span className="text-sm text-slate-400 ml-4 hidden lg:block">Hệ thống Quản trị v3.5</span>
          </div>

          {/* Content (Login/Register Forms - Insert existing form logic here) */}
          <div className="flex-1">

              {activeMode === 'login' ? (
                <div className="pt-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Đăng nhập tài khoản làm việc</h3>
                  <p className="text-sm text-slate-500 mt-2">Nhập email và mật khẩu được cấp hoặc đã phê duyệt để tiếp tục.</p>
                  
                  {loginError && (
                    <div className="my-4 p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-sm flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span className="font-semibold leading-relaxed">{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-5 mt-6">
                    <div>
                      <label className="font-bold text-slate-700 block mb-2 text-sm">
                        Email đăng nhập: <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="Nhập địa chỉ email đăng nhập"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-bold text-slate-700 text-sm">
                          Mật khẩu: <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-xs text-slate-400 font-normal">Bảo mật cấp cao</span>
                      </div>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Nhập mật khẩu của bạn"
                          className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-indigo-800 hover:bg-indigo-900 text-white font-black text-sm rounded-xl shadow-lg transition cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" /> ĐĂNG NHẬP VÀO HỆ THỐNG
                    </button>
                  </form>

                  <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 flex items-center justify-between">
                    <span>Chưa có tài khoản giảng viên?</span>
                    <button
                      type="button"
                      onClick={() => { setActiveMode('register'); setRegErrorMsg(null); }}
                      className="font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      Đăng ký tài khoản mới →
                    </button>
                  </div>

                  {onOpenPublicPortal && (
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={onOpenPublicPortal}
                        className="text-sm text-amber-700 hover:text-amber-800 font-bold hover:underline inline-flex items-center gap-2 cursor-pointer transition"
                      >
                        <GraduationCap className="w-4 h-4 text-amber-600" />
                        <span>Phụ huynh & HSSV tra cứu kết quả trực tuyến (không cần tài khoản) →</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-5 animate-in fade-in duration-200">
                  <div className="mb-4">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      Đăng ký tài khoản Giảng viên / Cố vấn
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sau khi đăng ký, Quản trị viên (dl1032008@gmail.com) sẽ phê duyệt và phân quyền lớp cho Thầy/Cô.
                    </p>
                  </div>

                  {regSuccessMsg && (
                    <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold">{regSuccessMsg}</p>
                        <button
                          type="button"
                          onClick={() => { setActiveMode('login'); }}
                          className="text-blue-700 underline font-bold"
                        >
                          Chuyển về màn hình đăng nhập
                        </button>
                      </div>
                    </div>
                  )}

                  {regErrorMsg && (
                    <div className="mb-3.5 p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="font-semibold">{regErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs max-h-[380px] overflow-y-auto pr-1">
                    {/* ... register form fields ... */}
                  </form>
                </div>
              )}
          </div>
          
          {/* Footer note */}
          <div className="pt-6 mt-6 border-t border-slate-100 text-sm text-slate-500 flex items-center justify-between">
            <span>Hệ thống Quản trị & Cố vấn Học tập Điện tử</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Bảo mật đa cấp
            </span>

          </div>
        </div>
      </div>
    </div>
  );
};

