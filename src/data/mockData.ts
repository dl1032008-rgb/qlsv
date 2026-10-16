import { Student, SubjectModule, StudentGrade, AttendanceRecord, RenLuyenCriteria, FundTransaction, WorkshopSafetyLog, ClassItem } from '../types';

export const INITIAL_CLASSES: ClassItem[] = [
  {
    id: 'CĐK19.2-OT1.CLC',
    name: 'Cao đẳng Kỹ thuật Ô tô 19.2 - Lớp 1 (Chất lượng cao)',
    academicYear: '2025 - 2028',
    major: 'Công nghệ Kỹ thuật Ô tô',
    trainingSystem: 'Hệ Cao Đẳng Chính Quy',
    headTeacher: 'ThS. Nguyễn Chí Dũng',
    headTeacherPhone: '0988123456',
    headDepartment: 'Khoa Công nghệ Ô tô',
    studentCount: 25,
    status: 'Đang đào tạo',
    accessPermissions: {
      adminFullAccess: true,
      advisorFullAccess: true,
      subjectTeacherInputGrades: true,
      studentViewOnly: true
    },
    createdAt: '2025-09-01'
  },
  {
    id: 'CĐK19.2-OT2',
    name: 'Cao đẳng Kỹ thuật Ô tô 19.2 - Lớp 2',
    academicYear: '2025 - 2028',
    major: 'Công nghệ Kỹ thuật Ô tô',
    trainingSystem: 'Hệ Cao Đẳng Chính Quy',
    headTeacher: 'ThS. Trần Văn Hùng',
    headTeacherPhone: '0988234567',
    headDepartment: 'Khoa Công nghệ Ô tô',
    studentCount: 21,
    status: 'Đang đào tạo',
    accessPermissions: {
      adminFullAccess: true,
      advisorFullAccess: true,
      subjectTeacherInputGrades: true,
      studentViewOnly: true
    },
    createdAt: '2025-09-01'
  }
];

export const INITIAL_MODULES: SubjectModule[] = [
  {
    id: 'MOD-01',
    name: 'Động cơ đốt trong & Hệ thống nhiên liệu EFI',
    credits: 4,
    totalHours: 75,
    theoryHours: 30,
    practiceHours: 45,
    semester: 1,
    classId: 'CĐK19.2-OT1.CLC'
  },
  {
    id: 'MOD-02',
    name: 'Hệ thống điện - điện tử ô tô & Scan tool',
    credits: 4,
    totalHours: 75,
    theoryHours: 25,
    practiceHours: 50,
    semester: 1,
    classId: 'CĐK19.2-OT1.CLC'
  },
  {
    id: 'MOD-03',
    name: 'Hộp số tự động AT / CVT & Truyền động',
    credits: 3,
    totalHours: 60,
    theoryHours: 20,
    practiceHours: 40,
    semester: 2,
    classId: 'CĐK19.2-OT1.CLC'
  }
];

// 25 Sinh viên chuẩn cho lớp CĐK19.2-OT1.CLC: 11 học viên Tổ 1, 14 học viên Tổ 2
const sampleNames = [
  'Nguyễn Văn An', 'Trần Quang Dũng', 'Lê Hoàng Long', 'Phạm Minh Tuấn', 'Hoàng Văn Nam',
  'Vũ Đức Huy', 'Đặng Quốc Bảo', 'Bùi Văn Hùng', 'Đỗ Thành Vinh', 'Hồ Hải Nam',
  'Ngô Văn Phúc', 'Dương Minh Khôi', 'Lý Thế Vinh', 'Đinh Công Thành', 'Bùi Quang Minh',
  'Phan Thanh Tùng', 'Võ Văn Thắng', 'Trịnh Hữu Đạt', 'Mai Văn Hải', 'Lương Thế Sơn',
  'Cao Minh Quân', 'Tạ Đình Phúc', 'Phạm Hoàng Ân', 'Lê Văn Khải', 'Nguyễn Đức Toàn'
];

export const INITIAL_STUDENTS: Student[] = sampleNames.map((name, idx) => {
  const seq = idx + 1;
  const id = `25CDOT-${String(seq).padStart(3, '0')}`;
  const workshopGroup = seq <= 11 ? 1 : 2; // 11 sinh viên Tổ 1, 14 sinh viên Tổ 2
  const vehicles = ['Xe máy Honda Wave Alpha', 'Xe máy Yamaha Sirius', 'Xe máy Honda Vision', 'Xe số Future', 'Xe tay ga AirBlade', 'Xe máy Yamaha Exciter'];
  const station = vehicles[idx % vehicles.length];
  
  const hasDebt = seq % 4 === 0 || seq === 7;
  const studentPayable = 2250000;
  const paidAmount = hasDebt ? 1000000 : 2250000;
  const debtAmount = hasDebt ? (studentPayable - paidAmount) : 0;
  const isComplete = !hasDebt;

  return {
    id,
    fullName: name,
    gender: 'Nam',
    birthDate: `${String((seq % 28) + 1).padStart(2, '0')}/0${(seq % 9) + 1}/2007`,
    ethnicity: 'Kinh',
    idCard: `038207${String(100000 + seq)}`,
    phone: `0988${String(100000 + seq).slice(-6)}`,
    email: `${id.toLowerCase().replace('-', '')}@gdnn.edu.vn`,
    permanentAddress: `Huyện Tiên Lãng, TP. Hải Phòng`,
    temporaryAddress: `KTX Khu B, Phòng ${300 + seq}`,
    fatherName: `Bố của ${name}`,
    fatherPhone: `0912${String(200000 + seq).slice(-6)}`,
    motherName: `Mẹ của ${name}`,
    motherPhone: `0913${String(300000 + seq).slice(-6)}`,
    parentJob: seq % 2 === 0 ? 'Kỹ sư cơ khí' : 'Lao động tự do',
    fatherJob: seq % 2 === 0 ? 'Kỹ sư cơ khí' : 'Lao động tự do',
    motherJob: seq % 2 === 0 ? 'Giáo viên' : 'Kinh doanh tự do',
    emergencyPhone: `0912${String(200000 + seq).slice(-6)}`,
    workshopGroup: workshopGroup as 1 | 2,
    role: seq === 1 ? 'Lớp trưởng' : seq === 2 ? 'Tổ trưởng' : seq === 12 ? 'Tổ trưởng' : 'Thành viên',
    station,
    policy: 'Miễn giảm 70% (NĐ 238/2025)',
    tuitionStatus: {
      standardTuition: 7500000,
      governmentSubsidy: 5250000,
      studentPayable,
      paidAmount,
      debtAmount,
      isComplete
    },
    academicStatus: seq === 5 ? 'Cảnh báo học vụ' : 'Đang học bình thường',
    teacherNotes: isComplete ? 'Chấp hành tốt nội quy xưởng và quy định đào tạo.' : 'Nhắc nhở hoàn thành học phí học kỳ.',
    attendanceRate: seq === 8 ? 85.0 : 100,
    classId: 'CĐK19.2-OT1.CLC'
  };
});

export const INITIAL_GRADES: StudentGrade[] = [];
export const INITIAL_REN_LUYEN: RenLuyenCriteria[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_FUND_TRANSACTIONS: FundTransaction[] = [];
export const INITIAL_WORKSHOP_LOGS: WorkshopSafetyLog[] = [];
