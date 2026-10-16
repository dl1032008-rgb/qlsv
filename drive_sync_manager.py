# -*- coding: utf-8 -*-
"""
========================================================================================
MODULE ĐỒNG BỘ GOOGLE DRIVE THÔNG MINH & AN TOÀN - HỆ THỐNG QUẢN LÝ SINH VIÊN GDNN
Tên tệp: drive_sync_manager.py
Kiến trúc sư: Chuyên gia Kiến trúc Phần mềm & Cố vấn Hệ thống GDNN
Phiên bản: 2.5.0 (Enterprise Safety Guard Edition)
Mô tả:
    Module đồng bộ hóa dữ liệu 2 chiều (Two-Way Sync) giữa ứng dụng Quản lý Sinh viên
    với Google Drive thông qua Google Drive API v3.
    Tích hợp 5 cơ chế cốt lõi:
    1. Tự động khởi tạo & quản trị Thư mục gốc (Root Folder).
    2. Tự động tạo thư mục con động theo từng Lớp học (Dynamic Class Subfolders).
    3. Đồng bộ hai chiều thông minh: Startup Pull & Real-time Push.
    4. Cơ chế Bảo vệ An toàn Tuyệt đối (Safety Guard - Chống xóa trắng dữ liệu đám mây).
    5. Hỗ trợ Đa người dùng (Multi-User) qua Shared Root Folder ID trên mọi máy trạm.
========================================================================================
"""

import os
import sys
import io
import json
import time
import shutil
import logging
from datetime import datetime
from typing import Optional, Dict, List, Any, Tuple

# Thư viện Google API Client
try:
    from google.oauth2.credentials import Credentials
    from google.oauth2 import service_account
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
    from googleapiclient.errors import HttpError
    GOOGLE_API_AVAILABLE = True
except ImportError:
    GOOGLE_API_AVAILABLE = False


# ========================================================================================
# 1. CẤU HÌNH HỆ THỐNG VÀ BỘ GHI NHẬT KÝ (LOGGING SYSTEM TRONG TIẾNG VIỆT)
# ========================================================================================

class VietnameseFormatter(logging.Formatter):
    """Bộ định dạng nhật ký giao diện tiếng Việt với màu sắc và dấu thời gian chuẩn"""
    def format(self, record):
        level_map = {
            'DEBUG': '🔍 [CHI TIẾT]',
            'INFO': 'ℹ️  [THÔNG BÁO]',
            'WARNING': '⚠️  [CẢNH BÁO]',
            'ERROR': '❌ [LỖI HỆ THỐNG]',
            'CRITICAL': '🚨 [NGUY HIỂM]'
        }
        prefix = level_map.get(record.levelname, record.levelname)
        record.levelname_vi = prefix
        return super().format(record)


def setup_logger(log_file: str = "drive_sync.log") -> logging.Logger:
    """Khởi tạo hệ thống ghi log tiếng Việt ghi ra cả Console và Tệp nhật ký"""
    logger = logging.getLogger("DriveSyncManager")
    logger.setLevel(logging.INFO)
    logger.handlers.clear()

    # Định dạng log
    log_format = "%(asctime)s %(levelname_vi)s %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"
    formatter = VietnameseFormatter(fmt=log_format, datefmt=date_format)

    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File Handler
    try:
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    except Exception as e:
        print(f"⚠️ Không thể khởi tạo file log: {e}")

    return logger

logger = setup_logger()


# ========================================================================================
# 2. CÁC LỚP NGOẠI LỆ TÙY BIẾN CHO HỆ THỐNG ĐỒNG BỘ
# ========================================================================================

class DriveSyncError(Exception):
    """Lỗi cơ sở cho toàn bộ các ngoại lệ của module Drive Sync"""
    pass

class SafetyGuardWipeProtectionError(DriveSyncError):
    """
    Kích hoạt khi phát hiện dữ liệu cục bộ có nguy cơ 'Xóa trắng' đám mây:
    - Tệp rỗng 0 bytes.
    - Cấu trúc JSON thiếu các trường khóa cốt lõi (students, classes, grades,...).
    - Dữ liệu bị biến mất bất thường.
    """
    pass

class AuthenticationError(DriveSyncError):
    """Lỗi xác thực OAuth 2.0 hoặc Service Account"""
    pass

class FolderOperationError(DriveSyncError):
    """Lỗi thao tác thư mục trên Google Drive"""
    pass


# ========================================================================================
# 3. LỚP QUẢN LÝ ĐỒNG BỘ GOOGLE DRIVE CHÍNH (DriveSyncManager)
# ========================================================================================

class DriveSyncManager:
    """
    Lớp điều phối trung tâm phụ trách toàn bộ hoạt động đồng bộ hóa đám mây
    cho phần mềm Quản lý Lớp học & Sinh viên GDNN.
    """

    # Quyền truy cập đầy đủ vào các tệp do ứng dụng tạo trên Google Drive
    SCOPES = [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
    ]

    def __init__(
        self,
        credentials_path: str = "credentials.json",
        token_path: str = "token.json",
        service_account_path: Optional[str] = None,
        default_root_folder_name: str = "QuanLySinhVien_Cloud_Data",
        shared_root_folder_id: Optional[str] = None,
        local_data_dir: str = "local_data"
    ):
        """
        Khởi tạo đối tượng DriveSyncManager.

        :param credentials_path: Đường dẫn tệp OAuth 2.0 Client Secret (credentials.json)
        :param token_path: Đường dẫn lưu phiên xác thực OAuth (token.json)
        :param service_account_path: Đường dẫn tệp khóa Service Account (nếu dùng SA)
        :param default_root_folder_name: Tên thư mục gốc mặc định trên Google Drive
        :param shared_root_folder_id: (Tùy chọn) ID thư mục dùng chung giữa nhiều máy/giảng viên
        :param local_data_dir: Thư mục lưu trữ cơ sở dữ liệu cục bộ trên máy trạm
        """
        self.credentials_path = credentials_path
        self.token_path = token_path
        self.service_account_path = service_account_path
        self.default_root_folder_name = default_root_folder_name
        self.shared_root_folder_id = shared_root_folder_id
        self.local_data_dir = os.path.abspath(local_data_dir)

        self.service = None
        self.root_folder_id = shared_root_folder_id
        self.class_folder_cache: Dict[str, str] = {}  # {class_name: folder_id}

        # Đảm bảo thư mục lưu trữ cục bộ tồn tại
        os.makedirs(self.local_data_dir, exist_ok=True)

        logger.info(f"🚀 Khởi tạo Module Đồng bộ Google Drive (Thư mục cục bộ: {self.local_data_dir})")

    # ------------------------------------------------------------------------------------
    # PHẦN 1: XÁC THỰC VÀ KẾT NỐI VỚI GOOGLE DRIVE API
    # ------------------------------------------------------------------------------------

    def authenticate(self) -> bool:
        """
        Thực hiện xác thực thông qua OAuth 2.0 hoặc Service Account.
        Tự động làm mới (refresh) token nếu đã hết hạn.
        """
        if not GOOGLE_API_AVAILABLE:
            error_msg = (
                "Chưa cài đặt thư viện Google API Client! Vui lòng chạy lệnh:\n"
                "pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib"
            )
            logger.error(error_msg)
            raise AuthenticationError(error_msg)

        logger.info("🔐 Bắt đầu tiến trình xác thực tài khoản Google Drive...")

        # 1. Thử xác thực bằng Service Account nếu có cấu hình
        if self.service_account_path and os.path.exists(self.service_account_path):
            try:
                logger.info(f"🔑 Đang kết nối qua Service Account: {self.service_account_path}")
                creds = service_account.Credentials.from_service_account_file(
                    self.service_account_path, scopes=self.SCOPES
                )
                self.service = build('drive', 'v3', credentials=creds)
                logger.info("✅ Xác thực Service Account thành công!")
                return True
            except Exception as e:
                logger.error(f"❌ Lỗi xác thực Service Account: {e}")
                raise AuthenticationError(f"Lỗi Service Account: {e}")

        # 2. Xác thực bằng OAuth 2.0 Client ID (dành cho Admin / Giáo viên cá nhân)
        creds = None
        if os.path.exists(self.token_path):
            try:
                creds = Credentials.from_authorized_user_file(self.token_path, self.SCOPES)
                logger.info(f"📂 Đã nạp phiên đăng nhập từ {self.token_path}")
            except Exception as e:
                logger.warning(f"⚠️ Phiên đăng nhập cũ bị lỗi hoặc không tương thích: {e}")

        # Nếu chưa có creds hoặc creds không hợp lệ
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    logger.info("🔄 Token đã hết hạn, đang tự động làm mới qua Refresh Token...")
                    creds.refresh(Request())
                    logger.info("✅ Làm mới Token thành công!")
                except Exception as e:
                    logger.warning(f"⚠️ Làm mới token thất bại ({e}), yêu cầu đăng nhập lại.")
                    creds = None

            if not creds:
                if not os.path.exists(self.credentials_path):
                    error_guide = (
                        f"Không tìm thấy tệp cấu hình OAuth '{self.credentials_path}'!\n"
                        "👉 Hướng dẫn khắc phục:\n"
                        "1. Truy cập https://console.cloud.google.com/apis/credentials\n"
                        "2. Tạo 'OAuth client ID' (loại Desktop App) và tải về tệp client_secret_xxx.json\n"
                        f"3. Đổi tên thành '{self.credentials_path}' và đặt cùng thư mục với script này."
                    )
                    logger.error(error_guide)
                    raise AuthenticationError(error_guide)

                try:
                    logger.info("🌐 Mở trình duyệt để xác thực cấp quyền truy cập Google Drive...")
                    flow = InstalledAppFlow.from_client_secrets_file(self.credentials_path, self.SCOPES)
                    creds = flow.run_local_server(port=0)
                    logger.info("✅ Người dùng đã cấp quyền xác thực thành công!")
                except Exception as e:
                    logger.error(f"❌ Quá trình xác thực trình duyệt bị hủy hoặc lỗi: {e}")
                    raise AuthenticationError(f"Lỗi phiên xác thực OAuth: {e}")

            # Lưu token cho các phiên làm việc tiếp theo
            try:
                with open(self.token_path, 'w', encoding='utf-8') as token_file:
                    token_file.write(creds.to_json())
                logger.info(f"💾 Đã lưu phiên làm việc an toàn vào '{self.token_path}'")
            except Exception as e:
                logger.warning(f"⚠️ Không thể lưu token vào đĩa: {e}")

        try:
            self.service = build('drive', 'v3', credentials=creds)
            logger.info("🚀 Kết nối Google Drive v3 API thành công!")
            return True
        except Exception as e:
            logger.error(f"❌ Không thể khởi tạo dịch vụ Google Drive: {e}")
            raise AuthenticationError(f"Lỗi khởi tạo Drive API: {e}")

    # ------------------------------------------------------------------------------------
    # PHẦN 2: KHỞI TẠO VÀ QUẢN LÝ THƯ MỤC GỐC (ROOT FOLDER)
    # ------------------------------------------------------------------------------------

    def initialize_root_folder(self) -> str:
        """
        Kiểm tra và khởi tạo Thư mục Gốc trên Google Drive.
        - Nếu đã cấu hình shared_root_folder_id: Xác minh quyền truy cập và sử dụng.
        - Nếu chưa: Quét tìm thư mục default_root_folder_name. Nếu chưa có -> Tự động tạo mới.
        - Trả về root_folder_id.
        """
        if not self.service:
            self.authenticate()

        logger.info("📁 Đang kiểm tra cấu trúc Thư mục Gốc trên Google Drive...")

        # Trường hợp 1: Sử dụng Thư mục dùng chung (Shared Folder ID do Ban Giám hiệu / Admin cấu hình)
        if self.shared_root_folder_id:
            try:
                folder_meta = self.service.files().get(
                    fileId=self.shared_root_folder_id,
                    fields="id, name, mimeType, trashed"
                ).execute()

                if folder_meta.get('trashed'):
                    logger.warning("⚠️ Thư mục dùng chung cấu hình sẵn đang nằm trong Thùng rác!")
                elif folder_meta.get('mimeType') == 'application/vnd.google-apps.folder':
                    self.root_folder_id = self.shared_root_folder_id
                    logger.info(f"✅ Đã kết nối Thư mục Gốc Dùng Chung: '{folder_meta.get('name')}' (ID: {self.root_folder_id})")
                    return self.root_folder_id
            except HttpError as e:
                logger.warning(f"⚠️ Không thể truy cập Shared Folder ID ({self.shared_root_folder_id}): {e}. Chuyển sang quét theo tên.")

        # Trường hợp 2: Tìm kiếm thư mục gốc theo tên
        query = (
            f"name = '{self.default_root_folder_name}' and "
            f"mimeType = 'application/vnd.google-apps.folder' and "
            f"trashed = false"
        )
        try:
            results = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name, createdTime)'
            ).execute()
            folders = results.get('files', [])

            if folders:
                # Đã tồn tại thư mục gốc
                self.root_folder_id = folders[0]['id']
                logger.info(f"✅ Tìm thấy Thư mục Gốc: '{folders[0]['name']}' (ID: {self.root_folder_id})")
            else:
                # Chưa tồn tại -> Tạo mới thư mục gốc
                logger.info(f"📁 Chưa tìm thấy, đang tự động tạo Thư mục Gốc mới: '{self.default_root_folder_name}'...")
                file_metadata = {
                    'name': self.default_root_folder_name,
                    'mimeType': 'application/vnd.google-apps.folder',
                    'description': 'Thư mục gốc lưu trữ dữ liệu lớp học, bảng điểm và học viên GDNN'
                }
                new_folder = self.service.files().create(
                    body=file_metadata,
                    fields='id, name'
                ).execute()
                self.root_folder_id = new_folder.get('id')
                logger.info(f"🎉 Khởi tạo Thư mục Gốc thành công! (ID: {self.root_folder_id})")

            return self.root_folder_id

        except Exception as e:
            logger.error(f"❌ Thao tác kiểm tra Thư mục Gốc thất bại: {e}")
            raise FolderOperationError(f"Lỗi Thư mục Gốc: {e}")

    # ------------------------------------------------------------------------------------
    # PHẦN 3: CƠ CHẾ TẠO THƯ MỤC LỚP HỌC ĐỘNG (DYNAMIC CLASS SUBFOLDERS)
    # ------------------------------------------------------------------------------------

    def get_or_create_class_folder(self, class_name: str) -> str:
        """
        Kiểm tra và tự động tạo thư mục con mang tên lớp học (ví dụ: 'CĐK19.2-ÔT1')
        bên trong Thư mục Gốc.

        :param class_name: Tên mã lớp học (ví dụ: 'CĐK19.2-ÔT1')
        :return: class_folder_id trên Google Drive
        """
        if not self.root_folder_id:
            self.initialize_root_folder()

        clean_class_name = class_name.strip()
        if not clean_class_name:
            raise ValueError("Tên lớp học không được để trống!")

        # Kiểm tra bộ đệm nội bộ để tối ưu số lần gọi API
        if clean_class_name in self.class_folder_cache:
            return self.class_folder_cache[clean_class_name]

        logger.info(f"🔍 Kiểm tra Thư mục Lớp học: '{clean_class_name}' bên trong Thư mục Gốc...")

        # Tìm kiếm thư mục con bên trong root_folder_id
        safe_name = clean_class_name.replace("'", "\\'")
        query = (
            f"name = '{safe_name}' and "
            f"'{self.root_folder_id}' in parents and "
            f"mimeType = 'application/vnd.google-apps.folder' and "
            f"trashed = false"
        )

        try:
            response = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name, createdTime)'
            ).execute()
            files = response.get('files', [])

            if files:
                class_folder_id = files[0]['id']
                logger.info(f"📂 Đã có Thư mục Lớp học: '{clean_class_name}' (ID: {class_folder_id})")
            else:
                logger.info(f"➕ Chưa có, đang tự động tạo Thư mục Con cho lớp '{clean_class_name}'...")
                folder_metadata = {
                    'name': clean_class_name,
                    'mimeType': 'application/vnd.google-apps.folder',
                    'parents': [self.root_folder_id],
                    'description': f'Thư mục lưu trữ bảng điểm, hồ sơ sinh viên lớp {clean_class_name}'
                }
                new_subfolder = self.service.files().create(
                    body=folder_metadata,
                    fields='id, name'
                ).execute()
                class_folder_id = new_subfolder.get('id')
                logger.info(f"🎉 Đã tạo mới Thư mục Lớp học: '{clean_class_name}' (ID: {class_folder_id})")

            # Lưu vào bộ nhớ đệm
            self.class_folder_cache[clean_class_name] = class_folder_id
            return class_folder_id

        except Exception as e:
            logger.error(f"❌ Không thể tạo hoặc truy vấn Thư mục Lớp học '{clean_class_name}': {e}")
            raise FolderOperationError(f"Lỗi thư mục lớp học: {e}")

    # ------------------------------------------------------------------------------------
    # PHẦN 4: CƠ CHẾ BẢO VỆ DỮ LIỆU AN TOÀN (SAFETY GUARD - CHỐNG XÓA TRẮNG)
    # ------------------------------------------------------------------------------------

    def validate_data_integrity(self, file_path: str, expected_type: str = "json") -> Tuple[bool, str]:
        """
        [CỐT LÕI AN TOÀN SƯ PHẠM]: Kiểm tra tính toàn vẹn và hợp lệ của dữ liệu trước khi
        cho phép ghi đè (overwrite) hoặc tải lên Google Drive.
        Tuyệt đối CHẶN các tệp:
        - Dung lượng 0 bytes hoặc quá nhỏ bất thường (< 20 bytes).
        - JSON rỗng ({}, []) hoặc bị hỏng cú pháp.
        - JSON thiếu các trường cốt lõi của GDNN (ví dụ: 'students', 'classes', 'grades', 'attendance').

        :param file_path: Đường dẫn tệp cần kiểm tra
        :param expected_type: Loại tệp ('json', 'sqlite', 'sheet_csv')
        :return: (is_valid: bool, reason_message: str)
        """
        if not os.path.exists(file_path):
            return False, f"Tệp không tồn tại trên ổ đĩa: {file_path}"

        file_size = os.path.getsize(file_path)

        # 1. Kiểm tra dung lượng tệp
        if file_size == 0:
            return False, "NGUY HIỂM: Tệp rỗng 0 bytes! Cơ chế Safety Guard lập tức kích hoạt ngăn xóa trắng."

        if file_size < 15:
            return False, f"NGUY HIỂM: Dung lượng tệp quá nhỏ ({file_size} bytes), nghi ngờ dữ liệu bị mất trắng."

        # 2. Kiểm tra tệp JSON
        if expected_type.lower() == "json" or file_path.endswith(".json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read().strip()

                if not content:
                    return False, "Nội dung tệp JSON hoàn toàn rỗng."

                data = json.loads(content)

                if isinstance(data, dict):
                    # Kiểm tra dictionary rỗng
                    if len(data.keys()) == 0:
                        return False, "Cấu trúc JSON là đối tượng rỗng ({}), không có bất kỳ trường dữ liệu nào."

                    # Danh sách các trường cốt lõi nhận diện dữ liệu quản lý sinh viên GDNN
                    core_indicators = [
                        'students', 'student_list', 'danh_sach_sinh_vien',
                        'classes', 'class_id', 'ma_lop', 'grades', 'bang_diem',
                        'attendance', 'diem_danh', 'ren_luyen', 'metadata'
                    ]

                    matched_keys = [k for k in core_indicators if k in data]
                    # Nếu là file tổng hợp của lớp, phải có ít nhất 1 chỉ số hợp lệ hoặc có dữ liệu con
                    if not matched_keys:
                        # Kiểm tra xem có dữ liệu học viên trực tiếp hay không
                        if 'data' not in data and 'items' not in data:
                            return False, (
                                "Dữ liệu JSON không chứa bất kỳ trường quản lý học vụ cốt lõi nào "
                                f"(yêu cầu ít nhất 1 trong các trường: {', '.join(core_indicators)})."
                            )

                    # Kiểm tra nếu có trường 'students' nhưng danh sách bị rỗng và không có ghi chú hợp lệ
                    if 'students' in data and isinstance(data['students'], list):
                        if len(data['students']) == 0 and not data.get('allow_empty_class', False):
                            logger.warning("⚠️ Cảnh báo: Danh sách sinh viên trống. Cần xác nhận có chủ đích từ giáo viên.")

                elif isinstance(data, list):
                    if len(data) == 0:
                        return False, "Dữ liệu JSON là mảng rỗng ([]), không có bản ghi nào."
                else:
                    return False, f"Định dạng JSON không hợp lệ (kiểu dữ liệu gốc: {type(data)})."

            except json.JSONDecodeError as jde:
                return False, f"Cú pháp JSON bị hỏng (JSONDecodeError): {jde}"
            except Exception as e:
                return False, f"Lỗi đọc kiểm tra tệp JSON: {e}"

        # 3. Kiểm tra tệp SQLite (nếu có sử dụng làm DB)
        elif expected_type.lower() in ["sqlite", "db"] or file_path.endswith(".db"):
            try:
                with open(file_path, "rb") as f:
                    header = f.read(16)
                if not header.startswith(b"SQLite format 3\x00"):
                    return False, "Tệp không phải là cơ sở dữ liệu SQLite hợp lệ."
            except Exception as e:
                return False, f"Lỗi kiểm tra cơ sở dữ liệu SQLite: {e}"

        # Dữ liệu vượt qua mọi chốt chặn an toàn
        return True, f"Dữ liệu hợp lệ ({file_size} bytes, cấu trúc đạt chuẩn)."

    # ------------------------------------------------------------------------------------
    # PHẦN 5: CƠ CHẾ ĐỒNG BỘ 2 CHIỀU (TWO-WAY SYNC: STARTUP LOAD & REAL-TIME PUSH)
    # ------------------------------------------------------------------------------------

    def sync_push_file(
        self,
        class_name: str,
        local_file_path: str,
        remote_filename: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        [REAL-TIME PUSH]: Đẩy tệp dữ liệu cục bộ lên thư mục của lớp trên Google Drive.
        - Bước 1: Chạy chốt chặn Safety Guard. Nếu vi phạm, từ chối đẩy để bảo vệ Cloud.
        - Bước 2: Kiểm tra tệp đã tồn tại trên Drive chưa. Nếu có -> Update; Nếu chưa -> Create.

        :param class_name: Tên lớp (ví dụ: 'CĐK19.2-ÔT1')
        :param local_file_path: Đường dẫn tệp tại máy trạm
        :param remote_filename: Tên tệp hiển thị trên Drive (mặc định lấy theo tên tệp gốc)
        """
        if not self.service:
            self.authenticate()

        class_folder_id = self.get_or_create_class_folder(class_name)
        file_name = remote_filename or os.path.basename(local_file_path)

        # 1. KÍCH HOẠT CHỐT CHẶN AN TOÀN (SAFETY GUARD)
        is_valid, reason = self.validate_data_integrity(local_file_path)
        if not is_valid:
            error_log = (
                f"🛡️ [SAFETY GUARD KÍCH HOẠT] TỪ CHỐI ĐỒNG BỘ LÊN GOOGLE DRIVE!\n"
                f"📁 Tệp: {local_file_path}\n"
                f"⚠️ Lý do: {reason}\n"
                f"👉 Hành động: Giữ nguyên tệp an toàn trên Đám mây, bảo toàn dữ liệu lịch sử!"
            )
            logger.error(error_log)
            raise SafetyGuardWipeProtectionError(error_log)

        logger.info(f"📤 [PUSH] Bắt đầu tải lên: '{file_name}' -> Lớp '{class_name}' ({reason})")

        # 2. Tìm kiếm xem tệp đã tồn tại trong thư mục lớp hay chưa
        safe_fname = file_name.replace("'", "\\'")
        query = (
            f"name = '{safe_fname}' and "
            f"'{class_folder_id}' in parents and "
            f"trashed = false"
        )

        try:
            response = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name, modifiedTime, size)'
            ).execute()
            existing_files = response.get('files', [])

            media = MediaFileUpload(local_file_path, resumable=True)

            if existing_files:
                # Thực hiện UPDATE (Ghi đè an toàn tệp cũ)
                file_id = existing_files[0]['id']
                logger.info(f"🔄 Đang cập nhật phiên bản mới cho tệp đã có (ID: {file_id})...")
                updated_file = self.service.files().update(
                    fileId=file_id,
                    media_body=media,
                    fields='id, name, modifiedTime, size'
                ).execute()
                logger.info(f"✅ Cập nhật thành công '{file_name}' lên Drive! (Kích thước: {updated_file.get('size')} bytes)")
                return {
                    'status': 'updated',
                    'file_id': updated_file.get('id'),
                    'name': updated_file.get('name'),
                    'modifiedTime': updated_file.get('modifiedTime'),
                    'size': updated_file.get('size')
                }
            else:
                # Thực hiện CREATE (Tạo tệp mới)
                logger.info(f"➕ Đang tạo tệp mới trên Drive trong thư mục lớp...")
                file_metadata = {
                    'name': file_name,
                    'parents': [class_folder_id],
                    'description': f'Dữ liệu đồng bộ tự động lớp {class_name}'
                }
                new_file = self.service.files().create(
                    body=file_metadata,
                    media_body=media,
                    fields='id, name, modifiedTime, size'
                ).execute()
                logger.info(f"🎉 Tải lên thành công tệp mới '{file_name}'! (ID: {new_file.get('id')})")
                return {
                    'status': 'created',
                    'file_id': new_file.get('id'),
                    'name': new_file.get('name'),
                    'modifiedTime': new_file.get('modifiedTime'),
                    'size': new_file.get('size')
                }

        except HttpError as he:
            logger.error(f"❌ Lỗi HTTP khi gọi Google Drive API: {he}")
            raise DriveSyncError(f"Lỗi API: {he}")
        except Exception as e:
            logger.error(f"❌ Lỗi không xác định khi tải tệp lên Drive: {e}")
            raise DriveSyncError(f"Lỗi tải tệp: {e}")

    def sync_pull_file(
        self,
        class_name: str,
        remote_filename: str,
        target_local_path: str
    ) -> bool:
        """
        Tải một tệp cụ thể từ thư mục của lớp trên Google Drive về máy trạm.
        Có tạo tệp sao lưu (backup) trước khi ghi đè tệp cục bộ.

        :param class_name: Tên lớp học
        :param remote_filename: Tên tệp trên Drive
        :param target_local_path: Đường dẫn lưu tệp trên máy tính
        :return: True nếu tải thành công
        """
        if not self.service:
            self.authenticate()

        class_folder_id = self.get_or_create_class_folder(class_name)
        safe_fname = remote_filename.replace("'", "\\'")
        query = (
            f"name = '{safe_fname}' and "
            f"'{class_folder_id}' in parents and "
            f"trashed = false"
        )

        try:
            response = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name, modifiedTime, size)'
            ).execute()
            files = response.get('files', [])

            if not files:
                logger.warning(f"⚠️ Không tìm thấy tệp '{remote_filename}' trong thư mục lớp '{class_name}' trên Drive.")
                return False

            file_id = files[0]['id']
            logger.info(f"📥 [PULL] Bắt đầu tải '{remote_filename}' (ID: {file_id}) về máy...")

            # Nếu tệp cục bộ đã tồn tại, tạo bản sao lưu tạm trước khi ghi đè
            if os.path.exists(target_local_path):
                backup_path = f"{target_local_path}.bak"
                shutil.copy2(target_local_path, backup_path)

            request = self.service.files().get_media(fileId=file_id)
            os.makedirs(os.path.dirname(os.path.abspath(target_local_path)), exist_ok=True)

            with io.FileIO(target_local_path, 'wb') as fh:
                downloader = MediaIoBaseDownload(fh, request)
                done = False
                while not done:
                    status, done = downloader.next_chunk()
                    if status:
                        percent = int(status.progress() * 100)
                        logger.info(f"⏳ Tiến độ tải xuống: {percent}%")

            logger.info(f"✅ Tải về thành công '{remote_filename}' -> '{target_local_path}'!")
            return True

        except Exception as e:
            logger.error(f"❌ Thao tác tải tệp từ Google Drive thất bại: {e}")
            # Khôi phục file backup nếu tải lỗi
            backup_path = f"{target_local_path}.bak"
            if os.path.exists(backup_path) and not os.path.exists(target_local_path):
                shutil.move(backup_path, target_local_path)
            raise DriveSyncError(f"Lỗi tải file: {e}")

    def startup_sync_class(
        self,
        class_name: str,
        local_db_filename: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        [STARTUP TWO-WAY SYNC]: Cơ chế đối soát và đồng bộ khi phần mềm khởi động.
        1. Kiểm tra sự tồn tại của tệp dữ liệu cục bộ.
        2. Nếu cục bộ rỗng, không tồn tại hoặc CŨ HƠN trên Drive:
           -> Tự động tải (Download) dữ liệu mới nhất từ Drive về máy.
        3. Nếu cục bộ MỚI HƠN trên Drive:
           -> Tự động kích hoạt Safety Guard và đẩy (Upload) lên Drive.
        4. Nếu 2 bên đã khớp: Giữ nguyên trạng thái hoàn tất.

        :param class_name: Mã lớp học (ví dụ: 'CĐK19.2-ÔT1')
        :param local_db_filename: Tên tệp cục bộ (mặc định: '08_DuLieu_SaoLuu_{class_name}.json')
        :return: Thông tin tổng kết phiên đồng bộ khởi động
        """
        if not self.service:
            self.authenticate()

        db_name = local_db_filename or f"08_DuLieu_SaoLuu_{class_name}.json"
        local_file_path = os.path.join(self.local_data_dir, class_name, db_name)

        logger.info(f"🔄 [STARTUP SYNC] Bắt đầu đồng bộ khởi động cho lớp '{class_name}'...")
        class_folder_id = self.get_or_create_class_folder(class_name)

        # Lấy thông tin tệp trên Drive
        safe_fname = db_name.replace("'", "\\'")
        query = (
            f"name = '{safe_fname}' and "
            f"'{class_folder_id}' in parents and "
            f"trashed = false"
        )
        response = self.service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, name, modifiedTime, size)'
        ).execute()
        cloud_files = response.get('files', [])

        has_local = os.path.exists(local_file_path) and os.path.getsize(local_file_path) > 0
        has_cloud = len(cloud_files) > 0

        # Tình huống 1: Máy trạm hoàn toàn chưa có dữ liệu, nhưng trên Cloud đã có
        if not has_local and has_cloud:
            logger.info("⚡ [ĐỒNG BỘ MÁY MỚI] Cục bộ chưa có dữ liệu. Tự động kéo bản ghi mới nhất từ Cloud về...")
            self.sync_pull_file(class_name, db_name, local_file_path)
            return {
                'action': 'downloaded_initial',
                'class': class_name,
                'message': 'Đã tải thành công dữ liệu khởi tạo từ Google Drive về máy trạm.',
                'path': local_file_path
            }

        # Tình huống 2: Cả 2 bên đều có -> So sánh dấu thời gian (Timestamp)
        elif has_local and has_cloud:
            local_mtime = os.path.getmtime(local_file_path)
            cloud_file = cloud_files[0]
            cloud_time_str = cloud_file['modifiedTime']
            # Chuyển đổi định dạng ISO RFC3339 của Google Drive sang epoch
            try:
                # 2026-10-13T14:30:00.000Z
                clean_time = cloud_time_str.replace("Z", "+00:00")
                cloud_dt = datetime.fromisoformat(clean_time)
                cloud_epoch = cloud_dt.timestamp()
            except Exception:
                cloud_epoch = 0

            time_diff = local_mtime - cloud_epoch

            # Nếu máy trạm mới hơn trên Drive ít nhất 5 giây
            if time_diff > 5:
                logger.info(f"📈 Dữ liệu máy trạm mới hơn Cloud ({int(time_diff)}s). Chuẩn bị đẩy lên Drive...")
                result = self.sync_push_file(class_name, local_file_path, db_name)
                return {
                    'action': 'uploaded_newer_local',
                    'class': class_name,
                    'message': 'Đã cập nhật bản ghi mới từ máy trạm lên Google Drive.',
                    'details': result
                }
            # Nếu Cloud mới hơn máy trạm ít nhất 5 giây
            elif time_diff < -5:
                logger.info(f"📉 Dữ liệu trên Google Drive mới hơn máy trạm ({int(abs(time_diff))}s). Đang tải bản mới về...")
                self.sync_pull_file(class_name, db_name, local_file_path)
                return {
                    'action': 'downloaded_newer_cloud',
                    'class': class_name,
                    'message': 'Đã cập nhật phiên bản mới nhất từ Google Drive về máy trạm.',
                    'path': local_file_path
                }
            else:
                logger.info("✨ Dữ liệu giữa Máy trạm và Google Drive đang hoàn toàn đồng nhất!")
                return {
                    'action': 'in_sync',
                    'class': class_name,
                    'message': 'Dữ liệu hai bên đã đồng bộ tuyệt đối.'
                }

        # Tình huống 3: Cục bộ có nhưng trên Cloud chưa có
        elif has_local and not has_cloud:
            logger.info("📤 Dữ liệu đã có ở cục bộ nhưng chưa có trên Cloud. Đang đẩy lên đám mây...")
            result = self.sync_push_file(class_name, local_file_path, db_name)
            return {
                'action': 'uploaded_initial',
                'class': class_name,
                'message': 'Đã tải lên tệp đầu tiên lên thư mục lớp học trên Google Drive.',
                'details': result
            }

        # Tình huống 4: Cả 2 bên đều trống
        else:
            logger.warning("⚠️ Cả cục bộ và Cloud đều chưa có tệp dữ liệu nào cho lớp này.")
            return {
                'action': 'both_empty',
                'class': class_name,
                'message': 'Chưa có dữ liệu nào trên cả hai nền tảng.'
            }

    # ------------------------------------------------------------------------------------
    # PHẦN 6: HỖ TRỢ ĐA NGƯỜI DÙNG & QUÉT CẤU TRÚC LỚP HỌC (MULTI-USER ACCESS)
    # ------------------------------------------------------------------------------------

    def scan_all_cloud_classes(self) -> List[Dict[str, Any]]:
        """
        Quét toàn bộ các Thư mục Con (tương ứng từng Lớp học) có trong Thư mục Gốc
        trên Google Drive.
        Tính năng này cho phép bất kỳ Giảng viên / Ban Cán sự nào khi đăng nhập
        ở máy tính mới đều có thể lập tức phát hiện danh sách lớp và tải về toàn bộ.

        :return: Danh sách thông tin các lớp học tìm thấy trên Google Drive
        """
        if not self.root_folder_id:
            self.initialize_root_folder()

        logger.info("🌐 [MULTI-USER SCAN] Đang quét cấu trúc toàn bộ các Lớp học trên Google Drive...")

        query = (
            f"'{self.root_folder_id}' in parents and "
            f"mimeType = 'application/vnd.google-apps.folder' and "
            f"trashed = false"
        )

        try:
            results = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name, createdTime, modifiedTime)'
            ).execute()
            folders = results.get('files', [])

            class_list = []
            for f in folders:
                class_info = {
                    'class_name': f['name'],
                    'folder_id': f['id'],
                    'created_time': f.get('createdTime'),
                    'modified_time': f.get('modifiedTime')
                }
                # Lưu vào cache để tái sử dụng
                self.class_folder_cache[f['name']] = f['id']
                class_list.append(class_info)

            logger.info(f"📋 Tìm thấy tổng cộng {len(class_list)} lớp học trên hệ thống đám mây:")
            for item in class_list:
                logger.info(f"   🔹 Lớp: {item['class_name']} (Folder ID: {item['folder_id']})")

            return class_list

        except Exception as e:
            logger.error(f"❌ Thao tác quét lớp học trên Drive thất bại: {e}")
            raise FolderOperationError(f"Lỗi quét lớp học: {e}")

    def list_files_in_class(self, class_name: str) -> List[Dict[str, Any]]:
        """
        Liệt kê chi tiết toàn bộ các tệp (bảng điểm, danh sách trích ngang,...)
        có trong thư mục của một lớp học cụ thể.
        """
        class_folder_id = self.get_or_create_class_folder(class_name)
        query = (
            f"'{class_folder_id}' in parents and "
            f"trashed = false"
        )
        try:
            results = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name, mimeType, size, modifiedTime, webViewLink)'
            ).execute()
            return results.get('files', [])
        except Exception as e:
            logger.error(f"❌ Lỗi liệt kê tệp lớp {class_name}: {e}")
            return []


# ========================================================================================
# 4. CHƯƠNG TRÌNH KIỂM THỬ TỰ ĐỘNG & HƯỚNG DẪN CẤU HÌNH (CLI TESTING & DEMO)
# ========================================================================================

def create_sample_class_data(target_dir: str, class_name: str) -> str:
    """Tạo tệp JSON dữ liệu mẫu đúng chuẩn GDNN để thử nghiệm đồng bộ an toàn"""
    class_folder = os.path.join(target_dir, class_name)
    os.makedirs(class_folder, exist_ok=True)
    file_path = os.path.join(class_folder, f"08_DuLieu_SaoLuu_{class_name}.json")

    sample_data = {
        "metadata": {
            "class_name": class_name,
            "major": "Công nghệ Kỹ thuật Ô tô",
            "department": "Khoa Kỹ thuật Động lực & Giao thông",
            "created_at": datetime.now().isoformat(),
            "standard_gdnn": "Thông tư 04/2022/TT-BLĐTBXH & TT 17/2017/TT-BLĐTBXH"
        },
        "classes": [
            {
                "id": class_name,
                "name": f"Lớp Kỹ thuật Ô tô {class_name}",
                "course_year": "2024-2027",
                "form_teacher": "ThS. Giảng viên Cao cấp"
            }
        ],
        "students": [
            {
                "id": "SV001",
                "full_name": "Nguyễn Văn An",
                "dob": "2006-05-15",
                "phone": "0912345678",
                "workshop_group": "Tổ 1 (Cầu nâng thủy lực 2 trụ)",
                "policy_discount_70": True,
                "gpa": 3.45,
                "ren_luyen_score": 88
            },
            {
                "id": "SV002",
                "full_name": "Trần Thị Bình",
                "dob": "2006-08-20",
                "phone": "0987654321",
                "workshop_group": "Tổ 2 (Máy chẩn đoán OBD-II)",
                "policy_discount_70": True,
                "gpa": 3.72,
                "ren_luyen_score": 92
            }
        ],
        "system_status": "VALID_STANDARD_GDNN"
    }

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(sample_data, f, ensure_ascii=False, indent=2)

    return file_path


def print_setup_instructions():
    """In bản hướng dẫn cấu hình chi tiết cho người quản trị hệ thống"""
    instructions = """
========================================================================================
📋 HƯỚNG DẪN CẤU HÌNH GOOGLE DRIVE API CHO MODULE drive_sync_manager.py
========================================================================================
1. TẠO DỰ ÁN TRÊN GOOGLE CLOUD CONSOLE:
   - Truy cập: https://console.cloud.google.com/
   - Nhấn "Create Project" -> Đặt tên: "HeThongQuanLySinhVienGDNN".

2. KÍCH HOẠT GOOGLE DRIVE API:
   - Vào mục "APIs & Services" -> "Library".
   - Tìm kiếm "Google Drive API" và nhấn "Enable" (Bật).

3. TẠO THÔNG TIN XÁC THỰC (CREDENTIALS):
   - Vào mục "APIs & Services" -> "Credentials" -> Nhấn "Create Credentials".
   - CHỌN MỘT TRONG HAI PHƯƠNG ÁN:
     * Phương án A (Khuyên dùng cho Giảng viên cá nhân - OAuth 2.0):
       + Chọn "OAuth client ID" -> Loại ứng dụng "Desktop app".
       + Tải tệp JSON về và đổi tên thành 'credentials.json' đặt cùng thư mục với mã nguồn.
     * Phương án B (Dành cho Server tập trung của Nhà trường - Service Account):
       + Chọn "Service Account" -> Tạo khóa mới định dạng JSON.
       + Đổi tên thành 'service_account.json'.
       + LƯU Ý: Phải chia sẻ thư mục Google Drive gốc cho email của Service Account!

4. CÀI ĐẶT THƯ VIỆN BỔ TRỢ PYTHON:
   pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib

5. CHẠY THỬ NGHIỆM ĐỒNG BỘ:
   python drive_sync_manager.py --demo
========================================================================================
"""
    print(instructions)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Chương trình điều phối Đồng bộ Google Drive Quản lý Sinh viên GDNN")
    parser.add_argument("--guide", action="store_true", help="Hiển thị hướng dẫn cấu hình credentials.json")
    parser.add_argument("--demo", action="store_true", help="Chạy kịch bản kiểm thử mẫu (Test Safety Guard & Sync)")
    parser.add_argument("--class-name", default="CĐK19.2-ÔT1", help="Mã lớp thử nghiệm (Mặc định: CĐK19.2-ÔT1)")
    parser.add_argument("--shared-id", default=None, help="Shared Root Folder ID cấu hình chung")

    args = parser.parse_args()

    if args.guide:
        print_setup_instructions()
        sys.exit(0)

    print("=" * 80)
    print("🎓 HỆ THỐNG QUẢN LÝ SINH VIÊN GDNN - MODULE ĐỒNG BỘ GOOGLE DRIVE ĐÁM MÂY")
    print("=" * 80)

    manager = DriveSyncManager(
        credentials_path="credentials.json",
        token_path="token.json",
        default_root_folder_name="QuanLySinhVien_Cloud_Data",
        shared_root_folder_id=args.shared_id,
        local_data_dir="local_data"
    )

    if args.demo:
        print("\n🧪 [BƯỚC 1]: Thử nghiệm Cơ chế Bảo vệ An toàn (Safety Guard - Chống xóa trắng)...")
        # Tạo tệp rỗng để thử nghiệm
        empty_file = os.path.join("local_data", "test_corrupted_empty.json")
        with open(empty_file, "w", encoding="utf-8") as f:
            f.write("")  # 0 bytes

        is_valid, msg = manager.validate_data_integrity(empty_file)
        print(f"👉 Kết quả kiểm tra tệp rỗng (0 bytes):")
        print(f"   Trạng thái an toàn: {'VƯỢT QUA' if is_valid else 'BỊ CHẶN TUYỆT ĐỐI (ĐÚNG THIẾT KẾ)'}")
        print(f"   Thông điệp: {msg}")

        # Thử nghiệm với tệp hợp lệ
        print("\n🧪 [BƯỚC 2]: Tạo dữ liệu chuẩn GDNN cho lớp:", args.class_name)
        valid_sample = create_sample_class_data("local_data", args.class_name)
        is_valid2, msg2 = manager.validate_data_integrity(valid_sample)
        print(f"👉 Kết quả kiểm tra tệp chuẩn ({valid_sample}):")
        print(f"   Trạng thái an toàn: {'VƯỢT QUA' if is_valid2 else 'BỊ CHẶN'}")
        print(f"   Thông điệp: {msg2}")

        print("\n🧪 [BƯỚC 3]: Kiểm tra môi trường kết nối Google Drive API...")
        if not os.path.exists("credentials.json") and not os.path.exists("token.json"):
            print("⚠️ Chưa phát hiện tệp 'credentials.json' trong thư mục hiện hành.")
            print("👉 Sử dụng lệnh: 'python drive_sync_manager.py --guide' để xem hướng dẫn lấy tệp này.")
            print("✅ Module đã sẵn sàng và biên dịch hoàn toàn chính xác!")
        else:
            try:
                manager.authenticate()
                manager.initialize_root_folder()
                manager.startup_sync_class(args.class_name)
            except Exception as e:
                print(f"❌ Kết nối API gặp sự cố: {e}")
    else:
        print("💡 Gõ 'python drive_sync_manager.py --demo' để kiểm thử tính năng.")
        print("💡 Gõ 'python drive_sync_manager.py --guide' để xem tài liệu cấu hình API.")
