# viQR

viQR là ứng dụng web tĩnh để lưu, xem và quản lý nhiều mã QR ngay trên trình duyệt. Ứng dụng ưu tiên trải nghiệm mobile-first, không cần backend, không cần tài khoản và lưu dữ liệu cục bộ trên thiết bị của người dùng.

## Tính năng

- Thêm mã QR từ nội dung văn bản, URL hoặc thông tin bất kỳ.
- Tải lên ảnh QR có sẵn.
- Xem từng QR toàn màn hình, chuyển qua lại bằng nút điều hướng, phím mũi tên hoặc thao tác vuốt.
- Xoay QR, sao chép nội dung, tải ảnh QR, sửa và xóa QR.
- Lưu dữ liệu bằng `localStorage`, phù hợp cho ứng dụng cá nhân chạy offline sau khi đã tải trang.
- Nhập/xuất dữ liệu qua file JSON được mã hóa bằng mật khẩu.
- Hỗ trợ nhiều giao diện màu: sáng, tối, mint, sunset, ocean và rose.

## Công nghệ

- HTML, CSS và JavaScript thuần.
- QR generation: [QRious](https://github.com/neocotic/qrious).
- Icons: [Lucide](https://lucide.dev/).
- Mã hóa file xuất/nhập: Web Crypto API với PBKDF2-SHA256 và AES-GCM.

## Chạy dự án

Không cần cài đặt dependency.

Mở trực tiếp file `index.html` trong trình duyệt, hoặc chạy một static server bất kỳ:

```bash
python -m http.server 8080
```

Sau đó mở:

```text
http://localhost:8080
```

## Lưu ý dữ liệu

- Dữ liệu QR được lưu trong trình duyệt hiện tại bằng `localStorage`.
- Xóa dữ liệu trình duyệt hoặc đổi thiết bị có thể làm mất dữ liệu nếu chưa xuất file sao lưu.
- File xuất dữ liệu được mã hóa bằng mật khẩu do người dùng nhập. Nếu quên mật khẩu, dự án không có cơ chế khôi phục.
- Ảnh QR tải lên được lưu dạng data URL trong dữ liệu cục bộ, nên file xuất có thể lớn nếu ảnh lớn.

## Đóng góp

Mọi đóng góp đều được hoan nghênh: báo lỗi, đề xuất tính năng, cải thiện giao diện, tối ưu accessibility, bổ sung kiểm thử hoặc làm sạch mã nguồn.

Quy trình đề xuất:

1. Fork repository.
2. Tạo nhánh mới cho thay đổi.
3. Giữ thay đổi nhỏ, rõ mục tiêu và dễ review.
4. Kiểm tra thủ công các luồng chính: thêm QR, sửa, xóa, chuyển QR, tải ảnh, nhập/xuất dữ liệu.
5. Gửi pull request kèm mô tả ngắn về vấn đề và cách xử lý.

Nếu chưa chắc nên bắt đầu từ đâu, hãy mở issue với bối cảnh cụ thể. Ý tưởng nhỏ nhưng thực tế vẫn rất có giá trị.

## Giấy phép

Dự án phát hành theo giấy phép Zero-Clause BSD (`0BSD`), một giấy phép mã nguồn mở cực kỳ permissive. Bạn có thể dùng, sao chép, sửa đổi, phân phối và tích hợp viQR vào dự án khác với gần như không có ràng buộc, kể cả mục đích thương mại.

Xem chi tiết tại [LICENSE](./LICENSE).
