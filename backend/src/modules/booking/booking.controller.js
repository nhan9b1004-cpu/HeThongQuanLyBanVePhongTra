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

async function holdMultipleSeats(req, res, next) {
  try {
    const { showId } = req.params;
    const { seatIds } = req.body;
    const sessionId = req.body.sessionId || uuidv4();

    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Thiếu danh sách seatIds' });
    }

    const success = await bookingService.holdMultipleSeats(showId, seatIds, sessionId);

    if (!success) {
      return res.status(409).json({
        success: false,
        message: 'Có ít nhất 1 ghế trong nhóm đã bị giữ/bán, vui lòng chọn lại',
      });
    }

    const io = req.app.get('io');
    if (io) {
      seatIds.forEach((seatId) => {
        io.to(`show:${showId}`).emit('seat:updated', { seatId, status: 'held' });
      });
    }

    res.status(200).json({
      success: true,
      message: 'Giữ nhóm ghế thành công',
      data: { sessionId, showId, seatIds, ttlSeconds: 300 },
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

module.exports = { getShows, getShowDetail, getSeats, holdSeat, holdMultipleSeats, releaseSeat };