import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Copy, 
  MessageCircle, 
  Trash2,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Table,
  Filter,
  FileCheck,
  Search,
  Sparkles,
  Layers,
  ArrowDownToLine,
  Award,
  Users
} from 'lucide-react';
import { Student, StudentGrade, SubjectModule, AttendanceRecord, RenLuyenCriteria, FundTransaction, WorkshopSafetyLog, ClassId, UnitInfoSettings, ClassItem, UserAccount } from '../types';
import { 
  exportStudentListToCSV, 
  exportAcademicReportToCSV, 
  exportComprehensiveSummaryToCSV,
  calculateModuleGrade 
} from '../utils/csvExport';

interface BackupAndFormsModuleProps {
  students: Student[];
  currentClass: ClassId;
  modules: SubjectModule[];
  grades: StudentGrade[];
  attendance: AttendanceRecord[];
  renLuyen: RenLuyenCriteria[];
  fundTransactions: FundTransaction[];
  workshopLogs: WorkshopSafetyLog[];
  classes?: ClassItem[];
  onImportFullBackup?: (data: any) => void;
  onClearClassStudents?: () => void;
  onClearClassGrades?: () => void;
  onClearClassAttendance?: () => void;
  onClearClassRenLuyen?: () => void;
  onClearFundTransactions?: () => void;
  onClearWorkshopLogs?: () => void;
  onResetAllClassData?: () => void;
  unitInfo?: UnitInfoSettings;
  currentUser?: UserAccount | null;
}

export const BackupAndFormsModule: React.FC<BackupAndFormsModuleProps> = ({
  students,
  currentClass,
  modules = [],
  grades = [],
  attendance = [],
  renLuyen = [],
  fundTransactions: _fundTransactions,
  workshopLogs: _workshopLogs,
  classes = [],
  onImportFullBackup: _onImportFullBackup,
  unitInfo,
  currentUser: _currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'forms' | 'zalo-templates' | 'csv-exports'>('forms');
  const [targetStudentId, setTargetStudentId] = useState<string>('25OT1006');
  const [_copiedText, setCopiedText] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // CSV Export states
  const [csvScope, setCsvScope] = useState<'current' | 'all'>('current');
  const [csvPreviewType, setCsvPreviewType] = useState<'students' | 'academic' | 'comprehensive'>('students');
  const [csvSearchTerm, setCsvSearchTerm] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const classStudents = students.filter(s => s && s.classId === currentClass);

  // Xuất file CSV danh sách HSSV trích ngang
  const handleExportStudentList = () => {
    const targetStudents = csvScope === 'current' ? classStudents : students;
    if (targetStudents.length === 0) {
      showToast('⚠️ Không có sinh viên nào để xuất dữ liệu.');
      return;
    }
    exportStudentListToCSV(targetStudents, csvScope === 'current' ? currentClass : 'ToanTruong');
    showToast(`📥 Đã xuất thành công tệp CSV danh sách ${targetStudents.length} HSSV!`);
  };

  // Xuất file CSV báo cáo học vụ & bảng điểm chi tiết các mô đun
  const handleExportAcademicReport = () => {
    const targetStudents = csvScope === 'current' ? classStudents : students;
    if (targetStudents.length === 0) {
      showToast('⚠️ Không có sinh viên nào để xuất báo cáo học vụ.');
      return;
    }
    exportAcademicReportToCSV(targetStudents, modules, grades, attendance, renLuyen, csvScope === 'current' ? currentClass : 'ToanTruong');
    showToast(`📥 Đã xuất thành công tệp CSV Báo cáo học vụ & Bảng điểm chi tiết!`);
  };

  // Xuất file CSV báo cáo tổng hợp học vụ, chuyên cần & rèn luyện
  const handleExportComprehensive = () => {
    const targetStudents = csvScope === 'current' ? classStudents : students;
    if (targetStudents.length === 0) {
      showToast('⚠️ Không có sinh viên nào để xuất báo cáo tổng hợp.');
      return;
    }
    exportComprehensiveSummaryToCSV(targetStudents, modules, grades, attendance, renLuyen, csvScope === 'current' ? currentClass : 'ToanTruong');
    showToast(`📥 Đã xuất thành công tệp CSV Báo cáo tổng hợp ngoại tuyến (Offline)!`);
  };
  const targetStudent = classStudents.find(s => s.id === targetStudentId) || classStudents[0] || students[0] || ({
    id: '25OT1001',
    fullName: 'Trần Văn Hoàng',
    gender: 'Nam',
    birthDate: '15/04/2007',
    ethnicity: 'Kinh',
    idCard: '001207008912',
    permanentAddress: 'Hải Phòng',
    fatherName: 'Trần Văn Mạnh',
    motherName: 'Nguyễn Thị Hoa',
    workshopGroup: 1,
    role: 'Lớp trưởng',
    station: 'Cầu nâng 2 trụ & Khung gầm',
    policy: 'Miễn giảm 70% (NĐ 238/2025)'
  } as Student);

  const [formsList, setFormsList] = useState<Array<{ id: string; title: string; desc: string; type: string }>>([
    { id: 'cam-thi', title: 'Thông Báo Cảnh Báo Học Vụ & Nguy Cơ Cấm Thi', desc: 'V/v: Vắng học quá 20% thời lượng mô đun theo TT 04/2022/TT-BLĐTBXH', type: 'Hành chính' },
    { id: 'thuc-tap', title: 'Giấy Giới Thiệu Thực Tập Tại Doanh Nghiệp / Garage', desc: 'Cấp cho HSSV thực tập tay nghề định kỳ tại các đối tác liên kết', type: 'Hành chính' },
    { id: 'mien-giam', title: 'Đơn Xin Miễn Giảm 70% Học Phí Nghề Nặng Nhọc', desc: 'Áp dụng theo Nghị định 81/2021/NĐ-CP & Nghị định 238/2025/NĐ-CP', type: 'Chính sách' },
    { id: 'bao-luu', title: 'Đơn Xin Bảo Lưu Kết Quả Học Tập & Tạm Dừng', desc: 'Dành cho HSSV có hoàn cảnh đặc biệt hoặc đi nghĩa vụ quân sự', type: 'Hành chính' }
  ]);

  const [selectedForm, setSelectedForm] = useState<string>('cam-thi');

  const handleDeleteForm = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (formsList.length <= 1) {
      showToast('⚠️ Không thể xóa biểu mẫu cuối cùng trong danh sách.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa biểu mẫu này khỏi hệ thống không?')) {
      const updated = formsList.filter(f => f.id !== formId);
      setFormsList(updated);
      if (selectedForm === formId && updated.length > 0) {
        setSelectedForm(updated[0].id);
      }
      showToast('🗑️ Đã xóa biểu mẫu thành công!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    showToast('📋 Đã sao chép nội dung vào bộ nhớ tạm!');
  };

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-4 relative">
      {toastMsg && (
        <div className="sticky top-2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center justify-between gap-3 text-xs border border-slate-700 animate-in fade-in">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            BIỂU MẪU CHUẨN NGHỊ ĐỊNH 30/2020/NĐ-CP
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-1">
            BIỂU MẪU SƯ PHẠM & QUẢN TRỊ HÀNH CHÍNH
          </h2>
          <p className="text-xs text-slate-500">
            Tự động điền dữ liệu (Auto-fill) vào thông báo cấm thi, giấy giới thiệu thực tập garage, đơn miễn 70% học phí (Hỗ trợ xóa, chỉnh sửa và in ấn trực tiếp).
          </p>
        </div>

        {/* Tab switch & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('forms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'forms' ? 'bg-[#004e92] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Văn Bản Hành Chính ({formsList.length})
          </button>
          <button
            onClick={() => setActiveTab('zalo-templates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'zalo-templates' ? 'bg-[#004e92] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" /> Mẫu Soạn Zalo / SMS
          </button>
          <button
            onClick={() => setActiveTab('csv-exports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'csv-exports' ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-400/30' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 group-hover:text-emerald-700" /> Xuất Dữ Liệu CSV Ngoại Tuyến (Offline Records)
          </button>
        </div>
      </div>

      {/* FORMS TAB */}
      {activeTab === 'forms' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 lg:col-span-1">
            <h3 className="font-bold text-xs uppercase text-slate-700 tracking-wider">Danh Sách Biểu Mẫu</h3>
            <div className="space-y-2">
              {formsList.map(form => (
                <div
                  key={form.id}
                  onClick={() => setSelectedForm(form.id)}
                  className={`p-3 rounded-xl border transition text-xs flex items-start justify-between gap-2 cursor-pointer ${
                    selectedForm === form.id ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate">{form.title}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{form.desc}</div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteForm(form.id, e)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer shrink-0"
                    title="Xóa biểu mẫu này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="text-[11px] font-bold text-slate-700">Chọn HSSV Áp Dụng Biểu Mẫu:</label>
              <select
                value={targetStudent.id}
                onChange={(e) => setTargetStudentId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.id} - {s.fullName} ({s.role || 'HSSV'})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={handlePrint}
                className="w-full py-2 bg-[#004e92] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" /> In Văn Bản (PDF / Máy In)
              </button>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs lg:col-span-3 space-y-6 text-slate-800 print:shadow-none print:p-0">
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div className="text-center w-1/2">
                <div className="text-xs font-bold uppercase text-slate-600">{unitInfo?.schoolName || 'TRƯỜNG CAO ĐẲNG CÔNG NGHỆ VÀ KỸ THUẬT Ô TÔ'}</div>
                <div className="text-xs font-bold text-blue-900 mt-0.5">{unitInfo?.facultyName || 'KHOA CÔNG NGHỆ Ô TÔ'}</div>
                <div className="text-[11px] text-slate-500 mt-1">Lớp: {currentClass}</div>
              </div>
              <div className="text-center w-1/2">
                <div className="text-xs font-bold uppercase text-slate-800">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">Độc lập - Tự do - Hạnh phúc</div>
                <div className="text-[11px] text-slate-500 italic mt-1">Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</div>
              </div>
            </div>

            {selectedForm === 'cam-thi' && (
              <div className="space-y-6 text-sm leading-relaxed">
                <div className="text-center space-y-1">
                  <div className="text-xs font-bold uppercase text-blue-700 tracking-wider">THÔNG BÁO CHÍNH THỨC</div>
                  <h3 className="text-base font-bold uppercase text-slate-900">V/v Cảnh Báo Học Vụ & Nguy Cơ Cấm Thi Kết Thúc Mô Đun</h3>
                  <div className="text-xs text-slate-500 italic">(Căn cứ Thông tư số 04/2022/TT-BLĐTBXH Quy chế đào tạo trình độ cao đẳng, trung cấp)</div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="font-semibold text-slate-800">Kính gửi: Phụ huynh học sinh và sinh viên <span className="text-blue-700 underline">{targetStudent.fullName}</span> (Mã SV: {targetStudent.id})</p>
                  <p>Khoa Công nghệ Ô tô trân trọng thông báo tình hình học tập và chuyên cần của sinh viên trong học kỳ hiện tại như sau:</p>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong className="text-slate-600">Họ và tên HSSV:</strong> {targetStudent.fullName}</div>
                      <div><strong className="text-slate-600">Mã sinh viên:</strong> {targetStudent.id}</div>
                      <div><strong className="text-slate-600">Lớp học:</strong> {currentClass}</div>
                      <div><strong className="text-slate-600">Tổ xưởng thực hành:</strong> Tổ {targetStudent.workshopGroup || 1} ({targetStudent.station || 'Cầu nâng 2 trụ'})</div>
                      <div><strong className="text-slate-600">Số buổi nghỉ học:</strong> <span className="text-rose-600 font-bold">5 buổi (Nghỉ không phép)</span></div>
                      <div><strong className="text-slate-600">Tỷ lệ vắng mặt:</strong> <span className="text-rose-600 font-bold">22.5% (Vượt mức giới hạn 20%)</span></div>
                    </div>
                  </div>

                  <p>Theo quy định tại khoản 2 Điều 14 Thông tư 04/2022/TT-BLĐTBXH, sinh viên nghỉ quá 20% tổng số thời lượng của mô đun/tín chỉ sẽ <strong>không đủ điều kiện dự thi kết thúc mô đun</strong> và phải đăng ký học lại.</p>
                  
                  <p>Khoa yêu cầu sinh viên <span className="font-bold">{targetStudent.fullName}</span> nghiêm túc chấn chỉnh ý thức học tập, liên hệ ngay với Giáo viên chủ nhiệm để làm giải trình và cam kết chuyên cần trước ngày <span className="font-bold underline">25/{new Date().getMonth() + 1}/{new Date().getFullYear()}</span>.</p>
                </div>

                <div className="pt-8 flex justify-between">
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">Ý KIẾN CỦA GIA ĐÌNH</div>
                    <div className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên)</div>
                  </div>
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">CỐ VẤN HỌC TẬP / GVCN</div>
                    <div className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên)</div>
                    <div className="h-16 font-bold text-slate-800 mt-2">{unitInfo?.advisorName || 'Trần Văn Mạnh'}</div>
                  </div>
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">TRƯỞNG KHOA</div>
                    <div className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên)</div>
                    <div className="h-16 font-bold text-slate-800 mt-2">{unitInfo?.deanName || 'Đỗ Thế Huân'}</div>
                  </div>
                </div>
              </div>
            )}

            {selectedForm === 'thuc-tap' && (
              <div className="space-y-6 text-sm leading-relaxed">
                <div className="text-center space-y-1">
                  <div className="text-xs font-bold uppercase text-blue-700 tracking-wider">GIẤY GIỚI THIỆU THỰC TẬP</div>
                  <h3 className="text-base font-bold uppercase text-slate-900">V/v Tiếp Nhận HSSV Thực Tập Tay Nghề Định Kỳ Tại Doanh Nghiệp</h3>
                  <div className="text-xs text-slate-500 italic">(Cấp cho HSSV Khoa Công nghệ Ô tô thực tập tại Garage / Xưởng dịch vụ ô tô liên kết)</div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="font-semibold text-slate-800">Kính gửi: Ban Giám đốc các Garage / Doanh nghiệp Đối tác liên kết</p>
                  <p>Trường Cao đẳng Công nghệ và Kỹ thuật Ô tô trân trọng giới thiệu sinh viên:</p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong className="text-slate-600">Họ và tên HSSV:</strong> {targetStudent.fullName}</div>
                      <div><strong className="text-slate-600">Mã sinh viên:</strong> {targetStudent.id}</div>
                      <div><strong className="text-slate-600">Ngày sinh:</strong> {targetStudent.birthDate}</div>
                      <div><strong className="text-slate-600">CCCD:</strong> {targetStudent.idCard}</div>
                      <div><strong className="text-slate-600">Chuyên ngành:</strong> Công nghệ Kỹ thuật Ô tô</div>
                      <div><strong className="text-slate-600">Lớp học:</strong> {currentClass}</div>
                    </div>
                  </div>

                  <p>Được đến đơn vị để thực tập tay nghề, tìm hiểu công nghệ chẩn đoán điện tử ô tô, hệ thống phun xăng EFI và hộp số tự động từ ngày <span className="font-bold">01/{new Date().getMonth() + 1}/2025</span> đến ngày <span className="font-bold">01/{new Date().getMonth() + 2}/2025</span>.</p>
                  
                  <p>Rất mong Ban Giám đốc và các kỹ thuật viên trưởng tại xưởng tạo điều kiện, hướng dẫn và giúp đỡ em hoàn thành tốt đợt thực tập thực tế.</p>
                </div>

                <div className="pt-8 flex justify-between">
                  <div className="text-center w-1/3"></div>
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">TM. BAN GIÁM HIỆU / KHOA</div>
                    <div className="text-[11px] text-slate-500 italic">(Ký tên, đóng dấu)</div>
                    <div className="h-20 font-bold text-slate-800 mt-2">{unitInfo?.advisorName || 'Trần Văn Mạnh'}</div>
                  </div>
                </div>
              </div>
            )}

            {selectedForm === 'mien-giam' && (
              <div className="space-y-6 text-sm leading-relaxed">
                <div className="text-center space-y-1">
                  <div className="text-xs font-bold uppercase text-blue-700 tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                  <div className="text-xs font-bold text-slate-800">Độc lập - Tự do - Hạnh phúc</div>
                  <h3 className="text-base font-bold uppercase text-slate-900 mt-4">ĐƠN XIN MIỄN GIẢM 70% HỌC PHÍ</h3>
                  <div className="text-xs text-slate-500 italic">(Áp dụng cho ngành nghề nặng nhọc, độc hại, nguy hiểm theo Nghị định 81/2021/NĐ-CP & Nghị định 238/2025/NĐ-CP)</div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="font-semibold text-slate-800">Kính gửi: Ban Giám hiệu Nhà trường & Phòng Tài chính Kế toán</p>
                  
                  <div className="space-y-1.5 text-xs">
                    <div>Em tên là: <span className="font-bold text-slate-800">{targetStudent.fullName}</span> (Mã SV: {targetStudent.id})</div>
                    <div>Ngày sinh: {targetStudent.birthDate} | Giới tính: {targetStudent.gender}</div>
                    <div>Lớp học: {currentClass} | Khoa: Công nghệ Ô tô</div>
                    <div>Hộ khẩu thường trú: {targetStudent.permanentAddress}</div>
                  </div>

                  <p>Căn cứ theo Nghị định số 238/2025/NĐ-CP và Nghị định 81/2021/NĐ-CP quy định chính sách miễn giảm học phí đối với học sinh, sinh viên học các ngành nghề nặng nhọc, độc hại, nguy hiểm thuộc lĩnh vực kỹ thuật công nghệ ô tô, cơ khí.</p>
                  
                  <p>Em làm đơn này kính đề nghị Ban Giám hiệu và các phòng ban chức năng xem xét giải quyết cho em được hưởng chính sách <span className="font-bold text-blue-700">miễn giảm 70% học phí</span> trong suốt khóa học.</p>
                  
                  <p>Em xin cam kết chấp hành nghiêm chỉnh mọi nội quy, quy chế của nhà trường và hoàn thành đầy đủ nghĩa vụ học tập.</p>
                  <p className="italic text-xs text-slate-500">Xin trân trọng cảm ơn!</p>
                </div>

                <div className="pt-8 flex justify-between">
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">Ý KIẾN CỦA GVCN</div>
                    <div className="h-16"></div>
                    <div className="font-bold text-slate-800">{unitInfo?.advisorName || 'Trần Văn Mạnh'}</div>
                  </div>
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">NGƯỜI LÀM ĐƠN</div>
                    <div className="text-[11px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
                    <div className="h-16 font-bold text-slate-800 mt-2">{targetStudent.fullName}</div>
                  </div>
                </div>
              </div>
            )}

            {selectedForm === 'bao-luu' && (
              <div className="space-y-6 text-sm leading-relaxed">
                <div className="text-center space-y-1">
                  <div className="text-xs font-bold uppercase text-blue-700 tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                  <div className="text-xs font-bold text-slate-800">Độc lập - Tự do - Hạnh phúc</div>
                  <h3 className="text-base font-bold uppercase text-slate-900 mt-4">ĐƠN XIN BẢO LƯU KẾT QUẢ HỌC TẬP</h3>
                  <div className="text-xs text-slate-500 italic">(Dành cho HSSV tạm dừng học tập vì lý do cá nhân hoặc thực hiện nghĩa vụ quân sự)</div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="font-semibold text-slate-800">Kính gửi: Ban Giám hiệu & Phòng Đào tạo Nhà trường</p>
                  
                  <div className="space-y-1.5 text-xs">
                    <div>Em tên là: <span className="font-bold text-slate-800">{targetStudent.fullName}</span> (Mã SV: {targetStudent.id})</div>
                    <div>Lớp: {currentClass} | Khoa: Công nghệ Ô tô</div>
                    <div>Số điện thoại liên hệ: {targetStudent.phone}</div>
                  </div>

                  <p>Vì lý do cá nhân / gia đình / thực hiện nghĩa vụ quân sự, em làm đơn này kính đề nghị Ban Giám hiệu và Phòng Đào tạo cho phép em được bảo lưu kết quả học tập trong thời gian từ tháng <span className="font-bold">10/2025</span> đến hết tháng <span className="font-bold">10/2026</span>.</p>
                  
                  <p>Sau thời gian trên, em xin cam kết sẽ trở lại trường tiếp tục đăng ký học tập theo đúng quy chế đào tạo.</p>
                  <p className="italic text-xs text-slate-500">Kính mong Ban Giám hiệu xem xét chấp thuận.</p>
                </div>

                <div className="pt-8 flex justify-between">
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">Ý KIẾN CỦA GVCN</div>
                    <div className="h-16"></div>
                    <div className="font-bold text-slate-800">{unitInfo?.advisorName || 'Trần Văn Mạnh'}</div>
                  </div>
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">NGƯỜI LÀM ĐƠN</div>
                    <div className="text-[11px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
                    <div className="h-16 font-bold text-slate-800 mt-2">{targetStudent.fullName}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ZALO TEMPLATES TAB */}
      {activeTab === 'zalo-templates' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Mẫu Tin Nhắn Tương Tác Zalo / SMS Gửi Phụ Huynh & HSSV</h3>
              <p className="text-xs text-slate-500 mt-0.5">Sao chép nhanh các thông báo nhắc nhở học phí, điểm danh chuyên cần và điểm rèn luyện.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Chọn HSSV:</span>
              <select
                value={targetStudent.id}
                onChange={(e) => setTargetStudentId(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
              >
                {classStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.id} - {s.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: '1. Nhắc Nhở Học Phí & Chính Sách Miễn Giảm NĐ 238',
                content: `[THÔNG BÁO HỌC PHÍ - LỚP ${currentClass}]\n\nKính gửi Phụ huynh em: ${targetStudent.fullName} (MSSV: ${targetStudent.id})\n\nKhoa Công nghệ Ô tô xin thông báo học phí học kỳ hiện tại sau khi được nhà nước hỗ trợ miễn giảm 70% (Nghị định 238/2025/NĐ-CP):\n- Tổng học phí: 4.500.000 đ\n- Nhà nước cấp bù (70%): 3.150.000 đ\n- Số tiền thực đóng: 1.350.000 đ\n\nĐề nghị gia đình hoàn thành học phí trước ngày 30 hằng tháng qua tài khoản Khoa hoặc phòng Tài chính. Trân trọng!`
              },
              {
                title: '2. Cảnh Báo Chuyên Cần & Nguy Cơ Cấm Thi',
                content: `[CẢNH BÁO CHUYÊN CẦN - LỚP ${currentClass}]\n\nKính gửi Phụ huynh em: ${targetStudent.fullName} (MSSV: ${targetStudent.id})\n\nGVCN thông báo: Em ${targetStudent.fullName} hiện đã vắng 5 buổi (22.5%) tại các mô đun thực hành xưởng. Theo Thông tư 04/2022/TT-BLĐTBXH, nghỉ quá 20% sẽ bị CẤM THI kết thúc mô đun.\n\nKính mong gia đình phối hợp đôn đốc em đi học đầy đủ và đúng giờ. Trân trọng!`
              },
              {
                title: '3. Thông Báo Điểm Đánh Giá Rèn Luyện (BM01)',
                content: `[KẾT QUẢ RÈN LUYỆN - LỚP ${currentClass}]\n\nThân gửi em: ${targetStudent.fullName} (MSSV: ${targetStudent.id})\n\nKết quả đánh giá rèn luyện học kỳ của em:\n- Ý thức học tập: 19/20đ\n- Chấp hành nội quy: 24/25đ\n- Hoạt động chính trị XH: 19/20đ\n- Quan hệ cộng đồng: 24/25đ\n- Cán sự lớp/thành tích: 9/10đ\n- TỔNG ĐIỂM: 95/100đ (Xếp loại: XUẤT SẮC).\n\nChúc mừng em đã duy trì tốt phong trào thi đua của lớp!`
              },
              {
                title: '4. Thư Mời Họp Phụ Huynh Học Sinh Định Kỳ',
                content: `[THƯ MỜI HỌP PHỤ HUYNH HSSV - LỚP ${currentClass}]\n\nKính gửi Quý Phụ huynh học sinh,\n\nKhoa Công nghệ Ô tô & GVCN ${unitInfo?.advisorName || 'Trần Văn Mạnh'} trân trọng kính mời Quý Phụ huynh đến tham dự buổi họp phụ huynh định kỳ cuối học kỳ để tổng kết kết quả học tập, rèn luyện tay nghề và xét học bổng khuyến khích học nghề.\n- Thời gian: 08h00 Chủ Nhật ngày tới.\n- Địa điểm: Phòng học lý thuyết xưởng ô tô.\nSự hiện diện của Quý phụ huynh là niềm vinh hạnh cho lớp.\nTrân trọng cảm ơn!`
              }
            ].map((tmpl, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{tmpl.title}</h4>
                  <pre className="text-[11px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200 mt-2 whitespace-pre-wrap font-sans leading-relaxed">
                    {tmpl.content}
                  </pre>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleCopyText(tmpl.content)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5" /> Sao Chép Tin Nhắn
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSV EXPORTS TAB - OFFLINE RECORD KEEPING */}
      {activeTab === 'csv-exports' && (() => {
        const targetStudents = csvScope === 'current' ? classStudents : students;
        const filteredStudents = targetStudents.filter(s => {
          if (!csvSearchTerm.trim()) return true;
          const term = csvSearchTerm.toLowerCase();
          return (
            s.fullName?.toLowerCase().includes(term) ||
            s.id?.toLowerCase().includes(term) ||
            s.idCard?.toLowerCase().includes(term) ||
            s.phone?.toLowerCase().includes(term)
          );
        });

        const targetModules = modules.length > 0 ? modules : [
          { id: 'MĐ01', name: 'Công nghệ Khung gầm Ô tô', credits: 4, totalHours: 60, theoryHours: 20, practiceHours: 40, semester: 1 },
          { id: 'MĐ02', name: 'Động cơ đốt trong và Hệ thống EFI', credits: 4, totalHours: 60, theoryHours: 20, practiceHours: 40, semester: 1 },
          { id: 'MĐ03', name: 'Hệ thống Điện - Điện tử Ô tô', credits: 3, totalHours: 45, theoryHours: 15, practiceHours: 30, semester: 1 }
        ];

        return (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-emerald-800/40 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
              
              <div className="relative z-10 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Chuẩn UTF-8 BOM RFC 4180
                  </span>
                  <span className="text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-700/60">
                    Mở Trực Tiếp Trên Microsoft Excel & Google Sheets
                  </span>
                  <span className="text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-700/60">
                    Lưu Trữ Ngoại Tuyến (Offline Record Keeping)
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                      <Download className="w-5 h-5 text-emerald-400" /> HỆ THỐNG XUẤT DỮ LIỆU & BÁO CÁO HỌC VỤ NGOẠI TUYẾN
                    </h3>
                    <p className="text-xs text-emerald-100/80 max-w-2xl mt-1 leading-relaxed">
                      Trích xuất toàn bộ hồ sơ 23 trường trích ngang, bảng điểm kiểm tra thường xuyên / định kỳ / thi kết thúc, tỷ lệ chuyên cần cảnh báo cấm thi theo Thông tư 04/2022/TT-BLĐTBXH và điểm rèn luyện 100 điểm theo Thông tư 17/2017/TT-BLĐTBXH.
                    </p>
                  </div>

                  {/* Scope filter */}
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-emerald-700/50 flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-emerald-200 px-1">Phạm vi xuất:</span>
                    <button
                      onClick={() => setCsvScope('current')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        csvScope === 'current'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" /> Lớp {currentClass} ({classStudents.length} SV)
                    </button>
                    <button
                      onClick={() => setCsvScope('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        csvScope === 'all'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" /> Toàn Trường ({students.length} SV)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Main CSV Export Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Danh sách HSSV */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      23 Trường Dữ Liệu Chuẩn GDNN
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1.5">
                      1. Danh Sách Trích Ngang HSSV
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Bao gồm mã SV, họ tên, CCCD, ngày sinh, hộ khẩu thường trú, điện thoại bố/mẹ, tổ xưởng thực hành, vị trí cầu nâng, chức vụ và diện miễn giảm 70% học phí theo Nghị định 238/2025/NĐ-CP.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Số lượng sinh viên xuất:</span>
                      <strong className="text-slate-800">{targetStudents.length} HSSV</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Định dạng mã hóa:</span>
                      <span className="font-mono text-emerald-700 font-bold">UTF-8 BOM (.csv)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={handleExportStudentList}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/20"
                  >
                    <Download className="w-4 h-4" /> Tải Tệp CSV Danh Sách Sinh Viên
                  </button>
                  <button
                    onClick={() => setCsvPreviewType('students')}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      csvPreviewType === 'students' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" /> Xem trước bảng dữ liệu trích ngang
                  </button>
                </div>
              </div>

              {/* Card 2: Báo cáo học vụ & Bảng điểm chi tiết */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Thông Tư 04/2022/TT-BLĐTBXH
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1.5">
                      2. Báo Cáo Học Vụ & Bảng Điểm
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Chi tiết từng mô đun: Điểm thường xuyên (hệ số 1), điểm định kỳ (hệ số 2), điểm thi kết thúc (hệ số 3), quy đổi hệ 10 sang hệ 4, điểm chữ A/B/C/D/F, số tiết vắng và phát hiện cấm thi (&gt;20%).
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Mô đun đào tạo:</span>
                      <strong className="text-slate-800">{targetModules.length} mô đun tích hợp</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Quy chế đánh giá:</span>
                      <span className="text-blue-700 font-bold">Thang 10 & Thang 4 & Điểm chữ</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={handleExportAcademicReport}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-600/20"
                  >
                    <Download className="w-4 h-4" /> Tải Tệp CSV Báo Cáo Học Vụ & Điểm
                  </button>
                  <button
                    onClick={() => setCsvPreviewType('academic')}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      csvPreviewType === 'academic' ? 'bg-blue-50 text-blue-800 border border-blue-300 font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" /> Xem trước bảng điểm chi tiết mô đun
                  </button>
                </div>
              </div>

              {/* Card 3: Báo cáo tổng hợp toàn diện */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Đa Phân Hệ & Học Bổng KKHN
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1.5">
                      3. Báo Cáo Tổng Hợp Ngoại Tuyến
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Bảng tổng hợp toàn diện: GPA tích lũy, xếp loại học lực, điểm rèn luyện BM01 (thang 100đ Thông tư 17/2017), tình trạng nợ mô đun, học lại và xét duyệt học bổng khuyến khích học nghề.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Tiêu chuẩn xét học bổng:</span>
                      <strong className="text-slate-800">GPA ≥ 2.50 & ĐRL ≥ 65đ</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Mục đích sử dụng:</span>
                      <span className="text-purple-700 font-bold">Báo cáo Ban Giám Hiệu & Lưu trữ</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={handleExportComprehensive}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-purple-600/20"
                  >
                    <Download className="w-4 h-4" /> Tải Tệp CSV Báo Cáo Tổng Hợp
                  </button>
                  <button
                    onClick={() => setCsvPreviewType('comprehensive')}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      csvPreviewType === 'comprehensive' ? 'bg-purple-50 text-purple-800 border border-purple-300 font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" /> Xem trước bảng tổng hợp đa phân hệ
                  </button>
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Table Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
              {/* Preview Header & Controls */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-slate-500" /> Bảng xem trước dữ liệu:
                  </span>
                  <button
                    onClick={() => setCsvPreviewType('students')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      csvPreviewType === 'students'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border hover:bg-slate-100'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Danh Sách HSSV ({filteredStudents.length})
                  </button>
                  <button
                    onClick={() => setCsvPreviewType('academic')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      csvPreviewType === 'academic'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border hover:bg-slate-100'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" /> Báo Cáo Học Vụ & Điểm
                  </button>
                  <button
                    onClick={() => setCsvPreviewType('comprehensive')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      csvPreviewType === 'comprehensive'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Báo Cáo Tổng Hợp
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={csvSearchTerm}
                      onChange={(e) => setCsvSearchTerm(e.target.value)}
                      placeholder="Tìm theo MSSV, Họ tên, SĐT..."
                      className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-64"
                    />
                    {csvSearchTerm && (
                      <button
                        onClick={() => setCsvSearchTerm('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (csvPreviewType === 'students') handleExportStudentList();
                      else if (csvPreviewType === 'academic') handleExportAcademicReport();
                      else handleExportComprehensive();
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                    title="Xuất file CSV đúng loại đang xem trước"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" /> Tải CSV Bảng Này
                  </button>
                </div>
              </div>

              {/* Table Body Container */}
              <div className="overflow-x-auto max-h-[460px] relative">
                {/* 1. Preview Table: Students List */}
                {csvPreviewType === 'students' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">STT</th>
                        <th className="py-2.5 px-3">Mã SV</th>
                        <th className="py-2.5 px-3">Họ và Tên</th>
                        <th className="py-2.5 px-3">Giới Tính</th>
                        <th className="py-2.5 px-3">Ngày Sinh</th>
                        <th className="py-2.5 px-3">Số Điện Thoại</th>
                        <th className="py-2.5 px-3">Tổ Xưởng</th>
                        <th className="py-2.5 px-3">Vị Trí Thực Hành</th>
                        <th className="py-2.5 px-3">Chức Vụ Lớp</th>
                        <th className="py-2.5 px-3">Chính Sách 70% (NĐ 238)</th>
                        <th className="py-2.5 px-3">Hộ Khẩu Thường Trú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-8 text-center text-slate-500 italic">
                            Không tìm thấy sinh viên nào khớp với điều kiện tìm kiếm.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((s, idx) => (
                          <tr key={s.id || idx} className="hover:bg-emerald-50/40 transition">
                            <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.id}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{s.fullName}</td>
                            <td className="py-2.5 px-3 text-slate-600">{s.gender || 'Nam'}</td>
                            <td className="py-2.5 px-3 text-slate-600">{s.birthDate || s.dob || '-'}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-700">{s.phone || '-'}</td>
                            <td className="py-2.5 px-3">
                              <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 rounded text-[11px]">
                                Tổ {s.workshopGroup || 1}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 text-[11px]">{s.station || 'Cầu nâng 2 trụ'}</td>
                            <td className="py-2.5 px-3">
                              <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[11px]">
                                {s.role || 'HSSV'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              {s.policy?.includes('238') || s.policy?.includes('70%') ? (
                                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px] border border-emerald-300">
                                  Giảm 70% NĐ 238
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">-</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{s.permanentAddress || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 2. Preview Table: Academic Report & Grades */}
                {csvPreviewType === 'academic' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">STT</th>
                        <th className="py-2.5 px-3">Mã SV</th>
                        <th className="py-2.5 px-3">Họ và Tên</th>
                        <th className="py-2.5 px-3">Mã Mô Đun</th>
                        <th className="py-2.5 px-3">Tên Mô Đun</th>
                        <th className="py-2.5 px-3 text-center">TX1</th>
                        <th className="py-2.5 px-3 text-center">TX2</th>
                        <th className="py-2.5 px-3 text-center">Định Kỳ</th>
                        <th className="py-2.5 px-3 text-center">Thi KT</th>
                        <th className="py-2.5 px-3 text-center">Hệ 10</th>
                        <th className="py-2.5 px-3 text-center">Hệ 4</th>
                        <th className="py-2.5 px-3 text-center">Chữ</th>
                        <th className="py-2.5 px-3 text-center">Vắng (Buổi)</th>
                        <th className="py-2.5 px-3">Tình Trạng Thi (TT 04/2022)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={14} className="py-8 text-center text-slate-500 italic">
                            Không tìm thấy dữ liệu học vụ phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.slice(0, 15).flatMap((s, sIdx) => {
                          const studentAbsences = attendance.filter(
                            a => String(a.studentId).trim() === String(s.id).trim() && (a.status === 'A' || a.status === 'L')
                          ).length;

                          return targetModules.map((m, mIdx) => {
                            const g = grades.find(gr => String(gr.studentId).trim() === String(s.id).trim() && gr.moduleId === m.id);
                            const calc = calculateModuleGrade(g);
                            const moduleSessions = Math.ceil(m.totalHours / 4) || 15;
                            const moduleAbs = Math.min(studentAbsences, moduleSessions);
                            const absenceRate = Number(((moduleAbs / moduleSessions) * 100).toFixed(1));
                            const isBanned = absenceRate > 20.0;

                            return (
                              <tr key={`${s.id}-${m.id}`} className="hover:bg-blue-50/40 transition">
                                <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">{sIdx * targetModules.length + mIdx + 1}</td>
                                <td className="py-2 px-3 font-mono font-bold text-slate-900">{s.id}</td>
                                <td className="py-2 px-3 font-semibold text-slate-900">{s.fullName}</td>
                                <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">{m.id}</td>
                                <td className="py-2 px-3 text-slate-800 max-w-xs truncate">{m.name}</td>
                                <td className="py-2 px-3 text-center font-mono">{calc.reg1 || '-'}</td>
                                <td className="py-2 px-3 text-center font-mono">{calc.reg2 || '-'}</td>
                                <td className="py-2 px-3 text-center font-mono">{calc.mid || '-'}</td>
                                <td className="py-2 px-3 text-center font-mono font-bold text-blue-900">{calc.exam || '-'}</td>
                                <td className="py-2 px-3 text-center font-bold text-slate-900">{calc.grade10}</td>
                                <td className="py-2 px-3 text-center font-bold text-emerald-700">{calc.grade4}</td>
                                <td className="py-2 px-3 text-center font-black">
                                  <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                                    calc.letter === 'A' ? 'bg-emerald-100 text-emerald-800' :
                                    calc.letter.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                                    calc.letter.startsWith('C') ? 'bg-amber-100 text-amber-800' :
                                    calc.letter.startsWith('D') ? 'bg-orange-100 text-orange-800' :
                                    'bg-rose-100 text-rose-800'
                                  }`}>
                                    {calc.letter}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-center font-mono">
                                  <span className={moduleAbs > 3 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                                    {moduleAbs} ({absenceRate}%)
                                  </span>
                                </td>
                                <td className="py-2 px-3">
                                  {isBanned ? (
                                    <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px] border border-rose-300">
                                      CẤM THI (&gt;20%)
                                    </span>
                                  ) : (
                                    <span className="bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                                      Đủ điều kiện dự thi
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          });
                        })
                      )}
                    </tbody>
                  </table>
                )}

                {/* 3. Preview Table: Comprehensive Summary */}
                {csvPreviewType === 'comprehensive' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">STT</th>
                        <th className="py-2.5 px-3">Mã SV</th>
                        <th className="py-2.5 px-3">Họ và Tên</th>
                        <th className="py-2.5 px-3 text-center">GPA Hệ 10</th>
                        <th className="py-2.5 px-3 text-center">GPA Hệ 4</th>
                        <th className="py-2.5 px-3">Xếp Loại Học Lực</th>
                        <th className="py-2.5 px-3 text-center">Điểm Rèn Luyện (ĐRL)</th>
                        <th className="py-2.5 px-3">Xếp Loại Rèn Luyện</th>
                        <th className="py-2.5 px-3 text-center">Tổng Vắng</th>
                        <th className="py-2.5 px-3">Nguy Cơ Cấm Thi</th>
                        <th className="py-2.5 px-3">Xét Học Bổng KKHN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-8 text-center text-slate-500 italic">
                            Không tìm thấy dữ liệu tổng hợp phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((s, idx) => {
                          const studentGrades = targetModules.map(m => {
                            const g = grades.find(gr => String(gr.studentId).trim() === String(s.id).trim() && gr.moduleId === m.id);
                            return { module: m, calc: calculateModuleGrade(g) };
                          });

                          const evaluated = studentGrades.filter(sg => sg.calc.status !== 'Chưa có điểm');
                          const totalCredits = evaluated.reduce((acc, curr) => acc + (curr.module.credits || 3), 0);
                          const sum10 = evaluated.reduce((acc, curr) => acc + (curr.calc.grade10 * (curr.module.credits || 3)), 0);
                          const sum4 = evaluated.reduce((acc, curr) => acc + (curr.calc.grade4 * (curr.module.credits || 3)), 0);

                          const gpa10 = totalCredits > 0 ? Number((sum10 / totalCredits).toFixed(2)) : 0;
                          const gpa4 = totalCredits > 0 ? Number((sum4 / totalCredits).toFixed(2)) : 0;

                          let rank = 'Chưa xếp loại';
                          if (gpa4 >= 3.60) rank = 'Xuất sắc';
                          else if (gpa4 >= 3.20) rank = 'Giỏi';
                          else if (gpa4 >= 2.50) rank = 'Khá';
                          else if (gpa4 >= 2.00) rank = 'Trung bình';
                          else if (gpa4 >= 1.00) rank = 'Yếu';
                          else rank = 'Kém';

                          const rl = renLuyen.find(r => String(r.studentId).trim() === String(s.id).trim());
                          const rlScore = rl?.totalScore ?? 85;
                          let rlRank = 'Tốt';
                          if (rlScore >= 90) rlRank = 'Xuất sắc';
                          else if (rlScore >= 80) rlRank = 'Tốt';
                          else if (rlScore >= 65) rlRank = 'Khá';
                          else if (rlScore >= 50) rlRank = 'Trung bình';
                          else rlRank = 'Yếu';

                          const studentAbsences = attendance.filter(
                            a => String(a.studentId).trim() === String(s.id).trim() && (a.status === 'A' || a.status === 'L')
                          ).length;
                          const absenceRate = Number(((studentAbsences / 45) * 100).toFixed(1));
                          const isBanRisk = absenceRate > 20.0;

                          const backlogCount = studentGrades.filter(sg => sg.calc.grade10 < 5.0 && sg.calc.status !== 'Chưa có điểm').length;
                          let scholarship = 'Không đủ ĐK';
                          if (backlogCount === 0) {
                            if (gpa4 >= 3.60 && rlScore >= 90) scholarship = 'Học Bổng Xuất Sắc';
                            else if (gpa4 >= 3.20 && rlScore >= 80) scholarship = 'Học Bổng Giỏi';
                            else if (gpa4 >= 2.50 && rlScore >= 65) scholarship = 'Học Bổng Khá';
                          }

                          return (
                            <tr key={s.id || idx} className="hover:bg-purple-50/40 transition">
                              <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.id}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">{s.fullName}</td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-800">{gpa10}</td>
                              <td className="py-2.5 px-3 text-center font-bold text-purple-700">{gpa4}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  rank === 'Xuất sắc' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                                  rank === 'Giỏi' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                  rank === 'Khá' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {rank}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-800">{rlScore}/100</td>
                              <td className="py-2.5 px-3">
                                <span className="bg-teal-50 text-teal-800 font-semibold px-2 py-0.5 rounded text-[11px] border border-teal-200">
                                  {rlRank}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono text-slate-700">{studentAbsences} buổi</td>
                              <td className="py-2.5 px-3">
                                {isBanRisk ? (
                                  <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px] border border-rose-300">
                                    CẢNH BÁO CẤM THI ({absenceRate}%)
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 text-[11px] font-semibold">Bình thường</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                {scholarship.startsWith('Học Bổng') ? (
                                  <span className="bg-amber-100 text-amber-900 font-black px-2 py-0.5 rounded text-[11px] border border-amber-300 flex items-center gap-1 w-fit">
                                    <Sparkles className="w-3 h-3 text-amber-600" /> {scholarship}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Table Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                <div>
                  Hiển thị <span className="font-bold text-slate-800">{filteredStudents.length}</span> / {targetStudents.length} HSSV ({csvScope === 'current' ? `Lớp ${currentClass}` : 'Toàn trường'})
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dữ liệu tuân thủ quy chuẩn GDNN và sẵn sàng xuất CSV lưu trữ ngoại tuyến.</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};