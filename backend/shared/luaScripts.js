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

};

module.exports = luaScripts;