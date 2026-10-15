const luaScripts = {

  HOLD_SEAT: `
    local seatStatus = redis.call('HGET', KEYS[1], ARGV[1])
    if seatStatus == false or seatStatus == 'available' then
      redis.call('HSET', KEYS[1], ARGV[1], 'held')
      redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[3])
      return 1
    else
      return 0
    end
  `,

  HOLD_MULTIPLE_SEATS: `
    local showSeatsKey = KEYS[1]
    local showId = ARGV[1]
    local sessionId = ARGV[2]
    local ttl = ARGV[3]

    for i = 4, #ARGV do
      local seatId = ARGV[i]
      local status = redis.call('HGET', showSeatsKey, seatId)
      if status ~= false and status ~= 'available' then
        return 0
      end
    end

    for i = 4, #ARGV do
      local seatId = ARGV[i]
      redis.call('HSET', showSeatsKey, seatId, 'held')
      local holdKey = 'hold:' .. showId .. ':' .. seatId
      redis.call('SET', holdKey, sessionId, 'EX', ttl)
    end

    return 1
  `,

  RELEASE_SEAT: `
    redis.call('HSET', KEYS[1], ARGV[1], 'available')
    redis.call('DEL', KEYS[2])
    return 1
  `,

  CONFIRM_PAYMENT: `
    local holdValue = redis.call('GET', KEYS[2])
    if holdValue == ARGV[2] then
      redis.call('HSET', KEYS[1], ARGV[1], 'sold')
      redis.call('DEL', KEYS[2])
      return 1
    else
      return 0
    end
  `,

  CHECKIN_TICKET: `
    local checkedIn = redis.call('HGET', KEYS[1], 'checked_in')
    if checkedIn == 'false' or checkedIn == false then
      redis.call('HSET', KEYS[1], 'checked_in', 'true')
      redis.call('HSET', KEYS[1], 'checked_in_at', ARGV[1])
      return 1
    else
      return 0
    end
  `,

  // =========================================================
  // NGƯỜI B - KHỞI TẠO THANH TOÁN
  // =========================================================
  INIT_PAYMENT: `
    local holdValue = redis.call('GET', KEYS[1])

    if holdValue ~= ARGV[1] then
      return 0
    end

    redis.call(
      'HSET',
      KEYS[2],
      'payment_id', ARGV[2],
      'order_code', ARGV[3],
      'show_id', ARGV[4],
      'seat_id', ARGV[5],
      'session_id', ARGV[1],
      'customer_id', ARGV[6],
      'customer_name', ARGV[7],
      'customer_phone', ARGV[8],
      'customer_email', ARGV[9],
      'amount', ARGV[10],
      'status', 'pending',
      'created_at', ARGV[11]
    )

    redis.call('SET', KEYS[3], ARGV[2], 'EX', 900)
    redis.call('LPUSH', KEYS[4], ARGV[2])
    redis.call('EXPIRE', KEYS[2], 900)

    return 1
  `,

  CONFIRM_PAYMENT_FULL: `
    local paymentStatus = redis.call('HGET', KEYS[1], 'status')

    if paymentStatus == 'paid' then
      local oldTicketId = redis.call('HGET', KEYS[1], 'ticket_id')
      return {2, oldTicketId}
    end

    if paymentStatus ~= 'pending' then
      return {-1, ''}
    end

    local sessionId = redis.call('HGET', KEYS[1], 'session_id')
    local showId = redis.call('HGET', KEYS[1], 'show_id')
    local seatId = redis.call('HGET', KEYS[1], 'seat_id')
    local customerId = redis.call('HGET', KEYS[1], 'customer_id')
    local customerName = redis.call('HGET', KEYS[1], 'customer_name')
    local customerPhone = redis.call('HGET', KEYS[1], 'customer_phone')
    local customerEmail = redis.call('HGET', KEYS[1], 'customer_email')
    local amount = redis.call('HGET', KEYS[1], 'amount')

    local holdValue = redis.call('GET', KEYS[2])
    local seatStatus = redis.call('HGET', KEYS[3], seatId)

    -- Hold đã hết hạn hoặc session không đúng
    if holdValue ~= sessionId or seatStatus ~= 'held' then
      redis.call('HSET', KEYS[1],
        'status', 'cancelled',
        'cancelled_reason', 'hold_expired'
      )
      return {0, ''}
    end

    -- Chuyển ghế sang sold
    redis.call('HSET', KEYS[3], seatId, 'sold')

    -- Xóa hold
    redis.call('DEL', KEYS[2])

    -- Tạo ticket
    redis.call(
      'HSET',
      KEYS[4],
      'show_id', showId,
      'seat_id', seatId,
      'customer_id', customerId,
      'qr_code', ARGV[2],
      'status', 'paid',
      'checked_in', 'false',
      'checked_in_at', '',
      'created_at', ARGV[3]
    )

    -- Mapping QR -> ticket
    redis.call('SET', KEYS[5], ARGV[2])

    -- Customer
    redis.call(
      'HSET',
      KEYS[6],
      'name', customerName,
      'phone', customerPhone,
      'email', customerEmail
    )

    -- Customer -> tickets
    redis.call('SADD', KEYS[7], ARGV[1])

    -- Thống kê
    redis.call('INCR', KEYS[8])
    redis.call('INCRBYFLOAT', KEYS[9], amount)

    -- Payment hoàn tất
    redis.call(
      'HSET',
      KEYS[1],
      'status', 'paid',
      'ticket_id', ARGV[1],
      'qr_code', ARGV[2],
      'paid_at', ARGV[3]
    )

    return {1, ARGV[1]}
  `,

  // =========================================================
  // NGƯỜI B - TIMEOUT / PAYMENT FAILED
  // =========================================================
  CANCEL_PAYMENT: `
    local paymentStatus = redis.call('HGET', KEYS[1], 'status')

    if paymentStatus == 'paid' then
      return -1
    end

    if paymentStatus ~= 'pending' then
      return 0
    end

    local sessionId = redis.call('HGET', KEYS[1], 'session_id')
    local holdValue = redis.call('GET', KEYS[2])
    local seatId = redis.call('HGET', KEYS[1], 'seat_id')

    if holdValue == sessionId then
      redis.call('HSET', KEYS[3], seatId, 'available')
      redis.call('DEL', KEYS[2])
    end

    redis.call(
      'HSET',
      KEYS[1],
      'status', 'cancelled',
      'cancelled_reason', ARGV[1]
    )

    return 1
  `
};

module.exports = luaScripts;