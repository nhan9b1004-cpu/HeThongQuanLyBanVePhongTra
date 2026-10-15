// backend/src/modules/booking/booking.routes.js
const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');

// Lấy danh sách show sắp diễn ra
router.get('/shows', bookingController.getShows);

// Lấy chi tiết một show
router.get('/shows/:showId', bookingController.getShowDetail);

// Lấy danh sách ghế của show
router.get('/shows/:showId/seats', bookingController.getSeats);

// Giữ một ghế đơn
router.post('/shows/:showId/seats/:seatId/hold', bookingController.holdSeat);

// Giữ nhiều ghế cùng lúc
router.post('/shows/:showId/seats/hold-multiple', bookingController.holdMultipleSeats);

// Nhả ghế
router.delete('/shows/:showId/seats/:seatId/hold', bookingController.releaseSeat);

module.exports = router;