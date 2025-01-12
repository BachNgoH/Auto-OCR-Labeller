# Auto OCR Labeller

## Giới thiệu

Auto OCR Labeller là một công cụ gán nhãn bán tự động cho OCR tiếng Việt, được phát triển dưới dạng ứng dụng web. Công cụ này giúp đơn giản hóa quá trình tạo dữ liệu huấn luyện cho các mô hình OCR tiếng Việt.
## Demo
[screen-capture (4).webm](https://github.com/user-attachments/assets/6d169d38-3b33-405c-84b2-75a4c6888a55)



## Ưu điểm

- **Dễ dàng sử dụng**: Không cần cài đặt phức tạp, chỉ cần truy cập web
- **Đa nền tảng**: Tương thích với nhiều hệ điều hành và thiết bị
- **Triển khai linh hoạt**: Dễ dàng host trên server cho nhiều người dùng

## Tính năng chính

- **Upload dữ liệu**: Hỗ trợ tải lên một hoặc nhiều hình ảnh
- **Gán nhãn tự động**: Tích hợp nhiều mô hình OCR:
  - PaddleOCR (text detection)
  - EasyOCR
  - VietOCR (text recognition)
  - Các mô hình LLM (GPT-4, Gemini,...)
- **Chỉnh sửa nhãn**:
  - Điều chỉnh bounding box
  - Chỉnh sửa nội dung text
- **Xuất dữ liệu**: Hỗ trợ xuất theo định dạng PaddleOCR và VietOCR

## Hướng dẫn sử dụng

1. Upload hình ảnh cần gán nhãn
2. Lựa chọn phương pháp gán nhãn:
   - Tự gán nhãn thủ công
   - Sử dụng tính năng auto label
3. Chỉnh sửa và hoàn thiện nhãn
4. Xuất dữ liệu theo định dạng mong muốn

## Lưu ý

Đây là dự án đang trong quá trình phát triển, có thể sẽ xuất hiện một số lỗi trong quá trình sử dụng.

## Demo

Xem video demo của ứng dụng tại: [YouTube Demo](link_to_youtube)

## Liên hệ

Mọi góp ý và báo lỗi xin vui lòng tạo issue trên GitHub repository.
