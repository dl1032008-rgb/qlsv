
import React, { useState } from 'react';
import { Trash2, Users, ArrowUpDown, ChevronDown, CheckSquare } from 'lucide-react';

interface SelectionToolbarProps {
  selectedIds: Set<string> | string[];
  currentClass: string;
  onClearSelection: () => void;
  onDeleteStudents: () => void;
  onDivideGroups?: () => void;
  onChangeGroup?: (group: number) => void;
  onBulkEdit?: () => void;
  onMoveToTop?: () => void;
  onMoveToBottom?: () => void;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({ 
  selectedIds, 
  currentClass, 
  onClearSelection, 
  onDeleteStudents,
  onDivideGroups,
  onChangeGroup,
  onBulkEdit,
  onMoveToTop,
  onMoveToBottom
}) => {
  const count = selectedIds instanceof Set ? selectedIds.size : selectedIds.length;
  const [showGroupMenu, setShowGroupMenu] = useState(false);

  return (
    <div 
      style={{ backgroundColor: '#ffffff' }}
      className="bg-white px-3 sm:px-4 py-2.5 rounded-xl border-2 border-blue-500/70 shadow-xs flex flex-wrap items-center justify-between gap-2.5 select-none animate-in fade-in text-slate-800"
    >
      <div className="flex items-center gap-3">
        <span className="font-extrabold text-xs sm:text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-2xs flex items-center gap-1.5">
          <CheckSquare className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          <span>Đã chọn: {count} SV</span>
        </span>
        <button 
          onClick={onClearSelection} 
          className="text-xs text-slate-500 hover:text-blue-700 underline cursor-pointer transition font-bold"
        >
          Bỏ chọn
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs">
        {onDivideGroups && (
          <button 
            onClick={onDivideGroups}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg transition active:scale-95 shadow-xs cursor-pointer flex items-center gap-1"
            title="Tự động chia đều các sinh viên đã chọn vào 4 Tổ"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Chia Tổ ({count})</span>
          </button>
        )}

        {onChangeGroup && (
          <div className="relative">
            <button 
              onClick={() => setShowGroupMenu(!showGroupMenu)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg transition active:scale-95 shadow-xs cursor-pointer flex items-center gap-1"
            >
              <span>Chuyển Tổ</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showGroupMenu && (
              <div className="absolute top-full mt-1 left-0 bg-white border border-slate-300 rounded-lg shadow-xl py-1 z-50 text-xs w-32 divide-y divide-slate-100">
                {[1, 2, 3, 4].map(g => (
                  <button
                    key={g}
                    onClick={() => {
                      onChangeGroup(g);
                      setShowGroupMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold cursor-pointer"
                  >
                    Vào Tổ {g}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {onBulkEdit && (
          <button 
            onClick={onBulkEdit}
            className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-black py-1.5 px-3 rounded-lg transition active:scale-95 shadow-xs cursor-pointer"
          >
            Sửa Hàng Loạt
          </button>
        )}

        {onMoveToTop && (
          <button 
            onClick={onMoveToTop}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold py-1.5 px-2.5 rounded-lg transition active:scale-95 shadow-xs cursor-pointer"
            title="Ưu tiên lên đầu bảng"
          >
            ↑ Lên đầu DS
          </button>
        )}

        {onMoveToBottom && (
          <button 
            onClick={onMoveToBottom}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold py-1.5 px-2.5 rounded-lg transition active:scale-95 shadow-xs cursor-pointer"
            title="Đẩy xuống cuối bảng"
          >
            ↓ Xuống cuối DS
          </button>
        )}

        <button 
          onClick={onDeleteStudents}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded-lg transition active:scale-95 shadow-xs cursor-pointer flex items-center gap-1"
          title="Xóa danh sách sinh viên đã chọn"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Xóa ({count})</span>
        </button>
      </div>
    </div>
  );
};
