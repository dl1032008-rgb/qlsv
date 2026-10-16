import React from 'react';
import { 
  Building2, 
  Award, 
  FileText, 
  Wrench, 
  ShieldCheck, 
  Users, 
  MapPin, 
  Link2,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { UnitInfoSettings } from '../types';

interface UnitInfoModuleProps {
  unitInfo: UnitInfoSettings;
  onOpenUnitInfoModal: () => void;
}

export const UnitInfoModule: React.FC<UnitInfoModuleProps> = ({
  unitInfo,
  onOpenUnitInfoModal
}) => {
  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6">
      
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-[#01427a] via-[#01579b] to-[#0277bd] text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider bg-white/20 text-yellow-300 px-3 py-1 rounded-full font-bold">
            {unitInfo.parentAgency || 'UBND TỈNH PHÚ THỌ'} • HỆ THỐNG GDNN VIỆT NAM
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2 uppercase tracking-tight text-white drop-shadow-xs">
            {unitInfo.facultyName} - {unitInfo.schoolName}
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-3xl">
            Ngành nghề đào tạo: <strong>{unitInfo.majorName}</strong> • Hệ: <strong>{unitInfo.trainingSystem}</strong> • Niên khóa: <strong>{unitInfo.academicYear}</strong>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 text-xs">
            <p className="font-semibold text-yellow-300">GVCN / Cố vấn học tập:</p>
            <p className="font-bold text-white text-sm">{unitInfo.advisorName}</p>
            <p className="text-sky-200 text-[11px]">Lớp: <strong>{unitInfo.classId}</strong></p>
          </div>

          <button
            onClick={onOpenUnitInfoModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition transform active:scale-95"
            title="Mở bảng tùy chỉnh dữ liệu thông tin trường lớp (Hình 2)"
          >
            <Edit3 className="w-4 h-4 text-slate-900" />
            <span>Tùy Chỉnh Thông Tin (Hình 2)</span>
          </button>
        </div>
      </div>

      {/* 4 Box Highlights corresponding to Image 2 Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Box 1: Trường & Khoa */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-[#004e92] text-xs uppercase flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              Đơn Vị & Trường
            </span>
          </div>
          <div className="text-xs space-y-1.5 mt-2">
            <p className="text-slate-500 text-[11px]">Cơ quan chủ quản:</p>
            <p className="font-bold text-slate-800">{unitInfo.parentAgency}</p>
            <p className="text-slate-500 text-[11px] mt-2">Khoa chuyên môn:</p>
            <p className="font-bold text-blue-800">{unitInfo.facultyName}</p>
          </div>
        </div>

        {/* Box 2: Lớp học & Ban hành */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-[#004e92] text-xs uppercase flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Lớp & Địa Danh
            </span>
          </div>
          <div className="text-xs space-y-1.5 mt-2">
            <p className="text-slate-500 text-[11px]">Mã lớp đào tạo:</p>
            <p className="font-extrabold text-blue-700">{unitInfo.classId}</p>
            <p className="text-slate-500 text-[11px] mt-2">Địa phương ban hành:</p>
            <p className="font-semibold text-slate-800">{unitInfo.issueLocation} (Số: {unitInfo.documentSymbol})</p>
          </div>
        </div>

        {/* Box 3: Nhân sự ký duyệt */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-[#004e92] text-xs uppercase flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-600" />
              Ký Duyệt & Lãnh Đạo
            </span>
          </div>
          <div className="text-xs space-y-1.5 mt-2">
            <p className="text-slate-500 text-[11px]">Trưởng Khoa:</p>
            <p className="font-bold text-slate-800">{unitInfo.deanName}</p>
            <p className="text-slate-500 text-[11px] mt-2">{unitInfo.certSignerTitle}:</p>
            <p className="font-bold text-slate-800">{unitInfo.principalName}</p>
          </div>
        </div>

        {/* Box 4: Kênh kết nối Zalo */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-[#004e92] text-xs uppercase flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-sky-600" />
              Kênh Zalo Lớp
            </span>
          </div>
          <div className="text-xs space-y-2 mt-2">
            <a 
              href={unitInfo.classZaloLink} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-bold"
            >
              <span>Zalo Nhóm Lớp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a 
              href={unitInfo.parentZaloLink} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-bold"
            >
              <span>Zalo Phụ Huynh</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Grid: 3 Legal & Academic Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Pháp lý & Quy chế */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center gap-2.5 text-blue-700 font-bold mb-3 pb-2 border-b border-slate-100">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm uppercase">CĂN CỨ PHÁP LÝ BẮT BUỘC</h3>
          </div>
          <ul className="text-xs text-slate-700 space-y-2.5 flex-1">
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 shrink-0">1.</span>
              <span><strong>Thông tư 04/2022/TT-BLĐTBXH:</strong> Quy chế đào tạo trình độ Cao đẳng, Trung cấp theo niên chế và tích lũy mô đun/tín chỉ. Khống chế nghỉ &gt; 20% cấm thi.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 shrink-0">2.</span>
              <span><strong>Thông tư 17/2017/TT-BLĐTBXH:</strong> Quy chế đánh giá kết quả rèn luyện HSSV (5 Tiêu chí, thang 100 điểm, quy trình 3 bước BM01).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 shrink-0">3.</span>
              <span><strong>Thông tư 27/2017/TT-BLĐTBXH:</strong> Quy định chế độ khen thưởng, kỷ luật HSSV trường nghề.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 shrink-0">4.</span>
              <span><strong>Nghị định 81/2021/NĐ-CP & 238/2025/NĐ-CP:</strong> Miễn giảm 70% học phí đối với ngành Công nghệ Ô tô (nghề nặng nhọc, độc hại, nguy hiểm).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 shrink-0">5.</span>
              <span><strong>QĐ 77/2014 & QĐ 53/2015/QĐ-TTg:</strong> Chính sách nội trú, học bổng khuyến khích học nghề (KKHN).</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Mục tiêu & Triết lý Đào tạo */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center gap-2.5 text-emerald-700 font-bold mb-3 pb-2 border-b border-slate-100">
            <Award className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm uppercase">TRIẾT LÝ 70% THỰC HÀNH XƯỞNG</h3>
          </div>
          <div className="space-y-3 text-xs text-slate-700 flex-1">
            <p>
              Chương trình đào tạo Cao đẳng Công nghệ Ô tô 3 năm (6 Học kỳ) với khối lượng <strong>70% thời lượng thực hành trực tiếp tại xưởng</strong> và thực tập tại doanh nghiệp ô tô.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-800">Chuẩn đầu ra Kỹ sư thực hành:</p>
              <p className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Tháo lắp đại tu Động cơ đốt trong xăng & diesel</p>
              <p className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Chẩn đoán hệ thống phun xăng EFI, Common Rail</p>
              <p className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Bảo dưỡng Hộp số tự động AT, CVT, Ly hợp kép</p>
              <p className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Đọc sơ đồ mạng CAN, LIN và Scan tool chuyên hãng</p>
              <p className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Quy chuẩn 5S và An toàn vệ sinh lao động (ATVSLĐ)</p>
            </div>
          </div>
        </div>

        {/* Card 3: Cơ sở vật chất Xưởng */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center gap-2.5 text-amber-700 font-bold mb-3 pb-2 border-b border-slate-100">
            <Wrench className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm uppercase">TRANG THIẾT BỊ XƯỞNG THỰC HÀNH</h3>
          </div>
          <div className="text-xs text-slate-700 space-y-2 flex-1">
            <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200">
              <p className="font-bold text-amber-900">Khu vực 1: Cầu nâng & Khung gầm (Tổ 1)</p>
              <p className="text-slate-600 text-[11px]">04 Cầu nâng 2 trụ thủy lực tải 4 tấn, cầu cắt kéo kiểm tra góc đặt bánh xe 3D, máy ra vào lốp xe con.</p>
            </div>
            <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200">
              <p className="font-bold text-blue-900">Khu vực 2: Động cơ đốt trong EFI (Tổ 2)</p>
              <p className="text-slate-600 text-[11px]">08 Mô hình động cơ Toyota 1NZ-FE, 2TR-FE, Hyundai Gamma, dàn tháo lắp cơ cấu DOHC, đồ gá vi panme.</p>
            </div>
            <div className="p-2.5 bg-purple-50/50 rounded-lg border border-purple-200">
              <p className="font-bold text-purple-900">Khu vực 3: Hộp số tự động (Tổ 3)</p>
              <p className="text-slate-600 text-[11px]">Mô hình cắt bổ hộp số AT 4-6 cấp, hộp số vô cấp CVT K311, cụm biến mô thủy lực và vi sai.</p>
            </div>
            <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-200">
              <p className="font-bold text-emerald-900">Khu vực 4: Điện xe & Chẩn đoán (Tổ 4)</p>
              <p className="text-slate-600 text-[11px]">Máy chẩn đoán chuyên hãng Launch X431, G-Scan 3, Autel MaxiSys, bàn thực hành mạch điện ô tô đa năng.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
