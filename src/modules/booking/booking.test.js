const redisClient = require('../../config/redis');
const keys = require('../../shared/keys');
const bookingService = require('./booking.service');

const SHOW_ID = 'test-show-1';
const SEAT_ID = 'A1';

beforeEach(async () => {
  await redisClient.hset(keys.showSeats(SHOW_ID), SEAT_ID, 'available');
  await redisClient.del(keys.hold(SHOW_ID, SEAT_ID));
});

afterAll(async () => {
  await redisClient.del(keys.showSeats(SHOW_ID));
  await redisClient.del(keys.hold(SHOW_ID, SEAT_ID));
  redisClient.disconnect();
});

test('Giữ ghế thành công khi ghế đang available', async () => {
  const result = await bookingService.holdSeat(SHOW_ID, SEAT_ID, 'session-A');
  expect(result).toBe(true);

  const status = await bookingService.getSeatStatus(SHOW_ID, SEAT_ID);
  expect(status).toBe('held');
});

test('Giữ ghế thất bại khi ghế đã bị giữ bởi người khác', async () => {
  await bookingService.holdSeat(SHOW_ID, SEAT_ID, 'session-A');
  const result = await bookingService.holdSeat(SHOW_ID, SEAT_ID, 'session-B');
  expect(result).toBe(false);
});

test('2 người giữ cùng lúc 1 ghế -> chỉ đúng 1 người thành công (chống race condition)', async () => {
  const results = await Promise.all([
    bookingService.holdSeat(SHOW_ID, SEAT_ID, 'session-A'),
    bookingService.holdSeat(SHOW_ID, SEAT_ID, 'session-B'),
  ]);

  const successCount = results.filter((r) => r === true).length;
  expect(successCount).toBe(1);
});

test('Nhả ghế thành công -> ghế trở lại available', async () => {
  await bookingService.holdSeat(SHOW_ID, SEAT_ID, 'session-A');
  await bookingService.releaseSeat(SHOW_ID, SEAT_ID);

  const status = await bookingService.getSeatStatus(SHOW_ID, SEAT_ID);
  expect(status).toBe('available');
});