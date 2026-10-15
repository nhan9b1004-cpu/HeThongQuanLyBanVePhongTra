const router = require('express').Router();
const c = require('./payment.controller');

router.post('/payments/init', c.init);
router.post('/payments/callback', c.callback);
router.get('/payments/tickets/:ticketId', c.getTicket);
router.get('/tickets/:ticketId', c.getTicket);
router.get('/my-tickets', c.myTickets);

module.exports = router;