import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Upload, 
  Printer, 
  RotateCw, 
  GraduationCap, 
  MessageSquare, 
  GripVertical, 
  Eye, 
  Edit3, 
  Trash2, 
  Download, 
  CheckCircle,
  X,
  Phone,
  Mail,
  Home,
  User,
  Users,
  FileText,
  Check,
  FileSpreadsheet,
  Layers,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  FileUp,
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
  CreditCard,
  Briefcase,
  MapPin,
  Calendar,
  Sparkles,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, ClassId, ThemeSettings, ClassItem, ActiveTab, UnitInfoSettings } from '../types';
import { SelectionToolbar } from './SelectionToolbar';

interface StudentProfilesModuleProps {
  students: Student[];
  currentClass: ClassId;
  setCurrentClass?: (cls: ClassId) => void;
  classes?: ClassItem[];
  setActiveTab?: (tab: ActiveTab) => void;
  onUpdateStudent: (updated: Student) => void;
  onAddStudent: (newStudent: Student) => void;
  onDeleteStudent: (id: string) => void;
  onBulkDeleteStudents?: (ids: string[]) => void;
  onClearClassStudents?: () => void;
  onClearAllStudents?: () => void;
  onBulkAddStudents?: (newStudents: Student[], replaceClass?: boolean) => void;
  onReorderStudents?: (reorderedStudents: Student[]) => void;
  onRestoreInitialStudents?: () => void;
  selectedStudent: Student | null;
  setSelectedStudent: (student: Student | null) => void;
  themeSettings?: ThemeSettings;
  unitInfo?: UnitInfoSettings;
}

export const StudentProfilesModule: React.FC<StudentProfilesModuleProps> = ({
  students,
  currentClass,
  setCurrentClass,
  classes = [],
  setActiveTab,
  onUpdateStudent,
  onAddStudent,
  onDeleteStudent,
  onBulkDeleteStudents,
  onClearClassStudents,
  onClearAllStudents,
  onBulkAddStudents,
  onReorderStudents,
  onRestoreInitialStudents,
  selectedStudent,
  setSelectedStudent,
  themeSettings,
  unitInfo
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');
  const [policyFilter, setPolicyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'workshop' | 'contact' | 'policy'>('all');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Sorting
  const [sortField, setSortField] = useState<'id' | 'fullName' | 'birthDate' | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Kéo thả sắp xếp thứ tự sinh viên trong bảng
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);
  const [dragOverStudentId, setDragOverStudentId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<'above' | 'below' | null>(null);

  // Chế độ nhập trực tiếp trên bảng (Inline table editing)
  const [isDirectTableEdit, setIsDirectTableEdit] = useState<boolean>(false);

  // Sinh viên đang được chỉnh sửa trực tiếp trong khung modal 23 trường
  const [editableStudent, setEditableStudent] = useState<Student | null>(null);

  // Dòng thêm nhanh sinh viên khi bật chế độ nhập trực tiếp trên bảng
  const [quickAddRow, setQuickAddRow] = useState<Partial<Student>>({
    fullName: '',
    gender: 'Nam',
    birthDate: '15/05/2007',
    ethnicity: 'Kinh',
    idCard: '',
    idCardIssueDate: '18/12/2021',
    phone: '',
    email: '',
    permanentAddress: '',
    temporaryAddress: 'KTX K1',
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
    parentJob: 'Lao động tự do',
    emergencyPhone: '',
    workshopGroup: 1,
    role: 'Thành viên',
    station: 'Cầu nâng 2 trụ & Khung gầm',
    policy: 'Nghề nặng nhọc, độc hại',
    academicStatus: 'Đang học bình thường',
    attendanceRate: 100,
    teacherNotes: ''
  });

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-app Confirmation Dialog (100% reliable inside iframes, replaces window.confirm)
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

  // Đồng bộ editableStudent khi selectedStudent thay đổi
  useEffect(() => {
    if (selectedStudent) {
      setEditableStudent({ ...selectedStudent });
    } else {
      setEditableStudent(null);
    }
  }, [selectedStudent]);

  // State quản lý Nạp Danh Sách từ tệp Excel
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [selectedForImport, setSelectedForImport] = useState<Set<number>>(new Set());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Helper chuẩn hóa ngày tháng từ ô Excel
  const parseDateCell = (val: any): string => {
    if (!val) return '15/08/2006';
    if (typeof val === 'number') {
      try {
        const parsed = (XLSX as any).SSF?.parse_date_code?.(val);
        if (parsed) {
          const d = String(parsed.d).padStart(2, '0');
          const m = String(parsed.m).padStart(2, '0');
          const y = parsed.y;
          return `${d}/${m}/${y}`;
        }
      } catch {
        // fallback
      }
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
      }
    }
    if (val instanceof Date && !isNaN(val.getTime())) {
      const d = String(val.getDate()).padStart(2, '0');
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const y = val.getFullYear();
      return `${d}/${m}/${y}`;
    }
    const s = String(val).trim();
    if (!s) return '15/08/2006';
    const parts = s.split(/[-/.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
      } else {
        return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
      }
    }
    return s;
  };

  // Xử lý nạp ảnh thẻ 4x6 sinh viên từ tệp (Nén tự động qua Canvas tối ưu dung lượng)
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (.jpg, .jpeg, .png, .webp)!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          callback(dataUrl);
          showToast('✅ Đã nén và cập nhật ảnh thẻ 4x6 chuẩn GDNN thành công!');
        } else {
          callback(String(event.target?.result || ''));
        }
      };
      img.src = String(event.target?.result || '');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Xóa sinh viên khỏi danh sách xem trước nạp tệp
  const handleDeleteParsedStudent = (indexToRemove: number) => {
    const nextList = parsedStudents.filter((_, i) => i !== indexToRemove);
    setParsedStudents(nextList);
    const nextSelected = new Set<number>();
    selectedForImport.forEach(i => {
      if (i < indexToRemove) nextSelected.add(i);
      else if (i > indexToRemove) nextSelected.add(i - 1);
    });
    setSelectedForImport(nextSelected);
    showToast('Đã xóa sinh viên khỏi danh sách xem trước.');
  };

  // Xử lý đọc và phân tích tệp Excel / CSV đa năng
  const handleFileUpload = async (file: File) => {
    setIsParsingFile(true);
    setImportError(null);
    setImportFile(file);
    setParsedStudents([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('Tệp Excel không chứa trang tính (sheet) nào!');
      }

      const cleanCol = (col: any): string => {
        if (!col) return '';
        return String(col)
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '');
      };

      const keywords = [
        'mssv', 'masv', 'mahssv', 'masinhvien', 'id', 'hoten', 'hovaten', 'ten', 'hodem', 
        'gioitinh', 'phai', 'ngaysinh', 'cccd', 'cmnd', 'sdt', 'sodt', 'dienthoai', 'stt'
      ];

      // Tự động quét tìm sheet chứa danh sách sinh viên phù hợp nhất
      let bestSheetName = workbook.SheetNames[0];
      let bestRows: any[][] = [];
      let bestHeaderIdx = -1;
      let highestSheetScore = -1;

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) continue;
        const currentSheetRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        if (!currentSheetRows || currentSheetRows.length === 0) continue;

        let currentHeaderIdx = -1;
        let currentMaxScore = 0;

        for (let i = 0; i < Math.min(currentSheetRows.length, 30); i++) {
          const row = currentSheetRows[i];
          if (!Array.isArray(row)) continue;
          let score = 0;
          row.forEach(cell => {
            const c = cleanCol(cell);
            if (c && keywords.some(k => c.includes(k))) {
              score++;
            }
          });
          if (score > currentMaxScore) {
            currentMaxScore = score;
            currentHeaderIdx = i;
          }
        }

        const cleanSheetName = cleanCol(sheetName);
        const nameBonus = (cleanSheetName.includes('sinhvien') || cleanSheetName.includes('danhsach') || cleanSheetName.includes('ds') || cleanSheetName.includes('lop') || cleanSheetName.includes('hocsinh')) ? 5 : 0;
        const totalScore = currentMaxScore * 10 + nameBonus + Math.min(currentSheetRows.length, 50);

        if (totalScore > highestSheetScore && currentMaxScore >= 1) {
          highestSheetScore = totalScore;
          bestSheetName = sheetName;
          bestRows = currentSheetRows;
          bestHeaderIdx = currentHeaderIdx;
        }
      }

      // Fallback về sheet đầu tiên nếu không có sheet nào khớp từ khóa
      if (bestRows.length === 0) {
        bestSheetName = workbook.SheetNames[0];
        const ws = workbook.Sheets[bestSheetName];
        bestRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        bestHeaderIdx = 0;
      }

      if (!bestRows || bestRows.length === 0) {
        throw new Error('Trang tính Excel rỗng hoặc không có dữ liệu hàng nào!');
      }

      let headers: string[] = [];
      let dataRows: any[][] = [];

      if (bestHeaderIdx !== -1 && bestHeaderIdx < bestRows.length) {
        headers = bestRows[bestHeaderIdx].map(c => String(c || '').trim());
        dataRows = bestRows.slice(bestHeaderIdx + 1);
      } else {
        headers = bestRows[0].map(c => String(c || '').trim());
        dataRows = bestRows.slice(1);
      }

      // Nhận diện chỉ số các cột thông minh
      let colMssv = -1;
      let colFullName = -1;
      let colHoDem = -1;
      let colTen = -1;
      let colGender = -1;
      let colBirthDate = -1;
      let colEthnicity = -1;
      let colIdCard = -1;
      let colIdCardIssueDate = -1;
      let colPhone = -1;
      let colEmail = -1;
      let colAddress = -1;
      let colTempAddress = -1;
      let colFatherName = -1;
      let colFatherPhone = -1;
      let colMotherName = -1;
      let colMotherPhone = -1;
      let colParentJob = -1;
      let colEmergencyPhone = -1;
      let colWorkshop = -1;
      let colRole = -1;
      let colStation = -1;
      let colPolicy = -1;
      let colAvatar = -1;
      let colNotes = -1;

      headers.forEach((h, idx) => {
        const c = cleanCol(h);
        if (!c) return;
        if (c.includes('mssv') || c.includes('masv') || c.includes('mahssv') || c.includes('masinhvien') || c.includes('mahocsinh') || c === 'id' || c === 'studentid' || c.includes('mahs') || c.includes('sohieu')) colMssv = idx;
        else if (c.includes('hovaten') || c.includes('hoten') || c.includes('fullname') || c.includes('tensinhvien') || c.includes('tenhssv') || c.includes('hocsinh')) colFullName = idx;
        else if (c.includes('hodem') || c.includes('holot') || c === 'ho' || c.includes('hovatendem') || c.includes('chulot')) colHoDem = idx;
        else if (c === 'ten' || c === 'firstname' || c.includes('tenrieng')) colTen = idx;
        else if (c.includes('gioitinh') || c.includes('phai') || c.includes('gender') || c.includes('sex') || c.includes('namnu')) colGender = idx;
        else if (c.includes('ngaysinh') || c.includes('sinhngay') || c.includes('namsinh') || c === 'dob' || c.includes('birthdate') || c.includes('ngaythangnamsinh')) colBirthDate = idx;
        else if (c.includes('dantoc') || c.includes('ethnicity') || c.includes('tongiao')) colEthnicity = idx;
        else if (c.includes('cccd') || c.includes('cmnd') || c.includes('dinhdanh') || c.includes('idcard') || c.includes('socm') || c.includes('socccd')) colIdCard = idx;
        else if (c.includes('ngaycap') || c.includes('ngaycapcccd')) colIdCardIssueDate = idx;
        else if (c.includes('sdt') || c.includes('sodt') || c.includes('dienthoai') || c.includes('phone') || c.includes('tel') || c.includes('lienhe')) {
          if (c.includes('bo') || c.includes('cha') || c.includes('phuhuynh')) colFatherPhone = idx;
          else if (c.includes('me')) colMotherPhone = idx;
          else if (c.includes('khan') || c.includes('cap') || c.includes('khancap')) colEmergencyPhone = idx;
          else if (colPhone === -1) colPhone = idx;
        }
        else if (c.includes('email') || c.includes('mail') || c.includes('thu')) colEmail = idx;
        else if (c.includes('hktt') || c.includes('thuongtru') || c.includes('hokhau') || c.includes('quequan') || c.includes('noisinh') || (c.includes('diachi') && !c.includes('tam'))) colAddress = idx;
        else if (c.includes('tamtru') || c.includes('ktx') || c.includes('noio') || c.includes('tro')) colTempAddress = idx;
        else if (c.includes('tenbo') || c.includes('tencha') || c.includes('hotenbo') || c.includes('hotencha') || c.includes('ong')) colFatherName = idx;
        else if (c.includes('tenme') || c.includes('hotenme') || c.includes('ba')) colMotherName = idx;
        else if (c.includes('nghenghiep') || c.includes('nghe') || c.includes('job')) colParentJob = idx;
        else if (c.includes('to') || c.includes('toxuong') || c.includes('group') || c.includes('nhom')) colWorkshop = idx;
        else if (c.includes('chucvu') || c.includes('role') || c.includes('chucdanh')) colRole = idx;
        else if (c.includes('vitri') || c.includes('station') || c.includes('tram') || c.includes('caunang')) colStation = idx;
        else if (c.includes('chinhsach') || c.includes('doituong') || c.includes('miengiam') || c.includes('chedo') || c.includes('238')) colPolicy = idx;
        else if (c.includes('anh') || c.includes('avatar') || c.includes('photo') || c.includes('hinh')) colAvatar = idx;
        else if (c.includes('ghichu') || c.includes('note') || c.includes('nhanxet')) colNotes = idx;
      });

      const extracted: Student[] = [];
      let seqNum = 1;

      dataRows.forEach((row) => {
        if (!row || !Array.isArray(row) || row.every(cell => String(cell || '').trim() === '')) return;

        // Trích xuất Họ tên
        let fullName = '';
        if (colFullName !== -1 && row[colFullName]) {
          fullName = String(row[colFullName]).trim();
        } else if (colHoDem !== -1 || colTen !== -1) {
          const ho = colHoDem !== -1 && row[colHoDem] ? String(row[colHoDem]).trim() : '';
          const ten = colTen !== -1 && row[colTen] ? String(row[colTen]).trim() : '';
          fullName = `${ho} ${ten}`.trim();
        }

        if (!fullName) {
          const candidate = row.find(c => typeof c === 'string' && c.trim().split(' ').length >= 2 && !c.includes('@') && !/^\d+$/.test(c.trim()));
          if (candidate) fullName = String(candidate).trim();
        }

        // Bỏ qua dòng không có họ tên hoặc là dòng tổng kết
        if (!fullName || fullName.toLowerCase().includes('tổng cộng') || fullName.toLowerCase().includes('tổng số')) return;

        // Mã SV / MSSV
        let id = '';
        if (colMssv !== -1 && row[colMssv]) {
          id = String(row[colMssv]).trim();
        } else {
          id = `25CDOT-${String(seqNum).padStart(3, '0')}`;
        }

        // Đảm bảo mã SV hoàn toàn duy nhất trong danh sách trích xuất
        let uniqueId = id;
        let dupCounter = 1;
        while (extracted.some(ex => ex.id === uniqueId)) {
          uniqueId = `${id}-${dupCounter}`;
          dupCounter++;
        }
        id = uniqueId;

        // Giới tính
        let gender: 'Nam' | 'Nữ' = 'Nam';
        if (colGender !== -1 && row[colGender]) {
          const gStr = String(row[colGender]).toLowerCase().trim();
          if (gStr.includes('nữ') || gStr.includes('nu') || gStr === 'f' || gStr === 'female') {
            gender = 'Nữ';
          }
        }

        // Ngày sinh
        const birthDate = colBirthDate !== -1 && row[colBirthDate]
          ? parseDateCell(row[colBirthDate])
          : '15/08/2006';

        // Dân tộc
        const ethnicity = colEthnicity !== -1 && row[colEthnicity] ? String(row[colEthnicity]).trim() : 'Kinh';

        // CCCD
        const idCard = colIdCard !== -1 && row[colIdCard]
          ? String(row[colIdCard]).trim()
          : `001206${Math.floor(100000 + Math.random() * 900000)}`;

        // SĐT
        const phone = colPhone !== -1 && row[colPhone]
          ? String(row[colPhone]).trim()
          : `09${Math.floor(10000000 + Math.random() * 90000000)}`;

        // Tổ xưởng
        let workshopGroup: 1 | 2 = (((seqNum - 1) % 2) + 1) as any;
        if (colWorkshop !== -1 && row[colWorkshop]) {
          const match = String(row[colWorkshop]).match(/[1-2]/);
          if (match) workshopGroup = parseInt(match[0], 10) as any;
        }

        const stations = [
          'Cầu nâng 2 trụ & Khung gầm',
          'Bàn tháo lắp Động cơ EFI',
          'Hộp số tự động AT/CVT',
          'Điện xe & Scan tool OBD-II'
        ];
        const station = colStation !== -1 && row[colStation]
          ? String(row[colStation]).trim()
          : stations[(workshopGroup - 1) % stations.length];

        const role = colRole !== -1 && row[colRole] ? String(row[colRole]).trim() : 'Thành viên';
        const email = colEmail !== -1 && row[colEmail] ? String(row[colEmail]).trim() : `${id.toLowerCase()}@caodangoto.edu.vn`;
        const permanentAddress = colAddress !== -1 && row[colAddress] ? String(row[colAddress]).trim() : 'Hà Nội';
        const temporaryAddress = colTempAddress !== -1 && row[colTempAddress] ? String(row[colTempAddress]).trim() : 'KTX Trường CĐ Công nghệ & Kỹ thuật';

        const fatherName = colFatherName !== -1 && row[colFatherName] ? String(row[colFatherName]).trim() : 'Nguyễn Văn Phụ';
        const fatherPhone = colFatherPhone !== -1 && row[colFatherPhone] ? String(row[colFatherPhone]).trim() : phone;
        const motherName = colMotherName !== -1 && row[colMotherName] ? String(row[colMotherName]).trim() : 'Trần Thị Huynh';
        const motherPhone = colMotherPhone !== -1 && row[colMotherPhone] ? String(row[colMotherPhone]).trim() : phone;
        const parentJob = colParentJob !== -1 && row[colParentJob] ? String(row[colParentJob]).trim() : 'Lao động tự do';
        const emergencyPhone = colEmergencyPhone !== -1 && row[colEmergencyPhone] ? String(row[colEmergencyPhone]).trim() : phone;
        const policy = colPolicy !== -1 && row[colPolicy] ? String(row[colPolicy]).trim() : 'Miễn giảm 70% (NĐ 238/2025)';
        const avatar = colAvatar !== -1 && row[colAvatar] ? String(row[colAvatar]).trim() : undefined;
        const teacherNotes = colNotes !== -1 && row[colNotes] ? String(row[colNotes]).trim() : 'Nạp tự động từ tệp Excel chuẩn GDNN';

        extracted.push({
          id,
          fullName,
          gender,
          birthDate,
          ethnicity,
          idCard,
          idCardIssueDate: colIdCardIssueDate !== -1 && row[colIdCardIssueDate] ? parseDateCell(row[colIdCardIssueDate]) : '18/12/2021',
          phone,
          email,
          permanentAddress,
          temporaryAddress,
          fatherName,
          fatherPhone,
          motherName,
          motherPhone,
          parentJob,
          emergencyPhone,
          workshopGroup,
          role,
          station,
          policy,
          avatar,
          tuitionStatus: {
            standardTuition: 7500000,
            governmentSubsidy: 5250000,
            studentPayable: 2250000,
            paidAmount: 2250000,
            debtAmount: 0,
            isComplete: true
          },
          academicStatus: 'Đang học bình thường',
          teacherNotes,
          classId: currentClass,
          attendanceRate: 96
        });
        seqNum++;
      });

      if (extracted.length === 0) {
        throw new Error(`Đã mở trang tính [${bestSheetName}] nhưng không nhận diện được dòng sinh viên nào. Vui lòng kiểm tra dòng tiêu đề cột hoặc tải tệp mẫu Excel chuẩn GDNN để kiểm tra định dạng!`);
      }

      setParsedStudents(extracted);
      setSelectedForImport(new Set(extracted.map((_, i) => i)));
    } catch (err: any) {
      setImportError(err.message || 'Lỗi khi xử lý tệp Excel. Vui lòng kiểm tra định dạng tệp!');
    } finally {
      setIsParsingFile(false);
    }
  };

  // Xác nhận nạp danh sách vào lớp
  const handleConfirmImport = () => {
    const toImport = parsedStudents.filter((_, idx) => selectedForImport.has(idx));
    if (toImport.length === 0) {
      alert('Vui lòng tích chọn ít nhất 1 sinh viên trong danh sách xem trước!');
      return;
    }

    if (onBulkAddStudents) {
      onBulkAddStudents(toImport, importMode === 'replace');
    } else {
      toImport.forEach(s => onAddStudent(s));
    }

    setIsImportModalOpen(false);
    showToast(`✅ Đã nạp thành công ${toImport.length} sinh viên từ tệp Excel vào danh sách lớp ${currentClass}!`);
    setImportFile(null);
    setParsedStudents([]);
    setImportError(null);
    setSelectedForImport(new Set());
  };

  // Xuất file Excel (.xlsx) chuẩn
  const handleExportExcel = () => {
    const data = filteredStudents.map((s, idx) => ({
      'STT': idx + 1,
      'Mã SV': s.id,
      'Họ và tên HSSV': s.fullName,
      'Giới tính': s.gender,
      'Ngày sinh': s.birthDate,
      'Dân tộc': s.ethnicity || 'Kinh',
      'Số CCCD': s.idCard,
      'Ngày cấp': s.idCardIssueDate || '18/12/2021',
      'SĐT SV': s.phone,
      'Email': s.email,
      'Hộ khẩu thường trú': s.permanentAddress,
      'Địa chỉ tạm trú': s.temporaryAddress,
      'Họ tên Bố': s.fatherName,
      'SĐT Bố': s.fatherPhone,
      'Họ tên Mẹ': s.motherName,
      'SĐT Mẹ': s.motherPhone,
      'Nghề nghiệp Bố': s.fatherJob || s.parentJob || 'Lao động tự do',
      'Nghề nghiệp Mẹ': s.motherJob || 'Lao động tự do',
      'SĐT khẩn cấp': s.emergencyPhone || s.fatherPhone,
      'Tổ xưởng': `Tổ ${s.workshopGroup}`,
      'Chức vụ': s.role,
      'Vị trí xưởng': s.station,
      'Diện chính sách': s.policy || 'Miễn giảm 70% (NĐ 238/2025)',
      'Chuyên cần %': s.attendanceRate !== undefined ? `${s.attendanceRate}%` : '100%'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Lớp_${currentClass}`);
    XLSX.writeFile(workbook, `DS_SinhVien_${currentClass}.xlsx`);
    showToast(`Đã xuất tệp Excel danh sách lớp ${currentClass} thành công!`);
  };

  // Tải tệp mẫu Excel chuẩn GDNN (.xlsx)
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'STT': 1,
        'Mã SV': '25CDOT-001',
        'Họ và tên': 'Nguyễn Văn An',
        'Giới tính': 'Nam',
        'Ngày sinh': '15/08/2006',
        'Dân tộc': 'Kinh',
        'Số CCCD': '001206012345',
        'Ngày cấp': '18/12/2021',
        'SĐT SV': '0912345678',
        'Email': 'an.nv@caodangoto.edu.vn',
        'Hộ khẩu thường trú': 'Phú Xuyên, Hà Nội',
        'Địa chỉ tạm trú': 'KTX Trường CĐ Công nghệ & Kỹ thuật',
        'Họ tên Bố': 'Nguyễn Văn Bình',
        'SĐT Bố': '0987654321',
        'Họ tên Mẹ': 'Trần Thị Cúc',
        'SĐT Mẹ': '0987654322',
        'Nghề nghiệp Bố': 'Kinh doanh tự do',
        'Nghề nghiệp Mẹ': 'Nội trợ',
        'SĐT khẩn cấp': '0987654321',
        'Tổ xưởng': 1,
        'Chức vụ': 'Lớp trưởng',
        'Vị trí xưởng': 'Cầu nâng 2 trụ & Khung gầm',
        'Diện chính sách': 'Miễn giảm 70% (NĐ 238/2025)'
      },
      {
        'STT': 2,
        'Mã SV': '25CDOT-002',
        'Họ và tên': 'Trần Thị Mai',
        'Giới tính': 'Nữ',
        'Ngày sinh': '20/09/2006',
        'Dân tộc': 'Kinh',
        'Số CCCD': '001206012346',
        'Ngày cấp': '18/12/2021',
        'SĐT SV': '0912345679',
        'Email': 'mai.tt@caodangoto.edu.vn',
        'Hộ khẩu thường trú': 'Kim Bảng, Hà Nam',
        'Địa chỉ tạm trú': 'Số 12 ngõ 45 phố Nhổn, Bắc Từ Liêm, Hà Nội',
        'Họ tên Bố': 'Trần Văn Dũng',
        'SĐT Bố': '0987654323',
        'Họ tên Mẹ': 'Lê Thị Hoa',
        'SĐT Mẹ': '0987654324',
        'Nghề nghiệp Bố': 'Công nhân cơ khí',
        'Nghề nghiệp Mẹ': 'Lao động tự do',
        'SĐT khẩn cấp': '0987654323',
        'Tổ xưởng': 2,
        'Chức vụ': 'Bí thư',
        'Vị trí xưởng': 'Bàn tháo lắp Động cơ EFI',
        'Diện chính sách': 'Miễn giảm 70% (NĐ 238/2025)'
      },
      {
        'STT': 3,
        'Mã SV': '25CDOT-003',
        'Họ và tên': 'Lê Hoàng Long',
        'Giới tính': 'Nam',
        'Ngày sinh': '05/11/2006',
        'Dân tộc': 'Mường',
        'Số CCCD': '001206012347',
        'Ngày cấp': '18/12/2021',
        'SĐT SV': '0912345680',
        'Email': 'long.lh@caodangoto.edu.vn',
        'Hộ khẩu thường trú': 'Lạc Thủy, Hòa Bình',
        'Địa chỉ tạm trú': 'KTX Trường CĐ Công nghệ & Kỹ thuật',
        'Họ tên Bố': 'Lê Văn Giang',
        'SĐT Bố': '0987654325',
        'Họ tên Mẹ': 'Bùi Thị Hà',
        'SĐT Mẹ': '0987654326',
        'Nghề nghiệp Bố': 'Làm nông',
        'Nghề nghiệp Mẹ': 'Làm nông',
        'SĐT khẩn cấp': '0987654325',
        'Tổ xưởng': 3,
        'Chức vụ': 'Tổ trưởng',
        'Vị trí xưởng': 'Hộp số tự động AT/CVT',
        'Diện chính sách': 'Hộ nghèo & Miễn 70%'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DS_SinhVien');
    XLSX.writeFile(workbook, `Mau_DanhSach_HSSV_ChuanGDNN.xlsx`);
    showToast(`Đã tải tệp mẫu Excel chuẩn GDNN (.xlsx)!`);
  };

  // Filter students for the current class
  let filteredStudents = students.filter(s => {
    if (!s) return false;
    if (s.classId !== currentClass) return false;
    if (groupFilter !== 'all' && s.workshopGroup !== Number(groupFilter)) return false;
    if (policyFilter !== 'all' && !(s.policy && s.policy.includes(policyFilter))) return false;
    if (statusFilter !== 'all' && s.academicStatus !== statusFilter) return false;
    if (genderFilter !== 'all' && s.gender !== genderFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return Boolean(
        (s.fullName && s.fullName.toLowerCase().includes(term)) ||
        (s.id && s.id.toLowerCase().includes(term)) ||
        (s.idCard && s.idCard.includes(term)) ||
        (s.phone && s.phone.includes(term)) ||
        (s.permanentAddress && s.permanentAddress.toLowerCase().includes(term))
      );
    }
    return true;
  });

  // Sorting logic
  if (sortField) {
    filteredStudents = [...filteredStudents].sort((a, b) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (field: 'id' | 'fullName' | 'birthDate') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'STT', 'MSSV', 'Họ và tên HSSV', 'Giới tính', 'Ngày sinh', 'Dân tộc', 'Số CCCD', 'Ngày cấp', 'SĐT SV', 'Email',
      'HKTT', 'Địa chỉ tạm trú', 'Họ tên Bố', 'SĐT Bố', 'Họ tên Mẹ', 'SĐT Mẹ', 'Nghề nghiệp Bố', 'Nghề nghiệp Mẹ',
      'SĐT khẩn cấp', 'Tổ xưởng', 'Chức vụ', 'Vị trí xưởng', 'Đối tượng chính sách', 'Chuyên cần %'
    ];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.id,
      `"${s.fullName}"`,
      s.gender,
      s.birthDate,
      s.ethnicity || 'Kinh',
      `'${s.idCard}`,
      `'${s.idCardIssueDate || '18/12/2021'}`,
      `'${s.phone}`,
      s.email,
      `"${s.permanentAddress}"`,
      `"${s.temporaryAddress}"`,
      `"${s.fatherName}"`,
      `'${s.fatherPhone}`,
      `"${s.motherName}"`,
      `'${s.motherPhone}`,
      `"${s.fatherJob || s.parentJob || ''}"`,
      `"${s.motherJob || ''}"`,
      `'${s.emergencyPhone}`,
      `Tổ ${s.workshopGroup}`,
      s.role,
      `"${s.station}"`,
      `"${s.policy || 'Nghề nặng nhọc, độc hại'}"`,
      s.attendanceRate !== undefined ? `${s.attendanceRate}%` : '100%'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DS_SinhVien_${currentClass}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handler cập nhật từng trường trong khung nhập trực tiếp 23 trường
  const handleUpdateEditableField = (field: keyof Student, value: any) => {
    setEditableStudent(prev => {
      if (!prev) return null;
      const next = { ...prev, [field]: value };
      if (field === 'workshopGroup') {
        const stationMap: Record<number, string> = {
          1: 'Cầu nâng 2 trụ & Khung gầm',
          2: 'Bàn tháo lắp Động cơ EFI',
          3: 'Hộp số tự động AT/CVT',
          4: 'Điện xe & Scan tool OBD-II'
        };
        next.station = stationMap[Number(value)] || next.station;
      }
      if (field === 'policy') {
        const is70 = String(value).includes('70%') || String(value).includes('nặng nhọc');
        const standard = next.tuitionStatus?.standardTuition || 7500000;
        const subsidy = is70 ? Math.round(standard * 0.7) : 0;
        const payable = standard - subsidy;
        const paid = next.tuitionStatus?.paidAmount || 0;
        const debt = Math.max(0, payable - paid);
        next.tuitionStatus = {
          ...next.tuitionStatus,
          governmentSubsidy: subsidy,
          studentPayable: payable,
          debtAmount: debt,
          isComplete: debt === 0
        };
      }
      return next;
    });
  };

  // Handler cập nhật tài chính học phí trực tiếp
  const handleUpdateEditableTuition = (subField: keyof Student['tuitionStatus'], value: number) => {
    setEditableStudent(prev => {
      if (!prev) return null;
      const current = { ...(prev.tuitionStatus || {
        standardTuition: 7500000,
        governmentSubsidy: 5250000,
        studentPayable: 2250000,
        paidAmount: 2250000,
        debtAmount: 0,
        isComplete: true
      }), [subField]: value };

      if (subField === 'standardTuition') {
        const is70 = prev.policy.includes('70%') || prev.policy.includes('nặng nhọc');
        const subsidy = is70 ? Math.round(value * 0.7) : 0;
        const payable = value - subsidy;
        current.governmentSubsidy = subsidy;
        current.studentPayable = payable;
        current.debtAmount = Math.max(0, payable - current.paidAmount);
        current.isComplete = current.debtAmount === 0;
      } else if (subField === 'paidAmount') {
        current.debtAmount = Math.max(0, current.studentPayable - value);
        current.isComplete = current.debtAmount === 0;
      }
      return { ...prev, tuitionStatus: current };
    });
  };

  // Lưu hồ sơ sinh viên từ khung nhập trực tiếp 23 trường
  const handleSaveDirectStudent = () => {
    if (!editableStudent) return;
    if (!editableStudent.fullName.trim()) {
      showToast('⚠️ Vui lòng nhập Họ và tên sinh viên.');
      return;
    }
    if (!editableStudent.id.trim()) {
      showToast('⚠️ Vui lòng nhập Mã sinh viên (MSSV).');
      return;
    }
    onUpdateStudent(editableStudent);
    setSelectedStudent(editableStudent);
    showToast(`✅ Đã lưu trực tiếp toàn bộ 23 mục hồ sơ sinh viên ${editableStudent.fullName} (${editableStudent.id}) thành công!`);
  };

  // Chuyển sinh viên trước / sau trong danh sách lọc
  const currentSelectedIdx = editableStudent 
    ? filteredStudents.findIndex(s => s.id === editableStudent.id) 
    : -1;

  const handlePrevStudent = () => {
    if (currentSelectedIdx > 0) {
      const prev = filteredStudents[currentSelectedIdx - 1];
      setSelectedStudent(prev);
      setEditableStudent({ ...prev });
    }
  };

  const handleNextStudent = () => {
    if (currentSelectedIdx >= 0 && currentSelectedIdx < filteredStudents.length - 1) {
      const next = filteredStudents[currentSelectedIdx + 1];
      setSelectedStudent(next);
      setEditableStudent({ ...next });
    }
  };

  // Handler cập nhật trực tiếp tại ô trên bảng
  const handleDirectTableCellChange = (studentId: string, field: keyof Student, val: any) => {
    const target = students.find(s => s.id === studentId);
    if (!target) return;
    const updated = { ...target, [field]: val };
    if (field === 'workshopGroup') {
      const stationMap: Record<number, string> = {
        1: 'Cầu nâng 2 trụ & Khung gầm',
        2: 'Bàn tháo lắp Động cơ EFI',
        3: 'Hộp số tự động AT/CVT',
        4: 'Điện xe & Scan tool OBD-II'
      };
      updated.station = stationMap[Number(val)] || updated.station;
    }
    onUpdateStudent(updated);
  };

  // Thêm nhanh sinh viên từ dòng cuối bảng
  const handleAddQuickStudent = () => {
    if (!quickAddRow.fullName?.trim()) {
      showToast('⚠️ Vui lòng nhập Họ và tên sinh viên để thêm nhanh.');
      return;
    }
    const newId = quickAddRow.id?.trim() || `25CDOT21${String(students.length + 1).padStart(2, '0')}`;
    const newStud: Student = {
      id: newId,
      fullName: quickAddRow.fullName.trim(),
      gender: (quickAddRow.gender as any) || 'Nam',
      birthDate: quickAddRow.birthDate || '15/05/2007',
      ethnicity: quickAddRow.ethnicity || 'Kinh',
      idCard: quickAddRow.idCard || '026207000000',
      idCardIssueDate: quickAddRow.idCardIssueDate || '18/12/2021',
      phone: quickAddRow.phone || '0912.000.000',
      email: quickAddRow.email || `${newId.toLowerCase()}@caodangoto.edu.vn`,
      permanentAddress: quickAddRow.permanentAddress || 'Hà Nội',
      temporaryAddress: quickAddRow.temporaryAddress || 'KTX K1',
      fatherName: quickAddRow.fatherName || 'Nguyễn Văn Phụ Huynh',
      fatherPhone: quickAddRow.fatherPhone || '0912.xxx.xxx',
      motherName: quickAddRow.motherName || 'Trần Thị Mẹ',
      motherPhone: quickAddRow.motherPhone || '0913.xxx.xxx',
      parentJob: quickAddRow.parentJob || 'Lao động tự do',
      emergencyPhone: quickAddRow.emergencyPhone || quickAddRow.fatherPhone || '0912.xxx.xxx',
      workshopGroup: (Number(quickAddRow.workshopGroup) || 1) as any,
      role: (quickAddRow.role as any) || 'Thành viên',
      station: (quickAddRow.station as any) || 'Cầu nâng 2 trụ & Khung gầm',
      policy: quickAddRow.policy || 'Nghề nặng nhọc, độc hại',
      tuitionStatus: {
        standardTuition: 7500000,
        governmentSubsidy: 5250000,
        studentPayable: 2250000,
        paidAmount: 2250000,
        debtAmount: 0,
        isComplete: true
      },
      academicStatus: (quickAddRow.academicStatus as any) || 'Đang học bình thường',
      teacherNotes: quickAddRow.teacherNotes || 'Được thêm trực tiếp từ bảng trích ngang.',
      classId: currentClass,
      attendanceRate: Number(quickAddRow.attendanceRate) || 100
    };
    onAddStudent(newStud);
    setQuickAddRow({
      fullName: '',
      gender: 'Nam',
      birthDate: '15/05/2007',
      ethnicity: 'Kinh',
      idCard: '',
      idCardIssueDate: '18/12/2021',
      phone: '',
      email: '',
      permanentAddress: '',
      temporaryAddress: 'KTX K1',
      fatherName: '',
      fatherPhone: '',
      motherName: '',
      motherPhone: '',
      parentJob: 'Lao động tự do',
      emergencyPhone: '',
      workshopGroup: 1,
      role: 'Thành viên',
      station: 'Cầu nâng 2 trụ & Khung gầm',
      policy: 'Nghề nặng nhọc, độc hại',
      academicStatus: 'Đang học bình thường',
      attendanceRate: 100,
      teacherNotes: ''
    });
    showToast(`✅ Đã thêm sinh viên ${newStud.fullName} (${newStud.id}) trực tiếp vào lớp ${currentClass}!`);
  };

  // Batch action handlers cho SelectionToolbar (Hình 3)
  const handleBatchDivideGroups = () => {
    if (selectedIds.length === 0) return;
    let grp = 1;
    selectedIds.forEach((id) => {
      const student = students.find(s => s.id === id);
      if (student) {
        onUpdateStudent({ ...student, workshopGroup: grp as any });
        grp = grp >= 4 ? 1 : grp + 1;
      }
    });
    showToast(`✅ Đã chia đều ${selectedIds.length} sinh viên đã chọn vào 4 Tổ thực hành!`);
  };

  const handleBatchChangeGroup = (targetGroup: number) => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => {
      const student = students.find(s => s.id === id);
      if (student) {
        onUpdateStudent({ ...student, workshopGroup: targetGroup as any });
      }
    });
    showToast(`✅ Đã chuyển ${selectedIds.length} sinh viên sang Tổ ${targetGroup}!`);
  };

  // Drag and drop handlers cho danh sách sinh viên
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedStudentId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedStudentId === targetId) return;

    const row = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - row.top;
    const isAbove = offsetY < row.height / 2;
    setDragOverStudentId(targetId);
    setDragPosition(isAbove ? 'above' : 'below');
  };

  const handleDragLeave = () => {
    // Giữ trạng thái mượt mà khi di chuyển qua các ô trong cùng dòng
  };

  const handleDragEnd = () => {
    setDraggedStudentId(null);
    setDragOverStudentId(null);
    setDragPosition(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedStudentId || draggedStudentId === targetId) {
      handleDragEnd();
      return;
    }

    // Tắt sắp xếp tự động theo tên/mã để giữ thứ tự tùy chỉnh kéo thả
    if (sortField) {
      setSortField(null);
    }

    const currentClassStudents = students.filter(s => s.classId === currentClass);
    const otherStudents = students.filter(s => s.classId !== currentClass);

    const fromIndex = currentClassStudents.findIndex(s => s.id === draggedStudentId);
    if (fromIndex === -1) {
      handleDragEnd();
      return;
    }

    const updatedClassStudents = [...currentClassStudents];
    const [movedStudent] = updatedClassStudents.splice(fromIndex, 1);

    let toIndex = updatedClassStudents.findIndex(s => s.id === targetId);
    if (toIndex === -1) toIndex = 0;

    let insertIndex = dragPosition === 'below' ? toIndex + 1 : toIndex;
    insertIndex = Math.max(0, Math.min(insertIndex, updatedClassStudents.length));

    updatedClassStudents.splice(insertIndex, 0, movedStudent);

    const fullUpdatedList = [...updatedClassStudents, ...otherStudents];
    if (onReorderStudents) {
      onReorderStudents(fullUpdatedList);
    }

    showToast(`↔️ Đã kéo thả chuyển SV ${movedStudent.fullName} đến vị trí thứ ${insertIndex + 1}!`);
    handleDragEnd();
  };

  const handleMoveSelectedToTop = () => {
    if (selectedIds.length === 0) return;
    if (sortField) setSortField(null);

    const currentClassStudents = students.filter(s => s.classId === currentClass);
    const otherStudents = students.filter(s => s.classId !== currentClass);
    const selectedSet = new Set(selectedIds);

    const selectedList = currentClassStudents.filter(s => selectedSet.has(s.id));
    const unselectedList = currentClassStudents.filter(s => !selectedSet.has(s.id));

    const reordered = [...selectedList, ...unselectedList, ...otherStudents];
    if (onReorderStudents) {
      onReorderStudents(reordered);
    }
    showToast(`⬆️ Đã ưu tiên chuyển ${selectedIds.length} sinh viên đã chọn lên đầu danh sách.`);
  };

  const handleMoveSelectedToBottom = () => {
    if (selectedIds.length === 0) return;
    if (sortField) setSortField(null);

    const currentClassStudents = students.filter(s => s.classId === currentClass);
    const otherStudents = students.filter(s => s.classId !== currentClass);
    const selectedSet = new Set(selectedIds);

    const selectedList = currentClassStudents.filter(s => selectedSet.has(s.id));
    const unselectedList = currentClassStudents.filter(s => !selectedSet.has(s.id));

    const reordered = [...unselectedList, ...selectedList, ...otherStudents];
    if (onReorderStudents) {
      onReorderStudents(reordered);
    }
    showToast(`⬇️ Đã chuyển ${selectedIds.length} sinh viên đã chọn xuống cuối danh sách.`);
  };

  return (
    <>
      <div className="flex-1 bg-slate-50 p-3 sm:p-4 md:p-5 overflow-y-auto space-y-3 relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="sticky top-2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center justify-between gap-3 text-xs border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* 1. FILTER BAR & SELECTION TOOLBAR (Thay hiển thị mục như hình 2 thành hiển thị như hình 3) */}
      {selectedIds.length > 0 ? (
        <SelectionToolbar
          selectedIds={selectedIds}
          currentClass={currentClass}
          onClearSelection={() => setSelectedIds([])}
          onDeleteStudents={() => {
            const count = selectedIds.length;
            setConfirmDialog({
              isOpen: true,
              title: `XÓA ${count} SINH VIÊN ĐÃ CHỌN`,
              message: `Thầy/Cô có chắc chắn muốn xóa ${count} sinh viên đã chọn khỏi lớp ${currentClass}? Toàn bộ dữ liệu điểm số, chuyên cần và kết quả rèn luyện của các sinh viên này cũng sẽ bị xóa.`,
              confirmText: `Xác nhận xóa ${count} sinh viên`,
              onConfirm: () => {
                const idsToDelete = [...selectedIds];
                if (onBulkDeleteStudents) {
                  onBulkDeleteStudents(idsToDelete);
                } else if (onDeleteStudent) {
                  idsToDelete.forEach(id => onDeleteStudent(id));
                }
                setSelectedIds([]);
                if (selectedStudent && idsToDelete.includes(selectedStudent.id)) {
                  setSelectedStudent(null);
                }
                showToast(`🗑️ Đã xóa thành công ${count} sinh viên đã chọn khỏi hệ thống.`);
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
              }
            });
          }}
          onDivideGroups={handleBatchDivideGroups}
          onChangeGroup={handleBatchChangeGroup}
          onMoveToTop={handleMoveSelectedToTop}
          onMoveToBottom={handleMoveSelectedToBottom}
        />
      ) : (
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-1 min-w-[300px]">
            {/* Ô tìm kiếm */}
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Tìm nhanh trong bảng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Dropdown 1: Tất cả các Tổ */}
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value as any)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả các Tổ</option>
              <option value="1">Tổ 1</option>
              <option value="2">Tổ 2</option>
              <option value="3">Tổ 3</option>
              <option value="4">Tổ 4</option>
            </select>

            {/* Dropdown 2: Tất cả chính sách */}
            <select
              value={policyFilter}
              onChange={(e) => setPolicyFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả chính sách</option>
              <option value="Nghề nặng nhọc, độc hại">Nghề nặng nhọc, độc hại</option>
              <option value="Miễn giảm 70%">Miễn giảm 70% (NĐ 238)</option>
              <option value="Hộ nghèo">Hộ nghèo</option>
              <option value="Con thương binh">Con thương binh</option>
            </select>

            {/* Dropdown 3: Tất cả tình trạng */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả tình trạng</option>
              <option value="Đang học bình thường">Đang học bình thường</option>
              <option value="Cảnh báo học vụ">Cảnh báo học vụ</option>
              <option value="Nguy cơ cấm thi">Nguy cơ cấm thi</option>
              <option value="Nợ môn">Nợ môn</option>
            </select>

            {/* Dropdown 4: Tất cả giới tính */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          {/* Nút bên phải: In DS Sinh Viên */}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs py-1.5 px-3.5 rounded-lg shadow-xs transition cursor-pointer shrink-0 select-none"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In DS Sinh Viên</span>
          </button>
        </div>
      )}

      {/* 3. BẢNG DANH SÁCH CHI TIẾT */}
      {/* Table Header Banner: Chế độ xem phân hệ + Xuất Excel (Ẩn các mục bỏ như Hình 1) */}
      <div 
        style={{ backgroundColor: themeSettings?.tableHeaderBg || '#004e92' }}
        className="text-white px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 select-none rounded-t-xl"
      >

          {/* View Mode Selector Tabs */}
          <div className="flex items-center gap-1 bg-blue-950/70 p-1 rounded-lg border border-blue-800/80 text-[11px] font-bold">
            <button
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-yellow-400 text-slate-900 shadow-2xs'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800/50'
              }`}
              title="Hiển thị toàn bộ 23 trường trích ngang nghiệp vụ GDNN"
            >
              Chuẩn 23 trường
            </button>
            <button
              onClick={() => setViewMode('workshop')}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                viewMode === 'workshop'
                  ? 'bg-yellow-400 text-slate-900 shadow-2xs'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800/50'
              }`}
              title="Phân tổ xưởng, chức vụ & vị trí thiết bị thực hành"
            >
              Phân luồng xưởng
            </button>
            <button
              onClick={() => setViewMode('contact')}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                viewMode === 'contact'
                  ? 'bg-yellow-400 text-slate-900 shadow-2xs'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800/50'
              }`}
              title="CCCD, số điện thoại, email, HKTT & liên hệ gia đình"
            >
              Hồ sơ & Liên hệ
            </button>
            <button
              onClick={() => setViewMode('policy')}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                viewMode === 'policy'
                  ? 'bg-yellow-400 text-slate-900 shadow-2xs'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800/50'
              }`}
              title="Chính sách miễn giảm 70% NĐ 238 & tình hình học phí"
            >
              Chính sách & Học phí
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs py-1 px-3 rounded-lg transition cursor-pointer shadow-2xs active:scale-95"
              title="Thêm mới một sinh viên vào lớp"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Thêm Sinh Viên</span>
            </button>
            <label
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-1 px-3 rounded-lg transition cursor-pointer shadow-2xs active:scale-95"
              title="Nạp và phục hồi danh sách sinh viên từ tệp JSON chuẩn"
            >
              <Upload className="w-3.5 h-3.5 text-yellow-300" />
              <span>Nạp JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const text = await file.text();
                    const parsed = JSON.parse(text);
                    const studentsToImport = parsed.students || parsed.danhSachSinhVien || parsed.sinhVien || (Array.isArray(parsed) ? parsed : []);
                    if (studentsToImport.length > 0 && onBulkAddStudents) {
                      onBulkAddStudents(studentsToImport, true);
                      alert(`✅ [NẠP JSON THÀNH CÔNG]: Đã nạp thành công ${studentsToImport.length} sinh viên từ tệp '${file.name}' vào lớp ${currentClass}!`);
                    } else {
                      alert('⚠️ Không tìm thấy danh sách sinh viên hợp lệ trong tệp JSON.');
                    }
                  } catch (err: any) {
                    alert(`⚠️ Lỗi nạp tệp JSON: ${err?.message || 'Định dạng không hợp lệ'}`);
                  }
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>
            <button
              onClick={() => {
                setImportFile(null);
                setParsedStudents([]);
                setImportError(null);
                setSelectedForImport(new Set());
                setIsImportModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1 px-3 rounded-lg transition cursor-pointer shadow-2xs active:scale-95"
              title="Nạp danh sách sinh viên từ tệp Excel (.xlsx, .xls, .csv)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Nạp từ Excel</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1 px-3 rounded-lg transition cursor-pointer shadow-2xs active:scale-95"
              title="Xuất danh sách trích ngang ra file Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>
            {filteredStudents.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: `XÓA TOÀN BỘ DANH SÁCH LỚP ${currentClass}`,
                    message: `⚠️ CẢNH BÁO: Thầy/Cô có chắc chắn muốn xóa TOÀN BỘ ${filteredStudents.length} sinh viên của lớp ${currentClass}? Toàn bộ hồ sơ trích ngang, điểm số và chuyên cần của lớp này sẽ bị xóa sạch khỏi hệ thống.`,
                    confirmText: `Xác nhận xóa toàn bộ (${filteredStudents.length} SV)`,
                    onConfirm: () => {
                      const allCurrentClassIds = filteredStudents.map(s => s.id);
                      if (onClearClassStudents) {
                        onClearClassStudents();
                      } else if (onBulkDeleteStudents) {
                        onBulkDeleteStudents(allCurrentClassIds);
                      } else if (onDeleteStudent) {
                        allCurrentClassIds.forEach(id => onDeleteStudent(id));
                      }
                      setSelectedIds([]);
                      setSelectedStudent(null);
                      showToast(`🗑️ Đã xóa toàn bộ ${allCurrentClassIds.length} sinh viên của lớp ${currentClass} thành công!`);
                      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    }
                  });
                }}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-1 px-3 rounded-lg transition cursor-pointer shadow-2xs active:scale-95"
                title={`Xóa toàn bộ ${filteredStudents.length} sinh viên của lớp ${currentClass}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Toàn Bộ ({filteredStudents.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Thông báo khi bật chế độ nhập trực tiếp trên bảng */}
        {isDirectTableEdit && (
          <div className="bg-amber-50 border-b border-amber-200 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0"></span>
              <span><strong>CHẾ ĐỘ NHẬP TRỰC TIẾP TRÊN BẢNG ĐANG BẬT:</strong> Thầy/Cô có thể sửa trực tiếp dữ liệu tại các ô và bấm nút Lưu (💾) trên từng dòng hoặc thêm nhanh ở cuối bảng.</span>
            </div>
            <button 
              onClick={() => setIsDirectTableEdit(false)}
              className="text-amber-800 hover:text-amber-950 underline font-bold cursor-pointer shrink-0"
            >
              Tắt chế độ nhập trực tiếp
            </button>
          </div>
        )}

        {/* Bảng Dữ Liệu Grid Cấu Trúc Trích Ngang */}
        <div className="overflow-x-auto max-h-[calc(100vh-270px)] border-t border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead 
              style={{ backgroundColor: '#ffffff' }}
              className="bg-white text-slate-700 font-bold border-b-2 border-slate-300 text-[11px] uppercase tracking-wider sticky top-0 z-30 select-none shadow-xs"
            >
              <tr style={{ backgroundColor: '#ffffff' }} className="bg-white">
                {/* 1. Checkbox */}
                <th 
                  style={{ backgroundColor: '#ffffff' }}
                  className="py-2.5 px-2.5 w-10 text-center border-r border-slate-200 sticky left-0 z-40 bg-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>

                {/* 2. STT Header */}
                <th 
                  style={{ backgroundColor: '#ffffff' }}
                  className="py-2.5 px-2 text-center w-12 border-r border-slate-200 sticky left-10 z-40 bg-white select-none font-bold text-slate-800"
                  title="Số thứ tự danh sách"
                >
                  STT
                </th>

                {/* 3. [1] Mã SV */}
                <th 
                  onClick={() => handleSort('id')}
                  style={{ backgroundColor: '#ffffff' }}
                  className="py-2.5 px-2.5 cursor-pointer hover:bg-slate-100 min-w-[115px] border-r border-slate-200 sticky left-[88px] z-40 bg-white font-bold text-slate-800 whitespace-nowrap"
                  title="Mã định danh học sinh - sinh viên"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="flex items-center">
                      <span className="text-blue-700 font-bold mr-1">[1]</span>
                      <span>Mã SV</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">⇅</span>
                  </div>
                </th>

                {/* 4. [2] Họ và Tên */}
                <th 
                  onClick={() => handleSort('fullName')}
                  style={{ backgroundColor: '#ffffff' }}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 min-w-[180px] border-r-2 border-slate-300 sticky left-[203px] z-40 bg-white shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)] font-bold text-slate-800 whitespace-nowrap"
                  title="Họ và tên học sinh - sinh viên"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="flex items-center">
                      <span className="text-blue-700 font-bold mr-1">[2]</span>
                      <span>Họ và Tên</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">⇅</span>
                  </div>
                </th>

                {/* ===== CÁC CỘT THEO CHẾ ĐỘ XEM (Toàn bộ có style nền trắng thuần #ffffff không bị nhìn xuyên chữ) ===== */}
                {viewMode === 'all' && (
                  <>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2 text-center min-w-[85px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-blue-700 font-bold mr-1">[3]</span> Giới Tính
                    </th>
                    <th onClick={() => handleSort('birthDate')} style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2.5 cursor-pointer hover:bg-slate-100 min-w-[110px] text-center border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-blue-700 font-bold mr-1">[4]</span>
                        <span>Ngày Sinh</span>
                        <span className="text-slate-400 text-[10px]">⇅</span>
                      </div>
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2 text-center min-w-[80px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-blue-700 font-bold mr-1">[5]</span> Dân Tộc
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[130px] text-center border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-blue-700 font-bold mr-1">[6]</span> Số CCCD
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2.5 min-w-[105px] text-center border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-blue-700 font-bold mr-1">[7]</span> Ngày cấp
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[135px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-blue-700 font-bold mr-1">[8]</span> Số ĐTSV
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[185px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-blue-700 font-bold mr-1">[9]</span> Email SV
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[220px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-indigo-700 font-bold mr-1">[10]</span> Hộ khẩu thường trú
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[190px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-indigo-700 font-bold mr-1">[11]</span> Địa chỉ tạm trú
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[155px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-indigo-700 font-bold mr-1">[12]</span> Họ Tên Bố
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[135px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-indigo-700 font-bold mr-1">[13]</span> Số ĐT Bố
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[155px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-indigo-700 font-bold mr-1">[14]</span> Nghề nghiệp bố
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[155px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-indigo-700 font-bold mr-1">[15]</span> Họ Tên Mẹ
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[135px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-indigo-700 font-bold mr-1">[16]</span> Số ĐT Mẹ
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[155px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-indigo-700 font-bold mr-1">[17]</span> Nghề nghiệp mẹ
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2 text-center min-w-[85px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-amber-800 font-bold mr-1">[18]</span> Phân tổ
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2.5 min-w-[115px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-amber-800 font-bold mr-1">[19]</span> Chức vụ tổ
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[170px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-amber-800 font-bold mr-1">[20]</span> Phương tiện
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[220px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-emerald-700 font-bold mr-1">[21]</span> Diện chính sách
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 text-center min-w-[145px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-amber-800 font-bold mr-1">[22]</span> Tình trạng
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2.5 text-center min-w-[125px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-emerald-700 font-bold mr-1">[23]</span> Chuyên cần (%)
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[180px] border-r border-slate-200 bg-white font-bold text-slate-800 whitespace-nowrap">
                      Ghi Chú GVCN
                    </th>
                  </>
                )}

                {viewMode === 'workshop' && (
                  <>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2 text-center min-w-[85px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">
                      <span className="text-blue-700 font-bold mr-1">[3]</span> Giới tính
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2 text-center min-w-[95px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">
                      <span className="text-amber-800 font-bold mr-1">[18]</span> Tổ xưởng
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[130px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">
                      <span className="text-amber-800 font-bold mr-1">[19]</span> Chức vụ xưởng
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[200px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">
                      <span className="text-amber-800 font-bold mr-1">[20]</span> Phương tiện đi lại
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2.5 text-center min-w-[115px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">
                      <span className="text-emerald-700 font-bold mr-1">[23]</span> Chuyên cần (%)
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 text-center min-w-[150px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">
                      <span className="text-amber-800 font-bold mr-1">[22]</span> Tình trạng học vụ
                    </th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[240px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">
                      Ghi chú chuyên môn GVCN
                    </th>
                  </>
                )}

                {viewMode === 'contact' && (
                  <>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2 text-center min-w-[85px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-blue-700 font-bold mr-1">[3]</span> Giới tính</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2.5 min-w-[105px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-blue-700 font-bold mr-1">[4]</span> Ngày sinh</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2 text-center min-w-[80px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-blue-700 font-bold mr-1">[5]</span> Dân tộc</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[130px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-blue-700 font-bold mr-1">[6]</span> Số CCCD</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2.5 min-w-[105px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-blue-700 font-bold mr-1">[7]</span> Ngày cấp</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[135px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-blue-700 font-bold mr-1">[8]</span> SĐT cá nhân</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[170px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-blue-700 font-bold mr-1">[9]</span> Email SV</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[220px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-indigo-700 font-bold mr-1">[10]</span> Hộ khẩu thường trú</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[180px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-indigo-700 font-bold mr-1">[11]</span> Địa chỉ tạm trú</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[155px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-indigo-700 font-bold mr-1">[12]</span> Họ tên Bố</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[135px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-indigo-700 font-bold mr-1">[13]</span> Số ĐT Bố</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[155px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-indigo-700 font-bold mr-1">[14]</span> Nghề nghiệp bố</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[155px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-indigo-700 font-bold mr-1">[15]</span> Họ tên Mẹ</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[135px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-indigo-700 font-bold mr-1">[16]</span> Số ĐT Mẹ</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[155px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-indigo-700 font-bold mr-1">[17]</span> Nghề nghiệp mẹ</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[135px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">SĐT Khẩn cấp</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[180px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">Ghi Chú GVCN</th>
                  </>
                )}

                {viewMode === 'policy' && (
                  <>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2 text-center min-w-[95px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-amber-800 font-bold mr-1">[18]</span> Tổ xưởng</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[200px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-emerald-700 font-bold mr-1">[21]</span> Diện chính sách (NĐ 238)</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 text-right min-w-[130px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">Định mức học phí</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 text-right min-w-[130px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">Cấp bù 70% NSNN</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 text-right min-w-[130px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">Phải nộp (30%)</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 text-right min-w-[130px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">Đã nộp</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 text-right min-w-[115px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">Còn nợ</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 text-center min-w-[135px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">Tình trạng học phí</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-2.5 text-center min-w-[110px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800"><span className="text-emerald-700 font-bold mr-1">[23]</span> Chuyên cần</th>
                    <th style={{ backgroundColor: '#ffffff' }} className="py-2.5 px-3 min-w-[180px] border-r border-slate-200 bg-white whitespace-nowrap font-bold text-slate-800">Ghi Chú GVCN</th>
                  </>
                )}

                {/* Cột Thao tác */}
                <th 
                  style={{ backgroundColor: '#ffffff' }}
                  className="py-2.5 px-3 text-center min-w-[110px] sticky right-0 z-40 bg-white border-l-2 border-slate-300 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                >
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={26} className="py-8 text-center bg-white text-slate-400 text-xs">
                    Không có sinh viên nào trong danh sách.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const isChecked = selectedIds.includes(s.id);
                  const isLead = s.role === 'Tổ trưởng' || s.role === 'Lớp trưởng' || s.role === 'Lớp phó';
                  const stickyCellBg = isChecked ? '#eff6ff' : '#ffffff';
                  const isBeingDragged = draggedStudentId === s.id;
                  const isDragTarget = dragOverStudentId === s.id;

                  return (
                    <tr 
                      key={`${s.id}-${idx}`}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, s.id)}
                      onDragOver={(e) => handleDragOver(e, s.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, s.id)}
                      onDragEnd={handleDragEnd}
                      style={{ backgroundColor: isBeingDragged ? '#eff6ff' : stickyCellBg }}
                      className={`group transition-all select-none ${
                        isBeingDragged 
                          ? 'opacity-40 scale-[0.99] border-dashed border-2 border-blue-500 shadow-md ring-2 ring-blue-400/50' 
                          : isChecked 
                            ? 'bg-blue-50 font-medium' 
                            : 'bg-white hover:bg-slate-50'
                      } ${
                        isDragTarget && dragPosition === 'above' ? 'border-t-4 border-t-blue-600' : ''
                      } ${
                        isDragTarget && dragPosition === 'below' ? 'border-b-4 border-b-blue-600' : ''
                      }`}
                    >
                      {/* 1. Checkbox */}
                      <td 
                        style={{ backgroundColor: stickyCellBg }}
                        className="py-2 px-2.5 text-center border-r border-slate-200 sticky left-0 z-20 group-hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(s.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* 2. STT */}
                      <td 
                        style={{ backgroundColor: stickyCellBg }}
                        className="py-2 px-2 text-center border-r border-slate-200 sticky left-10 z-20 font-bold text-slate-700 group-hover:bg-slate-50 cursor-grab active:cursor-grabbing"
                        title="Số thứ tự • Nhấn giữ và kéo thả để di chuyển vị trí sinh viên"
                      >
                        <span className="font-bold text-xs text-slate-800">{idx + 1}</span>
                      </td>

                      {/* 3. Mã SV */}
                      <td 
                        style={{ backgroundColor: stickyCellBg }}
                        className="py-2 px-3 font-mono font-bold border-r border-slate-200 sticky left-[88px] z-20 whitespace-nowrap group-hover:bg-slate-50"
                      >
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                          title="Bấm để xem hồ sơ trích ngang 23 trường"
                        >
                          {s.id}
                        </button>
                      </td>

                      {/* 4. Họ tên HSSV & Ảnh thẻ sinh viên */}
                      <td 
                        style={{ backgroundColor: stickyCellBg }}
                        className="py-2 px-3 border-r-2 border-slate-300 sticky left-[203px] z-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)] whitespace-nowrap group-hover:bg-slate-50"
                      >
                        <div 
                          onClick={() => setSelectedStudent(s)}
                          className="flex items-center gap-2.5 cursor-pointer group"
                        >
                          {s.avatar ? (
                            <img 
                              src={s.avatar} 
                              alt={s.fullName} 
                              className="w-7 h-7 rounded-lg object-cover border border-blue-400 shadow-2xs shrink-0 group-hover:scale-105 transition" 
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-extrabold text-[11px] flex items-center justify-center shrink-0 border border-blue-300 shadow-2xs group-hover:bg-blue-200 transition">
                              {s.fullName.split(' ').pop()?.[0] || 'S'}
                            </div>
                          )}
                          <span className="font-bold text-slate-900 group-hover:text-blue-700">
                            {s.fullName}
                          </span>
                          {isLead && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1 py-0.2 rounded">
                              {s.role}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ===== CỘT THEO VIEW MODE ===== */}
                      {viewMode === 'all' && (
                        <>
                          {/* [3] Giới Tính */}
                          <td className="py-2 px-2 text-center border-r border-slate-200 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                              s.gender === 'Nam' ? 'bg-blue-100/80 text-blue-700' : 'bg-pink-100/80 text-pink-700'
                            }`}>
                              {s.gender}
                            </span>
                          </td>

                          {/* [4] Ngày Sinh */}
                          <td className="py-2 px-2.5 text-center text-slate-700 border-r border-slate-200 whitespace-nowrap">
                            {s.birthDate}
                          </td>

                          {/* [5] Dân Tộc */}
                          <td className="py-2 px-2 text-center text-slate-700 border-r border-slate-200 whitespace-nowrap">
                            {s.ethnicity || 'Kinh'}
                          </td>

                          {/* [6] Số CCCD */}
                          <td className="py-2 px-3 font-mono text-center text-slate-800 text-xs border-r border-slate-200 whitespace-nowrap">
                            {s.idCard}
                          </td>

                          {/* [7] Ngày cấp */}
                          <td className="py-2 px-2.5 text-center text-slate-700 border-r border-slate-200 whitespace-nowrap">
                            {s.idCardIssueDate || '18/12/2021'}
                          </td>

                          {/* [8] Số ĐTSV */}
                          <td className="py-2 px-3 font-mono text-slate-800 border-r border-slate-200 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>{s.phone}</span>
                              {s.phone && (
                                <a 
                                  href={`tel:${s.phone.replace(/[^0-9]/g, '')}`} 
                                  className="text-blue-600 hover:text-blue-800 p-0.5 rounded hover:bg-blue-50"
                                  title={`Gọi điện cho ${s.fullName}`}
                                >
                                  <Phone className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* [9] Email Sinh Viên */}
                          <td className="py-2 px-3 font-mono text-slate-700 text-xs border-r border-slate-200 whitespace-nowrap">
                            {s.email}
                          </td>

                          {/* [10] Hộ Khẩu Thường Trú */}
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-200 whitespace-nowrap max-w-[240px] truncate" title={s.permanentAddress}>
                            {s.permanentAddress}
                          </td>

                          {/* [11] Địa chỉ tạm trú */}
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-200 whitespace-nowrap max-w-[200px] truncate" title={s.temporaryAddress}>
                            {s.temporaryAddress}
                          </td>

                          {/* [12] Họ Tên Bố */}
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-200 whitespace-nowrap font-medium">
                            {s.fatherName}
                          </td>

                          {/* [13] Số ĐT Bố */}
                          <td className="py-2 px-3 font-mono text-slate-800 border-r border-slate-200 whitespace-nowrap">
                            {s.fatherPhone}
                          </td>

                          {/* [14] Nghề Nghiệp Bố */}
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-200 whitespace-nowrap">
                            {s.fatherJob || s.parentJob || ''}
                          </td>

                          {/* [15] Họ Tên Mẹ */}
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-200 whitespace-nowrap font-medium">
                            {s.motherName}
                          </td>

                          {/* [16] Số ĐT Mẹ */}
                          <td className="py-2 px-3 font-mono text-slate-800 border-r border-slate-200 whitespace-nowrap">
                            {s.motherPhone}
                          </td>

                          {/* [17] Nghề Nghiệp Mẹ */}
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-200 whitespace-nowrap">
                            {s.motherJob || ''}
                          </td>

                          {/* [18] Phân tổ xưởng */}
                          <td className="py-2 px-2 text-center border-r border-slate-200 whitespace-nowrap">
                            <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded font-bold text-xs">
                              Tổ {s.workshopGroup}
                            </span>
                          </td>

                          {/* [19] Vai Trò Tổ */}
                          <td className="py-2 px-2.5 text-slate-800 border-r border-slate-200 whitespace-nowrap font-medium">
                            {s.role}
                          </td>

                          {/* [20] Phương tiện đi lại */}
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-200 whitespace-nowrap max-w-[180px] truncate" title={s.station}>
                            {s.station || 'Xe máy'}
                          </td>

                          {/* [21] Chế Độ Chính Sách */}
                          <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">
                            <span className="border border-amber-300 bg-amber-50/80 text-amber-900 px-2.5 py-0.5 rounded font-bold text-[11px] inline-block">
                              {s.policy || 'Miễn giảm 70% học nghề (NĐ 238/2025/NĐ-CP)'}
                            </span>
                          </td>

                          {/* [22] Tình Trạng */}
                          <td className="py-2 px-3 text-center whitespace-nowrap border-r border-slate-200">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              s.academicStatus === 'Đang học bình thường'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : s.academicStatus === 'Nguy cơ cấm thi'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {s.academicStatus === 'Đang học bình thường' ? 'Đang học' : s.academicStatus}
                            </span>
                          </td>

                          {/* [23] Chuyên cần (%) */}
                          <td className="py-2 px-2.5 text-center whitespace-nowrap border-r border-slate-200">
                            <span className={`font-bold text-xs ${
                              (s.attendanceRate ?? 100) >= 95 ? 'text-emerald-700' : (s.attendanceRate ?? 100) >= 80 ? 'text-amber-700' : 'text-rose-700'
                            }`}>
                              {s.attendanceRate !== undefined ? `${s.attendanceRate}%` : '100%'}
                            </span>
                          </td>

                          {/* Ghi Chú GVCN */}
                          <td className="py-2 px-3 text-slate-600 border-r border-slate-200 whitespace-nowrap max-w-[200px] truncate" title={s.teacherNotes || ''}>
                            {s.teacherNotes || ''}
                          </td>
                        </>
                      )}

                      {viewMode === 'workshop' && (
                        <>
                          <td className="py-2 px-2 text-center border-r border-slate-200 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                              s.gender === 'Nam' ? 'bg-blue-100/80 text-blue-700' : 'bg-pink-100/80 text-pink-700'
                            }`}>
                              {s.gender}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center border-r border-slate-200 whitespace-nowrap">
                            <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded font-bold text-xs">
                              Tổ {s.workshopGroup}
                            </span>
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap font-bold text-slate-800">
                            {s.role}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">
                            <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded font-semibold text-xs inline-block">
                              🛠️ {s.station}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-center whitespace-nowrap border-r border-slate-200">
                            <span className={`font-black text-xs ${
                              (s.attendanceRate ?? 100) >= 95 ? 'text-emerald-600' : 'text-amber-600'
                            }`}>
                              {s.attendanceRate || 100}%
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center whitespace-nowrap border-r border-slate-200">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {s.academicStatus}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-700 italic border-r border-slate-200 max-w-sm truncate" title={s.teacherNotes}>
                            {s.teacherNotes || 'Chưa có ghi chú đặc biệt.'}
                          </td>
                        </>
                      )}

                      {viewMode === 'contact' && (
                        <>
                          <td className="py-2 px-2 text-center border-r border-slate-200 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                              s.gender === 'Nam' ? 'bg-blue-100/80 text-blue-700' : 'bg-pink-100/80 text-pink-700'
                            }`}>
                              {s.gender}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-slate-700 border-r border-slate-200 whitespace-nowrap font-medium text-center">
                            {s.birthDate}
                          </td>
                          <td className="py-2 px-2 text-center text-slate-700 border-r border-slate-200 whitespace-nowrap">
                            {s.ethnicity || 'Kinh'}
                          </td>
                          <td className="py-2 px-3 font-mono text-center text-slate-800 text-xs border-r border-slate-200 whitespace-nowrap">
                            {s.idCard}
                          </td>
                          <td className="py-2 px-2.5 text-center text-slate-600 text-xs border-r border-slate-200 whitespace-nowrap">
                            {s.idCardIssueDate || '18/12/2021'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-slate-800 text-xs">{s.phone}</span>
                              <button
                                onClick={() => showToast(`Đã mở kết nối liên hệ tới SV ${s.fullName} (${s.phone})`)}
                                className="text-sky-600 hover:text-sky-800 cursor-pointer p-0.5"
                                title="Nhắn tin"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-700 text-xs border-r border-slate-200 whitespace-nowrap">
                            {s.email}
                          </td>
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-200 max-w-xs truncate" title={s.permanentAddress}>
                            {s.permanentAddress}
                          </td>
                          <td className="py-2 px-3 text-slate-600 border-r border-slate-200 max-w-xs truncate" title={s.temporaryAddress}>
                            {s.temporaryAddress}
                          </td>
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-200 whitespace-nowrap font-medium">
                            {s.fatherName}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-800 border-r border-slate-200 whitespace-nowrap">
                            {s.fatherPhone}
                          </td>
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-200 whitespace-nowrap">
                            {s.fatherJob || s.parentJob || ''}
                          </td>
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-200 whitespace-nowrap font-medium">
                            {s.motherName}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-800 border-r border-slate-200 whitespace-nowrap">
                            {s.motherPhone}
                          </td>
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-200 whitespace-nowrap">
                            {s.motherJob || ''}
                          </td>
                          <td className="py-2 px-3 font-mono text-red-600 font-semibold border-r border-slate-200 whitespace-nowrap">
                            {s.emergencyPhone || s.fatherPhone}
                          </td>
                          <td className="py-2 px-3 text-slate-600 border-r border-slate-200 whitespace-nowrap max-w-[200px] truncate" title={s.teacherNotes || ''}>
                            {s.teacherNotes || ''}
                          </td>
                        </>
                      )}

                      {viewMode === 'policy' && (
                        <>
                          <td className="py-2 px-2 text-center border-r border-slate-200 whitespace-nowrap">
                            <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded font-bold text-xs">
                              Tổ {s.workshopGroup}
                            </span>
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap font-bold text-amber-900">
                            {s.policy}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-medium border-r border-slate-200 whitespace-nowrap">
                            {s.tuitionStatus.standardTuition.toLocaleString()} đ
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 border-r border-slate-200 whitespace-nowrap bg-emerald-50/40">
                            {s.tuitionStatus.governmentSubsidy.toLocaleString()} đ
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-blue-800 border-r border-slate-200 whitespace-nowrap bg-blue-50/30">
                            {s.tuitionStatus.studentPayable.toLocaleString()} đ
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                            {s.tuitionStatus.paidAmount.toLocaleString()} đ
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 border-r border-slate-200 whitespace-nowrap">
                            {s.tuitionStatus.debtAmount.toLocaleString()} đ
                          </td>
                          <td className="py-2 px-3 text-center border-r border-slate-200 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                              s.tuitionStatus.isComplete && s.tuitionStatus.debtAmount === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {s.tuitionStatus.isComplete && s.tuitionStatus.debtAmount === 0 
                                ? '✓ Đã hoàn tất 100%' 
                                : `Còn nợ HP (${s.tuitionStatus.debtAmount.toLocaleString()} đ)`}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-center whitespace-nowrap border-r border-slate-200">
                            <span className="font-bold text-emerald-600">
                              {s.attendanceRate || 100}%
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 border-r border-slate-200 whitespace-nowrap max-w-[200px] truncate" title={s.teacherNotes || ''}>
                            {s.teacherNotes || ''}
                          </td>
                        </>
                      )}

                      {/* Cột Thao tác (Sticky right-0 với nền trắng thuần để không bị nhìn xuyên chữ) */}
                      <td 
                        style={{ backgroundColor: stickyCellBg }}
                        className="py-2 px-2.5 text-center whitespace-nowrap sticky right-0 z-20 border-l-2 border-slate-300 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)] group-hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Nút Lưu dòng khi ở chế độ nhập trực tiếp */}
                          {isDirectTableEdit && (
                            <button
                              onClick={() => {
                                showToast(`✅ Đã lưu trực tiếp các thay đổi của SV ${s.fullName} (${s.id})`);
                              }}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer flex items-center gap-1 text-[11px] shadow-2xs"
                              title="Lưu dòng này"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Lưu</span>
                            </button>
                          )}

                          {/* Nút Xem & Sửa chi tiết 23 trường */}
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="p-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer border border-blue-200"
                            title="Mở khung nhập & sửa trực tiếp đầy đủ 23 trường"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Sửa */}
                          <button
                            onClick={() => {
                              setSelectedStudent(s);
                            }}
                            className="p-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 transition cursor-pointer border border-amber-200"
                            title="Chỉnh sửa 23 trường trực tiếp"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Xóa */}
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDialog({
                                isOpen: true,
                                title: 'XÓA SINH VIÊN KHỎI LỚP',
                                message: `Thầy/Cô có chắc chắn muốn xóa sinh viên ${s.fullName} (${s.id}) khỏi danh sách lớp ${currentClass}? Toàn bộ điểm số, chuyên cần và dữ liệu rèn luyện của sinh viên này cũng sẽ được đồng bộ xóa sạch khỏi hệ thống.`,
                                confirmText: 'Xác nhận xóa',
                                onConfirm: () => {
                                  onDeleteStudent(s.id);
                                  setSelectedIds(prev => prev.filter(x => x !== s.id));
                                  if (selectedStudent?.id === s.id) setSelectedStudent(null);
                                  showToast(`Đã xóa sinh viên ${s.fullName} (${s.id}) thành công.`);
                                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                                }
                              });
                            }}
                            className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer border border-rose-200"
                            title="Xóa sinh viên khỏi hệ thống"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Dòng Thêm Nhanh Sinh Viên Trực Tiếp Vào Bảng */}
              {isDirectTableEdit && (
                <tr className="bg-white border-t-2 border-emerald-400">
                  <td 
                    style={{ backgroundColor: '#ffffff' }}
                    className="py-2 px-2.5 text-center sticky left-0 z-20 bg-white text-emerald-800 font-black border-r border-slate-200"
                  >
                    ＋
                  </td>
                  <td 
                    style={{ backgroundColor: '#ffffff' }}
                    className="py-2 px-2 text-center sticky left-10 z-20 bg-white text-emerald-800 font-black border-r border-slate-200"
                  >
                    *
                  </td>
                  <td 
                    style={{ backgroundColor: '#ffffff' }}
                    className="py-1 px-2 sticky left-[88px] z-20 bg-white border-r border-slate-200"
                  >
                    <input
                      placeholder={`25CDOT21${String(students.length + 1).padStart(2, '0')}`}
                      value={quickAddRow.id || ''}
                      onChange={(e) => setQuickAddRow({ ...quickAddRow, id: e.target.value })}
                      className="w-full p-1 border border-emerald-300 rounded font-mono font-bold text-xs bg-white text-blue-900"
                    />
                  </td>
                  <td 
                    style={{ backgroundColor: '#ffffff' }}
                    className="py-1 px-2 border-r-2 border-emerald-400 sticky left-[203px] z-20 bg-white shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)]"
                  >
                    <input
                      placeholder="Nhập Họ và tên SV mới..."
                      value={quickAddRow.fullName || ''}
                      onChange={(e) => setQuickAddRow({ ...quickAddRow, fullName: e.target.value })}
                      className="w-full p-1 border border-emerald-300 rounded font-extrabold text-xs bg-white text-slate-900"
                    />
                  </td>
                  {viewMode === 'all' && (
                    <>
                      <td className="py-1 px-1 text-center border-r border-emerald-200">
                        <select
                          value={quickAddRow.gender || 'Nam'}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, gender: e.target.value as any })}
                          className="p-1 border border-emerald-300 rounded text-xs bg-white"
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </select>
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <input
                          value={quickAddRow.birthDate || '15/05/2007'}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, birthDate: e.target.value })}
                          className="w-24 p-1 border border-emerald-300 rounded text-xs bg-white"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200 text-center">
                        <input
                          value={quickAddRow.ethnicity || 'Kinh'}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, ethnicity: e.target.value })}
                          className="w-16 p-1 border border-emerald-300 rounded text-xs text-center bg-white"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <input
                          placeholder="CCCD 12 số"
                          value={quickAddRow.idCard || ''}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, idCard: e.target.value })}
                          className="w-28 p-1 border border-emerald-300 rounded font-mono text-xs bg-white"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <input
                          value={quickAddRow.idCardIssueDate || '18/12/2021'}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, idCardIssueDate: e.target.value })}
                          className="w-24 p-1 border border-emerald-300 rounded text-xs bg-white"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <input
                          placeholder="09xx.xxx.xxx"
                          value={quickAddRow.phone || ''}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, phone: e.target.value })}
                          className="w-28 p-1 border border-emerald-300 rounded font-mono text-xs bg-white font-bold text-blue-900"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <input
                          placeholder="Email"
                          value={quickAddRow.email || ''}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, email: e.target.value })}
                          className="w-32 p-1 border border-emerald-300 rounded font-mono text-xs bg-white"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <input
                          placeholder="Hộ khẩu thường trú..."
                          value={quickAddRow.permanentAddress || ''}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, permanentAddress: e.target.value })}
                          className="w-40 p-1 border border-emerald-300 rounded text-xs bg-white"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <input
                          placeholder="Tạm trú / KTX..."
                          value={quickAddRow.temporaryAddress || 'KTX K1'}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, temporaryAddress: e.target.value })}
                          className="w-32 p-1 border border-emerald-300 rounded text-xs bg-white"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <input
                          placeholder="Họ tên Bố"
                          value={quickAddRow.fatherName || ''}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, fatherName: e.target.value })}
                          className="w-28 p-1 border border-emerald-300 rounded text-xs bg-white"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <input
                          placeholder="SĐT Bố"
                          value={quickAddRow.fatherPhone || ''}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, fatherPhone: e.target.value })}
                          className="w-24 p-1 border border-emerald-300 rounded font-mono text-xs bg-white"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <input
                          placeholder="Nghề nghiệp bố"
                          value={quickAddRow.fatherJob || ''}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, fatherJob: e.target.value })}
                          className="w-28 p-1 border border-emerald-300 rounded text-xs bg-white"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <input
                          placeholder="Họ tên Mẹ"
                          value={quickAddRow.motherName || ''}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, motherName: e.target.value })}
                          className="w-28 p-1 border border-emerald-300 rounded text-xs bg-white"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <input
                          placeholder="SĐT Mẹ"
                          value={quickAddRow.motherPhone || ''}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, motherPhone: e.target.value })}
                          className="w-24 p-1 border border-emerald-300 rounded font-mono text-xs bg-white"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <input
                          placeholder="Nghề nghiệp mẹ"
                          value={quickAddRow.motherJob || ''}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, motherJob: e.target.value })}
                          className="w-28 p-1 border border-emerald-300 rounded text-xs bg-white"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200 text-center">
                        <select
                          value={quickAddRow.workshopGroup || 1}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, workshopGroup: Number(e.target.value) as any })}
                          className="p-1 border border-emerald-300 rounded text-xs bg-white font-bold"
                        >
                          <option value="1">Tổ 1</option>
                          <option value="2">Tổ 2</option>
                          <option value="3">Tổ 3</option>
                          <option value="4">Tổ 4</option>
                        </select>
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <select
                          value={quickAddRow.role || 'Thành viên'}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, role: e.target.value as any })}
                          className="p-1 border border-emerald-300 rounded text-xs bg-white"
                        >
                          <option value="Thành viên">Thành viên</option>
                          <option value="Tổ trưởng">Tổ trưởng</option>
                          <option value="Tổ phó">Tổ phó</option>
                          <option value="Lớp trưởng">Lớp trưởng</option>
                        </select>
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <input
                          value={quickAddRow.station || 'Xe máy'}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, station: e.target.value as any })}
                          placeholder="Phương tiện"
                          className="w-28 p-1 border border-emerald-300 rounded text-xs bg-white"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <select
                          value={quickAddRow.policy || 'Nghề nặng nhọc, độc hại'}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, policy: e.target.value })}
                          className="p-1 border border-emerald-300 rounded text-xs bg-white font-semibold"
                        >
                          <option value="Nghề nặng nhọc, độc hại">Nghề nặng nhọc, độc hại</option>
                          <option value="Miễn giảm 70% (NĐ 238/2025)">Miễn giảm 70% (NĐ 238)</option>
                          <option value="Hộ nghèo & Miễn 70%">Hộ nghèo & Miễn 70%</option>
                        </select>
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200 text-center">
                        <select
                          value={quickAddRow.academicStatus || 'Đang học bình thường'}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, academicStatus: e.target.value as any })}
                          className="p-1 border border-emerald-300 rounded text-xs bg-white font-medium"
                        >
                          <option value="Đang học bình thường">Đang học bình thường</option>
                          <option value="Cảnh báo học vụ">Cảnh báo học vụ</option>
                          <option value="Nguy cơ cấm thi">Nguy cơ cấm thi</option>
                        </select>
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200 text-center">
                        <input
                          type="number"
                          value={quickAddRow.attendanceRate ?? 100}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, attendanceRate: Number(e.target.value) })}
                          className="w-16 p-1 border border-emerald-300 rounded text-xs text-center font-bold bg-white text-emerald-700"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-emerald-200">
                        <input
                          placeholder="Ghi chú GVCN..."
                          value={quickAddRow.teacherNotes || ''}
                          onChange={(e) => setQuickAddRow({ ...quickAddRow, teacherNotes: e.target.value })}
                          className="w-32 p-1 border border-emerald-300 rounded text-xs bg-white"
                        />
                      </td>
                    </>
                  )}
                  <td 
                    style={{ backgroundColor: '#ffffff' }}
                    className="py-1 px-2 text-center sticky right-0 z-20 bg-white border-l-2 border-emerald-400"
                  >
                    <button
                      onClick={handleAddQuickStudent}
                      className="w-full py-1.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      title="Thêm sinh viên này vào lớp"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Dòng Tổng kết Tfoot (Spreadsheet Summary) */}
            <tfoot 
              style={{ backgroundColor: '#ffffff' }}
              className="bg-white text-slate-800 font-bold border-t-2 border-slate-300 text-xs sticky bottom-0 z-20"
            >
              <tr style={{ backgroundColor: '#ffffff' }} className="bg-white">
                <td 
                  colSpan={4} 
                  style={{ backgroundColor: '#ffffff' }}
                  className="py-2.5 px-3 border-r-2 border-slate-300 text-center font-black sticky left-0 z-30 bg-white shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)]"
                >
                  TỔNG CỘNG: {filteredStudents.length} HSSV
                </td>
                <td 
                  colSpan={30} 
                  style={{ backgroundColor: '#ffffff' }}
                  className="py-2.5 px-4 bg-white"
                >
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
                    <span>Nam: <strong className="text-blue-700">{filteredStudents.filter(s => s.gender === 'Nam').length}</strong> SV</span>
                    <span>Nữ: <strong className="text-pink-700">{filteredStudents.filter(s => s.gender === 'Nữ').length}</strong> SV</span>
                    <span>•</span>
                    <span>Miễn giảm 70% NĐ 238: <strong className="text-amber-800">100%</strong> ({filteredStudents.length}/{filteredStudents.length} SV)</span>
                    <span>•</span>
                    <span>Chuyên cần TB: <strong className="text-emerald-700">{(filteredStudents.reduce((acc, cur) => acc + (cur.attendanceRate ?? 100), 0) / (filteredStudents.length || 1)).toFixed(1)}%</strong></span>
                    <span>•</span>
                    <span>Công nợ học phí: <strong className="text-emerald-700">0 đ (Đã hoàn tất 100%)</strong></span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>




      {isImportModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-sky-200" />
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide">NẠP DANH SÁCH HSSV TỪ TỆP EXCEL / CSV</h3>
                  <p className="text-[11px] text-blue-100">
                    Lớp tiếp nhận: <strong className="text-yellow-300 font-bold">{currentClass}</strong> • Tương thích tệp .xlsx, .xls, .csv
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFile(null);
                  setParsedStudents([]);
                  setImportError(null);
                }} 
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 text-xs overflow-y-auto space-y-4 flex-1">
              {/* Unconditional File Input for Excel/CSV */}
              <input 
                type="file" 
                accept=".xlsx,.xls,.csv" 
                onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }} 
                className="hidden" 
                id="excel-file-upload-input" 
              />

              {/* Trạng thái 1: Chưa chọn tệp */}
              {!importFile && !isParsingFile && (
                <div className="space-y-4">
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-blue-50/40 hover:bg-blue-50/80 transition cursor-pointer flex flex-col items-center gap-3 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition shadow-2xs">
                      <FileUp className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">Kéo thả tệp Excel (.xlsx, .xls) hoặc CSV vào đây</span>
                      <span className="text-slate-500 text-xs mt-1 block">Hoặc bấm nút bên dưới để chọn tệp từ máy tính của bạn</span>
                    </div>

                    <label 
                      htmlFor="excel-file-upload-input" 
                      className="mt-1 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold py-2 px-5 rounded-xl cursor-pointer transition shadow-xs flex items-center gap-2 active:scale-98"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Chọn tệp Excel từ máy tính</span>
                    </label>
                  </div>

                  {/* Thông tin hỗ trợ chuẩn GDNN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-3.5 space-y-1.5 text-sky-950 text-[11px]">
                      <div className="font-bold flex items-center gap-1.5 text-sky-900">
                        <CheckCircle2 className="w-4 h-4 text-sky-600" />
                        <span>Tự động nhận diện thông minh:</span>
                      </div>
                      <div>• Tự động khớp 23 cột chuẩn GDNN (Mã SV, Họ tên, CCCD, Ngày sinh, SĐT, Tổ xưởng...).</div>
                      <div>• Tự động ghép cột <strong>"Họ đệm"</strong> và <strong>"Tên"</strong> nếu file trường tách riêng.</div>
                      <div>• Tự động bỏ qua các hàng tiêu đề, tên trường, tên khoa ở đầu tệp.</div>
                    </div>

                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-1.5 text-amber-950 text-[11px]">
                      <div className="font-bold flex items-center gap-1.5 text-amber-900">
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        <span>Chính sách & Phân tổ xưởng:</span>
                      </div>
                      <div>• Tự động áp dụng chính sách <strong>Nghị định 238/2025/NĐ-CP</strong> (Miễn giảm 70% học phí).</div>
                      <div>• Tự động chia tổ xưởng thực hành (Tổ 1 - 4) và các trạm thực hành nếu tệp chưa có.</div>
                      <div>• Có bảng xem trước đầy đủ để kiểm tra trước khi ghi nhận vào hệ thống.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trạng thái 2: Đang đọc tệp */}
              {isParsingFile && (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-9 h-9 text-blue-600 animate-spin" />
                  <p className="font-bold text-slate-800 text-sm">Đang đọc và phân tích cấu trúc tệp Excel...</p>
                  <p className="text-slate-500 text-xs">Vui lòng đợi giây lát trong khi hệ thống đối soát 23 trường dữ liệu chuẩn GDNN.</p>
                </div>
              )}

              {/* Trạng thái 3: Lỗi đọc tệp */}
              {importError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm">Không thể nạp dữ liệu từ tệp này</div>
                      <div className="text-xs mt-1 text-rose-800">{importError}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-rose-200">
                    <label 
                      htmlFor="excel-file-upload-input" 
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3.5 rounded-lg cursor-pointer transition text-xs"
                    >
                      Chọn tệp khác
                    </label>
                    <button
                      onClick={handleDownloadTemplate}
                      className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold py-1.5 px-3.5 rounded-lg cursor-pointer transition text-xs flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải tệp mẫu Excel chuẩn để xem định dạng</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Trạng thái 4: Đã phân tích thành công -> Xem trước & Chọn chế độ nạp */}
              {parsedStudents.length > 0 && (
                <div className="space-y-3.5">
                  {/* Summary Bar */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          Đã bóc tách thành công <span className="text-emerald-700 font-extrabold">{parsedStudents.length}</span> sinh viên từ tệp:
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{importFile?.name}</span>
                          <span>•</span>
                          <span>{importFile?.size ? (importFile.size / 1024).toFixed(1) : 0} KB</span>
                        </div>
                      </div>
                    </div>

                    <label 
                      htmlFor="excel-file-upload-input" 
                      className="text-xs text-blue-700 hover:text-blue-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Chọn tệp khác</span>
                    </label>
                  </div>

                  {/* Chế độ nạp vào lớp */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="font-bold text-slate-800 text-xs">Chọn phương thức nạp vào lớp {currentClass}:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <label 
                        className={`p-2.5 rounded-lg border cursor-pointer flex items-start gap-2.5 transition ${
                          importMode === 'append' 
                            ? 'bg-blue-50/80 border-blue-400 text-blue-950 ring-1 ring-blue-400' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="importMode" 
                          checked={importMode === 'append'} 
                          onChange={() => setImportMode('append')}
                          className="mt-0.5 text-blue-600 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-xs">🟢 Bổ sung / Cập nhật vào danh sách lớp</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Giữ nguyên các sinh viên hiện có của lớp {currentClass}; thêm mới hoặc cập nhật nếu trùng MSSV.
                          </div>
                        </div>
                      </label>

                      <label 
                        className={`p-2.5 rounded-lg border cursor-pointer flex items-start gap-2.5 transition ${
                          importMode === 'replace' 
                            ? 'bg-amber-50/80 border-amber-400 text-amber-950 ring-1 ring-amber-400' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="importMode" 
                          checked={importMode === 'replace'} 
                          onChange={() => setImportMode('replace')}
                          className="mt-0.5 text-amber-600 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-xs">🔄 Thay thế toàn bộ danh sách lớp {currentClass}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Xóa danh sách sinh viên cũ của lớp này và thay thế bằng {parsedStudents.length} sinh viên từ tệp Excel.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Bảng xem trước dữ liệu */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <span>BẢNG XEM TRƯỚC DỮ LIỆU BÓC TÁCH</span>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                          Đã chọn {selectedForImport.size} / {parsedStudents.length} SV
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDialog({
                              isOpen: true,
                              title: 'XÓA TOÀN BỘ DANH SÁCH XEM TRƯỚC',
                              message: 'Thầy/Cô có chắc chắn muốn xóa toàn bộ danh sách bóc tách xem trước để chọn tệp khác?',
                              confirmText: 'Xóa xem trước',
                              onConfirm: () => {
                                setParsedStudents([]);
                                setImportFile(null);
                                setSelectedForImport(new Set());
                                showToast('Đã xóa toàn bộ danh sách xem trước.');
                                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                              }
                            });
                          }}
                          className="text-[11px] text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa toàn bộ DS xem trước</span>
                        </button>
                        <button
                          onClick={() => {
                            if (selectedForImport.size === parsedStudents.length) {
                              setSelectedForImport(new Set());
                            } else {
                              setSelectedForImport(new Set(parsedStudents.map((_, i) => i)));
                            }
                          }}
                          className="text-[11px] text-blue-700 hover:underline font-semibold cursor-pointer"
                        >
                          {selectedForImport.size === parsedStudents.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[260px] overflow-x-auto overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] sticky top-0 z-10">
                          <tr>
                            <th className="p-2 w-10 text-center">
                              <input 
                                type="checkbox"
                                checked={selectedForImport.size === parsedStudents.length && parsedStudents.length > 0}
                                onChange={() => {
                                  if (selectedForImport.size === parsedStudents.length) {
                                    setSelectedForImport(new Set());
                                  } else {
                                    setSelectedForImport(new Set(parsedStudents.map((_, i) => i)));
                                  }
                                }}
                                className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                              />
                            </th>
                            <th className="p-2 w-10 text-center">STT</th>
                            <th className="p-2 whitespace-nowrap">Mã SV</th>
                            <th className="p-2 whitespace-nowrap">Họ và tên</th>
                            <th className="p-2 text-center whitespace-nowrap">Giới tính</th>
                            <th className="p-2 whitespace-nowrap">Ngày sinh</th>
                            <th className="p-2 whitespace-nowrap">Số CCCD</th>
                            <th className="p-2 whitespace-nowrap">SĐT SV</th>
                            <th className="p-2 whitespace-nowrap">Tổ xưởng</th>
                            <th className="p-2 whitespace-nowrap">Vị trí thực hành</th>
                            <th className="p-2 whitespace-nowrap">Chính sách</th>
                            <th className="p-2 text-center whitespace-nowrap">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedStudents.map((s, idx) => {
                            const isSelected = selectedForImport.has(idx);
                            return (
                              <tr 
                                key={idx}
                                className={`transition hover:bg-blue-50/50 ${isSelected ? 'bg-white' : 'bg-slate-50/60 opacity-60'}`}
                              >
                                <td className="p-2 text-center">
                                  <input 
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {
                                      const next = new Set(selectedForImport);
                                      if (next.has(idx)) next.delete(idx);
                                      else next.add(idx);
                                      setSelectedForImport(next);
                                    }}
                                    className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                                  />
                                </td>
                                <td className="p-2 text-center font-bold text-slate-500">{idx + 1}</td>
                                <td className="p-2 font-mono font-bold text-blue-700 whitespace-nowrap">{s.id}</td>
                                <td className="p-2 font-bold text-slate-900 whitespace-nowrap">{s.fullName}</td>
                                <td className="p-2 text-center whitespace-nowrap">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${s.gender === 'Nam' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                    {s.gender}
                                  </span>
                                </td>
                                <td className="p-2 text-slate-600 whitespace-nowrap">{s.birthDate}</td>
                                <td className="p-2 font-mono text-slate-700 whitespace-nowrap">{s.idCard}</td>
                                <td className="p-2 font-mono text-slate-700 whitespace-nowrap">{s.phone}</td>
                                <td className="p-2 font-semibold text-amber-800 whitespace-nowrap">Tổ {s.workshopGroup}</td>
                                <td className="p-2 text-slate-600 text-[11px] whitespace-nowrap">{s.station}</td>
                                <td className="p-2 whitespace-nowrap">
                                  <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                    {s.policy}
                                  </span>
                                </td>
                                <td className="p-2 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteParsedStudent(idx)}
                                    className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer border border-rose-200"
                                    title="Xóa sinh viên này khỏi danh sách xem trước"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 font-bold rounded-xl text-slate-700 cursor-pointer flex items-center gap-1.5 transition text-xs shadow-2xs"
                  title="Tải tệp mẫu Excel chuẩn có sẵn cột và dữ liệu mẫu"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tải tệp mẫu Excel chuẩn GDNN</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportFile(null);
                    setParsedStudents([]);
                    setImportError(null);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold rounded-xl text-slate-700 cursor-pointer transition text-xs"
                >
                  Đóng
                </button>

                {parsedStudents.length > 0 && (
                  <button
                    onClick={handleConfirmImport}
                    disabled={selectedForImport.size === 0}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-extrabold rounded-xl cursor-pointer transition shadow-xs flex items-center gap-2 text-xs active:scale-98"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Xác nhận Nạp {selectedForImport.size} Sinh viên vào Lớp {currentClass}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs pt-16 sm:pt-20 p-4 pb-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-auto max-h-[85vh] overflow-hidden flex flex-col border border-slate-200 animate-in fade-in">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm uppercase">XEM TRƯỚC BẢN IN BIỂU MẪU A4: LỚP {unitInfo?.classId || currentClass}</h3>
              </div>
              <button onClick={() => setIsPrintModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto text-slate-800 text-xs space-y-4 font-serif printable-document">
              {/* Quốc hiệu tiêu ngữ */}
              <div className="flex justify-between items-start text-center pb-3 border-b border-slate-300">
                <div className="text-center w-1/2">
                  <div className="font-semibold uppercase text-[10px] sm:text-[11px] text-slate-600">
                    {unitInfo?.parentAgency || 'UBND TỈNH PHÚ THỌ'}
                  </div>
                  <div className="font-bold uppercase text-[11px] sm:text-xs text-slate-900">
                    {unitInfo?.schoolName || 'TRƯỜNG CAO ĐẲNG KỸ THUẬT - CÔNG NGHỆ VĨNH PHÚC'}
                  </div>
                  <div className="text-[11px] font-bold text-blue-900 underline underline-offset-2">
                    {unitInfo?.facultyName || 'KHOA CÔNG NGHỆ Ô TÔ'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Số: {unitInfo?.documentSymbol ? unitInfo.documentSymbol.replace('...', '01') : '01/TN-CĐOT'}
                  </div>
                </div>
                <div className="text-center w-1/2">
                  <div className="font-bold uppercase text-xs">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                  <div className="font-bold text-[11px] underline">Độc lập - Tự do - Hạnh phúc</div>
                  <div className="text-[11px] italic mt-1 text-slate-600">
                    {unitInfo?.issueLocation || 'Phú Thọ'}, ngày 09 tháng 10 năm 2026
                  </div>
                </div>
              </div>

              {selectedStudent ? (
                /* Bản in Phiếu trích ngang lý lịch cá nhân sinh viên 23 mục */
                <div className="space-y-4">
                  <div className="text-center py-1">
                    <h2 className="font-black text-base uppercase tracking-wide">
                      PHIẾU TRÍCH NGANG LÝ LỊCH HỌC SINH - SINH VIÊN
                    </h2>
                    <div className="font-bold text-xs mt-0.5">
                      Lớp: {unitInfo?.classId || currentClass} • Ngành: {unitInfo?.majorName || 'Công nghệ ô tô'} • Hệ: {unitInfo?.trainingSystem || 'Cao đẳng chính quy'}
                    </div>
                    <div className="text-[11px] italic text-slate-600">
                      Niên khóa: {unitInfo?.academicYear || '2025 - 2028'} • Căn cứ quản lý học vụ chuẩn GDNN
                    </div>
                  </div>

                  <div className="flex gap-4 items-start border border-slate-300 p-3.5 rounded-lg bg-slate-50/50">
                    <div className="w-28 h-40 border border-slate-400 bg-white rounded overflow-hidden flex flex-col items-center justify-center shrink-0 shadow-2xs">
                      {selectedStudent.avatar ? (
                        <img src={selectedStudent.avatar} alt={selectedStudent.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-slate-400 text-[10px] p-2">
                          <User className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                          <span>Ảnh 4x6</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <p>• Mã HSSV: <strong className="font-mono text-blue-900">{selectedStudent.id}</strong></p>
                        <p>• Họ và tên: <strong className="uppercase font-bold">{selectedStudent.fullName}</strong></p>
                        <p>• Giới tính: <strong>{selectedStudent.gender}</strong></p>
                        <p>• Ngày sinh: <strong>{selectedStudent.birthDate}</strong></p>
                        <p>• Dân tộc: <strong>{selectedStudent.ethnicity || 'Kinh'}</strong></p>
                        <p>• Số CCCD: <strong className="font-mono">{selectedStudent.idCard}</strong></p>
                        <p>• SĐT sinh viên: <strong className="font-mono">{selectedStudent.phone}</strong></p>
                        <p>• Email: <span className="font-mono">{selectedStudent.email}</span></p>
                        <p className="col-span-2">• Hộ khẩu thường trú: <strong>{selectedStudent.permanentAddress}</strong></p>
                        <p className="col-span-2">• Địa chỉ tạm trú / KTX: <strong>{selectedStudent.temporaryAddress}</strong></p>
                        <p>• Họ tên Bố: <strong>{selectedStudent.fatherName}</strong> (SĐT: {selectedStudent.fatherPhone})</p>
                        <p>• Nghề nghiệp Bố: <strong>{selectedStudent.fatherJob || selectedStudent.parentJob || 'Lao động tự do'}</strong></p>
                        <p>• Họ tên Mẹ: <strong>{selectedStudent.motherName}</strong> (SĐT: {selectedStudent.motherPhone})</p>
                        <p>• Nghề nghiệp Mẹ: <strong>{selectedStudent.motherJob || 'Lao động tự do'}</strong></p>
                        <p>• Phân tổ xưởng: <strong>Tổ {selectedStudent.workshopGroup} ({selectedStudent.role})</strong></p>
                        <p>• Vị trí xưởng: <strong>{selectedStudent.station}</strong></p>
                        <p>• Diện chính sách: <strong>{selectedStudent.policy}</strong></p>
                        <p>• Chuyên cần: <strong className="text-emerald-700">{selectedStudent.attendanceRate ?? 100}%</strong></p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] italic indent-6">
                    Học sinh - sinh viên cam kết các thông tin trích ngang kê khai trên đây hoàn toàn đúng sự thật, chấp hành nghiêm chỉnh nội quy xưởng thực hành và quy chế đào tạo của Nhà trường.
                  </p>
                </div>
              ) : (
                /* Bản in Danh sách trích ngang cả lớp A4 */
                <div className="space-y-3">
                  <div className="text-center py-1">
                    <h2 className="font-black text-base uppercase tracking-wide">
                      DANH SÁCH TRÍCH NGANG HỌC SINH - SINH VIÊN
                    </h2>
                    <div className="font-bold text-xs mt-0.5">
                      Lớp: {unitInfo?.classId || currentClass} • Ngành: {unitInfo?.majorName || 'Công nghệ ô tô'} • Hệ: {unitInfo?.trainingSystem || 'Cao đẳng chính quy'}
                    </div>
                    <div className="text-[11px] italic text-slate-600">
                      Niên khóa: {unitInfo?.academicYear || '2025 - 2028'} • Sĩ số: {filteredStudents.length} SV • Áp dụng NĐ 238/2025 & Quản trị xưởng
                    </div>
                  </div>

                  {/* Table A4 preview */}
                  <table className="w-full border-collapse border border-slate-400 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-center">
                        <th className="border border-slate-400 p-1 w-8">STT</th>
                        <th className="border border-slate-400 p-1">Mã SV</th>
                        <th className="border border-slate-400 p-1">Họ và tên</th>
                        <th className="border border-slate-400 p-1">Ngày sinh</th>
                        <th className="border border-slate-400 p-1">Giới tính</th>
                        <th className="border border-slate-400 p-1">Số CCCD</th>
                        <th className="border border-slate-400 p-1">SĐT SV</th>
                        <th className="border border-slate-400 p-1">Tổ</th>
                        <th className="border border-slate-400 p-1">Chính sách</th>
                        <th className="border border-slate-400 p-1">Chuyên cần</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s, idx) => (
                        <tr key={`${s.id}-${idx}`} className="text-center">
                          <td className="border border-slate-400 p-1">{idx + 1}</td>
                          <td className="border border-slate-400 p-1 font-bold">{s.id}</td>
                          <td className="border border-slate-400 p-1 text-left font-semibold">{s.fullName}</td>
                          <td className="border border-slate-400 p-1">{s.birthDate}</td>
                          <td className="border border-slate-400 p-1">{s.gender}</td>
                          <td className="border border-slate-400 p-1 font-mono">{s.idCard}</td>
                          <td className="border border-slate-400 p-1">{s.phone}</td>
                          <td className="border border-slate-400 p-1">Tổ {s.workshopGroup}</td>
                          <td className="border border-slate-400 p-1 text-left">{s.policy || 'Nghề nặng nhọc, độc hại'}</td>
                          <td className="border border-slate-400 p-1 font-bold">{s.attendanceRate || 100}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Chữ ký xác nhận */}
              <div className="grid grid-cols-2 text-center pt-6 text-xs">
                <div>
                  <div className="font-bold uppercase">
                    TRƯỞNG {unitInfo?.facultyName || 'KHOA CÔNG NGHỆ Ô TÔ'}
                  </div>
                  <div className="text-slate-400 italic text-[11px] mt-12">(Ký và ghi rõ họ tên)</div>
                  <div className="font-bold mt-2 text-sm">{unitInfo?.deanName || 'ThS: Đỗ Thế Huân'}</div>
                </div>
                <div>
                  <div className="font-bold uppercase">GIÁO VIÊN CHỦ NHIỆM LỚP</div>
                  <div className="text-slate-400 italic text-[11px] mt-12">(Ký và ghi rõ họ tên)</div>
                  <div className="font-bold mt-2 text-sm">{unitInfo?.advisorName || 'ThS: Nguyễn Chí Dũng'}</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5 shrink-0">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-semibold rounded-lg text-slate-700 cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 font-bold rounded-lg text-white cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>In Văn Bản Ngay (Ctrl + P)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: HỒ SƠ TRÍCH NGANG 23 TRƯỜNG CHUẨN GDNN - CHO PHÉP NHẬP & SỬA TRỰC TIẾP */}
      {selectedStudent && editableStudent && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs pt-16 sm:pt-20 p-2 sm:p-4 pb-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-auto max-h-[85vh] overflow-hidden flex flex-col border border-slate-200 animate-in fade-in">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-[#003870] via-[#004e92] to-[#005fa3] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-yellow-400 text-slate-900 font-black flex items-center justify-center text-sm shadow-2xs">
                  23
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-sm sm:text-base tracking-wide uppercase">
                      HỒ SƠ TRÍCH NGANG 23 TRƯỜNG CHUẨN GDNN
                    </h3>
                    <span className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-bold px-2 py-0.5 rounded text-[10px]">
                      Nhập trực tiếp
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100 flex items-center gap-2 flex-wrap">
                    <span>Sinh viên: <strong className="text-white">{editableStudent.fullName}</strong></span>
                    <span>•</span>
                    <span>MSSV: <strong className="text-yellow-300 font-mono">{editableStudent.id}</strong></span>
                    <span>•</span>
                    <span>Lớp: <strong className="text-white">{currentClass}</strong></span>
                  </p>
                </div>
              </div>

              {/* Top Navigation & Close */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={handlePrevStudent}
                  disabled={currentSelectedIdx <= 0}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                  title="Chuyển sang sinh viên phía trước trong danh sách"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">SV Trước</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStudent}
                  disabled={currentSelectedIdx < 0 || currentSelectedIdx >= filteredStudents.length - 1}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                  title="Chuyển sang sinh viên tiếp theo trong danh sách"
                >
                  <span className="hidden sm:inline">SV Tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="h-5 w-[1px] bg-white/20 mx-1"></div>
                <button 
                  onClick={() => setSelectedStudent(null)} 
                  className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg cursor-pointer transition"
                  title="Đóng khung hồ sơ"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs bg-slate-50/50">
              {/* Banner Hướng Dẫn & Ảnh Thẻ Chân Dung 3x4 */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50/70 to-slate-50 p-4 rounded-xl border border-blue-200/90 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                  {/* Khung Ảnh Thẻ 4x6 Chân Dung Sinh Viên */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-32 h-48 sm:w-36 sm:h-[13.5rem] rounded-xl border-2 border-dashed border-blue-400 bg-white shadow-sm overflow-hidden relative group flex flex-col items-center justify-center">
                      {editableStudent.avatar ? (
                        <img 
                          src={editableStudent.avatar} 
                          alt={editableStudent.fullName} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col items-center justify-center text-blue-500 p-2 text-center">
                          <User className="w-10 h-10 sm:w-12 sm:h-12 text-blue-300 mb-1" />
                          <span className="text-[10px] font-extrabold text-slate-700 uppercase">Ảnh thẻ 4x6</span>
                          <span className="text-[9px] text-slate-400">Chuẩn GDNN</span>
                        </div>
                      )}

                      {/* Overlay Thao Tác Khi Rê Chuột */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                        <label 
                          htmlFor="modal6-avatar-upload" 
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Camera className="w-3 h-3" />
                          <span>{editableStudent.avatar ? 'Đổi ảnh 4x6' : 'Tải ảnh 4x6'}</span>
                        </label>
                        {editableStudent.avatar && (
                          <button 
                            type="button" 
                            onClick={() => handleUpdateEditableField('avatar', '')}
                            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[10px] cursor-pointer"
                          >
                            Xóa ảnh
                          </button>
                        )}
                      </div>
                    </div>

                    <input 
                      type="file" 
                      accept="image/*" 
                      id="modal6-avatar-upload" 
                      onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                      onChange={(e) => handleAvatarFileChange(e, (url) => handleUpdateEditableField('avatar', url))} 
                      className="hidden" 
                    />

                    <div className="mt-1 flex items-center gap-1.5">
                      <label 
                        htmlFor="modal6-avatar-upload" 
                        className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <Camera className="w-3 h-3" />
                        <span>{editableStudent.avatar ? 'Đổi ảnh 4x6' : 'Tải ảnh 4x6'}</span>
                      </label>
                    </div>
                  </div>

                  {/* Thông tin định danh tóm tắt */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-base sm:text-lg text-slate-900">{editableStudent.fullName}</span>
                      <span className="bg-blue-600 text-white font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                        {editableStudent.id}
                      </span>
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded text-[10px]">
                        Tổ {editableStudent.workshopGroup} ({editableStudent.role})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                      <span>Vị trí: <strong>{editableStudent.station}</strong></span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">Chuyên cần: {editableStudent.attendanceRate ?? 100}%</span>
                      <span>•</span>
                      <span className="text-blue-700 font-semibold">{editableStudent.policy}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        {editableStudent.academicStatus}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Lớp {currentClass} • CCCD: {editableStudent.idCard}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. KHUNG NHẬP: ĐỊNH DANH CÁ NHÂN (MỤC 1 - 9) */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="font-extrabold text-blue-900 uppercase text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 font-black flex items-center justify-center text-[11px]">1</span>
                    <span>ĐỊNH DANH CÁ NHÂN (MỤC 1 - 9)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">9 trường dữ liệu cá nhân</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Mục 1: Mã SV */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-blue-700 font-bold mr-1">[1]</span> Mã HSSV (MSSV) *
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.id}
                      onChange={(e) => handleUpdateEditableField('id', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Mục 2: Họ và tên */}
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-blue-700 font-bold mr-1">[2]</span> Họ và tên HSSV *
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.fullName}
                      onChange={(e) => handleUpdateEditableField('fullName', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-extrabold text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Mục 3: Giới tính */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-blue-700 font-bold mr-1">[3]</span> Giới tính
                    </label>
                    <select
                      value={editableStudent.gender}
                      onChange={(e) => handleUpdateEditableField('gender', e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>

                  {/* Mục 4: Ngày sinh */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-blue-700 font-bold mr-1">[4]</span> Ngày sinh (DD/MM/YYYY)
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.birthDate}
                      onChange={(e) => handleUpdateEditableField('birthDate', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Mục 5: Dân tộc */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-blue-700 font-bold mr-1">[5]</span> Dân tộc
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.ethnicity || 'Kinh'}
                      onChange={(e) => handleUpdateEditableField('ethnicity', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Mục 6: Số CCCD */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-blue-700 font-bold mr-1">[6]</span> Số CCCD (12 số) *
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.idCard}
                      onChange={(e) => handleUpdateEditableField('idCard', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Mục 7: Ngày cấp CCCD */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-blue-700 font-bold mr-1">[7]</span> Ngày cấp CCCD
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.idCardIssueDate || '18/12/2021'}
                      onChange={(e) => handleUpdateEditableField('idCardIssueDate', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Mục 8: SĐT cá nhân */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-blue-700 font-bold mr-1">[8]</span> SĐT cá nhân (SV) *
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.phone}
                      onChange={(e) => handleUpdateEditableField('phone', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Mục 9: Email */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-blue-700 font-bold mr-1">[9]</span> Email sinh viên
                    </label>
                    <input 
                      type="email"
                      value={editableStudent.email}
                      onChange={(e) => handleUpdateEditableField('email', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Mục Bổ Sung: Đường Dẫn Ảnh Thẻ (URL / Tải Tệp) */}
                  <div className="md:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-blue-700 font-bold mr-1">[Ảnh]</span> Ảnh thẻ 3x4 HSSV (Dán link URL hoặc chọn tệp)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="text"
                        placeholder="https://... hoặc tải ảnh 3x4 từ máy tính"
                        value={editableStudent.avatar || ''}
                        onChange={(e) => handleUpdateEditableField('avatar', e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                      <label 
                        htmlFor="modal6-avatar-upload"
                        className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded-lg cursor-pointer shrink-0 transition flex items-center gap-1"
                        title="Chọn tệp ảnh thẻ từ máy tính"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Chọn tệp</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. KHUNG NHẬP: GIA ĐÌNH & LIÊN HỆ KHẨN CẤP (MỤC 10 - 17) */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="font-extrabold text-indigo-900 uppercase text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-[11px]">2</span>
                    <span>GIA ĐÌNH & LIÊN HỆ KHẨN CẤP (MỤC 10 - 17)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">8 trường địa chỉ & phụ huynh</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Mục 10: Hộ khẩu thường trú */}
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-indigo-700 font-bold mr-1">[10]</span> Hộ khẩu thường trú (HKTT)
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.permanentAddress}
                      onChange={(e) => handleUpdateEditableField('permanentAddress', e.target.value)}
                      placeholder="Xã/Phường, Huyện/Quận, Tỉnh/Thành phố..."
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Mục 11: Địa chỉ tạm trú */}
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-indigo-700 font-bold mr-1">[11]</span> Địa chỉ tạm trú / KTX
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.temporaryAddress}
                      onChange={(e) => handleUpdateEditableField('temporaryAddress', e.target.value)}
                      placeholder="KTX Trường / Nhà trọ số..."
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Mục 12: Họ tên Bố */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-indigo-700 font-bold mr-1">[12]</span> Họ tên Bố
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.fatherName}
                      onChange={(e) => handleUpdateEditableField('fatherName', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Mục 13: SĐT Bố */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-indigo-700 font-bold mr-1">[13]</span> Số điện thoại Bố
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.fatherPhone}
                      onChange={(e) => handleUpdateEditableField('fatherPhone', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Mục 14: Nghề nghiệp bố */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-indigo-700 font-bold mr-1">[14]</span> Nghề nghiệp bố
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.fatherJob !== undefined ? editableStudent.fatherJob : (editableStudent.parentJob || '')}
                      onChange={(e) => {
                        handleUpdateEditableField('fatherJob', e.target.value);
                        handleUpdateEditableField('parentJob', e.target.value);
                      }}
                      placeholder="Nghề nghiệp của Bố..."
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Mục 15: Họ tên Mẹ */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-indigo-700 font-bold mr-1">[15]</span> Họ tên Mẹ
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.motherName}
                      onChange={(e) => handleUpdateEditableField('motherName', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Mục 16: SĐT Mẹ */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-indigo-700 font-bold mr-1">[16]</span> Số điện thoại Mẹ
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.motherPhone}
                      onChange={(e) => handleUpdateEditableField('motherPhone', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Mục 17: Nghề nghiệp mẹ */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-indigo-700 font-bold mr-1">[17]</span> Nghề nghiệp mẹ
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.motherJob || ''}
                      onChange={(e) => handleUpdateEditableField('motherJob', e.target.value)}
                      placeholder="Nghề nghiệp của Mẹ..."
                      className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. KHUNG NHẬP: PHÂN LUỒNG XƯỞNG THỰC HÀNH & HỌC VỤ (MỤC 18 - 20 & 22 - 23) */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="font-extrabold text-amber-900 uppercase text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-amber-100 text-amber-700 font-black flex items-center justify-center text-[11px]">3</span>
                    <span>PHÂN LUỒNG XƯỞNG THỰC HÀNH & HỌC VỤ (MỤC 18 - 20 & 22 - 23)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Xưởng, chức vụ, học vụ & chuyên cần</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Mục 18: Phân tổ xưởng */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-amber-800 font-bold mr-1">[18]</span> Phân tổ xưởng thực hành
                    </label>
                    <select
                      value={editableStudent.workshopGroup}
                      onChange={(e) => handleUpdateEditableField('workshopGroup', Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="1">Tổ 1</option>
                      <option value="2">Tổ 2</option>
                    </select>
                  </div>

                  {/* Mục 19: Chức vụ tổ */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-amber-800 font-bold mr-1">[19]</span> Chức vụ trong lớp / tổ
                    </label>
                    <select
                      value={editableStudent.role}
                      onChange={(e) => handleUpdateEditableField('role', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="Thành viên">Thành viên</option>
                      <option value="Tổ trưởng">Tổ trưởng</option>
                      <option value="Tổ phó">Tổ phó</option>
                      <option value="Lớp trưởng">Lớp trưởng</option>
                      <option value="Lớp phó HT">Lớp phó HT</option>
                      <option value="Lớp phó ĐS">Lớp phó ĐS</option>
                      <option value="Bí thư">Bí thư chi đoàn</option>
                    </select>
                  </div>

                  {/* Mục 20: Phương tiện đi lại */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-amber-800 font-bold mr-1">[20]</span> Phương tiện đi lại
                    </label>
                    <input 
                      type="text"
                      value={editableStudent.station}
                      onChange={(e) => handleUpdateEditableField('station', e.target.value)}
                      placeholder="VD: Xe máy, Xe đạp điện..."
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Mục 22: Tình trạng học tập */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-amber-800 font-bold mr-1">[22]</span> Tình trạng học tập / Học vụ
                    </label>
                    <select
                      value={editableStudent.academicStatus}
                      onChange={(e) => handleUpdateEditableField('academicStatus', e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="Đang học bình thường">🟢 Đang học bình thường</option>
                      <option value="Cảnh báo học vụ">🟡 Cảnh báo học vụ</option>
                      <option value="Nguy cơ cấm thi">🔴 Nguy cơ cấm thi</option>
                      <option value="Nợ môn">🟠 Nợ môn</option>
                      <option value="Bảo lưu">⚪ Bảo lưu</option>
                    </select>
                  </div>

                  {/* Mục 23 (Phần 1): Tỷ lệ chuyên cần */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-amber-800 font-bold mr-1">[23]</span> Tỷ lệ chuyên cần (%)
                    </label>
                    <div className="relative">
                      <input 
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={editableStudent.attendanceRate ?? 100}
                        onChange={(e) => handleUpdateEditableField('attendanceRate', Number(e.target.value))}
                        className="w-full p-2 pr-8 border border-slate-300 rounded-lg font-black text-emerald-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <span className="absolute right-3 top-2 font-bold text-slate-400">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. KHUNG NHẬP: CHÍNH SÁCH NGHỊ ĐỊNH 238 & HỌC PHÍ (MỤC 21) */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="font-extrabold text-emerald-900 uppercase text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-[11px]">4</span>
                    <span>CHÍNH SÁCH NGHỊ ĐỊNH 238/2025/NĐ-CP & HỌC PHÍ (MỤC 21)</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold">Miễn giảm 70% ngành nặng nhọc độc hại</span>
                </div>

                <div className="space-y-3">
                  {/* Mục 21: Diện chính sách */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      <span className="text-emerald-700 font-bold mr-1">[21]</span> Diện chính sách miễn giảm học phí
                    </label>
                    <select
                      value={editableStudent.policy}
                      onChange={(e) => handleUpdateEditableField('policy', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white font-extrabold text-amber-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="Nghề nặng nhọc, độc hại (Miễn 70% theo NĐ 238/2025)">Nghề nặng nhọc, độc hại (Miễn 70% theo NĐ 238/2025)</option>
                      <option value="Miễn giảm 70% (NĐ 238/2025)">Miễn giảm 70% (NĐ 238/2025)</option>
                      <option value="Hộ nghèo & Miễn giảm 70%">Hộ nghèo & Miễn giảm 70%</option>
                      <option value="Cận nghèo & Miễn giảm 70%">Cận nghèo & Miễn giảm 70%</option>
                      <option value="Con thương binh, liệt sĩ & Miễn 70%">Con thương binh, liệt sĩ & Miễn 70%</option>
                      <option value="Mồ côi & Miễn giảm 70%">Mồ côi & Miễn giảm 70%</option>
                      <option value="Bộ đội xuất ngũ & Miễn giảm 70%">Bộ đội xuất ngũ & Miễn giảm 70%</option>
                      <option value="Không thuộc diện miễn giảm">Không thuộc diện miễn giảm</option>
                    </select>
                  </div>

                  {/* Bảng hạch toán tài chính trực tiếp */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                    <div>
                      <div className="text-[11px] text-slate-500 font-semibold mb-1">Định mức học phí</div>
                      <input 
                        type="number"
                        step="100000"
                        value={editableStudent.tuitionStatus?.standardTuition || 7500000}
                        onChange={(e) => handleUpdateEditableTuition('standardTuition', Number(e.target.value))}
                        className="w-full p-1.5 border border-slate-300 rounded text-center font-bold text-xs bg-white"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-semibold mb-1">Cấp bù 70% NSNN</div>
                      <div className="p-1.5 bg-emerald-100/70 border border-emerald-300 rounded font-extrabold text-emerald-800 text-xs">
                        {(editableStudent.tuitionStatus?.governmentSubsidy || 0).toLocaleString()} đ
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-semibold mb-1">SV nộp (30%)</div>
                      <div className="p-1.5 bg-blue-100/70 border border-blue-300 rounded font-extrabold text-blue-900 text-xs">
                        {(editableStudent.tuitionStatus?.studentPayable || 0).toLocaleString()} đ
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-semibold mb-1">Đã nộp thực tế</div>
                      <input 
                        type="number"
                        step="100000"
                        value={editableStudent.tuitionStatus?.paidAmount || 0}
                        onChange={(e) => handleUpdateEditableTuition('paidAmount', Number(e.target.value))}
                        className="w-full p-1.5 border border-slate-300 rounded text-center font-bold text-xs bg-white"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <div className="text-[11px] text-slate-500 font-semibold mb-1">Còn nợ học phí</div>
                      <div className={`p-1.5 border rounded font-black text-xs ${
                        (editableStudent.tuitionStatus?.debtAmount || 0) > 0 
                          ? 'bg-rose-100 text-rose-800 border-rose-300' 
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {(editableStudent.tuitionStatus?.debtAmount || 0) > 0 
                          ? `${(editableStudent.tuitionStatus?.debtAmount || 0).toLocaleString()} đ` 
                          : '✓ Đã hoàn tất'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. KHUNG NHẬP: GHI CHÚ SƯ PHẠM CỦA GVCN (MỤC 23 PHẦN 2) */}
              <div className="bg-yellow-50/60 rounded-xl border border-yellow-200 p-4 shadow-2xs space-y-2">
                <div className="font-extrabold text-yellow-950 uppercase text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-yellow-200 text-yellow-900 font-black flex items-center justify-center text-[11px]">5</span>
                  <span>GHI CHÚ SƯ PHẠM CỦA GVCN (MỤC 23 MỞ RỘNG)</span>
                </div>
                <textarea
                  rows={2}
                  value={editableStudent.teacherNotes || ''}
                  onChange={(e) => handleUpdateEditableField('teacherNotes', e.target.value)}
                  placeholder="Ghi nhận theo dõi rèn luyện, hoàn cảnh gia đình, giải pháp phụ đạo chuyên cần hoặc kỹ năng thực hành..."
                  className="w-full p-2.5 border border-yellow-300 rounded-lg bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>

            {/* Modal Footer: Nút Lưu Trực Tiếp & Thao Tác */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: 'XÓA SINH VIÊN KHỎI HỆ THỐNG',
                    message: `Thầy/Cô có chắc chắn muốn xóa sinh viên ${editableStudent.fullName} (${editableStudent.id})? Toàn bộ hồ sơ trích ngang 23 mục và điểm số, chuyên cần của sinh viên này sẽ bị xóa hoàn toàn.`,
                    confirmText: 'Xác nhận xóa sinh viên',
                    onConfirm: () => {
                      const deletedId = editableStudent.id;
                      onDeleteStudent(deletedId);
                      setSelectedIds(prev => prev.filter(x => x !== deletedId));
                      setSelectedStudent(null);
                      showToast(`Đã xóa sinh viên ${editableStudent.fullName} khỏi hệ thống.`);
                      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    }
                  });
                }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Xóa Sinh Viên</span>
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 font-bold rounded-xl text-slate-700 cursor-pointer flex items-center gap-1.5 transition text-xs shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>In Mẫu A4</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold rounded-xl text-slate-700 cursor-pointer transition text-xs"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={handleSaveDirectStudent}
                  className="px-5 py-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 hover:from-blue-800 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer flex items-center gap-2 text-xs active:scale-95 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>LƯU THAY ĐỔI 23 MỤC (CẬP NHẬT TRỰC TIẾP)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: THÊM SINH VIÊN MỚI (ĐẦY ĐỦ 23 MỤC CHUẨN) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-200 animate-in fade-in">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-sm uppercase">THÊM SINH VIÊN MỚI VÀO LỚP {currentClass} (23 TRƯỜNG CHUẨN)</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const getVal = (name: string, fallback = '') => {
                  const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
                  return el && el.value !== undefined ? el.value.trim() : fallback;
                };

                const groupVal = Number(getVal('workshopGroup', '1')) || 1;
                const stationMap: Record<number, string> = {
                  1: 'Cầu nâng 2 trụ & Khung gầm',
                  2: 'Bàn tháo lắp Động cơ EFI',
                  3: 'Hộp số tự động AT/CVT',
                  4: 'Điện xe & Scan tool OBD-II'
                };

                const newStud: Student = {
                  id: getVal('id', `25CDOT21${String(students.length + 1).padStart(2, '0')}`),
                  fullName: getVal('fullName', 'Sinh viên mới'),
                  gender: (getVal('gender', 'Nam')) as any,
                  birthDate: getVal('birthDate', '15/05/2007'),
                  ethnicity: getVal('ethnicity', 'Kinh') || 'Kinh',
                  idCard: getVal('idCard', '026207000000'),
                  idCardIssueDate: getVal('idCardIssueDate', '18/12/2021') || '18/12/2021',
                  phone: getVal('phone', '0912.000.000'),
                  email: getVal('email', 'sv@caodangoto.edu.vn') || 'sv@caodangoto.edu.vn',
                  permanentAddress: getVal('permanentAddress', 'Hà Nội') || 'Hà Nội',
                  temporaryAddress: getVal('temporaryAddress', 'KTX K1') || 'KTX K1',
                  fatherName: getVal('fatherName', 'Nguyễn Văn Phụ Huynh') || 'Nguyễn Văn Phụ Huynh',
                  fatherPhone: getVal('fatherPhone', '0912.xxx.xxx') || '0912.xxx.xxx',
                  motherName: getVal('motherName', 'Trần Thị Mẹ') || 'Trần Thị Mẹ',
                  motherPhone: getVal('motherPhone', '0913.xxx.xxx') || '0913.xxx.xxx',
                  parentJob: getVal('fatherJob', getVal('parentJob', 'Lao động tự do')) || 'Lao động tự do',
                  fatherJob: getVal('fatherJob', getVal('parentJob', 'Lao động tự do')) || 'Lao động tự do',
                  motherJob: getVal('motherJob', 'Lao động tự do') || 'Lao động tự do',
                  emergencyPhone: getVal('emergencyPhone', getVal('fatherPhone', '0912.xxx.xxx')) || '0912.xxx.xxx',
                  workshopGroup: (groupVal as any),
                  role: (getVal('role', 'Thành viên') as any),
                  station: (getVal('station', stationMap[groupVal] || 'Cầu nâng 2 trụ & Khung gầm') as any),
                  policy: getVal('policy', 'Nghề nặng nhọc, độc hại') || 'Nghề nặng nhọc, độc hại',
                  avatar: getVal('avatar') || undefined,
                  tuitionStatus: {
                    standardTuition: 7500000,
                    governmentSubsidy: 5250000,
                    studentPayable: 2250000,
                    paidAmount: 2250000,
                    debtAmount: 0,
                    isComplete: true
                  },
                  academicStatus: (getVal('academicStatus', 'Đang học bình thường') as any),
                  teacherNotes: getVal('teacherNotes', 'Sinh viên mới tiếp nhận vào lớp.'),
                  classId: currentClass,
                  attendanceRate: Number(getVal('attendanceRate', '100')) || 100
                };
                onAddStudent(newStud);
                setIsAddModalOpen(false);
                showToast(`✅ Đã thêm sinh viên ${newStud.fullName} (${newStud.id}) vào lớp!`);
              }}
              className="p-5 text-xs space-y-4 overflow-y-auto flex-1"
            >
              <div className="space-y-3">
                <div className="font-bold text-slate-800 uppercase text-xs border-b pb-1 text-emerald-800">
                  1. ĐỊNH DANH CÁ NHÂN (MỤC 1 - 9)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">[1] Mã SV (MSSV) *</label>
                    <input required name="id" defaultValue={`25CDOT21${String(students.length + 1).padStart(2, '0')}`} className="w-full p-2 border rounded-lg font-mono font-bold" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold block mb-1">[2] Họ và tên *</label>
                    <input required name="fullName" placeholder="VD: Hoàng Gia Bảo" className="w-full p-2 border rounded-lg font-bold" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[3] Giới tính</label>
                    <select name="gender" className="w-full p-2 border rounded-lg">
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[4] Ngày sinh (DD/MM/YYYY)</label>
                    <input name="birthDate" defaultValue="15/05/2007" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[5] Dân tộc</label>
                    <input name="ethnicity" defaultValue="Kinh" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[6] Số CCCD (12 số) *</label>
                    <input required name="idCard" placeholder="026207xxxxxx" className="w-full p-2 border rounded-lg font-mono" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[7] Ngày cấp CCCD</label>
                    <input name="idCardIssueDate" defaultValue="18/12/2021" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[8] Số điện thoại *</label>
                    <input required name="phone" placeholder="09xx.xxx.xxx" className="w-full p-2 border rounded-lg font-mono font-bold" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold block mb-1">[9] Email HSSV</label>
                    <input name="email" defaultValue={`sv${String(students.length + 1)}@caodangoto.edu.vn`} className="w-full p-2 border rounded-lg font-mono" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[Ảnh] Ảnh thẻ 3x4 (URL hoặc link)</label>
                    <input name="avatar" placeholder="https://... ảnh thẻ chân dung" className="w-full p-2 border rounded-lg font-mono text-xs" />
                  </div>
                </div>

                <div className="font-bold text-slate-800 uppercase text-xs border-b pb-1 text-indigo-800 pt-2">
                  2. GIA ĐÌNH & LIÊN HỆ (MỤC 10 - 17)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">[10] Hộ khẩu thường trú (HKTT)</label>
                    <input name="permanentAddress" placeholder="Xã/Huyện/Tỉnh" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[11] Địa chỉ tạm trú / KTX</label>
                    <input name="temporaryAddress" defaultValue="KTX K1" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[12] Họ tên Bố</label>
                    <input name="fatherName" placeholder="Nguyễn Văn A" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[13] SĐT Bố</label>
                    <input name="fatherPhone" placeholder="0912.xxx.xxx" className="w-full p-2 border rounded-lg font-mono" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[14] Họ tên Mẹ</label>
                    <input name="motherName" placeholder="Trần Thị B" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[15] SĐT Mẹ</label>
                    <input name="motherPhone" placeholder="0913.xxx.xxx" className="w-full p-2 border rounded-lg font-mono" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[16] Nghề nghiệp bố</label>
                    <input name="fatherJob" defaultValue="Lao động tự do" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[17] Nghề nghiệp mẹ</label>
                    <input name="motherJob" defaultValue="Lao động tự do" className="w-full p-2 border rounded-lg" />
                  </div>
                </div>

                <div className="font-bold text-slate-800 uppercase text-xs border-b pb-1 text-amber-800 pt-2">
                  3. PHÂN LUỒNG XƯỞNG & HỌC VỤ (MỤC 18 - 23)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">[18] Phân tổ xưởng</label>
                    <select name="workshopGroup" className="w-full p-2 border rounded-lg font-bold">
                      <option value="1">Tổ 1</option>
                      <option value="2">Tổ 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[19] Chức vụ tổ</label>
                    <select name="role" className="w-full p-2 border rounded-lg">
                      <option value="Thành viên">Thành viên</option>
                      <option value="Tổ trưởng">Tổ trưởng</option>
                      <option value="Tổ phó">Tổ phó</option>
                      <option value="Lớp trưởng">Lớp trưởng</option>
                      <option value="Lớp phó HT">Lớp phó HT</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[20] Phương tiện đi lại</label>
                    <input name="station" defaultValue="Xe máy Honda Wave Alpha" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[21] Chính sách (NĐ 238)</label>
                    <select name="policy" className="w-full p-2 border rounded-lg font-bold">
                      <option value="Nghề nặng nhọc, độc hại">Nghề nặng nhọc, độc hại</option>
                      <option value="Miễn giảm 70% (NĐ 238/2025)">Miễn giảm 70% (NĐ 238)</option>
                      <option value="Hộ nghèo & Miễn 70%">Hộ nghèo & Miễn 70%</option>
                      <option value="Con thương binh & Miễn 70%">Con thương binh & Miễn 70%</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[22] Tình trạng học tập</label>
                    <select name="academicStatus" className="w-full p-2 border rounded-lg">
                      <option value="Đang học bình thường">Đang học bình thường</option>
                      <option value="Cảnh báo học vụ">Cảnh báo học vụ</option>
                      <option value="Nguy cơ cấm thi">Nguy cơ cấm thi</option>
                      <option value="Nợ môn">Nợ môn</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[23a] Chuyên cần (%)</label>
                    <input type="number" step="0.5" name="attendanceRate" defaultValue="100" className="w-full p-2 border rounded-lg font-bold text-emerald-700" />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="font-semibold block mb-1">[23b] Ghi chú sư phạm của GVCN</label>
                    <textarea name="teacherNotes" rows={2} defaultValue="Sinh viên mới tiếp nhận vào lớp." className="w-full p-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2 shrink-0">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-lg cursor-pointer">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer">Lưu Hồ Sơ 23 Mục</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: CHỈNH SỬA SINH VIÊN (23 MỤC CHUẨN) */}
      {isEditModalOpen && studentToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-200 animate-in fade-in">
            <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
              <h3 className="font-bold text-sm uppercase">CẬP NHẬT HỒ SƠ SINH VIÊN: {studentToEdit.fullName} (23 MỤC)</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const getVal = (name: string, fallback = '') => {
                  const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
                  return el && el.value !== undefined ? el.value.trim() : fallback;
                };

                const updated: Student = {
                  ...studentToEdit,
                  fullName: getVal('fullName', studentToEdit.fullName),
                  gender: (getVal('gender', studentToEdit.gender)) as any,
                  birthDate: getVal('birthDate', studentToEdit.birthDate),
                  idCard: getVal('idCard', studentToEdit.idCard),
                  idCardIssueDate: getVal('idCardIssueDate', studentToEdit.idCardIssueDate || '18/12/2021'),
                  phone: getVal('phone', studentToEdit.phone),
                  email: getVal('email', studentToEdit.email),
                  permanentAddress: getVal('permanentAddress', studentToEdit.permanentAddress),
                  temporaryAddress: getVal('temporaryAddress', studentToEdit.temporaryAddress),
                  fatherName: getVal('fatherName', studentToEdit.fatherName),
                  fatherPhone: getVal('fatherPhone', studentToEdit.fatherPhone),
                  motherName: getVal('motherName', studentToEdit.motherName),
                  motherPhone: getVal('motherPhone', studentToEdit.motherPhone),
                  parentJob: getVal('fatherJob', getVal('parentJob', studentToEdit.fatherJob || studentToEdit.parentJob || 'Lao động tự do')),
                  fatherJob: getVal('fatherJob', studentToEdit.fatherJob || studentToEdit.parentJob || 'Lao động tự do'),
                  motherJob: getVal('motherJob', studentToEdit.motherJob || 'Lao động tự do'),
                  emergencyPhone: getVal('emergencyPhone', studentToEdit.emergencyPhone || studentToEdit.fatherPhone || '0912.xxx.xxx'),
                  ethnicity: getVal('ethnicity', studentToEdit.ethnicity || 'Kinh'),
                  workshopGroup: Number(getVal('workshopGroup', String(studentToEdit.workshopGroup || 1))) as any,
                  role: (getVal('role', studentToEdit.role || 'Thành viên')) as any,
                  station: (getVal('station', studentToEdit.station || 'Cầu nâng 2 trụ & Khung gầm')) as any,
                  policy: getVal('policy', studentToEdit.policy || 'Nghề nặng nhọc, độc hại'),
                  avatar: getVal('avatar', studentToEdit.avatar || '') || undefined,
                  academicStatus: (getVal('academicStatus', studentToEdit.academicStatus || 'Đang học bình thường')) as any,
                  teacherNotes: getVal('teacherNotes', studentToEdit.teacherNotes || ''),
                  attendanceRate: Number(getVal('attendanceRate', String(studentToEdit.attendanceRate ?? 100))) || 100
                };
                onUpdateStudent(updated);
                setIsEditModalOpen(false);
                showToast(`✅ Đã cập nhật hồ sơ 23 mục của sinh viên ${updated.fullName} thành công!`);
              }}
              className="p-5 text-xs space-y-4 overflow-y-auto flex-1"
            >
              <div className="space-y-3">
                <div className="font-bold text-slate-800 uppercase text-xs border-b pb-1 text-blue-800">
                  1. ĐỊNH DANH CÁ NHÂN (MỤC 1 - 9)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">[1] Mã SV (MSSV)</label>
                    <input disabled value={studentToEdit.id} className="w-full p-2 border rounded-lg bg-slate-100 font-mono font-bold" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold block mb-1">[2] Họ và tên *</label>
                    <input required name="fullName" defaultValue={studentToEdit.fullName} className="w-full p-2 border rounded-lg font-bold" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[3] Giới tính</label>
                    <select name="gender" defaultValue={studentToEdit.gender} className="w-full p-2 border rounded-lg">
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[4] Ngày sinh</label>
                    <input name="birthDate" defaultValue={studentToEdit.birthDate} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[5] Dân tộc</label>
                    <input name="ethnicity" defaultValue={studentToEdit.ethnicity || 'Kinh'} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[6] Số CCCD *</label>
                    <input required name="idCard" defaultValue={studentToEdit.idCard} className="w-full p-2 border rounded-lg font-mono" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[7] Ngày cấp CCCD</label>
                    <input name="idCardIssueDate" defaultValue={studentToEdit.idCardIssueDate || '18/12/2021'} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[8] SĐT SV *</label>
                    <input required name="phone" defaultValue={studentToEdit.phone} className="w-full p-2 border rounded-lg font-mono font-bold" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold block mb-1">[9] Email HSSV</label>
                    <input name="email" defaultValue={studentToEdit.email} className="w-full p-2 border rounded-lg font-mono" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[Ảnh] Ảnh thẻ 3x4 (URL hoặc link)</label>
                    <input name="avatar" defaultValue={studentToEdit.avatar || ''} placeholder="https://... ảnh thẻ chân dung" className="w-full p-2 border rounded-lg font-mono text-xs" />
                  </div>
                </div>

                <div className="font-bold text-slate-800 uppercase text-xs border-b pb-1 text-indigo-800 pt-2">
                  2. GIA ĐÌNH & LIÊN HỆ (MỤC 10 - 17)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">[10] Hộ khẩu thường trú</label>
                    <input name="permanentAddress" defaultValue={studentToEdit.permanentAddress} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[11] Địa chỉ tạm trú</label>
                    <input name="temporaryAddress" defaultValue={studentToEdit.temporaryAddress} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[12] Họ tên Bố</label>
                    <input name="fatherName" defaultValue={studentToEdit.fatherName} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[13] SĐT Bố</label>
                    <input name="fatherPhone" defaultValue={studentToEdit.fatherPhone} className="w-full p-2 border rounded-lg font-mono" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[14] Họ tên Mẹ</label>
                    <input name="motherName" defaultValue={studentToEdit.motherName} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[15] SĐT Mẹ</label>
                    <input name="motherPhone" defaultValue={studentToEdit.motherPhone} className="w-full p-2 border rounded-lg font-mono" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[16] Nghề nghiệp bố</label>
                    <input name="fatherJob" defaultValue={studentToEdit.fatherJob || studentToEdit.parentJob || 'Lao động tự do'} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[17] Nghề nghiệp mẹ</label>
                    <input name="motherJob" defaultValue={studentToEdit.motherJob || 'Lao động tự do'} className="w-full p-2 border rounded-lg" />
                  </div>
                </div>

                <div className="font-bold text-slate-800 uppercase text-xs border-b pb-1 text-amber-800 pt-2">
                  3. PHÂN LUỒNG XƯỞNG & HỌC VỤ (MỤC 18 - 23)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">[18] Phân tổ xưởng</label>
                    <select name="workshopGroup" defaultValue={studentToEdit.workshopGroup} className="w-full p-2 border rounded-lg font-bold">
                      <option value="1">Tổ 1</option>
                      <option value="2">Tổ 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[19] Chức vụ tổ</label>
                    <select name="role" defaultValue={studentToEdit.role} className="w-full p-2 border rounded-lg">
                      <option value="Thành viên">Thành viên</option>
                      <option value="Tổ trưởng">Tổ trưởng</option>
                      <option value="Tổ phó">Tổ phó</option>
                      <option value="Lớp trưởng">Lớp trưởng</option>
                      <option value="Lớp phó HT">Lớp phó HT</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[20] Phương tiện đi lại</label>
                    <input name="station" defaultValue={studentToEdit.station} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[21] Đối tượng chính sách</label>
                    <input name="policy" defaultValue={studentToEdit.policy || 'Nghề nặng nhọc, độc hại'} className="w-full p-2 border rounded-lg font-bold" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[22] Tình trạng học tập</label>
                    <select name="academicStatus" defaultValue={studentToEdit.academicStatus} className="w-full p-2 border rounded-lg font-semibold">
                      <option value="Đang học bình thường">Đang học bình thường</option>
                      <option value="Cảnh báo học vụ">Cảnh báo học vụ</option>
                      <option value="Nguy cơ cấm thi">Nguy cơ cấm thi</option>
                      <option value="Nợ môn">Nợ môn</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">[23a] Chuyên cần %</label>
                    <input type="number" step="0.5" name="attendanceRate" defaultValue={studentToEdit.attendanceRate ?? 100} className="w-full p-2 border rounded-lg font-bold text-emerald-700" />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="font-semibold block mb-1">[23b] Ghi chú sư phạm của GVCN</label>
                    <textarea name="teacherNotes" rows={2} defaultValue={studentToEdit.teacherNotes || ''} className="w-full p-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2 shrink-0">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-lg cursor-pointer">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer">Cập Nhật Hồ Sơ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL XÁC NHẬN XÓA DỮ LIỆU CHUẨN IN-APP (100% HIỂN THỊ CHÍNH XÁC, KHÔNG BỊ TRÌNH DUYỆT KHÓA) */}
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
    </>
  );
};
