import React, { useState, useEffect } from 'react';
import { 
  ActiveTab, 
  AcademicYear, 
  ClassId, 
  ThemeSettings, 
  ClassItem, 
  UserAccount, 
  Student, 
  SubjectModule, 
  StudentGrade, 
  AttendanceRecord, 
  RenLuyenCriteria, 
  FundTransaction, 
  WorkshopSafetyLog, 
  UnitInfoSettings,
  AutoSyncInfo 
} from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DashboardHome } from './components/DashboardHome';
import { StudentProfilesModule } from './components/StudentProfilesModule';
import { GradeManagementModule } from './components/GradeManagementModule';
import { AttendanceAndRenLuyenModule } from './components/AttendanceAndRenLuyenModule';
import { RetakeAndRemedialModule } from './components/RetakeAndRemedialModule';
import { ReportsAndFundModule } from './components/ReportsAndFundModule';
import { BackupAndFormsModule } from './components/BackupAndFormsModule';
import { StudentPortalModule } from './components/StudentPortalModule';
import { OrganizationModule } from './components/OrganizationModule';
import { UnitInfoModule } from './components/UnitInfoModule';
import { UnitInfoModal } from './components/UnitInfoModal';
import { googleDriveSyncService } from './services/googleDriveService';
import { AuthLoginScreen } from './components/AuthLoginScreen';
import { ThemeSetupModal } from './components/ThemeSetupModal';
import { UserManagementModal } from './components/UserManagementModal';
import { CurriculumFrameworkModal } from './components/CurriculumFrameworkModal';
import { QuickToolsModal } from './components/QuickToolsModal';
import { DriveSyncModal } from './components/DriveSyncModal';
import { PublishGuideModal } from './components/PublishGuideModal';
import { ParsedImportData } from './services/dataImportService';
import { DEFAULT_THEME_SETTINGS, DEFAULT_UNIT_INFO_SETTINGS } from './types';
import { INITIAL_CLASSES, INITIAL_MODULES, INITIAL_STUDENTS, INITIAL_GRADES, INITIAL_ATTENDANCE, INITIAL_REN_LUYEN, INITIAL_FUND_TRANSACTIONS, INITIAL_WORKSHOP_LOGS } from './data/mockData';
import { safeLocalStorage } from './utils/storage';
import { getMediaFromIndexedDB, saveMediaToIndexedDB, deleteMediaFromIndexedDB } from './utils/mediaStorage';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [academicYear, setAcademicYear] = useState<AcademicYear>(() => {
    const saved = safeLocalStorage.get('oto_academic_year');
    return (saved as AcademicYear) || '2025 - 2028';
  });

  const [currentClass, setCurrentClass] = useState<ClassId>(() => {
    const saved = safeLocalStorage.get('oto_current_class');
    return (saved as ClassId) || 'CĐK19.2-OT1.CLC';
  });

  useEffect(() => {
    safeLocalStorage.set('oto_academic_year', academicYear);
  }, [academicYear]);

  useEffect(() => {
    safeLocalStorage.set('oto_current_class', currentClass);
  }, [currentClass]);
  
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    try {
      const saved = safeLocalStorage.get('oto_app_theme_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error('Error loading theme settings from storage:', e);
    }
    return DEFAULT_THEME_SETTINGS;
  });

  // Khôi phục đồng bộ logo và ảnh banner từ IndexedDB để không bao giờ bị mất khi tải lại trang
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [savedLogo, savedBanner] = await Promise.all([
          getMediaFromIndexedDB('theme_logo'),
          getMediaFromIndexedDB('theme_banner')
        ]);
        if (!isMounted) return;

        let needsUpdate = false;
        let nextLogo = themeSettings.logoUrl;
        let nextBanner = themeSettings.bannerUrl;

        if (savedLogo && savedLogo !== themeSettings.logoUrl) {
          nextLogo = savedLogo;
          needsUpdate = true;
        }
        if (savedBanner && savedBanner !== themeSettings.bannerUrl) {
          nextBanner = savedBanner;
          needsUpdate = true;
        }

        if (needsUpdate) {
          setThemeSettings(prev => ({
            ...prev,
            logoUrl: nextLogo || prev.logoUrl,
            bannerUrl: nextBanner || prev.bannerUrl
          }));
        }
      } catch (err) {
        console.warn('IndexedDB media restore error:', err);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    try {
      safeLocalStorage.set('oto_app_theme_settings', JSON.stringify(themeSettings));
    } catch (e) {
      console.warn('LocalStorage quota warning when saving theme settings:', e);
    }

    // Luôn bảo lưu media vào IndexedDB
    if (themeSettings.logoUrl) {
      saveMediaToIndexedDB('theme_logo', themeSettings.logoUrl);
    } else {
      deleteMediaFromIndexedDB('theme_logo');
    }

    if (themeSettings.bannerUrl) {
      saveMediaToIndexedDB('theme_banner', themeSettings.bannerUrl);
    } else {
      deleteMediaFromIndexedDB('theme_banner');
    }
  }, [themeSettings]);

  const [unitSettings, setUnitSettings] = useState<UnitInfoSettings>(() => {
    const saved = safeLocalStorage.get('oto_unit_info_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {
        console.error('Error loading unit info from storage:', e);
      }
    }
    return DEFAULT_UNIT_INFO_SETTINGS;
  });

  useEffect(() => {
    safeLocalStorage.set('oto_unit_info_settings', JSON.stringify(unitSettings));
  }, [unitSettings]);

  const [classes, setClasses] = useState<ClassItem[]>(() => {
    const saved = safeLocalStorage.get('oto_classes_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading classes from storage:', e);
      }
    }
    return INITIAL_CLASSES;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = safeLocalStorage.get('oto_students_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error loading students from storage:', e);
      }
    }
    return INITIAL_STUDENTS;
  });

  useEffect(() => {
    safeLocalStorage.set('oto_students_list', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    safeLocalStorage.set('oto_classes_list', JSON.stringify(classes));
  }, [classes]);

  const [modules, setModules] = useState<SubjectModule[]>(() => {
    const saved = safeLocalStorage.get('oto_modules_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading modules from storage:', e);
      }
    }
    return INITIAL_MODULES;
  });

  useEffect(() => {
    safeLocalStorage.set('oto_modules_list', JSON.stringify(modules));
  }, [modules]);

  const [grades, setGrades] = useState<StudentGrade[]>(() => {
    const saved = safeLocalStorage.get('oto_grades_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading grades from storage:', e);
      }
    }
    return INITIAL_GRADES;
  });

  useEffect(() => {
    safeLocalStorage.set('oto_grades_list', JSON.stringify(grades));
  }, [grades]);

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = safeLocalStorage.get('oto_attendance_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading attendance from storage:', e);
      }
    }
    return INITIAL_ATTENDANCE;
  });

  useEffect(() => {
    safeLocalStorage.set('oto_attendance_list', JSON.stringify(attendance));
  }, [attendance]);

  const [renLuyen, setRenLuyen] = useState<RenLuyenCriteria[]>(() => {
    const saved = safeLocalStorage.get('oto_ren_luyen_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading ren luyen from storage:', e);
      }
    }
    return INITIAL_REN_LUYEN;
  });

  useEffect(() => {
    safeLocalStorage.set('oto_ren_luyen_list', JSON.stringify(renLuyen));
  }, [renLuyen]);

  const [fundTransactions, setFundTransactions] = useState<FundTransaction[]>(() => {
    const saved = safeLocalStorage.get('oto_fund_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading funds from storage:', e);
      }
    }
    return INITIAL_FUND_TRANSACTIONS;
  });

  useEffect(() => {
    safeLocalStorage.set('oto_fund_transactions', JSON.stringify(fundTransactions));
  }, [fundTransactions]);

  const [workshopLogs, setWorkshopLogs] = useState<WorkshopSafetyLog[]>(() => {
    const saved = safeLocalStorage.get('oto_workshop_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading workshop logs from storage:', e);
      }
    }
    return INITIAL_WORKSHOP_LOGS;
  });

  useEffect(() => {
    safeLocalStorage.set('oto_workshop_logs', JSON.stringify(workshopLogs));
  }, [workshopLogs]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // -------------------------------------------------------------
  // BỘ TỰ ĐỘNG ĐỒNG BỘ CƠ SỞ DỮ LIỆU & LƯU VÀO GOOGLE DRIVE SAU 2 GIÂY
  // -------------------------------------------------------------
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(() => {
    const saved = safeLocalStorage.get('oto_drive_auto_sync_enabled');
    return saved !== null ? saved === 'true' : true; // Mặc định bật
  });

  const [autoSyncDebounceMs, setAutoSyncDebounceMs] = useState<number>(() => {
    const saved = safeLocalStorage.get('oto_drive_auto_sync_debounce_ms');
    return saved ? parseInt(saved, 10) || 2000 : 2000; // Mặc định 2 giây (2000ms)
  });

  const [autoSyncStatus, setAutoSyncStatus] = useState<'idle' | 'pending' | 'syncing' | 'synced' | 'local_saved' | 'error'>('idle');
  const [autoSyncMessage, setAutoSyncMessage] = useState<string>('Sẵn sàng tự động lưu và đồng bộ Google Drive sau 2 giây khi có sửa đổi');
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return safeLocalStorage.get('oto_drive_last_sync_time') || '';
  });

  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = React.useRef<boolean>(true);
  const isSyncingRef = React.useRef<boolean>(false);

  const executeAutoSync = async () => {
    if (!isAutoSyncEnabled) return;
    if (isSyncingRef.current) return;

    if (!students || students.length === 0) {
      setAutoSyncStatus('local_saved');
      setAutoSyncMessage('🛡️ [Safety Guard]: Danh sách sinh viên trống, hệ thống giữ an toàn và không đẩy file rỗng lên Drive.');
      return;
    }

    isSyncingRef.current = true;
    setAutoSyncStatus('syncing');
    setAutoSyncMessage('⚡ Đang tự động đồng bộ và lưu dữ liệu vào thư mục Google Drive...');

    // Nếu chưa đăng nhập Google Drive thực tế, lưu dữ liệu cơ sở cục bộ an toàn
    if (!googleDriveSyncService.isRealToken()) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setAutoSyncStatus('local_saved');
      setAutoSyncMessage(`💾 Đã lưu dữ liệu cơ sở an toàn lúc ${timeStr} (Nhấn "SAO LƯU" đăng nhập Drive để tự động đẩy mây)`);
      isSyncingRef.current = false;
      return;
    }

    try {
      const activeClassObj = classes.find(c => c.id === currentClass);
      const className = activeClassObj?.name || 'Công nghệ Ô tô';
      const teacherName = unitSettings?.advisorName || currentUser?.fullName || 'ThS. Nguyễn Chí Dũng';

      const result = await googleDriveSyncService.syncClassDataToDrive(
        currentClass,
        className,
        teacherName,
        students,
        grades,
        attendance,
        renLuyen,
        fundTransactions,
        workshopLogs,
        unitSettings
      );

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setLastSyncTime(timeStr);
      safeLocalStorage.set('oto_drive_last_sync_time', timeStr);
      setAutoSyncStatus('synced');
      setAutoSyncMessage(`✅ Đã tự động lưu vào Google Drive lúc ${timeStr}`);
    } catch (err: any) {
      console.warn('Lỗi khi tự động đồng bộ Google Drive:', err);
      setAutoSyncStatus('error');
      setAutoSyncMessage(`⚠️ Lỗi tự động đẩy Drive: ${err?.message || 'Không thể kết nối'}. Dữ liệu đã lưu an toàn tại máy.`);
    } finally {
      isSyncingRef.current = false;
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isAutoSyncEnabled) return;

    setAutoSyncStatus('pending');
    setAutoSyncMessage('⏳ Phát hiện thay đổi dữ liệu... Tự động lưu và đồng bộ sau 2 giây');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeAutoSync();
    }, autoSyncDebounceMs); // 2000ms

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    students,
    grades,
    attendance,
    renLuyen,
    fundTransactions,
    workshopLogs,
    classes,
    unitSettings,
    currentClass,
    academicYear,
    isAutoSyncEnabled,
    autoSyncDebounceMs
  ]);

  const handleToggleAutoSync = (enabled: boolean) => {
    setIsAutoSyncEnabled(enabled);
    safeLocalStorage.set('oto_drive_auto_sync_enabled', String(enabled));
    if (!enabled) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      setAutoSyncStatus('idle');
      setAutoSyncMessage('Đã tạm dừng tự động đồng bộ.');
    } else {
      setAutoSyncMessage('Đã bật tự động đồng bộ sau 2 giây.');
    }
  };

  const handleSetDebounceMs = (ms: number) => {
    setAutoSyncDebounceMs(ms);
    safeLocalStorage.set('oto_drive_auto_sync_debounce_ms', String(ms));
  };

  const handleTriggerManualSync = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    executeAutoSync();
  };

  const autoSyncInfo: AutoSyncInfo = {
    enabled: isAutoSyncEnabled,
    debounceMs: autoSyncDebounceMs,
    status: autoSyncStatus,
    lastSyncTime,
    syncMessage: autoSyncMessage,
    onToggleAutoSync: handleToggleAutoSync,
    onSetDebounceMs: handleSetDebounceMs,
    onTriggerNow: handleTriggerManualSync
  };

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = safeLocalStorage.get('oto_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading user from storage:', e);
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      safeLocalStorage.set('oto_current_user', JSON.stringify(currentUser));
    } else {
      safeLocalStorage.remove('oto_current_user');
    }
  }, [currentUser]);

  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = safeLocalStorage.get('oto_users_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading users from storage:', e);
    }
    return [{
      id: 'admin-1',
      email: 'nguyenchidung1278@gmail.com',
      password: 'admin',
      fullName: 'ThS. Nguyễn Chí Dũng',
      phone: '0865.074.668',
      role: 'admin',
      status: 'active',
      assignedClassIds: ['*'],
      canTakeAttendance: true,
      createdAt: new Date().toISOString()
    }];
  });

  useEffect(() => {
    safeLocalStorage.set('oto_users_list', JSON.stringify(users));
  }, [users]);

  const [isUnitInfoModalOpen, setIsUnitInfoModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [isQuickToolsOpen, setIsQuickToolsOpen] = useState(false);
  const [isDriveSyncOpen, setIsDriveSyncOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedSystemForCurriculum, setSelectedSystemForCurriculum] = useState<string>('HỆ CAO ĐẲNG CHÍNH QUY');

  const handleAddStudent = (s: Student) => {
    setStudents(prev => [s, ...prev.filter(item => item.id !== s.id)]);
  };

  const handleUpdateStudent = (s: Student) => {
    setStudents(prev => prev.map(item => item.id === s.id ? s : item));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(item => item.id !== id));
    setGrades(prev => prev.filter(g => g.studentId !== id));
    setAttendance(prev => prev.filter(a => a.studentId !== id));
    setRenLuyen(prev => prev.filter(r => r.studentId !== id));
  };

  const handleBulkDeleteStudents = (ids: string[]) => {
    const idSet = new Set(ids);
    setStudents(prev => prev.filter(item => !idSet.has(item.id)));
    setGrades(prev => prev.filter(g => !idSet.has(g.studentId)));
    setAttendance(prev => prev.filter(a => !idSet.has(a.studentId)));
    setRenLuyen(prev => prev.filter(r => !idSet.has(r.studentId)));
  };

  const handleClearClassStudents = () => {
    setStudents(prev => {
      const classStudentIds = new Set(
        prev.filter(item => item.classId === currentClass || String(item.classId).trim() === String(currentClass).trim()).map(s => s.id)
      );
      setGrades(gPrev => gPrev.filter(g => !classStudentIds.has(g.studentId)));
      setAttendance(aPrev => aPrev.filter(a => !classStudentIds.has(a.studentId)));
      setRenLuyen(rPrev => rPrev.filter(r => !classStudentIds.has(r.studentId)));
      return prev.filter(item => item.classId !== currentClass && String(item.classId).trim() !== String(currentClass).trim());
    });
  };

  const handleClearAllStudents = () => {
    setStudents([]);
    setGrades([]);
    setAttendance([]);
    setRenLuyen([]);
    safeLocalStorage.set('oto_students_list', JSON.stringify([]));
  };

  const handleBulkAddStudents = (newStudents: Student[], replaceClass?: boolean) => {
    setStudents(prev => {
      let base = replaceClass 
        ? prev.filter(s => s.classId !== currentClass && String(s.classId).trim() !== String(currentClass).trim()) 
        : [...prev];
      const newIds = new Set(newStudents.map(s => s.id));
      base = base.filter(s => !newIds.has(s.id));
      return [...newStudents, ...base];
    });
  };

  const handleReorderStudents = (reorderedClassStudents: Student[]) => {
    setStudents(prev => {
      const otherStudents = prev.filter(s => s.classId !== currentClass && String(s.classId).trim() !== String(currentClass).trim());
      return [...reorderedClassStudents, ...otherStudents];
    });
  };

  const handleRestoreInitialStudents = () => {
    setStudents(INITIAL_STUDENTS);
  };

  const handleImportData = (parsed: ParsedImportData) => {
    if (parsed.students && parsed.students.length > 0) {
      handleBulkAddStudents(parsed.students, true);
    }
    if (parsed.grades && parsed.grades.length > 0) {
      setGrades(parsed.grades);
    }
    if (parsed.attendance && parsed.attendance.length > 0) {
      setAttendance(parsed.attendance);
    }
    if (parsed.renLuyen && parsed.renLuyen.length > 0) {
      setRenLuyen(parsed.renLuyen);
    }
    if (parsed.fundTransactions && parsed.fundTransactions.length > 0) {
      setFundTransactions(parsed.fundTransactions);
    }
    if (parsed.workshopLogs && parsed.workshopLogs.length > 0) {
      setWorkshopLogs(parsed.workshopLogs);
    }
    if (parsed.detectedClassName) {
      setCurrentClass(parsed.detectedClassName);
    }
  };

  const handleUpdateGrade = (updatedGrade: StudentGrade) => {
    setGrades(prev => {
      const idx = prev.findIndex(g => g.studentId === updatedGrade.studentId && g.moduleId === updatedGrade.moduleId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedGrade;
        return copy;
      }
      return [...prev, updatedGrade];
    });
  };

  const handleAddAttendance = (records: AttendanceRecord[]) => {
    setAttendance(prev => [...records, ...prev]);
  };

  const handleUpdateRenLuyen = (updated: RenLuyenCriteria) => {
    setRenLuyen(prev => {
      const idx = prev.findIndex(r => r.studentId === updated.studentId && r.semester === updated.semester);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });
  };

  if (!currentUser) {
    return (
      <AuthLoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          // Auto-load data from drive after login
          googleDriveSyncService.verifySyncConsistency(currentClass).then(res => {
            if (res.consistent) {
              console.log('Đã đồng bộ consistency:', res.message);
              // Lógica để tải dữ liệu (ví dụ: getOrCreateJsonBackup...)
            }
          }).catch(console.error);
        }}
        users={users}
        onRegisterTeacher={(u) => setUsers(prev => [...prev, u])}
        classes={classes}
        themeSettings={themeSettings}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickTools={() => setIsQuickToolsOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        themeSettings={themeSettings}
        currentUser={currentUser}
        onOpenUserManagement={() => setIsUserModalOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          safeLocalStorage.remove('oto_current_user');
          googleDriveSyncService.disconnectAccount();
        }}
        onOpenDriveSync={() => setIsDriveSyncOpen(true)}
        onOpenPublishGuide={() => setIsPublishModalOpen(true)}
        onSwitchUserRole={(role) => {
          if (currentUser) {
            setCurrentUser({ ...currentUser, role });
          }
        }}
        autoSyncInfo={autoSyncInfo}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          academicYear={academicYear}
          setAcademicYear={setAcademicYear}
          currentClass={currentClass}
          setCurrentClass={setCurrentClass}
          themeSettings={themeSettings}
          onOpenUnitInfoModal={() => setIsUnitInfoModalOpen(true)}
          classes={classes}
          onOpenCurriculumModal={(sys) => {
            setSelectedSystemForCurriculum(sys);
            setIsCurriculumModalOpen(true);
          }}
          currentUser={currentUser}
          onOpenUserManagement={() => setIsUserModalOpen(true)}
          students={students}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 pb-16">
          {activeTab === 'home' && <DashboardHome currentClass={currentClass} students={students} grades={grades} attendance={attendance} setActiveTab={setActiveTab} themeSettings={themeSettings} />}
          {activeTab === 'unit-info' && <UnitInfoModule unitInfo={unitSettings} onOpenUnitInfoModal={() => setIsUnitInfoModalOpen(true)} />}
          {activeTab === 'organization' && (
            <OrganizationModule 
              academicYear={academicYear}
              setAcademicYear={setAcademicYear}
              currentClass={currentClass}
              setCurrentClass={setCurrentClass}
              classes={classes}
              onAddClass={(c) => setClasses(prev => [...prev, c])}
              onUpdateClass={(c) => setClasses(prev => prev.map(item => item.id === c.id ? c : item))}
              onDeleteClass={(id) => setClasses(prev => prev.filter(item => item.id !== id))}
              themeSettings={themeSettings}
            />
          )}
          {activeTab === 'students' && (
            <StudentProfilesModule 
              students={students}
              currentClass={currentClass}
              setCurrentClass={setCurrentClass}
              classes={classes}
              setActiveTab={setActiveTab}
              onUpdateStudent={handleUpdateStudent}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
              onBulkDeleteStudents={handleBulkDeleteStudents}
              onClearClassStudents={handleClearClassStudents}
              onClearAllStudents={handleClearAllStudents}
              onBulkAddStudents={handleBulkAddStudents}
              onReorderStudents={handleReorderStudents}
              onRestoreInitialStudents={handleRestoreInitialStudents}
              selectedStudent={selectedStudent}
              setSelectedStudent={setSelectedStudent}
              themeSettings={themeSettings}
              unitInfo={unitSettings}
            />
          )}
          {activeTab === 'grades' && (
            <GradeManagementModule 
              currentClass={currentClass}
              students={students}
              modules={modules}
              grades={grades}
              onUpdateGrade={handleUpdateGrade}
              themeSettings={themeSettings}
            />
          )}
          {activeTab === 'attendance' && (
            <AttendanceAndRenLuyenModule 
              currentClass={currentClass}
              students={students}
              modules={modules}
              attendance={attendance}
              renLuyen={renLuyen}
              onAddAttendance={handleAddAttendance}
              onUpdateRenLuyen={handleUpdateRenLuyen}
              onOpenNoticeModal={() => {}}
              currentUser={currentUser}
              themeSettings={themeSettings}
            />
          )}
          {activeTab === 'retake' && (
            <RetakeAndRemedialModule 
              currentClass={currentClass}
              students={students}
              modules={modules}
              grades={grades}
            />
          )}
          {activeTab === 'reports' && (
            <ReportsAndFundModule 
              currentClass={currentClass}
              students={students}
              fundTransactions={fundTransactions}
              workshopLogs={workshopLogs}
              grades={grades}
              renLuyen={renLuyen}
              onAddTransaction={(tx) => setFundTransactions([tx, ...fundTransactions])}
              onAddWorkshopLog={(log) => setWorkshopLogs([log, ...workshopLogs])}
            />
          )}
          {activeTab === 'backup-forms' && (
            <BackupAndFormsModule 
              currentClass={currentClass}
              students={students}
              modules={modules}
              grades={grades}
              attendance={attendance}
              renLuyen={renLuyen}
              fundTransactions={fundTransactions}
              workshopLogs={workshopLogs}
              classes={classes}
              unitInfo={unitSettings}
              currentUser={currentUser}
              onClearClassStudents={handleClearClassStudents}
            />
          )}
          {activeTab === 'portal' && (
            <StudentPortalModule 
              students={students}
              grades={grades}
              attendance={attendance}
              renLuyen={renLuyen}
              modules={modules}
            />
          )}
        </main>
      </div>

      {isUnitInfoModalOpen && (
        <UnitInfoModal
          isOpen={isUnitInfoModalOpen}
          onClose={() => setIsUnitInfoModalOpen(false)}
          unitInfo={unitSettings}
          onSaveUnitInfo={setUnitSettings}
        />
      )}

      {isThemeModalOpen && (
        <ThemeSetupModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          themeSettings={themeSettings}
          onSaveTheme={setThemeSettings}
        />
      )}

      {isUserModalOpen && (
        <UserManagementModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          currentUser={currentUser}
          users={users}
          onUpdateUsers={setUsers}
          classes={classes}
          onUpdateClasses={setClasses}
          students={students}
        />
      )}

      {isCurriculumModalOpen && (
        <CurriculumFrameworkModal
          isOpen={isCurriculumModalOpen}
          onClose={() => setIsCurriculumModalOpen(false)}
          initialSystemName={selectedSystemForCurriculum}
        />
      )}

      {isQuickToolsOpen && (
        <QuickToolsModal
          isOpen={isQuickToolsOpen}
          onClose={() => setIsQuickToolsOpen(false)}
        />
      )}

      {isDriveSyncOpen && (
        <DriveSyncModal
          isOpen={isDriveSyncOpen}
          onClose={() => setIsDriveSyncOpen(false)}
          currentClass={currentClass}
          students={students}
          grades={grades}
          attendance={attendance}
          renLuyen={renLuyen}
          fundTransactions={fundTransactions}
          workshopLogs={workshopLogs}
          classes={classes}
          unitInfo={unitSettings}
          currentUser={currentUser}
          onUpdateCurrentUser={setCurrentUser}
          onImportData={handleImportData}
          autoSyncInfo={autoSyncInfo}
        />
      )}

      {isPublishModalOpen && (
        <PublishGuideModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          appName={themeSettings?.systemTitle}
        />
      )}
        <Footer 
          currentClass={currentClass}
          themeSettings={themeSettings}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
        />
    </div>
  );
}

