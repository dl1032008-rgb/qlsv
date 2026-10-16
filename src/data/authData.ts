import { UserAccount } from '../types';
import { safeLocalStorage } from '../utils/storage';

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  // 1. TÀI KHOẢN ADMIN MASTER CHUẨN THEO YÊU CẦU (HIỆN ĐẦY ĐỦ CÁC MỤC)
  {
    id: 'USR_ADMIN_MASTER',
    email: 'nguyenchidung1278@gmail.com',
    password: 'admin',
    fullName: 'ThS. Nguyễn Chí Dũng',
    phone: '0865.074.668',
    role: 'admin',
    status: 'active',
    department: 'Khoa Công nghệ Ô tô',
    assignedClassIds: ['*'], // Toàn quyền tất cả các lớp
    canTakeAttendance: true,
    createdAt: '2025-01-01 08:00',
    approvedAt: '2025-01-01 08:00',
    approvedBy: 'Hệ thống Quản trị',
    note: 'Tài khoản Quản trị viên Tối cao (Master Admin) - Toàn quyền phê duyệt, phân quyền và vận hành'
  },
  // 2. TÀI KHOẢN NGƯỜI DÙNG GIẢNG VIÊN (ẨN: TT ĐƠN VỊ, QUẢN LÝ LỚP, SAO LƯU, SETUP ADMIN)
  {
    id: 'USR_TEACHER_DEMO',
    email: 'gv.oto@caodang.edu.vn',
    password: 'gv123',
    fullName: 'ThS. Lê Văn Bình',
    phone: '0912.345.678',
    role: 'teacher',
    status: 'active',
    department: 'Bộ môn Khung gầm & Động cơ Ô tô',
    assignedClassIds: ['CĐK19.2-OT1.CLC', 'CĐK19.2-OT2'],
    canTakeAttendance: true,
    canViewOtherClasses: true,
    createdAt: '2025-01-05 09:00',
    approvedAt: '2025-01-05 09:30',
    approvedBy: 'ThS. Nguyễn Chí Dũng',
    note: 'Tài khoản Người dùng (Giảng viên / GVCN) - Quản lý hồ sơ, điểm, điểm danh và học vụ'
  },
  // 3. TÀI KHOẢN SINH VIÊN ĐIỂM DANH (CHỈ HIỂN THỊ LỚP VÀ MỤC ĐIỂM DANH)
  {
    id: 'USR_STUDENT_ATTENDANCE',
    email: 'sv.hoang@caodang.edu.vn',
    password: 'sv123',
    fullName: 'Trần Văn Hoàng',
    phone: '0987.654.321',
    role: 'student',
    status: 'active',
    department: 'Lớp CĐK19.2-OT1.CLC',
    assignedClassIds: ['CĐK19.2-OT1.CLC'],
    studentId: '25CDOT-001',
    studentRole: 'Lớp trưởng',
    canTakeAttendance: true,
    createdAt: '2025-01-10 10:00',
    approvedAt: '2025-01-10 10:30',
    approvedBy: 'ThS. Nguyễn Chí Dũng',
    note: 'Tài khoản Cán bộ lớp - Chỉ có quyền chọn lớp và thực hiện điểm danh học vụ'
  }
];

const STORAGE_USERS_KEY = 'oto_user_accounts';
const STORAGE_CURRENT_USER_KEY = 'oto_auth_current_user';

export const loadUserAccounts = (): UserAccount[] => {
  try {
    const saved = safeLocalStorage.get(STORAGE_USERS_KEY);
    let list: UserAccount[] = INITIAL_USER_ACCOUNTS;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure default accounts exist without duplicating email or id
        const existingEmails = new Set(parsed.map(u => String(u?.email || '').toLowerCase().trim()));
        const existingIds = new Set(parsed.map(u => String(u?.id || '').trim()));
        const missing = INITIAL_USER_ACCOUNTS.filter(
          u => !existingEmails.has(u.email.toLowerCase().trim()) && !existingIds.has(u.id)
        );
        list = [...parsed, ...missing];
      }
    }

    // Deduplicate by both ID and Email to strictly prevent duplicate key error USR_TEACHER_DEMO
    const seenIds = new Set<string>();
    const seenEmails = new Set<string>();
    const uniqueUsers: UserAccount[] = [];

    for (const u of list) {
      if (!u || !u.id || !u.email) continue;
      const cleanEmail = u.email.toLowerCase().trim();
      let cleanId = u.id.trim();

      if (seenEmails.has(cleanEmail)) continue;
      if (seenIds.has(cleanId)) {
        cleanId = `${cleanId}_${Math.random().toString(36).slice(2, 6)}`;
      }

      seenIds.add(cleanId);
      seenEmails.add(cleanEmail);
      uniqueUsers.push({ ...u, id: cleanId, email: cleanEmail });
    }

    return uniqueUsers.length > 0 ? uniqueUsers : INITIAL_USER_ACCOUNTS;
  } catch (e) {
    console.error('Lỗi khi đọc danh sách tài khoản:', e);
  }
  return INITIAL_USER_ACCOUNTS;
};

export const saveUserAccounts = (users: UserAccount[]): void => {
  try {
    const seenIds = new Set<string>();
    const seenEmails = new Set<string>();
    const uniqueUsers: UserAccount[] = [];

    for (const u of users) {
      if (!u || !u.id || !u.email) continue;
      const cleanEmail = u.email.toLowerCase().trim();
      let cleanId = u.id.trim();

      if (seenEmails.has(cleanEmail)) continue;
      if (seenIds.has(cleanId)) {
        cleanId = `${cleanId}_${Math.random().toString(36).slice(2, 6)}`;
      }

      seenIds.add(cleanId);
      seenEmails.add(cleanEmail);
      uniqueUsers.push({ ...u, id: cleanId, email: cleanEmail });
    }

    safeLocalStorage.set(STORAGE_USERS_KEY, JSON.stringify(uniqueUsers));
  } catch (e) {
    console.error('Lỗi khi lưu danh sách người dùng:', e);
  }
};

export const loadCurrentAuthUser = (): UserAccount | null => {
  try {
    const saved = safeLocalStorage.get(STORAGE_CURRENT_USER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.email) {
        return parsed as UserAccount;
      }
    }
  } catch (e) {
    console.error('Lỗi khi đọc tài khoản đăng nhập hiện tại:', e);
  }
  return null;
};

export const saveCurrentAuthUser = (user: UserAccount | null): void => {
  try {
    if (user) {
      safeLocalStorage.set(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      safeLocalStorage.remove(STORAGE_CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Lỗi khi lưu phiên làm việc người dùng:', e);
  }
};
