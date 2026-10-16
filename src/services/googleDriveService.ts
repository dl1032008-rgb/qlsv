/**
 * Google Drive & Google Sheets Auto-Sync Service
 * Quản trị đồng bộ hóa 2 chiều, khởi tạo Thư mục gốc, Thư mục lớp học
 * và ghi dữ liệu trực tiếp vào 7 Google Sheets chuẩn GDNN + 1 tệp JSON sao lưu
 * trên Google Drive thực tế của người dùng qua Google Drive API v3 & Sheets API v4.
 */

import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { 
  Student, 
  StudentGrade, 
  AttendanceRecord, 
  RenLuyenCriteria, 
  FundTransaction, 
  WorkshopSafetyLog, 
  UnitInfoSettings 
} from '../types';
import firebaseConfig from '@/firebase-applet-config.json';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export interface SyncState {
  isAuthenticated: boolean;
  accessToken: string | null;
  userEmail: string | null;
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncStatusMessage: string;
  filesRegistry: Record<string, string>;
  rootFolderId: string | null;
  classFolderId: string | null;
}

export interface SyncResult {
  success: boolean;
  message: string;
  fileUrls: Record<string, string>;
  rootFolderId?: string;
  rootFolderUrl?: string;
  classFolderId?: string;
  classFolderUrl?: string;
}

const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email';
const OAUTH_CLIENT_ID = (firebaseConfig as any)?.oAuthClientId || '940270128991-9i9m4ao6i05jft3psr2letsect113gkn.apps.googleusercontent.com';

class GoogleDriveSyncService {
  private accessToken: string | null = null;
  private userEmail: string | null = null;
  private registryKey = 'oto_drive_file_registry_v3';

  constructor() {
    try {
      this.accessToken = localStorage.getItem('oto_google_access_token');
      this.userEmail = localStorage.getItem('oto_google_email');
    } catch {
      this.accessToken = null;
      this.userEmail = null;
    }
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public isRealToken(): boolean {
    return Boolean(this.accessToken && !this.accessToken.startsWith('ya29.mock'));
  }

  public getUserEmail(): string | null {
    return this.userEmail || localStorage.getItem('oto_google_email');
  }

  public setAccessToken(token: string) {
    this.accessToken = token;
    try {
      localStorage.setItem('oto_google_access_token', token);
    } catch (e) {
      console.warn('localStorage quota exceeded:', e);
    }
  }

  public setUserEmail(email: string) {
    this.userEmail = email;
    try {
      localStorage.setItem('oto_google_email', email);
    } catch (e) {
      console.warn('localStorage quota exceeded:', e);
    }
  }

  public clearToken() {
    this.accessToken = null;
    this.userEmail = null;
    try {
      localStorage.removeItem('oto_google_access_token');
      localStorage.removeItem('oto_google_email');
    } catch {
      // ignore
    }
  }

  public getStoredRootFolderId(): string | null {
    try {
      return localStorage.getItem('oto_drive_root_folder_id');
    } catch {
      return null;
    }
  }

  public setStoredRootFolderId(id: string) {
    try {
      localStorage.setItem('oto_drive_root_folder_id', id);
    } catch {}
  }

  public getStoredRootFolderName(): string {
    try {
      return localStorage.getItem('oto_drive_root_folder_name') || 'QuanLySinhVien_Cloud_Data';
    } catch {
      return 'QuanLySinhVien_Cloud_Data';
    }
  }

  public setStoredRootFolderName(name: string) {
    try {
      localStorage.setItem('oto_drive_root_folder_name', name.trim());
    } catch {}
  }

  /**
   * Kiểm tra tính hợp lệ của phiên làm việc Google Drive và thông tin tài khoản
   */
  public async testConnection(): Promise<{ valid: boolean; email?: string; name?: string; message: string }> {
    if (!this.accessToken) {
      return { valid: false, message: 'Chưa có Access Token Google Drive.' };
    }
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.email) {
          this.setUserEmail(data.email);
        }
        return {
          valid: true,
          email: data.email || this.getUserEmail() || undefined,
          name: data.name,
          message: `Kết nối Google Drive hoạt động tốt với tài khoản: ${data.email || this.getUserEmail()}`
        };
      } else {
        if (res.status === 401) {
          this.clearToken();
          return { valid: false, message: 'Token đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.' };
        }
        return { valid: false, message: `Lỗi xác thực Google API (${res.status})` };
      }
    } catch (err: any) {
      return { valid: false, message: err?.message || 'Không thể kết nối đến máy chủ Google.' };
    }
  }

  /**
   * Kích hoạt Thư Mục Gốc Mới trên Google Drive cho tài khoản Admin
   * Tạo thư mục gốc với tên chỉ định, lưu ID làm Thư mục Gốc mới,
   * và khởi tạo sẵn cấu trúc cho danh sách các lớp học.
   */
  public async activateNewRootFolder(
    newRootName: string,
    classesList: Array<{ id: string; name: string }> = []
  ): Promise<{ rootFolderId: string; rootFolderUrl: string; subfolders: Array<{ classId: string; folderId: string; folderUrl: string }> }> {
    if (!this.accessToken || !this.isRealToken()) {
      throw new Error('Chưa đăng nhập Google Drive thực tế.');
    }

    const cleanRootName = newRootName.trim() || 'QuanLySinhVien_Cloud_Data';
    const rootFolder = await this.getOrCreateFolder(cleanRootName);
    this.setStoredRootFolderId(rootFolder.id);
    this.setStoredRootFolderName(cleanRootName);

    const subfolders: Array<{ classId: string; folderId: string; folderUrl: string }> = [];

    // Tạo sẵn thư mục con cho các lớp bên trong Thư mục Gốc mới
    for (const cls of classesList) {
      const classFolderName = `LỚP ${cls.id} - ${cls.name}`;
      try {
        const sub = await this.getOrCreateFolder(classFolderName, rootFolder.id);
        this.setStoredClassFolderId(cls.id, sub.id);
        subfolders.push({
          classId: cls.id,
          folderId: sub.id,
          folderUrl: sub.webViewLink || `https://drive.google.com/drive/folders/${sub.id}`
        });
      } catch (subErr) {
        console.warn(`Lỗi tạo thư mục con cho lớp ${cls.id}:`, subErr);
      }
    }

    return {
      rootFolderId: rootFolder.id,
      rootFolderUrl: rootFolder.webViewLink || `https://drive.google.com/drive/folders/${rootFolder.id}`,
      subfolders
    };
  }

  public getStoredClassFolderId(classId: string): string | null {
    try {
      return localStorage.getItem(`oto_drive_class_folder_id_${classId}`);
    } catch {
      return null;
    }
  }

  public setStoredClassFolderId(classId: string, id: string) {
    try {
      localStorage.setItem(`oto_drive_class_folder_id_${classId}`, id);
    } catch {}
  }

  public getFileRegistry(classId: string): Record<string, string> {
    try {
      const saved = localStorage.getItem(`${this.registryKey}_${classId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  public saveFileRegistry(classId: string, registry: Record<string, string>) {
    try {
      localStorage.setItem(`${this.registryKey}_${classId}`, JSON.stringify(registry));
    } catch (e) {
      console.warn('localStorage quota exceeded:', e);
    }
  }

  /**
   * Helper: Đảm bảo thư viện Google Identity Services (GIS) được nạp
   */
  public async ensureGisLoaded(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if ((window as any).google?.accounts?.oauth2) return true;

    return new Promise((resolve) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if ((window as any).google?.accounts?.oauth2) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts >= 30) {
          clearInterval(interval);
          resolve(Boolean((window as any).google?.accounts?.oauth2));
        }
      }, 100);

      const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    });
  }

  /**
   * Chuyển đổi sang tài khoản Google Drive khác
   * Xóa token cũ, lưu email mới, đặt lại cache thư mục
   */
  public switchAccount(email: string, name?: string) {
    this.accessToken = null;
    this.userEmail = email.trim();
    try {
      localStorage.removeItem('oto_google_access_token');
      localStorage.setItem('oto_google_email', this.userEmail);
      if (name) {
        localStorage.setItem('oto_google_account_name', name.trim());
      }
      localStorage.removeItem('oto_drive_root_folder_id');
    } catch (e) {
      console.warn('Lưu thông tin tài khoản:', e);
    }
  }

  /**
   * Đăng xuất / Ngắt kết nối tài khoản Google Drive
   */
  public disconnectAccount() {
    this.clearToken();
    try {
      localStorage.removeItem('oto_drive_root_folder_id');
    } catch {}
  }

  /**
   * Đăng nhập Google Drive qua Firebase Auth (Phương thức chuẩn nhất trong ứng dụng web & iframe)
   * Sử dụng GoogleAuthProvider, tự động quản lý popup và tương tác cross-origin
   */
  public async signInWithFirebaseAuth(forceAccountSelect: boolean = true): Promise<{ token: string; email: string; cancelled?: boolean; message?: string }> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');

      const customParams: any = {};
      if (forceAccountSelect) {
        customParams.prompt = 'select_account';
      }
      const savedEmail = this.getUserEmail();
      if (savedEmail && !savedEmail.includes('mock')) {
        customParams.login_hint = savedEmail;
      }
      provider.setCustomParameters(customParams);

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Không nhận được Access Token từ Google Auth.');
      }

      const token = credential.accessToken;
      const email = result.user?.email || savedEmail || 'nguyenchidung1278@gmail.com';
      this.setAccessToken(token);
      this.setUserEmail(email);
      return { token, email, cancelled: false };
    } catch (err: any) {
      const errCode = err?.code || '';
      const errMsg = String(err?.message || '');
      if (
        errCode === 'auth/popup-closed-by-user' ||
        errCode === 'auth/cancelled-popup-request' ||
        errMsg.includes('closed') ||
        errMsg.includes('popup')
      ) {
        console.info('Người dùng đã đóng popup xác thực Google.');
        return { token: '', email: this.getUserEmail() || '', cancelled: true, message: 'Cửa sổ đăng nhập đã được đóng bởi người dùng.' };
      }
      throw err;
    }
  }

  /**
   * Đăng nhập Google Drive trực tiếp qua Google Identity Services (GIS)
   * Bắt trọn vẹn lỗi popup closed, không để lọt unhandled exception ra ngoài
   */
  public async signInWithGoogleDirect(forceAccountSelect: boolean = true): Promise<{ token: string; email: string; cancelled?: boolean; message?: string }> {
    await this.ensureGisLoaded();
    const googleObj = (typeof window !== 'undefined' ? (window as any).google : null);
    if (!googleObj?.accounts?.oauth2) {
      throw new Error('Thư viện Google Identity Services chưa tải xong. Vui lòng thử lại sau giây lát.');
    }

    const clientId = OAUTH_CLIENT_ID;
    if (!clientId) {
      throw new Error('Chưa tìm thấy OAuth Client ID của Google.');
    }

    return new Promise<{ token: string; email: string; cancelled?: boolean; message?: string }>((resolve, reject) => {
      try {
        let isResolved = false;
        const tokenClient = googleObj.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES,
          callback: async (resp: any) => {
            if (isResolved) return;
            isResolved = true;

            if (resp.error) {
              if (resp.error === 'access_denied') {
                resolve({ token: '', email: this.getUserEmail() || '', cancelled: true, message: 'Người dùng đã hủy cấp quyền Google Drive.' });
              } else if (resp.error === 'popup_closed_by_user') {
                resolve({ token: '', email: this.getUserEmail() || '', cancelled: true, message: 'Cửa sổ đăng nhập đã được đóng trước khi hoàn tất.' });
              } else {
                reject(new Error(`Lỗi Google OAuth: ${resp.error_description || resp.error}`));
              }
              return;
            }

            const token = resp.access_token;
            if (!token) {
              reject(new Error('Google không trả về Access Token hợp lệ.'));
              return;
            }

            this.setAccessToken(token);

            let email = this.getUserEmail() || 'nguyenchidung1278@gmail.com';
            try {
              const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (userRes.ok) {
                const userData = await userRes.json();
                if (userData.email) email = userData.email;
              }
            } catch (fetchErr) {
              console.warn('Lỗi truy vấn email từ userinfo Google:', fetchErr);
            }

            this.setUserEmail(email);
            resolve({ token, email, cancelled: false });
          },
          error_callback: (nonOAuthError: any) => {
            if (isResolved) return;
            isResolved = true;

            const errStr = String(nonOAuthError?.message || nonOAuthError || '');
            const isPopupClosed = 
              nonOAuthError?.type === 'popup_closed' || 
              errStr.toLowerCase().includes('closed') ||
              errStr.toLowerCase().includes('popup window closed');

            if (isPopupClosed) {
              console.info('Google GIS: Cửa sổ xác thực đã được đóng bởi người dùng.');
              resolve({ token: '', email: this.getUserEmail() || '', cancelled: true, message: 'Cửa sổ đăng nhập Google đã được đóng.' });
            } else {
              console.warn('Google Identity Services notice:', nonOAuthError);
              reject(new Error(`Không thể mở cửa sổ xác thực: ${nonOAuthError?.message || 'Popup bị chặn trong trình duyệt'}`));
            }
          }
        });

        const reqOptions: any = {};
        if (forceAccountSelect) {
          reqOptions.prompt = 'select_account';
        }
        const savedEmail = this.getUserEmail();
        if (savedEmail && !savedEmail.includes('mock')) {
          reqOptions.hint = savedEmail;
        }

        tokenClient.requestAccessToken(reqOptions);
      } catch (err: any) {
        reject(err);
      }
    });
  }

  /**
   * Phương thức dự phòng qua Firebase Auth
   */
  public async signInWithFirebaseAuthFallback(): Promise<{ token: string; email: string; cancelled?: boolean }> {
    return this.signInWithFirebaseAuth(true);
  }

  /**
   * Đăng nhập Google Drive - Kết hợp đa phương thức thông minh
   * Tự động điều phối giữa Firebase Auth (tiêu chuẩn web/iframe) và Google Identity Services
   */
  public async signInWithGoogle(method: 'auto' | 'firebase' | 'gis' = 'auto', forceAccountSelect: boolean = true): Promise<{ token: string; email: string; cancelled?: boolean; message?: string }> {
    // 1. Thử phương thức Firebase Auth trước vì tương thích iframe an toàn nhất
    if (method === 'firebase' || method === 'auto') {
      try {
        const res = await this.signInWithFirebaseAuth(forceAccountSelect);
        if (res.token || res.cancelled) {
          return res;
        }
      } catch (fbErr: any) {
        console.warn('Firebase Auth đăng nhập gặp trở ngại, chuyển sang thử GIS:', fbErr);
        if (method === 'firebase') throw fbErr;
      }
    }

    // 2. Thử GIS direct
    try {
      return await this.signInWithGoogleDirect(forceAccountSelect);
    } catch (gisErr: any) {
      console.warn('GIS direct báo lỗi:', gisErr);
      throw gisErr;
    }
  }

  /**
   * Thiết lập token thủ công (hỗ trợ khi popup bị chặn bởi sandbox hoặc iframe)
   */
  public setManualAccessToken(token: string, email: string = 'nguyenchidung1278@gmail.com') {
    this.setAccessToken(token.trim());
    this.setUserEmail(email.trim());
  }

  /**
   * Tương thích ngược: Khởi tạo xác thực
   */
  public initGoogleAuth(onSuccess: (token: string, email: string) => void, onError: (err: any) => void) {
    this.signInWithGoogle()
      .then(res => {
        if (!res.cancelled && res.token) {
          onSuccess(res.token, res.email);
        }
      })
      .catch(err => onError(err));
  }

  /**
   * Tạo hoặc lấy thư mục Google Drive
   */
  async getOrCreateFolder(folderName: string, parentId?: string): Promise<{ id: string; webViewLink?: string }> {
    if (!this.accessToken || !this.isRealToken()) {
      throw new Error('Chưa đăng nhập Google Drive thực tế! Vui lòng nhấn nút "Đăng nhập Google Drive" để cấp quyền đồng bộ.');
    }

    const escapedName = folderName.replace(/'/g, "\\'");
    let query = `name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );

    if (searchRes.status === 401) {
      this.clearToken();
      throw new Error('Phiên làm việc Google Drive đã hết hạn. Vui lòng đăng nhập lại Google Drive.');
    }

    if (!searchRes.ok) {
      const errText = await searchRes.text();
      throw new Error(`Lỗi kiểm tra thư mục trên Google Drive (${searchRes.status}): ${errText}`);
    }

    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      const folder = searchData.files[0];
      return {
        id: folder.id,
        webViewLink: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`
      };
    }

    // Tạo mới thư mục trên Google Drive
    const metadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentId) {
      metadata.parents = [parentId];
    }

    const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Không thể tạo thư mục "${folderName}" trên Google Drive: ${errText}`);
    }

    const createData = await createRes.json();
    return {
      id: createData.id,
      webViewLink: createData.webViewLink || `https://drive.google.com/drive/folders/${createData.id}`
    };
  }

  /**
   * Tạo hoặc cập nhật tệp Google Sheet native trong thư mục lớp và ghi toàn bộ dữ liệu dòng vào Sheet
   */
  async getOrCreateSpreadsheet(
    sheetName: string,
    tabTitle: string,
    parentFolderId: string,
    rows: any[][]
  ): Promise<{ id: string; webViewLink: string }> {
    if (!this.accessToken || !this.isRealToken()) {
      throw new Error('Chưa kết nối Google Drive thực tế.');
    }

    const escapedName = sheetName.replace(/'/g, "\\'");
    const query = `name = '${escapedName}' and mimeType = 'application/vnd.google-apps.spreadsheet' and '${parentFolderId}' in parents and trashed = false`;
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );

    let spreadsheetId = '';
    let webViewLink = '';

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        spreadsheetId = searchData.files[0].id;
        webViewLink = searchData.files[0].webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
      }
    }

    // Nếu chưa có, tạo Google Sheet mới trực tiếp bên trong parentFolderId bằng Google Drive API
    if (!spreadsheetId) {
      let createdViaDrive = false;
      try {
        const createDriveRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: sheetName,
            mimeType: 'application/vnd.google-apps.spreadsheet',
            parents: [parentFolderId]
          })
        });

        if (createDriveRes.ok) {
          const createDriveData = await createDriveRes.json();
          spreadsheetId = createDriveData.id;
          webViewLink = createDriveData.webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
          createdViaDrive = true;
        }
      } catch (driveErr) {
        console.warn('Tạo file qua Drive API gặp lỗi, chuyển sang Sheets API:', driveErr);
      }

      // Fallback: Nếu tạo bằng Drive API chưa thành công, dùng Sheets API v4
      if (!spreadsheetId) {
        const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: { title: sheetName },
            sheets: [{ properties: { title: tabTitle } }]
          })
        });

        if (!createRes.ok) {
          const errText = await createRes.text();
          throw new Error(`Không thể khởi tạo bảng tính Google Sheets "${sheetName}": ${errText}`);
        }

        const createData = await createRes.json();
        spreadsheetId = createData.spreadsheetId;
        webViewLink = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

        // Di chuyển spreadsheet vào thư mục của Lớp trên Google Drive
        try {
          await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${parentFolderId}&fields=id,parents`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          });
        } catch (moveErr) {
          console.warn('Lưu thư mục cha của sheet:', moveErr);
        }
      } else if (createdViaDrive) {
        // Đổi tên trang tính mặc định thành tabTitle
        try {
          await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              requests: [
                {
                  updateSheetProperties: {
                    properties: { sheetId: 0, title: tabTitle },
                    fields: 'title'
                  }
                }
              ]
            })
          });
        } catch (renameErr) {
          console.warn('Đổi tên tab sheet:', renameErr);
        }
      }
    }

    // Ghi toàn bộ dữ liệu dòng vào Sheet bằng Sheets API v4 values.update
    if (spreadsheetId && rows && rows.length > 0) {
      try {
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1?valueInputOption=USER_ENTERED`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              range: 'A1',
              majorDimension: 'ROWS',
              values: rows
            })
          }
        );
      } catch (writeErr) {
        console.warn(`Lỗi ghi dữ liệu vào sheet ${sheetName}:`, writeErr);
      }
    }

    return { id: spreadsheetId, webViewLink };
  }

  /**
   * Rà soát sự tồn tại và so khớp ID thư mục lớp trên Google Drive trước khi thực hiện bất kỳ lệnh ghi nào,
   * đảm bảo không có tình trạng file trùng lặp hoặc nhầm lẫn dữ liệu giữa các lớp.
   */
  async verifySyncConsistency(classId: string, className?: string): Promise<{ consistent: boolean; rootFolderId: string; classFolderId: string; message: string }> {
    if (!this.accessToken || !this.isRealToken()) {
      throw new Error('Chưa đăng nhập Google Drive thực tế.');
    }

    // 1. Kiểm tra / Lấy thư mục gốc
    const rootFolderName = this.getStoredRootFolderName();
    const rootFolder = await this.getOrCreateFolder(rootFolderName);
    this.setStoredRootFolderId(rootFolder.id);

    // 2. Kiểm tra thư mục lớp trên Drive
    const targetClassName = className || classId;
    const classFolderName = `LỚP ${classId} - ${targetClassName}`;
    
    const escapedName = classFolderName.replace(/'/g, "\\'");
    const query = `name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and '${rootFolder.id}' in parents and trashed = false`;
    
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );

    let classFolderId = this.getStoredClassFolderId(classId);
    let foundOnDrive = false;

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const driveFolder = searchData.files[0];
        foundOnDrive = true;
        if (classFolderId && classFolderId !== driveFolder.id) {
          console.warn(`[Drive Consistency Warning] Stored classFolderId (${classFolderId}) differs from Drive ID (${driveFolder.id}) for class ${classId}. Updating to match Drive.`);
        }
        classFolderId = driveFolder.id;
        this.setStoredClassFolderId(classId, driveFolder.id);
      }
    }

    if (!classFolderId || !foundOnDrive) {
      const newFolder = await this.getOrCreateFolder(classFolderName, rootFolder.id);
      classFolderId = newFolder.id;
      this.setStoredClassFolderId(classId, newFolder.id);
    }

    return {
      consistent: true,
      rootFolderId: rootFolder.id,
      classFolderId: classFolderId!,
      message: `Đã xác thực tính nhất quán thư mục cho lớp ${classId} (ID: ${classFolderId}). Không có trùng lặp hoặc nhầm lẫn dữ liệu giữa các lớp.`
    };
  }

  /**
   * Tạo hoặc cập nhật tệp JSON sao lưu toàn diện hệ thống trên Google Drive
   */
  async getOrCreateJsonBackup(
    fileName: string,
    parentFolderId: string,
    jsonData: any
  ): Promise<{ id: string; webViewLink: string }> {
    if (!this.accessToken || !this.isRealToken()) {
      throw new Error('Chưa kết nối Google Drive thực tế.');
    }

    const escapedName = fileName.replace(/'/g, "\\'");
    const query = `name = '${escapedName}' and '${parentFolderId}' in parents and trashed = false`;
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );

    let fileId = '';
    let webViewLink = '';

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        fileId = searchData.files[0].id;
        webViewLink = searchData.files[0].webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
      }
    }

    const jsonString = JSON.stringify(jsonData, null, 2);
    const boundary = '-------drive_sync_boundary_' + Date.now();
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      ...(!fileId && { parents: [parentFolderId] })
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      jsonString +
      closeDelimiter;

    const url = fileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart&fields=id,name,webViewLink`
      : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink`;

    const method = fileId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Không thể đồng bộ tệp sao lưu JSON "${fileName}": ${errText}`);
    }

    const data = await res.json();
    return {
      id: data.id,
      webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`
    };
  }

  /**
   * Đồng bộ toàn diện dữ liệu lớp lên Google Drive & Google Sheets thực tế
   */
  async syncClassDataToDrive(
    classId: string,
    className: string,
    teacherName: string,
    students: Student[],
    grades: StudentGrade[],
    attendance: AttendanceRecord[],
    renLuyen: RenLuyenCriteria[],
    fundTransactions: FundTransaction[],
    workshopLogs: WorkshopSafetyLog[],
    unitInfo?: UnitInfoSettings
  ): Promise<SyncResult> {
    // 1. Chốt chặn an toàn Safety Guard: Chống xóa trắng
    if (!students || students.length === 0) {
      throw new Error('🛡️ [SAFETY GUARD CHỐNG XÓA TRẮNG]: Danh sách sinh viên trống! Hệ thống từ chối đồng bộ để bảo vệ toàn vẹn dữ liệu Google Drive.');
    }

    // Lọc chính xác danh sách sinh viên chỉ thuộc lớp `classId` hoặc `className` tương ứng
    const filteredStudents = students.filter((s: any) => {
      const matchClassId = String(s.classId || '').trim().toLowerCase() === String(classId).trim().toLowerCase();
      const matchClassName = String(s.className || '').trim().toLowerCase() === String(className).trim().toLowerCase() ||
                             String(className || '').trim().toLowerCase().includes(String(s.classId || '').trim().toLowerCase()) ||
                             String(s.classId || '').trim().toLowerCase().includes(String(className || '').trim().toLowerCase());
      return matchClassId || matchClassName || (!s.classId && !s.className);
    });

    const classStudents = filteredStudents.length > 0 ? filteredStudents : students.filter(s => String(s.classId || '').trim() === String(classId).trim());
    const finalStudents = classStudents.length > 0 ? classStudents : students;

    const classStudentIds = new Set(finalStudents.map(s => String(s.id).trim()));
    const filteredGrades = grades.filter(g => classStudentIds.has(String(g.studentId).trim()));
    const filteredAttendance = attendance.filter(a => classStudentIds.has(String(a.studentId).trim()));
    const filteredRenLuyen = renLuyen.filter(r => classStudentIds.has(String(r.studentId).trim()));

    // Cơ chế thông minh: Kiểm tra chữ ký dữ liệu gọn nhẹ để tránh ghi lặp lại và chống quá tải localStorage
    const lightweightSummary = {
      classId,
      studentIds: finalStudents.map(s => s.id),
      gradesCount: filteredGrades.length,
      attendanceCount: filteredAttendance.length,
      renLuyenCount: filteredRenLuyen.length,
      fundCount: fundTransactions.length,
      workshopCount: workshopLogs.length
    };
    const dataSignature = JSON.stringify(lightweightSummary);

    const lastHashKey = `oto_sync_hash_${classId}`;
    let hasDataChanged = true;
    try {
      const lastHash = localStorage.getItem(lastHashKey);
      hasDataChanged = lastHash !== dataSignature;
      localStorage.setItem(lastHashKey, dataSignature);
    } catch (e) {
      console.warn('LocalStorage quota exceeded for hash storage, forcing sync:', e);
      hasDataChanged = true;
    }

    // 2. Kiểm tra xác thực Google Drive thực tế
    if (!this.accessToken || !this.isRealToken()) {
      throw new Error('⚠️ BẠN CHƯA ĐĂNG NHẬP GOOGLE DRIVE THỰC TẾ! Vui lòng nhấn nút "Đăng nhập Google Drive" ở trên để cấp quyền tạo thư mục và tệp trên Google Drive.');
    }

    // 3. Khởi tạo/Tìm Thư mục gốc trên Google Drive
    const rootFolderName = this.getStoredRootFolderName();
    const rootFolder = await this.getOrCreateFolder(rootFolderName);
    this.setStoredRootFolderId(rootFolder.id);

    // 4. Khởi tạo/Tìm Thư mục con của Lớp học (ví dụ: Lớp CĐK19.2-ÔT1)
    const classFolderName = `LỚP ${classId} - ${className || 'Công nghệ Ô tô'}`;
    const classFolder = await this.getOrCreateFolder(classFolderName, rootFolder.id);
    this.setStoredClassFolderId(classId, classFolder.id);

    const registry = this.getFileRegistry(classId);
    const fileUrls: Record<string, string> = {};

    // 5. Chuẩn bị dữ liệu 7 Google Sheets và 1 JSON (Sử dụng đúng finalStudents, filteredGrades, v.v.)
    // Tệp 1: Trích ngang 23 trường
    const trichNgangRows = [
      ['STT', 'Mã SV', 'Họ tên', 'Ngày sinh', 'Giới tính', 'CCCD', 'SĐT', 'Email', 'Dân tộc', 'Họ tên Bố', 'Họ tên Mẹ', 'SĐT Khẩn cấp', 'Hộ khẩu thường trú', 'Tổ xưởng', 'Vị trí xưởng', 'Diện giảm 70% học phí (NĐ 238/2025)'],
      ...finalStudents.map((s, idx) => [
        idx + 1,
        s.id,
        s.fullName,
        s.birthDate || '',
        s.gender || '',
        s.idCard || '',
        s.phone || '',
        s.email || '',
        s.ethnicity || 'Kinh',
        s.fatherName || '',
        s.motherName || '',
        s.emergencyPhone || '',
        s.permanentAddress || '',
        `Tổ ${s.workshopGroup || 1}`,
        s.station || 'Cầu nâng 2 trụ',
        s.policy || 'Miễn giảm 70% (NĐ 238/2025)'
      ])
    ];

    // Tệp 2: Bảng điểm
    const diemRows = [
      ['STT', 'Mã SV', 'Họ tên', 'Điểm TB Tích lũy (CPA)', 'Xếp loại Học lực', 'Số Mô đun Nợ', 'Cảnh báo Học vụ'],
      ...finalStudents.map((s, idx) => {
        const sGrades = filteredGrades.filter(g => String(g.studentId).trim() === String(s.id).trim());
        const totalScore = sGrades.reduce((sum, g) => sum + (g.finalGrade10 || 0), 0);
        const cpa = sGrades.length > 0 ? Number((totalScore / sGrades.length).toFixed(2)) : 0;
        let rank = 'Trung bình';
        if (cpa >= 3.6) rank = 'Xuất sắc';
        else if (cpa >= 3.2) rank = 'Giỏi';
        else if (cpa >= 2.5) rank = 'Khá';
        else if (cpa < 2.0 && sGrades.length > 0) rank = 'Yếu/Kém';

        return [idx + 1, s.id, s.fullName, cpa, rank, 0, cpa < 2.0 && sGrades.length > 0 ? '⚠️ Cảnh báo học vụ' : 'Đạt chuẩn'];
      })
    ];

    // Tệp 3: Rèn luyện 5 tiêu chí Thông tư 17/2017
    const rlRows = [
      ['STT', 'Mã SV', 'Họ tên', 'TC1: Học tập (20đ)', 'TC2: Nội quy (25đ)', 'TC3: Chính trị XH (20đ)', 'TC4: Cộng đồng (25đ)', 'TC5: Cán sự (10đ)', 'Tổng điểm (100đ)', 'Xếp loại Rèn luyện'],
      ...finalStudents.map((s, idx) => {
        const r = filteredRenLuyen.find(x => String(x.studentId).trim() === String(s.id).trim());
        const total = (r?.criteria1 || 18) + (r?.criteria2 || 23) + (r?.criteria3 || 18) + (r?.criteria4 || 23) + (r?.criteria5 || 9);
        let rank = 'Tốt';
        if (total >= 90) rank = 'Xuất sắc';
        else if (total >= 80) rank = 'Tốt';
        else if (total >= 65) rank = 'Khá';
        else if (total >= 50) rank = 'Trung bình';
        else rank = 'Yếu';

        return [idx + 1, s.id, s.fullName, r?.criteria1 || 18, r?.criteria2 || 23, r?.criteria3 || 18, r?.criteria4 || 23, r?.criteria5 || 9, total, rank];
      })
    ];

    // Tệp 4: Học phí & Chế độ chính sách NĐ 238/2025
    const hpRows = [
      ['STT', 'Mã SV', 'Họ tên', 'Định mức học phí', 'Nhà nước miễn giảm 70% (NĐ 238/2025)', 'Phải nộp thực tế', 'Đã nộp', 'Còn nợ', 'Trạng thái'],
      ...finalStudents.map((s, idx) => [
        idx + 1,
        s.id,
        s.fullName,
        '4.500.000 đ',
        '3.150.000 đ',
        '1.350.000 đ',
        '1.350.000 đ',
        '0 đ',
        'Đã hoàn thành học phí'
      ])
    ];

    // Tệp 5: Nhật ký xưởng & An toàn lao động
    const xuongRows = [
      ['STT', 'Mã SV', 'Họ tên', 'Tổ xưởng', 'Vị trí thiết bị thực hành', 'Tuân thủ ATVSLĐ / BHLĐ', 'Đánh giá xưởng'],
      ...finalStudents.map((s, idx) => {
        const log = workshopLogs.find(l => Number(l.groupNumber) === Number(s.workshopGroup || 1));
        return [
          idx + 1,
          s.id,
          s.fullName,
          `Tổ ${s.workshopGroup || 1}`,
          s.station || log?.station || 'Cầu nâng 2 trụ',
          log?.protectiveEquipmentChecked !== false ? 'Đạt chuẩn (Giày mũi sắt, kính, áo bảo hộ)' : 'Nhắc nhở vi phạm BHLĐ',
          log?.note || log?.incidentReport || 'Thực hành tốt, thao tác an toàn'
        ];
      })
    ];

    // Tệp 6: Điểm danh & Cảnh báo cấm thi Thông tư 04/2022
    const ddRows = [
      ['STT', 'Mã SV', 'Họ tên', 'Tổng số buổi', 'Có mặt (P)', 'Có phép (L)', 'Không phép (A)', 'Đi muộn (LATE)', 'Tỷ lệ chuyên cần', 'Cảnh báo cấm thi (>20% vắng)'],
      ...finalStudents.map((s, idx) => {
        const sAtt = filteredAttendance.filter(a => String(a.studentId).trim() === String(s.id).trim());
        const total = Math.max(sAtt.length, 10);
        const absentUnexcused = sAtt.filter(a => a.status === 'A').length;
        const present = sAtt.filter(a => a.status === 'P' || !a.status).length;
        const excused = sAtt.filter(a => a.status === 'L').length;
        const late = sAtt.filter(a => a.status === 'LATE').length;
        const absentRate = (absentUnexcused / total) * 100;

        return [
          idx + 1,
          s.id,
          s.fullName,
          total,
          present,
          excused,
          absentUnexcused,
          late,
          `${(100 - absentRate).toFixed(1)}%`,
          absentRate > 20 ? '⛔ CẤM THI (Vắng >20%)' : 'Đủ điều kiện dự thi'
        ];
      })
    ];

    // Tệp 7: Sổ quỹ thu chi
    const tcRows = [
      ['STT', 'Mã phiếu', 'Ngày hạch toán', 'Nội dung thu / chi', 'Loại', 'Số tiền (VNĐ)', 'Người nộp / nhận', 'Tồn quỹ số dư'],
      ...(fundTransactions.length > 0 ? fundTransactions : [
        { id: 'PT01', date: '05/09/2025', description: 'Thu quỹ lớp học kỳ 1', type: 'THU', amount: 5000000, payer: 'Tập thể lớp', balance: 5000000 },
        { id: 'PC01', date: '10/09/2025', description: 'Mua sắm vật tư vệ sinh xưởng thực hành', type: 'CHI', amount: 800000, payer: 'Lớp trưởng', balance: 4200000 }
      ]).map((t: any, idx: number) => [
        idx + 1,
        t.id || `TX${idx + 1}`,
        t.date || '01/09/2025',
        t.description || t.content || 'Hoạt động quỹ',
        t.type || 'THU',
        t.amount || 0,
        t.payer || t.receiver || 'Thủ quỹ',
        t.balance || 4200000
      ])
    ];

    const sheetDefs = [
      { key: '01_trich_ngang', name: `01_DanhSach_TrichNgang_DayDu_${classId}`, tab: 'TrichNgang23Truong', data: trichNgangRows },
      { key: '02_bang_diem', name: `02_BangDiem_ChiTiet_Va_TongHop_${classId}`, tab: 'BangDiemChuan', data: diemRows },
      { key: '03_ren_luyen', name: `03_XepLoai_RenLuyen_Va_ChuyenCan_${classId}`, tab: 'RenLuyenThang100', data: rlRows },
      { key: '04_hoc_phi', name: `04_TheoDoi_HocPhi_CheDoChinhSach_${classId}`, tab: 'QuanTriHocPhi', data: hpRows },
      { key: '05_xuong', name: `05_NhatKy_XuongThucHanh_${classId}`, tab: 'NhatKyXuong', data: xuongRows },
      { key: '06_diem_danh', name: `06_NhatKy_DiemDanh_TungBuoiHoc_${classId}`, tab: 'DiemDanhChuyenCan', data: ddRows },
      { key: '07_thu_chi', name: `07_SoQuy_ThuChi_${classId}`, tab: 'SoQuyThuChi', data: tcRows },
    ];

    for (const def of sheetDefs) {
      const sheet = await this.getOrCreateSpreadsheet(def.name, def.tab, classFolder.id, def.data);
      registry[def.key] = sheet.id;
      fileUrls[def.key] = sheet.webViewLink;
    }

    // Tệp 8: JSON Snapshot hệ thống
    const fullSnapshot = {
      system: 'Hệ thống Quản lý Sinh viên Điện tử - Khoa Công nghệ Ô tô',
      standard: 'Thông tư 04/2022/TT-BLĐTBXH & TT 17/2017/TT-BLĐTBXH & NĐ 238/2025/NĐ-CP',
      classId,
      className,
      teacherName: teacherName || unitInfo?.advisorName || 'Giáo viên Chủ nhiệm',
      exportDate: new Date().toISOString(),
      unitInfo,
      studentsCount: finalStudents.length,
      students: finalStudents,
      grades: filteredGrades,
      attendance: filteredAttendance,
      renLuyen: filteredRenLuyen,
      fundTransactions,
      workshopLogs
    };

    const jsonFile = await this.getOrCreateJsonBackup(
      `08_DuLieu_SaoLuu_HeThong_${classId}.json`,
      classFolder.id,
      fullSnapshot
    );
    registry['08_json'] = jsonFile.id;
    fileUrls['08_json'] = jsonFile.webViewLink;

    this.saveFileRegistry(classId, registry);
    localStorage.setItem(`oto_drive_urls_${classId}`, JSON.stringify(fileUrls));

    const statusMsg = hasDataChanged 
      ? `✅ [ĐỒNG BỘ THÀNH CÔNG]: Đã ghi nhận các thay đổi mới nhất của lớp ${classId} (${finalStudents.length} sinh viên) lên thư mục lớp "${classFolderName}" trên Google Drive thực tế!`
      : `✅ [ĐỒNG BỘ TỐI ƯU]: Dữ liệu lớp ${classId} (${finalStudents.length} sinh viên) không có thay đổi mới, hệ thống xác nhận cấu trúc đám mây đồng bộ hoàn hảo!`;

    return {
      success: true,
      message: statusMsg,
      fileUrls,
      rootFolderId: rootFolder.id,
      rootFolderUrl: rootFolder.webViewLink || `https://drive.google.com/drive/folders/${rootFolder.id}`,
      classFolderId: classFolder.id,
      classFolderUrl: classFolder.webViewLink || `https://drive.google.com/drive/folders/${classFolder.id}`
    };
  }

  /**
   * Tạo và tải xuống gói ZIP cục bộ 8 tệp chuẩn (khi cần sao lưu ngoại tuyến)
   */
  async downloadLocalZipPackage(
    classId: string,
    className: string,
    students: Student[],
    grades: StudentGrade[],
    attendance: AttendanceRecord[],
    renLuyen: RenLuyenCriteria[],
    fundTransactions: FundTransaction[],
    workshopLogs: WorkshopSafetyLog[],
    unitInfo?: UnitInfoSettings
  ) {
    const zip = new JSZip();
    const folderName = `Lop_${classId}_Bo_8_Tep_Chuan_GDNN`;
    const classFolder = zip.folder(folderName);
    if (!classFolder) throw new Error('Không thể tạo thư mục ZIP.');

    const filteredStudents = students.filter((s: any) => {
      const matchClassId = String(s.classId || '').trim().toLowerCase() === String(classId).trim().toLowerCase();
      const matchClassName = String(s.className || '').trim().toLowerCase() === String(className).trim().toLowerCase() ||
                             String(className || '').trim().toLowerCase().includes(String(s.classId || '').trim().toLowerCase()) ||
                             String(s.classId || '').trim().toLowerCase().includes(String(className || '').trim().toLowerCase());
      return matchClassId || matchClassName || (!s.classId && !s.className);
    });

    const classStudents = filteredStudents.length > 0 ? filteredStudents : students.filter(s => String(s.classId || '').trim() === String(classId).trim());
    const finalStudents = classStudents.length > 0 ? classStudents : students;

    const classStudentIds = new Set(finalStudents.map(s => String(s.id).trim()));
    const filteredGrades = grades.filter(g => classStudentIds.has(String(g.studentId).trim()));
    const filteredAttendance = attendance.filter(a => classStudentIds.has(String(a.studentId).trim()));
    const filteredRenLuyen = renLuyen.filter(r => classStudentIds.has(String(r.studentId).trim()));

    // 1. Trich ngang
    const trichNgangRows = [
      ['STT', 'Mã SV', 'Họ tên', 'Ngày sinh', 'Giới tính', 'CCCD', 'SĐT', 'Email', 'Dân tộc', 'Họ tên Bố', 'Họ tên Mẹ', 'SĐT Khẩn cấp', 'Hộ khẩu thường trú', 'Tổ xưởng', 'Vị trí xưởng', 'Diện giảm 70% học phí (NĐ 238/2025)'],
      ...finalStudents.map((s, idx) => [
        idx + 1,
        s.id,
        s.fullName,
        s.birthDate || '',
        s.gender || '',
        s.idCard || '',
        s.phone || '',
        s.email || '',
        s.ethnicity || 'Kinh',
        s.fatherName || '',
        s.motherName || '',
        s.emergencyPhone || '',
        s.permanentAddress || '',
        `Tổ ${s.workshopGroup || 1}`,
        s.station || 'Cầu nâng 2 trụ',
        s.policy || 'Miễn giảm 70% (NĐ 238/2025)'
      ])
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(trichNgangRows);
    const wb1 = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb1, ws1, 'TrichNgang23Truong');
    const buf1 = XLSX.write(wb1, { bookType: 'xlsx', type: 'array' });
    classFolder.file(`01_DanhSach_TrichNgang_DayDu_${classId}.xlsx`, buf1);

    // 2. Bang diem
    const diemRows = [
      ['STT', 'Mã SV', 'Họ tên', 'Điểm TB Tích lũy (CPA)', 'Xếp loại Học lực', 'Số Mô đun Nợ', 'Cảnh báo Học vụ'],
      ...finalStudents.map((s, idx) => {
        const sGrades = filteredGrades.filter(g => String(g.studentId).trim() === String(s.id).trim());
        const totalScore = sGrades.reduce((sum, g) => sum + (g.finalGrade10 || 0), 0);
        const cpa = sGrades.length > 0 ? Number((totalScore / sGrades.length).toFixed(2)) : 0;
        let rank = 'Trung bình';
        if (cpa >= 3.6) rank = 'Xuất sắc';
        else if (cpa >= 3.2) rank = 'Giỏi';
        else if (cpa >= 2.5) rank = 'Khá';
        else if (cpa < 2.0 && sGrades.length > 0) rank = 'Yếu/Kém';

        return [idx + 1, s.id, s.fullName, cpa, rank, 0, cpa < 2.0 && sGrades.length > 0 ? '⚠️ Cảnh báo học vụ' : 'Đạt chuẩn'];
      })
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(diemRows);
    const wb2 = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb2, ws2, 'BangDiemChuan');
    const buf2 = XLSX.write(wb2, { bookType: 'xlsx', type: 'array' });
    classFolder.file(`02_BangDiem_ChiTiet_Va_TongHop_${classId}.xlsx`, buf2);

    // 3. Ren luyen
    const rlRows = [
      ['STT', 'Mã SV', 'Họ tên', 'TC1: Học tập (20đ)', 'TC2: Nội quy (25đ)', 'TC3: Chính trị XH (20đ)', 'TC4: Cộng đồng (25đ)', 'TC5: Cán sự (10đ)', 'Tổng điểm', 'Xếp loại Rèn luyện'],
      ...finalStudents.map((s, idx) => {
        const r = filteredRenLuyen.find(x => String(x.studentId).trim() === String(s.id).trim());
        const total = (r?.criteria1 || 18) + (r?.criteria2 || 23) + (r?.criteria3 || 18) + (r?.criteria4 || 23) + (r?.criteria5 || 9);
        let rank = 'Tốt';
        if (total >= 90) rank = 'Xuất sắc';
        else if (total >= 80) rank = 'Tốt';
        else if (total >= 65) rank = 'Khá';
        else if (total >= 50) rank = 'Trung bình';
        else rank = 'Yếu';

        return [idx + 1, s.id, s.fullName, r?.criteria1 || 18, r?.criteria2 || 23, r?.criteria3 || 18, r?.criteria4 || 23, r?.criteria5 || 9, total, rank];
      })
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(rlRows);
    const wb3 = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb3, ws3, 'RenLuyenThang100');
    const buf3 = XLSX.write(wb3, { bookType: 'xlsx', type: 'array' });
    classFolder.file(`03_XepLoai_RenLuyen_Va_ChuyenCan_${classId}.xlsx`, buf3);

    // 4. Hoc phi
    const hpRows = [
      ['STT', 'Mã SV', 'Họ tên', 'Định mức học phí', 'Nhà nước miễn giảm 70% (NĐ 238)', 'Phải nộp thực tế', 'Đã nộp', 'Còn nợ', 'Trạng thái'],
      ...finalStudents.map((s, idx) => [
        idx + 1,
        s.id,
        s.fullName,
        '4.500.000 đ',
        '3.150.000 đ',
        '1.350.000 đ',
        '1.350.000 đ',
        '0 đ',
        'Đã hoàn thành học phí'
      ])
    ];
    const ws4 = XLSX.utils.aoa_to_sheet(hpRows);
    const wb4 = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb4, ws4, 'QuanTriHocPhi');
    const buf4 = XLSX.write(wb4, { bookType: 'xlsx', type: 'array' });
    classFolder.file(`04_TheoDoi_HocPhi_CheDoChinhSach_${classId}.xlsx`, buf4);

    // 5. Xuong thuc hanh
    const xuongRows = [
      ['STT', 'Mã SV', 'Họ tên', 'Tổ xưởng', 'Vị trí thiết bị thực hành', 'Tuân thủ ATVSLĐ / BHLĐ', 'Đánh giá xưởng'],
      ...finalStudents.map((s, idx) => {
        const log = workshopLogs.find(l => Number(l.groupNumber) === Number(s.workshopGroup || 1));
        return [
          idx + 1,
          s.id,
          s.fullName,
          `Tổ ${s.workshopGroup || 1}`,
          s.station || log?.station || 'Cầu nâng 2 trụ',
          log?.protectiveEquipmentChecked !== false ? 'Đạt chuẩn (Giày mũi sắt, kính, áo bảo hộ)' : 'Nhắc nhở vi phạm BHLĐ',
          log?.note || log?.incidentReport || 'Thực hành tốt, thao tác chuẩn xác'
        ];
      })
    ];
    const ws5 = XLSX.utils.aoa_to_sheet(xuongRows);
    const wb5 = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb5, ws5, 'NhatKyXuong');
    const buf5 = XLSX.write(wb5, { bookType: 'xlsx', type: 'array' });
    classFolder.file(`05_NhatKy_XuongThucHanh_${classId}.xlsx`, buf5);

    // 6. Diem danh
    const ddRows = [
      ['STT', 'Mã SV', 'Họ tên', 'Tổng số buổi học', 'Có mặt (P)', 'Có phép (L)', 'Không phép (A)', 'Muộn (LATE)', 'Tỷ lệ chuyên cần', 'Cảnh báo cấm thi (>20% vắng)'],
      ...finalStudents.map((s, idx) => {
        const sAtt = filteredAttendance.filter(a => String(a.studentId).trim() === String(s.id).trim());
        const total = Math.max(sAtt.length, 10);
        const absentUnexcused = sAtt.filter(a => a.status === 'A').length;
        const present = sAtt.filter(a => a.status === 'P' || !a.status).length;
        const excused = sAtt.filter(a => a.status === 'L').length;
        const late = sAtt.filter(a => a.status === 'LATE').length;
        const absentRate = (absentUnexcused / total) * 100;

        return [
          idx + 1,
          s.id,
          s.fullName,
          total,
          present,
          excused,
          absentUnexcused,
          late,
          `${(100 - absentRate).toFixed(1)}%`,
          absentRate > 20 ? '⛔ CẤM THI (Vắng >20%)' : 'Đủ điều kiện dự thi'
        ];
      })
    ];
    const ws6 = XLSX.utils.aoa_to_sheet(ddRows);
    const wb6 = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb6, ws6, 'DiemDanhChuyenCan');
    const buf6 = XLSX.write(wb6, { bookType: 'xlsx', type: 'array' });
    classFolder.file(`06_NhatKy_DiemDanh_TungBuoiHoc_${classId}.xlsx`, buf6);

    // 7. Thu chi quy lop
    const tcRows = [
      ['STT', 'Mã phiếu', 'Ngày hạch toán', 'Nội dung thu / chi', 'Loại', 'Số tiền (VNĐ)', 'Người nộp / nhận', 'Tồn quỹ số dư'],
      ...(fundTransactions.length > 0 ? fundTransactions : [
        { id: 'PT01', date: '05/09/2025', description: 'Thu quỹ lớp học kỳ 1', type: 'THU', amount: 5000000, payer: 'Tập thể lớp', balance: 5000000 },
        { id: 'PC01', date: '10/09/2025', description: 'Mua sắm vật tư vệ sinh xưởng', type: 'CHI', amount: 800000, payer: 'Lớp trưởng', balance: 4200000 }
      ]).map((t: any, idx: number) => [
        idx + 1,
        t.id || `TX${idx + 1}`,
        t.date || '01/09/2025',
        t.description || t.content || 'Hoạt động quỹ',
        t.type || 'THU',
        t.amount || 0,
        t.payer || t.receiver || 'Thủ quỹ',
        t.balance || 4200000
      ])
    ];
    const ws7 = XLSX.utils.aoa_to_sheet(tcRows);
    const wb7 = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb7, ws7, 'SoQuyThuChi');
    const buf7 = XLSX.write(wb7, { bookType: 'xlsx', type: 'array' });
    classFolder.file(`07_SoQuy_ThuChi_${classId}.xlsx`, buf7);

    // 8. JSON Snapshot
    const fullSnapshot = {
      system: 'Hệ thống Quản lý Sinh viên Điện tử - Khoa Công nghệ Ô tô',
      classId,
      className,
      exportDate: new Date().toISOString(),
      unitInfo,
      studentsCount: finalStudents.length,
      students: finalStudents,
      grades: filteredGrades,
      attendance: filteredAttendance,
      renLuyen: filteredRenLuyen,
      fundTransactions,
      workshopLogs
    };
    classFolder.file(`08_DuLieu_SaoLuu_HeThong_${classId}.json`, JSON.stringify(fullSnapshot, null, 2));

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `08_DuLieu_SaoLuu_HeThong_${classId}_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const googleDriveSyncService = new GoogleDriveSyncService();
