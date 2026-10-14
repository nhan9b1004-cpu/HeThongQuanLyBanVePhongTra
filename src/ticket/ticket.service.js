
const redis = require('../../config/redis');
const { keys } = require('../../shared/keys');

const client = redis.client || redis;

const CHECKIN_SCRIPT = `
local ticketKey = KEYS[1]
local historyKey = KEYS[2]
local checkedAt = ARGV[1]

if redis.call('EXISTS', ticketKey) == 0 then
  return -1
end

local status = redis.call('HGET', ticketKey, 'status')

if status ~= 'valid' and status ~= 'confirmed' then
  return -2
end

local checkedIn = redis.call('HGET', ticketKey, 'checked_in')

if checkedIn == 'true' or checkedIn == '1' then
  return 0
end

redis.call('HSET', ticketKey,
  'checked_in', 'true',
  'checked_in_at', checkedAt
)

redis.call('ZADD', historyKey, checkedAt, ARGV[2])

return 1
`;

async function findTicketByQr(qrCode) {
  if (!qrCode || !qrCode.trim()) {
    throw new Error('QR_CODE_REQUIRED');
  }

  const ticketId = await client.get(keys.ticketQr(qrCode.trim()));

  if (!ticketId) {
    return null;
  }

  const ticket = await client.hGetAll(keys.ticket(ticketId));

  if (!Object.keys(ticket).length) {
    return null;
  }

  return {
    ticket_id: ticketId,
    ...ticket
  };
}

async function checkInTicket(ticketId) {
  const checkedAt = String(Date.now());

  const result = Number(await client.eval(CHECKIN_SCRIPT, {
    keys: [
      keys.ticket(ticketId),
      keys.ticketCheckinHistory()
    ],
    arguments: [checkedAt, ticketId]
  }));

  if (result === 1) {
    return {
      success: true,
      message: 'Check-in thành công',
      ticket_id: ticketId,
      checked_in_at: new Date(Number(checkedAt)).toISOString()
    };
  }

  if (result === 0) {
    return {
      success: false,
      code: 'ALREADY_CHECKED_IN',
      message: 'Vé đã được sử dụng'
    };
  }

  if (result === -1) {
    return {
      success: false,
      code: 'TICKET_NOT_FOUND',
      message: 'Không tìm thấy vé'
    };
  }

  if (result === -2) {
    return {
      success: false,
      code: 'TICKET_INVALID',
      message: 'Vé chưa thanh toán hoặc không hợp lệ'
    };
  }

  throw new Error('CHECKIN_UNEXPECTED_RESULT');
}

async function getRecentCheckins(limit = 20) {
  const ticketIds = await client.zRange(
    keys.ticketCheckinHistory(),
    0,
    limit - 1,
    { REV: true }
  );

  return Promise.all(
    ticketIds.map(async (ticketId) => {
      const ticket = await client.hGetAll(keys.ticket(ticketId));

      return {
        ticket_id: ticketId,
        show_id: ticket.show_id || '',
        seat_id: ticket.seat_id || '',
        customer_id: ticket.customer_id || '',
        checked_in: ticket.checked_in === 'true',
        checked_in_at: ticket.checked_in_at
          ? new Date(Number(ticket.checked_in_at)).toISOString()
          : null
      };
    })
  );
}

module.exports = {
  findTicketByQr,
  checkInTicket,
  getRecentCheckins
};