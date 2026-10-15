## 📋 Trạng Thái Phát Triển & Tiến Độ Dự Án (Project Status)

### ✅ Các phần đã hoàn thiện (Completed):
1. **Kiến trúc dữ liệu Redis**: 
   - Xây dựng cấu trúc lưu trữ tối ưu cho hệ thống phòng trà sử dụng `Sorted Set` (`show:list:upcoming`), `Hash` cho thông tin chi tiết show và trạng thái ghế (`show:{id}:seats`, `show:{id}:seat:{id}`).
   - Viết script tự động nạp dữ liệu (`seedData.js`) khởi tạo sẵn 10 đêm nhạc mẫu và 32 ghế/bàn cho mỗi show.
2. **Backend Services & API**:
   - Hoàn thiện các module nghiệp vụ đặt vé (`booking.service.js`, `booking.controller.js`).
   - Xây dựng cơ chế giữ chỗ thời gian thực (Seat Holding) bằng Lua Script kết hợp fallback an toàn, ngăn chặn xung đột khi nhiều người chọn cùng một ghế.
3. **Giao diện người dùng (UI/UX)**:
   - Xây dựng hệ thống giao diện theo chủ đề **Dark Luxury** (tông nền đen huyền bí `#0d1117`, điểm xuyết màu vàng kim cương `#d4af37`) tạo cảm giác sang trọng đúng chất phòng trà cao cấp.
   - Trang danh sách show diễn sắp tới và trang chọn sơ đồ ghế tương tác.

---

### 🚧 Các phần chưa hoàn thiện & Hướng phát triển tiếp theo (To-Do):
1. **Trang thanh toán tích hợp (Checkout & Payment Flow)**:
   - Chưa hoàn thiện trang thanh toán chi tiết, cổng thanh toán giả lập hoặc tích hợp thanh toán thực tế (VNPay/Momo).
   - Chưa xử lý hoàn tất luồng callback xác nhận thanh toán để chuyển trạng thái ghế từ `held` sang `sold` tự động qua WebSocket/Polling.
2. **Sơ đồ ghế trực quan tích hợp hoàn chỉnh (Advanced Seat Map View)**:
   - Phần render sơ đồ ghế (`SeatMapView`) đang ở mức cơ bản, chưa tối ưu hoàn toàn việc phân vùng không gian thực tế của phòng trà (sân khấu, góc nhìn, khoảng cách bàn).
3. **Hệ thống Quản lý tài khoản người dùng (User Authentication & Profile)**:
   - Chưa có tính năng đăng ký, đăng nhập tài khoản khách hàng, phân quyền người dùng (User vs Admin).
   - Chưa lưu trữ lịch sử vé đã đặt của từng cá nhân vào cơ sở dữ liệu.