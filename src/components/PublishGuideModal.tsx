import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  Sparkles, 
  Globe, 
  QrCode, 
  Download,
  AlertTriangle,
  Info
} from 'lucide-react';

interface PublishGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
}

export const PublishGuideModal: React.FC<PublishGuideModalProps> = ({
  isOpen,
  onClose,
  appName = 'Hệ thống Quản lý Sinh viên Điện tử - Khoa Công nghệ Ô tô'
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'share_link' | 'how_to_use' | 'pwa_install' | 'free_hosts'>('share_link');

  if (!isOpen) return null;

  // Đường link chia sẻ thực tế đã được Google Cloud Run triển khai sẵn của AI Studio
  const sharedUrl = 'https://ais-pre-s6ov3toflrj3jf6f3awiim-229180307012.asia-southeast1.run.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(sharedUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 px-5 py-4 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-yellow-300 shadow-inner">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Xuất Bản & Chia Sẻ Ứng Dụng
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500 text-white shadow-xs">
                  100% MIỄN PHÍ - KHÔNG CẦN HÓA ĐƠN
                </span>
              </div>
              <p className="text-xs text-sky-100/90 mt-0.5">
                Chia sẻ đường link trực tiếp cho Ban Giám hiệu, Giảng viên, Sinh viên và Phụ huynh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông báo quan trọng giải thích việc KHÔNG CẦN HÓA ĐƠN */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-start gap-3 shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950">
            <strong className="text-emerald-900 font-bold block">
              ✓ Bạn KHÔNG CẦN thiết lập hóa đơn (Billing / Thẻ tín dụng):
            </strong>
            <span className="text-slate-700">
              Nút &quot;Deploy&quot; trên AI Studio chỉ hỏi hóa đơn khi bạn muốn đưa sang dự án Google Cloud cá nhân trả phí. 
              Ứng dụng của bạn <strong>đã được Google AI Studio cấp sẵn đường link trực tuyến 24/7 hoàn toàn miễn phí</strong> bên dưới. Bạn chỉ cần sao chép link và gửi đi là sử dụng được ngay!
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-4 bg-slate-50 text-xs font-bold text-slate-600 shrink-0 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('share_link')}
            className={`px-4 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'share_link'
                ? 'border-blue-600 text-blue-700 bg-white font-extrabold shadow-2xs'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>1. Link Chia Sẻ Trực Tiếp & Mã QR</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa_install')}
            className={`px-4 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pwa_install'
                ? 'border-blue-600 text-blue-700 bg-white font-extrabold shadow-2xs'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>2. Cài Đặt Làm App (Điện thoại & PC)</span>
          </button>

          <button
            onClick={() => setActiveTab('how_to_use')}
            className={`px-4 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'how_to_use'
                ? 'border-blue-600 text-blue-700 bg-white font-extrabold shadow-2xs'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Info className="w-4 h-4 text-indigo-600" />
            <span>3. Hướng Dẫn Phân Phối Người Dùng</span>
          </button>

          <button
            onClick={() => setActiveTab('free_hosts')}
            className={`px-4 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'free_hosts'
                ? 'border-blue-600 text-blue-700 bg-white font-extrabold shadow-2xs'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4 text-amber-600" />
            <span>4. Tùy Chọn Tên Miền Riêng (Miễn Phí)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-800">
          
          {/* TAB 1: LINK CHIA SẺ TRỰC TIẾP & QR CODE */}
          {activeTab === 'share_link' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-blue-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-950 text-sm flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>Đường Link Trực Tuyến Đang Hoạt Động (Shared App URL):</span>
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                    Online 24/7 • Miễn phí
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={sharedUrl}
                    className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-slate-800 font-mono text-xs select-all focus:outline-hidden"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Đã sao chép link!' : 'Sao chép link'}</span>
                  </button>
                  <a
                    href={sharedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    <ExternalLink className="w-4 h-4 text-yellow-300" />
                    <span>Mở thử tab mới ↗</span>
                  </a>
                </div>

                <p className="text-[11px] text-slate-600">
                  💡 <strong>Cách chia sẻ:</strong> Bạn có thể gửi đường link này qua nhóm Zalo lớp, Zalo khoa, email hoặc nhúng vào cổng thông tin đào tạo của nhà trường.
                </p>
              </div>

              {/* Mã QR Code để quét điện thoại */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <img
                    src={qrCodeUrl}
                    alt="Mã QR Truy Cập Ứng Dụng"
                    className="w-48 h-48 object-contain rounded-lg"
                  />
                  <span className="text-[11px] text-slate-500 font-semibold mt-2 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-blue-600" />
                    Quét camera hoặc Zalo để mở trên điện thoại
                  </span>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm">
                    📱 Quét mã QR để mở nhanh trên di động:
                  </h4>
                  <ul className="space-y-2 text-slate-600 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                      <span>Mở ứng dụng <strong>Camera</strong> hoặc tính năng quét mã QR trên <strong>Zalo</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                      <span>Hướng camera vào mã QR bên cạnh để nhận diện liên kết.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                      <span>Nhấn vào thông báo để mở ngay chương trình mà không cần cài đặt gì thêm.</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      onClick={handleCopyLink}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 text-xs transition"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copiedLink ? 'Đã sao chép link thành công!' : 'Sao Chép Link Gửi Zalo / Email'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CÀI ĐẶT LÀM APP (PWA) */}
          {activeTab === 'pwa_install' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  <span>Biến chương trình thành App riêng trên Máy Tính và Điện Thoại (PWA)</span>
                </h4>
                <p className="text-slate-600 text-xs">
                  Không cần thông qua Google Play hay App Store, không mất phí duy trì, chạy toàn màn hình mượt mà như phần mềm cài đặt riêng.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <span>Cài đặt trên Máy Tính (Windows / MacOS / Chrome / Edge):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px]">
                    <li>Mở đường link chia sẻ bằng trình duyệt Google Chrome hoặc Microsoft Edge.</li>
                    <li>Nhìn lên góc phải thanh địa chỉ, nhấn vào biểu tượng <strong>Cài đặt ứng dụng</strong> (hình máy tính nhỏ có dấu mũi tên xuống).</li>
                    <li>Nhấn <strong>&quot;Cài đặt&quot; (Install)</strong>. Ứng dụng sẽ xuất hiện biểu tượng riêng trên Desktop.</li>
                  </ol>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Cài đặt trên Điện Thoại (Android / iOS iPhone):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px]">
                    <li><strong>iPhone (Safari):</strong> Nhấn nút Chia sẻ (hình vuông có mũi tên lên) ➜ Chọn <strong>&quot;Thêm vào màn hình chính&quot; (Add to Home Screen)</strong>.</li>
                    <li><strong>Android (Chrome):</strong> Nhấn dấu 3 chấm góc phải ➜ Chọn <strong>&quot;Cài đặt ứng dụng&quot;</strong> hoặc <strong>&quot;Thêm vào màn hình chính&quot;</strong>.</li>
                    <li>Chương trình sẽ có icon như một ứng dụng điện thoại thực thụ.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HƯỚNG DẪN PHÂN PHỐI NGƯỜI DÙNG */}
          {activeTab === 'how_to_use' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                <h4 className="font-bold text-indigo-950 text-sm">
                  Cơ chế Phân Quyền An Toàn Cho 3 Nhóm Đối Tượng Khi Dùng Chung 1 Link:
                </h4>
                <p className="text-slate-600 text-xs">
                  Dù dùng chung 1 đường link duy nhất, hệ thống tự động phân tách quyền chặt chẽ theo tài khoản đăng nhập:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <span className="px-2 py-0.5 bg-amber-600 text-white font-bold rounded text-[10px] shrink-0 mt-0.5">Admin (Thầy Dũng)</span>
                  <div className="text-slate-700 text-xs">
                    Toàn quyền quản trị học vụ, quản lý tài khoản người dùng, đổi giao diện, cấu hình đồng bộ Google Drive và xuất biên bản hành chính.
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                  <span className="px-2 py-0.5 bg-blue-600 text-white font-bold rounded text-[10px] shrink-0 mt-0.5">Giảng viên / GVCN</span>
                  <div className="text-slate-700 text-xs">
                    Được xem và quản lý lớp được phân công, chấm điểm rèn luyện, nhập điểm kiểm tra mô đun, theo dõi xưởng thực hành (bị ẩn các mục cấu hình hệ thống nhạy cảm).
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                  <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded text-[10px] shrink-0 mt-0.5">Sinh viên & Phụ huynh</span>
                  <div className="text-slate-700 text-xs">
                    Chỉ xem thông tin cá nhân, tra cứu điểm CPA, theo dõi chuyên cần và vi phạm cấm thi. Ban cán sự lớp được mở quyền điểm danh trực tuyến.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TÙY CHỌN TÊN MIỀN RIÊNG */}
          {activeTab === 'free_hosts' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
                <h4 className="font-bold text-sky-950 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-700" />
                  <span>Nếu Bạn Muốn Gắn Tên Miền Riêng (Miễn Phí 100% Không Cần Thẻ Tín Dụng)</span>
                </h4>
                <p className="text-slate-600 text-xs">
                  Ngoài đường link có sẵn của Google AI Studio, bạn có thể triển khai mã nguồn này lên các nền tảng máy chủ tĩnh miễn phí hàng đầu thế giới:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-black"></span>
                    <span>Vercel (Khuyên dùng)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Miễn phí vĩnh viễn, tốc độ cực nhanh, cho phép gắn tên miền riêng của trường (ví dụ: <code>qldt.caodangoto.edu.vn</code>).
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>Netlify</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Kéo thả thư mục <code>dist</code> lên là chạy ngay, hỗ trợ chứng chỉ bảo mật HTTPS SSL miễn phí 100%.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    <span>GitHub Pages</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Lưu trữ mã nguồn mở và chạy trực tiếp từ kho lưu trữ GitHub hoàn toàn miễn phí không giới hạn thời gian.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-600 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Đã xác thực không phát sinh chi phí hoặc hóa đơn Google Cloud.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 text-xs transition cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Đã sao chép link!' : 'Sao Chép Link Xuất Bản'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
