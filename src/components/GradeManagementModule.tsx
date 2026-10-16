import React, { useState } from 'react';
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  Download, 
  Edit, 
  Check, 
  Calculator,
  Search,
  Filter,
  Trash2,
  Plus,
  Printer
} from 'lucide-react';
import { Student, SubjectModule, StudentGrade, ClassId, ThemeSettings } from '../types';

interface GradeManagementModuleProps {
  students: Student[];
  currentClass: ClassId;
  modules: SubjectModule[];
  grades: StudentGrade[];
  onUpdateGrade: (grade: StudentGrade) => void;
  onDeleteGrade?: (studentId: string, moduleId: string) => void;
  onClearModuleGrades?: (moduleId: string) => void;
  onClearClassGrades?: () => void;
  themeSettings?: ThemeSettings;
}

export const GradeManagementModule: React.FC<GradeManagementModuleProps> = ({
  students,
  currentClass,
  modules,
  grades,
  onUpdateGrade,
  onDeleteGrade,
  onClearModuleGrades,
  onClearClassGrades,
  themeSettings
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('MĐ06');
  const [editingGrade, setEditingGrade] = useState<StudentGrade | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // In-app confirmation dialog
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

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const classStudents = students.filter(s => s.classId === currentClass);
  const currentModule = modules.find(m => m.id === selectedModuleId) || modules[0];

  // Helper to calculate score conversions
  const calculateFinalGrade10 = (reg1: number, reg2: number, mid: number, exam: number) => {
    // Standard GDNN: Regular (HS 1 each), Midterm (HS 2), Final Exam (HS 3)
    const totalWeight = 1 + 1 + 2 + 3; // = 7
    const final10 = (reg1 * 1 + reg2 * 1 + mid * 2 + exam * 3) / totalWeight;
    return Number(final10.toFixed(1));
  };

  const convertTo4AndLetter = (score10: number): { score4: number; letter: 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F' } => {
    if (score10 >= 8.5) return { score4: 4.0, letter: 'A' };
    if (score10 >= 8.0) return { score4: 3.5, letter: 'B+' };
    if (score10 >= 7.0) return { score4: 3.0, letter: 'B' };
    if (score10 >= 6.5) return { score4: 2.5, letter: 'C+' };
    if (score10 >= 5.5) return { score4: 2.0, letter: 'C' };
    if (score10 >= 5.0) return { score4: 1.5, letter: 'D+' };
    if (score10 >= 4.0) return { score4: 1.0, letter: 'D' };
    return { score4: 0.0, letter: 'F' };
  };

  // Find actual grade for student without synthesizing fake scores
  const findStudentGrade = (studentId: string, moduleId: string): StudentGrade | null => {
    return grades.find(g => String(g.studentId).trim() === String(studentId).trim() && g.moduleId === moduleId) || null;
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;
    const final10 = calculateFinalGrade10(
      editingGrade.regularScore1,
      editingGrade.regularScore2,
      editingGrade.midtermScore,
      editingGrade.finalExamScore
    );
    const { score4, letter } = convertTo4AndLetter(final10);
    const updated: StudentGrade = {
      ...editingGrade,
      finalGrade10: final10,
      finalGrade4: score4,
      letterGrade: letter,
      isPassed: final10 >= 4.0,
      retakeCount: final10 < 4.0 ? (editingGrade.retakeCount || 0) + 1 : 0
    };
    onUpdateGrade(updated);
    showToast(`✅ Đã lưu điểm số của SV ${editingGrade.studentId} thành công!`);
    setEditingGrade(null);
  };

  // Stats for current module based on actual recorded grades
  const recordedGradesList = classStudents
    .map(s => findStudentGrade(s.id, selectedModuleId))
    .filter((g): g is StudentGrade => g !== null);
  
  const passedCount = recordedGradesList.filter(g => g.isPassed).length;
  const failedCount = recordedGradesList.filter(g => !g.isPassed).length;
  const passRate = recordedGradesList.length > 0 
    ? ((passedCount / recordedGradesList.length) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-4 relative">
      {toastMsg && (
        <div className="sticky top-2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center justify-between gap-3 text-xs border border-slate-700 animate-in fade-in">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Title & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            QUẢN LÝ KẾT QUẢ HỌC TẬP CHUẨN THÔNG TƯ 04/2022/TT-BLĐTBXH
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-1">
            BẢNG ĐIỂM CHI TIẾT • LỚP {currentClass}
          </h2>
          <p className="text-xs text-slate-500">
            Hệ số điểm: Thường xuyên (HS 1) + Thường xuyên 2 (HS 1) + Định kỳ (HS 2) + Thi hết mô đun (HS 3)
          </p>
        </div>

        {/* Module & Semester Selection + Clear Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Semester Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 text-xs">
            <span className="font-semibold text-slate-700">Học kỳ:</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="bg-white border border-slate-300 font-bold rounded px-2 py-0.5 text-slate-800 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6].map(k => (
                <option key={k} value={k}>Học kỳ {k}</option>
              ))}
            </select>
          </div>

          {/* Module Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 text-xs">
            <span className="font-semibold text-slate-700">Mô đun:</span>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="bg-white border border-slate-300 font-bold rounded px-2 py-0.5 text-slate-800 focus:outline-none max-w-[200px] truncate"
            >
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
              ))}
            </select>
          </div>

          {/* Nút Xóa Điểm Mô Đun Này */}
          {onClearModuleGrades && (
            <button
              type="button"
              onClick={() => {
                setConfirmDialog({
                  isOpen: true,
                  title: `XÓA BẢNG ĐIỂM MÔ ĐUN ${selectedModuleId}`,
                  message: `Thầy/Cô có chắc chắn muốn xóa sạch toàn bộ điểm số của mô đun ${selectedModuleId} - ${currentModule.name} của lớp ${currentClass}? Thao tác này sẽ xóa điểm của tất cả sinh viên trong môn này để nhập lại từ đầu.`,
                  confirmText: `Xóa sạch điểm môn ${selectedModuleId}`,
                  onConfirm: () => {
                    onClearModuleGrades(selectedModuleId);
                    showToast(`🗑️ Đã xóa sạch toàn bộ điểm mô đun ${selectedModuleId} của lớp.`);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                  }
                });
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold cursor-pointer transition"
              title="Xóa toàn bộ điểm của mô đun đang chọn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa điểm MĐ này</span>
            </button>
          )}

          {/* Nút Xóa Toàn Bộ Điểm Của Lớp */}
          {onClearClassGrades && (
            <button
              type="button"
              onClick={() => {
                setConfirmDialog({
                  isOpen: true,
                  title: 'XÓA TOÀN BỘ ĐIỂM SỐ CỦA LỚP',
                  message: `⚠️ CẢNH BÁO: Thao tác này sẽ xóa toàn bộ điểm số của tất cả các môn trong 6 học kỳ của lớp ${currentClass}. Thầy/Cô có chắc chắn muốn thực hiện?`,
                  confirmText: 'Xác nhận xóa toàn bộ điểm lớp',
                  onConfirm: () => {
                    onClearClassGrades();
                    showToast(`🗑️ Đã xóa sạch toàn bộ điểm của lớp ${currentClass}.`);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                  }
                });
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-2xs"
              title="Xóa sạch toàn bộ điểm các môn của lớp"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ điểm lớp</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards for Module */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Khối lượng mô đun:</span>
          <p className="text-base font-bold text-blue-700 mt-0.5">
            {currentModule.totalHours} tiết <span className="text-xs text-slate-500 font-normal">({currentModule.credits} Tín chỉ)</span>
          </p>
          <span className="text-[10px] text-slate-400">LT: {currentModule.theoryHours}t | TH: {currentModule.practiceHours}t{currentModule.examHours ? ` | KT: ${currentModule.examHours}t` : ''}</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Tỷ lệ đạt mô đun:</span>
          <p className="text-base font-bold text-emerald-600 mt-0.5">{passRate}%</p>
          <span className="text-[10px] text-emerald-600">{passedCount}/{classStudents.length} SV đạt</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Nợ môn / Thi lại:</span>
          <p className="text-base font-bold text-rose-600 mt-0.5">{failedCount} SV</p>
          <span className="text-[10px] text-rose-500 font-medium">Cần xếp lịch phụ đạo xưởng</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Đã nhập điểm:</span>
          <p className="text-base font-bold text-purple-700 mt-0.5">
            {recordedGradesList.length} / {classStudents.length} SV
          </p>
          <span className="text-[10px] text-purple-600">
            {classStudents.length - recordedGradesList.length > 0 ? `Còn ${classStudents.length - recordedGradesList.length} SV chưa nhập` : 'Đã nhập đủ 100%'}
          </span>
        </div>
      </div>

      {/* Main Grade Table */}
      <div 
        style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
        className="rounded-xl border border-slate-200 shadow-xs overflow-hidden"
      >
        <div className="overflow-x-auto max-h-[580px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead 
              style={{ backgroundColor: themeSettings?.tableHeaderBg || '#004e92' }}
              className="text-white uppercase font-bold sticky top-0 z-10 text-[11px]"
            >
              <tr>
                <th className="py-2.5 px-2 text-center w-10 border-r border-blue-800">STT</th>
                <th className="py-2.5 px-3 border-r border-blue-800 min-w-[90px]">MSSV</th>
                <th className="py-2.5 px-3 border-r border-blue-800 min-w-[150px]">Họ và tên</th>
                <th className="py-2.5 px-2 text-center border-r border-blue-800 w-16">Tổ xưởng</th>
                <th className="py-2.5 px-2 text-center border-r border-blue-800 w-20">TX 1 (HS 1)</th>
                <th className="py-2.5 px-2 text-center border-r border-blue-800 w-20">TX 2 (HS 1)</th>
                <th className="py-2.5 px-2 text-center border-r border-blue-800 w-20">Định kỳ (HS 2)</th>
                <th className="py-2.5 px-2 text-center border-r border-blue-800 w-20">Thi MĐ (HS 3)</th>
                <th className="py-2.5 px-2 text-center border-r border-blue-800 w-20 bg-blue-900">Điểm 10</th>
                <th className="py-2.5 px-2 text-center border-r border-blue-800 w-20 bg-blue-900">Thang 4</th>
                <th className="py-2.5 px-2 text-center border-r border-blue-800 w-20 bg-blue-900">Điểm chữ</th>
                <th className="py-2.5 px-3 border-r border-blue-800 text-center min-w-[100px]">Xếp loại</th>
                <th className="py-2.5 px-2 text-center w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {classStudents.map((s, idx) => {
                const g = findStudentGrade(s.id, selectedModuleId);
                const hasGrade = g !== null;
                const isFail = hasGrade && !g.isPassed;

                return (
                  <tr 
                    key={`${s.id}-${idx}`} 
                    className={`hover:bg-blue-50/50 transition ${isFail ? 'bg-rose-50/40' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                  >
                    <td className="py-2 px-2 text-center font-semibold text-slate-500 border-r border-slate-200">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-blue-700 border-r border-slate-200">{s.id}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200">{s.fullName}</td>
                    <td className="py-2 px-2 text-center text-slate-700 font-bold border-r border-slate-200">Tổ {s.workshopGroup}</td>
                    
                    {/* Các cột điểm số (Hiện — nếu chưa có điểm hoặc đã bị xóa) */}
                    <td className="py-2 px-2 text-center font-mono border-r border-slate-200 text-slate-700">
                      {hasGrade ? g.regularScore1 : <span className="text-slate-300 font-bold">—</span>}
                    </td>
                    <td className="py-2 px-2 text-center font-mono border-r border-slate-200 text-slate-700">
                      {hasGrade ? g.regularScore2 : <span className="text-slate-300 font-bold">—</span>}
                    </td>
                    <td className="py-2 px-2 text-center font-mono border-r border-slate-200 text-slate-700">
                      {hasGrade ? g.midtermScore : <span className="text-slate-300 font-bold">—</span>}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-200 text-slate-800">
                      {hasGrade ? g.finalExamScore : <span className="text-slate-300 font-bold">—</span>}
                    </td>
                    
                    {/* Thang 10 */}
                    <td className="py-2 px-2 text-center font-mono font-bold text-blue-900 bg-blue-50/50 border-r border-slate-200">
                      {hasGrade ? g.finalGrade10 : <span className="text-slate-300 font-bold">—</span>}
                    </td>

                    {/* Thang 4 */}
                    <td className="py-2 px-2 text-center font-mono font-bold text-slate-800 bg-blue-50/50 border-r border-slate-200">
                      {hasGrade ? g.finalGrade4.toFixed(1) : <span className="text-slate-300 font-bold">—</span>}
                    </td>

                    {/* Điểm Chữ */}
                    <td className="py-2 px-2 text-center font-bold bg-blue-50/50 border-r border-slate-200">
                      {hasGrade ? (
                        <span className={`px-2 py-0.5 rounded ${
                          g.letterGrade === 'A' ? 'bg-purple-100 text-purple-800' :
                          g.letterGrade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                          g.letterGrade.startsWith('C') ? 'bg-emerald-100 text-emerald-800' :
                          g.letterGrade.startsWith('D') ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-600 text-white font-black'
                        }`}>
                          {g.letterGrade}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>

                    {/* Xếp Loại */}
                    <td className="py-2 px-3 text-center border-r border-slate-200">
                      {hasGrade ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          g.finalGrade4 >= 3.6 ? 'bg-purple-100 text-purple-800' :
                          g.finalGrade4 >= 3.2 ? 'bg-blue-100 text-blue-800' :
                          g.finalGrade4 >= 2.5 ? 'bg-emerald-100 text-emerald-800' :
                          g.finalGrade4 >= 2.0 ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {g.finalGrade4 >= 3.6 ? 'Xuất sắc' :
                           g.finalGrade4 >= 3.2 ? 'Giỏi' :
                           g.finalGrade4 >= 2.5 ? 'Khá' :
                           g.finalGrade4 >= 2.0 ? 'Trung bình' : 'Yếu / Kém'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                          Chưa có điểm
                        </span>
                      )}
                    </td>

                    {/* Action: Sửa điểm & Xóa điểm */}
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {hasGrade ? (
                          <>
                            <button
                              onClick={() => setEditingGrade(g)}
                              className="p-1 hover:bg-blue-100 text-blue-700 rounded transition cursor-pointer"
                              title="Chỉnh sửa điểm số"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteGrade && (
                              <button
                                onClick={() => {
                                  setConfirmDialog({
                                    isOpen: true,
                                    title: 'XÓA ĐIỂM SINH VIÊN',
                                    message: `Thầy/Cô có chắc chắn muốn xóa điểm mô đun ${selectedModuleId} của sinh viên ${s.fullName} (${s.id})? Toàn bộ điểm TX, ĐK và thi kết thúc môn của sinh viên này sẽ bị xóa khỏi hệ thống.`,
                                    confirmText: 'Xác nhận xóa điểm',
                                    onConfirm: () => {
                                      onDeleteGrade(s.id, selectedModuleId);
                                      showToast(`Đã xóa điểm môn ${selectedModuleId} của SV ${s.fullName}`);
                                      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                                    }
                                  });
                                }}
                                className="p-1 hover:bg-rose-100 text-rose-600 rounded transition cursor-pointer"
                                title="Xóa điểm mô đun này của sinh viên"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingGrade({
                                studentId: s.id,
                                moduleId: selectedModuleId,
                                regularScore1: 8.0,
                                regularScore2: 8.0,
                                midtermScore: 8.0,
                                finalExamScore: 8.0,
                                finalGrade10: 8.0,
                                finalGrade4: 3.5,
                                letterGrade: 'B+',
                                isPassed: true,
                                retakeCount: 0
                              });
                            }}
                            className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded font-bold text-[10px] cursor-pointer flex items-center gap-0.5"
                            title="Nhập điểm mới cho sinh viên"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Nhập điểm</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Grade */}
      {editingGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in">
            <div className="bg-[#004e92] text-white px-6 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase">CẬP NHẬT ĐIỂM SINH VIÊN</h3>
              <button onClick={() => setEditingGrade(null)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 text-xs space-y-3">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 mb-2">
                <p><strong>MSSV:</strong> {editingGrade.studentId}</p>
                <p><strong>Mô đun:</strong> {selectedModuleId} - {currentModule.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Thường xuyên 1 (HS 1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editingGrade.regularScore1}
                    onChange={(e) => setEditingGrade({ ...editingGrade, regularScore1: Number(e.target.value) })}
                    className="w-full p-2 border rounded font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Thường xuyên 2 (HS 1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editingGrade.regularScore2}
                    onChange={(e) => setEditingGrade({ ...editingGrade, regularScore2: Number(e.target.value) })}
                    className="w-full p-2 border rounded font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Định kỳ (HS 2)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editingGrade.midtermScore}
                    onChange={(e) => setEditingGrade({ ...editingGrade, midtermScore: Number(e.target.value) })}
                    className="w-full p-2 border rounded font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Thi hết mô đun (HS 3)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editingGrade.finalExamScore}
                    onChange={(e) => setEditingGrade({ ...editingGrade, finalExamScore: Number(e.target.value) })}
                    className="w-full p-2 border rounded font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded border border-blue-200 text-blue-900 mt-2">
                <p className="font-bold">Điểm tổng kết ước tính:</p>
                <p className="text-base font-bold">
                  {calculateFinalGrade10(
                    editingGrade.regularScore1,
                    editingGrade.regularScore2,
                    editingGrade.midtermScore,
                    editingGrade.finalExamScore
                  )} điểm hệ 10
                </p>
              </div>

              <div className="pt-2 border-t flex items-center justify-between gap-2">
                {onDeleteGrade && findStudentGrade(editingGrade.studentId, selectedModuleId) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onDeleteGrade) {
                        onDeleteGrade(editingGrade.studentId, selectedModuleId);
                        showToast(`🗑️ Đã xóa điểm môn ${selectedModuleId} của SV ${editingGrade.studentId}`);
                        setEditingGrade(null);
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-bold cursor-pointer text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa điểm môn này</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingGrade(null)}
                    className="px-3 py-1.5 bg-slate-200 rounded cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold cursor-pointer"
                  >
                    Lưu Điểm Số
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-app Confirmation Modal */}
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
    </div>
  );
};
