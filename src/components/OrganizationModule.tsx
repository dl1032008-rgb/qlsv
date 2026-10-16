import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Plus, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Search, 
  Filter, 
  Key, 
  UserPlus, 
  Layers, 
  BookOpen, 
  Phone, 
  GraduationCap, 
  Lock, 
  Unlock,
  AlertCircle,
  Copy,
  ChevronRight,
  Sparkles,
  School
} from 'lucide-react';
import { ClassItem, AcademicYear, ClassId, ThemeSettings } from '../types';

interface OrganizationModuleProps {
  academicYear: AcademicYear;
  setAcademicYear: (year: AcademicYear) => void;
  currentClass: ClassId;
  setCurrentClass: (cls: ClassId) => void;
  classes: ClassItem[];
  onAddClass: (newClass: ClassItem) => void;
  onUpdateClass: (updatedClass: ClassItem) => void;
  onDeleteClass: (classId: string) => void;
  themeSettings?: ThemeSettings;
}

export const OrganizationModule: React.FC<OrganizationModuleProps> = ({
  academicYear,
  setAcademicYear,
  currentClass,
  setCurrentClass,
  classes,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  themeSettings
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [permissionTargetClass, setPermissionTargetClass] = useState<ClassItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // In-app confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // New Class Form State
  const [formData, setFormData] = useState<Partial<ClassItem>>({
    id: '',
    name: '',
    academicYear: '2025 - 2028',
    major: 'Công nghệ Kỹ thuật Ô tô',
    trainingSystem: 'Cao đẳng chính quy',
    headTeacher: 'ThS. Nguyễn Chí Dũng',
    headTeacherPhone: '0865.074.668',
    headTeacherEmail: 'dung.nc@vpctech.edu.vn',
    headDepartment: 'Khoa Công nghệ Ô tô',
    studentCount: 25,
    classLeaderName: '',
    classLeaderPhone: '',
    status: 'Đang đào tạo',
    accessPermissions: {
      adminFullAccess: true,
      advisorFullAccess: true,
      subjectTeacherInputGrades: true,
      studentViewOnly: true
    },
    note: ''
  });

  const [formError, setFormError] = useState('');

  // Filter classes
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = 
      cls.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.headTeacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.major.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === 'all' || cls.academicYear === filterYear;
    return matchesSearch && matchesYear;
  });

  const handleOpenCreateModal = () => {
    setFormData({
      id: '',
      name: '',
      academicYear: academicYear || '2025 - 2028',
      major: 'Công nghệ Kỹ thuật Ô tô',
      trainingSystem: 'Cao đẳng chính quy',
      headTeacher: 'ThS. Nguyễn Chí Dũng',
      headTeacherPhone: '0865.074.668',
      headTeacherEmail: 'dung.nc@vpctech.edu.vn',
      headDepartment: 'Khoa Công nghệ Ô tô',
      studentCount: 25,
      classLeaderName: '',
      classLeaderPhone: '',
      status: 'Đang đào tạo',
      accessPermissions: {
        adminFullAccess: true,
        advisorFullAccess: true,
        subjectTeacherInputGrades: true,
        studentViewOnly: true
      },
      note: ''
    });
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id?.trim()) {
      setFormError('Vui lòng nhập Mã lớp học (VD: CĐK19.2-OT3)');
      return;
    }
    if (!formData.name?.trim()) {
      setFormError('Vui lòng nhập Tên đầy đủ của lớp học');
      return;
    }
    if (!formData.headTeacher?.trim()) {
      setFormError('Vui lòng chỉ định GVCN / Cố vấn học tập');
      return;
    }

    if (editingClass) {
      // Update
      const updated: ClassItem = {
        ...editingClass,
        ...formData,
        id: editingClass.id, // Preserve ID
        name: formData.name || editingClass.name,
        academicYear: formData.academicYear || editingClass.academicYear,
        major: formData.major || editingClass.major,
        trainingSystem: formData.trainingSystem || editingClass.trainingSystem,
        headTeacher: formData.headTeacher || editingClass.headTeacher,
        headTeacherPhone: formData.headTeacherPhone || editingClass.headTeacherPhone,
        headTeacherEmail: formData.headTeacherEmail || editingClass.headTeacherEmail,
        headDepartment: formData.headDepartment || editingClass.headDepartment,
        studentCount: Number(formData.studentCount) || editingClass.studentCount || 20,
        classLeaderName: formData.classLeaderName || editingClass.classLeaderName,
        classLeaderPhone: formData.classLeaderPhone || editingClass.classLeaderPhone,
        status: formData.status || editingClass.status,
        accessPermissions: formData.accessPermissions || editingClass.accessPermissions,
        note: formData.note || editingClass.note,
        createdAt: editingClass.createdAt
      };
      onUpdateClass(updated);
      setEditingClass(null);
    } else {
      // Check duplicate ID
      if (classes.some(c => c.id.toLowerCase() === formData.id?.trim().toLowerCase())) {
        setFormError(`Mã lớp "${formData.id}" đã tồn tại trong hệ thống!`);
        return;
      }

      const newCls: ClassItem = {
        id: formData.id.trim().toUpperCase(),
        name: formData.name.trim(),
        academicYear: formData.academicYear || '2025 - 2028',
        major: formData.major || 'Công nghệ Kỹ thuật Ô tô',
        trainingSystem: formData.trainingSystem || 'Cao đẳng chính quy',
        headTeacher: formData.headTeacher.trim(),
        headTeacherPhone: formData.headTeacherPhone?.trim() || '0988.xxx.xxx',
        headTeacherEmail: formData.headTeacherEmail?.trim() || '',
        headDepartment: formData.headDepartment?.trim() || 'Khoa Công nghệ Ô tô',
        studentCount: Number(formData.studentCount) || 20,
        classLeaderName: formData.classLeaderName?.trim() || 'Chưa bầu',
        classLeaderPhone: formData.classLeaderPhone?.trim() || '',
        status: (formData.status as any) || 'Đang đào tạo',
        accessPermissions: formData.accessPermissions || {
          adminFullAccess: true,
          advisorFullAccess: true,
          subjectTeacherInputGrades: true,
          studentViewOnly: true
        },
        note: formData.note?.trim() || '',
        createdAt: new Date().toLocaleDateString('vi-VN')
      };

      onAddClass(newCls);
      setCurrentClass(newCls.id);
      setIsCreateModalOpen(false);
    }
  };

  const handleEditClick = (cls: ClassItem) => {
    setEditingClass(cls);
    setFormData({ ...cls });
    setFormError('');
  };

  const handleDeleteClick = (cls: ClassItem) => {
    if (classes.length <= 1) {
      showToast('⚠️ Hệ thống phải có ít nhất 01 lớp học hoạt động!');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'XÓA LỚP HỌC KHỎI HỆ THỐNG',
      message: `Thầy/Cô có chắc chắn muốn xóa lớp "${cls.name} (${cls.id})"?\nThao tác này sẽ xóa quyền sở hữu và quản lý của lớp khỏi hệ thống.`,
      confirmText: 'Xác nhận xóa lớp',
      onConfirm: () => {
        onDeleteClass(cls.id);
        showToast(`Đã xóa thành công lớp ${cls.id}`);
        if (currentClass === cls.id) {
          const remaining = classes.filter(c => c.id !== cls.id);
          if (remaining.length > 0) setCurrentClass(remaining[0].id);
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleTogglePermission = (cls: ClassItem, permKey: keyof ClassItem['accessPermissions']) => {
    const updated: ClassItem = {
      ...cls,
      accessPermissions: {
        ...cls.accessPermissions,
        [permKey]: !cls.accessPermissions[permKey]
      }
    };
    onUpdateClass(updated);
    if (permissionTargetClass?.id === cls.id) {
      setPermissionTargetClass(updated);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6 relative">
      {toastMsg && (
        <div className="sticky top-2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center justify-between gap-3 text-xs border border-slate-700 animate-in fade-in">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}
      
      {/* 1. Header Banner & Actions: QUẢN LÝ LỚP HỌC & PHÂN QUYỀN SỞ HỮU (Hình 1) */}
      <div 
        style={{
          background: `linear-gradient(135deg, ${themeSettings?.tableHeaderBg || '#004e92'} 0%, #002b53 100%)`
        }}
        className="text-white p-5 sm:p-6 rounded-2xl shadow-md border border-blue-900 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-yellow-400 text-slate-900 text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded shadow-xs tracking-wider">
              QUẢN LÝ LỚP HỌC
            </span>
            <span className="text-blue-200 text-xs font-semibold">
              • Quản trị dữ liệu đơn vị trường lớp & phân quyền GDNN
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white flex items-center gap-2.5">
            <School className="w-6 h-6 text-yellow-300" />
            <span>QUẢN LÝ LỚP HỌC & PHÂN QUYỀN SỞ HỮU</span>
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl">
            Tạo mới lớp học, thiết lập Giáo viên Chủ nhiệm (Cố vấn học tập), phân quyền truy cập và phân bổ quyền sở hữu dữ liệu học tập - rèn luyện theo quy chế đào tạo.
          </p>
        </div>

        {/* Primary Action: Tạo Lớp Học Mới */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2 transition cursor-pointer active:scale-95 border border-emerald-300/40"
            title="Nhấn để mở form tạo lớp học mới"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ TẠO LỚP HỌC MỚI</span>
          </button>
        </div>
      </div>

      {/* 2. Top Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 select-none">
        <div 
          style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
          className="p-4 rounded-xl border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-semibold">
            <span>TỔNG SỐ LỚP</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{classes.length} <span className="text-xs font-normal text-slate-500">lớp</span></div>
          <p className="text-[11px] text-blue-600 font-medium">Toàn bộ khoa công nghệ</p>
        </div>

        <div 
          style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
          className="p-4 rounded-xl border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-semibold">
            <span>ĐANG ĐÀO TẠO</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {classes.filter(c => c.status === 'Đang đào tạo').length} <span className="text-xs font-normal text-slate-500">lớp</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">Niên khóa 2023 - 2028</p>
        </div>

        <div 
          style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
          className="p-4 rounded-xl border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-semibold">
            <span>LỚP HIỆN TẠI</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-sm font-black text-blue-700 truncate" title={currentClass}>
            {currentClass}
          </div>
          <p className="text-[11px] text-slate-500 font-medium truncate">
            {classes.find(c => c.id === currentClass)?.headTeacher || 'ThS. Nguyễn Chí Dũng'}
          </p>
        </div>

        <div 
          style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
          className="p-4 rounded-xl border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-semibold">
            <span>PHÂN QUYỀN RBAC</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600">4 <span className="text-xs font-normal text-slate-500">cấp độ</span></div>
          <p className="text-[11px] text-purple-600 font-medium">Admin • GVCN • BM • SV</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div 
        style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
        className="p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 border border-slate-300 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã lớp, tên lớp, GVCN, ngành nghề..."
            className="w-full bg-transparent focus:outline-none font-medium text-slate-800 placeholder-slate-400"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Lọc Niên Khóa:</span>
          </div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">-- Tất cả Niên khóa --</option>
            <option value="2025 - 2028">2025 - 2028</option>
            <option value="2024 - 2027">2024 - 2027</option>
            <option value="2023 - 2026">2023 - 2026</option>
          </select>
        </div>
      </div>

      {/* 4. Main Table: DANH SÁCH LỚP HỌC & MA TRẬN PHÂN QUYỀN SỞ HỮU (Hình 1) */}
      <div 
        style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
        className="rounded-xl border border-slate-200 shadow-xs overflow-hidden"
      >
        <div 
          style={{ backgroundColor: themeSettings?.tableHeaderBg || '#004e92' }}
          className="text-white px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm uppercase tracking-wide">
            <Layers className="w-4 h-4 text-yellow-300" />
            <span>BẢNG DANH MỤC LỚP HỌC & CẤU HÌNH PHÂN QUYỀN SỞ HỮU ({filteredClasses.length} lớp)</span>
          </div>
          <span className="text-[11px] text-blue-100 hidden sm:inline">
            Click «Chọn Lớp» để kích hoạt không gian làm việc của lớp đó
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10 select-none text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200">STT</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Mã Lớp Học</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[200px]">Tên Lớp / Chuyên Ngành</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center">Niên Khóa</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[160px]">GVCN (Cố Vấn HT)</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center">Sĩ Số</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[180px] text-center bg-blue-50/50">
                  Phân Quyền Sở Hữu (RBAC)
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center">Trạng Thái</th>
                <th className="py-2.5 px-3 text-center min-w-[150px]">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Không tìm thấy lớp học nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls, idx) => {
                  const isCurrent = currentClass === cls.id;
                  return (
                    <tr 
                      key={cls.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isCurrent ? 'bg-blue-50/70 font-semibold' : ''
                      }`}
                    >
                      {/* STT */}
                      <td className="py-3 px-3 text-center border-r border-slate-200 font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      {/* Mã Lớp */}
                      <td className="py-3 px-3 border-r border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            isCurrent 
                              ? 'bg-blue-600 text-white shadow-2xs' 
                              : 'bg-slate-100 text-blue-700 border border-slate-300'
                          }`}>
                            {cls.id}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.2 rounded">
                              Đang chọn
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tên Lớp & Ngành nghề */}
                      <td className="py-3 px-3 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{cls.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>{cls.major}</span>
                          <span>•</span>
                          <span className="text-slate-600 font-medium">{cls.trainingSystem}</span>
                        </div>
                      </td>

                      {/* Niên khóa */}
                      <td className="py-3 px-3 border-r border-slate-200 text-center font-bold text-slate-700">
                        {cls.academicYear}
                      </td>

                      {/* GVCN */}
                      <td className="py-3 px-3 border-r border-slate-200">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{cls.headTeacher}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{cls.headTeacherPhone}</span>
                        </div>
                      </td>

                      {/* Sĩ số */}
                      <td className="py-3 px-3 border-r border-slate-200 text-center font-bold text-slate-800">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                          {cls.studentCount || 20} SV
                        </span>
                      </td>

                      {/* Phân quyền RBAC Matrix */}
                      <td className="py-3 px-3 border-r border-slate-200 bg-blue-50/20">
                        <div className="flex flex-col gap-1 text-[11px]">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-slate-600 font-medium flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-rose-600" /> Admin Master:
                            </span>
                            <span className="font-bold text-emerald-700 bg-emerald-100 px-1 rounded text-[10px]">
                              Toàn quyền
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            <span className="text-slate-600 font-medium flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-blue-600" /> GVCN Lớp:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleTogglePermission(cls, 'advisorFullAccess')}
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded transition cursor-pointer ${
                                cls.accessPermissions.advisorFullAccess
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                              title="Bấm để bật/tắt quyền quản trị toàn lớp cho GVCN"
                            >
                              {cls.accessPermissions.advisorFullAccess ? 'Quản lý lớp (Full)' : 'Chỉ xem'}
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            <span className="text-slate-600 font-medium flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-amber-600" /> Giảng viên Bộ môn:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleTogglePermission(cls, 'subjectTeacherInputGrades')}
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded transition cursor-pointer ${
                                cls.accessPermissions.subjectTeacherInputGrades
                                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                              title="Bấm để bật/tắt quyền nhập điểm môn học"
                            >
                              {cls.accessPermissions.subjectTeacherInputGrades ? 'Nhập & Sửa Điểm' : 'Khóa Nhập'}
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            <span className="text-slate-600 font-medium flex items-center gap-1">
                              <Users className="w-3 h-3 text-teal-600" /> Sinh viên / Phụ huynh:
                            </span>
                            <span className="font-bold text-slate-600 bg-slate-100 px-1 rounded text-[10px]">
                              Chỉ tra cứu
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3 px-3 border-r border-slate-200 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          cls.status === 'Đang đào tạo'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : cls.status === 'Đã tốt nghiệp'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {cls.status}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Button Chọn Lớp Hiện Tại */}
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentClass(cls.id);
                              setAcademicYear(cls.academicYear as AcademicYear);
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                              isCurrent
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                            title="Chọn làm lớp học làm việc hiện tại"
                          >
                            <Check className="w-3 h-3" />
                            <span>{isCurrent ? 'Đang chọn' : 'Vào Lớp'}</span>
                          </button>

                          {/* Button Sửa Lớp */}
                          <button
                            type="button"
                            onClick={() => handleEditClick(cls)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-300"
                            title="Chỉnh sửa thông tin & cấu hình lớp"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Button Xóa Lớp */}
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(cls)}
                            className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer border border-rose-200"
                            title="Xóa lớp học khỏi hệ thống"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Ghi chú Hướng dẫn Nghiệp vụ Quản trị Hệ thống GDNN */}
      <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>HƯỚNG DẪN QUẢN LÝ LỚP HỌC & PHÂN QUYỀN SỞ HỮU (THEO QUY CHẾ ĐÀO TẠO GDNN):</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
          <li><strong>Mã Lớp Học:</strong> Định danh duy nhất theo cú pháp của Trường (Ví dụ: <code>CĐK19.2-OT1.CLC</code>: Cao đẳng Khóa 19 Đợt 2 - Lớp Kỹ thuật Ô tô 1 Chất lượng cao).</li>
          <li><strong>Quyền GVCN:</strong> Quản lý hồ sơ 23 trường, xét rèn luyện BM01, cảnh báo cấm thi và lập quỹ lớp, nhật ký an toàn xưởng.</li>
          <li><strong>Quyền Giảng viên Bộ môn:</strong> Chỉ có quyền vào điểm kiểm tra thường xuyên (HS1), định kỳ (HS2) và thi kết thúc mô đun (HS3) cho mô đun được phân công giảng dạy.</li>
          <li><strong>Quyền Sinh viên / Phụ huynh:</strong> Tra cứu kết quả học tập qua Cổng thông tin (Student Portal) bằng Mã SV định danh, không có quyền can thiệp cơ sở dữ liệu.</li>
        </ul>
      </div>

      {/* ================= MODAL TẠO MỚI / CHỈNH SỬA LỚP HỌC (Hình 1) ================= */}
      {(isCreateModalOpen || editingClass) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              style={{
                backgroundColor: themeSettings?.tableHeaderBg || '#004e92'
              }}
              className="text-white px-6 py-4 flex items-center justify-between border-b border-blue-900"
            >
              <div className="flex items-center gap-2.5">
                <School className="w-5 h-5 text-yellow-300" />
                <h3 className="font-bold text-sm sm:text-base tracking-wide uppercase">
                  {editingClass ? 'CHỈNH SỬA THÔNG TIN & PHÂN QUYỀN LỚP HỌC' : 'TẠO MỚI LỚP HỌC & PHÂN QUYỀN SỞ HỮU'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingClass(null);
                }}
                className="text-blue-200 hover:text-white p-1 rounded-md transition cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveClass} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-800">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Thông tin định danh lớp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700">
                    Mã Lớp Học (MSSV dùng mã này): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                    disabled={!!editingClass}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-slate-900 uppercase disabled:bg-slate-200 disabled:cursor-not-allowed"
                    placeholder="VD: CĐK19.2-OT3"
                    required
                  />
                  <span className="text-[10px] text-slate-500">Mã định danh duy nhất (In hoa, không dấu cách)</span>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700">
                    Niên Khóa Đào Tạo: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                  >
                    <option value="2025 - 2028">2025 - 2028 (Khóa 19)</option>
                    <option value="2024 - 2027">2024 - 2027 (Khóa 18)</option>
                    <option value="2023 - 2026">2023 - 2026 (Khóa 17)</option>
                    <option value="2026 - 2029">2026 - 2029 (Khóa 20)</option>
                  </select>
                </div>
              </div>

              {/* Tên Lớp */}
              <div>
                <label className="font-semibold block mb-1 text-slate-700">
                  Tên Đầy Đủ Của Lớp: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                  placeholder="VD: Cao đẳng Kỹ thuật Ô tô 19.2 - Lớp 3"
                  required
                />
              </div>

              {/* Ngành nghề & Hệ đào tạo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700">Ngành / Nghề Đào Tạo:</label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                    placeholder="Công nghệ Kỹ thuật Ô tô"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700">Hệ Đào Tạo:</label>
                  <select
                    value={formData.trainingSystem}
                    onChange={(e) => setFormData({ ...formData, trainingSystem: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                  >
                    <option value="Cao đẳng chính quy">Cao đẳng chính quy</option>
                    <option value="Cao đẳng chính quy (CLC)">Cao đẳng chính quy (Chất lượng cao)</option>
                    <option value="Liên thông Cao đẳng">Liên thông Cao đẳng</option>
                    <option value="Trung cấp chính quy">Trung cấp chính quy</option>
                    <option value="Trung cấp + THPT">Trung cấp + THPT (Mô hình 9+)</option>
                  </select>
                </div>
              </div>

              {/* 2. Cố vấn học tập / GVCN & Liên hệ */}
              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
                <div className="font-bold text-blue-900 uppercase text-[11px] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-700" />
                  <span>GIÁO VIÊN CHỦ NHIỆM (CỐ VẤN HỌC TẬP) PHỤ TRÁCH LỚP</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700">Họ và Tên GVCN:</label>
                    <input
                      type="text"
                      value={formData.headTeacher}
                      onChange={(e) => setFormData({ ...formData, headTeacher: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                      placeholder="ThS. Nguyễn Chí Dũng"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-700">SĐT Liên Hệ Khẩn Cấp:</label>
                    <input
                      type="text"
                      value={formData.headTeacherPhone}
                      onChange={(e) => setFormData({ ...formData, headTeacherPhone: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900"
                      placeholder="0865.074.668"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700">Khoa / Bộ Môn:</label>
                    <input
                      type="text"
                      value={formData.headDepartment}
                      onChange={(e) => setFormData({ ...formData, headDepartment: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      placeholder="Khoa Công nghệ Ô tô"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-700">Sĩ Số Dự Kiến:</label>
                    <input
                      type="number"
                      value={formData.studentCount}
                      onChange={(e) => setFormData({ ...formData, studentCount: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                      min={1}
                      max={60}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Phân quyền sở hữu & bảo mật */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CẤU HÌNH PHÂN QUYỀN TRUY CẬP (RBAC)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.accessPermissions?.adminFullAccess}
                      disabled
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-700">Admin Master: Toàn quyền cấu hình</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.accessPermissions?.advisorFullAccess}
                      onChange={(e) => setFormData({
                        ...formData,
                        accessPermissions: {
                          ...formData.accessPermissions!,
                          advisorFullAccess: e.target.checked
                        }
                      })}
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-700">GVCN: Toàn quyền hồ sơ, nề nếp lớp</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.accessPermissions?.subjectTeacherInputGrades}
                      onChange={(e) => setFormData({
                        ...formData,
                        accessPermissions: {
                          ...formData.accessPermissions!,
                          subjectTeacherInputGrades: e.target.checked
                        }
                      })}
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-700">GV Bộ môn: Được nhập & sửa điểm môn học</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.accessPermissions?.studentViewOnly}
                      disabled
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-700">SV & Phụ huynh: Chỉ xem kết quả cá nhân</span>
                  </label>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="font-semibold block mb-1 text-slate-700">Ghi chú nghiệp vụ lớp:</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                  placeholder="Ghi chú về định mức học phí, chính sách miễn giảm 70% hoặc kế hoạch xưởng..."
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingClass(null);
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg font-semibold cursor-pointer transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg cursor-pointer transition active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingClass ? 'Cập Nhật Lớp' : 'Lưu & Khởi Tạo Lớp'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-app Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-rose-300">
            <div className="bg-rose-700 text-white px-5 py-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-sm tracking-wide uppercase">{confirmDialog.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="text-white/80 hover:text-white p-1 rounded-lg cursor-pointer transition"
              >
                ✕
              </button>
            </div>
            <div className="p-5 text-xs text-slate-700 space-y-3 leading-relaxed">
              <p className="font-medium whitespace-pre-line text-slate-800">{confirmDialog.message}</p>
            </div>
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 rounded-xl cursor-pointer text-xs transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl cursor-pointer text-xs shadow-md transition"
              >
                {confirmDialog.confirmText || 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
