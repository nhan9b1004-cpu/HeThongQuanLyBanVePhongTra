const SEAT_STATUS = {
  AVAILABLE: 'available',
  HELD: 'held',
  SOLD: 'sold',
  DISABLED: 'disabled',
};

const TICKET_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

const HOLD_TTL_SECONDS = 300;

const TABLE_SHAPE = {
  ROUND: 'round',
  SQUARE: 'square',
  SOFA: 'sofa',
  BAR: 'bar',
};

module.exports = { SEAT_STATUS, TICKET_STATUS, HOLD_TTL_SECONDS, TABLE_SHAPE };