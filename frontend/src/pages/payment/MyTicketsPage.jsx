import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { paymentApi } from '../../api/paymentApi';

export default function MyTicketsPage() {
  const navigate = useNavigate();

  const customerId = localStorage.getItem('customer_id');

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerId) {
      setError('Chưa có thông tin khách hàng');
      setLoading(false);
      return;
    }

    paymentApi
      .getCustomerTickets(customerId)
      .then((res) => {
        setTickets(res.data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [customerId]);

  if (loading) {
    return <p style={{ padding: 24 }}>Đang tải vé...</p>;
  }

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: 24,
      }}
    >
      <h1>Vé của tôi</h1>

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {!error && tickets.length === 0 && (
        <p>Chưa có vé nào.</p>
      )}

      {tickets.map((ticket) => (
        <div
          key={ticket.ticketId}
          style={{
            padding: 20,
            marginBottom: 16,
            border: '1px solid #ddd',
            borderRadius: 10,
          }}
        >
          <h3>Vé {ticket.ticketId}</h3>

          <p>
            Bàn/ghế:{' '}
            <strong>{ticket.seat_id}</strong>
          </p>

          <p>
            Trạng thái:{' '}
            <strong>{ticket.status}</strong>
          </p>

          <p>
            Thời gian đặt:{' '}
            {ticket.created_at}
          </p>

          <button
            onClick={() =>
              navigate(`/payment/result/${ticket.ticketId}`)
            }
          >
            Xem vé + QR
          </button>
        </div>
      ))}
    </div>
  );
}