import axiosClient from './axiosClient';

export const bookingApi = {
  getShows: () => axiosClient.get('/shows'),
  getShowDetail: (showId) => axiosClient.get(`/shows/${showId}`),
  getSeats: (showId) => axiosClient.get(`/shows/${showId}/seats`),
  holdSeat: (showId, seatId, sessionId) =>
    axiosClient.post(`/shows/${showId}/seats/${seatId}/hold`, { sessionId }),
  holdMultipleSeats: (showId, seatIds, sessionId) =>
    axiosClient.post(`/shows/${showId}/seats/hold-multiple`, { seatIds, sessionId }),
  releaseSeat: (showId, seatId) =>
    axiosClient.delete(`/shows/${showId}/seats/${seatId}/hold`),
};