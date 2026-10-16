import React, { useState, useMemo } from 'react';
import { 
  Search, 
  User, 
  Award, 
  Calendar, 
  AlertCircle,
  AlertTriangle, 
  CheckCircle2, 
  Wallet, 
  FileText, 
  Phone, 
  Mail, 
  Home, 
  BookOpen,
  Printer,
  GraduationCap,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { Student, StudentGrade, SubjectModule, AttendanceRecord, RenLuyenCriteria, UnitInfoSettings, ClassItem, ThemeSettings } from '../types';

interface StudentPortalModuleProps {
  students: Student[];
  modules: SubjectModule[];
  grades: StudentGrade[];
  attendance: AttendanceRecord[];
  renLuyen: RenLuyenCriteria[];
  unitInfo?: UnitInfoSettings;
  classes?: ClassItem[];
  themeSettings?: ThemeSettings;
  onBackToLogin?: () => void;
  isStandalonePublic?: boolean;
}

export const StudentPortalModule: React.FC<StudentPortalModuleProps> = ({
  students,
  modules,
  grades,
  attendance,
  renLuyen,
  unitInfo,
  classes = [],
  themeSettings,
  onBackToLogin,
  isStandalonePublic = false
}) => {
  // Bộ lọc tìm kiếm
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchKey, setSearchKey] = useState<string>('25OT1001');
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'attendance' | 'renluyen' | 'tuition' | 'scholarship'>('overview');

  // Tìm kiếm sinh viên
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(() => {
    return students.find(s => s && s.id === '25OT1001') || students[0] || null;
  });

  const getInitial = (name?: string) => {
    if (!name || typeof name !== 'string') return 'SV';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1][0].toUpperCase() : 'SV';
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const key = searchKey.trim().toLowerCase();
    if (!key) {
      setSearchedStudent(null);
      return;
    }

    const cleanDigits = key.replace(/[^0-9]/g, '');

    // Tìm kiếm trong danh sách sinh viên (xét cả lớp đã lọc hoặc toàn bộ sinh viên)
    const candidates = selectedClassFilter === 'all' 
      ? students 
      : students.filter(s => s.classId === selectedClassFilter);

    const found = candidates.find(s => {
      if (!s) return false;
      const sId = (s.id || '').toLowerCase();
      const sCccd = (s.idCard || '').toLowerCase();
      const sName = (s.fullName || '').toLowerCase();
      const sPhone = (s.phone || '').replace(/[^0-9]/g, '');
      const sFatherPhone = (s.fatherPhone || '').replace(/[^0-9]/g, '');
      const sMotherPhone = (s.motherPhone || '').replace(/[^0-9]/g, '');
      const sEmergency = (s.emergencyPhone || '').replace(/[^0-9]/g, '');

      return (
        sId === key ||
        sCccd === key ||
        sName.includes(key) ||
        (cleanDigits.length >= 4 && (
          sPhone.includes(cleanDigits) || 
          sFatherPhone.includes(cleanDigits) || 
          sMotherPhone.includes(cleanDigits) || 
          sEmergency.includes(cleanDigits)
        ))
      );
    });

    setSearchedStudent(found || null);
  };

  // Thông tin lớp học của sinh viên
  const studentClass = useMemo(() => {
    if (!searchedStudent) return null;
    return classes.find(c => c.id === searchedStudent.classId);
  }, [classes, searchedStudent]);

  // Dữ liệu học tập của sinh viên
  const studentGrades = useMemo(() => {
    if (!searchedStudent?.id) return [];
    return grades.filter(g => g.studentId === searchedStudent.id);
  }, [grades, searchedStudent]);

  // Tính GPA và xếp loại học tập theo TT 04/2022
  const gpaStats = useMemo(() => {
    if (studentGrades.length === 0) return { gpa10: 0, gpa4: 0, rank: 'Chưa có điểm', failedCount: 0, totalCredits: 0 };
    
    let totalScore10 = 0;
    let totalScore4 = 0;
    let failed = 0;
    let credits = 0;

    studentGrades.forEach(g => {
      const mod = modules.find(m => m.id === g.moduleId);
      const modCredits = mod?.credits || 3;
      credits += modCredits;
      totalScore10 += (g.finalGrade10 || 0) * modCredits;
      totalScore4 += (g.finalGrade4 || 0) * modCredits;
      if (g.finalGrade10 < 5.0 || g.letterGrade === 'F') {
        failed++;
      }
    });

    const gpa10 = credits > 0 ? totalScore10 / credits : 0;
    const gpa4 = credits > 0 ? totalScore4 / credits : 0;

    let rank = 'Yếu';
    if (gpa4 >= 3.60) rank = 'Xuất sắc';
    else if (gpa4 >= 3.20) rank = 'Giỏi';
    else if (gpa4 >= 2.50) rank = 'Khá';
    else if (gpa4 >= 2.00) rank = 'Trung bình';

    return {
      gpa10: Math.round(gpa10 * 100) / 100,
      gpa4: Math.round(gpa4 * 100) / 100,
      rank,
      failedCount: failed,
      totalCredits: credits
    };
  }, [studentGrades, modules]);

  // Dữ liệu điểm danh của sinh viên
  const studentAttendance = useMemo(() => {
    if (!searchedStudent?.id) return [];
    return attendance.filter(a => a.studentId === searchedStudent.id);
  }, [attendance, searchedStudent]);

  // Thống kê chuyên cần & cảnh báo cấm thi theo TT 04/2022
  const attendanceStats = useMemo(() => {
    const totalSessions = studentAttendance.length;
    if (totalSessions === 0) {
      return {
        present: 0,
        excused: 0,
        unexcused: 0,
        late: 0,
        attendanceRate: 100,
        isBarred: false,
        isWarning: false
      };
    }

    let present = 0;
    let excused = 0;
    let unexcused = 0;
    let late = 0;

    studentAttendance.forEach(a => {
      if (a.status === 'P') present++;
      else if (a.status === 'L') excused++;
      else if (a.status === 'A') unexcused++;
      else if (a.status === 'LATE') late++;
    });

    const absentSessions = excused + unexcused;
    const absentRate = totalSessions > 0 ? (absentSessions / totalSessions) * 100 : 0;
    const attendanceRate = 100 - absentRate;

    // Theo Điều 14 Thông tư 04/2022/TT-BLĐTBXH: Nghỉ quá 20% tổng số giờ bị cấm thi
    const isBarred = absentRate > 20;
    const isWarning = absentRate >= 15 && absentRate <= 20;

    return {
      present,
      excused,
      unexcused,
      late,
      attendanceRate: Math.round(attendanceRate),
      absentRate: Math.round(absentRate),
      isBarred,
      isWarning
    };
  }, [studentAttendance]);

  // Dữ liệu rèn luyện của sinh viên (BM01)
  const studentRenLuyen = useMemo(() => {
    if (!searchedStudent?.id) return null;
    return renLuyen.find(r => r.studentId === searchedStudent.id);
  }, [renLuyen, searchedStudent]);

  // Xét duyệt học bổng KKHN theo Thông tư & QĐ 53/2015
  const scholarshipStatus = useMemo(() => {
    if (!searchedStudent || studentGrades.length === 0) return null;
    const drl = studentRenLuyen?.totalScore || 80;
    const gpa = gpaStats.gpa4;
    const hasFail = gpaStats.failedCount > 0;

    if (hasFail) {
      return { eligible: false, type: 'Không đạt', reason: 'Còn môn học có điểm F / thi lại.' };
    }

    if (gpa >= 3.60 && drl >= 90) {
      return { eligible: true, type: 'Học bổng Xuất sắc', grant: '1.400.000 đ/tháng', reason: 'GPA ≥ 3.60 và ĐRL ≥ 90 điểm.' };
    }
    if (gpa >= 3.20 && drl >= 80) {
      return { eligible: true, type: 'Học bổng Giỏi', grant: '1.200.000 đ/tháng', reason: 'GPA ≥ 3.20 và ĐRL ≥ 80 điểm.' };
    }
    if (gpa >= 2.50 && drl >= 65) {
      return { eligible: true, type: 'Học bổng Khá', grant: '1.000.000 đ/tháng', reason: 'GPA ≥ 2.50 và ĐRL ≥ 65 điểm.' };
    }

    return { eligible: false, type: 'Không đạt', reason: 'Chưa đủ định ngạch điểm GPA hoặc Điểm rèn luyện.' };
  }, [searchedStudent, studentGrades, studentRenLuyen, gpaStats]);

  // Lấy mẫu sinh viên gợi ý
  const sampleStudents = useMemo(() => {
    return students.slice(0, 5);
  }, [students]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen p-3 sm:p-6 overflow-y-auto space-y-4">
      {/* Top Banner & Header Bar */}
      <div className="bg-gradient-to-r from-[#01427a] via-[#02569b] to-[#0277bd] text-white p-5 rounded-2xl shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider bg-yellow-400 text-slate-900 px-2.5 py-0.5 rounded-full font-black">
                CỔNG THÔNG TIN ĐIỆN TỬ DÀNH CHO PHỤ HUYNH & HSSV
              </span>
              <span className="text-[11px] bg-white/15 text-sky-100 px-2 py-0.5 rounded-full font-medium">
                Tra cứu không cần đăng nhập
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {themeSettings?.schoolName || unitInfo?.schoolName || 'TRƯỜNG CAO ĐẲNG NGHỀ CÔNG NGHỆ CAO'}
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 font-medium">
              {themeSettings?.facultyName || unitInfo?.facultyName || 'KHOA CÔNG NGHỆ Ô TÔ'} • Tra cứu Kết quả học tập, Chuyên cần xưởng, Rèn luyện & Học phí
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            {searchedStudent && (
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-yellow-300" />
                <span>In phiếu kết quả</span>
              </button>
            )}

            {isStandalonePublic && onBackToLogin && (
              <button
                type="button"
                onClick={onBackToLogin}
                className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Đăng nhập Cán bộ / GVCN</span>
              </button>
            )}
          </div>
        </div>

        {/* Form Tra Cứu */}
        <div className="mt-5 pt-4 border-t border-white/20">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Lọc theo lớp (tùy chọn) */}
            <div className="sm:w-48 shrink-0">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="w-full p-2.5 bg-white text-slate-800 rounded-xl text-xs font-bold border border-sky-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="all">-- Tất cả các lớp --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ô nhập thông tin tìm kiếm */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder="Nhập Mã sinh viên (VD: 25OT1001), CCCD, Số điện thoại hoặc Họ tên..."
                className="w-full pl-9 pr-3 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold placeholder:text-slate-400 border border-sky-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-900 rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>TRA CỨU NGAY</span>
            </button>
          </form>

          {/* Mẫu tra cứu nhanh (Quick search chips) */}
          <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px] text-sky-100">
            <span className="font-semibold text-yellow-300">Gợi ý tra cứu nhanh:</span>
            {sampleStudents.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSearchKey(s.id);
                  setSearchedStudent(s);
                }}
                className="px-2 py-0.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-white font-medium cursor-pointer transition"
              >
                {s.id} ({s.fullName})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kết quả Tra Cứu */}
      {!searchedStudent ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <User className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy dữ liệu sinh viên</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Không tìm thấy kết quả phù hợp với từ khóa <strong className="text-slate-700 font-mono">"{searchKey}"</strong>. 
            Vui lòng kiểm tra lại chính xác Mã sinh viên (MSSV), Căn cước công dân hoặc Số điện thoại.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Card Hồ sơ Sinh viên & GVCN Cố Vấn */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                {getInitial(searchedStudent.fullName)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {searchedStudent.fullName}
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-black text-xs rounded-md font-mono">
                    {searchedStudent.id}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-md">
                    {searchedStudent.classId}
                  </span>
                </div>

                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>Hệ: <strong>{studentClass?.trainingSystem || 'Cao Đẳng Chính Quy'}</strong></span>
                  <span>Ngành: <strong>{studentClass?.major || 'Công nghệ Kỹ thuật Ô tô'}</strong></span>
                  <span>Khóa: <strong>{studentClass?.academicYear || '2023 - 2026'}</strong></span>
                  <span>Tổ xưởng: <strong className="text-blue-700">Tổ {searchedStudent.workshopGroup || 1}</strong></span>
                  <span>Vị trí: <strong>{searchedStudent.station || 'Bàn tháo lắp động cơ EFI'}</strong></span>
                </div>

                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-0.5 pt-0.5">
                  <span>CCCD: <strong className="font-mono">{searchedStudent.idCard || 'Đang cập nhật'}</strong></span>
                  <span>Ngày sinh: <strong>{searchedStudent.birthDate || '01/01/2005'}</strong></span>
                  <span>Hộ khẩu: <strong>{searchedStudent.permanentAddress || 'Hà Nội'}</strong></span>
                  <span>Phụ huynh: <strong>{searchedStudent.fatherName || searchedStudent.motherName || 'Chưa cập nhật'} ({searchedStudent.fatherPhone || searchedStudent.motherPhone || searchedStudent.emergencyPhone || 'N/A'})</strong></span>
                </div>
              </div>
            </div>

            {/* Thông tin Cố vấn học tập / GVCN phụ trách */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 shrink-0 w-full lg:w-72">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="font-bold text-slate-700 text-[11px] uppercase flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" /> GVCN / CỐ VẤN HỌC TẬP:
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                  Khoa Ô tô
                </span>
              </div>
              <p className="font-bold text-slate-900 text-sm">
                {unitInfo?.advisorName || studentClass?.headTeacher || themeSettings?.authorName || 'ThS. Nguyễn Chí Dũng'}
              </p>
              <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Hotline/Zalo: <strong>{studentClass?.headTeacherPhone || themeSettings?.authorPhone || '0865.074.668'}</strong></span>
              </p>
              <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Email: <strong>{studentClass?.headTeacherEmail || 'nguyenchidung1278@gmail.com'}</strong></span>
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tổng quan học vụ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('grades')}
              className={`px-3.5 py-2 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'grades'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bảng điểm học kỳ ({studentGrades.length} môn)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={`px-3.5 py-2 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'attendance'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Chuyên cần & Cảnh báo cấm thi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('renluyen')}
              className={`px-3.5 py-2 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'renluyen'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Đánh giá rèn luyện (BM01)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('scholarship')}
              className={`px-3.5 py-2 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'scholarship'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Học bổng KKHN</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tuition')}
              className={`px-3.5 py-2 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'tuition'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Học phí & Giảm 70% NĐ 238</span>
            </button>
          </div>

          {/* TAB 1: TỔNG QUAN HỌC VỤ */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* 3 Thẻ Chỉ số chính */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Học lực & Điểm số */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-black text-blue-700 text-xs uppercase flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-600" /> KẾT QUẢ HỌC TẬP
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">TT 04/2022</span>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-blue-900 block font-medium">Điểm trung bình tích lũy:</span>
                      <strong className="text-xl font-black text-blue-800">
                        {gpaStats.gpa4.toFixed(2)} <span className="text-xs font-semibold text-slate-500">/ 4.0</span>
                      </strong>
                      <span className="text-[11px] text-blue-700 block font-medium">
                        (Thang 10: {gpaStats.gpa10.toFixed(2)})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Xếp loại:</span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black inline-block ${
                        gpaStats.rank === 'Xuất sắc' ? 'bg-purple-100 text-purple-800' :
                        gpaStats.rank === 'Giỏi' ? 'bg-blue-100 text-blue-800' :
                        gpaStats.rank === 'Khá' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {gpaStats.rank}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Tổng số tín chỉ tích lũy:</span>
                      <strong className="text-slate-800">{gpaStats.totalCredits} TC</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Số môn nợ / thi lại:</span>
                      <strong className={gpaStats.failedCount > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                        {gpaStats.failedCount > 0 ? `${gpaStats.failedCount} môn (Cần thi lại)` : '0 môn (Đạt 100%)'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 2. Chuyên cần & Cảnh báo Cấm thi */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-black text-purple-700 text-xs uppercase flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-purple-600" /> CHUYÊN CẦN XƯỞNG
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">Quy định vắng ≤ 20%</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    attendanceStats.isBarred 
                      ? 'bg-rose-50 border-rose-300' 
                      : attendanceStats.isWarning 
                      ? 'bg-amber-50 border-amber-300' 
                      : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <div>
                      <span className="text-xs text-slate-700 block font-medium">Tỷ lệ chuyên cần:</span>
                      <strong className={`text-xl font-black ${
                        attendanceStats.isBarred ? 'text-rose-700' : attendanceStats.isWarning ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        {attendanceStats.attendanceRate}%
                      </strong>
                      <span className="text-[11px] text-slate-500 block">
                        (Nghỉ: {attendanceStats.excused + attendanceStats.unexcused} buổi)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Tình trạng thi:</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold inline-block ${
                        attendanceStats.isBarred 
                          ? 'bg-rose-600 text-white' 
                          : attendanceStats.isWarning 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {attendanceStats.isBarred 
                          ? 'CẤM THI' 
                          : attendanceStats.isWarning 
                          ? 'CẢNH BÁO' 
                          : 'Đủ điều kiện'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Có mặt: <strong>{attendanceStats.present} buổi</strong></span>
                      <span>Có phép: <strong>{attendanceStats.excused} buổi</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span>Không phép: <strong className={attendanceStats.unexcused > 0 ? 'text-rose-600' : 'text-slate-700'}>{attendanceStats.unexcused} buổi</strong></span>
                      <span>Đi muộn: <strong>{attendanceStats.late} buổi</strong></span>
                    </div>
                  </div>
                </div>

                {/* 3. Điểm Rèn luyện BM01 */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-black text-amber-700 text-xs uppercase flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-600" /> RÈN LUYỆN (BM01)
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">TT 17/2017</span>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-900 block font-medium">Điểm rèn luyện kỳ này:</span>
                      <strong className="text-xl font-black text-amber-800">
                        {studentRenLuyen?.totalScore || 85} <span className="text-xs font-semibold text-slate-500">/ 100đ</span>
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Xếp loại:</span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-200 text-amber-900 inline-block">
                        {studentRenLuyen?.rank || 'Tốt'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Học bổng KKHN:</span>
                      <strong className={scholarshipStatus?.eligible ? 'text-emerald-700' : 'text-slate-600'}>
                        {scholarshipStatus?.type || 'Đang xét duyệt'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Kỷ luật vi phạm:</span>
                      <strong className="text-emerald-700">Không có</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lời dặn Sư phạm của GVCN */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4.5 rounded-2xl border border-blue-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-blue-900 text-xs uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>LỜI DẶN SƯ PHẠM CỦA GIÁO VIÊN CHỦ NHIỆM ({unitInfo?.advisorName || 'ThS. Nguyễn Chí Dũng'}):</span>
                  </span>
                  <span className="text-[11px] text-blue-700 font-bold">Tháng hiện tại</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic bg-white/70 p-3 rounded-xl border border-blue-100">
                  "{searchedStudent.teacherNotes || 'Em có ý thức nề nếp và thực hành kỹ thuật tốt, cần tiếp tục duy trì chuyên cần và rèn luyện kỹ năng chẩn đoán ô tô.'}"
                </p>
                <div className="flex items-center justify-between text-[11px] text-blue-800 pt-1">
                  <span>Trường hợp cần tư vấn thêm, Phụ huynh vui lòng liên hệ GVCN theo số điện thoại: <strong>{studentClass?.headTeacherPhone || themeSettings?.authorPhone || '0865.074.668'}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BẢNG ĐIỂM CHI TIẾT */}
          {activeTab === 'grades' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-black text-slate-800 text-sm uppercase">
                    BẢNG ĐIỂM CHI TIẾT CÁC MÔ ĐUN / MÔN HỌC
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống tính điểm theo Quy chế đào tạo Thông tư 04/2022/TT-BLĐTBXH (Thang 10, Thang 4 & Điểm chữ).
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    GPA: {gpaStats.gpa4.toFixed(2)} / 4.0 ({gpaStats.rank})
                  </span>
                </div>
              </div>

              {studentGrades.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Chưa có dữ liệu điểm thi học kỳ của sinh viên này.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="p-3 border-b">STT</th>
                        <th className="p-3 border-b">Mã môn</th>
                        <th className="p-3 border-b">Tên Mô đun / Môn học</th>
                        <th className="p-3 border-b text-center">Số TC</th>
                        <th className="p-3 border-b text-center">TX (hs1)</th>
                        <th className="p-3 border-b text-center">ĐK (hs2)</th>
                        <th className="p-3 border-b text-center">Thi hết môn</th>
                        <th className="p-3 border-b text-center">Tổng kết (10)</th>
                        <th className="p-3 border-b text-center">Thang 4</th>
                        <th className="p-3 border-b text-center">Điểm chữ</th>
                        <th className="p-3 border-b text-center">Đánh giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentGrades.map((g, index) => {
                        const mod = modules.find(m => m.id === g.moduleId);
                        const isPass = (g.finalGrade10 || 0) >= 5.0 && g.letterGrade !== 'F';
                        return (
                          <tr key={g.moduleId} className="hover:bg-slate-50/80">
                            <td className="p-3 text-slate-500 font-mono text-center">{index + 1}</td>
                            <td className="p-3 font-mono font-bold text-blue-700">{g.moduleId}</td>
                            <td className="p-3 font-bold text-slate-800">{mod?.name || g.moduleId}</td>
                            <td className="p-3 text-center font-bold">{mod?.credits || 3}</td>
                            <td className="p-3 text-center">{g.regularScore1 ?? 8.0}</td>
                            <td className="p-3 text-center">{g.midtermScore ?? 8.0}</td>
                            <td className="p-3 text-center font-bold">{g.finalExamScore ?? 8.0}</td>
                            <td className="p-3 text-center font-black text-blue-800">{g.finalGrade10?.toFixed(1) ?? '8.0'}</td>
                            <td className="p-3 text-center font-bold text-slate-700">{g.finalGrade4?.toFixed(1) ?? '3.5'}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                                g.letterGrade === 'A' ? 'bg-purple-100 text-purple-800' :
                                g.letterGrade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                                g.letterGrade.startsWith('C') ? 'bg-emerald-100 text-emerald-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {g.letterGrade || 'B'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {isPass ? (
                                <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" /> Đạt
                                </span>
                              ) : (
                                <span className="text-rose-600 font-bold text-[11px] flex items-center justify-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" /> Thi lại
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHUYÊN CẦN & CẢNH BÁO CẤM THI */}
          {activeTab === 'attendance' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-black text-slate-800 text-sm uppercase">
                    NHẬT KÝ ĐIỂM DANH CHUYÊN CẦN XƯỞNG THỰC HÀNH
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Căn cứ Điều 14 Thông tư 04/2022/TT-BLĐTBXH: Sinh viên nghỉ học quá 20% tổng số giờ mô đun sẽ bị cấm thi kết thúc mô đun.
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    attendanceStats.isBarred 
                      ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                      : attendanceStats.isWarning 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {attendanceStats.isBarred ? '⛔ BỊ CẤM THI (Nghỉ > 20%)' : attendanceStats.isWarning ? '⚠️ NGUY CƠ CẤM THI' : '✓ ĐỦ ĐIỀU KIỆN DỰ THI'}
                  </span>
                </div>
              </div>

              {/* Status Banner */}
              {attendanceStats.isBarred && (
                <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">CẢNH BÁO QUAN TRỌNG TỪ GVCN:</strong>
                    <span>Sinh viên đã nghỉ học quá 20% thời lượng xưởng thực hành. Theo quy chế của Tổng cục GDNN, sinh viên không đủ điều kiện dự thi lần 1 và phải học lại mô đun. Kính đề nghị Quý Phụ huynh liên hệ khẩn cấp với GVCN.</span>
                  </div>
                </div>
              )}

              {/* Attendance Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-3 border-b">Ngày học</th>
                      <th className="p-3 border-b">Ca học</th>
                      <th className="p-3 border-b">Mô đun giảng dạy</th>
                      <th className="p-3 border-b">Vị trí xưởng</th>
                      <th className="p-3 border-b text-center">Trạng thái</th>
                      <th className="p-3 border-b">Ghi chú của Giảng viên</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          Chưa có bản ghi điểm danh nào trong học kỳ này.
                        </td>
                      </tr>
                    ) : (
                      studentAttendance.map((a, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="p-3 font-mono font-bold text-slate-800">{a.date}</td>
                          <td className="p-3">{a.shift === 'Sáng' ? 'Sáng (07h30 - 11h30)' : a.shift === 'Chiều' ? 'Chiều (13h00 - 17h00)' : 'Tối (17h30 - 21h00)'}</td>
                          <td className="p-3 font-bold text-blue-700">{a.moduleId}</td>
                          <td className="p-3 text-slate-600">{searchedStudent.station || 'Xưởng Động cơ'}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              a.status === 'P' ? 'bg-emerald-100 text-emerald-800' :
                              a.status === 'L' ? 'bg-amber-100 text-amber-800' :
                              a.status === 'A' ? 'bg-rose-100 text-rose-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {a.status === 'P' ? 'Có mặt' : a.status === 'L' ? 'Nghỉ có phép' : a.status === 'A' ? 'Nghỉ không phép' : 'Đi muộn'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 italic">{a.note || 'Thực hành đúng quy trình ATVSLĐ'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ĐÁNH GIÁ RÈN LUYỆN BM01 */}
          {activeTab === 'renluyen' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-black text-slate-800 text-sm uppercase">
                    KẾT QUẢ ĐÁNH GIÁ RÈN LUYỆN (BIỂU MẪU BM01)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Căn cứ Thông tư 17/2017/TT-BLĐTBXH: Đánh giá theo 5 tiêu chuẩn chuẩn mực thang 100 điểm.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    Tổng điểm: {studentRenLuyen?.totalScore || 85}đ - Loại: {studentRenLuyen?.rank || 'Tốt'}
                  </span>
                </div>
              </div>

              {/* 5 Tiêu chuẩn chi tiết */}
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">
                      Tiêu chí 1: Ý thức học tập và rèn luyện nghề nghiệp
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Đi học đúng giờ, chuẩn bị bài đầy đủ, chấp hành quy định thi cử (Tối đa 20 điểm)
                    </span>
                  </div>
                  <strong className="text-blue-700 font-bold text-sm">{studentRenLuyen?.criteria1 ?? 18} / 20đ</strong>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">
                      Tiêu chí 2: Ý thức chấp hành pháp luật & nội quy xưởng thực hành
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Đầy đủ bảo hộ lao động (giày, quần áo xưởng), an toàn thiết bị (Tối đa 25 điểm)
                    </span>
                  </div>
                  <strong className="text-blue-700 font-bold text-sm">{studentRenLuyen?.criteria2 ?? 22} / 25đ</strong>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">
                      Tiêu chí 3: Tham gia các hoạt động chính trị - xã hội, văn thể mỹ
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Tham gia hoạt động phong trào Đoàn Thanh niên, Hội sinh viên (Tối đa 20 điểm)
                    </span>
                  </div>
                  <strong className="text-blue-700 font-bold text-sm">{studentRenLuyen?.criteria3 ?? 16} / 20đ</strong>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">
                      Tiêu chí 4: Phẩm chất công dân và quan hệ cộng đồng
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Đoàn kết, giúp đỡ bạn bè trong tổ xưởng, lối sống lành mạnh (Tối đa 25 điểm)
                    </span>
                  </div>
                  <strong className="text-blue-700 font-bold text-sm">{studentRenLuyen?.criteria4 ?? 21} / 25đ</strong>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">
                      Tiêu chí 5: Ý thức tham gia phụ trách lớp, đoàn thể, thành tích đặc biệt
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Tổ trưởng, cán sự lớp, khen thưởng hội thi tay nghề (Tối đa 10 điểm)
                    </span>
                  </div>
                  <strong className="text-blue-700 font-bold text-sm">{studentRenLuyen?.criteria5 ?? 8} / 10đ</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HỌC BỔNG KHUYẾN KHÍCH HỌC NGHỀ */}
          {activeTab === 'scholarship' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-black text-slate-800 text-sm uppercase">
                    XÉT DUYỆT HỌC BỔNG KHUYẾN KHÍCH HỌC NGHỀ (KKHN)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Căn cứ Quyết định số 53/2015/QĐ-TTg & Thông tư 04/2022/TT-BLĐTBXH.
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    scholarshipStatus?.eligible ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {scholarshipStatus?.type}
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${
                scholarshipStatus?.eligible ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  {scholarshipStatus?.eligible ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Info className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                  <h5 className="font-bold text-sm">
                    {scholarshipStatus?.eligible 
                      ? `ĐỦ TIÊU CHUẨN XÉT HỌC BỔNG: ${scholarshipStatus.type}` 
                      : 'CHƯA ĐỦ ĐIỀU KIỆN XÉT HỌC BỔNG HỌC KỲ NÀY'}
                  </h5>
                </div>
                <p className="text-xs leading-relaxed">
                  {scholarshipStatus?.reason}
                </p>
                {scholarshipStatus?.eligible && (
                  <div className="mt-2 p-2.5 bg-white/80 rounded-lg text-xs font-semibold text-emerald-800 flex justify-between">
                    <span>Mức hỗ trợ dự kiến:</span>
                    <strong className="text-emerald-700 font-mono text-sm">{scholarshipStatus.grant}</strong>
                  </div>
                )}
              </div>

              {/* Bảng Tiêu chuẩn Học bổng */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-800 uppercase block">Tiêu chuẩn phân loại học bổng:</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Loại Xuất sắc:</strong> Điểm GPA ≥ 3.60 và Điểm rèn luyện ≥ 90 điểm, không có môn thi lại.</li>
                  <li><strong>Loại Giỏi:</strong> Điểm GPA ≥ 3.20 và Điểm rèn luyện ≥ 80 điểm, không có môn thi lại.</li>
                  <li><strong>Loại Khá:</strong> Điểm GPA ≥ 2.50 và Điểm rèn luyện ≥ 65 điểm, không có môn thi lại.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 6: HỌC PHÍ & NGHỊ ĐỊNH 238 */}
          {activeTab === 'tuition' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-black text-slate-800 text-sm uppercase">
                    CHÍNH SÁCH HỌC PHÍ & MIỄN GIẢM 70% (NGHỊ ĐỊNH 238/2025/NĐ-CP)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Áp dụng cho ngành nghề nặng nhọc, độc hại và nguy hiểm ngành Công nghệ Kỹ thuật Ô tô.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Nghị định 238/2025
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-slate-500">Định mức học phí kỳ:</span>
                  <strong className="block text-base font-black text-slate-900 font-mono">7.500.000 đ</strong>
                  <span className="text-[11px] text-slate-400">Theo quy định cơ sở GDNN</span>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                  <span className="text-emerald-800 font-bold">Nhà nước cấp bù 70%:</span>
                  <strong className="block text-base font-black text-emerald-700 font-mono">-5.250.000 đ</strong>
                  <span className="text-[11px] text-emerald-600">Nghề nặng nhọc độc hại</span>
                </div>

                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-xs space-y-1">
                  <span className="text-blue-900 font-bold">Số tiền thực nộp:</span>
                  <strong className="block text-base font-black text-blue-800 font-mono">2.250.000 đ</strong>
                  <span className="text-[11px] text-blue-600">Phụ huynh/Sinh viên nộp</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border text-center ${
                searchedStudent.tuitionStatus?.debtAmount === 0 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' 
                  : 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
              }`}>
                {searchedStudent.tuitionStatus?.debtAmount === 0 ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>✓ ĐÃ HOÀN THÀNH 100% NGHĨA VỤ HỌC PHÍ HỌC KỲ</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                    <span>CÒN NỢ HỌC PHÍ: {(searchedStudent.tuitionStatus?.debtAmount ?? 2250000).toLocaleString()} VNĐ</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
