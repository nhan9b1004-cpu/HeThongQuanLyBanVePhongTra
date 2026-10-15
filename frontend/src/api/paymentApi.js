import axiosClient from './axiosClient';

export const paymentApi = {
  initPayment: (data) =>
    axiosClient.post('/payments/init', data),

  callback: (data) =>
    axiosClient.post('/payments/callback', data),

  timeout: (data) =>
    axiosClient.post('/payments/timeout', data),

  getTicket: (ticketId) =>
    axiosClient.get(`/payments/tickets/${ticketId}`),

  getCustomerTickets: (customerId) =>
    axiosClient.get(`/payments/customers/${customerId}/tickets`),
};