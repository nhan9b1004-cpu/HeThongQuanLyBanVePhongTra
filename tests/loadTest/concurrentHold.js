const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';
const SHOW_ID = 'load-test-show';
const SEAT_ID = 'LT1';
const CONCURRENT_REQUESTS = 50;

async function setupSeat() {
  const Redis = require('ioredis');
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  });
  await redis.hset(`show:${SHOW_ID}:seats`, SEAT_ID, 'available');
  await redis.del(`hold:${SHOW_ID}:${SEAT_ID}`);
  redis.disconnect();
}

async function runLoadTest() {
  await setupSeat();
  console.log(`🚀 Bắn ${CONCURRENT_REQUESTS} request cùng lúc để giữ ghế "${SEAT_ID}"...`);

  const requests = Array.from({ length: CONCURRENT_REQUESTS }, (_, i) =>
    axios
      .post(`${BASE_URL}/shows/${SHOW_ID}/seats/${SEAT_ID}/hold`, {
        sessionId: `load-test-session-${i}`,
      })
      .then((res) => ({ ok: true, status: res.status }))
      .catch((err) => ({ ok: false, status: err.response ? err.response.status : 0 }))
  );

  const results = await Promise.all(requests);

  const successCount = results.filter((r) => r.ok).length;
  const conflictCount = results.filter((r) => !r.ok && r.status === 409).length;
  const errorCount = results.length - successCount - conflictCount;

  console.log('===== KẾT QUẢ LOAD TEST =====');
  console.log(`Tổng request gửi:      ${CONCURRENT_REQUESTS}`);
  console.log(`Thành công (giữ được): ${successCount}`);
  console.log(`Bị từ chối (409):      ${conflictCount}`);
  console.log(`Lỗi khác:              ${errorCount}`);

  if (successCount === 1) {
    console.log('✅ PASS — chỉ đúng 1 người giữ được ghế, không có double-book.');
  } else {
    console.log('❌ FAIL — có race condition, cần kiểm tra lại Lua script HOLD_SEAT.');
  }
}

runLoadTest();