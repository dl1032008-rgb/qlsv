import React, { useState } from 'react';
import { 
  Award, 
  Wallet, 
  Wrench, 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  FileText, 
  Printer, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Download,
  Trash2
} from 'lucide-react';
import { Student, FundTransaction, WorkshopSafetyLog, ClassId, StudentGrade, RenLuyenCriteria, ThemeSettings } from '../types';

interface ReportsAndFundModuleProps {
  students: Student[];
  currentClass: ClassId;
  fundTransactions: FundTransaction[];
  workshopLogs: WorkshopSafetyLog[];
  grades: StudentGrade[];
  renLuyen: RenLuyenCriteria[];
  onAddTransaction: (tx: FundTransaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onClearFundTransactions?: () => void;
  onAddWorkshopLog: (log: WorkshopSafetyLog) => void;
  onDeleteWorkshopLog?: (id: string) => void;
  onClearWorkshopLogs?: () => void;
  themeSettings?: ThemeSettings;
}

export const ReportsAndFundModule: React.FC<ReportsAndFundModuleProps> = ({
  students,
  currentClass,
  fundTransactions,
  workshopLogs,
  grades,
  renLuyen,
  onAddTransaction,
  onDeleteTransaction,
  onClearFundTransactions,
  onAddWorkshopLog,
  onDeleteWorkshopLog,
  onClearWorkshopLogs,
  themeSettings
}) => {
  const [activeTab, setActiveTab] = useState<'scholarship' | 'tuition' | 'fund' | 'workshop'>('scholarship');
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);
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

  // 1. Calculate Scholarships
  const scholarshipList = classStudents.map(s => {
    const rl = renLuyen.find(r => r.studentId === s.id) || { totalScore: 85, rank: 'Tốt' };
    const stGrades = grades.filter(g => g.studentId === s.id);
    const avgScore10 = stGrades.length > 0 ? stGrades.reduce((acc, curr) => acc + curr.finalGrade10, 0) / stGrades.length : 8.2;
    const avgScore4 = stGrades.length > 0 ? stGrades.reduce((acc, curr) => acc + curr.finalGrade4, 0) / stGrades.length : 3.4;
    const hasFail = stGrades.some(g => !g.isPassed);

    let scholarshipType: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Không đạt' = 'Không đạt';
    let awardAmount = 0;

    if (!hasFail) {
      if (avgScore4 >= 3.60 && rl.totalScore >= 90) {
        scholarshipType = 'Xuất sắc';
        awardAmount = 1800000; // 1.800.000 VNĐ / tháng
      } else if (avgScore4 >= 3.20 && rl.totalScore >= 80) {
        scholarshipType = 'Giỏi';
        awardAmount = 1400000; // 1.400.000 VNĐ / tháng
      } else if (avgScore4 >= 2.50 && rl.totalScore >= 65) {
        scholarshipType = 'Khá';
        awardAmount = 1100000; // 1.100.000 VNĐ / tháng
      }
    }

    return {
      student: s,
      avgScore10: Number(avgScore10.toFixed(2)),
      avgScore4: Number(avgScore4.toFixed(2)),
      rlScore: rl.totalScore,
      rlRank: rl.rank,
      hasFail,
      scholarshipType,
      awardAmount
    };
  }).sort((a, b) => b.avgScore4 - a.avgScore4);

  // 2. Fund Balances
  const totalIncome = fundTransactions.filter(t => t.type === 'THU').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = fundTransactions.filter(t => t.type === 'CHI').reduce((acc, t) => acc + t.amount, 0);
  const availableFund = totalIncome - totalExpense;

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            BÁO CÁO THỐNG KÊ & TÀI CHÍNH - NHẬT KÝ XƯỞNG
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-1">
            QUẢN LÝ TỔNG HỢP • {currentClass}
          </h2>
          <p className="text-xs text-slate-500">
            Học bổng KKHN (QĐ 53/2015), Cấp bù học phí NĐ 238/2025/NĐ-CP, Sổ quỹ minh bạch và ATVSLĐ
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab('scholarship')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'scholarship' ? 'bg-[#004e92] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border'
            }`}
          >
            Học bổng KKHN
          </button>
          <button
            onClick={() => setActiveTab('tuition')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'tuition' ? 'bg-[#004e92] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border'
            }`}
          >
            Học phí & NĐ 238
          </button>
          <button
            onClick={() => setActiveTab('fund')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'fund' ? 'bg-[#004e92] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border'
            }`}
          >
            Sổ Quỹ Thu - Chi
          </button>
          <button
            onClick={() => setActiveTab('workshop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'workshop' ? 'bg-[#004e92] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border'
            }`}
          >
            Nhật Ký Xưởng 5S
          </button>
        </div>
      </div>

      {/* 1. HỌC BỔNG KKHN */}
      {activeTab === 'scholarship' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-xs">
              <span className="font-bold text-purple-900 block">Học bổng Xuất sắc:</span>
              <p className="text-xl font-bold text-purple-700 mt-1">
                {scholarshipList.filter(s => s.scholarshipType === 'Xuất sắc').length} SV
              </p>
              <p className="text-[11px] text-purple-600">GPA ≥ 3.60 & ĐRL ≥ 90 (1.800.000đ/tháng)</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-xs">
              <span className="font-bold text-blue-900 block">Học bổng Giỏi:</span>
              <p className="text-xl font-bold text-blue-700 mt-1">
                {scholarshipList.filter(s => s.scholarshipType === 'Giỏi').length} SV
              </p>
              <p className="text-[11px] text-blue-600">GPA ≥ 3.20 & ĐRL ≥ 80 (1.400.000đ/tháng)</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-900 block">Học bổng Khá:</span>
              <p className="text-xl font-bold text-emerald-700 mt-1">
                {scholarshipList.filter(s => s.scholarshipType === 'Khá').length} SV
              </p>
              <p className="text-[11px] text-emerald-600">GPA ≥ 2.50 & ĐRL ≥ 65 (1.100.000đ/tháng)</p>
            </div>
          </div>

          <div 
            style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
            className="rounded-xl border border-slate-200 shadow-xs overflow-hidden"
          >
            <div className="p-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-800 uppercase flex items-center justify-between">
              <span>BẢNG XẾP HẠNG VÀ XÉT DUYỆT HỌC BỔNG KHUYẾN KHÍCH HỌC NGHỀ THEO QUY ĐỊNH</span>
              <span className="text-[11px] text-slate-500 font-normal">Điều kiện: Không có môn thi lại</span>
            </div>
            <div className="overflow-x-auto max-h-[520px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead 
                  style={{ backgroundColor: themeSettings?.tableHeaderBg || '#004e92' }}
                  className="text-white uppercase font-bold text-[11px]"
                >
                  <tr>
                    <th className="py-2.5 px-2 text-center w-10">STT</th>
                    <th className="py-2.5 px-3">MSSV</th>
                    <th className="py-2.5 px-3 min-w-[150px]">Họ và tên</th>
                    <th className="py-2.5 px-2 text-center">Tổ xưởng</th>
                    <th className="py-2.5 px-2 text-center">GPA (Hệ 4)</th>
                    <th className="py-2.5 px-2 text-center">ĐRL (Thang 100)</th>
                    <th className="py-2.5 px-2 text-center">Môn nợ / Thi lại</th>
                    <th className="py-2.5 px-3 text-center min-w-[130px]">Loại Học Bổng</th>
                    <th className="py-2.5 px-3 text-right">Định mức hỗ trợ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {scholarshipList.map((item, idx) => (
                    <tr key={`${item.student.id}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                      <td className="py-2 px-2 text-center font-semibold text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-blue-700">{item.student.id}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{item.student.fullName}</td>
                      <td className="py-2 px-2 text-center font-bold text-slate-700">Tổ {item.student.workshopGroup}</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-blue-900 bg-blue-50/40">
                        {item.avgScore4.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-purple-900 bg-purple-50/40">
                        {item.rlScore}đ ({item.rlRank})
                      </td>
                      <td className="py-2 px-2 text-center">
                        {item.hasFail ? (
                          <span className="text-rose-600 font-bold text-[10px]">Có môn thi lại</span>
                        ) : (
                          <span className="text-emerald-600 font-medium text-[10px]">Không nợ môn</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.scholarshipType === 'Xuất sắc' ? 'bg-purple-100 text-purple-800' :
                          item.scholarshipType === 'Giỏi' ? 'bg-blue-100 text-blue-800' :
                          item.scholarshipType === 'Khá' ? 'bg-emerald-100 text-emerald-800' :
                          'text-slate-400'
                        }`}>
                          {item.scholarshipType !== 'Không đạt' ? `HB ${item.scholarshipType}` : 'Không đạt chỉ tiêu'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                        {item.awardAmount > 0 ? `${item.awardAmount.toLocaleString()} đ/tháng` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. HỌC PHÍ & NGHỊ ĐỊNH 238/2025 */}
      {activeTab === 'tuition' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-sm text-emerald-950 uppercase">
                CHÍNH SÁCH MIỄN GIẢM 70% HỌC PHÍ THEO NGHỊ ĐỊNH 238/2025/NĐ-CP
              </p>
              <p className="mt-1">
                Ngành Công nghệ Kỹ thuật Ô tô là nghề nặng nhọc, độc hại, nguy hiểm được Ngân sách Nhà nước cấp bù <strong>70% học phí</strong>.
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-300 text-xs shrink-0 font-medium">
              <p>Định mức học kỳ: <strong>7.500.000 đ</strong></p>
              <p className="text-emerald-700">Nhà nước cấp bù 70%: <strong>-5.250.000 đ</strong></p>
              <p className="text-blue-800 font-bold">Sinh viên nộp thực tế: <strong>2.250.000 đ</strong></p>
            </div>
          </div>

          <div 
            style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
            className="rounded-xl border border-slate-200 shadow-xs overflow-hidden"
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead 
                style={{ backgroundColor: themeSettings?.tableHeaderBg || '#004e92' }}
                className="text-white uppercase font-bold text-[11px]"
              >
                <tr>
                  <th className="py-2.5 px-3">MSSV</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Diện chính sách</th>
                  <th className="py-2.5 px-3 text-right">Định mức HK1</th>
                  <th className="py-2.5 px-3 text-right">Cấp bù 70% (NĐ 238)</th>
                  <th className="py-2.5 px-3 text-right">Phải nộp</th>
                  <th className="py-2.5 px-3 text-right">Đã nộp</th>
                  <th className="py-2.5 px-3 text-right">Còn nợ</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {classStudents.map((s, idx) => (
                  <tr key={`${s.id}-${idx}`} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-blue-700">{s.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{s.fullName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.policy}</td>
                    <td className="py-2.5 px-3 text-right font-mono">7.500.000 đ</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold">-5.250.000 đ</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">2.250.000 đ</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-bold">
                      {s.tuitionStatus.paidAmount.toLocaleString()} đ
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                      {s.tuitionStatus.debtAmount > 0 ? `${s.tuitionStatus.debtAmount.toLocaleString()} đ` : '0 đ'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.tuitionStatus.isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {s.tuitionStatus.isComplete ? 'Đã hoàn thành' : 'Còn công nợ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SỔ QUỸ THU - CHI */}
      {activeTab === 'fund' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200 text-xs">
              <span className="font-bold text-blue-800 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-blue-600" /> TỔNG THU QUỸ LỚP:</span>
              <p className="text-xl font-bold text-blue-700 mt-1">{totalIncome.toLocaleString()} VNĐ</p>
              <p className="text-[11px] text-slate-500">Đóng góp đầu kỳ + Tài trợ phụ huynh</p>
            </div>

            <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-xs">
              <span className="font-bold text-rose-800 flex items-center gap-1.5"><TrendingDown className="w-4 h-4 text-rose-600" /> TỔNG CHI THỰC TẾ:</span>
              <p className="text-xl font-bold text-rose-700 mt-1">{totalExpense.toLocaleString()} VNĐ</p>
              <p className="text-[11px] text-slate-500">Bảo hộ xưởng + Tài liệu + Thăm ốm đau</p>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-800 flex items-center gap-1.5"><Wallet className="w-4 h-4 text-emerald-600" /> QUỸ KHẢ DỤNG HIỆN CÓ:</span>
              <p className="text-xl font-bold text-emerald-700 mt-1">{availableFund.toLocaleString()} VNĐ</p>
              <p className="text-[11px] text-slate-500">Tồn quỹ an toàn phục vụ sinh hoạt</p>
            </div>
          </div>

          <div className="flex justify-between items-center flex-wrap gap-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase">NHẬT KÝ THU CHI TÀI CHÍNH LỚP HỌC (THỜI GIAN THỰC)</h4>
            <div className="flex items-center gap-2">
              {onClearFundTransactions && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDialog({
                      isOpen: true,
                      title: 'XÓA TOÀN BỘ SỔ QUỸ LỚP',
                      message: `Thầy/Cô có chắc chắn muốn xóa toàn bộ lịch sử thu - chi của lớp ${currentClass}? Dữ liệu giao dịch sẽ bị xóa và tồn quỹ trở về 0.`,
                      confirmText: 'Xóa toàn bộ sổ quỹ',
                      onConfirm: () => {
                        onClearFundTransactions();
                        showToast(`🗑️ Đã xóa toàn bộ giao dịch sổ quỹ của lớp.`);
                        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                      }
                    });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded text-xs font-bold cursor-pointer transition"
                  title="Xóa toàn bộ các phiếu thu chi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa toàn bộ sổ quỹ</span>
                </button>
              )}
              <button
                onClick={() => setIsAddTxModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#004e92] hover:bg-[#00396b] text-white rounded text-xs font-bold cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Thêm Khoản Thu / Chi
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#004e92] text-white uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Số Phiếu</th>
                  <th className="py-2.5 px-3">Ngày</th>
                  <th className="py-2.5 px-2 text-center">Loại</th>
                  <th className="py-2.5 px-3">Hạng mục thu/chi</th>
                  <th className="py-2.5 px-3 text-right">Số tiền</th>
                  <th className="py-2.5 px-3">Người thực hiện</th>
                  <th className="py-2.5 px-3">Nội dung ghi chú</th>
                  <th className="py-2.5 px-2 text-center w-16">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {fundTransactions.map((tx, idx) => (
                  <tr key={`${tx.id}-${idx}`} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{tx.receiptNumber}</td>
                    <td className="py-2.5 px-3 text-slate-600">{tx.date}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'THU' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{tx.category}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                      {tx.type === 'THU' ? `+${tx.amount.toLocaleString()} đ` : `-${tx.amount.toLocaleString()} đ`}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{tx.performer}</td>
                    <td className="py-2.5 px-3 text-slate-500 italic">{tx.note}</td>
                    <td className="py-2.5 px-2 text-center">
                      {onDeleteTransaction && (
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDialog({
                              isOpen: true,
                              title: 'XÓA PHIẾU THU / CHI',
                              message: `Thầy/Cô có chắc chắn muốn xóa phiếu ${tx.receiptNumber} (${tx.category}: ${tx.amount.toLocaleString()} đ)?`,
                              confirmText: 'Xác nhận xóa phiếu',
                              onConfirm: () => {
                                onDeleteTransaction(tx.id);
                                showToast(`Đã xóa phiếu ${tx.receiptNumber} thành công.`);
                                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                              }
                            });
                          }}
                          className="p-1 hover:bg-rose-100 text-rose-600 rounded transition cursor-pointer"
                          title="Xóa phiếu này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. NHẬT KÝ XƯỞNG 5S */}
      {activeTab === 'workshop' && (
        <div className="space-y-4">
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>Quy tắc An toàn Vệ sinh Lao động (ATVSLĐ) 5S Xưởng Ô tô:</strong> Sinh viên bắt buộc mang giày mũi sắt, kính bảo hộ khi mài/hàn, tóc gọn gàng, kiểm tra van xả khí cầu nâng trước khi kích xe.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onClearWorkshopLogs && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDialog({
                      isOpen: true,
                      title: 'XÓA TOÀN BỘ NHẬT KÝ XƯỞNG',
                      message: `Thầy/Cô có chắc chắn muốn xóa sạch toàn bộ nhật ký kiểm tra an toàn và bảo hộ xưởng của lớp ${currentClass}?`,
                      confirmText: 'Xóa toàn bộ nhật ký',
                      onConfirm: () => {
                        onClearWorkshopLogs();
                        showToast(`🗑️ Đã xóa toàn bộ nhật ký xưởng thực hành.`);
                        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                      }
                    });
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded font-bold shrink-0 cursor-pointer text-xs flex items-center gap-1 transition"
                  title="Xóa toàn bộ nhật ký xưởng"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa toàn bộ nhật ký</span>
                </button>
              )}
              <button
                onClick={() => setIsAddLogModalOpen(true)}
                className="px-3 py-1.5 bg-[#004e92] hover:bg-[#00396b] text-white rounded font-bold shrink-0 cursor-pointer"
              >
                Ghi Nhật Ký Ca Xưởng
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#004e92] text-white uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Mã Nhật Ký</th>
                  <th className="py-2.5 px-3">Ngày & Ca</th>
                  <th className="py-2.5 px-2 text-center">Tổ xưởng</th>
                  <th className="py-2.5 px-3">Vị trí trạm máy</th>
                  <th className="py-2.5 px-3">Giáo viên giám sát</th>
                  <th className="py-2.5 px-2 text-center">Bảo hộ BHLĐ</th>
                  <th className="py-2.5 px-3">Tình trạng máy móc</th>
                  <th className="py-2.5 px-3">Biên bản sự cố / Ghi chú</th>
                  <th className="py-2.5 px-2 text-center w-16">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workshopLogs.map((log, idx) => (
                  <tr key={`${log.id}-${idx}`} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{log.id}</td>
                    <td className="py-2.5 px-3 text-slate-700">{log.date} ({log.shift})</td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-800">Tổ {log.groupNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{log.station}</td>
                    <td className="py-2.5 px-3 text-slate-700">{log.supervisor}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        100% Đạt
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.equipmentStatus === 'Bình thường' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {log.equipmentStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {log.incidentReport ? <span className="text-rose-600 font-bold">{log.incidentReport} - </span> : ''}
                      {log.note}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {onDeleteWorkshopLog && (
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDialog({
                              isOpen: true,
                              title: 'XÓA NHẬT KÝ CA XƯỞNG',
                              message: `Thầy/Cô có chắc chắn muốn xóa nhật ký ${log.id} ngày ${log.date} (Trạm: ${log.station})?`,
                              confirmText: 'Xác nhận xóa nhật ký',
                              onConfirm: () => {
                                onDeleteWorkshopLog(log.id);
                                showToast(`Đã xóa nhật ký ${log.id} thành công.`);
                                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                              }
                            });
                          }}
                          className="p-1 hover:bg-rose-100 text-rose-600 rounded transition cursor-pointer"
                          title="Xóa nhật ký này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add Fund Transaction */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in">
            <div className="bg-[#004e92] text-white px-6 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase">LẬP PHIẾU THU / CHI QUỸ LỚP</h3>
              <button onClick={() => setIsAddTxModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const getVal = (name: string, fallback = '') => {
                  const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
                  return el && el.value !== undefined ? el.value.trim() : fallback;
                };

                const newTx: FundTransaction = {
                  id: `FT-${Date.now().toString().slice(-4)}`,
                  date: new Date().toLocaleDateString('vi-VN'),
                  type: (getVal('type', 'THU') as any),
                  category: getVal('category', 'Thu quỹ lớp'),
                  amount: Number(getVal('amount', '0')) || 0,
                  performer: getVal('performer', 'ThS. Nguyễn Chí Dũng'),
                  note: getVal('note', ''),
                  receiptNumber: `P-${Math.floor(Math.random() * 900) + 100}/QL`
                };
                onAddTransaction(newTx);
                setIsAddTxModalOpen(false);
              }}
              className="p-5 text-xs space-y-3"
            >
              <div>
                <label className="font-semibold block mb-1">Loại chứng từ</label>
                <select name="type" className="w-full p-2 border rounded font-bold">
                  <option value="THU">PHIẾU THU (+ Tiền)</option>
                  <option value="CHI">PHIẾU CHI (- Tiền)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Hạng mục thu/chi</label>
                <input required name="category" placeholder="VD: Mua găng tay xưởng, Nước uống..." className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Số tiền (VNĐ)</label>
                <input required type="number" step="10000" name="amount" defaultValue="500000" className="w-full p-2 border rounded font-mono font-bold" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Người lập phiếu / Người nhận</label>
                <input required name="performer" defaultValue="Ngô Văn Khang (LP Đời sống)" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Ghi chú chi tiết</label>
                <input name="note" placeholder="Kèm hóa đơn bán lẻ..." className="w-full p-2 border rounded" />
              </div>
              <div className="pt-2 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddTxModalOpen(false)} className="px-3 py-1.5 bg-slate-200 rounded">Hủy</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold">Lưu Phiếu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Workshop Safety Log */}
      {isAddLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in">
            <div className="bg-[#004e92] text-white px-6 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase">GHI NHẬT KÝ CA XƯỞNG THỰC HÀNH</h3>
              <button onClick={() => setIsAddLogModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const getVal = (name: string, fallback = '') => {
                  const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
                  return el && el.value !== undefined ? el.value.trim() : fallback;
                };

                const newLog: WorkshopSafetyLog = {
                  id: `WS-${Date.now().toString().slice(-4)}`,
                  date: new Date().toISOString().slice(0, 10),
                  shift: (getVal('shift', 'Sáng') as any),
                  groupNumber: Number(getVal('groupNumber', '1')) as any,
                  station: getVal('station', 'Cầu nâng ô tô 2 trụ số 1'),
                  supervisor: 'ThS. Nguyễn Chí Dũng',
                  protectiveEquipmentChecked: true,
                  equipmentStatus: (getVal('equipmentStatus', 'Bình thường') as any),
                  note: getVal('note', '')
                };
                onAddWorkshopLog(newLog);
                setIsAddLogModalOpen(false);
              }}
              className="p-5 text-xs space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Ca học</label>
                  <select name="shift" className="w-full p-2 border rounded">
                    <option value="Sáng">Ca Sáng</option>
                    <option value="Chiều">Ca Chiều</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Tổ xưởng</label>
                  <select name="groupNumber" className="w-full p-2 border rounded font-bold">
                    <option value="1">Tổ 1 (Cầu nâng)</option>
                    <option value="2">Tổ 2 (Động cơ)</option>
                    <option value="3">Tổ 3 (Hộp số)</option>
                    <option value="4">Tổ 4 (Điện xe)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Vị trí trạm máy</label>
                <select name="station" className="w-full p-2 border rounded">
                  <option value="Cầu nâng 2 trụ & Khung gầm">Cầu nâng 2 trụ & Khung gầm</option>
                  <option value="Bàn tháo lắp Động cơ EFI">Bàn tháo lắp Động cơ EFI</option>
                  <option value="Hộp số tự động AT/CVT">Hộp số tự động AT/CVT</option>
                  <option value="Điện xe & Scan tool OBD-II">Điện xe & Scan tool OBD-II</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Tình trạng thiết bị</label>
                <select name="equipmentStatus" className="w-full p-2 border rounded font-bold">
                  <option value="Bình thường">Bình thường - Hoạt động tốt</option>
                  <option value="Cảnh báo hao mòn">Cảnh báo hao mòn</option>
                  <option value="Cần bảo dưỡng">Cần bảo dưỡng sửa chữa</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Nội dung thực hành & Ghi chú</label>
                <input required name="note" defaultValue="Hoàn thành tháo kiểm tra cơ cấu phối khí, dọn dẹp xưởng 5S sạch sẽ." className="w-full p-2 border rounded" />
              </div>
              <div className="pt-2 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddLogModalOpen(false)} className="px-3 py-1.5 bg-slate-200 rounded">Hủy</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold">Lưu Nhật Ký</button>
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
