import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Search,
  BookOpen,
  Layers,
  GraduationCap,
  Clock,
  ArrowRightLeft,
  GripVertical,
  Check,
  ChevronRight,
  Filter,
  Bot,
  Sparkles,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { SubjectModule } from '../types';
import {
  DEFAULT_CURRICULUM_CHINH_QUY,
  DEFAULT_CURRICULUM_LIEN_THONG,
  DEFAULT_CURRICULUM_TRUNG_CAP,
  loadCurriculumForSystem,
  saveCurriculumForSystem
} from '../data/curriculumData';

interface CurriculumFrameworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSystemName?: string;
  onApplyCurriculum?: (systemName: string, modules: SubjectModule[]) => void;
}

export const CurriculumFrameworkModal: React.FC<CurriculumFrameworkModalProps> = ({
  isOpen,
  onClose,
  initialSystemName = 'HỆ CAO ĐẲNG CHÍNH QUY',
  onApplyCurriculum
}) => {
  // 1. Hệ đào tạo đang chọn (3 Hệ chuẩn)
  const [activeSystem, setActiveSystem] = useState<string>(initialSystemName);

  // Sync initialSystemName when modal opens
  useEffect(() => {
    if (initialSystemName) {
      setActiveSystem(initialSystemName);
    }
  }, [initialSystemName, isOpen]);

  // 2. Dữ liệu mô đun theo hệ đào tạo đang chọn
  const [modules, setModules] = useState<SubjectModule[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load modules whenever activeSystem changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const loaded = loadCurriculumForSystem(activeSystem);
      setModules(loaded);
    }
  }, [activeSystem, isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 3. Chế độ xem: 'matrix' (Ma trận phân bổ theo kỳ & năm học) hoặc 'table' (Bảng chi tiết)
  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');

  // 4. Tìm kiếm & Lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');
  const [filterSemester, setFilterSemester] = useState<number | 'all'>('all');

  // 5. Chọn nhiều mô đun để chuyển kỳ hàng loạt
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [bulkTargetSemester, setBulkTargetSemester] = useState<number>(1);

  // 6. Modal thêm / sửa mô đun
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Partial<SubjectModule> | null>(null);

  // 7. Drag & Drop state
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);
  const [dragOverSemester, setDragOverSemester] = useState<number | null>(null);

  // 8. Import File & AI Analysis state
  const [importedPreview, setImportedPreview] = useState<SubjectModule[] | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisStep, setAiAnalysisStep] = useState<string>('');
  const [aiAnalysisSummary, setAiAnalysisSummary] = useState<string>('');
  const [selectedPreviewIds, setSelectedPreviewIds] = useState<Set<string>>(new Set());
  const [batchTargetPreviewSemester, setBatchTargetPreviewSemester] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xác định số năm và số học kỳ theo hệ đào tạo
  const systemConfig = useMemo(() => {
    const norm = activeSystem.toLowerCase();
    if (norm.includes('liên thông')) {
      return {
        years: 2,
        semesters: 4,
        desc: 'Hệ Liên thông Cao đẳng (1.5 - 2 năm • 4 Học kỳ • Đào tạo nâng cao chuyên sâu)',
        badgeColor: 'bg-amber-600',
        borderColor: 'border-amber-600'
      };
    }
    if (norm.includes('trung cấp')) {
      return {
        years: 3,
        semesters: 6,
        desc: 'Hệ Trung cấp + THPT (3 năm • 6 Học kỳ • Song bằng Nghề & THPT Quốc gia)',
        badgeColor: 'bg-emerald-600',
        borderColor: 'border-emerald-600'
      };
    }
    return {
      years: 3,
      semesters: 6,
      desc: 'Hệ Cao Đẳng Chính Quy (3 năm • 6 Học kỳ • Chuẩn đầu ra Kỹ sư thực hành GDNN)',
      badgeColor: 'bg-blue-600',
      borderColor: 'border-blue-600'
    };
  }, [activeSystem]);

  // Thống kê tổng quan chương trình
  const stats = useMemo(() => {
    const totalCount = modules.length;
    const totalCredits = modules.reduce((sum, m) => sum + (Number(m.credits) || 0), 0);
    const theoryHours = modules.reduce((sum, m) => sum + (Number(m.theoryHours) || 0), 0);
    const practiceHours = modules.reduce((sum, m) => sum + (Number(m.practiceHours) || 0), 0);
    const examHours = modules.reduce((sum, m) => sum + (Number(m.examHours) || 0), 0);
    const totalHours = modules.reduce((sum, m) => sum + (Number(m.totalHours) || (Number(m.theoryHours) || 0) + (Number(m.practiceHours) || 0) + (Number(m.examHours) || 0)), 0);
    const practicePercent = totalHours > 0 ? Math.round((practiceHours / totalHours) * 100) : 0;
    return { totalCount, totalCredits, totalHours, theoryHours, practiceHours, examHours, practicePercent };
  }, [modules]);

  // Lọc danh sách mô đun cho Table view
  const filteredModules = useMemo(() => {
    return modules.filter(m => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchId = m.id.toLowerCase().includes(query);
        const matchName = m.name.toLowerCase().includes(query);
        const matchType = (m.type || '').toLowerCase().includes(query);
        if (!matchId && !matchName && !matchType) return false;
      }
      if (filterYear !== 'all') {
        const moduleYear = m.academicYearNumber || Math.ceil((m.semester || 1) / 2);
        if (moduleYear !== filterYear) return false;
      }
      if (filterSemester !== 'all') {
        if (m.semester !== filterSemester) return false;
      }
      return true;
    });
  }, [modules, searchQuery, filterYear, filterSemester]);

  // Lưu và áp dụng
  const handleSaveAndApply = () => {
    saveCurriculumForSystem(activeSystem, modules);
    if (onApplyCurriculum) {
      onApplyCurriculum(activeSystem, modules);
    }
    showToast(`✅ Đã lưu và áp dụng Chương trình khung ${activeSystem} vào toàn hệ thống!`);
  };

  // Nạp lại mẫu chuẩn của Bộ LĐTBXH
  const handleResetToStandard = () => {
    if (window.confirm(`Thầy/Cô có chắc chắn muốn nạp lại Chương trình khung CHUẨN của Bộ LĐTBXH cho ${activeSystem}? Toàn bộ các thay đổi chưa lưu sẽ được thay thế bằng danh mục chuẩn.`)) {
      let standard: SubjectModule[] = [];
      const norm = activeSystem.toLowerCase();
      if (norm.includes('liên thông')) standard = [...DEFAULT_CURRICULUM_LIEN_THONG];
      else if (norm.includes('trung cấp')) standard = [...DEFAULT_CURRICULUM_TRUNG_CAP];
      else standard = [...DEFAULT_CURRICULUM_CHINH_QUY];

      setModules(standard);
      saveCurriculumForSystem(activeSystem, standard);
      if (onApplyCurriculum) {
        onApplyCurriculum(activeSystem, standard);
      }
      showToast(`📥 Đã nạp thành công Chương trình khung chuẩn Bộ LĐTBXH (${standard.length} mô đun)!`);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedModuleId(id);
  };

  const handleDragOver = (e: React.DragEvent, semester: number) => {
    e.preventDefault();
    if (dragOverSemester !== semester) {
      setDragOverSemester(semester);
    }
  };

  const handleDragLeave = () => {
    setDragOverSemester(null);
  };

  const handleDrop = (e: React.DragEvent, targetSemester: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedModuleId;
    setDragOverSemester(null);
    setDraggedModuleId(null);

    if (!id) return;

    setModules(prev =>
      prev.map(m => {
        if (m.id === id) {
          const targetYear = Math.ceil(targetSemester / 2);
          return {
            ...m,
            semester: targetSemester,
            academicYearNumber: targetYear
          };
        }
        return m;
      })
    );
    showToast(`🎯 Đã chuyển mô đun ${id} sang Học kỳ ${targetSemester}!`);
  };

  // Chuyển kỳ thủ công cho 1 mô đun
  const handleMoveModuleSemester = (moduleId: string, newSemester: number) => {
    setModules(prev =>
      prev.map(m => {
        if (m.id === moduleId) {
          return {
            ...m,
            semester: newSemester,
            academicYearNumber: Math.ceil(newSemester / 2)
          };
        }
        return m;
      })
    );
    showToast(`Đã chuyển mô đun sang Học kỳ ${newSemester}!`);
  };

  // Chuyển kỳ hàng loạt
  const handleBulkMove = () => {
    if (selectedModuleIds.length === 0) {
      alert('Vui lòng tích chọn ít nhất 1 mô đun để chuyển kỳ!');
      return;
    }
    setModules(prev =>
      prev.map(m => {
        if (selectedModuleIds.includes(m.id)) {
          return {
            ...m,
            semester: bulkTargetSemester,
            academicYearNumber: Math.ceil(bulkTargetSemester / 2)
          };
        }
        return m;
      })
    );
    showToast(`✅ Đã chuyển ${selectedModuleIds.length} mô đun sang Học kỳ ${bulkTargetSemester}!`);
    setSelectedModuleIds([]);
  };

  // Xóa mô đun
  const handleDeleteModule = (id: string, name: string) => {
    if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa mô đun "${id} - ${name}" khỏi chương trình khung?`)) {
      setModules(prev => prev.filter(m => m.id !== id));
      setSelectedModuleIds(prev => prev.filter(item => item !== id));
      showToast(`🗑️ Đã xóa mô đun ${id} khỏi chương trình.`);
    }
  };

  // Mở modal thêm mô đun
  const handleOpenAddModal = (presetSemester?: number) => {
    const sem = presetSemester || 1;
    setEditingModule({
      id: '',
      name: '',
      credits: 3,
      totalHours: 60,
      theoryHours: 20,
      practiceHours: 38,
      examHours: 2,
      semester: sem,
      academicYearNumber: Math.ceil(sem / 2),
      type: 'Chuyên môn',
      isMandatory: true,
      trainingSystem: activeSystem,
      note: ''
    });
    setIsEditModalOpen(true);
  };

  // Mở modal sửa mô đun
  const handleOpenEditModal = (module: SubjectModule) => {
    setEditingModule({ ...module });
    setIsEditModalOpen(true);
  };

  // Lưu modal thêm/sửa (Bảo đảm chuẩn GDNN: Tổng = Lý thuyết + Thực hành + Kiểm tra)
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !editingModule.id?.trim() || !editingModule.name?.trim()) {
      alert('Vui lòng nhập đầy đủ Mã mô đun và Tên mô đun!');
      return;
    }

    const cleanId = editingModule.id.trim().toUpperCase();
    const cleanName = editingModule.name.trim();
    const credits = Number(editingModule.credits) || 1;
    const theoryHours = Math.max(0, Number(editingModule.theoryHours) || 0);
    const practiceHours = Math.max(0, Number(editingModule.practiceHours) || 0);
    const examHours = Math.max(0, Number(editingModule.examHours) || 0);
    const totalHours = theoryHours + practiceHours + examHours;
    const semester = Number(editingModule.semester) || 1;
    const academicYearNumber = editingModule.academicYearNumber || Math.ceil(semester / 2);

    const updatedItem: SubjectModule = {
      id: cleanId,
      name: cleanName,
      credits,
      totalHours,
      theoryHours,
      practiceHours,
      examHours,
      semester,
      academicYearNumber,
      type: editingModule.type || 'Chuyên môn',
      isMandatory: editingModule.isMandatory !== false,
      trainingSystem: activeSystem,
      note: editingModule.note || ''
    };

    setModules(prev => {
      const exists = prev.some(m => m.id === cleanId);
      if (exists) {
        return prev.map(m => (m.id === cleanId ? updatedItem : m));
      } else {
        return [...prev, updatedItem];
      }
    });

    setIsEditModalOpen(false);
    setEditingModule(null);
    showToast(`Đã lưu mô đun ${cleanId} - ${cleanName} (Tổng ${totalHours}h = ${theoryHours} LT + ${practiceHours} TH + ${examHours} KT)!`);
  };

  // Xuất file Excel chương trình khung (Đầy đủ Tổng số tiết, Lý thuyết, Thực hành, Kiểm tra)
  const handleExportExcel = () => {
    const dataToExport = modules.map((m, idx) => ({
      STT: idx + 1,
      'Mã Mô đun / Môn học': m.id,
      'Tên Mô đun / Môn học': m.name,
      'Số Tín chỉ': m.credits,
      'Tổng số tiết': m.totalHours,
      'Lý thuyết': m.theoryHours,
      'Thực hành': m.practiceHours,
      'Kiểm tra': m.examHours || 0,
      'Năm học': `Năm ${m.academicYearNumber || Math.ceil(m.semester / 2)}`,
      'Học kỳ': `Kỳ ${m.semester}`,
      'Khối kiến thức': m.type || 'Chuyên môn',
      'Bắt buộc': m.isMandatory ? 'Bắt buộc' : 'Tự chọn',
      'Hệ đào tạo': activeSystem,
      'Ghi chú': m.note || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ChuongTrinhKhung');
    const safeName = activeSystem.replace(/\s+/g, '_');
    XLSX.writeFile(workbook, `Chuong_Trinh_Khung_${safeName}.xlsx`);
    showToast(`📊 Đã xuất file Excel Chương trình khung ${activeSystem} (Tổng = LT + TH + KT)!`);
  };

  // Tải file mẫu Excel chuẩn GDNN (Tổng = Lý thuyết + Thực hành + Kiểm tra)
  const handleDownloadSampleExcel = () => {
    const sampleData = [
      {
        'Mã Mô đun': 'MĐ01',
        'Tên Mô đun': 'An toàn lao động và Vệ sinh môi trường xưởng ô tô',
        'Số Tín chỉ': 2,
        'Tổng số tiết': 30,
        'Lý thuyết': 10,
        'Thực hành': 18,
        'Kiểm tra': 2,
        'Học kỳ (1-6)': 1,
        'Năm học (1-3)': 1,
        'Loại mô đun': 'Cơ sở ngành',
        'Bắt buộc': 'Có',
        'Ghi chú': 'Chuẩn GDNN TT 04/2022'
      },
      {
        'Mã Mô đun': 'MĐ07',
        'Tên Mô đun': 'Thực hành Tháo lắp & Sửa chữa Động cơ đốt trong',
        'Số Tín chỉ': 5,
        'Tổng số tiết': 120,
        'Lý thuyết': 20,
        'Thực hành': 96,
        'Kiểm tra': 4,
        'Học kỳ (1-6)': 2,
        'Năm học (1-3)': 1,
        'Loại mô đun': 'Thực tập xưởng',
        'Bắt buộc': 'Có',
        'Ghi chú': 'Xưởng động cơ'
      },
      {
        'Mã Mô đun': 'MĐ12',
        'Tên Mô đun': 'Thực hành Chẩn đoán lỗi ô tô trên thiết bị Scan tool OBD-II',
        'Số Tín chỉ': 4,
        'Tổng số tiết': 90,
        'Lý thuyết': 18,
        'Thực hành': 68,
        'Kiểm tra': 4,
        'Học kỳ (1-6)': 4,
        'Năm học (1-3)': 2,
        'Loại mô đun': 'Thực tập xưởng',
        'Bắt buộc': 'Có',
        'Ghi chú': 'Phòng Scan tool'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_CT_Khung');
    XLSX.writeFile(wb, 'Mau_Nhap_ChuongTrinhKhung_GDNN_Tong_LT_TH_KT.xlsx');
    showToast('📄 Đã tải file Excel mẫu chuẩn GDNN (Tổng = Lý thuyết + Thực hành + Kiểm tra)!');
  };

  // Tải lên và parse file Excel / CSV / JSON (Trích xuất chính xác chuẩn GDNN: Tổng = Lý thuyết + Thực hành + Kiểm tra)
  // Helper chuẩn hóa chuỗi tiếng Việt để dò tìm cột
  const cleanKey = (val: any): string => {
    if (val === null || val === undefined) return '';
    return String(val)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Helper trích xuất số hợp lệ
  const parseNumber = (val: any): number | null => {
    if (val === null || val === undefined || val === '') return null;
    if (typeof val === 'number') return isNaN(val) ? null : val;
    const str = String(val).trim().replace(/,/g, '.').replace(/[^0-9.]/g, '');
    if (!str) return null;
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  };

  // Helper trích xuất 1 mô đun từ 1 đối tượng dòng dữ liệu (Dự phòng cục bộ)
  const extractModuleFromRow = (rowObj: Record<string, any>, idx: number): SubjectModule | null => {
    let id = '';
    let name = '';
    let credits: number | null = null;
    let rawTotal: number | null = null;
    let rawTheory: number | null = null;
    let rawPractice: number | null = null;
    let rawExam: number | null = null;
    let semester = 1;
    let academicYearNumber = 1;
    let type = 'Chuyên môn';
    let isMandatory = true;
    let note = '';

    for (const [key, val] of Object.entries(rowObj)) {
      if (val === null || val === undefined || val === '') continue;
      const c = cleanKey(key);
      const strVal = String(val).trim();
      const numVal = parseNumber(val);

      if (!id && (c === 'ma' || c === 'id' || c === 'code' || c.includes('mamodun') || c.includes('mamonhoc') || c.includes('mamd') || c.includes('mamh') || c === 'mmh' || c === 'mmd')) {
        id = strVal;
      } else if (!name && (c === 'ten' || c === 'name' || c.includes('tenmodun') || c.includes('tenmonhoc') || c.includes('tenmd') || c.includes('tenmh') || c.includes('tenmon') || c === 'monhoc' || c === 'modun' || c === 'mon')) {
        name = strVal;
      } else if (credits === null && (c.includes('tinchi') || c === 'tc' || c.includes('sotc') || c.includes('credits') || c.includes('credit') || c === 'sotinchi')) {
        if (numVal !== null && numVal > 0) credits = numVal;
      } else if (rawExam === null && (
        c.includes('kiemtra') || c.includes('ktra') || c === 'kt' || c.endsWith('kt') || c.includes('kiemtrathi') || c.includes('thikiemtra') || c.includes('sogiokt') || c.includes('sogiokiemtra') || c.includes('exam') || c.includes('test') || c === 'thi'
      ) && !c.includes('thuchanh') && !c.includes('lythuyet')) {
        if (numVal !== null && numVal >= 0) rawExam = numVal;
      } else if (rawTheory === null && (
        c.includes('lythuyet') || c.includes('lthuyet') || c.includes('theory') || c === 'lt' || c.endsWith('lt') || c.includes('giolt') || c.includes('sogiolythuyet')
      ) && !c.includes('thuchanh') && !c.includes('kiemtra')) {
        if (numVal !== null && numVal >= 0) rawTheory = numVal;
      } else if (rawPractice === null && (
        c.includes('thuchanh') || c.includes('thuctap') || c.includes('practice') || c.includes('workshop') || c.includes('thinghiem') || c === 'th' || c === 'tt' || c.includes('thtt') || c.endsWith('th') || c.includes('gioth') || c.includes('sogiothuchanh')
      ) && !c.includes('lythuyet') && !c.includes('kiemtra')) {
        if (numVal !== null && numVal >= 0) rawPractice = numVal;
      } else if (rawTotal === null && (
        c.includes('tongsotiet') || c.includes('tongsogio') || c.includes('tongso') || c.includes('tonggio') || c.includes('tongtiet') || c.includes('thoiluong') || c.includes('totalhours') || c.includes('tongcong') || c === 'tong' || c === 'total' ||
        (c.includes('tong') && !c.includes('tinchi') && !c.includes('diem'))
      )) {
        if (numVal !== null && numVal > 0) rawTotal = numVal;
      } else if (c.includes('hocky') || c.includes('ky') || c.includes('semester') || c === 'hk') {
        const s = Number(String(val).replace(/\D/g, ''));
        if (s >= 1 && s <= 8) semester = s;
      } else if (c.includes('namhoc') || c.includes('nam') || c.includes('year')) {
        const y = Number(String(val).replace(/\D/g, ''));
        if (y >= 1 && y <= 4) academicYearNumber = y;
      } else if (c.includes('loai') || c.includes('khoi') || c.includes('type')) {
        type = strVal;
      } else if (c.includes('batbuoc') || c.includes('mandatory')) {
        const lowerVal = strVal.toLowerCase();
        isMandatory = lowerVal !== 'tự chọn' && lowerVal !== 'không' && lowerVal !== 'false' && lowerVal !== '0';
      } else if (c.includes('ghichu') || c.includes('note')) {
        note = strVal;
      }
    }

    if (!name) return null;
    const cleanNameStr = cleanKey(name);
    if (cleanNameStr === 'tenmonhoc' || cleanNameStr === 'tenmodun' || cleanNameStr === 'monhoc' || cleanNameStr === 'modun') return null;

    if (!id) id = `MĐ${String(idx + 1).padStart(2, '0')}`;

    let finalTheory = rawTheory !== null ? Math.max(0, rawTheory) : 0;
    let finalPractice = rawPractice !== null ? Math.max(0, rawPractice) : 0;
    let finalExam = rawExam !== null ? Math.max(0, rawExam) : 0;
    let finalTotal = rawTotal !== null ? Math.max(0, rawTotal) : 0;

    if (rawTheory !== null && rawPractice !== null && rawExam !== null) {
      finalTotal = finalTheory + finalPractice + finalExam;
    } else if (rawTheory !== null && rawPractice !== null) {
      if (finalTotal > 0 && finalTotal >= finalTheory + finalPractice) {
        finalExam = finalTotal - (finalTheory + finalPractice);
      } else {
        finalExam = 0;
        finalTotal = finalTheory + finalPractice + finalExam;
      }
    } else if (finalTotal > 0 && rawTheory !== null && rawExam !== null) {
      finalPractice = Math.max(0, finalTotal - finalTheory - finalExam);
    } else if (finalTotal > 0 && rawPractice !== null && rawExam !== null) {
      finalTheory = Math.max(0, finalTotal - finalPractice - finalExam);
    } else if (finalTotal > 0 && rawTheory !== null) {
      finalPractice = Math.max(0, finalTotal - finalTheory);
      finalExam = 0;
    } else if (finalTotal > 0 && rawPractice !== null) {
      finalTheory = Math.max(0, finalTotal - finalPractice);
      finalExam = 0;
    } else if (finalTotal > 0) {
      if (finalTotal <= 30) {
        finalExam = 2;
        finalTheory = Math.round((finalTotal - finalExam) * 0.4);
        finalPractice = finalTotal - finalTheory - finalExam;
      } else {
        finalExam = 4;
        finalTheory = Math.round((finalTotal - finalExam) * 0.3);
        finalPractice = finalTotal - finalTheory - finalExam;
      }
    } else {
      finalTheory = 20;
      finalPractice = 38;
      finalExam = 2;
      finalTotal = 60;
    }

    finalTotal = finalTheory + finalPractice + finalExam;

    return {
      id: id.toUpperCase().trim(),
      name: name.trim(),
      credits: credits || 3,
      totalHours: finalTotal,
      theoryHours: finalTheory,
      practiceHours: finalPractice,
      examHours: finalExam,
      semester,
      academicYearNumber: Math.ceil(semester / 2),
      type,
      isMandatory,
      trainingSystem: activeSystem,
      note
    };
  };

  // Helper giải thuật quét ma trận Excel dự phòng
  const parseLocalWorkbook = (workbook: any): SubjectModule[] => {
    let bestSheet = workbook.Sheets[workbook.SheetNames[0]];
    for (const sName of workbook.SheetNames) {
      const sLower = sName.toLowerCase();
      if (sLower.includes('khung') || sLower.includes('ctk') || sLower.includes('chuong trinh') || sLower.includes('mo dun') || sLower.includes('mon hoc')) {
        bestSheet = workbook.Sheets[sName];
        break;
      }
    }

    const matrix: any[][] = XLSX.utils.sheet_to_json(bestSheet, { header: 1, defval: '' });
    const parsedModules: SubjectModule[] = [];

    if (matrix && matrix.length > 0) {
      const idKeywords = ['mamodun', 'mamonhoc', 'mamd', 'mamh', 'ma', 'code', 'id'];
      const nameKeywords = ['tenmodun', 'tenmonhoc', 'tenmd', 'tenmh', 'tenmon', 'ten', 'name'];
      let bestHeaderRowIdx = -1;
      let maxHeaderScore = 0;

      for (let r = 0; r < Math.min(matrix.length, 30); r++) {
        const row = matrix[r];
        if (!Array.isArray(row)) continue;
        let score = 0;
        for (const cell of row) {
          const c = cleanKey(cell);
          if (idKeywords.some(k => c === k || c.includes(k))) score += 2;
          if (nameKeywords.some(k => c === k || c.includes(k))) score += 3;
        }
        if (score > maxHeaderScore) {
          maxHeaderScore = score;
          bestHeaderRowIdx = r;
        }
      }

      if (bestHeaderRowIdx >= 0) {
        const headerRow = matrix[bestHeaderRowIdx];
        const nextRow = matrix[bestHeaderRowIdx + 1] || [];
        const isNextSubHeader = Array.isArray(nextRow) && nextRow.some(cell => {
          const c = cleanKey(cell);
          return c === 'lt' || c === 'th' || c === 'kt' || c === 'tong';
        });

        const startDataRow = isNextSubHeader ? bestHeaderRowIdx + 2 : bestHeaderRowIdx + 1;
        const maxCols = Math.max(headerRow.length, nextRow.length);
        const headerMap: Record<number, string> = {};

        for (let col = 0; col < maxCols; col++) {
          const parentVal = String(headerRow[col] || '').trim();
          const childVal = isNextSubHeader ? String(nextRow[col] || '').trim() : '';
          headerMap[col] = childVal && parentVal ? `${parentVal} ${childVal}` : (childVal || parentVal);
        }

        for (let r = startDataRow; r < matrix.length; r++) {
          const row = matrix[r];
          if (!Array.isArray(row)) continue;
          const rowObj: Record<string, any> = {};
          for (let col = 0; col < maxCols; col++) {
            rowObj[headerMap[col] || `COL_${col}`] = row[col];
          }
          const mod = extractModuleFromRow(rowObj, parsedModules.length);
          if (mod) parsedModules.push(mod);
        }
      }
    }

    if (parsedModules.length === 0) {
      const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(bestSheet);
      rawRows.forEach((row, idx) => {
        const mod = extractModuleFromRow(row, idx);
        if (mod) parsedModules.push(mod);
      });
    }

    return parsedModules;
  };

  // Tải lên và AI phân tích cấu trúc chương trình khung (Trích xuất: Mã, Tín chỉ, Tổng = LT + TH + KT & Phân chia kỳ học)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiAnalyzing(true);
    setAiAnalysisStep('Đang đọc cấu trúc tệp tin chương trình khung...');
    setAiAnalysisSummary('');

    try {
      const fileName = file.name.toLowerCase();
      let textContent = '';
      let workbookObj: any = null;

      if (fileName.endsWith('.json') || fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
        textContent = await file.text();
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        workbookObj = XLSX.read(data, { type: 'array' });

        const sheetTexts: string[] = [];
        for (const sName of workbookObj.SheetNames) {
          const sheet = workbookObj.Sheets[sName];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          sheetTexts.push(`=== TRANG TÍNH: ${sName} ===\n${csv}`);
        }
        textContent = sheetTexts.join('\n\n');
      }

      setAiAnalysisStep('🤖 AI Gemini đang đọc, phân tích cấu trúc mô đun & đối chiếu Thông tư 04/2022/TT-BLĐTBXH...');

      let extractedModules: SubjectModule[] = [];
      let aiUsed = false;

      // 1. Gửi lên AI server-side endpoint
      try {
        const response = await fetch('/api/ai/parse-curriculum', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileContent: textContent.slice(0, 50000),
            fileName: file.name,
            trainingSystem: activeSystem
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && Array.isArray(resJson.modules) && resJson.modules.length > 0) {
            extractedModules = resJson.modules;
            aiUsed = true;
            setAiAnalysisSummary(resJson.aiAnalysisSummary || `AI Gemini Flash đã đọc & trích xuất thành công ${resJson.modules.length} mô đun môn học.`);
          }
        }
      } catch (aiErr) {
        console.warn('API AI máy chủ tạm thời không khả dụng, sử dụng bộ trích xuất thông minh GDNN cục bộ:', aiErr);
      }

      // 2. Dự phòng giải thuật phân tích cục bộ nếu AI không trả về
      if (!aiUsed || extractedModules.length === 0) {
        setAiAnalysisStep('⚙️ Đang áp dụng bộ giải thuật phân tích cấu trúc GDNN chuẩn hóa...');
        if (workbookObj) {
          extractedModules = parseLocalWorkbook(workbookObj);
        } else if (fileName.endsWith('.json')) {
          try {
            const parsedJson = JSON.parse(textContent);
            if (Array.isArray(parsedJson)) {
              extractedModules = parsedJson.map((r, i) => extractModuleFromRow(r, i)).filter(Boolean) as SubjectModule[];
            }
          } catch {
            // ignore
          }
        }
      }

      if (extractedModules.length > 0) {
        // Chuẩn hóa và bảo đảm 100% công thức: Tổng = LT + TH + KT
        const finalModules = extractedModules.map((m, idx) => {
          const th = Math.max(0, Number(m.theoryHours) || 0);
          const pr = Math.max(0, Number(m.practiceHours) || 0);
          let ex = Math.max(0, Number(m.examHours) || 0);
          let tot = Math.max(0, Number(m.totalHours) || (th + pr + ex));
          if (tot > 0 && ex === 0 && tot > th + pr) {
            ex = tot - (th + pr);
          }
          tot = th + pr + ex;
          const sem = Math.min(systemConfig.semesters, Math.max(1, Number(m.semester) || 1));
          return {
            ...m,
            id: String(m.id || `MĐ${String(idx + 1).padStart(2, '0')}`).toUpperCase().trim(),
            name: String(m.name || `Mô đun ${idx + 1}`).trim(),
            credits: Math.max(1, Number(m.credits) || 3),
            theoryHours: th,
            practiceHours: pr,
            examHours: ex,
            totalHours: tot,
            semester: sem as any,
            academicYearNumber: Number(m.academicYearNumber) || Math.ceil(sem / 2),
            trainingSystem: activeSystem
          };
        });

        setImportedPreview(finalModules);
        setSelectedPreviewIds(new Set());
        setBatchTargetPreviewSemester(1);

        showToast(
          aiUsed
            ? `🤖 AI Gemini đã trích xuất thành công ${finalModules.length} mô đun môn học!`
            : `✅ Đã trích xuất chính xác ${finalModules.length} mô đun môn học từ tệp tải lên!`
        );
      } else {
        alert('Không tìm thấy danh sách mô đun / môn học hợp lệ trong tệp tải lên!');
      }
    } catch (err: any) {
      console.error('Lỗi khi tải tệp:', err);
      alert(`Đã xảy ra lỗi khi đọc tệp tin: ${err?.message || err}`);
    } finally {
      setIsAiAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Cập nhật học kỳ cho 1 mô đun trong modal preview
  const handleUpdatePreviewSemester = (modId: string, newSemester: number) => {
    setImportedPreview(prev => {
      if (!prev) return null;
      return prev.map(m => {
        if (m.id === modId) {
          return {
            ...m,
            semester: newSemester as any,
            academicYearNumber: Math.ceil(newSemester / 2)
          };
        }
        return m;
      });
    });
  };

  // Gán học kỳ hàng loạt cho các mô đun được chọn trong modal preview
  const handleBatchAssignPreviewSemester = () => {
    if (selectedPreviewIds.size === 0) {
      alert('Vui lòng tích chọn ít nhất 1 mô đun để phân chia kỳ học!');
      return;
    }
    setImportedPreview(prev => {
      if (!prev) return null;
      return prev.map(m => {
        if (selectedPreviewIds.has(m.id)) {
          return {
            ...m,
            semester: batchTargetPreviewSemester as any,
            academicYearNumber: Math.ceil(batchTargetPreviewSemester / 2)
          };
        }
        return m;
      });
    });
    showToast(`✅ Đã phân chia ${selectedPreviewIds.size} mô đun sang Học kỳ ${batchTargetPreviewSemester}!`);
    setSelectedPreviewIds(new Set());
  };

  // Chọn / bỏ chọn 1 mô đun trong modal preview
  const toggleSelectPreviewModule = (modId: string) => {
    setSelectedPreviewIds(prev => {
      const next = new Set(prev);
      if (next.has(modId)) next.delete(modId);
      else next.add(modId);
      return next;
    });
  };

  // Chọn tất cả / Bỏ chọn tất cả trong modal preview
  const toggleSelectAllPreview = () => {
    if (!importedPreview) return;
    if (selectedPreviewIds.size === importedPreview.length) {
      setSelectedPreviewIds(new Set());
    } else {
      setSelectedPreviewIds(new Set(importedPreview.map(m => m.id)));
    }
  };

  // Xác nhận nhập từ file
  const handleConfirmImport = (mode: 'replace' | 'append') => {
    if (!importedPreview) return;

    if (mode === 'replace') {
      setModules(importedPreview);
      saveCurriculumForSystem(activeSystem, importedPreview);
      if (onApplyCurriculum) onApplyCurriculum(activeSystem, importedPreview);
      showToast(`✅ Đã tải lên và ghi đè ${importedPreview.length} mô đun vào chương trình khung!`);
    } else {
      setModules(prev => {
        const merged = [...prev];
        importedPreview.forEach(imp => {
          const idx = merged.findIndex(m => m.id === imp.id);
          if (idx >= 0) merged[idx] = imp;
          else merged.push(imp);
        });
        saveCurriculumForSystem(activeSystem, merged);
        if (onApplyCurriculum) onApplyCurriculum(activeSystem, merged);
        return merged;
      });
      showToast(`✅ Đã nạp thêm ${importedPreview.length} mô đun vào chương trình khung!`);
    }

    setImportedPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-hidden animate-fadeIn">
      <div className="bg-white w-full max-w-7xl h-[94vh] rounded-2xl shadow-2xl flex flex-col border border-slate-300 overflow-hidden">
        {/* =========================================================================
            1. HEADER BANNER CHÍNH
        ========================================================================= */}
        <div className="bg-gradient-to-r from-[#1a447c] via-[#205499] to-[#12335f] text-white px-5 py-3.5 flex items-center justify-between shadow-md shrink-0 border-b-2 border-yellow-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-yellow-300 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-yellow-300 drop-shadow-xs">
                  BẢNG QUẢN TRỊ CHƯƠNG TRÌNH KHUNG ĐÀO TẠO & PHÂN CHIA MÔ ĐUN THEO HỌC KỲ
                </h2>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/30">
                  Chuẩn TT 04/2022/TT-BLĐTBXH
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">
                {systemConfig.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAndApply}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-lg shadow-md hover:shadow-lg transition cursor-pointer active:scale-95 border border-emerald-400/40"
              title="Lưu tất cả thay đổi vào hệ thống"
            >
              <Save className="w-4 h-4 text-emerald-200" />
              <span>LƯU & ÁP DỤNG</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              title="Đóng bảng"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. THANH CHUYỂN ĐỔI 3 HỆ ĐÀO TẠO & THỐNG KÊ TỔNG QUAN
        ========================================================================= */}
        <div className="bg-[#f0f4fa] border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* 3 Tabs Hệ Đào Tạo */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl border border-slate-300 shadow-inner">
            {[
              { id: 'HỆ CAO ĐẲNG CHÍNH QUY', label: 'HỆ CAO ĐẲNG CHÍNH QUY', icon: '🎓', sub: '3 Năm • 6 Kỳ' },
              { id: 'HỆ LIÊN THÔNG CAO ĐẲNG', label: 'HỆ LIÊN THÔNG CAO ĐẲNG', icon: '⚡', sub: '1.5-2 Năm • 4 Kỳ' },
              { id: 'HỆ TRUNG CẤP + THPT', label: 'HỆ TRUNG CẤP + THPT', icon: '🏫', sub: '3 Năm • 6 Kỳ' }
            ].map(sys => {
              const isSelected = activeSystem.toLowerCase() === sys.id.toLowerCase();
              return (
                <button
                  key={sys.id}
                  onClick={() => setActiveSystem(sys.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#1e467d] text-yellow-300 shadow-md ring-1 ring-yellow-400/50'
                      : 'text-slate-700 hover:bg-white/80 hover:text-blue-900'
                  }`}
                >
                  <span className="text-sm">{sys.icon}</span>
                  <div className="text-left">
                    <span className="block leading-tight">{sys.label}</span>
                    <span className={`text-[10px] block font-normal ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                      {sys.sub}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dải số liệu Thống kê nhanh */}
          <div className="flex items-center gap-2 sm:gap-4 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-xs">
            <div className="text-center px-1">
              <span className="text-slate-500 text-[10px] block">Mô đun</span>
              <strong className="text-slate-800 text-sm">{stats.totalCount}</strong>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center px-1">
              <span className="text-slate-500 text-[10px] block">Tín chỉ</span>
              <strong className="text-blue-700 text-sm">{stats.totalCredits} TC</strong>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center px-1">
              <span className="text-slate-500 text-[10px] block">Tổng số tiết</span>
              <strong className="text-slate-800 text-sm">{stats.totalHours}h</strong>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center px-1">
              <span className="text-slate-500 text-[10px] block">Phân bổ (LT / TH / KT)</span>
              <strong className="text-slate-700 text-xs">
                {stats.theoryHours}h / <span className="text-emerald-700 font-bold">{stats.practiceHours}h</span> / <span className="text-amber-700 font-bold">{stats.examHours}h</span>
              </strong>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center px-1">
              <span className="text-slate-500 text-[10px] block">Tỷ lệ Xưởng</span>
              <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2 py-0.5 rounded-md border border-emerald-300">
                {stats.practicePercent}% TH
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. THANH CÔNG CỤ TÁC VỤ (UPLOAD, DOWNLOAD, ADD, VIEW MODE, SEARCH)
        ========================================================================= */}
        <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Nhóm nút Tải lên, Tải mẫu, Thêm mô đun */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Input file ẩn */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv,.json"
              className="hidden"
            />

            {/* Nút Tải lên file */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition cursor-pointer active:scale-95"
              title="Tải lên tệp chương trình khung (Excel / CSV / JSON)"
            >
              <Upload className="w-4 h-4 text-blue-200" />
              <span>TẢI LÊN FILE CT KHUNG</span>
            </button>

            {/* Nút Tải mẫu chuẩn Bộ */}
            <button
              onClick={handleResetToStandard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-lg shadow-2xs transition cursor-pointer"
              title="Nạp lại chương trình khung chuẩn theo Bộ Lao động - TBXH"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              <span>NẠP MẪU CHUẨN BỘ</span>
            </button>

            {/* Nút Tải tệp mẫu Excel */}
            <button
              onClick={handleDownloadSampleExcel}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg transition cursor-pointer"
              title="Tải tệp Excel mẫu để nhập liệu"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tải file mẫu Excel</span>
            </button>

            {/* Nút Xuất Excel */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs rounded-lg transition cursor-pointer"
              title="Xuất chương trình khung ra tệp Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Xuất Excel</span>
            </button>

            {/* Nút Thêm mô đun */}
            <button
              onClick={() => handleOpenAddModal(1)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition cursor-pointer"
              title="Thêm mô đun mới vào chương trình"
            >
              <Plus className="w-4 h-4" />
              <span>+ THÊM MÔ ĐUN</span>
            </button>
          </div>

          {/* Nhóm Chọn Chế Độ Xem & Tìm Kiếm */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Chuyển đổi View: Ma trận vs Bảng */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-300">
              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-white text-blue-800 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem dạng Ma trận các Kỳ & Năm học (Kéo thả)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ma Trận Kỳ Học</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-800 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem dạng Bảng chi tiết toàn bộ môn học"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Bảng Chi Tiết</span>
              </button>
            </div>

            {/* Ô tìm kiếm */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã hoặc tên mô đun..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-lg w-48 sm:w-60 focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Toast thông báo nổi */}
        {toastMessage && (
          <div className="bg-emerald-700 text-white text-xs font-bold py-2 px-4 shadow-lg text-center flex items-center justify-center gap-2 animate-fadeIn shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* =========================================================================
            4. VÙNG NỘI DUNG CHÍNH (VIEW MODE 1: MATRIX HOẶC VIEW MODE 2: TABLE)
        ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100/70">
          {viewMode === 'matrix' ? (
            /* ===================================================================
               VIEW 1: MA TRẬN CÁC KỲ HỌC TRONG CÁC NĂM HỌC TƯƠNG ỨNG (KANBAN KÉO THẢ)
            =================================================================== */
            <div className="flex flex-col gap-6">
              {/* Thanh gợi ý kéo thả */}
              <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">💡</span>
                  <span>
                    <strong>Hướng dẫn phân chia:</strong> Thầy/Cô có thể <strong>kéo thả thẻ mô đun</strong> từ Học kỳ này sang Học kỳ khác để phân bổ lộ trình đào tạo, hoặc bấm biểu tượng <ArrowRightLeft className="w-3.5 h-3.5 inline text-blue-600" /> trên mỗi thẻ để chuyển kỳ nhanh.
                  </span>
                </div>
                <span className="font-semibold text-blue-700 hidden sm:inline">
                  Tổng {stats.totalCount} mô đun • {stats.totalCredits} Tín chỉ
                </span>
              </div>

              {/* Lặp qua các Năm học tương ứng */}
              {Array.from({ length: systemConfig.years }).map((_, yearIdx) => {
                const yearNum = yearIdx + 1;
                const sem1 = (yearNum - 1) * 2 + 1;
                const sem2 = (yearNum - 1) * 2 + 2;

                return (
                  <div key={yearNum} className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
                    {/* Header Năm học */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-yellow-300" />
                        <h3 className="font-black text-sm uppercase tracking-wide">
                          NĂM HỌC THỨ {yearNum === 1 ? 'NHẤT' : yearNum === 2 ? 'HAI' : 'BA'} (NĂM {yearNum})
                        </h3>
                        <span className="text-slate-300 text-xs">
                          • {yearNum === 1 ? 'Kiến thức chung & Cơ sở ngành' : yearNum === 2 ? 'Chuyên môn ngành & Thực hành nâng cao' : 'Thực tập xưởng, Doanh nghiệp & Tốt nghiệp'}
                        </span>
                      </div>
                      <span className="text-xs text-yellow-300 font-bold">
                        Học kỳ {sem1} & Học kỳ {sem2}
                      </span>
                    </div>

                    {/* Lưới 2 cột cho 2 Học kỳ của năm */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 p-3 gap-3">
                      {[sem1, sem2].map(sem => {
                        const semModules = modules.filter(m => {
                          const matchSem = Number(m.semester) === sem;
                          if (searchQuery.trim()) {
                            const q = searchQuery.toLowerCase().trim();
                            return matchSem && (m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
                          }
                          return matchSem;
                        });

                        const semCredits = semModules.reduce((s, m) => s + (Number(m.credits) || 0), 0);
                        const semTheory = semModules.reduce((s, m) => s + (Number(m.theoryHours) || 0), 0);
                        const semPractice = semModules.reduce((s, m) => s + (Number(m.practiceHours) || 0), 0);
                        const semExam = semModules.reduce((s, m) => s + (Number(m.examHours) || 0), 0);
                        const semHours = semModules.reduce((s, m) => s + (Number(m.totalHours) || (Number(m.theoryHours) || 0) + (Number(m.practiceHours) || 0) + (Number(m.examHours) || 0)), 0);
                        const isOver = dragOverSemester === sem;

                        return (
                          <div
                            key={sem}
                            onDragOver={e => handleDragOver(e, sem)}
                            onDragLeave={handleDragLeave}
                            onDrop={e => handleDrop(e, sem)}
                            className={`flex flex-col rounded-xl border p-3 transition-all min-h-[260px] ${
                              isOver
                                ? 'bg-blue-100/60 border-blue-500 ring-2 ring-blue-500 shadow-md'
                                : 'bg-slate-50/70 border-slate-200'
                            }`}
                          >
                            {/* Tiêu đề Học kỳ & Thống kê của kỳ */}
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                              <div className="flex items-center gap-2">
                                <span className="bg-[#1e467d] text-white font-black text-xs px-2.5 py-1 rounded-md shadow-2xs">
                                  HỌC KỲ {sem}
                                </span>
                                <span className="text-xs font-bold text-slate-700">
                                  {semModules.length} mô đun
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">
                                  {semCredits} Tín chỉ
                                </span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  {semHours}h (LT: {semTheory}h | TH: {semPractice}h{semExam > 0 ? ` | KT: ${semExam}h` : ''})
                                </span>
                              </div>
                            </div>

                            {/* Danh sách các thẻ mô đun trong kỳ */}
                            <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[460px] pr-1">
                              {semModules.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">
                                  <Layers className="w-8 h-8 mb-1.5 opacity-40" />
                                  <p className="text-xs font-medium">Chưa có mô đun nào trong Học kỳ {sem}</p>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Kéo thả mô đun vào đây hoặc bấm nút thêm bên dưới
                                  </p>
                                </div>
                              ) : (
                                semModules.map(m => {
                                  const isBeingDragged = draggedModuleId === m.id;
                                  return (
                                    <div
                                      key={m.id}
                                      draggable
                                      onDragStart={e => handleDragStart(e, m.id)}
                                      className={`bg-white rounded-xl border p-2.5 shadow-2xs hover:shadow-md transition cursor-grab active:cursor-grabbing select-none group relative ${
                                        isBeingDragged
                                          ? 'opacity-40 border-dashed border-blue-400'
                                          : 'border-slate-300 hover:border-blue-400'
                                      }`}
                                    >
                                      {/* Dòng 1: Mã môn, Loại môn & Nút thao tác */}
                                      <div className="flex items-center justify-between gap-1 mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                          <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                                          <span className="font-mono font-black text-xs text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200">
                                            {m.id}
                                          </span>
                                          {m.type && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                              {m.type}
                                            </span>
                                          )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-1">
                                          {/* Dropdown chuyển kỳ nhanh */}
                                          <select
                                            value={m.semester}
                                            onChange={e => handleMoveModuleSemester(m.id, Number(e.target.value))}
                                            className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded px-1 py-0.5 border border-slate-300 cursor-pointer focus:outline-hidden"
                                            title="Chuyển nhanh sang học kỳ khác"
                                            onClick={e => e.stopPropagation()}
                                          >
                                            {Array.from({ length: systemConfig.semesters }).map((_, idx) => (
                                              <option key={idx + 1} value={idx + 1}>
                                                Kỳ {idx + 1}
                                              </option>
                                            ))}
                                          </select>

                                          <button
                                            onClick={e => {
                                              e.stopPropagation();
                                              handleOpenEditModal(m);
                                            }}
                                            className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded transition cursor-pointer"
                                            title="Sửa thông tin mô đun"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={e => {
                                              e.stopPropagation();
                                              handleDeleteModule(m.id, m.name);
                                            }}
                                            className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded transition cursor-pointer"
                                            title="Xóa mô đun"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Dòng 2: Tên mô đun */}
                                      <h4 className="text-xs font-bold text-slate-900 leading-snug mb-1.5 line-clamp-2">
                                        {m.name}
                                      </h4>

                                      {/* Dòng 3: Tín chỉ, giờ học, chi tiết */}
                                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                                        <span className="font-bold text-blue-700">
                                          {m.credits} Tín chỉ
                                        </span>
                                        <span>
                                          Tổng: <strong>{m.totalHours}h</strong> (LT: {m.theoryHours}h | TH: <strong className="text-emerald-700">{m.practiceHours}h</strong>{m.examHours ? ` | KT: <strong className="text-amber-700">${m.examHours}h</strong>` : ''})
                                        </span>
                                      </div>

                                      {m.note && (
                                        <div className="mt-1 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 truncate">
                                          📌 {m.note}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Nút thêm nhanh vào kỳ này */}
                            <button
                              onClick={() => handleOpenAddModal(sem)}
                              className="mt-2 w-full py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-800 border border-dashed border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 text-blue-600" />
                              <span>Thêm mô đun vào Kỳ {sem}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ===================================================================
               VIEW 2: BẢNG CHI TIẾT TOÀN DIỆN (FULL TABLE VIEW CÓ BULK ACTIONS)
            =================================================================== */
            <div className="flex flex-col gap-3">
              {/* Thanh bộ lọc & Thao tác hàng loạt */}
              <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
                {/* Bộ lọc Năm học & Học kỳ */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold">Năm học:</span>
                    <select
                      value={filterYear}
                      onChange={e => setFilterYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-slate-50 font-bold"
                    >
                      <option value="all">Tất cả các năm</option>
                      {Array.from({ length: systemConfig.years }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>Năm {i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="font-semibold">Học kỳ:</span>
                    <select
                      value={filterSemester}
                      onChange={e => setFilterSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-slate-50 font-bold"
                    >
                      <option value="all">Tất cả các kỳ</option>
                      {Array.from({ length: systemConfig.semesters }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>Học kỳ {i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <span className="text-xs text-slate-500">
                    Hiển thị <strong>{filteredModules.length}</strong> / {modules.length} mô đun
                  </span>
                </div>

                {/* Chuyển kỳ hàng loạt */}
                {selectedModuleIds.length > 0 && (
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                    <span className="text-xs font-bold text-blue-900">
                      Đã chọn {selectedModuleIds.length} mô đun:
                    </span>
                    <span className="text-xs text-slate-600">Chuyển sang:</span>
                    <select
                      value={bulkTargetSemester}
                      onChange={e => setBulkTargetSemester(Number(e.target.value))}
                      className="px-2 py-0.5 text-xs font-bold border border-blue-300 rounded bg-white"
                    >
                      {Array.from({ length: systemConfig.semesters }).map((_, idx) => (
                        <option key={idx + 1} value={idx + 1}>Học kỳ {idx + 1}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleBulkMove}
                      className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded transition cursor-pointer"
                    >
                      Áp dụng
                    </button>
                    <button
                      onClick={() => setSelectedModuleIds([])}
                      className="text-xs text-slate-500 hover:text-slate-800 underline ml-1 cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                )}
              </div>

              {/* Bảng dữ liệu chi tiết */}
              <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#1f4980] text-white font-bold border-b border-blue-900">
                        <th className="py-2.5 px-3 text-center w-10">
                          <input
                            type="checkbox"
                            checked={selectedModuleIds.length === filteredModules.length && filteredModules.length > 0}
                            onChange={e => {
                              if (e.target.checked) setSelectedModuleIds(filteredModules.map(m => m.id));
                              else setSelectedModuleIds([]);
                            }}
                            className="rounded cursor-pointer"
                          />
                        </th>
                        <th className="py-2.5 px-3 text-center w-12">STT</th>
                        <th className="py-2.5 px-3 w-24">Mã MĐ/MH</th>
                        <th className="py-2.5 px-3 min-w-[220px]">Tên Mô đun / Môn học</th>
                        <th className="py-2.5 px-3 text-center w-28">Năm học</th>
                        <th className="py-2.5 px-3 text-center w-28">Học kỳ phân bổ</th>
                        <th className="py-2.5 px-3 text-center w-16">Số TC</th>
                        <th className="py-2.5 px-3 text-center w-18">Tổng giờ</th>
                        <th className="py-2.5 px-3 text-center w-14">LT</th>
                        <th className="py-2.5 px-3 text-center w-14">TH</th>
                        <th className="py-2.5 px-3 text-center w-14">KT</th>
                        <th className="py-2.5 px-3 w-28">Khối môn</th>
                        <th className="py-2.5 px-3 text-center w-20">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredModules.length === 0 ? (
                        <tr>
                          <td colSpan={13} className="py-10 text-center text-slate-400 font-medium">
                            Không tìm thấy mô đun nào phù hợp với bộ lọc!
                          </td>
                        </tr>
                      ) : (
                        filteredModules.map((m, idx) => {
                          const isSelected = selectedModuleIds.includes(m.id);
                          return (
                            <tr
                              key={m.id}
                              className={`hover:bg-blue-50/60 transition ${
                                isSelected ? 'bg-blue-50' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                              }`}
                            >
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={e => {
                                    if (e.target.checked) setSelectedModuleIds(prev => [...prev, m.id]);
                                    else setSelectedModuleIds(prev => prev.filter(id => id !== m.id));
                                  }}
                                  className="rounded cursor-pointer"
                                />
                              </td>
                              <td className="py-2 px-3 text-center font-semibold text-slate-500">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-3 font-mono font-black text-blue-900">
                                {m.id}
                              </td>
                              <td className="py-2 px-3 font-bold text-slate-800">
                                {m.name}
                                {m.note && (
                                  <span className="block text-[10px] text-slate-500 font-normal italic">
                                    {m.note}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
                                  Năm {m.academicYearNumber || Math.ceil(m.semester / 2)}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <select
                                  value={m.semester}
                                  onChange={e => handleMoveModuleSemester(m.id, Number(e.target.value))}
                                  className="px-2 py-1 bg-white border border-slate-300 rounded font-black text-blue-900 shadow-2xs cursor-pointer focus:ring-1 focus:ring-blue-500"
                                >
                                  {Array.from({ length: systemConfig.semesters }).map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                      Học kỳ {i + 1}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2 px-3 text-center font-black text-blue-700">
                                {m.credits}
                              </td>
                              <td className="py-2 px-3 text-center font-black text-slate-800">
                                {m.totalHours}h
                              </td>
                              <td className="py-2 px-3 text-center text-slate-600">
                                {m.theoryHours}h
                              </td>
                              <td className="py-2 px-3 text-center font-bold text-emerald-700">
                                {m.practiceHours}h
                              </td>
                              <td className="py-2 px-3 text-center font-bold text-amber-700">
                                {m.examHours || 0}h
                              </td>
                              <td className="py-2 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  {m.type || 'Chuyên môn'}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditModal(m)}
                                    className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition cursor-pointer"
                                    title="Sửa thông tin"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteModule(m.id, m.name)}
                                    className="p-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded transition cursor-pointer"
                                    title="Xóa môn"
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
                    <tfoot className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 text-right">
                          TỔNG CỘNG CHƯƠNG TRÌNH KHUNG:
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {systemConfig.years} Năm
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {systemConfig.semesters} Kỳ
                        </td>
                        <td className="py-2.5 px-3 text-center text-blue-800 font-black">
                          {stats.totalCredits} TC
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-900 font-black">
                          {stats.totalHours}h
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {stats.theoryHours}h
                        </td>
                        <td className="py-2.5 px-3 text-center text-emerald-800 font-black">
                          {stats.practiceHours}h
                        </td>
                        <td className="py-2.5 px-3 text-center text-amber-800 font-bold">
                          {stats.examHours}h
                        </td>
                        <td colSpan={2} className="py-2.5 px-3 text-center text-emerald-700 font-bold">
                          {stats.practicePercent}% Thực hành xưởng
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            5. FOOTER THANH ĐIỀU HƯỚNG & NÚT LƯU
        ========================================================================= */}
        <div className="bg-white border-t border-slate-300 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-bold text-blue-900">{activeSystem}</span>
            <span>•</span>
            <span>{modules.length} mô đun môn học được phân bổ vào {systemConfig.semesters} học kỳ</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer border border-slate-300"
            >
              Đóng
            </button>
            <button
              onClick={handleSaveAndApply}
              className="px-5 py-2 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-black text-xs rounded-lg shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5 active:scale-95 border border-blue-400"
            >
              <Save className="w-4 h-4 text-yellow-300" />
              <span>LƯU & ÁP DỤNG VÀO HỆ THỐNG</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6. MODAL THÊM / SỬA MÔ ĐUN
      ========================================================================= */}
      {isEditModalOpen && editingModule && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-[#1b437a] to-[#24589d] text-white px-5 py-3 flex items-center justify-between">
              <h3 className="font-black text-sm uppercase text-yellow-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{editingModule.id ? 'CẬP NHẬT MÔ ĐUN MÔN HỌC' : 'THÊM MÔ ĐUN MÔN HỌC MỚI'}</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 flex flex-col gap-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mã Mô đun / MH (*):</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: MĐ01, MH02..."
                    value={editingModule.id || ''}
                    onChange={e => setEditingModule(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khối kiến thức:</label>
                  <select
                    value={editingModule.type || 'Chuyên môn'}
                    onChange={e => setEditingModule(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold bg-white"
                  >
                    <option value="Môn học chung">Môn học chung</option>
                    <option value="Cơ sở ngành">Cơ sở ngành</option>
                    <option value="Chuyên môn">Chuyên môn</option>
                    <option value="Thực tập xưởng">Thực tập xưởng</option>
                    <option value="Thực tập tốt nghiệp">Thực tập tốt nghiệp</option>
                    <option value="Đồ án / Khóa luận">Đồ án / Khóa luận</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Mô đun / Môn học (*):</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thực hành Tháo lắp & Sửa chữa Động cơ đốt trong"
                  value={editingModule.name || ''}
                  onChange={e => setEditingModule(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Phân bổ Kỳ & Năm học */}
              <div className="grid grid-cols-2 gap-3 bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                <div>
                  <label className="font-bold text-blue-900 block mb-1">Phân bổ vào Học kỳ (*):</label>
                  <select
                    value={editingModule.semester || 1}
                    onChange={e => {
                      const sem = Number(e.target.value);
                      setEditingModule(prev => ({
                        ...prev,
                        semester: sem,
                        academicYearNumber: Math.ceil(sem / 2)
                      }));
                    }}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg font-black text-blue-900 bg-white"
                  >
                    {Array.from({ length: systemConfig.semesters }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Học kỳ {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-blue-900 block mb-1">Thuộc Năm học:</label>
                  <div className="px-3 py-2 bg-white rounded-lg border border-blue-300 font-bold text-blue-800">
                    Năm học thứ {Math.ceil((editingModule.semester || 1) / 2)}
                  </div>
                </div>
              </div>

              {/* Tín chỉ & Phân bổ số giờ theo chuẩn GDNN: Khóa cố định không cho phép sửa số giờ và số tín chỉ */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Thời lượng đào tạo chuẩn GDNN:</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      🔒 Cố định theo CT Khung (Không cho phép tự sửa/thay đổi giờ, tín chỉ)
                    </span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ⚡ Chuẩn: Tổng = LT + TH + KT
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px] flex items-center justify-between">
                      <span>Số Tín chỉ:</span>
                      <span className="text-[10px] text-slate-400">🔒 Khóa</span>
                    </label>
                    <input
                      type="number"
                      readOnly
                      title="Số tín chỉ được khóa cố định theo Chương trình khung đào tạo"
                      value={editingModule.credits || 3}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-black text-center text-blue-800 bg-slate-100 cursor-not-allowed select-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-blue-700 block mb-1 text-[11px] flex items-center justify-between">
                      <span>Lý thuyết (LT):</span>
                      <span className="text-[10px] text-slate-400">🔒 Khóa</span>
                    </label>
                    <input
                      type="number"
                      readOnly
                      title="Số giờ lý thuyết được khóa cố định theo Chương trình khung"
                      value={editingModule.theoryHours ?? 20}
                      className="w-full px-2 py-1.5 border border-blue-200 bg-blue-50/70 rounded-lg text-center font-bold text-blue-900 cursor-not-allowed select-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-emerald-700 block mb-1 text-[11px] flex items-center justify-between">
                      <span>Thực hành (TH):</span>
                      <span className="text-[10px] text-slate-400">🔒 Khóa</span>
                    </label>
                    <input
                      type="number"
                      readOnly
                      title="Số giờ thực hành được khóa cố định theo Chương trình khung"
                      value={editingModule.practiceHours ?? 38}
                      className="w-full px-2 py-1.5 border border-emerald-200 bg-emerald-50/70 rounded-lg font-bold text-center text-emerald-800 cursor-not-allowed select-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-amber-700 block mb-1 text-[11px] flex items-center justify-between">
                      <span>Kiểm tra (KT):</span>
                      <span className="text-[10px] text-slate-400">🔒 Khóa</span>
                    </label>
                    <input
                      type="number"
                      readOnly
                      title="Số giờ kiểm tra được khóa cố định theo Chương trình khung"
                      value={editingModule.examHours ?? 2}
                      className="w-full px-2 py-1.5 border border-amber-200 bg-amber-50/70 rounded-lg font-bold text-center text-amber-900 cursor-not-allowed select-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-indigo-950 block mb-1 text-[11px] flex items-center justify-between">
                      <span>Tổng số giờ:</span>
                      <span className="text-[10px] text-slate-400">🔒 Khóa</span>
                    </label>
                    <input
                      type="number"
                      readOnly
                      title="Tổng số giờ = LT + TH + KT được khóa cố định theo quy định"
                      value={editingModule.totalHours || ((editingModule.theoryHours || 0) + (editingModule.practiceHours || 0) + (editingModule.examHours || 0))}
                      className="w-full px-2 py-1.5 border-2 border-indigo-400 bg-indigo-50/70 rounded-lg font-black text-center text-indigo-950 cursor-not-allowed select-none"
                    />
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-600 flex items-center justify-between bg-white px-2.5 py-1.5 rounded-md border border-slate-200">
                  <span className="font-semibold text-indigo-900">
                    ✓ Kiểm định GDNN: {editingModule.totalHours || 0} giờ = {(editingModule.theoryHours || 0)} LT + {(editingModule.practiceHours || 0)} TH + {(editingModule.examHours || 0)} KT
                  </span>
                  <span className="font-bold text-emerald-700">
                    Tỷ lệ TH xưởng: {editingModule.totalHours ? Math.round(((editingModule.practiceHours || 0) / editingModule.totalHours) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ghi chú sư phạm / Vị trí xưởng thực hành:</label>
                <input
                  type="text"
                  placeholder="VD: Cầu nâng 2 trụ, Xưởng điện EFI, Chẩn đoán OBD-II..."
                  value={editingModule.note || ''}
                  onChange={e => setEditingModule(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-lg shadow-md"
                >
                  Lưu Mô đun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. MODAL XEM TRƯỚC VÀ XÁC NHẬN NẠP TỪ FILE (IMPORT PREVIEW)
      ========================================================================= */}
      {importedPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-yellow-300" />
                <h3 className="font-black text-sm uppercase text-yellow-300">
                  XÁC NHẬN TẢI LÊN CHƯƠNG TRÌNH KHUNG ({importedPreview.length} MÔ ĐUN)
                </h3>
              </div>
              <button
                onClick={() => setImportedPreview(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 text-xs text-blue-900 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Hệ tiếp nhận:</span>
                <span className="font-black text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">{activeSystem}</span>
                <span>•</span>
                <span>Số lượng: <strong className="text-blue-950 font-bold">{importedPreview.length} mô đun môn học</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-[11px] bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                <span className="text-slate-600">Kiểm tra thời lượng:</span>
                <span className="text-indigo-950 font-black bg-indigo-100 px-1.5 py-0.5 rounded">
                  {importedPreview.reduce((s, m) => s + m.totalHours, 0)}h
                </span>
                <span>=</span>
                <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  LT: {importedPreview.reduce((s, m) => s + m.theoryHours, 0)}h
                </span>
                <span>+</span>
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  TH: {importedPreview.reduce((s, m) => s + m.practiceHours, 0)}h
                </span>
                <span>+</span>
                <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  KT: {importedPreview.reduce((s, m) => s + (m.examHours || 0), 0)}h
                </span>
                <span className="ml-1 text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  🔒 Cố định theo CT Khung
                </span>
              </div>
            </div>

            {/* Thanh công cụ Phân chia Học kỳ hàng loạt */}
            <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={importedPreview.length > 0 && selectedPreviewIds.size === importedPreview.length}
                    onChange={toggleSelectAllPreview}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <span>Chọn tất cả ({importedPreview.length})</span>
                </label>
                {selectedPreviewIds.size > 0 && (
                  <span className="bg-blue-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-full">
                    Đã chọn {selectedPreviewIds.size} mô đun
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-950 text-xs">Phân chia các mô đun đã chọn vào:</span>
                <select
                  value={batchTargetPreviewSemester}
                  onChange={e => setBatchTargetPreviewSemester(Number(e.target.value))}
                  className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg font-black text-blue-900 text-xs shadow-2xs focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  {Array.from({ length: systemConfig.semesters }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Học kỳ {i + 1} (Năm {Math.ceil((i + 1) / 2)})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleBatchAssignPreviewSemester}
                  disabled={selectedPreviewIds.size === 0}
                  className={`px-3 py-1 font-black text-xs rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs ${
                    selectedPreviewIds.size > 0
                      ? 'bg-amber-600 hover:bg-amber-700 text-white active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Áp dụng phân chia kỳ học</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300 sticky top-0 z-10 shadow-2xs">
                    <th className="py-2 px-2 text-center w-10">
                      <input
                        type="checkbox"
                        checked={importedPreview.length > 0 && selectedPreviewIds.size === importedPreview.length}
                        onChange={toggleSelectAllPreview}
                        className="w-3.5 h-3.5 text-blue-600 rounded cursor-pointer"
                        title="Chọn tất cả"
                      />
                    </th>
                    <th className="py-2 px-2 text-center w-10">STT</th>
                    <th className="py-2 px-2 w-20">Mã MĐ</th>
                    <th className="py-2 px-2">Tên Mô đun / Môn học</th>
                    <th className="py-2 px-2 text-center w-28 bg-amber-100/60 text-amber-950 font-black">
                      Phân bổ Kỳ học
                    </th>
                    <th className="py-2 px-2 text-center w-14">
                      Tín chỉ <span className="text-[10px] text-slate-400">🔒</span>
                    </th>
                    <th className="py-2 px-2 text-center w-18">
                      Tổng giờ <span className="text-[10px] text-slate-400">🔒</span>
                    </th>
                    <th className="py-2 px-2 text-center w-14">LT</th>
                    <th className="py-2 px-2 text-center w-14">TH</th>
                    <th className="py-2 px-2 text-center w-14">KT</th>
                    <th className="py-2 px-2 text-center w-36">Kiểm tra chuẩn GDNN</th>
                    <th className="py-2 px-2 w-24">Loại môn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {importedPreview.map((m, idx) => {
                    const kt = m.examHours || 0;
                    const isSelected = selectedPreviewIds.has(m.id);
                    const isMathValid = m.totalHours === (m.theoryHours + m.practiceHours + kt);
                    return (
                      <tr key={idx} className={`hover:bg-blue-50/50 transition ${isSelected ? 'bg-amber-50/60' : ''}`}>
                        <td className="py-1.5 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectPreviewModule(m.id)}
                            className="w-3.5 h-3.5 text-blue-600 rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-center text-slate-500">{idx + 1}</td>
                        <td className="py-1.5 px-2 font-mono font-bold text-blue-900">{m.id}</td>
                        <td className="py-1.5 px-2 font-semibold text-slate-800">
                          {m.name}
                          {m.note && (
                            <span className="block text-[10px] text-slate-400 font-normal italic truncate">
                              {m.note}
                            </span>
                          )}
                        </td>
                        {/* Cột chọn kỳ học linh hoạt cho giáo viên phân chia */}
                        <td className="py-1.5 px-2 text-center bg-amber-50/40">
                          <select
                            value={m.semester}
                            onChange={e => handleUpdatePreviewSemester(m.id, Number(e.target.value))}
                            className="w-full px-2 py-1 bg-white border border-amber-300 rounded font-black text-blue-900 text-[11px] focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs"
                          >
                            {Array.from({ length: systemConfig.semesters }).map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                Học kỳ {i + 1}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1.5 px-2 text-center font-black text-slate-800 bg-slate-50/60" title="Khóa cố định theo CT Khung">
                          {m.credits}
                        </td>
                        <td className="py-1.5 px-2 text-center font-black text-indigo-950 bg-indigo-50/60" title="Khóa cố định: Tổng = LT+TH+KT">
                          {m.totalHours}h
                        </td>
                        <td className="py-1.5 px-2 text-center text-blue-700 font-semibold">{m.theoryHours}h</td>
                        <td className="py-1.5 px-2 text-center font-bold text-emerald-700">{m.practiceHours}h</td>
                        <td className="py-1.5 px-2 text-center font-bold text-amber-700">{kt}h</td>
                        <td className="py-1.5 px-2 text-center">
                          {isMathValid ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ✓ {m.totalHours} = {m.theoryHours}+{m.practiceHours}+{kt}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              ⚠ Lệch giờ ({m.totalHours} ≠ {m.theoryHours + m.practiceHours + kt})
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 text-slate-600 truncate">{m.type || 'Chuyên môn'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={5} className="py-2 px-2 text-right">
                      TỔNG CỘNG ({importedPreview.length} MÔ ĐUN):
                    </td>
                    <td className="py-2 px-2 text-center text-blue-800 font-black">
                      {importedPreview.reduce((s, m) => s + m.credits, 0)} TC
                    </td>
                    <td className="py-2 px-2 text-center font-black text-indigo-950 bg-indigo-100/70">
                      {importedPreview.reduce((s, m) => s + m.totalHours, 0)}h
                    </td>
                    <td className="py-2 px-2 text-center text-blue-700">
                      {importedPreview.reduce((s, m) => s + m.theoryHours, 0)}h
                    </td>
                    <td className="py-2 px-2 text-center text-emerald-700 font-black">
                      {importedPreview.reduce((s, m) => s + m.practiceHours, 0)}h
                    </td>
                    <td className="py-2 px-2 text-center text-amber-700 font-black">
                      {importedPreview.reduce((s, m) => s + (m.examHours || 0), 0)}h
                    </td>
                    <td colSpan={2} className="py-2 px-2 text-center text-emerald-700 font-bold text-[11px]">
                      {importedPreview.reduce((s, m) => s + m.totalHours, 0) > 0
                        ? Math.round((importedPreview.reduce((s, m) => s + m.practiceHours, 0) / importedPreview.reduce((s, m) => s + m.totalHours, 0)) * 100)
                        : 0}% Thực hành xưởng
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-300 flex items-center justify-between">
              <button
                onClick={() => setImportedPreview(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
              >
                Hủy bỏ
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleConfirmImport('append')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer"
                >
                  Gộp thêm vào danh sách hiện tại
                </button>
                <button
                  onClick={() => handleConfirmImport('replace')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg shadow-md cursor-pointer"
                >
                  ✓ Thay thế toàn bộ chương trình khung
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
