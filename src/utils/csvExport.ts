import { Student, StudentGrade, SubjectModule, AttendanceRecord, RenLuyenCriteria } from '../types';

/**
 * Escapes a field for CSV according to RFC 4180
 * Handles commas, quotes, newlines, null, undefined
 */
export const escapeCSV = (val: any): string => {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // Double any existing double quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
};

/**
 * Downloads a string content as a UTF-8 CSV file with BOM for Microsoft Excel compatibility
 */
export const downloadCSV = (filename: string, csvContent: string): void => {
  // UTF-8 BOM (\uFEFF) ensures Vietnamese accents display correctly in Excel
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Calculates academic grade on 10-scale and converts to 4-scale & letter grade according to GDNN regulations
 */
export const calculateModuleGrade = (grade?: StudentGrade) => {
  if (!grade) {
    return {
      reg1: 0,
      reg2: 0,
      mid: 0,
      exam: 0,
      grade10: 0,
      grade4: 0,
      letter: 'F',
      status: 'Chưa có điểm'
    };
  }

  const reg1 = grade.regularScore1 || 0;
  const reg2 = grade.regularScore2 || 0;
  const mid = grade.midtermScore || 0;
  const exam = grade.finalExamScore || 0;

  // GDNN weight: TX1 (1) + TX2 (1) + Midterm (2) + Exam (3) = 7
  const totalWeight = 7;
  const grade10 = Number(((reg1 * 1 + reg2 * 1 + mid * 2 + exam * 3) / totalWeight).toFixed(1));

  let grade4 = 0;
  let letter = 'F';
  if (grade10 >= 8.5) { grade4 = 4.0; letter = 'A'; }
  else if (grade10 >= 8.0) { grade4 = 3.5; letter = 'B+'; }
  else if (grade10 >= 7.0) { grade4 = 3.0; letter = 'B'; }
  else if (grade10 >= 6.5) { grade4 = 2.5; letter = 'C+'; }
  else if (grade10 >= 5.5) { grade4 = 2.0; letter = 'C'; }
  else if (grade10 >= 5.0) { grade4 = 1.5; letter = 'D+'; }
  else if (grade10 >= 4.0) { grade4 = 1.0; letter = 'D'; }
  else { grade4 = 0.0; letter = 'F'; }

  const status = grade10 >= 5.0 ? 'Đạt' : grade10 >= 4.0 ? 'Thi lại' : 'Học lại';

  return { reg1, reg2, mid, exam, grade10, grade4, letter, status };
};

/**
 * 1. Exports student roster with standard 23 demographic/operational fields
 */
export const exportStudentListToCSV = (students: Student[], className: string = 'ToanKhoa'): void => {
  const headers = [
    'STT',
    'Mã HSSV (MSSV)',
    'Họ và Tên',
    'Giới Tính',
    'Ngày Sinh (DD/MM/YYYY)',
    'Dân Tộc',
    'Số CCCD',
    'Số Điện Thoại',
    'Email',
    'Lớp Học',
    'Hộ Khẩu Thường Trú',
    'Địa Chỉ Tạm Trú / KTX',
    'Họ Tên Bố',
    'SĐT Bố',
    'Họ Tên Mẹ',
    'SĐT Mẹ',
    'Nghề Nghiệp Phụ Huynh',
    'SĐT Liên Hệ Khẩn Cấp',
    'Tổ Xưởng Thực Hành',
    'Chức Vụ Tổ Xưởng',
    'Vị Trí Thực Hành Xưởng',
    'Chức Vụ Lớp',
    'Diện Chính Sách (Miễn Giảm Học Phí)',
    'Tình Trạng Học Tập',
    'Ghi Chú Sư Phạm Của GVCN'
  ];

  const rows: string[] = [];
  rows.push(headers.map(escapeCSV).join(','));

  students.forEach((s, idx) => {
    const row = [
      idx + 1,
      s.id || '',
      s.fullName || '',
      s.gender || 'Nam',
      s.birthDate || s.dob || '',
      s.ethnicity || 'Kinh',
      s.idCard || s.cccd || '',
      s.phone || '',
      s.email || '',
      s.classId || className,
      s.permanentAddress || '',
      s.temporaryAddress || '',
      s.fatherName || '',
      s.fatherPhone || '',
      s.motherName || '',
      s.motherPhone || '',
      s.parentJob || s.fatherJob || '',
      s.emergencyPhone || s.phone || '',
      `Tổ ${s.workshopGroup || 1}`,
      s.workshopRole || 'Thành viên',
      s.station || 'Cầu nâng 2 trụ',
      s.role || 'HSSV',
      s.policy || 'Bình thường',
      s.academicStatus || 'Đang học bình thường',
      s.teacherNotes || ''
    ];
    rows.push(row.map(escapeCSV).join(','));
  });

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const filename = `DanhSach_SinhVien_${className.replace(/[^a-zA-Z0-9_-]/g, '_')}_${dateStr}.csv`;

  downloadCSV(filename, rows.join('\r\n'));
};

/**
 * 2. Exports detailed academic report and grades per student & module
 */
export const exportAcademicReportToCSV = (
  students: Student[],
  modules: SubjectModule[],
  grades: StudentGrade[],
  attendance: AttendanceRecord[] = [],
  renLuyen: RenLuyenCriteria[] = [],
  className: string = 'ToanKhoa'
): void => {
  const headers = [
    'STT',
    'Mã HSSV',
    'Họ và Tên',
    'Lớp Học',
    'Mã Mô Đun',
    'Tên Mô Đun',
    'Số Tín Chỉ',
    'Điểm Thường Xuyên 1',
    'Điểm Thường Xuyên 2',
    'Điểm Định Kỳ (Hệ Số 2)',
    'Điểm Thi Kết Thúc (Hệ Số 3)',
    'Điểm Tổng Kết (Hệ 10)',
    'Điểm Quy Đổi (Hệ 4)',
    'Điểm Chữ (A/B/C/D/F)',
    'Đánh Giá Kết Quả',
    'Số Buổi Vắng Lớp',
    'Tỷ Lệ Vắng (%)',
    'Cảnh Báo Cấm Thi (>20%)',
    'Điểm Rèn Luyện (ĐRL)',
    'Xếp Loại Rèn Luyện'
  ];

  const rows: string[] = [];
  rows.push(headers.map(escapeCSV).join(','));

  let stt = 1;

  students.forEach((s) => {
    // Find Ren Luyen score
    const rl = renLuyen.find(r => String(r.studentId).trim() === String(s.id).trim());
    const rlScore = rl?.totalScore ?? 85;
    let rlRank = 'Tốt';
    if (rlScore >= 90) rlRank = 'Xuất sắc';
    else if (rlScore >= 80) rlRank = 'Tốt';
    else if (rlScore >= 65) rlRank = 'Khá';
    else if (rlScore >= 50) rlRank = 'Trung bình';
    else rlRank = 'Yếu';

    // Total absences for student
    const studentAbsences = attendance.filter(
      a => String(a.studentId).trim() === String(s.id).trim() && (a.status === 'A' || a.status === 'L')
    ).length;

    // Filter modules for this class if specified
    const targetModules = modules.length > 0 ? modules : [
      { id: 'MĐ01', name: 'Công nghệ Khung gầm Ô tô', credits: 4, totalHours: 60, theoryHours: 20, practiceHours: 40, semester: 1 },
      { id: 'MĐ02', name: 'Động cơ đốt trong và Hệ thống EFI', credits: 4, totalHours: 60, theoryHours: 20, practiceHours: 40, semester: 1 },
      { id: 'MĐ03', name: 'Hệ thống Điện - Điện tử Ô tô', credits: 3, totalHours: 45, theoryHours: 15, practiceHours: 30, semester: 1 }
    ];

    targetModules.forEach((m) => {
      const g = grades.find(gr => String(gr.studentId).trim() === String(s.id).trim() && gr.moduleId === m.id);
      const calc = calculateModuleGrade(g);

      // Estimated absence rate in this module
      const moduleTotalSessions = Math.ceil(m.totalHours / 4) || 15;
      const moduleAbsences = Math.min(studentAbsences, moduleTotalSessions);
      const absenceRate = Number(((moduleAbsences / moduleTotalSessions) * 100).toFixed(1));
      const isBannedExam = absenceRate > 20.0 ? 'CẤM THI (Vắng > 20%)' : 'Đủ điều kiện dự thi';

      const row = [
        stt++,
        s.id,
        s.fullName,
        s.classId || className,
        m.id,
        m.name,
        m.credits,
        calc.reg1,
        calc.reg2,
        calc.mid,
        calc.exam,
        calc.grade10,
        calc.grade4,
        calc.letter,
        calc.status,
        moduleAbsences,
        `${absenceRate}%`,
        isBannedExam,
        rlScore,
        rlRank
      ];
      rows.push(row.map(escapeCSV).join(','));
    });
  });

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const filename = `BaoCao_HocVu_BangDiem_${className.replace(/[^a-zA-Z0-9_-]/g, '_')}_${dateStr}.csv`;

  downloadCSV(filename, rows.join('\r\n'));
};

/**
 * 3. Exports comprehensive academic summary per student (GPA, Classification, Attendance, Discipline, Scholarship)
 */
export const exportComprehensiveSummaryToCSV = (
  students: Student[],
  modules: SubjectModule[],
  grades: StudentGrade[],
  attendance: AttendanceRecord[] = [],
  renLuyen: RenLuyenCriteria[] = [],
  className: string = 'ToanKhoa'
): void => {
  const headers = [
    'STT',
    'Mã HSSV',
    'Họ và Tên',
    'Giới Tính',
    'Lớp Học',
    'Tổ Xưởng Thực Hành',
    'Chức Vụ',
    'Diện Miễn Giảm 70% Học Phí',
    'Điểm Trung Bình (GPA Hệ 10)',
    'Điểm Tích Lũy (GPA Hệ 4)',
    'Xếp Loại Học Lực',
    'Tổng Số Môn Đã Đánh Giá',
    'Số Môn Đạt',
    'Số Môn Nợ / Thi Lại',
    'Tổng Số Buổi Nghỉ',
    'Tỷ Lệ Vắng Tổng Thể (%)',
    'Nguy Cơ Cấm Thi',
    'Điểm Rèn Luyện (ĐRL)',
    'Xếp Loại Rèn Luyện',
    'Xét Học Bổng Khuyến Khích (KKHN)',
    'Tình Trạng Học Vụ Tổng Thể'
  ];

  const rows: string[] = [];
  rows.push(headers.map(escapeCSV).join(','));

  const targetModules = modules.length > 0 ? modules : [
    { id: 'MĐ01', name: 'Công nghệ Khung gầm Ô tô', credits: 4, totalHours: 60, theoryHours: 20, practiceHours: 40, semester: 1 },
    { id: 'MĐ02', name: 'Động cơ đốt trong và Hệ thống EFI', credits: 4, totalHours: 60, theoryHours: 20, practiceHours: 40, semester: 1 },
    { id: 'MĐ03', name: 'Hệ thống Điện - Điện tử Ô tô', credits: 3, totalHours: 45, theoryHours: 15, practiceHours: 30, semester: 1 }
  ];

  students.forEach((s, idx) => {
    // 1. Calculate GPA across modules
    const studentGrades = targetModules.map(m => {
      const g = grades.find(gr => String(gr.studentId).trim() === String(s.id).trim() && gr.moduleId === m.id);
      return { module: m, calc: calculateModuleGrade(g) };
    });

    const evaluatedGrades = studentGrades.filter(sg => sg.calc.status !== 'Chưa có điểm');
    const totalCredits = evaluatedGrades.reduce((acc, curr) => acc + (curr.module.credits || 3), 0);
    const weightedSum10 = evaluatedGrades.reduce((acc, curr) => acc + (curr.calc.grade10 * (curr.module.credits || 3)), 0);
    const weightedSum4 = evaluatedGrades.reduce((acc, curr) => acc + (curr.calc.grade4 * (curr.module.credits || 3)), 0);

    const gpa10 = totalCredits > 0 ? Number((weightedSum10 / totalCredits).toFixed(2)) : 0;
    const gpa4 = totalCredits > 0 ? Number((weightedSum4 / totalCredits).toFixed(2)) : 0;

    let academicRank = 'Chưa xếp loại';
    if (gpa4 >= 3.60) academicRank = 'Xuất sắc';
    else if (gpa4 >= 3.20) academicRank = 'Giỏi';
    else if (gpa4 >= 2.50) academicRank = 'Khá';
    else if (gpa4 >= 2.00) academicRank = 'Trung bình';
    else if (gpa4 >= 1.00) academicRank = 'Yếu';
    else academicRank = 'Kém';

    const passedCount = studentGrades.filter(sg => sg.calc.grade10 >= 5.0).length;
    const backlogCount = studentGrades.filter(sg => sg.calc.grade10 < 5.0 && sg.calc.status !== 'Chưa có điểm').length;

    // 2. Attendance
    const studentAbsences = attendance.filter(
      a => String(a.studentId).trim() === String(s.id).trim() && (a.status === 'A' || a.status === 'L')
    ).length;
    const totalSessions = 45; // Standard semester sessions benchmark
    const overallAbsenceRate = Number(((studentAbsences / totalSessions) * 100).toFixed(1));
    const isAtRiskOfBan = overallAbsenceRate > 20.0 ? 'CẢNH BÁO NGUY CƠ CẤM THI' : 'Bình thường';

    // 3. Ren Luyen
    const rl = renLuyen.find(r => String(r.studentId).trim() === String(s.id).trim());
    const rlScore = rl?.totalScore ?? 85;
    let rlRank = 'Tốt';
    if (rlScore >= 90) rlRank = 'Xuất sắc';
    else if (rlScore >= 80) rlRank = 'Tốt';
    else if (rlScore >= 65) rlRank = 'Khá';
    else if (rlScore >= 50) rlRank = 'Trung bình';
    else rlRank = 'Yếu';

    // 4. Scholarship eligibility (BLĐTBXH regulations)
    let scholarship = 'Không đủ ĐK';
    if (backlogCount === 0) {
      if (gpa4 >= 3.60 && rlScore >= 90) scholarship = 'Học Bổng Xuất Sắc';
      else if (gpa4 >= 3.20 && rlScore >= 80) scholarship = 'Học Bổng Giỏi';
      else if (gpa4 >= 2.50 && rlScore >= 65) scholarship = 'Học Bổng Khá';
    }

    const row = [
      idx + 1,
      s.id,
      s.fullName,
      s.gender || 'Nam',
      s.classId || className,
      `Tổ ${s.workshopGroup || 1}`,
      s.role || 'HSSV',
      s.policy?.includes('238') || s.policy?.includes('70%') ? 'Có (Miễn giảm 70%)' : 'Không',
      gpa10,
      gpa4,
      academicRank,
      evaluatedGrades.length,
      passedCount,
      backlogCount,
      studentAbsences,
      `${overallAbsenceRate}%`,
      isAtRiskOfBan,
      rlScore,
      rlRank,
      scholarship,
      s.academicStatus || (backlogCount > 0 ? 'Nợ môn' : 'Đang học bình thường')
    ];
    rows.push(row.map(escapeCSV).join(','));
  });

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const filename = `BaoCao_TongHop_Offline_${className.replace(/[^a-zA-Z0-9_-]/g, '_')}_${dateStr}.csv`;

  downloadCSV(filename, rows.join('\r\n'));
};
