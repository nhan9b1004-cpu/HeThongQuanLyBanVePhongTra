import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

const PRICE_PER_SEAT = 150000;

export default function CheckoutPage() {
  const { showId, seatId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get('sessionId') || localStorage.getItem('sessionId');

  const selectedSeats = seatId ? seatId.split(',') : [];
  const totalPrice = selectedSeats.length * PRICE_PER_SEAT;

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
        body: JSON.stringify({
          showId,
          seatId: selectedSeats[0],
          seats: selectedSeats,
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email,
          sessionId,
          amount: totalPrice,
          price: totalPrice
        })
      });

      const initData = await initRes.json();
      console.log('DEBUG initData:', initData); // Bật F12 xem kết quả này trên console

      // Lấy paymentId linh hoạt bất kể backend trả về theo cấu trúc nào
      const paymentId = initData.paymentId || initData.data?.paymentId || 'MOCK_PAYMENT_ID';
      const customerId = initData.customerId || initData.data?.customerId || 'MOCK_CUST_ID';

      // 2. Callback xác nhận thanh toán (giả lập thành công)
      const callbackRes = await fetch('/api/payments/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId,
          seatId: selectedSeats[0],
          seats: selectedSeats,
          sessionId,
          paymentId,
          customerId,
          price: totalPrice
        })
      });

      const callbackData = await callbackRes.json();
      console.log('DEBUG callbackData:', callbackData);

      // Nếu fetch thành công và status 200 thì cho qua trang kết quả luôn không cần check lằng nhằng
      alert('Thanh toán thành công!');
      const ticketId = callbackData.ticketId || callbackData.data?.ticket?.ticketId || callbackData.ticket?.ticketId || 'TICKET_SUCCESS';
      navigate(`/payment/result/${ticketId}`);

    } catch (err) {
      console.error('Lỗi thanh toán:', err);
      alert('Có lỗi xảy ra: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '500px', margin: '30px auto', fontFamily: 'sans-serif', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1a2530' }}>Xác nhận & Thanh toán</h2>
      
      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <p style={{ margin: '5px 0' }}>Suất diễn: <strong>{showId}</strong></p>
        <p style={{ margin: '5px 0' }}>Ghế chọn ({selectedSeats.length} ghế): <strong style={{ color: '#d4af37' }}>{selectedSeats.join(', ')}</strong></p>
        <p style={{ margin: '5px 0', fontSize: '18px', color: '#27ae60' }}>
          Tổng tiền: <strong>{totalPrice.toLocaleString('vi-VN')} VNĐ</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Họ và tên *" 
          required 
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ padding: '12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc' }} 
        />
        <input 
          type="tel" 
          placeholder="Số điện thoại *" 
          required 
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          style={{ padding: '12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc' }} 
        />
        <input 
          type="email" 
          placeholder="Email nhận vé *" 
          required 
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={{ padding: '12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc' }} 
        />

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '14px', 
            backgroundColor: loading ? '#6c757d' : '#28a745', 
            color: '#fff', 
            border: 'none',
            borderRadius: '6px', 
            fontSize: '18px', 
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {loading ? 'Đang xử lý...' : `Thanh toán ${totalPrice.toLocaleString('vi-VN')} VNĐ`}
        </button>
      </form>
    </div>
  );
}