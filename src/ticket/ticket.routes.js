const express = require('express');
const controller = require('./ticket.controller');

const router = express.Router();

router.get('/qr/:code', controller.getTicketByQr);

router.post('/:id/checkin', controller.checkIn);

router.get('/checkins/recent', controller.getRecentCheckins);

module.exports = router;