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

async function initPayment({
  showId,
  seatId,
  sessionId,
  customerName,
  customerPhone,
  customerEmail,
}) {
  const seat = await redisClient.hgetall(keys.seat(showId, seatId));

  if (!seat || Object.keys(seat).length === 0) {
    return {
      success: false,
      reason: 'seat_not_found',
    };
  }

  const amount = Number(seat.price);

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      success: false,
      reason: 'invalid_price',
    };
  }

  const paymentId = uuidv4();
  const customerId = uuidv4();

  const orderCode =
    `PT${Date.now()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;

  const createdAt = new Date().toISOString();

  const result = await redisClient.eval(
    luaScripts.INIT_PAYMENT,
    4,

    // KEYS
    keys.hold(showId, seatId),
    keys.payment(paymentId),
    keys.paymentByOrderCode(orderCode),
    keys.paymentPendingQueue(),

    // ARGV
    sessionId,
    paymentId,
    orderCode,
    showId,
    seatId,
    customerId,
    customerName,
    customerPhone,
    customerEmail,
    amount.toString(),
    createdAt
  );

  if (Number(result) !== 1) {
    return {
      success: false,
      reason: 'hold_expired',
    };
  }

  return {
    success: true,
    paymentId,
    orderCode,
    customerId,
    showId,
    seatId,
    amount,
    status: 'pending',
    createdAt,
  };
}

async function confirmPayment(paymentId, sessionId) {
  const paymentKey = keys.payment(paymentId);

  const payment = await redisClient.hgetall(paymentKey);

  if (!payment || Object.keys(payment).length === 0) {
    return {
      success: false,
      reason: 'payment_not_found',
    };
  }

  if (payment.session_id !== sessionId) {
    return {
      success: false,
      reason: 'session_invalid',
    };
  }

  const ticketId = uuidv4();
  const qrCode = createQrCode(ticketId);
  const now = new Date().toISOString();

  const result = await redisClient.eval(
    luaScripts.CONFIRM_PAYMENT_FULL,
    9,

    // KEYS
    paymentKey,
    keys.hold(payment.show_id, payment.seat_id),
    keys.showSeats(payment.show_id),
    keys.ticket(ticketId),
    keys.ticketByQr(qrCode),
    keys.customer(payment.customer_id),
    keys.customerTickets(payment.customer_id),
    keys.soldCount(payment.show_id),
    keys.revenue(payment.show_id),

    // ARGV
    ticketId,
    qrCode,
    now
  );

  const code = Number(result[0]);
  const returnedTicketId = result[1];

  if (code === 1) {
    console.log(
  `📧 [DEMO EMAIL] Vé đã thanh toán: ${payment.customer_email} ticket=${ticketId}`
);

    return {
      success: true,
      duplicate: false,
      ticketId,
      qrCode,
      showId: payment.show_id,
      seatId: payment.seat_id,
      customerId: payment.customer_id,
      amount: Number(payment.amount),
      status: 'paid',
    };
  }

  if (code === 2) {
    return {
      success: true,
      duplicate: true,
      ticketId: returnedTicketId,
      qrCode: await redisClient.hget(
        keys.ticket(returnedTicketId),
        'qr_code'
      ),
      showId: payment.show_id,
      seatId: payment.seat_id,
      customerId: payment.customer_id,
      amount: Number(payment.amount),
      status: 'paid',
    };
  }

  if (code === 0) {
    return {
      success: false,
      reason: 'hold_expired',
    };
  }

  return {
    success: false,
    reason: 'payment_not_pending',
  };
}

async function cancelPayment(paymentId, sessionId, reason = 'timeout') {
  const paymentKey = keys.payment(paymentId);

  const payment = await redisClient.hgetall(paymentKey);

  if (!payment || Object.keys(payment).length === 0) {
    return {
      success: false,
      reason: 'payment_not_found',
    };
  }

  if (payment.session_id !== sessionId) {
    return {
      success: false,
      reason: 'session_invalid',
    };
  }

  const result = await redisClient.eval(
    luaScripts.CANCEL_PAYMENT,
    3,

    paymentKey,
    keys.hold(payment.show_id, payment.seat_id),
    keys.showSeats(payment.show_id),

    reason
  );

  const code = Number(result);

  if (code === -1) {
    return {
      success: false,
      reason: 'already_paid',
    };
  }

  return {
    success: true,
    status: 'cancelled',
  };
}

async function getTicket(ticketId) {
  const ticket = await redisClient.hgetall(keys.ticket(ticketId));

  if (!ticket || Object.keys(ticket).length === 0) {
    return null;
  }

  return {
    ticketId,
    ...ticket,
  };
}

async function getCustomerTickets(customerId) {
  const ticketIds = await redisClient.smembers(
    keys.customerTickets(customerId)
  );

  const tickets = await Promise.all(
    ticketIds.map((ticketId) => getTicket(ticketId))
  );

  return tickets.filter(Boolean);
}

module.exports = {
  initPayment,
  confirmPayment,
  cancelPayment,
  getTicket,
  getCustomerTickets,
};