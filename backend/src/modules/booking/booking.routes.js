// backend/src/modules/booking/booking.routes.js
const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');

router.get('/shows/:showId/seats', bookingController.getSeats);
router.post('/shows/:showId/seats/:seatId/hold', bookingController.holdSeat);
router.delete('/shows/:showId/seats/:seatId/hold', bookingController.releaseSeat);

module.exports = router;