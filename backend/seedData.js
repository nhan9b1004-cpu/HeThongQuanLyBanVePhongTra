const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

// Danh sach 10 show mau
const shows = [
  {
    id: 'demo-show-1',
    name: 'Dem nhac Trinh - Acoustic Night',
    artist: 'Various Artists',
    datetime: '2026-10-20T19:30:00+07:00',
    location: 'Phong tra ABC, Q1, TP.HCM',
    price: 150000,
  },
  {
    id: 'demo-show-2',
    name: 'Giai dieu Bolero',
    artist: 'Le Quyen',
    datetime: '2026-10-22T20:00:00+07:00',
    location: 'Phong tra May, Q3, TP.HCM',
    price: 200000,
  },
  {
    id: 'demo-show-3',
    name: 'Acoustic Chill Night',
    artist: 'Various Artists',
    datetime: '2026-10-24T19:00:00+07:00',
    location: 'Phong tra Gio, Q10, TP.HCM',
    price: 120000,
  },
  {
    id: 'demo-show-4',
    name: 'Dem nhac nhac Tre',
    artist: 'Various Artists',
    datetime: '2026-10-26T19:30:00+07:00',
    location: 'Phong tra ABC, Q1, TP.HCM',
    price: 180000,
  },
  {
    id: 'demo-show-5',
    name: 'Tinh khuc vuot thoi gian',
    artist: 'Various Artists',
    datetime: '2026-10-28T20:00:00+07:00',
    location: 'Phong tra May, Q3, TP.HCM',
    price: 220000,
  },
  {
    id: 'demo-show-6',
    name: 'Jazz Evening',
    artist: 'Saigon Jazz Band',
    datetime: '2026-10-30T19:30:00+07:00',
    location: 'Phong tra Gio, Q10, TP.HCM',
    price: 250000,
  },
  {
    id: 'demo-show-7',
    name: 'Dem nhac nhung ban tinh ca',
    artist: 'Various Artists',
    datetime: '2026-11-01T19:00:00+07:00',
    location: 'Phong tra ABC, Q1, TP.HCM',
    price: 170000,
  },
  {
    id: 'demo-show-8',
    name: 'Sunday Acoustic',
    artist: 'Acoustic Band',
    datetime: '2026-11-03T19:30:00+07:00',
    location: 'Phong tra May, Q3, TP.HCM',
    price: 130000,
  },
  {
    id: 'demo-show-9',
    name: 'Live Music - Unplugged',
    artist: 'Various Artists',
    datetime: '2026-11-05T20:00:00+07:00',
    location: 'Phong tra Gio, Q10, TP.HCM',
    price: 160000,
  },
  {
    id: 'demo-show-10',
    name: 'Dem nhac cuoi tuan',
    artist: 'Saigon Music Band',
    datetime: '2026-11-07T19:30:00+07:00',
    location: 'Phong tra ABC, Q1, TP.HCM',
    price: 190000,
  },
];

// 6 ban thuong va 2 ban VIP cho moi show
const tables = [
  { id: 'B1', type: 'standard', x: 100, y: 100, shape: 'round', capacity: 4 },
  { id: 'B2', type: 'standard', x: 250, y: 100, shape: 'round', capacity: 4 },
  { id: 'B3', type: 'standard', x: 400, y: 100, shape: 'round', capacity: 4 },
  { id: 'B4', type: 'standard', x: 100, y: 250, shape: 'round', capacity: 4 },
  { id: 'B5', type: 'standard', x: 250, y: 250, shape: 'round', capacity: 4 },
  { id: 'B6', type: 'standard', x: 400, y: 250, shape: 'round', capacity: 4 },
  { id: 'V1', type: 'vip', x: 100, y: 400, shape: 'sofa', capacity: 2 },
  { id: 'V2', type: 'vip', x: 300, y: 400, shape: 'sofa', capacity: 2 },
];

async function seed() {
  try {
    console.log('🌱 Bat dau tao 10 show mau...');

    for (const show of shows) {
      // Tao thong tin show
      await redis.hset(`show:${show.id}`, {
        name: show.name,
        artist: show.artist,
        datetime: show.datetime,
        location: show.location,
        status: 'open',
        price_default: String(show.price),
      });

      // Them show vao danh sach show sap dien
      await redis.zadd(
        'show:list:upcoming',
        new Date(show.datetime).getTime(),
        show.id
      );

      // Tao so do ban va trang thai ghe rieng cho tung show
      for (const table of tables) {
        const price =
          table.type === 'vip'
            ? show.price + 200000
            : show.price;

        await redis.hset(
          `show:${show.id}:seats`,
          table.id,
          'available'
        );

        await redis.hset(`show:${show.id}:seat:${table.id}`, {
          type: table.type,
          price: String(price),
          x: String(table.x),
          y: String(table.y),
          table_shape: table.shape,
          capacity: String(table.capacity),
        });
      }

      console.log(`✅ Da tao: ${show.id} - ${show.name}`);
    }

    console.log('\n🎉 Hoan tat!');
    console.log(`Tong so show: ${shows.length}`);
    console.log(`Tong so ban: ${shows.length * tables.length}`);
    console.log('Moi show co 8 ban: 6 ban thuong va 2 ban VIP.');
  } finally {
    redis.disconnect();
  }
}

seed().catch((err) => {
  console.error('❌ Loi khi seed du lieu:', err);
  process.exitCode = 1;
});