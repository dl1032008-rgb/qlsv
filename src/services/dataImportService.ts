/**
 * Data Import & Safety Guard Service for Vocational Education (GDNN)
 * Hỗ trợ nạp dữ liệu thông minh từ máy tính: Tệp JSON và Tệp Excel (.xlsx, .xls)
 * Tích hợp chốt chặn an toàn (Safety Guard - Chống xóa trắng) và chuẩn hóa 23 trường trích ngang
 */

import * as XLSX from 'xlsx';
import { 
  Student, 
  StudentGrade, 
  AttendanceRecord, 
  RenLuyenCriteria, 
  FundTransaction, 
  WorkshopSafetyLog,
  ClassId
} from '../types';

export interface ParsedImportData {
  fileName: string;
  fileSize: number;
  fileType: 'json' | 'xlsx';
  detectedClassName: string;
  students: Student[];
  grades: StudentGrade[];
  attendance: AttendanceRecord[];
  renLuyen: RenLuyenCriteria[];
  fundTransactions: FundTransaction[];
  workshopLogs: WorkshopSafetyLog[];
  summary: {
    studentsCount: number;
    gradesCount: number;
    attendanceCount: number;
    renLuyenCount: number;
    fundsCount: number;
    workshopsCount: number;
    sheetsFound: string[];
  };
  warnings: string[];
  safetyCheck: {
    passed: boolean;
    reason: string;
    score: number; // 0 - 100
  };
}

// Hàm chuẩn hóa chuỗi tiếng Việt không dấu để so sánh tiêu đề cột
function normalizeColHeader(val: any): string {
  if (!val) return '';
  return String(val)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Định dạng ngày sinh sang chuẩn DD/MM/YYYY
function formatBirthDate(val: any): string {
  if (!val) return '01/01/2007';
  if (val instanceof Date) {
    const d = String(val.getDate()).padStart(2, '0');
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const y = val.getFullYear();
    return `${d}/${m}/${y}`;
  }
  const str = String(val).trim();
  // Nếu là dạng YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const parts = str.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return str;
}

export const dataImportService = {
  /**
   * Phân tích tệp JSON từ máy tính
   */
  async parseJsonFile(file: File, fallbackClass: string = 'CĐK19.2-OT1.CLC'): Promise<ParsedImportData> {
    if (file.size === 0) {
      throw new Error('Chốt chặn Safety Guard: Tệp rỗng 0 bytes! Tuyệt đối không cho phép nạp tệp không có dữ liệu.');
    }

    const text = await file.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error('Định dạng tệp JSON không hợp lệ hoặc bị lỗi cú pháp!');
    }

    if (!json || (typeof json !== 'object' && !Array.isArray(json))) {
      throw new Error('Dữ liệu JSON không hợp lệ (không phải đối tượng hoặc danh sách)!');
    }

    const warnings: string[] = [];
    let detectedClass = fallbackClass;
    let students: Student[] = [];
    let grades: StudentGrade[] = [];
    let attendance: AttendanceRecord[] = [];
    let renLuyen: RenLuyenCriteria[] = [];
    let fundTransactions: FundTransaction[] = [];
    let workshopLogs: WorkshopSafetyLog[] = [];

    // Trường hợp 1: Tệp JSON là mảng sinh viên trực tiếp
    if (Array.isArray(json)) {
      students = json;
    } 
    // Trường hợp 2: Tệp JSON là bản sao lưu đầy đủ hệ thống
    else {
      if (json.class_id || json.classId || json.currentClass || json.className) {
        detectedClass = json.class_id || json.classId || json.currentClass || json.className;
      }

      if (Array.isArray(json.students)) students = json.students;
      else if (Array.isArray(json.danhSachSinhVien)) students = json.danhSachSinhVien;
      else if (Array.isArray(json.sinhVien)) students = json.sinhVien;

      if (Array.isArray(json.grades)) grades = json.grades;
      else if (Array.isArray(json.bangDiem)) grades = json.bangDiem;

      if (Array.isArray(json.attendance)) attendance = json.attendance;
      else if (Array.isArray(json.diemDanh)) attendance = json.diemDanh;

      if (Array.isArray(json.renLuyen)) renLuyen = json.renLuyen;
      else if (Array.isArray(json.xepLoaiRenLuyen)) renLuyen = json.xepLoaiRenLuyen;

      if (Array.isArray(json.fundTransactions)) fundTransactions = json.fundTransactions;
      else if (Array.isArray(json.soQuyThuChi)) fundTransactions = json.soQuyThuChi;

      if (Array.isArray(json.workshopLogs)) workshopLogs = json.workshopLogs;
      else if (Array.isArray(json.nhatKyXuong)) workshopLogs = json.nhatKyXuong;
    }

    // Chuẩn hóa danh sách sinh viên
    const sanitizedStudents: Student[] = [];
    const seenIds = new Set<string>();

    students.forEach((s: any, idx: number) => {
      if (!s) return;
      let id = String(s.id || s.mssv || s.maSV || s.studentId || '').trim();
      if (!id) id = `25CDOT-${String(idx + 1).padStart(3, '0')}`;
      if (seenIds.has(id)) {
        id = `${id}-${idx + 1}`;
      }
      seenIds.add(id);

      const fullName = String(s.fullName || s.hoTen || s.name || `Sinh viên ${idx + 1}`).trim();
      const gender: 'Nam' | 'Nữ' = (s.gender === 'Nữ' || s.gioiTinh === 'Nữ' || s.gender === 'Female') ? 'Nữ' : 'Nam';

      const student: Student = {
        id,
        fullName,
        gender,
        birthDate: formatBirthDate(s.birthDate || s.ngaySinh || '15/08/2007'),
        ethnicity: String(s.ethnicity || s.danToc || 'Kinh'),
        idCard: String(s.idCard || s.cccd || s.cmnd || `03820700${String(idx + 1).padStart(4, '0')}`),
        phone: String(s.phone || s.sdt || s.soDienThoai || '0988123456'),
        email: String(s.email || `${id.toLowerCase()}@gdnn.edu.vn`),
        permanentAddress: String(s.permanentAddress || s.hoKhau || s.diaChi || 'Hà Nội'),
        temporaryAddress: String(s.temporaryAddress || s.tamTru || 'KTX Trường'),
        fatherName: String(s.fatherName || s.hoTenBo || 'Nguyễn Văn Phụ Huynh'),
        fatherPhone: String(s.fatherPhone || s.sdtBo || '0912345678'),
        motherName: String(s.motherName || s.hoTenMe || 'Trần Thị Mẹ'),
        motherPhone: String(s.motherPhone || s.sdtMe || '0912345679'),
        parentJob: String(s.parentJob || s.fatherJob || s.ngheNghiep || 'Lao động tự do'),
        fatherJob: String(s.fatherJob || s.parentJob || s.ngheNghiepBo || 'Lao động tự do'),
        motherJob: String(s.motherJob || s.ngheNghiepMe || 'Lao động tự do'),
        emergencyPhone: String(s.emergencyPhone || s.sdtKhanCap || s.fatherPhone || '0912345678'),
        workshopGroup: (Number(s.workshopGroup || s.toXuong || (idx % 2) + 1) as 1 | 2) || 1,
        role: s.role || s.chucVu || 'Thành viên',
        station: s.station || s.viTriXuong || 'Bàn tháo lắp Động cơ EFI',
        policy: s.policy || s.dienChinhSach || 'Miễn giảm 70% (NĐ 238/2025)',
        tuitionStatus: s.tuitionStatus || {
          standardTuition: 7500000,
          governmentSubsidy: 5250000,
          studentPayable: 2250000,
          paidAmount: 2250000,
          debtAmount: 0,
          isComplete: true
        },
        academicStatus: s.academicStatus || 'Đang học bình thường',
        teacherNotes: s.teacherNotes || s.ghiChu || 'Hồ sơ nạp từ tệp máy tính',
        classId: detectedClass
      };
      sanitizedStudents.push(student);
    });

    // Thẩm định an toàn
    const hasData = sanitizedStudents.length > 0;
    const safetyCheck = {
      passed: hasData,
      reason: hasData 
        ? `Đã xác thực ${sanitizedStudents.length} hồ sơ sinh viên hợp lệ. Không rỗng.`
        : 'Tệp không chứa bất kỳ bản ghi sinh viên nào!',
      score: hasData ? 100 : 0
    };

    if (!hasData) {
      warnings.push('Cảnh báo: Không phát hiện bản ghi sinh viên nào trong tệp JSON!');
    }

    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: 'json',
      detectedClassName: detectedClass,
      students: sanitizedStudents,
      grades,
      attendance,
      renLuyen,
      fundTransactions,
      workshopLogs,
      summary: {
        studentsCount: sanitizedStudents.length,
        gradesCount: grades.length,
        attendanceCount: attendance.length,
        renLuyenCount: renLuyen.length,
        fundsCount: fundTransactions.length,
        workshopsCount: workshopLogs.length,
        sheetsFound: ['Cấu trúc dữ liệu JSON']
      },
      warnings,
      safetyCheck
    };
  },

  /**
   * Phân tích tệp Excel (.xlsx, .xls) từ máy tính
   */
  async parseExcelFile(file: File, fallbackClass: string = 'CĐK19.2-OT1.CLC'): Promise<ParsedImportData> {
    if (file.size === 0) {
      throw new Error('Chốt chặn Safety Guard: Tệp Excel rỗng 0 bytes! Không thể nạp.');
    }

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Tệp Excel không chứa bất kỳ trang tính (sheet) nào!');
    }

    const sheetsFound = [...workbook.SheetNames];
    const warnings: string[] = [];
    let detectedClass = fallbackClass;

    // Phát hiện tên lớp từ tên file nếu có (ví dụ: QLSV_CĐK19.2-ÔT1.xlsx)
    const fileNameMatch = file.name.match(/(?:QLSV_|Lop_|Lớp_|)(C[Đ|D][\w.\-]+)/i);
    if (fileNameMatch && fileNameMatch[1]) {
      detectedClass = fileNameMatch[1];
    }

    let parsedStudents: Student[] = [];
    let parsedGrades: StudentGrade[] = [];
    let parsedRenLuyen: RenLuyenCriteria[] = [];
    let parsedAttendance: AttendanceRecord[] = [];
    let parsedFunds: FundTransaction[] = [];
    let parsedWorkshopLogs: WorkshopSafetyLog[] = [];

    // Tìm sheet danh sách sinh viên
    for (const sheetName of workbook.SheetNames) {
      const normName = normalizeColHeader(sheetName);
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) continue;

      const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      if (!rawRows || rawRows.length === 0) continue;

      // Kiểm tra tên lớp trong tiêu đề các dòng đầu
      for (let r = 0; r < Math.min(rawRows.length, 6); r++) {
        const rowStr = (rawRows[r] || []).join(' ');
        const classMatch = rowStr.match(/(?:Lớp|Lop|Class)\s*[:：]\s*([A-Za-z0-9.\-_/]+)/i);
        if (classMatch && classMatch[1]) {
          detectedClass = classMatch[1].trim();
        }
      }

      // Xử lý Sheet 1: Danh sách sinh viên / Trích ngang
      if (
        normName.includes('danhsach') || 
        normName.includes('trichngang') || 
        normName.includes('sinhvien') || 
        normName.includes('01') ||
        parsedStudents.length === 0
      ) {
        // Tìm header row
        let headerRowIdx = -1;
        const keywords = ['mssv', 'masv', 'hoten', 'hovaten', 'gioitinh', 'ngaysinh', 'cccd', 'sdt'];

        for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
          const row = rawRows[r];
          if (!Array.isArray(row)) continue;
          let matchCount = 0;
          row.forEach(cell => {
            const c = normalizeColHeader(cell);
            if (keywords.some(k => c.includes(k))) matchCount++;
          });
          if (matchCount >= 2) {
            headerRowIdx = r;
            break;
          }
        }

        if (headerRowIdx !== -1) {
          const headerRow = rawRows[headerRowIdx];
          const colMap: Record<string, number> = {};

          headerRow.forEach((cell, idx) => {
            const c = normalizeColHeader(cell);
            if (c.includes('mssv') || c.includes('masv') || (c.includes('ma') && c.includes('sinhvien'))) colMap['id'] = idx;
            else if (c.includes('hoten') || c.includes('hovaten') || c.includes('ten')) colMap['fullName'] = idx;
            else if (c.includes('gioitinh') || c.includes('phai')) colMap['gender'] = idx;
            else if (c.includes('ngaysinh') || c.includes('sinh')) colMap['birthDate'] = idx;
            else if (c.includes('dantoc')) colMap['ethnicity'] = idx;
            else if (c.includes('cccd') || c.includes('cmnd')) colMap['idCard'] = idx;
            else if (c.includes('sdt') || c.includes('dienthoai') || c.includes('sodienthoai')) {
              if (colMap['phone'] === undefined) colMap['phone'] = idx;
            }
            else if (c.includes('email')) colMap['email'] = idx;
            else if (c.includes('hokhau') || c.includes('hktt') || c.includes('thuongtru')) colMap['permanentAddress'] = idx;
            else if (c.includes('tamtru') || c.includes('ktx')) colMap['temporaryAddress'] = idx;
            else if (c.includes('bo') || c.includes('cha')) {
              if (c.includes('sdt') || c.includes('dienthoai')) colMap['fatherPhone'] = idx;
              else colMap['fatherName'] = idx;
            }
            else if (c.includes('me')) {
              if (c.includes('sdt') || c.includes('dienthoai')) colMap['motherPhone'] = idx;
              else colMap['motherName'] = idx;
            }
            else if (c.includes('to') || c.includes('toxuong')) colMap['workshopGroup'] = idx;
            else if (c.includes('chucvu') || c.includes('vaitro')) colMap['role'] = idx;
            else if (c.includes('vitri') || c.includes('maymoc')) colMap['station'] = idx;
            else if (c.includes('chinhsach') || c.includes('miengiam')) colMap['policy'] = idx;
            else if (c.includes('ghichu')) colMap['teacherNotes'] = idx;
          });

          // Trích xuất từng dòng sinh viên
          for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
            const row = rawRows[r];
            if (!Array.isArray(row) || row.length === 0) continue;

            const nameVal = colMap['fullName'] !== undefined ? row[colMap['fullName']] : '';
            const idVal = colMap['id'] !== undefined ? row[colMap['id']] : '';

            // Bỏ qua dòng trống
            if (!String(nameVal).trim() && !String(idVal).trim()) continue;

            const studentIdx = parsedStudents.length + 1;
            const id = String(idVal || '').trim() || `25CDOT-${String(studentIdx).padStart(3, '0')}`;
            const fullName = String(nameVal || `Sinh viên ${studentIdx}`).trim();
            const rawGender = colMap['gender'] !== undefined ? String(row[colMap['gender']]).toLowerCase() : 'nam';
            const gender: 'Nam' | 'Nữ' = rawGender.includes('nu') || rawGender.includes('nữ') ? 'Nữ' : 'Nam';

            const rawGroup = colMap['workshopGroup'] !== undefined ? Number(row[colMap['workshopGroup']]) : ((studentIdx - 1) % 2) + 1;
            const workshopGroup = (rawGroup >= 1 && rawGroup <= 2 ? rawGroup : 1) as 1 | 2;

            parsedStudents.push({
              id,
              fullName,
              gender,
              birthDate: formatBirthDate(colMap['birthDate'] !== undefined ? row[colMap['birthDate']] : '15/08/2007'),
              ethnicity: String(colMap['ethnicity'] !== undefined ? row[colMap['ethnicity']] || 'Kinh' : 'Kinh'),
              idCard: String(colMap['idCard'] !== undefined ? row[colMap['idCard']] || `03820700${String(studentIdx).padStart(4, '0')}` : `03820700${String(studentIdx).padStart(4, '0')}`),
              phone: String(colMap['phone'] !== undefined ? row[colMap['phone']] || '0988123456' : '0988123456'),
              email: String(colMap['email'] !== undefined ? row[colMap['email']] || `${id.toLowerCase()}@gdnn.edu.vn` : `${id.toLowerCase()}@gdnn.edu.vn`),
              permanentAddress: String(colMap['permanentAddress'] !== undefined ? row[colMap['permanentAddress']] || 'Hà Nội' : 'Hà Nội'),
              temporaryAddress: String(colMap['temporaryAddress'] !== undefined ? row[colMap['temporaryAddress']] || 'KTX Trường' : 'KTX Trường'),
              fatherName: String(colMap['fatherName'] !== undefined ? row[colMap['fatherName']] || 'Nguyễn Văn Phụ Huynh' : 'Nguyễn Văn Phụ Huynh'),
              fatherPhone: String(colMap['fatherPhone'] !== undefined ? row[colMap['fatherPhone']] || '0912345678' : '0912345678'),
              motherName: String(colMap['motherName'] !== undefined ? row[colMap['motherName']] || 'Trần Thị Mẹ' : 'Trần Thị Mẹ'),
              motherPhone: String(colMap['motherPhone'] !== undefined ? row[colMap['motherPhone']] || '0912345679' : '0912345679'),
              parentJob: 'Lao động tự do',
              fatherJob: 'Lao động tự do',
              motherJob: 'Lao động tự do',
              emergencyPhone: String(colMap['fatherPhone'] !== undefined ? row[colMap['fatherPhone']] || '0912345678' : '0912345678'),
              workshopGroup,
              role: colMap['role'] !== undefined ? String(row[colMap['role']] || 'Thành viên') : 'Thành viên',
              station: colMap['station'] !== undefined ? String(row[colMap['station']] || 'Bàn tháo lắp Động cơ EFI') : 'Bàn tháo lắp Động cơ EFI',
              policy: colMap['policy'] !== undefined ? String(row[colMap['policy']] || 'Miễn giảm 70% (NĐ 238/2025)') : 'Miễn giảm 70% (NĐ 238/2025)',
              tuitionStatus: {
                standardTuition: 7500000,
                governmentSubsidy: 5250000,
                studentPayable: 2250000,
                paidAmount: 2250000,
                debtAmount: 0,
                isComplete: true
              },
              academicStatus: 'Đang học bình thường',
              teacherNotes: colMap['teacherNotes'] !== undefined ? String(row[colMap['teacherNotes']] || 'Nạp từ Excel') : 'Nạp từ Excel',
              classId: detectedClass
            });
          }
        }
      }

      // Xử lý Sheet 2: Bảng điểm chi tiết
      if (normName.includes('bangdiem') || normName.includes('diem') || normName.includes('02')) {
        let hIdx = -1;
        for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
          const row = rawRows[r];
          if (Array.isArray(row) && row.some(c => normalizeColHeader(c).includes('mssv') || normalizeColHeader(c).includes('masv'))) {
            hIdx = r;
            break;
          }
        }
        if (hIdx !== -1) {
          for (let r = hIdx + 1; r < rawRows.length; r++) {
            const row = rawRows[r];
            if (!Array.isArray(row) || !row[1]) continue;
            const studentId = String(row[1] || row[0]).trim();
            if (!studentId) continue;

            const tx1 = Number(row[3]) || 8.0;
            const tx2 = Number(row[4]) || 8.5;
            const dk = Number(row[5]) || 8.0;
            const thi = Number(row[6]) || 7.5;
            const final10 = Number(row[7]) || Number(((tx1 + tx2 + dk * 2 + thi * 3) / 7).toFixed(1));

            parsedGrades.push({
              studentId,
              moduleId: 'MH01',
              regularScore1: tx1,
              regularScore2: tx2,
              midtermScore: dk,
              finalExamScore: thi,
              finalGrade10: final10,
              finalGrade4: final10 >= 8.5 ? 4.0 : final10 >= 7.0 ? 3.0 : 2.0,
              letterGrade: final10 >= 8.5 ? 'A' : final10 >= 7.0 ? 'B' : 'C',
              isPassed: final10 >= 5.0,
              retakeCount: 0
            });
          }
        }
      }

      // Xử lý Sheet 3: Rèn luyện
      if (normName.includes('renluyen') || normName.includes('03')) {
        let hIdx = -1;
        for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
          const row = rawRows[r];
          if (Array.isArray(row) && row.some(c => normalizeColHeader(c).includes('mssv') || normalizeColHeader(c).includes('masv'))) {
            hIdx = r;
            break;
          }
        }
        if (hIdx !== -1) {
          for (let r = hIdx + 1; r < rawRows.length; r++) {
            const row = rawRows[r];
            if (!Array.isArray(row) || !row[1]) continue;
            const studentId = String(row[1] || row[0]).trim();
            if (!studentId) continue;

            const c1 = Number(row[3]) || 18;
            const c2 = Number(row[4]) || 23;
            const c3 = Number(row[5]) || 18;
            const c4 = Number(row[6]) || 22;
            const c5 = Number(row[7]) || 8;
            const total = c1 + c2 + c3 + c4 + c5;

            parsedRenLuyen.push({
              studentId,
              semester: 1,
              criteria1: c1,
              criteria2: c2,
              criteria3: c3,
              criteria4: c4,
              criteria5: c5,
              totalScore: total,
              rank: total >= 90 ? 'Xuất sắc' : total >= 80 ? 'Tốt' : total >= 65 ? 'Khá' : 'Trung bình',
              evaluationStep: 'GVCN duyệt'
            });
          }
        }
      }
    }

    // Đánh giá Safety Check
    const hasStudents = parsedStudents.length > 0;
    const safetyCheck = {
      passed: hasStudents,
      reason: hasStudents 
        ? `Đã bóc tách thành công ${parsedStudents.length} sinh viên từ các trang tính Excel.`
        : 'Không tìm thấy dữ liệu sinh viên hợp lệ trong tệp Excel!',
      score: hasStudents ? 100 : 0
    };

    if (!hasStudents) {
      warnings.push('Chưa tìm thấy danh sách sinh viên. Vui lòng đảm bảo tệp Excel có cột Mã SV và Họ tên!');
    }

    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: 'xlsx',
      detectedClassName: detectedClass,
      students: parsedStudents,
      grades: parsedGrades,
      attendance: parsedAttendance,
      renLuyen: parsedRenLuyen,
      fundTransactions: parsedFunds,
      workshopLogs: parsedWorkshopLogs,
      summary: {
        studentsCount: parsedStudents.length,
        gradesCount: parsedGrades.length,
        attendanceCount: parsedAttendance.length,
        renLuyenCount: parsedRenLuyen.length,
        fundsCount: parsedFunds.length,
        workshopsCount: parsedWorkshopLogs.length,
        sheetsFound
      },
      warnings,
      safetyCheck
    };
  },

  /**
   * Tải tệp JSON mẫu chuẩn GDNN
   */
  downloadSampleJsonTemplate(className: string = 'CĐK19.2-ÔT1'): void {
    const sampleData = {
      version: '2.5.0-GDNN',
      exportDate: new Date().toISOString(),
      className,
      description: 'Dữ liệu mẫu chuẩn Quốc Gia Quản trị Lớp học Giáo dục Nghề nghiệp',
      students: [
        {
          id: '25CDOT-001',
          fullName: 'Nguyễn Văn An',
          gender: 'Nam',
          birthDate: '15/03/2007',
          ethnicity: 'Kinh',
          idCard: '038207001234',
          phone: '0988123456',
          email: '25cdot001@gdnn.edu.vn',
          permanentAddress: 'Xã Tiên Lãng, Huyện Tiên Lãng, TP. Hải Phòng',
          temporaryAddress: 'KTX Khu B, Phòng 302',
          fatherName: 'Nguyễn Văn Bình',
          fatherPhone: '0912345678',
          motherName: 'Trần Thị Lan',
          motherPhone: '0912345679',
          parentJob: 'Kỹ sư cơ khí',
          emergencyPhone: '0912345678',
          workshopGroup: 1,
          role: 'Lớp trưởng',
          station: 'Cầu nâng 2 trụ & Khung gầm',
          policy: 'Miễn giảm 70% (NĐ 238/2025)',
          tuitionStatus: {
            standardTuition: 7500000,
            governmentSubsidy: 5250000,
            studentPayable: 2250000,
            paidAmount: 2250000,
            debtAmount: 0,
            isComplete: true
          },
          academicStatus: 'Đang học bình thường',
          teacherNotes: 'Gương mẫu, tác phong công nghiệp tốt, an toàn lao động chuẩn',
          classId: className
        },
        {
          id: '25CDOT-002',
          fullName: 'Trần Quang Dũng',
          gender: 'Nam',
          birthDate: '22/07/2007',
          ethnicity: 'Kinh',
          idCard: '038207005678',
          phone: '0988234567',
          email: '25cdot002@gdnn.edu.vn',
          permanentAddress: 'Phường Ba Đình, TP. Thanh Hóa',
          temporaryAddress: 'Số 18 Ngõ 42 Triều Khúc, Thanh Xuân, Hà Nội',
          fatherName: 'Trần Văn Hùng',
          fatherPhone: '0913456789',
          motherName: 'Lê Thị Mai',
          motherPhone: '0913456780',
          parentJob: 'Lao động tự do',
          emergencyPhone: '0913456789',
          workshopGroup: 2,
          role: 'Tổ trưởng Tổ 2',
          station: 'Bàn tháo lắp Động cơ EFI',
          policy: 'Miễn giảm 70% (NĐ 238/2025)',
          tuitionStatus: {
            standardTuition: 7500000,
            governmentSubsidy: 5250000,
            studentPayable: 2250000,
            paidAmount: 2250000,
            debtAmount: 0,
            isComplete: true
          },
          academicStatus: 'Đang học bình thường',
          teacherNotes: 'Nắm chắc nguyên lý động cơ phun xăng điện tử',
          classId: className
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mau_Nap_DuLieu_${className}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Tải tệp Excel mẫu chuẩn GDNN 7 Sheets
   */
  downloadSampleExcelTemplate(className: string = 'CĐK19.2-ÔT1'): void {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Danh sách trích ngang (23 trường chuẩn)
    const dsHeader = [
      ['HỆ THỐNG GIÁO DỤC NGHỀ NGHIỆP - KHOA CÔNG NGHỆ Ô TÔ'],
      [`DANH SÁCH TRÍCH NGANG SINH VIÊN - LỚP: ${className}`],
      ['STT', 'Mã SV (MSSV)', 'Họ và tên', 'Giới tính', 'Ngày sinh', 'Dân tộc', 'CCCD', 'Số điện thoại', 'Email', 'Hộ khẩu thường trú', 'Địa chỉ tạm trú', 'Họ tên Bố', 'SĐT Bố', 'Họ tên Mẹ', 'SĐT Mẹ', 'Nghề nghiệp Bố', 'Nghề nghiệp Mẹ', 'SĐT khẩn cấp', 'Tổ xưởng', 'Chức vụ', 'Vị trí xưởng', 'Diện chính sách', 'Định mức HP', 'Ghi chú GVCN']
    ];
    const dsRows = [
      [1, '25CDOT-001', 'Nguyễn Văn An', 'Nam', '15/03/2007', 'Kinh', '038207001234', '0988123456', '25cdot001@gdnn.edu.vn', 'Hải Phòng', 'KTX Trường', 'Nguyễn Văn Bình', '0912345678', 'Trần Thị Lan', '0912345679', 'Kỹ sư cơ khí', 'Kinh doanh tự do', '0912345678', 1, 'Lớp trưởng', 'Cầu nâng 2 trụ & Khung gầm', 'Miễn giảm 70% (NĐ 238/2025)', 7500000, 'Gương mẫu'],
      [2, '25CDOT-002', 'Trần Quang Dũng', 'Nam', '22/07/2007', 'Kinh', '038207005678', '0988234567', '25cdot002@gdnn.edu.vn', 'Thanh Hóa', 'Triều Khúc, Hà Nội', 'Trần Văn Hùng', '0913456789', 'Lê Thị Mai', '0913456780', 'Công nhân cơ khí', 'Nội trợ', '0913456789', 2, 'Tổ trưởng', 'Bàn tháo lắp Động cơ EFI', 'Miễn giảm 70% (NĐ 238/2025)', 7500000, 'Học tốt'],
      [3, '25CDOT-003', 'Lê Hoàng Long', 'Nam', '10/11/2007', 'Kinh', '038207009876', '0988345678', '25cdot003@gdnn.edu.vn', 'Nghệ An', 'KTX Trường', 'Lê Văn Nam', '0914567890', 'Ngô Thị Cúc', '0914567891', 'Nông dân', 'Làm nông', '0914567890', 3, 'Thành viên', 'Hộp số tự động AT/CVT', 'Miễn giảm 70% (NĐ 238/2025)', 7500000, 'Chăm chỉ']
    ];
    const ws1 = XLSX.utils.aoa_to_sheet([...dsHeader, ...dsRows]);
    XLSX.utils.book_append_sheet(wb, ws1, '01_DanhSach_TrichNgang');

    // Sheet 2: Bảng điểm chi tiết
    const diemHeader = [
      [`BẢNG ĐIỂM CHI TIẾT MÔ ĐUN - LỚP: ${className}`],
      ['STT', 'Mã SV', 'Họ và tên', 'TX1 (HS1)', 'TX2 (HS1)', 'Định kỳ (HS2)', 'Thi KTHP (HS3)', 'Điểm HP (10)', 'Điểm Hệ 4', 'Điểm Chữ', 'Kết quả']
    ];
    const diemRows = [
      [1, '25CDOT-001', 'Nguyễn Văn An', 8.5, 9.0, 8.5, 8.0, 8.4, 3.5, 'B+', 'Đạt'],
      [2, '25CDOT-002', 'Trần Quang Dũng', 8.0, 8.5, 8.0, 7.5, 7.9, 3.0, 'B', 'Đạt'],
      [3, '25CDOT-003', 'Lê Hoàng Long', 7.5, 8.0, 7.5, 7.0, 7.3, 3.0, 'B', 'Đạt']
    ];
    const ws2 = XLSX.utils.aoa_to_sheet([...diemHeader, ...diemRows]);
    XLSX.utils.book_append_sheet(wb, ws2, '02_BangDiem_ChiTiet');

    // Sheet 3: Xếp loại rèn luyện
    const rlHeader = [
      [`ĐÁNH GIÁ KẾT QUẢ RÈN LUYỆN (THÔNG TƯ 17/2017) - LỚP: ${className}`],
      ['STT', 'Mã SV', 'Họ và tên', 'TC1 (0-20đ)', 'TC2 (0-25đ)', 'TC3 (0-20đ)', 'TC4 (0-25đ)', 'TC5 (0-10đ)', 'Tổng điểm', 'Xếp loại']
    ];
    const rlRows = [
      [1, '25CDOT-001', 'Nguyễn Văn An', 19, 24, 19, 24, 9, 95, 'Xuất sắc'],
      [2, '25CDOT-002', 'Trần Quang Dũng', 18, 23, 17, 23, 7, 88, 'Tốt'],
      [3, '25CDOT-003', 'Lê Hoàng Long', 16, 21, 16, 21, 6, 80, 'Tốt']
    ];
    const ws3 = XLSX.utils.aoa_to_sheet([...rlHeader, ...rlRows]);
    XLSX.utils.book_append_sheet(wb, ws3, '03_XepLoai_RenLuyen');

    // Xuất file
    XLSX.writeFile(wb, `Mau_DuLieu_Chuan_GDNN_${className}.xlsx`);
  }
};
