const { test } = require('node:test');
const assert = require('node:assert/strict');

const redis = require('../../config/redis');
const { keys } = require('../../shared/keys');
const { checkInTicket } = require('./ticket.service');

const client = redis.client || redis;

test('Hai request đồng thời chỉ một request check-in thành công', async () => {
  const ticketId = `test-ticket-${Date.now()}`;

  await client.hSet(keys.ticket(ticketId), {
    show_id: 'test-show',
    seat_id: 'test-seat',
    customer_id: 'test-customer',
    status: 'valid',
    checked_in: 'false',
    checked_in_at: ''
  });

  try {
    const results = await Promise.all([
      checkInTicket(ticketId),
      checkInTicket(ticketId)
    ]);

    assert.equal(
      results.filter(item => item.success).length,
      1
    );

    assert.equal(
      results.filter(
        item => item.code === 'ALREADY_CHECKED_IN'
      ).length,
      1
    );
  } finally {
    await client.del(keys.ticket(ticketId));
  }
});