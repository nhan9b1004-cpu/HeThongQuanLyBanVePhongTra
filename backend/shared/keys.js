const keys = {
  show: (showId) => `show:${showId}`,
  showListUpcoming: () => `show:list:upcoming`,

  showSeats: (showId) => `show:${showId}:seats`,
  seat: (showId, seatId) => `show:${showId}:seat:${seatId}`,
  showLayout: (showId) => `show:${showId}:layout`,

  hold: (showId, seatId) => `hold:${showId}:${seatId}`,

  ticket: (ticketId) => `ticket:${ticketId}`,
  ticketByQr: (qrCode) => `ticket:qr:${qrCode}`,

  customer: (customerId) => `customer:${customerId}`,
  customerTickets: (customerId) => `customer:${customerId}:tickets`,

  soldCount: (showId) => `show:${showId}:sold_count`,
  revenue: (showId) => `show:${showId}:revenue`,

  paymentPendingQueue: () => `queue:payment_pending`,
};

module.exports = keys;