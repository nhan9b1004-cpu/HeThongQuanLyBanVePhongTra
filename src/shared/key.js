module.exports = {
  seat: (showId, seatId) => `show:${showId}:seat:${seatId}`,
  hold: (showId, seatId) => `hold:${showId}:${seatId}`,
  payment: (paymentId) => `payment:${paymentId}`,
  paymentByOrderCode: (orderCode) => `payment:order:${orderCode}`,
  paymentPendingQueue: () => `payments:pending`,
  showSeats: (showId) => `show:${showId}:seats`,
  ticket: (ticketId) => `ticket:${ticketId}`,
  ticketByQr: (qrCode) => `ticket:qr:${qrCode}`,
  customer: (customerId) => `customer:${customerId}`,
  customerTickets: (customerId) => `customer:${customerId}:tickets`,
  soldCount: (showId) => `show:${showId}:sold_count`,
  revenue: (showId) => `show:${showId}:revenue`,
};