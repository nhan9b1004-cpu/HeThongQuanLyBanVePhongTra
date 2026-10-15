const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');

router.post('/payments/init', paymentController.init);
router.post('/payments/callback', paymentController.callback);
router.get('/tickets/:ticketId', paymentController.getTicket);
router.get('/my-tickets', paymentController.myTickets);

module.exports = router;