const redisClient = require('../../config/redis');
const keys = require('../../shared/keys');

function initBookingSocket(io) {
  io.on('connection', (socket) => {
    socket.on('joinShow', (showId) => {
      socket.join(`show:${showId}`);
    });

    socket.on('leaveShow', (showId) => {
      socket.leave(`show:${showId}`);
    });

    socket.on('disconnect', () => {});
  });

  const subscriber = redisClient.duplicate();
  const EXPIRED_CHANNEL = '__keyevent@0__:expired';

  subscriber.subscribe(EXPIRED_CHANNEL, (err) => {
    if (err) {
      console.error('❌ Không thể subscribe kênh expired:', err.message);
      return;
    }
    console.log('✅ Đang lắng nghe sự kiện hold hết hạn (Redis Keyspace Notification)');
  });

  subscriber.on('message', async (channel, expiredKey) => {
    if (channel !== EXPIRED_CHANNEL) return;
    if (!expiredKey.startsWith('hold:')) return;

    const parts = expiredKey.split(':');
    const showId = parts[1];
    const seatId = parts[2];
    if (!showId || !seatId) return;

    try {
      await redisClient.hset(keys.showSeats(showId), seatId, 'available');

      io.to(`show:${showId}`).emit('seat:updated', {
        seatId,
        status: 'available',
        reason: 'hold_expired',
      });

      console.log(`⏰ Ghế ${seatId} (show ${showId}) đã tự nhả do hết thời gian giữ chỗ`);
    } catch (err) {
      console.error('❌ Lỗi khi xử lý hold hết hạn:', err.message);
    }
  });
}

module.exports = initBookingSocket;