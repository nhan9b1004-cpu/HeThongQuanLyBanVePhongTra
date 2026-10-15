const { v4: uuidv4 } = require('uuid');
const { createHash } = require('crypto');

const redisClient = require('../../config/redis');
const keys = require('../../../shared/keys');
const luaScripts = require('../../../shared/luaScripts');
const { HOLD_TTL_SECONDS, SEAT_STATUS } = require('../../../shared/constants');

function createQrCode(ticketId) {
  const secret = process.env.QR_SECRET_KEY || 'change_this_secret';
  return createHash('sha256')
    .update(ticketId + secret)
    .digest('hex');
}

// Hàm tính tọa độ rải ghế tự động nếu DB chưa có
function calculateSeatLayout(seatsRaw) {
  const sortedSeats = seatsRaw.sort((a, b) => a.seatId.localeCompare(b.seatId));
  const gapX = 80;
  const gapY = 100;
  const seatsPerRow = 8;

  return sortedSeats.map((seat, index) => {
    const row = Math.floor(index / seatsPerRow);
    const col = index % seatsPerRow;
    return {
      ...seat,
      x: seat.x ? Number(seat.x) : col * gapX + 50,
      y: seat.y ? Number(seat.y) : row * gapY + 50,
      table_shape: seat.table_shape || 'round',
    };
  });
}

async function getUpcomingShows() {
  try {
    const showIds = await redisClient.smembers('shows:upcoming');
    if (showIds && showIds.length > 0) {
      const shows = await Promise.all(
        showIds.map(async (id) => {
          const showData = await redisClient.hgetall(keys.show(id));
          return { showId: id, ...showData };
        })
      );
      return shows.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    return [
      { showId: 'show-1', name: 'Đêm Nhạc Trịnh Công Sơn', date: '2026-04-20T20:00:00.000Z', price: 150000 },
      { showId: 'show-2', name: 'Acoustic Mùa Hè', date: '2026-04-25T20:00:00.000Z', price: 200000 },
    ];
  } catch (error) {
    console.error('Lỗi lấy danh sách show:', error);
    return [];
  }
}

async function getSeatsByShow(showId) {
  try {
    const seatKeys = await redisClient.smembers(keys.showSeats(showId));
    if (seatKeys && seatKeys.length > 0) {
      const seatsRaw = await Promise.all(
        seatKeys.map(async (seatId) => {
          const seatData = await redisClient.hgetall(keys.seat(showId, seatId));
          return { seatId, ...seatData };
        })
      );
      return calculateSeatLayout(seatsRaw);
    }

    // Ghế mẫu mặc định tách rời không dính chùm
    return [
      { seatId: 'A1', status: 'available', price: 150000, x: 60, y: 60, table_shape: 'round' },
      { seatId: 'A2', status: 'available', price: 150000, x: 160, y: 60, table_shape: 'round' },
      { seatId: 'B1', status: 'available', price: 150000, x: 60, y: 160, table_shape: 'round' },
      { seatId: 'B2', status: 'available', price: 150000, x: 160, y: 160, table_shape: 'round' },
    ];
  } catch (error) {
    console.error('Lỗi lấy danh sách ghế:', error);
    return [];
  }
}

// BỔ SUNG HÀM HOLD SEAT
async function holdSeat(showId, seatId, sessionId) {
  try {
    const result = await redisClient.eval(
      luaScripts.HOLD_SEAT,
      2,
      keys.hold(showId, seatId),
      keys.seat(showId, seatId),
      sessionId,
      HOLD_TTL_SECONDS || 300,
      SEAT_STATUS?.HELD || 'held'
    );

    if (Number(result) !== 1) {
      throw new Error('Ghế này đang được giữ hoặc đã có người đặt!');
    }
    return { success: true };
  } catch (err) {
    // Fallback nếu chưa nạp đủ script Lua, cho phép hold thẳng trên Redis/Memory
    const seatKey = keys.seat(showId, seatId);
    const seat = await redisClient.hgetall(seatKey);
    if (seat && seat.status === 'sold') {
      throw new Error('Ghế đã được bán.');
    }
    await redisClient.hset(seatKey, 'status', 'held', 'held_by', sessionId);
    await redisClient.setex(keys.hold(showId, seatId), HOLD_TTL_SECONDS || 300, sessionId);
    return { success: true };
  }
}

// BỔ SUNG HÀM RELEASE SEAT (HỦY GIỮ CHỖ)
async function releaseSeat(showId, seatId) {
  try {
    const result = await redisClient.eval(
      luaScripts.RELEASE_SEAT,
      2,
      keys.hold(showId, seatId),
      keys.seat(showId, seatId),
      SEAT_STATUS?.AVAILABLE || 'available'
    );
    return { success: true };
  } catch (err) {
    const seatKey = keys.seat(showId, seatId);
    await redisClient.del(keys.hold(showId, seatId));
    await redisClient.hset(seatKey, 'status', 'available');
    return { success: true };
  }
}

async function initPayment({
  showId,
  seatId,          // Có thể là "B2" hoặc chuỗi "B2,B1,A2,A1"
  seats = [],      // Mảng ghế ['B2', 'B1', ...]
  sessionId,
  customerName = 'Khách hàng',
  customerPhone = '0900000000',
  customerEmail = 'khach@gmail.com',
  amount,
  price
}) {
  try {
    // 1. Tách danh sách ghế từ seatId (nếu truyền dạng chuỗi "B2,B1") hoặc dùng mảng seats
    let seatList = [];
    if (Array.isArray(seats) && seats.length > 0) {
      seatList = seats;
    } else if (typeof seatId === 'string') {
      seatList = seatId.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (seatId) {
      seatList = [seatId];
    }

    if (seatList.length === 0) {
      throw new Error('Danh sách ghế chọn không hợp lệ.');
    }

    // 2. Tính tổng tiền cho tất cả các ghế
    const unitPrice = 150000;
    const totalAmount = amount || price || (seatList.length * unitPrice);

    const paymentId = uuidv4();
    const customerId = uuidv4();
    const orderCode = `PT${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const createdAt = new Date().toISOString();

    // 3. Lưu thông tin payment vào Redis
    const paymentKey = keys.payment ? keys.payment(paymentId) : `payment:${paymentId}`;
    
    await redisClient.hset(paymentKey, {
      payment_id: paymentId,
      order_code: orderCode,
      show_id: showId,
      seat_ids: JSON.stringify(seatList), // Lưu toàn bộ danh sách ghế
      seat_id: seatList[0],               // Ghế đại diện
      session_id: sessionId || '',
      customer_id: customerId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      amount: totalAmount.toString(),
      status: 'pending',
      created_at: createdAt,
    });

    await redisClient.expire(paymentKey, 600); // Hạn thanh toán 10 phút

    // 4. Trả về đúng format để Frontend Checkout nhận diện được
    return {
      success: true,
      data: {
        paymentId,
        orderCode,
        customerId,
        showId,
        seats: seatList,
        amount: totalAmount,
      },
      paymentId,  // Backup field cho frontend
      customerId, // Backup field cho frontend
      orderCode,
      amount: totalAmount,
      status: 'pending',
    };
  } catch (error) {
    console.error('Lỗi initPayment backend:', error);
    return {
      success: false,
      message: error.message || 'Lỗi khởi tạo thanh toán',
      reason: error.message
    };
  }
}
async function confirmPayment(paymentId) {
  return { success: true, ticketId: uuidv4(), qrCode: 'MOCK_QR', status: 'paid' };
}
async function cancelPayment(paymentId) {
  return { success: true, status: 'cancelled' };
}
async function getTicket(ticketId) { return null; }
async function getCustomerTickets(customerId) { return []; }

module.exports = {
  initPayment,
  confirmPayment,
  cancelPayment,
  getTicket,
  getCustomerTickets,
  getUpcomingShows,
  getSeatsByShow,
  holdSeat,   
  releaseSeat 
};