import axiosClient from './axiosClient';

export const bookingApi = {
  // Lấy danh sách show (Dùng getShows hoặc thêm getUpcomingShows trỏ đúng route)
  getShows: () => axiosClient.get('/shows'),
  getUpcomingShows: () => axiosClient.get('/shows/upcoming'), // Hoặc trỏ tới '/shows' tùy backend
  
  getShowDetail: (showId) => axiosClient.get(`/shows/${showId}`),
  getSeats: (showId) => axiosClient.get(`/shows/${showId}/seats`),
  
  holdSeat: (showId, seatId, sessionId) =>
    axiosClient.post(`/shows/${showId}/seats/${seatId}/hold`, { sessionId }),
    
  holdMultipleSeats: (showId, seatIds, sessionId) =>
    axiosClient.post(`/shows/${showId}/seats/hold-multiple`, { seatIds, sessionId }),
    
  releaseSeat: (showId, seatId) =>
    axiosClient.delete(`/shows/${showId}/seats/${seatId}/hold`),
    
  // Bổ sung API khởi tạo thanh toán & callback nếu trang Checkout cần gọi qua bookingApi
  initPayment: (data) => axiosClient.post('/payments/init', data),
  confirmPayment: (data) => axiosClient.post('/payments/callback', data),
};