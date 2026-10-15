import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function Ticket() {
  const { ticketId } = useParams();

  // Dùng API tạo QR miễn phí từ mã ticketId
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${ticketId}&size=200x200`;

  return (
    <div style={{ padding: '30px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <div style={{
        border: '2px dashed #28a745',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '400px',
        margin: '0 auto',
        backgroundColor: '#f9f9f9'
      }}>
        <h2 style={{ color: '#28a745', marginTop: 0 }}>VÉ ĐIỆN TỬ</h2>
        <p>Mã vé: <code>{ticketId}</code></p>
        
        <div style={{ margin: '20px 0' }}>
          <img src={qrUrl} alt="QR Vé" style={{ borderRadius: '8px' }} />
        </div>

        <p style={{ fontSize: '14px', color: '#666' }}>
          Vui lòng xuất trình mã QR này tại cửa soát vé phòng trà.
        </p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}