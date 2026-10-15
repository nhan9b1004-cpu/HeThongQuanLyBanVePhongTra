const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

const showsList = [
  { id: 'demo-show-1', name: 'Đêm nhạc Trịnh - Acoustic Night', price: 150000 },
  { id: 'show-2', name: 'Acoustic Mùa Hè Rực Rỡ', price: 200000 },
  { id: 'show-3', name: 'Bolero Tình Khúc Xưa & Nay', price: 180000 },
  { id: 'show-4', name: 'Jazz Đêm Sài Gòn', price: 250000 },
  { id: 'show-5', name: 'Rock Việt Hoài Niệm', price: 220000 },
  { id: 'show-6', name: 'Bản Tình Ca Mùa Hạ', price: 170000 },
  { id: 'show-7', name: 'Giai Điệu Tự Hào', price: 190000 },
  { id: 'show-8', name: 'Piano & Violin Đêm Trăng', price: 300000 },
  { id: 'show-9', name: 'Ca Nhạc Tổng Hợp V-Pop', price: 160000 },
  { id: 'show-10', name: 'Khúc Trữ Tình Cuối Tuần', price: 150000 },
];

async function seed() {
  console.log('🌱 Đang tạo toàn bộ 10 đêm nhạc và ghế vào Redis...');

  for (const show of showsList) {
    const showId = show.id;

    // 1. Lưu thông tin show
    await redis.hset(`show:${showId}`, {
      name: show.name,
      artist: 'Various Artists',
      datetime: '2026-10-15T19:30:00+07:00',
      location: 'Phòng trà ABC, Q1, TP.HCM',
      status: 'open',
      price_default: show.price.toString(),
    });

    // Lưu vào các key list/upcoming để API getShows nhận diện được
    await redis.zadd('show:list:upcoming', new Date('2026-10-15T19:30:00+07:00').getTime(), showId);
    await redis.sadd('shows:upcoming', showId);

    // 2. Tạo 32 ghế cho show này (4 hàng A, B, C, D x 8 cột)
    const rows = ['A', 'B', 'C', 'D'];
    const cols = 8;
    const statuses = ['available', 'available', 'available', 'held', 'sold', 'disabled'];

    for (let rIndex = 0; rIndex < rows.length; rIndex++) {
      const rowLetter = rows[rIndex];
      for (let cIndex = 1; cIndex <= cols; cIndex++) {
        const seatId = `${rowLetter}${cIndex}`;
        const isVip = rowLetter === 'A';
        const type = isVip ? 'vip' : 'standard';
        const price = isVip ? show.price * 2 : show.price;
        const shape = isVip ? 'sofa' : 'round';
        const capacity = isVip ? 2 : 4;

        const x = (cIndex - 1) * 90 + 60;
        const y = rIndex * 110 + 60;
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        // Lưu trạng thái ghế vào hash tổng
        await redis.hset(`show:${showId}:seats`, seatId, randomStatus);

        // Lưu chi tiết từng ghế
        await redis.hset(`show:${showId}:seat:${seatId}`, {
          type,
          price: price.toString(),
          x,
          y,
          table_shape: shape,
          capacity: capacity.toString(),
          status: randomStatus,
        });
      }
    }
  }

  console.log('✅ Seed toàn bộ 10 show và ghế thành công rực rỡ!');
  redis.disconnect();
}

seed().catch((err) => {
  console.error('❌ Lỗi seed:', err);
  process.exit(1);
});