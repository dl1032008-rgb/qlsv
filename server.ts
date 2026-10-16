import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint: AI Đọc và phân tích chương trình khung đào tạo GDNN
app.post('/api/ai/parse-curriculum', async (req, res) => {
  try {
    const { fileContent, fileName, trainingSystem } = req.body;
    if (!fileContent) {
      return res.status(400).json({ error: 'Nội dung tệp rỗng hoặc không hợp lệ' });
    }

    const systemPrompt = `Bạn là Chuyên gia Cố vấn Đào tạo & Quản trị Chương trình khung Giáo dục Nghề nghiệp (GDNN) theo Thông tư 04/2022/TT-BLĐTBXH.
Nhiệm vụ của bạn là đọc, phân tích tài liệu/bảng tính chương trình đào tạo tải lên (tên tệp: "${fileName || 'chuong_trinh_khung.xlsx'}", hệ đào tạo: "${trainingSystem || 'Hệ Cao Đẳng Chính Quy'}") và trích xuất danh sách tất cả các mô đun / môn học với độ chính xác 100%.

YÊU CẦU TRÍCH XUẤT BẮT BUỘC CHO MỖI MÔ ĐUN / MÔN HỌC:
1. id: Mã mô đun/môn học (VD: MH01, MH02, MĐ01, MĐ04, MĐ06...). Nếu tài liệu không ghi mã, tự động đánh mã chuẩn GDNN: MH01, MH02... cho môn chung; MĐ01, MĐ02... cho môn chuyên môn kỹ thuật.
2. name: Tên đầy đủ của môn học hoặc mô đun (VD: "Giáo dục quốc phòng và An ninh", "Chính trị & Pháp luật đại cương", "Điện kỹ thuật & Điện tử cơ bản trên ô tô", "Kỹ thuật nguội & Hàn kết cấu ô tô"...). Loại bỏ các dòng tiêu đề nhóm như "I. Khối kiến thức chung", "II. Các môn chuyên ngành"...
3. credits: Số tín chỉ (thường từ 1 đến 6).
4. totalHours: Tổng số giờ/tiết.
5. theoryHours: Số giờ lý thuyết (LT).
6. practiceHours: Số giờ thực hành / thực tập (TH).
7. examHours: Số giờ kiểm tra / thi (KT).
QUY TẮC CÔNG THỨC GDNN TUYỆT ĐỐI: Tổng số giờ = Lý thuyết + Thực hành + Kiểm tra (totalHours = theoryHours + practiceHours + examHours).
Nếu tài liệu gốc chỉ có cột LT và TH mà tổng giờ lớn hơn (LT + TH) thì: examHours = totalHours - (theoryHours + practiceHours).
Đảm bảo totalHours = theoryHours + practiceHours + examHours.

8. semester: Kỳ học phân bổ (số nguyên từ 1 đến 6). Nếu tài liệu có cột kỳ học thì lấy đúng kỳ; nếu chưa có, hãy phân bổ một cách khoa học:
   - Kỳ 1: Các môn học chung & Cơ sở (MH01, MH02, MH03, MĐ01...)
   - Kỳ 2 - Kỳ 5: Các mô đun cơ sở ngành và chuyên ngành (Động cơ EFI, Khung gầm, Điện ô tô, Hộp số AT...)
   - Kỳ 6: Thực tập tốt nghiệp doanh nghiệp & Khóa luận / Thi tốt nghiệp.
9. academicYearNumber: Năm học (Kỳ 1-2: Năm 1; Kỳ 3-4: Năm 2; Kỳ 5-6: Năm 3).
10. type: Phân loại môn ("Môn học chung", "Cơ sở ngành", "Chuyên môn", "Thực tập doanh nghiệp", "Khóa luận / Thi tốt nghiệp").
11. isMandatory: true nếu là môn bắt buộc, false nếu là môn tự chọn.
12. note: Ghi chú nếu có (VD: "Môn học điều kiện xét tốt nghiệp", "Thực hành tại xưởng EFI"...).

Hãy trả về kết quả dạng JSON thuần túy (Mảng các đối tượng SubjectModule). Không kèm theo giải thích markdown bên ngoài.`;

    const textPayload = typeof fileContent === 'string' ? fileContent.slice(0, 60000) : JSON.stringify(fileContent).slice(0, 60000);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            { text: `Dưới đây là nội dung dữ liệu chương trình khung được trích xuất từ tệp tin:\n\n${textPayload}` }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '';
    let parsedData: any[] = [];
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      }
    }

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      return res.status(422).json({ error: 'AI không tìm thấy danh sách mô đun hợp lệ từ dữ liệu tải lên' });
    }

    // Đảm bảo tính toán chuẩn xác Tổng = LT + TH + KT cho từng môn
    const validatedData = parsedData.map((m: any, idx: number) => {
      const th = Math.max(0, Number(m.theoryHours) || 0);
      const pr = Math.max(0, Number(m.practiceHours) || 0);
      let ex = Math.max(0, Number(m.examHours) || 0);
      let tot = Math.max(0, Number(m.totalHours) || (th + pr + ex));
      if (tot > 0 && ex === 0 && tot > th + pr) {
        ex = tot - (th + pr);
      }
      tot = th + pr + ex;
      const sem = Math.min(8, Math.max(1, Number(m.semester) || 1));
      return {
        id: String(m.id || `MĐ${String(idx + 1).padStart(2, '0')}`).toUpperCase().trim(),
        name: String(m.name || `Mô đun ${idx + 1}`).trim(),
        credits: Math.max(1, Number(m.credits) || 3),
        totalHours: tot,
        theoryHours: th,
        practiceHours: pr,
        examHours: ex,
        semester: sem,
        academicYearNumber: Number(m.academicYearNumber) || Math.ceil(sem / 2),
        type: String(m.type || 'Chuyên môn').trim(),
        isMandatory: m.isMandatory !== false,
        note: String(m.note || '').trim()
      };
    });

    return res.json({
      success: true,
      modules: validatedData,
      totalModules: validatedData.length,
      aiAnalysisSummary: `AI Gemini Flash đã đọc & trích xuất thành công ${validatedData.length} mô đun môn học chuẩn Thông tư 04/2022/TT-BLĐTBXH.`
    });
  } catch (error: any) {
    console.error('Lỗi khi AI phân tích chương trình khung:', error);
    return res.status(500).json({ 
      error: error?.message || 'Lỗi xử lý AI từ máy chủ',
      details: String(error)
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
