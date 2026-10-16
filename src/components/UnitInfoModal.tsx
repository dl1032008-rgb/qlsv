import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  Link2, 
  RotateCcw, 
  Save, 
  X,
  Check
} from 'lucide-react';
import { UnitInfoSettings, DEFAULT_UNIT_INFO_SETTINGS } from '../types';

interface UnitInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitInfo: UnitInfoSettings;
  onSaveUnitInfo: (newInfo: UnitInfoSettings) => void;
}

export const UnitInfoModal: React.FC<UnitInfoModalProps> = ({
  isOpen,
  onClose,
  unitInfo,
  onSaveUnitInfo
}) => {
  const [formData, setFormData] = useState<UnitInfoSettings>(unitInfo);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(unitInfo);
      setShowSavedToast(false);
    }
  }, [isOpen, unitInfo]);

  if (!isOpen) return null;

  const handleChange = (field: keyof UnitInfoSettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReset = () => {
    if (window.confirm('Khôi phục lại toàn bộ thông tin đơn vị trường lớp mặc định ban đầu?')) {
      setFormData(DEFAULT_UNIT_INFO_SETTINGS);
    }
  };

  const handleSave = () => {
    onSaveUnitInfo(formData);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Scrollable Body: Exactly matching Image 2 */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-slate-800 flex-1">
          
          {/* 1. THÔNG TIN ĐƠN VỊ QUẢN LÝ, TRƯỜNG & KHOA */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-blue-100">
              <div className="flex items-center gap-2 text-[#004e92] font-bold text-xs sm:text-[13px] uppercase tracking-wide">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>1. THÔNG TIN ĐƠN VỊ QUẢN LÝ, TRƯỜNG & KHOA</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-semibold block mb-1 text-slate-700">Cơ quan chủ quản cấp trên:</label>
                <input
                  type="text"
                  value={formData.parentAgency}
                  onChange={(e) => handleChange('parentAgency', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 transition"
                  placeholder="UBND TỈNH PHÚ THỌ"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">Tên trường (In hoa):</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 uppercase transition"
                  placeholder="TRƯỜNG CAO ĐẲNG KỸ THUẬT - CÔNG NGHỆ VĨNH PHÚC"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">Khoa chuyên môn (In hoa):</label>
                <input
                  type="text"
                  value={formData.facultyName}
                  onChange={(e) => handleChange('facultyName', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 uppercase transition"
                  placeholder="KHOA CÔNG NGHỆ Ô TÔ"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">Ngành nghề đào tạo:</label>
                <input
                  type="text"
                  value={formData.majorName}
                  onChange={(e) => handleChange('majorName', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 transition"
                  placeholder="Công nghệ ô tô"
                />
              </div>
            </div>
          </div>

          {/* 2. LỚP HỌC, NIÊN KHÓA & ĐỊA DANH BAN HÀNH VĂN BẢN */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 pb-1.5 border-b border-blue-100 text-[#004e92] font-bold text-xs sm:text-[13px] uppercase tracking-wide">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>2. LỚP HỌC, NIÊN KHÓA & ĐỊA DANH BAN HÀNH VĂN BẢN</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="font-semibold block mb-1 text-slate-700">Mã / Tên Lớp:</label>
                <input
                  type="text"
                  value={formData.classId}
                  onChange={(e) => handleChange('classId', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700 transition"
                  placeholder="CĐK19.2-OT1.CLC"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">Niên khóa đào tạo:</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => handleChange('academicYear', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 transition"
                  placeholder="2025-2028"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">Hệ đào tạo:</label>
                <input
                  type="text"
                  value={formData.trainingSystem}
                  onChange={(e) => handleChange('trainingSystem', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 transition"
                  placeholder="Cao đẳng chính quy"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-semibold block mb-1 text-slate-700">Địa phương ban hành văn bản:</label>
                <input
                  type="text"
                  value={formData.issueLocation}
                  onChange={(e) => handleChange('issueLocation', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 transition"
                  placeholder="Phú Thọ"
                />
                <p className="text-[11px] text-slate-400 italic mt-1">
                  Xuất hiện trong câu: [Địa phương], ngày ... tháng ... năm ...
                </p>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">Ký hiệu số văn bản:</label>
                <input
                  type="text"
                  value={formData.documentSymbol}
                  onChange={(e) => handleChange('documentSymbol', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 transition"
                  placeholder=".../TN-CĐOT"
                />
              </div>
            </div>
          </div>

          {/* 3. NHÂN SỰ & KÝ DUYỆT CÁC BIỂU MẪU HÀNH CHÍNH */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 pb-1.5 border-b border-blue-100 text-[#004e92] font-bold text-xs sm:text-[13px] uppercase tracking-wide">
              <Users className="w-4 h-4 text-blue-600 shrink-0" />
              <span>3. NHÂN SỰ & KÝ DUYỆT CÁC BIỂU MẪU HÀNH CHÍNH</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="font-semibold block mb-1 text-slate-700">Cố vấn học tập / GVCN:</label>
                <input
                  type="text"
                  value={formData.advisorName}
                  onChange={(e) => handleChange('advisorName', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 transition"
                  placeholder="ThS: Nguyễn Chí Dũng"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">Lãnh đạo Khoa (Trưởng Khoa):</label>
                <input
                  type="text"
                  value={formData.deanName}
                  onChange={(e) => handleChange('deanName', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 transition"
                  placeholder="ThS: Đỗ Thế Huân"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">Thư ký biên bản / cuộc họp:</label>
                <input
                  type="text"
                  value={formData.secretaryName}
                  onChange={(e) => handleChange('secretaryName', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 transition"
                  placeholder="Nguyễn Thế Quang"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="font-semibold block mb-1 text-slate-700">Chức danh người ký GXN:</label>
                <input
                  type="text"
                  value={formData.certSignerTitle}
                  onChange={(e) => handleChange('certSignerTitle', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 uppercase transition"
                  placeholder="TRƯỜNG PHÒNG CTHSSV"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1 text-slate-700">Họ tên người ký duyệt / Hiệu trưởng:</label>
                <input
                  type="text"
                  value={formData.principalName}
                  onChange={(e) => handleChange('principalName', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 transition"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>
          </div>

          {/* 4. LIÊN KẾT MẠNG XÃ HỘI LỚP (ZALO) */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 pb-1.5 border-b border-blue-100 text-[#004e92] font-bold text-xs sm:text-[13px] uppercase tracking-wide">
              <Link2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>LIÊN KẾT MẠNG XÃ HỘI LỚP (ZALO)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-semibold block mb-1 text-slate-700">Link Zalo Nhóm Lớp:</label>
                <input
                  type="text"
                  value={formData.classZaloLink}
                  onChange={(e) => handleChange('classZaloLink', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px] sm:text-xs text-blue-600 transition"
                  placeholder="https://zalo.me/g/..."
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">Link Zalo Nhóm Phụ Huynh:</label>
                <input
                  type="text"
                  value={formData.parentZaloLink}
                  onChange={(e) => handleChange('parentZaloLink', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px] sm:text-xs text-emerald-600 transition"
                  placeholder="https://zalo.me/g/..."
                />
              </div>
            </div>
          </div>

        </div>

        {/* Action Bar at Bottom: Exactly matching Image 2 */}
        <div className="bg-white px-6 sm:px-8 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          {/* Left: Red Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-bold text-xs cursor-pointer transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi Phục Mặc Định</span>
          </button>

          {/* Right: Close and Save Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer transition shadow-2xs"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer transition active:scale-95"
            >
              {showSavedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Đã Lưu!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Cấu Hình</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
