const { v4: uuidv4 } = require('uuid');
const bookingService = require('./booking.service');

async function getShows(req, res, next) {
  try {
    const shows = await bookingService.getUpcomingShows();
    res.status(200).json({ success: true, data: shows });
  } catch (err) {
    next(err);
  }
}
// Ví dụ trong payment.controller.js / booking.controller.js
exports.initPayment = async (req, res) => {
  try {
    const { showId, seatId, seats, customerInfo, customerName, customerPhone, customerEmail, sessionId, price, amount } = req.body;

    const result = await bookingService.initPayment({
      showId,
      seatId,
      seats,
      sessionId,
      customerName: customerName || customerInfo?.name,
      customerPhone: customerPhone || customerInfo?.phone,
      customerEmail: customerEmail || customerInfo?.email,
      amount: amount || price,
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
async function getShowDetail(req, res, next) {
  try {
    const { showId } = req.params;
    const show = await bookingService.getShowById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy show' });
    }
    res.status(200).json({ success: true, data: show });
  } catch (err) {
    next(err);
  }
}

async function getSeats(req, res, next) {
  try {
    const { showId } = req.params;
    const seats = await bookingService.getSeatsByShow(showId);
    res.status(200).json({ success: true, data: seats });
  } catch (err) {
    next(err);
  }
}

async function holdSeat(req, res, next) {
  try {
    const { showId, seatId } = req.params;
    const sessionId = req.body.sessionId || uuidv4();

    const success = await bookingService.holdSeat(showId, seatId, sessionId);

    if (!success) {
      return res.status(409).json({
        success: false,
        message: 'Ghế đã được giữ hoặc đã bán, vui lòng chọn ghế khác',
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`show:${showId}`).emit('seat:updated', { seatId, status: 'held' });
    }

    res.status(200).json({
      success: true,
      message: 'Giữ ghế thành công',
      data: { sessionId, showId, seatId, ttlSeconds: 300 },
    });
  } catch (err) {
    next(err);
  }
}

async function releaseSeat(req, res, next) {
  try {
    const { showId, seatId } = req.params;
    await bookingService.releaseSeat(showId, seatId);

    const io = req.app.get('io');
    if (io) {
      io.to(`show:${showId}`).emit('seat:updated', { seatId, status: 'available' });
    }

    res.status(200).json({ success: true, message: 'Đã nhả ghế' });
  } catch (err) {
    next(err);
  }
}
async function holdMultipleSeats(req, res, next) {
  try {
    const { showId } = req.params;
    const { seatIds, sessionId: existingSessionId } = req.body;
    const sessionId = existingSessionId || uuidv4();

    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách ghế không hợp lệ',
      });
    }

    const result = await bookingService.holdMultipleSeats(
      showId,
      seatIds,
      sessionId
    );

    if (!result) {
      return res.status(409).json({
        success: false,
        message: 'Một hoặc nhiều ghế không thể giữ',
      });
    }

    const io = req.app.get('io');
    if (io) {
      seatIds.forEach((seatId) => {
        io.to(`show:${showId}`).emit('seat:updated', {
          seatId,
          status: 'held',
        });
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Giữ nhiều ghế thành công',
      data: { sessionId, showId, seatIds },
    });
  } catch (err) {
    next(err);
  }
}
async function getUpcomingShows() {
  try {
    // 1. Thử lấy từ Sorted Set 'show:list:upcoming' trước
    let showIds = await redisClient.zrange('show:list:upcoming', 0, -1);
    
    // 2. Nếu không có, thử lấy từ Set 'shows:upcoming'
    if (!showIds || showIds.length === 0) {
      showIds = await redisClient.smembers('shows:upcoming');
    }

    // 3. Nếu tìm thấy danh sách ID, lấy chi tiết từng show
    if (showIds && showIds.length > 0) {
      const shows = await Promise.all(
        showIds.map(async (id) => {
          const showData = await redisClient.hgetall(keys.show(id));
          return {
            showId: id,
            name: showData.name || `Đêm Nhạc Phòng Trà ${id}`,
            date: showData.datetime || showData.date || '2026-10-15T19:30:00+07:00',
            price: Number(showData.price_default || showData.price || 150000),
            location: showData.location || 'Phòng trà ABC, Q1, TP.HCM'
          };
        })
      );
      return shows.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Fallback nếu Redis chưa có data
    return [
      { showId: 'demo-show-1', name: 'Đêm nhạc Trịnh - Acoustic Night', date: '2026-10-15T19:30:00+07:00', price: 150000 },
      { showId: 'show-2', name: 'Acoustic Mùa Hè Rực Rỡ', date: '2026-05-20T19:30:00+07:00', price: 200000 },
    ];
  } catch (error) {
    console.error('Lỗi lấy danh sách show:', error);
    return [];
  }
}

async function getSeatsByShow(showId) {
  try {
    // Thử lấy danh sách ghế từ Hash keys hoặc Set members
    let seatKeys = await redisClient.hkeys(keys.showSeats(showId));
    if (!seatKeys || seatKeys.length === 0) {
      seatKeys = await redisClient.smembers(keys.showSeats(showId));
    }

    if (seatKeys && seatKeys.length > 0) {
      const seatsRaw = await Promise.all(
        seatKeys.map(async (seatId) => {
          const seatData = await redisClient.hgetall(keys.seat(showId, seatId));
          const statusFromHash = await redisClient.hget(keys.showSeats(showId), seatId);
          return {
            seatId,
            ...seatData,
            status: statusFromHash || seatData.status || 'available',
            price: Number(seatData.price || 150000)
          };
        })
      );
      return calculateSeatLayout(seatsRaw);
    }

    // Ghế mẫu mặc định nếu show chưa có dữ liệu ghế
    const defaultSeats = [];
    const rows = ['A', 'B', 'C', 'D'];
    for (let r = 0; r < rows.length; r++) {
      for (let c = 1; c <= 8; c++) {
        defaultSeats.push({
          seatId: `${rows[r]}${c}`,
          status: 'available',
          type: rows[r] === 'A' ? 'vip' : 'standard',
          price: rows[r] === 'A' ? 300000 : 150000,
          table_shape: c % 2 === 0 ? 'square' : 'round'
        });
      }
    }
    return calculateSeatLayout(defaultSeats);
  } catch (error) {
    console.error('Lỗi lấy danh sách ghế:', error);
    return [];
  }
}

module.exports = {
  getShows,
  getShowDetail,
  getSeats,
  holdSeat,
  holdMultipleSeats,
  releaseSeat,
  getSeatsByShow,
  getUpcomingShows,
};