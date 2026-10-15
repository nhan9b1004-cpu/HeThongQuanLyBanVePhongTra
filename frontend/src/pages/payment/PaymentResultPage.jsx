import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { paymentApi } from '../../api/paymentApi';

export default function PaymentResultPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    paymentApi
      .getTicket(ticketId)
      .then((res) => {
        setTicket(res.data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ticketId]);

  if (loading) {
    return <p style={{ padding: 24 }}>Đang tải vé...</p>;
  }

  if (error || !ticket) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Không tìm thấy vé</h2>

        <p style={{ color: 'red' }}>
          {error}
        </p>

        <button onClick={() => navigate('/')}>
          Về trang chủ
        </button>
      </div>
    );
  }

  const qrImageUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      ticket.qr_code
    )}`;

  return (
    <div
      style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: 24,
      }}
    >
      <div
        style={{
          padding: 24,
          border: '2px solid #22c55e',
          borderRadius: 12,
          textAlign: 'center',
        }}
      >
        <h1>✓ Thanh toán thành công</h1>

        <p>
          Mã vé:
          <strong> {ticket.ticketId}</strong>
        </p>

        <p>
          Bàn/ghế:
          <strong> {ticket.seat_id}</strong>
        </p>

        <p>
          Trạng thái:
          <strong> {ticket.status}</strong>
        </p>

        <div style={{ margin: '24px 0' }}>
          <img
            src={qrImageUrl}
            alt="QR vé"
            width="220"
            height="220"
          />
        </div>

        <p
          style={{
            fontSize: 12,
            wordBreak: 'break-all',
            color: '#666',
          }}
        >
          QR: {ticket.qr_code}
        </p>

        <button
          onClick={() => navigate('/my-tickets')}
          style={{
            padding: '12px 20px',
            marginRight: 8,
          }}
        >
          Vé của tôi
        </button>

        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 20px',
          }}
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}