const redisClient = require('../../config/redis');
const keys = require('../../shared/keys');
const luaScripts = require('../../shared/luaScripts');
const { HOLD_TTL_SECONDS, SEAT_STATUS } = require('../../shared/constants');

async function getUpcomingShows() {
  const showIds = await redisClient.zrange(keys.showListUpcoming(), 0, -1);
  const shows = await Promise.all(
    showIds.map(async (showId) => {
      const detail = await redisClient.hgetall(keys.show(showId));
      return { showId, ...detail };
    })
  );
  return shows;
}

async function getShowById(showId) {
  const show = await redisClient.hgetall(keys.show(showId));
  if (!show || Object.keys(show).length === 0) return null;
  return { showId, ...show };
}

async function getSeatsByShow(showId) {
  const seatsHash = await redisClient.hgetall(keys.showSeats(showId));
  const seatIds = Object.keys(seatsHash);

  const seatDetails = await Promise.all(
    seatIds.map(async (seatId) => {
      const detail = await redisClient.hgetall(keys.seat(showId, seatId));
      return {
        seatId,
        status: seatsHash[seatId],
        type: detail.type,
        price: detail.price ? Number(detail.price) : null,
        x: detail.x ? Number(detail.x) : null,
        y: detail.y ? Number(detail.y) : null,
        table_shape: detail.table_shape,
        capacity: detail.capacity ? Number(detail.capacity) : null,
      };
    })
  );

  return seatDetails;
}

async function holdSeat(showId, seatId, sessionId) {
  const result = await redisClient.eval(
    luaScripts.HOLD_SEAT,
    2,
    keys.showSeats(showId),
    keys.hold(showId, seatId),
    seatId,
    sessionId,
    HOLD_TTL_SECONDS
  );
  return result === 1;
}

async function holdMultipleSeats(showId, seatIds, sessionId) {
  const result = await redisClient.eval(
    luaScripts.HOLD_MULTIPLE_SEATS,
    1,
    keys.showSeats(showId),
    showId,
    sessionId,
    HOLD_TTL_SECONDS,
    ...seatIds
  );
  return result === 1;
}

async function releaseSeat(showId, seatId) {
  const result = await redisClient.eval(
    luaScripts.RELEASE_SEAT,
    2,
    keys.showSeats(showId),
    keys.hold(showId, seatId),
    seatId
  );
  return result === 1;
}

async function getSeatStatus(showId, seatId) {
  const status = await redisClient.hget(keys.showSeats(showId), seatId);
  return status || SEAT_STATUS.AVAILABLE;
}

module.exports = {
  getUpcomingShows,
  getShowById,
  getSeatsByShow,
  holdSeat,
  holdMultipleSeats,
  releaseSeat,
  getSeatStatus,
};