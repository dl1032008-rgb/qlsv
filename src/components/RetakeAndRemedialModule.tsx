import React, { useState } from 'react';
import { 
  AlertOctagon, 
  BookOpen, 
  CheckSquare, 
  Clock, 
  HelpCircle, 
  MessageSquare, 
  UserCheck, 
  Calendar, 
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { Student, StudentGrade, SubjectModule, ClassId } from '../types';

interface RetakeAndRemedialModuleProps {
  students: Student[];
  currentClass: ClassId;
  modules: SubjectModule[];
  grades: StudentGrade[];
}

export const RetakeAndRemedialModule: React.FC<RetakeAndRemedialModuleProps> = ({
  students,
  currentClass,
  modules,
  grades
}) => {
  const [activeTab, setActiveTab] = useState<'debt-list' | 'pedagogy-steps'>('debt-list');

  const classStudents = students.filter(s => s.classId === currentClass);

  // Identify failed grades
  const failedGrades = grades.filter(g => !g.isPassed);

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            QUẢN LÝ HỌC VỤ & PHỤ ĐẠO SƯ PHẠM
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-1">
            DANH SÁCH THI LẠI - HỌC LẠI & GIẢI PHÁP SƯ PHẠM
          </h2>
          <p className="text-xs text-slate-500">
            Căn cứ Điều 18 Thông tư 04/2022/TT-BLĐTBXH về điều kiện thi lại, học lại và kế hoạch bồi dưỡng tay nghề xưởng
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('debt-list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'debt-list'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Danh sách Nợ môn & Lịch thi lại
          </button>
          <button
            onClick={() => setActiveTab('pedagogy-steps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'pedagogy-steps'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Quy trình Sư phạm 4 Bước của GVCN
          </button>
        </div>
      </div>

      {activeTab === 'debt-list' ? (
        <div className="space-y-4">
          {/* Summary Warning Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-xs text-rose-900">
              <span className="font-bold block">Tổng số SV nợ mô đun / thi lại:</span>
              <p className="text-2xl font-black text-rose-700 mt-1">1 <span className="text-xs font-normal">sinh viên</span></p>
              <p className="text-[11px] text-rose-600 mt-1">Mô đun MĐ03: Vẽ kỹ thuật & Autocad cơ khí (Tạ Minh Khôi)</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-900">
              <span className="font-bold block">Nguy cơ cấm thi vắng &gt;20%:</span>
              <p className="text-2xl font-black text-amber-700 mt-1">1 <span className="text-xs font-normal">sinh viên</span></p>
              <p className="text-[11px] text-amber-600 mt-1">Mô đun MĐ04: Kỹ thuật nguội & Hàn (Hoàng Minh Tuấn)</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-900">
              <span className="font-bold block">Đôi bạn cùng tiến phụ đạo xưởng:</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">4 <span className="text-xs font-normal">cặp kèm cặp</span></p>
              <p className="text-[11px] text-emerald-600 mt-1">Phân công Lớp trưởng & Lớp phó HT kèm trực tiếp</p>
            </div>
          </div>

          {/* Table of Retake Students */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-800 uppercase">
              BẢNG THEO DÕI SINH VIÊN NỢ MÔ ĐUN CẦN PHỤ ĐẠO & LỊCH THI LẠI ĐỢT 1
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#004e92] text-white uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">MSSV</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Tổ xưởng</th>
                  <th className="py-2.5 px-3">Mô đun nợ</th>
                  <th className="py-2.5 px-2 text-center">Điểm lần 1</th>
                  <th className="py-2.5 px-2 text-center">Số TC</th>
                  <th className="py-2.5 px-3">Lịch phụ đạo bổ sung</th>
                  <th className="py-2.5 px-3">Người kèm cặp</th>
                  <th className="py-2.5 px-3">Lịch thi lại</th>
                  <th className="py-2.5 px-3 text-center">Tình trạng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-blue-700">25OT1012</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">Tạ Minh Khôi</td>
                  <td className="py-2.5 px-3">Tổ 2</td>
                  <td className="py-2.5 px-3 font-bold text-rose-700">MĐ03: Vẽ kỹ thuật & Autocad</td>
                  <td className="py-2.5 px-2 text-center font-bold text-rose-600 bg-rose-50">3.4 (F)</td>
                  <td className="py-2.5 px-2 text-center">3 TC</td>
                  <td className="py-2.5 px-3 text-slate-700">Thứ 7 hàng tuần (08h - 11h, Phòng CAD 204)</td>
                  <td className="py-2.5 px-3 font-semibold text-blue-700">Nguyễn Tiến Đạt (LP Học tập)</td>
                  <td className="py-2.5 px-3 text-amber-700 font-bold">25/11/2026</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                      Đang ôn tập
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-blue-700">25OT1006</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">Hoàng Minh Tuấn</td>
                  <td className="py-2.5 px-3">Tổ 2</td>
                  <td className="py-2.5 px-3 font-bold text-amber-700">MĐ04: Kỹ thuật nguội & Hàn</td>
                  <td className="py-2.5 px-2 text-center font-bold text-amber-600 bg-amber-50">4.3 (D)</td>
                  <td className="py-2.5 px-2 text-center">3 TC</td>
                  <td className="py-2.5 px-3 text-slate-700">Bổ sung 12 tiết thực hành xưởng nguội</td>
                  <td className="py-2.5 px-3 font-semibold text-blue-700">Trần Văn Hoàng (Lớp trưởng)</td>
                  <td className="py-2.5 px-3 text-slate-600">Đã thi đạt (Học cải thiện)</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                      Theo dõi chuyên cần
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TAB 2: QUY TRÌNH 4 BƯỚC SƯ PHẠM CỦA GVCN */
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-800 uppercase flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              QUY TRÌNH 4 BƯỚC GIẢI QUYẾT TÌNH HUỐNG SƯ PHẠM VÀ HỌC VỤ CHUẨN MỰC
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Phương pháp tiếp cận nhân văn, công tâm, đúng quy chế dành riêng cho sinh viên kỹ thuật công nghệ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Bước 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">1</span>
                <h4 className="font-bold text-blue-900 uppercase">Bước 1: Lắng nghe & Phân tích nguyên nhân gốc rễ</h4>
              </div>
              <ul className="text-slate-700 space-y-1.5 pl-8 list-disc">
                <li>Đối thoại trực tiếp 1:1 trong không khí cởi mở, không phán xét vội vàng.</li>
                <li>Tìm hiểu hoàn cảnh gia đình (kinh tế khó khăn, bố mẹ ly hôn, đi làm thêm ca đêm).</li>
                <li>Đánh giá áp lực xưởng thực hành: Khó hiểu hình chiếu không gian 3D, sợ máy móc xưởng nguội hàn.</li>
                <li>Phát hiện nguy cơ bị bạn bè lôi kéo chơi game hoặc sa sút tâm lý.</li>
              </ul>
            </div>

            {/* Bước 2 */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50/40 p-4 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs">2</span>
                <h4 className="font-bold text-amber-900 uppercase">Bước 2: Đối chiếu quy chế & Đánh giá mức độ</h4>
              </div>
              <ul className="text-slate-700 space-y-1.5 pl-8 list-disc">
                <li>Tra cứu tỷ lệ nghỉ học so với mốc 20% theo Điều 14 Thông tư 04/2022/TT-BLĐTBXH.</li>
                <li>Kiểm tra điểm tổng kết mô đun (&lt; 4.0 là điểm F phải thi lại hoặc học lại).</li>
                <li>Đánh giá mức độ ảnh hưởng đến điểm rèn luyện BM01 và học bổng KKHN của lớp.</li>
                <li>Thông báo kịp thời cho Phụ huynh trước khi có quyết định xử lý học vụ chính thức.</li>
              </ul>
            </div>

            {/* Bước 3 */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 p-4 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">3</span>
                <h4 className="font-bold text-emerald-900 uppercase">Bước 3: Đề xuất giải pháp nhân văn & Đối thoại</h4>
              </div>
              <ul className="text-slate-700 space-y-1.5 pl-8 list-disc">
                <li>Mô hình "Đôi bạn cùng tiến": Giao Lớp phó học tập hoặc Tổ trưởng kèm cặp thực hành.</li>
                <li>GVCN bố trí 02 buổi phụ đạo xưởng miễn phí ngoài giờ để bù đắp kiến thức rỗng.</li>
                <li>Liên hệ Phụ huynh qua Zalo/Điện thoại với tinh thần phối hợp giáo dục, không tạo áp lực tiêu cực.</li>
                <li>Hướng dẫn làm đơn xin miễn giảm 70% học phí nếu gia đình khó khăn tài chính.</li>
              </ul>
            </div>

            {/* Bước 4 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50/40 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">4</span>
                <h4 className="font-bold text-purple-900 uppercase">Bước 4: Thiết lập cam kết & Theo dõi tiến độ</h4>
              </div>
              <ul className="text-slate-700 space-y-1.5 pl-8 list-disc">
                <li>Lập Biên bản làm việc sư phạm có chữ ký cam kết của sinh viên và xác nhận của phụ huynh.</li>
                <li>Đặt mục tiêu cụ thể: Chuyên cần 100% trong 4 tuần tới; đạt điểm thi lại từ 6.0 trở lên.</li>
                <li>Giao Ban cán sự lớp điểm danh chéo và báo cáo tiến bộ hàng tuần cho GVCN.</li>
                <li>Khen thưởng kịp thời khi sinh viên có sự tiến bộ vượt bậc về thái độ và tay nghề.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
