import { SubjectModule } from '../types';
import { safeLocalStorage } from '../utils/storage';

// ==============================================================================
// 1. CHƯƠNG TRÌNH KHUNG CHUẨN: HỆ CAO ĐẲNG CHÍNH QUY (3 NĂM - 6 HỌC KỲ)
// Ngành: Công nghệ Kỹ thuật Ô tô - Trình độ: Cao đẳng (Chuẩn GDNN TT 04/2022)
// ==============================================================================
export const DEFAULT_CURRICULUM_CHINH_QUY: SubjectModule[] = [
  // --- NĂM THỨ NHẤT ---
  // Học kỳ 1 (Năm 1)
  {
    id: 'MH01',
    name: 'Giáo dục quốc phòng và An ninh',
    credits: 3,
    totalHours: 45,
    theoryHours: 25,
    practiceHours: 20,
    semester: 1,
    academicYearNumber: 1,
    type: 'Môn học chung',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy',
    note: 'Môn học điều kiện xét tốt nghiệp'
  },
  {
    id: 'MH02',
    name: 'Tiếng Anh cơ bản 1',
    credits: 3,
    totalHours: 45,
    theoryHours: 20,
    practiceHours: 25,
    semester: 1,
    academicYearNumber: 1,
    type: 'Môn học chung',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MH03',
    name: 'Tin học đại cương & Ứng dụng',
    credits: 2,
    totalHours: 30,
    theoryHours: 10,
    practiceHours: 20,
    semester: 1,
    academicYearNumber: 1,
    type: 'Môn học chung',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MĐ01',
    name: 'An toàn lao động và Vệ sinh môi trường xưởng',
    credits: 2,
    totalHours: 30,
    theoryHours: 10,
    practiceHours: 20,
    semester: 1,
    academicYearNumber: 1,
    type: 'Cơ sở ngành',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy',
    note: 'Huấn luyện ATVSLĐ & 5S xưởng'
  },
  {
    id: 'MĐ02',
    name: 'Vẽ kỹ thuật & Phần mềm AutoCAD cơ khí ô tô',
    credits: 3,
    totalHours: 60,
    theoryHours: 20,
    practiceHours: 40,
    semester: 1,
    academicYearNumber: 1,
    type: 'Cơ sở ngành',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MĐ03',
    name: 'Cơ kỹ thuật, Vật liệu học và Dung sai đo kiểm',
    credits: 3,
    totalHours: 60,
    theoryHours: 25,
    practiceHours: 35,
    semester: 1,
    academicYearNumber: 1,
    type: 'Cơ sở ngành',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },

  // Học kỳ 2 (Năm 1)
  {
    id: 'MH04',
    name: 'Chính trị & Pháp luật đại cương',
    credits: 3,
    totalHours: 45,
    theoryHours: 35,
    practiceHours: 10,
    semester: 2,
    academicYearNumber: 1,
    type: 'Môn học chung',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MĐ04',
    name: 'Kỹ thuật nguội & Hàn kết cấu ô tô',
    credits: 3,
    totalHours: 75,
    theoryHours: 15,
    practiceHours: 60,
    semester: 2,
    academicYearNumber: 1,
    type: 'Cơ sở ngành',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MĐ05',
    name: 'Điện kỹ thuật & Điện tử cơ bản trên ô tô',
    credits: 3,
    totalHours: 60,
    theoryHours: 20,
    practiceHours: 40,
    semester: 2,
    academicYearNumber: 1,
    type: 'Cơ sở ngành',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MĐ06',
    name: 'Nguyên lý và Cấu tạo Động cơ đốt trong',
    credits: 3,
    totalHours: 60,
    theoryHours: 30,
    practiceHours: 30,
    semester: 2,
    academicYearNumber: 1,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MĐ07',
    name: 'Thực hành Tháo lắp & Sửa chữa Động cơ đốt trong',
    credits: 5,
    totalHours: 120,
    theoryHours: 20,
    practiceHours: 100,
    semester: 2,
    academicYearNumber: 1,
    type: 'Thực tập xưởng',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy',
    note: 'Tháo lắp cân chỉnh động cơ xăng và diesel'
  },

  // --- NĂM THỨ HAI ---
  // Học kỳ 3 (Năm 2)
  {
    id: 'MH05',
    name: 'Tiếng Anh chuyên ngành Kỹ thuật Ô tô 1',
    credits: 2,
    totalHours: 30,
    theoryHours: 15,
    practiceHours: 15,
    semester: 3,
    academicYearNumber: 2,
    type: 'Môn học chung',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MĐ08',
    name: 'Hệ thống Khung gầm & Truyền lực (Ly hợp, Hộp số, Cầu xe)',
    credits: 4,
    totalHours: 90,
    theoryHours: 25,
    practiceHours: 65,
    semester: 3,
    academicYearNumber: 2,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MĐ09',
    name: 'Hệ thống Treo, Lái và Phanh (ABS, ESP, EPS)',
    credits: 4,
    totalHours: 90,
    theoryHours: 25,
    practiceHours: 65,
    semester: 3,
    academicYearNumber: 2,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MĐ10',
    name: 'Điện thân xe, Chiếu sáng & Hệ thống Tín hiệu điều khiển',
    credits: 3,
    totalHours: 75,
    theoryHours: 20,
    practiceHours: 55,
    semester: 3,
    academicYearNumber: 2,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MĐ11',
    name: 'Hệ thống Phun xăng điện tử EFI & Động cơ Diesel Common Rail',
    credits: 4,
    totalHours: 90,
    theoryHours: 25,
    practiceHours: 65,
    semester: 3,
    academicYearNumber: 2,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },

  // Học kỳ 4 (Năm 2)
  {
    id: 'MĐ12',
    name: 'Thực hành Chẩn đoán lỗi ô tô trên thiết bị Scan tool OBD-II',
    credits: 4,
    totalHours: 90,
    theoryHours: 20,
    practiceHours: 70,
    semester: 4,
    academicYearNumber: 2,
    type: 'Thực tập xưởng',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy',
    note: 'Đọc dữ liệu Data stream, mã lỗi DTC, tra cứu phần mềm'
  },
  {
    id: 'MĐ13',
    name: 'Hệ thống Điều hòa không khí & Khí hậu tự động trên ô tô',
    credits: 3,
    totalHours: 75,
    theoryHours: 20,
    practiceHours: 55,
    semester: 4,
    academicYearNumber: 2,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MĐ14',
    name: 'Hộp số tự động thủy lực AT, Vô cấp CVT & Hộp số kép DCT',
    credits: 4,
    totalHours: 90,
    theoryHours: 25,
    practiceHours: 65,
    semester: 4,
    academicYearNumber: 2,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MĐ15',
    name: 'Mạng truyền thông trên ô tô (CAN, LIN, FlexRay)',
    credits: 3,
    totalHours: 60,
    theoryHours: 20,
    practiceHours: 40,
    semester: 4,
    academicYearNumber: 2,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },

  // --- NĂM THỨ BA ---
  // Học kỳ 5 (Năm 3)
  {
    id: 'MH06',
    name: 'Kỹ năng khởi nghiệp, Giao tiếp & Quản lý dịch vụ xưởng',
    credits: 2,
    totalHours: 30,
    theoryHours: 20,
    practiceHours: 10,
    semester: 5,
    academicYearNumber: 3,
    type: 'Môn học chung',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MĐ16',
    name: 'Bảo dưỡng định kỳ và Quy trình dịch vụ sửa chữa nhanh Express',
    credits: 4,
    totalHours: 90,
    theoryHours: 20,
    practiceHours: 70,
    semester: 5,
    academicYearNumber: 3,
    type: 'Thực tập xưởng',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy',
    note: 'Bảo dưỡng 5.000km, 10.000km, 40.000km theo chuẩn Hãng'
  },
  {
    id: 'MĐ17',
    name: 'Công nghệ Xe điện (EV), Xe Hybrid (HEV) & An toàn điện áp cao',
    credits: 4,
    totalHours: 90,
    theoryHours: 30,
    practiceHours: 60,
    semester: 5,
    academicYearNumber: 3,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy',
    note: 'Pin cao áp Li-ion, Động cơ xoay chiều 3 pha, Biến tần Inverter'
  },
  {
    id: 'MĐ18',
    name: 'Hệ thống Hỗ trợ lái nâng cao ADAS & Camera 360',
    credits: 3,
    totalHours: 60,
    theoryHours: 20,
    practiceHours: 40,
    semester: 5,
    academicYearNumber: 3,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MĐ19',
    name: 'Thực tập trải nghiệm Doanh nghiệp & Garage ô tô',
    credits: 4,
    totalHours: 120,
    theoryHours: 0,
    practiceHours: 120,
    semester: 5,
    academicYearNumber: 3,
    type: 'Thực tập tốt nghiệp',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },

  // Học kỳ 6 (Năm 3)
  {
    id: 'MĐ20',
    name: 'Chẩn đoán và Xử lý Pan bệnh chuyên sâu tổng hợp',
    credits: 4,
    totalHours: 90,
    theoryHours: 15,
    practiceHours: 75,
    semester: 6,
    academicYearNumber: 3,
    type: 'Thực tập xưởng',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy'
  },
  {
    id: 'MĐ21',
    name: 'Thực tập tốt nghiệp tại Doanh nghiệp / Đại lý 3S Ô tô',
    credits: 6,
    totalHours: 180,
    theoryHours: 0,
    practiceHours: 180,
    semester: 6,
    academicYearNumber: 3,
    type: 'Thực tập tốt nghiệp',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy',
    note: 'Trực tiếp tại Toyota, Hyundai, VinFast, Ford...'
  },
  {
    id: 'MĐ22',
    name: 'Khóa luận tốt nghiệp / Thi tốt nghiệp Kỹ sư thực hành',
    credits: 5,
    totalHours: 150,
    theoryHours: 30,
    practiceHours: 120,
    semester: 6,
    academicYearNumber: 3,
    type: 'Đồ án / Khóa luận',
    isMandatory: true,
    trainingSystem: 'Hệ Cao Đẳng Chính Quy',
    note: 'Bảo vệ Đồ án tốt nghiệp hoặc thi tay nghề Quốc gia'
  }
];

// ==============================================================================
// 2. CHƯƠNG TRÌNH KHUNG CHUẨN: HỆ LIÊN THÔNG CAO ĐẲNG (1.5 - 2 NĂM - 4 HỌC KỲ)
// Đối tượng: Đã tốt nghiệp Trung cấp nghề ô tô liên thông lên Cao đẳng
// ==============================================================================
export const DEFAULT_CURRICULUM_LIEN_THONG: SubjectModule[] = [
  // --- NĂM THỨ NHẤT ---
  // Học kỳ 1 (Năm 1)
  {
    id: 'LT-MH01',
    name: 'Tiếng Anh chuyên ngành Ô tô nâng cao',
    credits: 3,
    totalHours: 45,
    theoryHours: 20,
    practiceHours: 25,
    semester: 1,
    academicYearNumber: 1,
    type: 'Môn học chung',
    isMandatory: true,
    trainingSystem: 'Hệ Liên Thông Cao Đẳng'
  },
  {
    id: 'LT-MĐ01',
    name: 'Điện tử ứng dụng & Vi điều khiển trên ô tô hiện đại',
    credits: 3,
    totalHours: 60,
    theoryHours: 20,
    practiceHours: 40,
    semester: 1,
    academicYearNumber: 1,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Liên Thông Cao Đẳng'
  },
  {
    id: 'LT-MĐ02',
    name: 'Động cơ Phun xăng trực tiếp GDI, Turbo kép & Điều khiển van biến thiên',
    credits: 4,
    totalHours: 90,
    theoryHours: 30,
    practiceHours: 60,
    semester: 1,
    academicYearNumber: 1,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Liên Thông Cao Đẳng'
  },
  {
    id: 'LT-MĐ03',
    name: 'Hệ thống Kiểm soát động học xe: VSC, TRC, ESP và Phanh điện tử EPB',
    credits: 4,
    totalHours: 90,
    theoryHours: 25,
    practiceHours: 65,
    semester: 1,
    academicYearNumber: 1,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Liên Thông Cao Đẳng'
  },

  // Học kỳ 2 (Năm 1)
  {
    id: 'LT-MĐ04',
    name: 'Chẩn đoán chuyên sâu & Lập trình mã hóa hộp ECU / Coding',
    credits: 4,
    totalHours: 90,
    theoryHours: 20,
    practiceHours: 70,
    semester: 2,
    academicYearNumber: 1,
    type: 'Thực tập xưởng',
    isMandatory: true,
    trainingSystem: 'Hệ Liên Thông Cao Đẳng',
    note: 'Sử dụng thiết bị J2534, G-scan 3, Launch X431, Autel MaxiSys'
  },
  {
    id: 'LT-MĐ05',
    name: 'Hộp số tự động thông minh 8-10 cấp, CVT & Ly hợp kép ướt',
    credits: 4,
    totalHours: 90,
    theoryHours: 25,
    practiceHours: 65,
    semester: 2,
    academicYearNumber: 1,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Liên Thông Cao Đẳng'
  },
  {
    id: 'LT-MĐ06',
    name: 'Mạng truyền thông phân tán Gateway & Chẩn đoán qua mạng mạng CAN/LIN',
    credits: 3,
    totalHours: 60,
    theoryHours: 20,
    practiceHours: 40,
    semester: 2,
    academicYearNumber: 1,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Liên Thông Cao Đẳng'
  },
  {
    id: 'LT-MH02',
    name: 'Quản trị xưởng dịch vụ, Cố vấn dịch vụ và Kỹ năng CSKH',
    credits: 2,
    totalHours: 30,
    theoryHours: 20,
    practiceHours: 10,
    semester: 2,
    academicYearNumber: 1,
    type: 'Cơ sở ngành',
    isMandatory: true,
    trainingSystem: 'Hệ Liên Thông Cao Đẳng'
  },

  // --- NĂM THỨ HAI ---
  // Học kỳ 3 (Năm 2)
  {
    id: 'LT-MĐ07',
    name: 'Công nghệ Xe điện thuần (BEV) và Xe Hybrid (HEV/PHEV) thế hệ mới',
    credits: 4,
    totalHours: 90,
    theoryHours: 30,
    practiceHours: 60,
    semester: 3,
    academicYearNumber: 2,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Liên Thông Cao Đẳng',
    note: 'An toàn cứu hộ xe điện, kiểm tra Pack Pin, Motor điện P2/P4'
  },
  {
    id: 'LT-MĐ08',
    name: 'Hệ thống Hỗ trợ lái an toàn chủ động ADAS và Tự hành cấp độ 2+',
    credits: 3,
    totalHours: 75,
    theoryHours: 20,
    practiceHours: 55,
    semester: 3,
    academicYearNumber: 2,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Liên Thông Cao Đẳng'
  },
  {
    id: 'LT-MĐ09',
    name: 'Chuyên đề Sửa chữa Pan bệnh cơ điện tử phức tạp',
    credits: 4,
    totalHours: 90,
    theoryHours: 15,
    practiceHours: 75,
    semester: 3,
    academicYearNumber: 2,
    type: 'Thực tập xưởng',
    isMandatory: true,
    trainingSystem: 'Hệ Liên Thông Cao Đẳng'
  },
  {
    id: 'LT-MĐ10',
    name: 'Thực tập tốt nghiệp Doanh nghiệp / Cố vấn kỹ thuật Garage',
    credits: 4,
    totalHours: 120,
    theoryHours: 0,
    practiceHours: 120,
    semester: 3,
    academicYearNumber: 2,
    type: 'Thực tập tốt nghiệp',
    isMandatory: true,
    trainingSystem: 'Hệ Liên Thông Cao Đẳng'
  },

  // Học kỳ 4 (Năm 2)
  {
    id: 'LT-MĐ11',
    name: 'Đồ án Công nghệ Ô tô / Khóa luận tốt nghiệp Kỹ sư thực hành',
    credits: 5,
    totalHours: 150,
    theoryHours: 30,
    practiceHours: 120,
    semester: 4,
    academicYearNumber: 2,
    type: 'Đồ án / Khóa luận',
    isMandatory: true,
    trainingSystem: 'Hệ Liên Thông Cao Đẳng',
    note: 'Thiết kế hệ thống, cải tiến thiết bị xưởng hoặc nghiên cứu công nghệ'
  }
];

// ==============================================================================
// 3. CHƯƠNG TRÌNH KHUNG CHUẨN: HỆ TRUNG CẤP + THPT (3 NĂM - 6 HỌC KỲ)
// Vừa học 7 môn văn hóa THPT (Toán, Lý, Hóa, Văn, Sử, Địa, Anh) vừa học nghề
// ==============================================================================
export const DEFAULT_CURRICULUM_TRUNG_CAP: SubjectModule[] = [
  // --- NĂM THỨ NHẤT (Lớp 10 THPT + Nghề Cơ sở) ---
  // Học kỳ 1 (Năm 1)
  {
    id: 'TC-MĐ01',
    name: 'An toàn lao động, Vệ sinh xưởng & Dụng cụ đồ nghề cầm tay',
    credits: 2,
    totalHours: 30,
    theoryHours: 10,
    practiceHours: 20,
    semester: 1,
    academicYearNumber: 1,
    type: 'Cơ sở ngành',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT'
  },
  {
    id: 'TC-MĐ02',
    name: 'Vẽ kỹ thuật cơ bản & Đọc bản vẽ cơ khí ô tô',
    credits: 2,
    totalHours: 45,
    theoryHours: 15,
    practiceHours: 30,
    semester: 1,
    academicYearNumber: 1,
    type: 'Cơ sở ngành',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT'
  },
  {
    id: 'TC-MĐ03',
    name: 'Kỹ thuật gia công nguội & Hàn cơ bản',
    credits: 3,
    totalHours: 60,
    theoryHours: 15,
    practiceHours: 45,
    semester: 1,
    academicYearNumber: 1,
    type: 'Cơ sở ngành',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT'
  },

  // Học kỳ 2 (Năm 1)
  {
    id: 'TC-MĐ04',
    name: 'Điện kỹ thuật đại cương & Mạch điện cơ bản',
    credits: 2,
    totalHours: 45,
    theoryHours: 15,
    practiceHours: 30,
    semester: 2,
    academicYearNumber: 1,
    type: 'Cơ sở ngành',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT'
  },
  {
    id: 'TC-MĐ05',
    name: 'Cấu tạo & Thực hành Tháo lắp Động cơ xăng',
    credits: 4,
    totalHours: 90,
    theoryHours: 20,
    practiceHours: 70,
    semester: 2,
    academicYearNumber: 1,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT'
  },
  {
    id: 'TC-MĐ06',
    name: 'Bảo dưỡng Hệ thống Bôi trơn và Làm mát động cơ',
    credits: 2,
    totalHours: 45,
    theoryHours: 10,
    practiceHours: 35,
    semester: 2,
    academicYearNumber: 1,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT'
  },

  // --- NĂM THỨ HAI (Lớp 11 THPT + Chuyên ngành Ô tô) ---
  // Học kỳ 3 (Năm 2)
  {
    id: 'TC-MĐ07',
    name: 'Cấu tạo & Thực hành Tháo lắp Động cơ Diesel',
    credits: 4,
    totalHours: 90,
    theoryHours: 20,
    practiceHours: 70,
    semester: 3,
    academicYearNumber: 2,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT'
  },
  {
    id: 'TC-MĐ08',
    name: 'Hệ thống Truyền lực ô tô (Ly hợp, Hộp số cơ, Cầu chủ động)',
    credits: 3,
    totalHours: 75,
    theoryHours: 20,
    practiceHours: 55,
    semester: 3,
    academicYearNumber: 2,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT'
  },
  {
    id: 'TC-MĐ09',
    name: 'Hệ thống Khung gầm, Treo, Lái và Phanh cơ bản',
    credits: 3,
    totalHours: 75,
    theoryHours: 20,
    practiceHours: 55,
    semester: 3,
    academicYearNumber: 2,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT'
  },

  // Học kỳ 4 (Năm 2)
  {
    id: 'TC-MĐ10',
    name: 'Hệ thống Điện chiếu sáng, Tín hiệu và Tiện nghi ô tô',
    credits: 3,
    totalHours: 60,
    theoryHours: 15,
    practiceHours: 45,
    semester: 4,
    academicYearNumber: 2,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT'
  },
  {
    id: 'TC-MĐ11',
    name: 'Hệ thống Khởi động, Nạp điện và Ắc quy ô tô',
    credits: 3,
    totalHours: 60,
    theoryHours: 15,
    practiceHours: 45,
    semester: 4,
    academicYearNumber: 2,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT'
  },
  {
    id: 'TC-MĐ12',
    name: 'Thực hành Bảo dưỡng nhanh hệ thống Gầm và Phanh',
    credits: 3,
    totalHours: 75,
    theoryHours: 10,
    practiceHours: 65,
    semester: 4,
    academicYearNumber: 2,
    type: 'Thực tập xưởng',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT'
  },

  // --- NĂM THỨ BA (Lớp 12 THPT + Tốt nghiệp Nghề & THPT Quốc gia) ---
  // Học kỳ 5 (Năm 3)
  {
    id: 'TC-MĐ13',
    name: 'Điện động cơ xăng & Phun xăng điện tử cơ bản',
    credits: 3,
    totalHours: 75,
    theoryHours: 20,
    practiceHours: 55,
    semester: 5,
    academicYearNumber: 3,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT'
  },
  {
    id: 'TC-MĐ14',
    name: 'Hệ thống Điều hòa không khí ô tô cơ bản',
    credits: 2,
    totalHours: 45,
    theoryHours: 15,
    practiceHours: 30,
    semester: 5,
    academicYearNumber: 3,
    type: 'Chuyên môn',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT'
  },
  {
    id: 'TC-MĐ15',
    name: 'Thực tập tay nghề tại Xưởng Dịch vụ / Garage ô tô',
    credits: 4,
    totalHours: 120,
    theoryHours: 0,
    practiceHours: 120,
    semester: 5,
    academicYearNumber: 3,
    type: 'Thực tập tốt nghiệp',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT'
  },

  // Học kỳ 6 (Năm 3)
  {
    id: 'TC-MĐ16',
    name: 'Ôn tập và Thi tốt nghiệp Nghề Trung cấp Kỹ thuật Ô tô',
    credits: 4,
    totalHours: 120,
    theoryHours: 30,
    practiceHours: 90,
    semester: 6,
    academicYearNumber: 3,
    type: 'Đồ án / Khóa luận',
    isMandatory: true,
    trainingSystem: 'Hệ Trung Cấp + THPT',
    note: 'Thi Lý thuyết chuyên môn & Thực hành tay nghề'
  }
];

// Helper: Lấy danh sách mô đun mặc định theo hệ đào tạo
export const getDefaultCurriculumForSystem = (systemName: string): SubjectModule[] => {
  const normalized = systemName.toLowerCase();
  if (normalized.includes('liên thông')) {
    return DEFAULT_CURRICULUM_LIEN_THONG;
  }
  if (normalized.includes('trung cấp')) {
    return DEFAULT_CURRICULUM_TRUNG_CAP;
  }
  return DEFAULT_CURRICULUM_CHINH_QUY;
};

// Helper: Lấy key localStorage theo hệ đào tạo
export const getStorageKeyForSystem = (systemName: string): string => {
  const normalized = systemName.toLowerCase();
  if (normalized.includes('liên thông')) {
    return 'oto_curriculum_lien_thong';
  }
  if (normalized.includes('trung cấp')) {
    return 'oto_curriculum_trung_cap';
  }
  return 'oto_curriculum_chinh_quy';
};

// Helper: Đọc chương trình khung từ storage hoặc trả về mặc định, bảo đảm chuẩn Tổng = LT + TH + KT
export const loadCurriculumForSystem = (systemName: string): SubjectModule[] => {
  const key = getStorageKeyForSystem(systemName);
  let rawList: SubjectModule[] = [];
  try {
    const saved = safeLocalStorage.get(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        rawList = parsed;
      }
    }
  } catch (e) {
    console.error('Lỗi khi đọc chương trình khung từ storage:', e);
  }

  if (rawList.length === 0) {
    rawList = getDefaultCurriculumForSystem(systemName);
  }

  return rawList.map(m => {
    const th = Number(m.theoryHours) || 0;
    const pr = Number(m.practiceHours) || 0;
    let ex = Number(m.examHours);
    let tot = Number(m.totalHours) || (th + pr);
    if (isNaN(ex) || ex === undefined) {
      ex = tot > (th + pr) ? (tot - (th + pr)) : 0;
    }
    tot = th + pr + ex;
    return {
      ...m,
      theoryHours: th,
      practiceHours: pr,
      examHours: ex,
      totalHours: tot
    };
  });
};

// Helper: Lưu chương trình khung vào storage (nén và xử lý an toàn chống lỗi QuotaExceededError)
export const saveCurriculumForSystem = (systemName: string, modules: SubjectModule[]): void => {
  const key = getStorageKeyForSystem(systemName);
  try {
    // Chỉ lưu các trường cần thiết để tiết kiệm dung lượng lưu trữ, bảo đảm Tổng = LT + TH + KT
    const cleanModules: SubjectModule[] = modules.map(m => {
      const th = Number(m.theoryHours) || 0;
      const pr = Number(m.practiceHours) || 0;
      const ex = Number(m.examHours) || 0;
      const tot = Number(m.totalHours) || (th + pr + ex);
      return {
        id: String(m.id || '').trim().toUpperCase(),
        name: String(m.name || '').trim(),
        credits: Number(m.credits) || 0,
        totalHours: tot,
        theoryHours: th,
        practiceHours: pr,
        ...(ex > 0 ? { examHours: ex } : {}),
        semester: (Number(m.semester) || 1) as any,
        academicYearNumber: (Number(m.academicYearNumber) || 1) as any,
        type: m.type || 'Chuyên môn',
        isMandatory: m.isMandatory !== false,
        trainingSystem: m.trainingSystem || systemName,
        ...(m.note ? { note: String(m.note).trim() } : {})
      };
    });

    safeLocalStorage.set(key, JSON.stringify(cleanModules));
  } catch (e) {
    console.error('Lỗi khi lưu chương trình khung vào storage:', e);
  }
};
