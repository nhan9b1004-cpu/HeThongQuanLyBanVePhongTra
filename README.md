# Hệ Thống Quản Lý Bán Vé Phòng Trà — Redis

## Trạng thái hiện tại
✅ **Phần chung (schema, keys, infra)** — hoàn thành
✅ **Module Booking (Người A)** — hoàn thành (backend + frontend + test)
⬜ **Module Payment (Người B)** — chưa làm, có sẵn khung `backend/src/modules/payment/` và Lua script mẫu `CONFIRM_PAYMENT` trong `shared/luaScripts.js`
⬜ **Module Checkin-Admin (Người C)** — chưa làm, có sẵn khung `backend/src/modules/checkin-admin/` và Lua script mẫu `CHECKIN_TICKET`

## Cài đặt & chạy thử (phần của Người A — đã tự kiểm thử thành công)

### 1. Chạy Redis
```bash
cp .env.example .env    # sửa REDIS_PASSWORD nếu muốn
docker compose up -d
```
Nếu không dùng Docker, cài Redis trực tiếp: `sudo apt install redis-server` rồi chạy
`redis-server --notify-keyspace-events Ex` (bắt buộc bật flag này để tính năng tự nhả ghế hoạt động).

### 2. Cài package ở thư mục GỐC (bắt buộc — dùng cho scripts/ và tests/loadTest/)
```bash
npm install
```
⚠️ Bước này hay bị bỏ sót: `scripts/seedData.js` và `tests/loadTest/concurrentHold.js` nằm ngoài
`backend/`, nên cần `node_modules` riêng ở thư mục gốc thì mới `require('ioredis')` được.

### 3. Cài & chạy backend
```bash
cd backend
npm install
cp ../.env.example .env
npm run dev              # server chạy ở http://localhost:5000
```

### 4. Seed dữ liệu mẫu (1 show + 8 bàn) — chạy từ thư mục GỐC
```bash
node scripts/seedData.js
```

### 5. Cài & chạy frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Mở trình duyệt → chọn show → chọn bàn để test giữ chỗ real-time.

### 6. Chạy test (đã tự chạy, kết quả PASS)
```bash
cd backend
npx jest booking.test.js                    # 4/4 test PASS

cd ..
node tests/loadTest/concurrentHold.js       # 50 request cùng giữ 1 ghế -> chỉ 1 thành công, 49 bị 409
```

## Schema Redis (tóm tắt — chi tiết xem `backend/src/shared/keys.js`)