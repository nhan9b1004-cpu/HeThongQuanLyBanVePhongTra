const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

async function seed() {
  const showId = 'demo-show-1';

  console.log('🌱 Đang tạo show mẫu...');

  await redis.hset(`show:${showId}`, {
    name: 'Đêm nhạc Trịnh - Acoustic Night',
    artist: 'Various Artists',
    datetime: '2026-10-15T19:30:00+07:00',
    location: 'Phòng trà ABC, Q1, TP.HCM',
    status: 'open',
    price_default: '150000',
  });

  await redis.zadd('show:list:upcoming', new Date('2026-10-15T19:30:00+07:00').getTime(), showId);

  const tables = [
    { id: 'B1', type: 'standard', price: 150000, x: 100, y: 100, shape: 'round', capacity: 4 },
    { id: 'B2', type: 'standard', price: 150000, x: 250, y: 100, shape: 'round', capacity: 4 },
    { id: 'B3', type: 'standard', price: 150000, x: 400, y: 100, shape: 'round', capacity: 4 },
    { id: 'B4', type: 'standard', price: 150000, x: 100, y: 250, shape: 'round', capacity: 4 },
    { id: 'B5', type: 'standard', price: 150000, x: 250, y: 250, shape: 'round', capacity: 4 },
    { id: 'B6', type: 'standard', price: 150000, x: 400, y: 250, shape: 'round', capacity: 4 },
    { id: 'V1', type: 'vip', price: 350000, x: 100, y: 400, shape: 'sofa', capacity: 2 },
    { id: 'V2', type: 'vip', price: 350000, x: 300, y: 400, shape: 'sofa', capacity: 2 },
  ];

  console.log(`🌱 Đang tạo ${tables.length} bàn...`);

  for (const table of tables) {
    await redis.hset(`show:${showId}:seats`, table.id, 'available');
    await redis.hset(`show:${showId}:seat:${table.id}`, {
      type: table.type,
      price: table.price,
      x: table.x,
      y: table.y,
      table_shape: table.shape,
      capacity: table.capacity,
    });
  }

  console.log('✅ Seed dữ liệu thành công!');
  console.log(`   showId: ${showId}`);
  console.log(`   Test API: GET /api/shows/${showId}/seats`);

  redis.disconnect();
}

seed().catch((err) => {
  console.error('❌ Lỗi khi seed dữ liệu:', err);
  process.exit(1);
});