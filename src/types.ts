export type ActiveTab =
  | 'home'
  | 'unit-info'
  | 'organization'
  | 'students'
  | 'grades'
  | 'attendance'
  | 'retake'
  | 'reports'
  | 'backup-forms'
  | 'portal'
  | 'ai';

export type AcademicYear = '2025 - 2028' | '2024 - 2027' | '2023 - 2026' | string;
export type ClassId = string;

export interface ClassItem {
  id: string; // Mã lớp (VD: CĐK19.2-OT1.CLC)
  name: string; // Tên hiển thị lớp
  academicYear: string; // Niên khóa (VD: 2025 - 2028)
  major: string; // Ngành nghề (VD: Công nghệ ô tô)
  trainingSystem: string; // Hệ đào tạo (VD: Cao đẳng chính quy)
  headTeacher: string; // GVCN / Cố vấn học tập (VD: ThS. Nguyễn Chí Dũng)
  headTeacherPhone: string; // SĐT GVCN
  headTeacherEmail?: string;
  headDepartment: string; // Khoa chuyên môn
  studentCount?: number;
  classLeaderName?: string;
  classLeaderPhone?: string;
  status: 'Đang đào tạo' | 'Đã tốt nghiệp' | 'Tạm dừng';
  accessPermissions: {
    adminFullAccess: boolean;
    advisorFullAccess: boolean;
    subjectTeacherInputGrades: boolean;
    studentViewOnly: boolean;
  };
  note?: string;
  createdAt: string;
}

export interface FamilyInfo {
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
  hometown: string;
  currentAddress: string;
  emergencyContact: string;
}

export interface Student {
  id: string; // 1. MSSV
  fullName: string; // 2. Họ và tên
  gender: 'Nam' | 'Nữ'; // 3. Giới tính
  birthDate: string; // 4. Ngày sinh (DD/MM/YYYY)
  dob?: string;
  cccd?: string;
  ethnicity: string; // 5. Dân tộc
  idCard: string; // 6. CCCD
  phone: string; // 7. SĐT cá nhân
  email: string; // 8. Email
  permanentAddress: string; // 9. Hộ khẩu thường trú
  temporaryAddress: string; // 10. Địa chỉ tạm trú / KTX
  fatherName: string; // 11. Họ tên Bố
  fatherPhone: string; // 12. SĐT Bố
  motherName: string; // 13. Họ tên Mẹ
  motherPhone: string; // 14. SĐT Mẹ
  parentJob: string; // 15. Nghề nghiệp phụ huynh
  fatherJob?: string;
  motherJob?: string;
  emergencyPhone: string; // SĐT khẩn cấp
  workshopGroup: number; // 18. Tổ xưởng (Tổ 1 - 4)
  workshopTeam?: string;
  workshopRole?: string; // "Tổ trưởng", "Tổ phó", "Thành viên"
  workshopPosition?: string;
  role: string; // Chức vụ
  station: string; // 19. Vị trí thực hành xưởng
  policy: string; // 20. Diện chính sách
  policyGroup?: string;
  tuitionStatus: {
    standardTuition: number;
    governmentSubsidy: number;
    studentPayable: number;
    paidAmount: number;
    debtAmount: number;
    isComplete: boolean;
  }; // 21. Học phí
  academicStatus: 'Đang học bình thường' | 'Cảnh báo học vụ' | 'Nguy cơ cấm thi' | 'Nợ môn' | 'Bảo lưu'; // 22. Tình trạng học tập
  teacherNotes: string; // 23. Ghi chú sư phạm của GVCN
  classId: ClassId;
  major?: string;
  classCode?: string;
  academicYear?: string;
  semester?: number;
  status?: string;
  family?: FamilyInfo;
  notes?: string;
  avatarUrl?: string;
  idCardIssueDate?: string;
  attendanceRate?: number;
  avatar?: string;
}

export interface SubjectModule {
  id: string;
  name: string;
  credits: number;
  totalHours: number;
  theoryHours: number;
  practiceHours: number;
  examHours?: number;
  semester: number;
  academicYearNumber?: number;
  type?: string;
  isMandatory?: boolean;
  trainingSystem?: string;
  classId?: string;
  note?: string;
}

export interface SubjectGrade {
  subjectCode: string;
  subjectName: string;
  credits: number;
  regularScore: number;
  periodicScore: number;
  examScore: number;
  finalScore: number;
  letterGrade: 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F';
  status: 'Đạt' | 'Thi lại' | 'Học lại';
}

export interface SemesterGrades {
  semesterId: number;
  subjects: SubjectGrade[];
  gpa10: number;
  gpa4: number;
  classification: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu' | 'Kém';
  backlogCount: number;
}

export interface StudentGrade {
  studentId: string;
  moduleId: string;
  regularScore1: number;
  regularScore2: number;
  midtermScore: number;
  finalExamScore: number;
  finalGrade10: number;
  finalGrade4: number;
  letterGrade: 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F';
  isPassed: boolean;
  retakeCount: number;
}

export type AttendanceStatus = 'P' | 'L' | 'A' | 'LATE';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  shift: 'Sáng' | 'Chiều' | 'Tối';
  sessionHours: number;
  moduleId: string;
  session?: 'Sáng' | 'Chiều' | 'Tối';
  moduleName?: string;
  status: AttendanceStatus;
  reason?: string;
  note?: string;
}

export interface ConductEvaluation {
  studentId: string;
  semesterId: number;
  criteria1: number;
  criteria2: number;
  criteria3: number;
  criteria4: number;
  criteria5: number;
  totalScore: number;
  classification: 'Xuất sắc' | 'Tốt' | 'Khá' | 'Trung bình' | 'Yếu' | 'Kém';
  note?: string;
}

export interface RenLuyenCriteria {
  studentId: string;
  semester: number;
  criteria1: number;
  criteria2: number;
  criteria3: number;
  criteria4: number;
  criteria5: number;
  totalScore: number;
  rank: 'Xuất sắc' | 'Tốt' | 'Khá' | 'Trung bình' | 'Yếu' | 'Kém';
  evaluationStep: 'SV tự chấm' | 'Lớp họp bình xét' | 'GVCN duyệt';
  disciplineNote?: string;
}

export interface TuitionRecord {
  studentId: string;
  semesterId: number;
  totalTuition: number;
  reductionPercentage: number;
  reductionAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Đã hoàn thành' | 'Còn nợ' | 'Miễn toàn phần';
  lastPaymentDate?: string;
}

export interface FinanceTransaction {
  id: string;
  date: string;
  type: 'Thu' | 'Chi' | 'THU' | 'CHI';
  category: string;
  amount: number;
  description?: string;
  payerOrReceiver?: string;
  performer?: string;
  note?: string;
  receiptNumber: string;
}

export type FundTransaction = FinanceTransaction;

export interface WorkshopLog {
  id: string;
  date: string;
  team: string;
  topic: string;
  ppeChecked: boolean;
  equipmentUsed: string;
  safetyIncidents: string;
  instructorNote: string;
  status: 'Đạt yêu cầu' | 'Cần khắc phục' | 'Vi phạm ATVSLĐ';
}

export interface WorkshopSafetyLog {
  id: string;
  date: string;
  shift: 'Sáng' | 'Chiều';
  groupNumber: number;
  station: string;
  supervisor: string;
  protectiveEquipmentChecked: boolean;
  equipmentStatus: 'Bình thường' | 'Cảnh báo hao mòn' | 'Cần bảo dưỡng';
  incidentReport?: string;
  note: string;
}

export interface AdminFormTemplate {
  id: string;
  title: string;
  category: 'Biên bản' | 'Quyết định' | 'Giấy tờ' | 'Đơn từ' | 'Thông báo';
  templateContent: string;
  description: string;
}

export interface ThemeSettings {
  logoUrl?: string;
  schoolName: string;
  facultyName: string;
  systemTitle: string;
  authorName: string;
  authorPhone: string;
  bannerUrl?: string;
  bannerTitle?: string;
  headerBgStart: string;
  headerBgEnd: string;
  tableHeaderBg: string;
  sidebarBtnBgStart: string;
  sidebarBtnBgEnd: string;
  cardBg: string;
  presetTheme: string;
}

export interface UnitInfoSettings {
  parentAgency: string;
  schoolName: string;
  facultyName: string;
  majorName: string;
  classId: string;
  academicYear: string;
  trainingSystem: string;
  issueLocation: string;
  documentSymbol: string;
  advisorName: string;
  deanName: string;
  secretaryName: string;
  certSignerTitle: string;
  principalName: string;
  classZaloLink: string;
  parentZaloLink: string;
}

export const DEFAULT_UNIT_INFO_SETTINGS: UnitInfoSettings = {
  parentAgency: 'UBND TỈNH PHÚ THỌ',
  schoolName: 'TRƯỜNG CAO ĐẲNG KỸ THUẬT - CÔNG NGHỆ VĨNH PHÚC',
  facultyName: 'KHOA CÔNG NGHỆ Ô TÔ',
  majorName: 'Công nghệ ô tô',
  classId: 'CĐK19.2-OT1.CLC',
  academicYear: '2025-2028',
  trainingSystem: 'Cao đẳng chính quy',
  issueLocation: 'Phú Thọ',
  documentSymbol: '.../TN-CĐOT',
  advisorName: 'ThS: Nguyễn Chí Dũng',
  deanName: 'ThS: Đỗ Thế Huân',
  secretaryName: 'Nguyễn Thế Quang',
  certSignerTitle: 'TRƯỜNG PHÒNG CTHSSV',
  principalName: 'Nguyễn Văn A',
  classZaloLink: 'https://zalo.me/g/q8w0zyfvuhi14upj3t7d',
  parentZaloLink: 'https://zalo.me/g/phuhuynh-cdk192-ot1'
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  logoUrl: '',
  schoolName: 'TRƯỜNG CAO ĐẲNG KỸ THUẬT - CÔNG NGHỆ VĨNH PHÚC',
  facultyName: 'KHOA CÔNG NGHỆ Ô TÔ • BỘ MÔN ĐIỆN - ĐIỆN TỬ Ô TÔ',
  systemTitle: 'HỆ THỐNG QUẢN LÝ SINH VIÊN ĐIỆN TỬ - KHOA CÔNG NGHỆ Ô TÔ',
  authorName: 'ThS: Nguyễn Chí Dũng',
  authorPhone: '0865.074.668',
  bannerUrl: '',
  bannerTitle: 'MÔ HÌNH HỆ DẪN ĐỘNG & KHUNG GẦM Ô TÔ THỰC HÀNH XƯỞNG',
  headerBgStart: '#01427a',
  headerBgEnd: '#014c8a',
  tableHeaderBg: '#004e92',
  sidebarBtnBgStart: '#006bb6',
  sidebarBtnBgEnd: '#004883',
  cardBg: '#ffffff',
  presetTheme: 'classic-blue'
};

export type UserRole = 'admin' | 'teacher' | 'student';
export type UserStatus = 'active' | 'pending' | 'locked';

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  department?: string;
  assignedClassIds: string[];
  studentId?: string;
  studentRole?: string;
  canTakeAttendance: boolean;
  canViewOtherClasses?: boolean;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  lastLogin?: string;
  note?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserAccount | null;
}

export interface MenuConfigItem {
  id: ActiveTab;
  name: string;
  order: number;
}

export type MenuConfig = MenuConfigItem[];

export const DEFAULT_MENU_CONFIG: MenuConfig = [
  { id: 'home', name: 'Trang Chủ', order: 0 },
  { id: 'unit-info', name: 'Thông Tin Đơn Vị', order: 1 },
  { id: 'organization', name: 'Quản Lý Lớp Học', order: 2 },
  { id: 'students', name: 'Hồ Sơ Sinh Viên', order: 3 },
  { id: 'grades', name: 'Quản Lý Điểm', order: 4 },
  { id: 'attendance', name: 'Theo Dõi Học Tập', order: 5 },
  { id: 'retake', name: 'Học Lại Thi Lại', order: 6 },
  { id: 'reports', name: 'Báo Cáo Thống Kê', order: 7 },
  { id: 'backup-forms', name: 'Văn Bản Hành Chính', order: 8 },
  { id: 'portal', name: 'Cổng Tra Cứu SV/PH', order: 9 },
  { id: 'ai', name: 'Trợ Lý AI Sư Phạm', order: 10 }
];

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'error';
  progress?: number;
  lastSync?: string;
  message?: string;
}

export interface AutoSyncInfo {
  enabled: boolean;
  debounceMs: number;
  status: 'idle' | 'pending' | 'syncing' | 'synced' | 'local_saved' | 'error';
  lastSyncTime: string;
  syncMessage: string;
  onToggleAutoSync: (enabled: boolean) => void;
  onSetDebounceMs: (ms: number) => void;
  onTriggerNow: () => void;
}

