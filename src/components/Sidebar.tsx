import React, { useState } from 'react';
import { ActiveTab, AcademicYear, ClassId, ThemeSettings, ClassItem, UserAccount, Student } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  academicYear: AcademicYear;
  setAcademicYear: (year: AcademicYear) => void;
  currentClass: ClassId;
  setCurrentClass: (cls: ClassId) => void;
  themeSettings?: ThemeSettings;
  onOpenUnitInfoModal: () => void;
  classes?: ClassItem[];
  onOpenCurriculumModal?: (systemName: string) => void;
  currentUser?: UserAccount | null;
  onOpenUserManagement?: () => void;
  pendingUsersCount?: number;
  students?: Student[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  academicYear,
  setAcademicYear,
  currentClass,
  setCurrentClass,
  themeSettings,
  onOpenUnitInfoModal,
  classes = [],
  onOpenCurriculumModal,
  currentUser,
  onOpenUserManagement,
  pendingUsersCount = 0,
  students = []
}) => {
  const [sidebarToast, setSidebarToast] = useState<string | null>(null);

  // Mặc định ẩn nội dung: Khi khởi động hoặc chưa chọn hệ đào tạo, toàn bộ danh sách lớp học thuộc các hệ bị thu gọn (ẩn)
  const [openSystems, setOpenSystems] = useState<Record<string, boolean>>({
    'HỆ CAO ĐẲNG CHÍNH QUY': false,
    'HỆ LIÊN THÔNG CAO ĐẲNG': false,
    'HỆ TRUNG CẤP + THPT': false
  });

  const toggleSystem = (title: string) => {
    setOpenSystems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const showSidebarToast = (msg: string) => {
    setSidebarToast(msg);
    setTimeout(() => setSidebarToast(null), 3800);
  };

  // 1. Kiểm tra khóa chức năng đối với Sinh viên / Cán bộ lớp (chỉ được vào Điểm danh)
  const isStudentLocked = (targetTab: ActiveTab) => {
    return currentUser?.role === 'student' && targetTab !== 'attendance';
  };

  const handleTabClick = (targetTab: ActiveTab) => {
    if (isStudentLocked(targetTab)) {
      showSidebarToast('🔒 Bạn đăng nhập với vai trò Cán bộ lớp: Chỉ có quyền truy cập chức năng Điểm danh chuyên cần! Tất cả các mục khác đã bị khóa.');
      return;
    }
    setActiveTab(targetTab);
  };

  // 2. Kiểm tra phân quyền truy cập lớp học (Bảo mật giữa các lớp)
  const isClassAccessible = (classId: string) => {
    if (!currentUser || currentUser.role === 'admin') return true;
    if (currentUser.role === 'teacher') {
      const isMyClass = (currentUser.assignedClassIds || []).includes(classId) || (currentUser.assignedClassIds || []).includes('*');
      if (isMyClass) return true;
      return !!currentUser.canViewOtherClasses; // Admin có phân quyền cho phép xem lớp khác hay không
    }
    if (currentUser.role === 'student') {
      return (currentUser.assignedClassIds || []).includes(classId);
    }
    return false;
  };

  const isClassMyOwnership = (classId: string) => {
    if (!currentUser || currentUser.role !== 'teacher') return false;
    return (currentUser.assignedClassIds || []).includes(classId) || (currentUser.assignedClassIds || []).includes('*');
  };

  const getButtonClass = (isActive: boolean, tabName?: ActiveTab) => {
    if (tabName && isStudentLocked(tabName)) {
      return 'w-full text-center font-bold text-xs lg:text-[13px] tracking-wide uppercase py-2 px-3 rounded-md transition-all select-none border border-slate-300 bg-slate-200/90 text-slate-400 opacity-60 cursor-not-allowed flex items-center justify-center gap-1.5';
    }
    return `w-full text-center font-bold text-xs lg:text-[13px] tracking-wide uppercase py-2.5 px-3 rounded-md transition-all duration-150 cursor-pointer shadow-md select-none border ${
      isActive
        ? 'bg-gradient-to-b from-[#0288d1] via-[#0277bd] to-[#01579b] text-yellow-300 border-yellow-400 ring-2 ring-yellow-400/50 shadow-blue-900/40 translate-x-0.5'
        : 'hover:brightness-110 text-white border-black/20 active:scale-[0.98]'
    }`;
  };

  const getButtonStyle = (isActive: boolean, tabName?: ActiveTab) => {
    if (tabName && isStudentLocked(tabName)) return {};
    if (isActive) return {};
    return {
      background: `linear-gradient(to bottom, ${themeSettings?.sidebarBtnBgStart || '#006bb6'}, ${themeSettings?.sidebarBtnBgEnd || '#004883'})`
    };
  };

  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';
  const isTeacher = currentUser?.role === 'teacher' || (!isAdmin && !isStudent);

  return (
    <aside className="w-64 sm:w-68 lg:w-72 bg-slate-50 border-r border-slate-300 p-2.5 sm:p-3 flex flex-col gap-2.5 shrink-0 shadow-sm z-20 overflow-y-auto relative">
      {/* Toast thông báo quyền bảo mật */}
      {sidebarToast && (
        <div className="absolute top-2 left-2 right-2 z-50 bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl text-[11px] font-semibold border border-amber-400 text-center animate-in fade-in">
          <span>{sidebarToast}</span>
        </div>
      )}

      {/* 1. THÔNG TIN ĐƠN VỊ: CHỈ HIỂN THỊ CHO ADMIN (Giao diện người dùng và Sinh viên đều ẩn) */}
      {isAdmin && (
        <button
          onClick={onOpenUnitInfoModal}
          className="w-full text-center font-black text-xs lg:text-[13px] tracking-wide uppercase py-2.5 px-3 rounded-lg transition-all duration-150 select-none border-2 border-yellow-400 ring-2 ring-yellow-400/50 bg-gradient-to-b from-[#0288d1] via-[#0277bd] to-[#01579b] text-yellow-300 hover:brightness-110 active:scale-[0.98] drop-shadow-xs cursor-pointer shadow-md hover:shadow-lg"
          title="Bấm để mở bảng tùy chỉnh thông tin trường lớp (Dành riêng cho Admin)"
        >
          THÔNG TIN ĐƠN VỊ
        </button>
      )}

      {/* 2. QUẢN LÝ LỚP HỌC: CHỈ HIỂN THỊ CHO ADMIN (Giao diện người dùng và Sinh viên đều ẩn) */}
      {isAdmin && (
        <button
          onClick={() => handleTabClick('organization')}
          className={getButtonClass(activeTab === 'organization', 'organization')}
          style={getButtonStyle(activeTab === 'organization', 'organization')}
          title="Quản lý lớp học & phân quyền sở hữu (Dành riêng cho Admin)"
        >
          QUẢN LÝ LỚP HỌC
        </button>
      )}

      {/* Khung hiển thị các lớp */}
      {isStudent ? (
        /* GIAO DIỆN SINH VIÊN ĐIỂM DANH: CHỈ HIỂN THỊ LỚP ĐIỂM DANH */
        <div className="bg-[#f0f4f9] rounded-2xl p-3 border border-[#c6d7e8] text-xs text-slate-800 shadow-xs flex flex-col gap-2.5 select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="font-extrabold text-[#143258] text-[11px] uppercase tracking-wide">
              LỚP ĐIỂM DANH
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
              ✓ Cán bộ lớp
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {(() => {
              const accessibleClasses = classes.filter(c => isClassAccessible(c.id));
              const displayClasses = accessibleClasses.length > 0 
                ? accessibleClasses 
                : classes.filter(c => c.id === currentClass);

              return displayClasses.map(cls => {
                const isSelected = currentClass === cls.id;
                const actualStudentCount = students.filter(
                  s => String(s.classId || '').trim() === String(cls.id).trim() || String(s.classId || '').trim() === String(cls.name || '').trim()
                ).length;

                return (
                  <button
                    key={cls.id}
                    onClick={() => {
                      setCurrentClass(cls.id);
                      if (cls.academicYear) setAcademicYear(cls.academicYear as AcademicYear);
                      setActiveTab('attendance');
                    }}
                    className={`w-full text-left py-2 px-2.5 rounded-xl flex items-center justify-between gap-1.5 transition select-none cursor-pointer border ${
                      isSelected
                        ? 'bg-[#dce7f5] text-[#143258] font-black shadow-xs border-blue-400 ring-2 ring-blue-400/40'
                        : 'bg-white hover:bg-slate-100 text-[#1e3a5f] font-bold border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-black text-emerald-600 text-sm">🎓</span>
                      <span className="text-[12px] font-bold text-[#143258] truncate">
                        {cls.id}
                      </span>
                    </div>
                    <span className="bg-[#e4ecf7] text-[#475569] text-xs font-bold px-2 py-0.5 rounded-md shrink-0">
                      {actualStudentCount} SV
                    </span>
                  </button>
                );
              });
            })()}
          </div>
        </div>
      ) : (
        /* GIAO DIỆN ADMIN & NGƯỜI DÙNG: HIỂN THỊ ĐẦY ĐỦ CÁC LỚP THEO PHÂN HỆ */
        <div className="bg-[#f0f4f9] rounded-2xl p-2.5 sm:p-3 border border-[#c6d7e8] text-xs text-slate-800 shadow-xs flex flex-col gap-3 select-none">
          {(() => {
            const chengQuyClasses = (classes.length > 0 ? classes : [
              { id: 'CĐK19.2-OT1.CLC', name: 'Cao đẳng Kỹ thuật Ô tô 19.2 - Lớp 1 (Chất lượng cao)', studentCount: 25, trainingSystem: 'Hệ Cao Đẳng Chính Quy', academicYear: '2025 - 2028' },
              { id: 'CĐK19.2-OT2', name: 'Cao đẳng Kỹ thuật Ô tô 19.2 - Lớp 2', studentCount: 21, trainingSystem: 'Hệ Cao Đẳng Chính Quy', academicYear: '2025 - 2028' },
              { id: 'CĐK18-OT1', name: 'Cao đẳng Kỹ thuật Ô tô Khóa 18 - Lớp 1', studentCount: 25, trainingSystem: 'Hệ Cao Đẳng Chính Quy', academicYear: '2024 - 2027' }
            ]).filter(c => 
              !c.trainingSystem?.toLowerCase().includes('liên thông') && 
              !c.trainingSystem?.toLowerCase().includes('trung cấp') &&
              !c.id.startsWith('LT') &&
              !c.id.startsWith('TC')
            );

            const lienThongClasses = (classes.length > 0 ? classes : [
              { id: 'LTK16.1.2 OT2', name: 'Liên thông Cao đẳng K16.1.2 - Ô tô 2', studentCount: 34, trainingSystem: 'Hệ Liên Thông Cao Đẳng', academicYear: '2024 - 2026' }
            ]).filter(c => 
              c.trainingSystem?.toLowerCase().includes('liên thông') || 
              c.id.startsWith('LT')
            );

            const trungCapClasses = classes.filter(c => 
              c.trainingSystem?.toLowerCase().includes('trung cấp') || 
              c.id.startsWith('TC')
            );

            const renderClassItem = (cls: { id: string; name?: string; studentCount?: number; academicYear?: string; trainingSystem?: string }) => {
              const isSelected = currentClass === cls.id;
              const accessible = isClassAccessible(cls.id);
              const isMyClass = isClassMyOwnership(cls.id);
              const isViewOnly = currentUser?.role === 'teacher' && !isMyClass && accessible;

              const actualStudentCount = students.filter(
                s => String(s.classId || '').trim() === String(cls.id).trim() || String(s.classId || '').trim() === String(cls.name || '').trim()
              ).length;

              const handleSelectClass = () => {
                if (!accessible) {
                  if (currentUser?.role === 'teacher') {
                    showSidebarToast(`🔒 Bạn không phải GVCN của lớp "${cls.id}" và chưa được Admin cấp quyền xem lớp khác!`);
                  } else if (currentUser?.role === 'student') {
                    showSidebarToast(`🔒 Cán bộ lớp chỉ có quyền truy cập dữ liệu lớp của mình!`);
                  }
                  return;
                }
                setCurrentClass(cls.id);
                if (cls.academicYear) setAcademicYear(cls.academicYear as AcademicYear);
                if (activeTab === 'home') setActiveTab('students');
              };

              return (
                <button
                  key={cls.id}
                  onClick={handleSelectClass}
                  className={`w-full text-left py-1.5 px-2 rounded-lg flex items-center justify-between gap-1.5 transition select-none ${
                    !accessible
                      ? 'opacity-45 cursor-not-allowed text-slate-400 bg-slate-100 hover:bg-slate-200/50'
                      : isSelected
                      ? 'bg-[#dce7f5] text-[#143258] font-bold shadow-2xs ring-1 ring-blue-400/50 cursor-pointer'
                      : 'text-[#1e3a5f] hover:bg-[#e4edf7]/70 font-bold cursor-pointer'
                  }`}
                  title={
                    !accessible
                      ? `Lớp này bị khóa theo quy chế bảo mật (Không có quyền truy cập)`
                      : isMyClass
                      ? `Lớp Thầy/Cô chủ nhiệm (${cls.name || cls.id})`
                      : isViewOnly
                      ? `Lớp khác (Chế độ chỉ xem do Admin cấp quyền)`
                      : cls.name || cls.id
                  }
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="font-black text-xs shrink-0 leading-none">
                      {!accessible ? '🔒' : isMyClass ? '👑' : isViewOnly ? '👁️' : '✚'}
                    </span>
                    <span className="text-[12px] font-bold text-[#1e3a5f] tracking-tight whitespace-nowrap truncate">
                      {cls.id}
                    </span>
                    {isMyClass && (
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1 rounded shrink-0">GVCN</span>
                    )}
                    {isViewOnly && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded shrink-0">Chỉ xem</span>
                    )}
                  </div>

                  <span className="bg-[#e4ecf7] text-[#475569] text-xs font-bold px-2 py-0.5 rounded-md shrink-0 text-center min-w-[26px]">
                    {actualStudentCount}
                  </span>
                </button>
              );
            };

            const renderSystemHeader = (title: string) => {
              const isOpen = !!openSystems[title];
              return (
                <div 
                  onClick={() => toggleSystem(title)}
                  style={{ backgroundColor: '#3b71ca' }}
                  className="w-full text-center py-1.5 px-2.5 rounded-lg font-bold text-white text-xs sm:text-[12.5px] uppercase tracking-wide border border-[#204a85] shadow-xs select-none flex items-center justify-between cursor-pointer hover:brightness-105 transition"
                  title="Nhấn để mở / đóng danh sách lớp"
                >
                  <span className="text-xs text-white/90 shrink-0 font-mono">{isOpen ? '▼' : '▶'}</span>
                  <span className="flex-1 text-center font-black">{title}</span>
                  {isAdmin && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCurriculumModal?.(title);
                      }}
                      className="text-white/80 hover:text-yellow-300 text-[11px] font-normal shrink-0 ml-1 transition-colors cursor-pointer" 
                      title="Quản trị chương trình khung (Admin)"
                    >
                      ⚙️
                    </button>
                  )}
                </div>
              );
            };

            return (
              <>
                {/* Nhóm 1: HỆ CAO ĐẲNG CHÍNH QUY */}
                <div className="flex flex-col gap-1.5">
                  {renderSystemHeader('HỆ CAO ĐẲNG CHÍNH QUY')}
                  {openSystems['HỆ CAO ĐẲNG CHÍNH QUY'] && (
                    <div className="flex flex-col gap-1 pl-0.5 animate-in fade-in duration-150">
                      {chengQuyClasses.map(cls => renderClassItem(cls))}
                    </div>
                  )}
                </div>

                {/* Nhóm 2: HỆ LIÊN THÔNG CAO ĐẲNG */}
                <div className="flex flex-col gap-1.5 pt-0.5">
                  {renderSystemHeader('HỆ LIÊN THÔNG CAO ĐẲNG')}
                  {openSystems['HỆ LIÊN THÔNG CAO ĐẲNG'] && (
                    <div className="flex flex-col gap-1 pl-0.5 animate-in fade-in duration-150">
                      {lienThongClasses.map(cls => renderClassItem(cls))}
                    </div>
                  )}
                </div>

                {/* Nhóm 3: HỆ TRUNG CẤP + THPT */}
                <div className="flex flex-col gap-1.5 pt-0.5">
                  {renderSystemHeader('HỆ TRUNG CẤP + THPT')}
                  {openSystems['HỆ TRUNG CẤP + THPT'] && (
                    <div className="flex flex-col gap-1 pl-0.5 animate-in fade-in duration-150">
                      {trungCapClasses.length > 0 ? (
                        trungCapClasses.map(cls => renderClassItem(cls))
                      ) : (
                        <div className="p-2 text-center text-xs text-slate-400 italic">Không có lớp</div>
                      )}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* =========================================================================
          CÁC MỤC CHỨC NĂNG NGHIỆP VỤ
          - SINH VIÊN ĐIỂM DANH: CHỈ HIỂN THỊ MỤC ĐIỂM DANH
          - ADMIN & NGƯỜI DÙNG: HIỂN THỊ ĐẦY ĐỦ HỒ SƠ, ĐIỂM, ĐIỂM DANH, BÁO CÁO...
          ========================================================================= */}
      {isStudent ? (
        /* GIAO DIỆN SINH VIÊN: CHỈ HIỂN THỊ DUY NHẤT MỤC ĐIỂM DANH */
        <div className="flex flex-col gap-2 mt-1">
          <button
            onClick={() => setActiveTab('attendance')}
            className="w-full text-center font-black text-xs lg:text-[13px] tracking-wide uppercase py-3.5 px-3 rounded-xl transition-all duration-150 cursor-pointer shadow-md select-none border-2 border-emerald-400 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-center gap-2 ring-2 ring-emerald-400/40"
            title="Chức năng Điểm danh chuyên cần & theo dõi học vụ của lớp"
          >
            <span>MỤC ĐIỂM DANH HỌC VỤ</span>
            <span className="px-1.5 py-0.5 bg-yellow-300 text-slate-900 rounded font-black text-[10px]">
              ✓ ĐIỂM DANH
            </span>
          </button>
          
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1">
            <p className="font-extrabold text-emerald-800 flex items-center gap-1">
              <span>🎓</span> Giao diện Sinh viên Điểm danh
            </p>
            <p className="text-[10px] text-emerald-700 leading-relaxed">
              Bạn được cấp quyền thực hiện điểm danh buổi học và kiểm tra chuyên cần cho lớp phụ trách.
            </p>
          </div>
        </div>
      ) : (
        /* GIAO DIỆN ADMIN & NGƯỜI DÙNG: HIỂN THỊ ĐẦY ĐỦ CÁC MỤC NGHIỆP VỤ */
        <>
          {/* 3. HỒ SƠ SINH VIÊN */}
          <button
            onClick={() => handleTabClick('students')}
            className={getButtonClass(activeTab === 'students', 'students')}
            style={getButtonStyle(activeTab === 'students', 'students')}
          >
            HỒ SƠ SINH VIÊN
          </button>

          {/* 4. QUẢN LÝ ĐIỂM */}
          <button
            onClick={() => handleTabClick('grades')}
            className={getButtonClass(activeTab === 'grades', 'grades')}
            style={getButtonStyle(activeTab === 'grades', 'grades')}
          >
            QUẢN LÝ ĐIỂM
          </button>

          {/* 5. THEO DÕI HỌC TẬP (Điểm danh & Rèn luyện) */}
          <button
            onClick={() => handleTabClick('attendance')}
            className={`${getButtonClass(activeTab === 'attendance', 'attendance')} flex items-center justify-center gap-1.5`}
            style={getButtonStyle(activeTab === 'attendance', 'attendance')}
            title="Theo dõi chuyên cần, cấm thi & Bình xét điểm rèn luyện"
          >
            <span>THEO DÕI HỌC TẬP</span>
          </button>

          {/* 6. HỌC LẠI THI LẠI */}
          <button
            onClick={() => handleTabClick('retake')}
            className={getButtonClass(activeTab === 'retake', 'retake')}
            style={getButtonStyle(activeTab === 'retake', 'retake')}
          >
            HỌC LẠI THI LẠI
          </button>

          {/* 7. BÁO CÁO THỐNG KÊ */}
          <button
            onClick={() => handleTabClick('reports')}
            className={getButtonClass(activeTab === 'reports', 'reports')}
            style={getButtonStyle(activeTab === 'reports', 'reports')}
          >
            BÁO CÁO THỐNG KÊ
          </button>

          {/* 8. VĂN BẢN HÀNH CHÍNH */}
          <button
            onClick={() => handleTabClick('backup-forms')}
            className={getButtonClass(activeTab === 'backup-forms', 'backup-forms')}
            style={getButtonStyle(activeTab === 'backup-forms', 'backup-forms')}
          >
            VĂN BẢN HÀNH CHÍNH
          </button>

          {/* 9. CỔNG TRA CỨU SV/PH */}
          <button
            onClick={() => handleTabClick('portal')}
            className={getButtonClass(activeTab === 'portal', 'portal')}
            style={getButtonStyle(activeTab === 'portal', 'portal')}
          >
            CỔNG TRA CỨU SV/PH
          </button>
        </>
      )}

      {/* Bottom Mini-Indicator */}
      <div className="mt-auto pt-2 border-t border-slate-200 text-[10px] text-slate-500 text-center space-y-0.5">
        <p className="font-bold text-slate-800">
          {currentUser ? (
            currentUser.role === 'admin'
              ? `👑 ${currentUser.fullName}`
              : currentUser.role === 'teacher'
              ? `👨‍🏫 GVCN: ${currentUser.fullName}`
              : `🎓 Cán bộ: ${currentUser.fullName} (${currentUser.studentRole || 'Điểm danh'})`
          ) : (
            `GVCN: ${themeSettings?.authorName || 'ThS. Nguyễn Chí Dũng'}`
          )}
        </p>
        <p className="text-slate-400 font-mono text-[9px]">{currentUser?.email || 'nguyenchidung1278@gmail.com'}</p>
        <p className="text-[9px] text-slate-400">{themeSettings?.facultyName?.split('•')?.[0]?.trim() || 'Khoa Công nghệ Ô tô'}</p>
      </div>
    </aside>
  );
};
