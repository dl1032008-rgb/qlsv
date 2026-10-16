import React from 'react';
import { 
  Cloud, 
  Download, 
  Upload, 
  CheckCircle, 
  Shield, 
  ExternalLink,
  Key,
  RefreshCw,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { SyncStatus } from '../types';

interface CloudSyncDashboardProps {
  isAuthenticated: boolean;
  userEmail: string | null;
  isSyncing: boolean;
  lastSyncTime: string | null;
  fileUrls: Record<string, string>;
  fileSyncStatus?: Record<string, SyncStatus>;
  currentClass: string;
  onConnect: () => void;
  onSync: () => void;
  onDisconnect: () => void;
  onDownloadZip: () => void;
  onUploadJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProgressBar: React.FC<{ progress: number; status: SyncStatus['status'] }> = ({ progress, status }) => {
  const color = status === 'success' ? 'bg-emerald-500' : status === 'error' ? 'bg-red-500' : 'bg-blue-500';
  return (
    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
      <div className={`${color} h-2 rounded-full transition-all duration-300`} style={{ width: `${progress}%` }} />
    </div>
  );
};

export const CloudSyncDashboard: React.FC<CloudSyncDashboardProps> = ({
  isAuthenticated,
  userEmail,
  isSyncing,
  lastSyncTime,
  fileUrls,
  fileSyncStatus,
  currentClass,
  onConnect,
  onSync,
  onDisconnect,
  onDownloadZip,
  onUploadJson
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header & Status Card */}
      <div className={`p-8 rounded-3xl border ${isAuthenticated ? 'bg-white border-emerald-100 shadow-emerald-50' : 'bg-white border-amber-100 shadow-amber-50'} shadow-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${isAuthenticated ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              {isAuthenticated ? <CheckCircle className="w-10 h-10" /> : <Cloud className="w-10 h-10" />}
            </div>
            <div>
              <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">
                {isAuthenticated ? 'Đã kết nối Google Workspace' : 'Google Drive Disconnected'}
              </h2>
              <p className="text-slate-500 mt-2 text-lg">
                {isAuthenticated ? `Đồng bộ với: ${userEmail}` : 'Kết nối để bắt đầu quản lý dữ liệu học tập.'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {!isAuthenticated ? (
              <button onClick={onConnect} className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                <Key className="w-5 h-5" /> Kết Nối Drive
              </button>
            ) : (
              <button onClick={onDisconnect} className="px-8 py-4 bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-200 transition">
                Ngắt kết nối
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={onSync}
          disabled={!isAuthenticated || isSyncing}
          className="flex items-center gap-6 p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-lg hover:border-emerald-200 transition group disabled:opacity-50"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            {isSyncing ? <RefreshCw className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
          </div>
          <div className="text-left">
            <div className="font-extrabold text-xl text-slate-900">Đồng Bộ Dữ Liệu</div>
            <div className="text-sm text-slate-500 mt-1">Đẩy 8 tệp chuẩn GDNN lên Drive</div>
          </div>
        </button>
        
        <button
          onClick={onDownloadZip}
          className="flex items-center gap-6 p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-lg hover:border-indigo-200 transition group"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Download className="w-8 h-8" />
          </div>
          <div className="text-left">
            <div className="font-extrabold text-xl text-slate-900">Tải Zip Trọn Bộ</div>
            <div className="text-sm text-slate-500 mt-1">Xuất toàn bộ 8 tệp chuẩn</div>
          </div>
        </button>
      </div>

      {/* File Registry List */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h4 className="font-extrabold text-slate-900 text-xl mb-6">Danh Sách Tệp Đồng Bộ (Lớp: {currentClass})</h4>
        <div className="grid grid-cols-1 gap-4">
          {[
            { key: '01_trich_ngang', label: 'Trích ngang sinh viên' },
            { key: '02_bang_diem', label: 'Bảng điểm chi tiết' },
            { key: '03_ren_luyen', label: 'Kết quả rèn luyện' },
            { key: '04_hoc_phi', label: 'Quản trị học phí' },
            { key: '05_xuong', label: 'Nhật ký xưởng' },
            { key: '06_diem_danh', label: 'Ma trận điểm danh' },
            { key: '07_thu_chi', label: 'Sổ quỹ thu - chi' },
            { key: '08_json', label: 'Snapshot dữ liệu JSON' },
          ].map((item) => {
            const status = fileSyncStatus?.[item.key];
            return (
              <div key={item.key} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  {fileUrls[item.key] && status?.status !== 'error' ? (
                    <a href={fileUrls[item.key]} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-bold text-blue-600 hover:border-blue-300">
                      Mở Sheet <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : status?.status === 'error' ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-red-100 text-xs text-red-600">
                      <XCircle className="w-3 h-3" /> Lỗi
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-400">
                      <AlertCircle className="w-3 h-3" /> Chưa đồng bộ
                    </span>
                  )}
                </div>
                {status && (
                  <div className="mt-2">
                    <ProgressBar progress={status.progress || 0} status={status.status} />
                    {status.message && <p className={`text-xs mt-1 ${status.status === 'error' ? 'text-red-500' : 'text-slate-500'}`}>{status.message}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-slate-500 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
        <span>Lần đồng bộ cuối: <span className="font-bold text-slate-700">{lastSyncTime || 'Chưa thực hiện'}</span></span>
        <span className="flex items-center gap-2 font-medium"><Shield className="w-4 h-4 text-emerald-500" /> Anti-wipe Safety Active</span>
      </div>
    </div>
  );
};
