# 🎵 Hệ Thống Quản Lý & Đặt Vé Phòng Trà Cao Cấp (Dark Luxury Theme)

Hệ thống đặt vé phòng trà thời gian thực sử dụng **Node.js, Express, Redis** (kiến trúc ZSet, Hash, Lua Script) và giao diện Dark Luxury tối giản, sang trọng.

## 🚀 Tính năng nổi bật
- **Quản lý 10 show diễn sắp tới**: Lưu trữ bằng Redis Sorted Set và Hash.
- **Sơ đồ ghế 32 chỗ động**: Phân loại VIP (Sofa) và Standard (Bàn tròn/vuông), tính toán tọa độ linh hoạt.
- **Giữ chỗ thời gian thực (Seat Holding)**: Sử dụng Redis Lua Script đảm bảo không bị xung đột, giữ chỗ trong 5 phút.
- **Luồng thanh toán đa ghế**: Hướng dẫn chọn nhiều ghế, khởi tạo thanh toán và xác nhận vé qua Redis.

---

## 🛠️ Hướng dẫn cài đặt & Chạy dự án

### 1. Cấu hình môi trường (`.env`)
Tạo file `.env` trong thư mục `backend/` với nội dung:
```env
PORT=5000
REDIS_HOST=localhost
REDIS_PORT=6379