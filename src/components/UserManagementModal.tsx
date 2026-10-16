import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  Key, 
  Lock, 
  Unlock, 
  UserPlus, 
  Search, 
  Filter, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  BookOpen, 
  Building2, 
  Phone, 
  Mail,
  UserCheck,
  ChevronRight,
  ClipboardList,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserAccount, UserRole, UserStatus, ClassItem, Student } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  onUpdateUsers: (newUsers: UserAccount[]) => void;
  currentUser: UserAccount | null;
  classes: ClassItem[];
  onUpdateClasses: (newClasses: ClassItem[]) => void;
  students: Student[];
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onUpdateUsers,
  currentUser,
  classes,
  onUpdateClasses,
  students
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'assign-teacher' | 'assign-student'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal Sửa thông tin tài khoản
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Modal Đổi mật khẩu tài khoản
  const [passwordUser, setPasswordUser] = useState<UserAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Modal Xác nhận xóa tài khoản (Bảo vệ an toàn, tránh confirm popup)
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  // Modal Tạo mới tài khoản trực tiếp (Admin tạo)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState<Partial<UserAccount>>({
    fullName: '',
    email: '',
    password: '123',
    phone: '',
    role: 'teacher',
    status: 'active',
    department: 'Khoa Công nghệ Ô tô',
    assignedClassIds: [],
    canTakeAttendance: true
  });

  // Tab 3: Chọn lớp để phân quyền cán bộ lớp
  const [selectedClassForStudent, setSelectedClassForStudent] = useState<string>(classes[0]?.id || '');
  const [studentSearch, setStudentSearch] = useState('');

  // Tải cấu hình mặc định khi mở modal
  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const saved = localStorage.getItem('app_settings_user_defaults');
        if (saved) {
          setNewUserForm(prev => ({ ...prev, ...JSON.parse(saved) }));
        }
      } catch (e) {
        console.error('Lỗi khi tải cấu hình mặc định:', e);
      }
    };
    fetchDefaults();
  }, []);

  const saveAsDefault = async () => {
    try {
      localStorage.setItem('app_settings_user_defaults', JSON.stringify(newUserForm));
      showToast('✅ Đã lưu cấu hình tạo tài khoản mặc định!');
    } catch (e) {
      showToast('❌ Lỗi khi lưu cấu hình mặc định!');
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  if (!isOpen) return null;

  // Lọc danh sách người dùng
  const filteredUsers = users.filter(u => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchName = u.fullName.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = (u.phone || '').includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (filterStatus !== 'all' && u.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = users.filter(u => u.status === 'pending').length;

  // 1. Phê duyệt tài khoản giáo viên
  const handleApproveUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;

    const updated = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'active' as UserStatus,
          approvedAt: new Date().toLocaleString('vi-VN'),
          approvedBy: currentUser?.email || 'nguyenchidung1278@gmail.com'
        };
      }
      return u;
    });

    onUpdateUsers(updated);
    showToast(`✅ Đã phê duyệt và kích hoạt tài khoản "${target.fullName}" (${target.email})!`);
  };

  // 2. Mở dialog xác nhận xóa tài khoản người dùng
  const handleDeleteUser = (user: UserAccount) => {
    if (user.email.toLowerCase() === 'nguyenchidung1278@gmail.com') {
      showToast('❌ Không thể xóa tài khoản Quản trị viên tối cao (Master Admin)!');
      return;
    }
    setUserToDelete(user);
  };

  // Xác nhận xóa tài khoản sau khi người dùng bấm trong dialog
  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    if (userToDelete.email.toLowerCase() === 'nguyenchidung1278@gmail.com') {
      showToast('❌ Không thể xóa tài khoản Quản trị viên tối cao (Master Admin)!');
      setUserToDelete(null);
      return;
    }

    const updated = users.filter(u => u.id !== userToDelete.id);
    onUpdateUsers(updated);
    showToast(`🗑️ Đã xóa tài khoản "${userToDelete.fullName}" (${userToDelete.email}) khỏi hệ thống!`);
    setUserToDelete(null);
  };

  // Xóa bỏ các tài khoản phụ trong khung, chỉ giữ lại Master Admin
  const handleClearSecondaryAccounts = () => {
    const master = users.find(u => u.email.toLowerCase() === 'nguyenchidung1278@gmail.com') || {
      id: 'USR_ADMIN_MASTER',
      email: 'nguyenchidung1278@gmail.com',
      password: 'admin',
      fullName: 'ThS. Nguyễn Chí Dũng',
      phone: '0865.074.668',
      role: 'admin' as UserRole,
      status: 'active' as UserStatus,
      department: 'Khoa Công nghệ Ô tô',
      assignedClassIds: ['*'],
      canTakeAttendance: true,
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      approvedBy: 'Hệ thống Quản trị',
      note: 'Tài khoản Quản trị viên Tối cao (Master Admin)'
    };
    onUpdateUsers([master]);
    showToast('🗑️ Đã xóa sạch các tài khoản phụ, chỉ giữ lại Master Admin nguyenchidung1278@gmail.com!');
  };

  // 3. Đổi mật khẩu cho người dùng
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser || !newPasswordInput.trim()) return;

    const updated = users.map(u => {
      if (u.id === passwordUser.id) {
        return {
          ...u,
          password: newPasswordInput.trim()
        };
      }
      return u;
    });

    onUpdateUsers(updated);
    showToast(`🔑 Đã đổi mật khẩu thành công cho tài khoản "${passwordUser.email}"! Mật khẩu mới: ${newPasswordInput.trim()}`);
    setPasswordUser(null);
    setNewPasswordInput('');
  };

  // 4. Lưu sửa thông tin người dùng (bao gồm phân quyền lớp & quyền xem lớp khác)
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated = users.map(u => {
      if (u.id === editingUser.id) {
        return {
          ...editingUser,
          fullName: editingUser.fullName.trim(),
          email: editingUser.email.trim().toLowerCase(),
          phone: editingUser.phone.trim(),
          assignedClassIds: editingUser.assignedClassIds || [],
          canViewOtherClasses: !!editingUser.canViewOtherClasses
        };
      }
      return u;
    });

    onUpdateUsers(updated);
    showToast(`✅ Đã cập nhật thông tin và phân quyền tài khoản "${editingUser.fullName}"!`);
    setEditingUser(null);
  };

  // 4.1 Bật / Tắt quyền xem lớp khác của GVCN (Admin toàn quyền quyết định)
  const handleToggleViewOtherClasses = (teacherId: string) => {
    const target = users.find(u => u.id === teacherId);
    if (!target) return;
    const nextVal = !target.canViewOtherClasses;
    const updated = users.map(u => {
      if (u.id === teacherId) {
        return { ...u, canViewOtherClasses: nextVal };
      }
      return u;
    });
    onUpdateUsers(updated);
    showToast(
      nextVal
        ? `👁️ Đã cấp quyền cho GVCN "${target.fullName}" xem tham khảo các lớp khác (Chế độ chỉ xem)!`
        : `🔒 Đã khóa quyền xem lớp khác của GVCN "${target.fullName}" (Chỉ xem và quản lý lớp chủ nhiệm)!`
    );
  };

  // 5. Admin tạo tài khoản mới trực tiếp
  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.fullName?.trim() || !newUserForm.email?.trim() || !newUserForm.password?.trim()) {
      alert('Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu!');
      return;
    }

    const emailTrim = newUserForm.email.trim().toLowerCase();
    const existing = users.find(u => u.email.trim().toLowerCase() === emailTrim);
    if (existing) {
      alert('Email này đã tồn tại trên hệ thống!');
      return;
    }

    const created: UserAccount = {
      id: `USR_${Date.now()}`,
      email: emailTrim,
      password: newUserForm.password.trim(),
      fullName: newUserForm.fullName.trim(),
      phone: newUserForm.phone?.trim() || '',
      role: newUserForm.role || 'teacher',
      status: newUserForm.status || 'active',
      department: newUserForm.department?.trim() || 'Khoa Công nghệ Ô tô',
      assignedClassIds: newUserForm.assignedClassIds || [],
      canTakeAttendance: newUserForm.canTakeAttendance !== false,
      createdAt: new Date().toLocaleString('vi-VN'),
      approvedAt: new Date().toLocaleString('vi-VN'),
      approvedBy: currentUser?.email || 'nguyenchidung1278@gmail.com',
      note: 'Tài khoản được khởi tạo trực tiếp bởi Admin'
    };

    onUpdateUsers([...users, created]);
    showToast(`✅ Đã tạo tài khoản "${created.fullName}" (${created.email}) thành công!`);
    setIsCreateModalOpen(false);
    setNewUserForm({
      fullName: '',
      email: '',
      password: '123',
      phone: '',
      role: 'teacher',
      status: 'active',
      department: 'Khoa Công nghệ Ô tô',
      assignedClassIds: [],
      canTakeAttendance: true
    });
  };

  // 6. Khóa / Mở khóa tài khoản
  const handleToggleLockUser = (userId: string, currentStatus: UserStatus, email: string) => {
    if (email.toLowerCase() === 'nguyenchidung1278@gmail.com') {
      alert('Không thể khóa tài khoản Quản trị viên tối cao!');
      return;
    }

    const newStatus: UserStatus = currentStatus === 'locked' ? 'active' : 'locked';
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, status: newStatus };
      }
      return u;
    });

    onUpdateUsers(updated);
    showToast(newStatus === 'locked' ? `⛔ Đã khóa tài khoản "${email}"!` : `✅ Đã mở khóa tài khoản "${email}"!`);
  };

  // 7. Cập nhật phân quyền GVCN cho lớp học
  const handleAssignTeacherToClass = (classId: string, teacherEmail: string) => {
    const targetTeacher = users.find(u => u.email === teacherEmail);
    if (!targetTeacher) return;

    // Cập nhật class
    const updatedClasses = classes.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          headTeacher: targetTeacher.fullName,
          headTeacherPhone: targetTeacher.phone,
          headTeacherEmail: targetTeacher.email
        };
      }
      return c;
    });
    onUpdateClasses(updatedClasses);

    // Cập nhật assignedClassIds của giáo viên
    const updatedUsers = users.map(u => {
      if (u.id === targetTeacher.id) {
        const assigned = Array.from(new Set([...u.assignedClassIds, classId]));
        return { ...u, assignedClassIds: assigned };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);

    showToast(`✅ Đã phân quyền GVCN "${targetTeacher.fullName}" phụ trách lớp ${classId}!`);
  };

  // 8. Cấp tài khoản cán bộ lớp điểm danh cho sinh viên
  const handleAssignStudentLeader = (student: Student) => {
    const studentEmail = student.email || `${student.id.toLowerCase()}@student.caodang.edu.vn`;
    const existing = users.find(u => u.email.toLowerCase() === studentEmail.toLowerCase() || u.studentId === student.id);

    if (existing) {
      // Toggle quyền điểm danh
      const newCanTake = !existing.canTakeAttendance;
      const updated = users.map(u => {
        if (u.id === existing.id) {
          return { ...u, canTakeAttendance: newCanTake };
        }
        return u;
      });
      onUpdateUsers(updated);
      showToast(newCanTake ? `✅ Đã cấp quyền điểm danh cho cán bộ lớp ${student.fullName}!` : `Đã tắt quyền điểm danh của ${student.fullName}.`);
      return;
    }

    // Tạo mới tài khoản sinh viên cán bộ lớp
    const newStudentUser: UserAccount = {
      id: `USR_SV_${student.id}`,
      email: studentEmail,
      password: '123', // Mật khẩu mặc định
      fullName: student.fullName,
      phone: student.phone || '',
      role: 'student',
      status: 'active',
      department: `Lớp ${student.classId}`,
      assignedClassIds: [student.classId],
      studentId: student.id,
      studentRole: student.role || 'Cán bộ lớp',
      canTakeAttendance: true,
      createdAt: new Date().toLocaleString('vi-VN'),
      approvedAt: new Date().toLocaleString('vi-VN'),
      approvedBy: currentUser?.email || 'nguyenchidung1278@gmail.com',
      note: `Cán bộ lớp (${student.role}) được cấp quyền điểm danh chuyên cần`
    };

    onUpdateUsers([...users, newStudentUser]);
    showToast(`🎉 Đã tạo tài khoản và cấp quyền điểm danh cho "${student.fullName}" (Email: ${studentEmail} | Mật khẩu: 123)!`);
  };

  // Sinh viên của lớp đang chọn
  const classStudents = students.filter(s => s.classId === selectedClassForStudent);
  const filteredClassStudents = classStudents.filter(s => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase().trim();
    return s.fullName.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || (s.role || '').toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-2 sm:p-4 overflow-hidden animate-fadeIn select-none">
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-yellow-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base uppercase tracking-tight text-yellow-300">
                  QUẢN TRỊ TÀI KHOẢN & PHÂN QUYỀN RBAC HỆ THỐNG
                </h3>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-500 text-white font-bold text-[10px] rounded-full animate-pulse shadow-xs">
                    {pendingCount} Chờ duyệt
                  </span>
                )}
              </div>
              <p className="text-[11px] text-sky-200">
                Phê duyệt giáo viên đăng ký • Xóa, sửa, đổi mật khẩu • Phân quyền GVCN & Cán bộ lớp điểm danh
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast thông báo */}
        {toastMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-fadeIn shrink-0">
            <span>{toastMsg}</span>
            <button onClick={() => setToastMsg(null)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 pt-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-bold text-xs rounded-t-xl transition cursor-pointer border-t-2 flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-white text-blue-800 border-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>DANH SÁCH NGƯỜI DÙNG & DUYỆT TÀI KHOẢN ({users.length})</span>
              {pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('assign-teacher')}
              className={`px-4 py-2 font-bold text-xs rounded-t-xl transition cursor-pointer border-t-2 flex items-center gap-2 ${
                activeTab === 'assign-teacher'
                  ? 'bg-white text-indigo-800 border-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>PHÂN QUYỀN GVCN THEO LỚP ({classes.length} Lớp)</span>
            </button>

            <button
              onClick={() => setActiveTab('assign-student')}
              className={`px-4 py-2 font-bold text-xs rounded-t-xl transition cursor-pointer border-t-2 flex items-center gap-2 ${
                activeTab === 'assign-student'
                  ? 'bg-white text-emerald-800 border-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              <span>PHÂN QUYỀN CÁN BỘ LỚP ĐIỂM DANH</span>
            </button>
          </div>

          {activeTab === 'users' && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Tạo Tài Khoản Trực Tiếp</span>
              </button>
              <button
                onClick={handleClearSecondaryAccounts}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                title="Xóa bỏ toàn bộ tài khoản phụ, chỉ giữ lại Master Admin nguyenchidung1278@gmail.com"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Xóa Tài Khoản Phụ (Giữ Master)</span>
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: DANH SÁCH NGƯỜI DÙNG & PHÊ DUYỆT */}
        {activeTab === 'users' && (
          <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-5 gap-3.5">
            {/* Bộ lọc & Tìm kiếm */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 flex-1 min-w-[240px] bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-2xs">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  className="w-full bg-transparent focus:outline-none font-medium text-slate-900"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-semibold">Vai trò:</span>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                    <option value="teacher">Giáo viên (GVCN)</option>
                    <option value="student">Cán bộ lớp (Sinh viên)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-semibold">Trạng thái:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">⚠️ Chờ duyệt ({pendingCount})</option>
                    <option value="active">✓ Đang hoạt động</option>
                    <option value="locked">⛔ Đã khóa</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bảng danh sách người dùng */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 font-bold text-slate-700 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">STT</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Họ và Tên</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Email Đăng Nhập</th>
                    <th className="py-2.5 px-3 text-center w-28">Vai Trò</th>
                    <th className="py-2.5 px-3 text-center w-32">Trạng Thái</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Lớp Phụ Trách / Quyền</th>
                    <th className="py-2.5 px-3 text-center w-24">SĐT</th>
                    <th className="py-2.5 px-3 text-center min-w-[180px]">Thao Tác Quản Trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Không tìm thấy người dùng nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, idx) => {
                      const isMasterAdmin = u.email.toLowerCase() === 'nguyenchidung1278@gmail.com';
                      return (
                        <tr 
                          key={`${u.id}-${idx}`}
                          className={`hover:bg-blue-50/50 transition ${
                            u.status === 'pending' ? 'bg-amber-50/70' : u.status === 'locked' ? 'bg-rose-50/50' : 'bg-white'
                          }`}
                        >
                          <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                                u.role === 'admin' ? 'bg-amber-600' : u.role === 'teacher' ? 'bg-blue-600' : 'bg-emerald-600'
                              }`}>
                                {u.role === 'admin' ? 'AD' : u.role === 'teacher' ? 'GV' : 'SV'}
                              </div>
                              <div>
                                <span className="block">{u.fullName}</span>
                                <span className="text-[10px] text-slate-400 block font-normal">{u.department || 'Khoa Ô tô'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-3 font-mono font-medium text-blue-900">
                            {u.email}
                            {isMasterAdmin && (
                              <span className="ml-1.5 px-1.5 py-0.2 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded border border-yellow-300">
                                Master
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              u.role === 'admin' 
                                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                : u.role === 'teacher'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}>
                              {u.role === 'admin' ? 'Quản trị viên' : u.role === 'teacher' ? 'Giáo viên (GVCN)' : 'Cán bộ lớp'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {u.status === 'pending' ? (
                              <span className="px-2 py-0.5 rounded-full font-black text-[10px] bg-amber-200 text-amber-900 border border-amber-400 animate-pulse">
                                ⏳ Chờ Admin duyệt
                              </span>
                            ) : u.status === 'active' ? (
                              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ✓ Hoạt động
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-300">
                                ⛔ Đã khóa
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            {u.role === 'admin' ? (
                              <span className="text-amber-700 font-bold">Toàn quyền tất cả các lớp (*)</span>
                            ) : u.assignedClassIds && u.assignedClassIds.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {u.assignedClassIds.map(cls => (
                                  <span key={cls} className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[10px] border border-slate-200">
                                    {cls}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Chưa gán lớp</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-slate-600">
                            {u.phone || '---'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Nút Phê duyệt (cho tài khoản pending) */}
                              {u.status === 'pending' && (
                                <button
                                  onClick={() => handleApproveUser(u.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition active:scale-95"
                                  title="Phê duyệt tài khoản này"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>DUYỆT</span>
                                </button>
                              )}

                              {/* Nút Đổi mật khẩu */}
                              <button
                                onClick={() => { setPasswordUser(u); setNewPasswordInput(''); }}
                                className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                title="Đổi mật khẩu cho người dùng này"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>

                              {/* Nút Sửa thông tin */}
                              <button
                                onClick={() => setEditingUser(u)}
                                className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="Sửa thông tin người dùng"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Nút Khóa / Mở khóa */}
                              {!isMasterAdmin && (
                                <button
                                  onClick={() => handleToggleLockUser(u.id, u.status, u.email)}
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                                    u.status === 'locked' ? 'text-emerald-700 hover:bg-emerald-50' : 'text-slate-500 hover:bg-slate-100'
                                  }`}
                                  title={u.status === 'locked' ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                >
                                  {u.status === 'locked' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                </button>
                              )}

                              {/* Nút Xóa */}
                              {!isMasterAdmin && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                  title="Xóa tài khoản khỏi hệ thống"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
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
        )}

        {/* TAB 2: PHÂN QUYỀN GIÁO VIÊN CHỦ NHIỆM THEO LỚP */}
        {activeTab === 'assign-teacher' && (
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-5 gap-3.5">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-950 flex items-center justify-between">
              <div>
                <p className="font-bold text-indigo-900">
                  Phân quyền Giáo viên Chủ nhiệm (GVCN) & Cố vấn học tập theo từng Lớp học
                </p>
                <p className="text-[11px] text-indigo-700">
                  GVCN sau khi được phân quyền sẽ có toàn quyền quản trị hồ sơ, điểm danh chuyên cần, sổ quỹ và điểm số của lớp được giao.
                </p>
              </div>
              <span className="font-bold text-indigo-800 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
                Tổng cộng: {classes.length} Lớp
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {classes.map(cls => {
                const currentTeacherUser = users.find(u => u.fullName === cls.headTeacher || u.email === cls.headTeacherEmail);
                const activeTeachers = users.filter(u => u.status === 'active' && (u.role === 'teacher' || u.role === 'admin'));

                return (
                  <div key={cls.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <span className="font-black text-blue-900 text-xs sm:text-sm block">{cls.id}</span>
                        <span className="text-[11px] text-slate-600 block">{cls.name}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold border border-slate-200">
                        {cls.academicYear}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">GVCN hiện tại:</span>
                        <strong className="text-slate-800">{cls.headTeacher || 'Chưa phân công'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">SĐT liên hệ:</span>
                        <span className="font-mono text-slate-700">{cls.headTeacherPhone || '---'}</span>
                      </div>
                    </div>

                    {/* Phân công GVCN mới */}
                    <div className="pt-2 border-t border-slate-100">
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                        Gán / Thay đổi GVCN phụ trách lớp:
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          defaultValue={currentTeacherUser?.email || ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssignTeacherToClass(cls.id, e.target.value);
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">-- Chọn giáo viên từ hệ thống --</option>
                          {activeTeachers.map((t, tIdx) => (
                            <option key={`${t.id}-${tIdx}`} value={t.email}>
                              {t.fullName} ({t.email}) - {t.department}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Phân quyền bảo mật giữa các lớp do Admin toàn quyền quyết định */}
                    <div className="pt-2 border-t border-slate-100 bg-slate-50 p-2.5 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-slate-700 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Quyền xem dữ liệu lớp khác:</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          currentTeacherUser?.canViewOtherClasses 
                            ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {currentTeacherUser?.canViewOtherClasses ? '👁️ Được xem lớp khác (Chỉ xem)' : '🔒 Chỉ quản lý lớp này'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <p className="text-[10px] text-slate-500 leading-tight">
                          {currentTeacherUser?.canViewOtherClasses
                            ? 'GVCN được quyền xem tham khảo các lớp khác (chế độ chỉ xem, không được sửa/xóa).'
                            : 'Bảo mật: GVCN chỉ có quyền xem, sửa, xóa học sinh lớp này. Không được xem các lớp khác.'}
                        </p>
                        {currentTeacherUser && (
                          <button
                            type="button"
                            onClick={() => handleToggleViewOtherClasses(currentTeacherUser.id)}
                            className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold transition shadow-2xs cursor-pointer ${
                              currentTeacherUser.canViewOtherClasses
                                ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                            }`}
                            title="Admin phân quyền bật/tắt quyền xem lớp khác cho giáo viên này"
                          >
                            {currentTeacherUser.canViewOtherClasses ? 'Khóa xem lớp khác' : 'Cấp quyền xem lớp khác'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: PHÂN QUYỀN CÁN BỘ LỚP ĐIỂM DANH */}
        {activeTab === 'assign-student' && (
          <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-5 gap-3.5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Phân quyền Cán bộ lớp (Lớp trưởng, Bí thư, Tổ trưởng) vào Điểm danh chuyên cần</span>
                </p>
                <p className="text-[11px] text-emerald-800 font-medium">
                  🔒 <strong>Quy chế phân quyền Cán bộ lớp:</strong> Sinh viên được phân quyền khi đăng nhập <strong>CHỈ CÓ THỂ TRUY CẬP MỤC ĐIỂM DANH CHUYÊN CẦN</strong>. Tất cả 8 mục chức năng quản trị khác (Tổng quan, Quản lý lớp, Hồ sơ sinh viên, Điểm số, Thi lại, Báo cáo sổ quỹ, Sao lưu, Cổng tra cứu) đều tự động bị khóa hoàn toàn.
                </p>
              </div>

              {/* Bộ chọn lớp */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 shadow-2xs">
                <span className="font-bold text-slate-700 text-xs">Lớp học:</span>
                <select
                  value={selectedClassForStudent}
                  onChange={(e) => setSelectedClassForStudent(e.target.value)}
                  className="font-bold text-blue-900 bg-transparent focus:outline-none cursor-pointer text-xs"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tìm kiếm sinh viên */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Tìm sinh viên theo họ tên, MSSV, chức vụ (Lớp trưởng, Bí thư, Tổ trưởng)..."
                className="w-full bg-transparent focus:outline-none font-medium text-slate-900"
              />
              {studentSearch && (
                <button onClick={() => setStudentSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Danh sách sinh viên của lớp */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 font-bold text-slate-700 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">STT</th>
                    <th className="py-2.5 px-3 w-28">MSSV</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Họ và Tên Sinh Viên</th>
                    <th className="py-2.5 px-3 text-center w-28">Chức Vụ Lớp</th>
                    <th className="py-2.5 px-3 text-center w-20">Tổ Xưởng</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Tài Khoản Đăng Nhập</th>
                    <th className="py-2.5 px-3 text-center w-36">Quyền Điểm Danh</th>
                    <th className="py-2.5 px-3 text-center w-32">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredClassStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Không tìm thấy sinh viên nào trong lớp {selectedClassForStudent}.
                      </td>
                    </tr>
                  ) : (
                    filteredClassStudents.map((sv, idx) => {
                      const studentAccount = users.find(u => u.studentId === sv.id || (sv.email && u.email === sv.email));
                      const isAssigned = !!studentAccount && studentAccount.canTakeAttendance;

                      return (
                        <tr key={`${sv.id}-${idx}`} className="hover:bg-slate-50 transition">
                          <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3 font-mono font-bold text-blue-900">{sv.id}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{sv.fullName}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sv.role?.includes('Lớp trưởng') || sv.role?.includes('Bí thư')
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : sv.role?.includes('Tổ trưởng')
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {sv.role || 'Thành viên'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-slate-700">Tổ {sv.workshopGroup || 1}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {studentAccount ? (
                              <div>
                                <span className="font-bold text-indigo-950 block">{studentAccount.email}</span>
                                <span className="text-[10px] text-slate-400">Mật khẩu: {studentAccount.password}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Chưa tạo tài khoản</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {isAssigned ? (
                              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-1">
                                <Check className="w-3 h-3 text-emerald-700" />
                                <span>Được điểm danh</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full font-medium text-[10px] bg-slate-100 text-slate-500">
                                Chưa cấp quyền
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => handleAssignStudentLeader(sv)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 shadow-2xs ${
                                isAssigned
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {isAssigned ? 'Hủy quyền' : '+ Cấp quyền'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Modal */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0 text-xs">
          <div className="text-slate-500">
            Quản trị viên đang làm việc: <strong>{currentUser?.fullName}</strong> ({currentUser?.email})
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>

      </div>

      {/* SUB-MODAL 1: ĐỔI MẬT KHẨU CHO NGƯỜI DÙNG */}
      {passwordUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-yellow-200" />
                <h4 className="font-bold text-sm uppercase">ĐỔI MẬT KHẨU NGƯỜI DÙNG</h4>
              </div>
              <button onClick={() => setPasswordUser(null)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveNewPassword} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                <p><strong>Người dùng:</strong> {passwordUser.fullName}</p>
                <p><strong>Email:</strong> {passwordUser.email}</p>
                <p><strong>Mật khẩu hiện tại:</strong> <span className="font-mono font-bold">{passwordUser.password}</span></p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nhập mật khẩu mới: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu mới (VD: 123456 hoặc abc@123)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPasswordUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Lưu Mật Khẩu Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: SỬA THÔNG TIN NGƯỜI DÙNG */}
      {editingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-yellow-300" />
                <h4 className="font-bold text-sm uppercase">SỬA THÔNG TIN TÀI KHOẢN</h4>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Họ và Tên:</label>
                  <input
                    type="text"
                    required
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại:</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email đăng nhập:</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vai trò người dùng:</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value="admin">Quản trị viên (Admin - Hiện đầy đủ các mục)</option>
                    <option value="teacher">Người dùng (Giáo viên - Ẩn TT đơn vị, QL lớp, Sao lưu, Setup admin)</option>
                    <option value="student">Sinh viên Điểm danh (Chỉ hiển thị lớp & mục điểm danh)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trạng thái tài khoản:</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as UserStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value="active">✓ Đang hoạt động</option>
                    <option value="pending">⏳ Chờ duyệt</option>
                    <option value="locked">⛔ Bị khóa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Khoa / Bộ môn:</label>
                <input
                  type="text"
                  value={editingUser.department || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mật khẩu đăng nhập:</label>
                <input
                  type="text"
                  required
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                />
              </div>

              {/* Phân quyền lớp phụ trách */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 block text-xs">
                  Phân quyền Lớp học phụ trách ({editingUser.role === 'admin' ? 'Quản trị' : editingUser.role === 'teacher' ? 'GVCN' : 'Cán bộ lớp'}):
                </label>
                
                {editingUser.role === 'admin' ? (
                  <p className="text-[11px] text-amber-800 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                    👑 Tài khoản Quản trị viên có toàn quyền truy cập tất cả các lớp (*)
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                    {classes.map(cls => {
                      const isAssigned = (editingUser.assignedClassIds || []).includes(cls.id);
                      return (
                        <label key={cls.id} className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-50 text-[11px] font-semibold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={(e) => {
                              const prevIds = editingUser.assignedClassIds || [];
                              const newIds = e.target.checked
                                ? [...prevIds, cls.id]
                                : prevIds.filter(id => id !== cls.id);
                              setEditingUser({ ...editingUser, assignedClassIds: newIds });
                            }}
                            className="w-3.5 h-3.5 text-blue-600 rounded cursor-pointer"
                          />
                          <span className="truncate">{cls.id}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Phân quyền xem lớp khác cho GVCN do Admin quyết định */}
                {editingUser.role === 'teacher' && (
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    <label className="flex items-start gap-2 text-[11px] font-bold text-indigo-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editingUser.canViewOtherClasses}
                        onChange={(e) => setEditingUser({ ...editingUser, canViewOtherClasses: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded mt-0.5 cursor-pointer"
                      />
                      <div>
                        <span>Cho phép xem thêm dữ liệu các lớp khác (Chế độ chỉ xem)</span>
                        <p className="text-[10px] text-slate-500 font-normal">
                          Nếu bật, GVCN được xem tham khảo dữ liệu các lớp khác nhưng không thể thêm, sửa, xóa học sinh lớp khác. Nếu tắt, GVCN chỉ được xem duy nhất lớp mình chủ nhiệm.
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Cập Nhật Người Dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: TẠO MỚI TÀI KHOẢN TRỰC TIẾP */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-yellow-300" />
                <h4 className="font-bold text-sm uppercase">TẠO TÀI KHOẢN NGƯỜI DÙNG MỚI</h4>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateNewUser} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Họ và Tên: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserForm.fullName || ''}
                    onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                    placeholder="VD: ThS. Lê Văn Bình"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại:</label>
                  <input
                    type="text"
                    value={newUserForm.phone || ''}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    placeholder="VD: 0912.345.678"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Email đăng nhập: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email || ''}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="VD: gv.binh@caodang.edu.vn"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mật khẩu: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserForm.password || ''}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    placeholder="Nhập mật khẩu (VD: 123456)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vai trò:</label>
                  <select
                    value={newUserForm.role || 'teacher'}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value="admin">Quản trị viên (Admin - Hiện đầy đủ các mục)</option>
                    <option value="teacher">Người dùng (Giáo viên - Ẩn TT đơn vị, QL lớp, Sao lưu, Setup admin)</option>
                    <option value="student">Sinh viên Điểm danh (Chỉ hiển thị lớp & mục điểm danh)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trạng thái:</label>
                  <select
                    value={newUserForm.status || 'active'}
                    onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value as UserStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value="active">✓ Kích hoạt ngay (Active)</option>
                    <option value="pending">⏳ Chờ duyệt (Pending)</option>
                    <option value="locked">⛔ Tạm khóa (Locked)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Khoa / Bộ môn:</label>
                <input
                  type="text"
                  value={newUserForm.department || ''}
                  onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                  placeholder="Khoa Công nghệ Ô tô"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={saveAsDefault}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  💾 Lưu mặc định
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Khởi Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 4: XÁC NHẬN XÓA TÀI KHOẢN (BẢO MẬT & TRÁNH POPUP BỊ CHẶN) */}
      {userToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-rose-300 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-200" />
                <h4 className="font-bold text-sm uppercase">XÁC NHẬN XÓA TÀI KHOẢN</h4>
              </div>
              <button onClick={() => setUserToDelete(null)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 space-y-1">
                <p className="font-medium">Thầy/Cô có chắc chắn muốn xóa tài khoản người dùng sau khỏi hệ thống?</p>
                <div className="pt-2 border-t border-rose-200/60 space-y-1">
                  <p><strong>Họ và Tên:</strong> {userToDelete.fullName}</p>
                  <p><strong>Email:</strong> <span className="font-mono">{userToDelete.email}</span></p>
                  <p><strong>Vai trò:</strong> {userToDelete.role === 'admin' ? 'Quản trị viên' : userToDelete.role === 'teacher' ? 'Giáo viên (GVCN)' : 'Sinh viên cán bộ lớp'}</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                ⚠️ Cảnh báo: Thao tác này sẽ xóa vĩnh viễn tài khoản người dùng khỏi hệ thống. Tài khoản Quản trị viên tối cao (Master Admin) được bảo vệ tuyệt đối không thể xóa.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xác Nhận Xóa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
