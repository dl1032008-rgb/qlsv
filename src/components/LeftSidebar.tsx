import React, { useState } from 'react';
import { ChevronDown, ChevronRight, GraduationCap, FolderTree, Layers } from 'lucide-react';

interface LeftSidebarProps {
  currentClass?: string;
  onSelectClass?: (className: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ currentClass = 'CĐ Ô TÔ K17', onSelectClass }) => {
  // Mặc định ẩn nội dung: Khi khởi động hoặc chưa chọn hệ đào tạo, toàn bộ danh sách lớp học thuộc các hệ được thu gọn (ẩn).
  const [openSystems, setOpenSystems] = useState<Record<string, boolean>>({
    'Cao đẳng': false,
    'Liên thông': false,
    'Trung cấp': false
  });

  const trainingSystems = [
    {
      name: 'Cao đẳng',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      classes: [
        { code: 'CĐ Ô TÔ K17', name: 'Công nghệ Kỹ thuật Ô tô' },
        { code: 'CĐ Điện CN K17', name: 'Điện - Điện tử công nghiệp' },
        { code: 'CĐ CNTT K18', name: 'Công nghệ thông tin' }
      ]
    },
    {
      name: 'Liên thông',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      classes: [
        { code: 'LT Ô TÔ K16', name: 'Liên thông CĐ Ô Tô' },
        { code: 'LT Cơ khí K16', name: 'Liên thông CĐ Cơ khí' }
      ]
    },
    {
      name: 'Trung cấp',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      classes: [
        { code: 'TC Hàn K18', name: 'Kỹ thuật Hàn công nghiệp' },
        { code: 'TC Cắt gọt K18', name: 'Cắt gọt kim loại CNC' }
      ]
    }
  ];

  const toggleSystem = (systemName: string) => {
    setOpenSystems(prev => ({
      ...prev,
      [systemName]: !prev[systemName]
    }));
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200 p-4 flex flex-col gap-4 shadow-sm shrink-0">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
        <FolderTree className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-800 text-sm">Danh mục Hệ & Lớp học</h3>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {trainingSystems.map((sys) => {
          const isOpen = !!openSystems[sys.name];
          return (
            <div key={sys.name} className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              {/* Tiêu đề Hệ đào tạo - Nhấn vào để mở / đóng linh hoạt */}
              <button
                onClick={() => toggleSystem(sys.name)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition text-left font-semibold text-xs text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>Hệ {sys.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${sys.badgeColor}`}>
                    {sys.classes.length} lớp
                  </span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-500 transition-transform" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500 transition-transform" />
                )}
              </button>

              {/* Danh sách lớp học thuộc hệ - Mặc định ẩn (thu gọn), chỉ hiện khi nhấn mở */}
              {isOpen && (
                <div className="bg-white p-2 space-y-1 border-t border-slate-200">
                  {sys.classes.map((cls) => {
                    const isSelected = currentClass === cls.code;
                    return (
                      <button
                        key={cls.code}
                        onClick={() => {
                          if (onSelectClass) onSelectClass(cls.code);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{cls.code}</span>
                        </div>
                        <span className={`text-[10px] truncate max-w-[100px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {cls.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-[11px] text-blue-900">
        <strong>Hành vi tương tác:</strong> Danh sách lớp mặc định thu gọn. Nhấn vào tiêu đề Hệ (Cao đẳng, Liên thông, Trung cấp) để mở rộng hoặc ẩn danh sách lớp.
      </div>
    </aside>
  );
};
