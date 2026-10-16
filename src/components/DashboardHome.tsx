import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Wallet, 
  FileText, 
  ChevronRight, 
  Wrench,
  Search,
  BookOpen
} from 'lucide-react';
import { ActiveTab, ClassId, Student, StudentGrade, AttendanceRecord, ThemeSettings } from '../types';

interface DashboardHomeProps {
  currentClass: ClassId;
  students: Student[];
  grades: StudentGrade[];
  attendance: AttendanceRecord[];
  setActiveTab: (tab: ActiveTab) => void;
  themeSettings?: ThemeSettings;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  currentClass,
  students,
  grades,
  attendance,
  setActiveTab,
  themeSettings
}) => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const classStudents = students.filter(s => s && s.classId === currentClass);
  const warningStudents = classStudents.filter(s => s && (s.academicStatus === 'Nguy cơ cấm thi' || s.academicStatus === 'Cảnh báo học vụ'));
  const retakeStudents = classStudents.filter(s => s && s.academicStatus === 'Nợ môn');

  return (
    <div className="flex-1 bg-gradient-to-br from-white via-slate-50 to-slate-100 flex flex-col p-4 sm:p-6 overflow-y-auto relative">
      {/* Top Quick Status Pill Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4 select-none">
        <div 
          onClick={() => setActiveTab('students')}
          style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
          className="p-3 rounded-lg border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-blue-400 group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Sĩ số lớp</span>
            <Users className="w-4 h-4 text-blue-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-slate-800">{classStudents.length} <span className="text-xs font-normal text-slate-500">SV</span></div>
          <p className="text-[10px] text-emerald-600 font-medium">100% Nam HSSV kỹ thuật</p>
        </div>

        <div 
          onClick={() => setActiveTab('attendance')}
          style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
          className="p-3 rounded-lg border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-emerald-400 group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Chuyên cần</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-slate-800">96.8%</div>
          <p className="text-[10px] text-slate-500">Đạt chỉ tiêu xưởng</p>
        </div>

        <div 
          onClick={() => setActiveTab('attendance')}
          className="p-3 rounded-lg border border-amber-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-amber-400 bg-amber-50/40 group"
        >
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-semibold uppercase">Cảnh báo vắng</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-amber-700">{warningStudents.length} <span className="text-xs font-normal">SV</span></div>
          <p className="text-[10px] text-amber-600 font-medium">Vắng &gt; 20% mô đun</p>
        </div>

        <div 
          onClick={() => setActiveTab('reports')}
          style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
          className="p-3 rounded-lg border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-purple-400 group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Xét KKHN</span>
            <Award className="w-4 h-4 text-purple-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-slate-800">4 <span className="text-xs font-normal text-slate-500">SV</span></div>
          <p className="text-[10px] text-purple-600 font-medium">GPA ≥ 3.6 & ĐRL ≥ 90</p>
        </div>

        <div 
          onClick={() => setActiveTab('retake')}
          style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
          className="p-3 rounded-lg border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-rose-400 group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Nợ mô đun</span>
            <BookOpen className="w-4 h-4 text-rose-500 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-slate-800">{retakeStudents.length} <span className="text-xs font-normal text-slate-500">SV</span></div>
          <p className="text-[10px] text-rose-600 font-medium">Phụ đạo thi lại</p>
        </div>

        <div 
          onClick={() => setActiveTab('reports')}
          style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
          className="p-3 rounded-lg border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-teal-400 group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Quỹ lớp còn</span>
            <Wallet className="w-4 h-4 text-teal-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-emerald-700">9.50M</div>
          <p className="text-[10px] text-slate-500">Thu chi minh bạch</p>
        </div>
      </div>

      {/* Main Showcase: Automotive Chassis & Powertrain (Matching the screenshot artwork) */}
      <div 
        style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
        className="flex-1 rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center relative min-h-[460px] overflow-hidden"
      >
        {/* Subtle Engineering Grid Background */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(#004e92 1px, transparent 1px)', 
            backgroundSize: '24px 24px' 
          }} 
        />

        {/* Floating Tag Header */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <span 
            style={{ backgroundColor: themeSettings?.tableHeaderBg || '#004e92' }}
            className="text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs"
          >
            {themeSettings?.bannerTitle || 'MÔ HÌNH HỆ DẪN ĐỘNG & KHUNG GẦM Ô TÔ THỰC HÀNH XƯỞNG'}
          </span>
          <span className="hidden sm:inline text-xs text-slate-500 italic">
            (Bấm vào các cụm chi tiết để xem phân công tổ xưởng)
          </span>
        </div>

        {/* If Custom Banner Image Uploaded: Display Image with overlay, Else Display 3D Technical Cutaway */}
        {themeSettings?.bannerUrl ? (
          <div className="relative w-full h-[360px] sm:h-[420px] rounded-xl overflow-hidden shadow-lg border border-slate-200 group flex items-center justify-center bg-slate-900">
            <img 
              src={themeSettings.bannerUrl} 
              alt={themeSettings.bannerTitle || 'Ảnh Bìa Lớp Học'} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-[10px] bg-blue-600 font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                BANNER TÙY BIẾN
              </span>
              <h3 className="text-base sm:text-lg font-bold mt-1 text-white drop-shadow-md">
                {themeSettings.bannerTitle}
              </h3>
            </div>
          </div>
        ) : (
          /* Realistic Technical Cutaway Illustration of Automotive Chassis & Drivetrain */
          <div className="relative w-full max-w-4xl h-[340px] sm:h-[420px] flex items-center justify-center">
            <svg
              viewBox="0 0 1100 680"
              className="w-full h-full object-contain filter drop-shadow-xl select-none"
            >
              <defs>
                <linearGradient id="metalEngine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2c3437" />
                  <stop offset="50%" stopColor="#1a1f22" />
                  <stop offset="100%" stopColor="#0c0e10" />
                </linearGradient>
                <linearGradient id="silverChrome" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e2e8f0" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <linearGradient id="goldBrass" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="exhaustPipe" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
                <linearGradient id="tireRubber" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#27272a" />
                  <stop offset="50%" stopColor="#18181b" />
                  <stop offset="100%" stopColor="#09090b" />
                </linearGradient>
                <filter id="glowShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="8" stdDeviation="6" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Rear Axle Assembly & Rear Suspension */}
              <g id="rear-axle" className="transition-all hover:opacity-90">
                {/* Rear Subframe Crossmember */}
                <path d="M 620 280 L 860 210 L 870 250 L 630 320 Z" fill="url(#silverChrome)" opacity="0.85" />
                <circle cx="830" cy="240" r="28" fill="#475569" stroke="#94a3b8" strokeWidth="4" />
                <rect x="800" y="200" width="60" height="80" rx="10" fill="#334155" />
                {/* Rear Damper & Air Suspension Strut */}
                <rect x="740" y="140" width="30" height="90" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
                <circle cx="755" cy="140" r="16" fill="#f8fafc" stroke="#475569" strokeWidth="3" />
                <path d="M 740 170 Q 755 180 770 170 Q 755 190 740 200 Q 755 210 770 200" fill="none" stroke="#dc2626" strokeWidth="4" />
                
                {/* Rear Right Wheel (Tire + Multi-spoke Rim) */}
                <ellipse cx="640" cy="180" rx="70" ry="120" fill="url(#tireRubber)" transform="rotate(-15 640 180)" />
                <ellipse cx="640" cy="180" rx="42" ry="75" fill="url(#silverChrome)" transform="rotate(-15 640 180)" stroke="#1e293b" strokeWidth="3" />
                {/* Rim Spokes */}
                <line x1="640" y1="110" x2="640" y2="250" stroke="#334155" strokeWidth="6" />
                <line x1="600" y1="150" x2="680" y2="210" stroke="#334155" strokeWidth="6" />
                <line x1="680" y1="150" x2="600" y2="210" stroke="#334155" strokeWidth="6" />

                {/* Rear Left Wheel (Prominent Foreground) */}
                <ellipse cx="800" cy="510" rx="90" ry="150" fill="url(#tireRubber)" transform="rotate(18 800 510)" filter="url(#glowShadow)" />
                <ellipse cx="800" cy="510" rx="55" ry="95" fill="url(#silverChrome)" transform="rotate(18 800 510)" stroke="#0f172a" strokeWidth="4" />
                {/* Brake Rotor & Caliper */}
                <circle cx="800" cy="510" r="48" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="3" />
                <path d="M 780 470 A 45 45 0 0 1 820 470 L 815 488 A 28 28 0 0 0 785 488 Z" fill="#ef4444" />
                {/* Multi-spoke Alloy Hub */}
                <circle cx="800" cy="510" r="22" fill="#1e293b" stroke="#e2e8f0" strokeWidth="3" />
                <line x1="800" y1="420" x2="800" y2="600" stroke="#475569" strokeWidth="7" />
                <line x1="730" y1="460" x2="870" y2="560" stroke="#475569" strokeWidth="7" />
                <line x1="730" y1="560" x2="870" y2="460" stroke="#475569" strokeWidth="7" />
              </g>

              {/* Exhaust System & Catalytic Converter */}
              <g id="exhaust-system">
                <path 
                  d="M 400 450 Q 520 460 580 440 T 700 420 T 780 400 L 820 405" 
                  fill="none" 
                  stroke="url(#exhaustPipe)" 
                  strokeWidth="18" 
                  strokeLinecap="round" 
                />
                {/* Catalytic Muffler 1 */}
                <rect x="530" y="420" width="85" height="42" rx="18" fill="url(#silverChrome)" stroke="#64748b" strokeWidth="2" />
                {/* Rear Resonator */}
                <rect x="690" y="390" width="100" height="48" rx="20" fill="url(#silverChrome)" stroke="#475569" strokeWidth="2" />
              </g>

              {/* Driveshaft / Propeller Shaft */}
              <g id="driveshaft">
                <line x1="430" y1="410" x2="770" y2="280" stroke="#0f172a" strokeWidth="22" strokeLinecap="round" />
                <line x1="430" y1="410" x2="770" y2="280" stroke="#64748b" strokeWidth="14" strokeLinecap="round" />
                {/* Universal Joint */}
                <circle cx="580" cy="350" r="15" fill="#334155" stroke="#cbd5e1" strokeWidth="3" />
              </g>

              {/* Engine & Transmission Powertrain Unit (Center-Left Foreground) */}
              <g id="engine-powertrain" filter="url(#glowShadow)">
                {/* Transmission Housing / Gearbox */}
                <path 
                  d="M 410 380 L 520 370 L 530 440 L 440 460 Z" 
                  fill="url(#metalEngine)" 
                  stroke="#64748b" 
                  strokeWidth="3" 
                />
                <rect x="460" y="380" width="50" height="45" rx="6" fill="#334155" />

                {/* Main Engine Block (V6 / Inline-4 Turbo Cutaway) */}
                <path 
                  d="M 240 370 L 400 350 L 450 480 L 300 520 Z" 
                  fill="url(#metalEngine)" 
                  stroke="#475569" 
                  strokeWidth="4" 
                />
                
                {/* Engine Valve Cover with Manufacturer Styling */}
                <path 
                  d="M 260 375 L 380 360 L 420 450 L 300 480 Z" 
                  fill="#1e293b" 
                  stroke="#94a3b8" 
                  strokeWidth="2" 
                />
                {/* Engine Cover Crest / Rings */}
                <ellipse cx="330" cy="410" rx="24" ry="14" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
                <path d="M 315 410 Q 330 405 345 410" stroke="#ffffff" strokeWidth="2" fill="none" />
                
                {/* Intake Manifold / Runners */}
                <path d="M 360 340 Q 380 320 400 340" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <path d="M 380 345 Q 400 325 420 345" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <path d="M 400 350 Q 420 330 440 350" fill="none" stroke="#e2e8f0" strokeWidth="8" />

                {/* Alternator & Serpentine Belt Pulley */}
                <circle cx="280" cy="490" r="24" fill="#64748b" stroke="#cbd5e1" strokeWidth="3" />
                <circle cx="280" cy="490" r="10" fill="#0f172a" />
                <circle cx="250" cy="440" r="18" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />
                <circle cx="330" cy="510" r="20" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />
                <path d="M 280 466 L 250 422 L 330 490 Z" fill="none" stroke="#09090b" strokeWidth="5" />

                {/* Oil Sump / Pan */}
                <path d="M 310 520 L 420 490 L 410 540 L 330 550 Z" fill="#09090b" stroke="#334155" strokeWidth="2" />
              </g>

              {/* Front Wheel & Steering / Suspension Assembly */}
              <g id="front-wheel">
                {/* Front Left Wheel */}
                <ellipse cx="420" cy="620" rx="85" ry="140" fill="url(#tireRubber)" transform="rotate(35 420 620)" filter="url(#glowShadow)" />
                <ellipse cx="420" cy="620" rx="50" ry="90" fill="url(#silverChrome)" transform="rotate(35 420 620)" stroke="#0f172a" strokeWidth="4" />
                {/* Brake Rotor & Caliper */}
                <circle cx="420" cy="620" r="44" fill="#cbd5e1" stroke="#64748b" strokeWidth="3" />
                <path d="M 410 580 A 40 40 0 0 1 450 590 L 440 605 A 25 25 0 0 0 410 600 Z" fill="#ef4444" />
                {/* Multi-spoke Rim */}
                <circle cx="420" cy="620" r="20" fill="#1e293b" stroke="#e2e8f0" strokeWidth="3" />
                <line x1="420" y1="535" x2="420" y2="705" stroke="#334155" strokeWidth="6" />
                <line x1="360" y1="575" x2="480" y2="665" stroke="#334155" strokeWidth="6" />
                <line x1="480" y1="575" x2="360" y2="665" stroke="#334155" strokeWidth="6" />

                {/* Suspension Strut & Spring */}
                <rect x="360" y="300" width="22" height="70" rx="6" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
                <path d="M 355 310 Q 370 320 385 310 Q 370 330 355 340 Q 370 350 385 340" fill="none" stroke="#2563eb" strokeWidth="4" />
              </g>

              {/* High-Voltage & Control Wire Harness (Red, Blue, Purple) */}
              <g id="wiring-harness">
                {/* Red Main HV Cable */}
                <path 
                  d="M 370 360 Q 420 340 480 390 T 560 380 T 650 310 T 730 250" 
                  fill="none" 
                  stroke="#dc2626" 
                  strokeWidth="5" 
                  strokeDasharray="14,2" 
                />
                {/* Blue CAN-Bus Cable */}
                <path 
                  d="M 330 430 Q 400 480 500 490 T 630 480 T 750 430" 
                  fill="none" 
                  stroke="#2563eb" 
                  strokeWidth="4" 
                />
                {/* Electronic Control Unit (ECU) in Rear */}
                <rect x="730" y="100" width="55" height="40" rx="6" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="745" cy="115" r="4" fill="#22c55e" />
                <circle cx="760" cy="115" r="4" fill="#eab308" />
              </g>

              {/* Interactive Hotspot Targets */}
              {/* 1. Engine Block EFI */}
              <g 
                className="cursor-pointer group"
                onClick={() => setActiveHotspot(activeHotspot === 'engine' ? null : 'engine')}
              >
                <circle cx="330" cy="440" r="22" fill="#ef4444" fillOpacity="0.8" className="animate-pulse" />
                <circle cx="330" cy="440" r="14" fill="#ffffff" />
                <text x="330" y="445" textAnchor="middle" fill="#dc2626" fontSize="13" fontWeight="bold">1</text>
              </g>

              {/* 2. Transmission Gearbox */}
              <g 
                className="cursor-pointer group"
                onClick={() => setActiveHotspot(activeHotspot === 'transmission' ? null : 'transmission')}
              >
                <circle cx="480" cy="410" r="20" fill="#3b82f6" fillOpacity="0.8" className="animate-pulse" />
                <circle cx="480" cy="410" r="13" fill="#ffffff" />
                <text x="480" y="415" textAnchor="middle" fill="#2563eb" fontSize="13" fontWeight="bold">2</text>
              </g>

              {/* 3. Front Suspension & Chassis Lift */}
              <g 
                className="cursor-pointer group"
                onClick={() => setActiveHotspot(activeHotspot === 'suspension' ? null : 'suspension')}
              >
                <circle cx="430" cy="570" r="20" fill="#10b981" fillOpacity="0.8" className="animate-pulse" />
                <circle cx="430" cy="570" r="13" fill="#ffffff" />
                <text x="430" y="575" textAnchor="middle" fill="#059669" fontSize="13" fontWeight="bold">3</text>
              </g>

              {/* 4. CAN-Bus & Scan Tool OBD-II */}
              <g 
                className="cursor-pointer group"
                onClick={() => setActiveHotspot(activeHotspot === 'diag' ? null : 'diag')}
              >
                <circle cx="750" cy="120" r="20" fill="#8b5cf6" fillOpacity="0.8" className="animate-pulse" />
                <circle cx="750" cy="120" r="13" fill="#ffffff" />
                <text x="750" y="125" textAnchor="middle" fill="#7c3aed" fontSize="13" fontWeight="bold">4</text>
              </g>
            </svg>
          </div>
        )}

        {/* Hotspot Description Overlay Card */}
        {activeHotspot && !themeSettings?.bannerUrl && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-blue-200 z-20 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {activeHotspot === 'engine' && 'Tổ 2 • Bàn Tháo Lắp Động Cơ EFI'}
                  {activeHotspot === 'transmission' && 'Tổ 3 • Hộp Số Tự Động AT/CVT'}
                  {activeHotspot === 'suspension' && 'Tổ 1 • Cầu Nâng 2 Trụ & Khung Gầm'}
                  {activeHotspot === 'diag' && 'Tổ 4 • Điện Thân Xe & OBD-II Scan Tool'}
                </span>
                <h4 className="font-bold text-slate-800 text-sm mt-1">
                  {activeHotspot === 'engine' && 'Động cơ xăng phun điện tử DOHC & Hệ thống làm mát'}
                  {activeHotspot === 'transmission' && 'Cơ cấu biến mô thủy lực và bánh răng hành tinh'}
                  {activeHotspot === 'suspension' && 'Quy trình nâng hạ cầu 2 trụ & Bảo dưỡng hệ thống treo'}
                  {activeHotspot === 'diag' && 'Chẩn đoán giao thức CAN-bus, đọc mã lỗi DTC, Data Stream'}
                </h4>
              </div>
              <button 
                onClick={() => setActiveHotspot(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {activeHotspot === 'engine' && 'Thực hành mô đun MĐ06: Tháo lắp nắp quy lát, đo độ mòn xilanh bằng đồng hồ so, kiểm tra khe hở xéc măng và trục khuỷu.'}
              {activeHotspot === 'transmission' && 'Thực hành mô đun MĐ08: Tháo kiểm tra bộ ly hợp ướt, đo áp suất đường dầu thủy lực, thay thế lọc dầu hộp số tự động.'}
              {activeHotspot === 'suspension' && 'Thực hành mô đun MĐ08: Kiểm tra rô-tuyn lái, bạc lót cao su chữ A, xả gió hệ thống phanh dầu ABS, cân mâm bấm chì.'}
              {activeHotspot === 'diag' && 'Thực hành mô đun MĐ09: Kết nối giắc OBD-II 16 chân, kích hoạt cơ cấu chấp hành bơm xăng, kim phun, phân tích tín hiệu cảm biến CKP/CMP.'}
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Bảo hộ yêu cầu: Giày mũi sắt + Kính</span>
              <button 
                onClick={() => setActiveTab('attendance')}
                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
              >
                Nhật ký xưởng <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Legend at Bottom of Canvas */}
        {!themeSettings?.bannerUrl && (
          <div className="w-full flex items-center justify-center gap-2 sm:gap-6 pt-2 text-[11px] sm:text-xs text-slate-600 font-medium flex-wrap">
            <button 
              onClick={() => setActiveHotspot('suspension')}
              className="flex items-center gap-1.5 hover:text-emerald-700 cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Tổ 1: Cầu nâng & Gầm</span>
            </button>
            <button 
              onClick={() => setActiveHotspot('engine')}
              className="flex items-center gap-1.5 hover:text-rose-700 cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Tổ 2: Động cơ EFI</span>
            </button>
            <button 
              onClick={() => setActiveHotspot('transmission')}
              className="flex items-center gap-1.5 hover:text-blue-700 cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Tổ 3: Hộp số AT/CVT</span>
            </button>
            <button 
              onClick={() => setActiveHotspot('diag')}
              className="flex items-center gap-1.5 hover:text-purple-700 cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span>Tổ 4: Điện xe & Scan tool</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Quick Feature Launchers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {/* Module 1: Chuyên cần & Cảnh báo cấm thi */}
        <div 
          onClick={() => setActiveTab('attendance')}
          style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
          className="p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-blue-400 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800 uppercase">Điểm danh & Điểm rèn luyện</h4>
            <p className="text-[11px] text-slate-500">Ma trận P/L/A/LATE & Tự động cảnh báo cấm thi vắng &gt;20%</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Module 2: Hồ sơ 23 trường & Miễn giảm 70% */}
        <div 
          onClick={() => setActiveTab('students')}
          style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
          className="p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-blue-400 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800 uppercase">Hồ sơ trích ngang 23 trường</h4>
            <p className="text-[11px] text-slate-500">Áp dụng Nghị định 238/2025/NĐ-CP (Miễn giảm 70% học phí)</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Module 3: Biểu mẫu hành chính & Sao lưu */}
        <div 
          onClick={() => setActiveTab('backup-forms')}
          style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
          className="p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-blue-400 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800 uppercase">Biểu mẫu chuẩn NĐ 30/2020</h4>
            <p className="text-[11px] text-slate-500">Biên bản cấm thi, Giấy thực tập, Đơn miễn 70% học phí & Mẫu Zalo</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
};
