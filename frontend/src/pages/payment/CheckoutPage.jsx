import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

export default function CheckoutPage() {
  const { showId, seatId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get('sessionId') || localStorage.getItem('sessionId');

  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Khởi tạo thanh toán
      const initRes = await fetch('/api/payments/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showId, seatId, customerInfo: form, price: 150000 })
      });
      const initData = await initRes.json();
      if (!initData.success) throw new Error(initData.message);

      // 2. Callback xác nhận thanh toán (giả lập)
      const callbackRes = await fetch('/api/payments/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId,
          seatId,
          sessionId,
          customerId: initData.data.customerId,
          price: 150000
        })
      });
      const callbackData = await callbackRes.json();

      if (callbackData.success) {
        alert('Thanh toán thành công!');
        navigate(`/payment/result/${callbackData.data.ticket.ticketId}`); // đã sửa route
      } else {
        alert('Thanh toán thất bại: ' + callbackData.message);
      }
    } catch (err) {
      alert('Có lỗi xảy ra: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Xác nhận & Thanh toán</h2>
      <p>Suất diễn: <strong>{showId}</strong> | Ghế chọn: <strong>{seatId}</strong></p>
      <p>Giá vé: <strong>150.000 VNĐ</strong></p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" placeholder="Họ và tên *" required value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ padding: '10px', fontSize: '16px' }} />
        <input type="tel" placeholder="Số điện thoại *" required value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          style={{ padding: '10px', fontSize: '16px' }} />
        <input type="email" placeholder="Email nhận vé *" required value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={{ padding: '10px', fontSize: '16px' }} />

        <button type="submit" disabled={loading}
          style={{ padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none',
                   borderRadius: '5px', fontSize: '18px', cursor: 'pointer' }}>
          {loading ? 'Đang xử lý...' : 'Thanh toán ngay (Demo)'}
        </button>
      </form>
    </div>
  );
}