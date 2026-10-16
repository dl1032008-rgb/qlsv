import React, { useState } from 'react';
import { 
  Wrench, 
  FileText, 
  Calculator, 
  ShieldCheck, 
  X, 
  Scale, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface QuickToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickToolsModal: React.FC<QuickToolsModalProps> = ({ isOpen, onClose }) => {
  const [calcScore10, setCalcScore10] = useState<number>(7.8);

  if (!isOpen) return null;

  const convertScore = (s: number) => {
    if (s >= 8.5) return { score4: 4.0, letter: 'A', rank: 'Xuất sắc' };
    if (s >= 8.0) return { score4: 3.5, letter: 'B+', rank: 'Giỏi' };
    if (s >= 7.0) return { score4: 3.0, letter: 'B', rank: 'Khá' };
    if (s >= 6.5) return { score4: 2.5, letter: 'C+', rank: 'Trung bình khá' };
    if (s >= 5.5) return { score4: 2.0, letter: 'C', rank: 'Trung bình' };
    if (s >= 5.0) return { score4: 1.5, letter: 'D+', rank: 'Trung bình yếu' };
    if (s >= 4.0) return { score4: 1.0, letter: 'D', rank: 'Yếu' };
    return { score4: 0.0, letter: 'F', rank: 'Kém (Học lại / Thi lại)' };
  };

  const conversion = convertScore(calcScore10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#004e92] text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm sm:text-base uppercase tracking-wide">
              TIỆN ÍCH KỸ THUẬT & CĂN CỨ PHÁP LÝ GDNN
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white font-bold cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
          {/* 1. Quick Converter Calculator */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-blue-800 uppercase flex items-center gap-1.5 mb-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              CÔNG CỤ QUY ĐỔI ĐIỂM CHUẨN THÔNG TƯ 04/2022/TT-BLĐTBXH
            </h4>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-slate-700">Điểm hệ 10:</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={calcScore10}
                  onChange={(e) => setCalcScore10(Number(e.target.value))}
                  className="w-20 p-1.5 border border-slate-300 rounded font-bold font-mono text-center text-sm"
                />
              </div>

              <div className="flex items-center gap-3 bg-white p-2 px-3 rounded-lg border border-slate-200 text-xs">
                <span>Thang 4: <strong className="text-blue-700 text-sm">{conversion.score4.toFixed(1)}</strong></span>
                <span>•</span>
                <span>Điểm chữ: <strong className="text-purple-700 text-sm">{conversion.letter}</strong></span>
                <span>•</span>
                <span>Xếp loại: <strong className="text-emerald-700">{conversion.rank}</strong></span>
              </div>
            </div>
          </div>

          {/* 2. Căn cứ pháp lý cốt lõi */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase flex items-center gap-1.5 border-b pb-1.5">
              <Scale className="w-4 h-4 text-emerald-600" />
              TÓM TẮT ĐIỀU KHOẢN PHÁP LÝ NGHỀ CÔNG NGHỆ Ô TÔ
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
                <span className="font-bold text-blue-900 block mb-1">Nghị định 238/2025/NĐ-CP:</span>
                <p className="text-slate-600">
                  Miễn giảm <strong>70% học phí</strong> cho toàn bộ HSSV ngành Công nghệ Kỹ thuật Ô tô. Nhà nước cấp bù trực tiếp vào ngân sách đào tạo trường nghề.
                </p>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200">
                <span className="font-bold text-rose-900 block mb-1">Điều 14 Thông tư 04/2022/TT-BLĐTBXH:</span>
                <p className="text-slate-600">
                  Sinh viên vắng <strong>&gt; 20% tổng số tiết</strong> của mô đun (kể cả có phép hay không phép) sẽ bị <strong>CẤM THI</strong> kết thúc mô đun.
                </p>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-200">
                <span className="font-bold text-purple-900 block mb-1">Thông tư 17/2017/TT-BLĐTBXH:</span>
                <p className="text-slate-600">
                  Đánh giá rèn luyện theo Biểu mẫu BM01 thang 100 điểm, quy trình 3 bước khép kín. Bị khiển trách không quá Khá; cảnh cáo không quá Trung bình.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                <span className="font-bold text-emerald-900 block mb-1">Quyết định 53/2015/QĐ-TTg:</span>
                <p className="text-slate-600">
                  Chính sách nội trú và học bổng khuyến khích học nghề (KKHN). Học bổng loại Xuất sắc, Giỏi, Khá cấp theo tháng học thực tế.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Tiêu chuẩn An toàn Xưởng 5S */}
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
            <h4 className="font-bold text-amber-900 uppercase flex items-center gap-1.5 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              QUY CHUẨN 5S & AN TOÀN LAO ĐỘNG XƯỞNG Ô TÔ
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-slate-700">
              <div className="bg-white p-2 rounded border border-amber-200 text-center">
                <strong className="block text-amber-800">1. Sàng lọc (Seiri)</strong>
                Loại bỏ vật tư thừa, giẻ lau dầu nhớt cũ
              </div>
              <div className="bg-white p-2 rounded border border-amber-200 text-center">
                <strong className="block text-amber-800">2. Sắp xếp (Seiton)</strong>
                Cờ lê, tuýp về đúng bảng đồ gá treo
              </div>
              <div className="bg-white p-2 rounded border border-amber-200 text-center">
                <strong className="block text-amber-800">3. Sạch sẽ (Seiso)</strong>
                Lau sạch dầu tràn quanh cầu nâng
              </div>
              <div className="bg-white p-2 rounded border border-amber-200 text-center">
                <strong className="block text-amber-800">4. Săn sóc (Seiketsu)</strong>
                Duy trì nề nếp vệ sinh cuối mỗi ca học
              </div>
              <div className="bg-white p-2 rounded border border-amber-200 text-center col-span-2 sm:col-span-1">
                <strong className="block text-amber-800">5. Sẵn sàng (Shitsuke)</strong>
                Tự giác chấp hành mang giày mũi sắt 100%
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            Hỗ trợ cố vấn sư phạm: <strong>ThS. Nguyễn Chí Dũng (Zalo: 0865.074.668)</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#004e92] text-white rounded font-bold cursor-pointer"
          >
            Đóng Tiện Ích
          </button>
        </div>
      </div>
    </div>
  );
};
