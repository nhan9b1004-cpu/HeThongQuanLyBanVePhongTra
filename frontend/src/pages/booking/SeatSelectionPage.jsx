import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingApi } from '../../api/bookingApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import SeatMapView from '../../components/SeatMap/SeatMapView';

const HOLD_TTL_SECONDS = 300;

function getSessionId() {
  let id = localStorage.getItem('booking_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('booking_session_id', id);
  }
  return id;
}

export default function SeatSelectionPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const sessionId = useMemo(getSessionId, []);

  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]); // ĐỔI THÀNH MẢNG ĐỂ CHỌN NHIỀU GHẾ
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { lastSeatUpdate } = useWebSocket(showId);

  useEffect(() => {
    bookingApi
      .getSeats(showId)
      .then((res) => setSeats(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [showId]);

  useEffect(() => {
    if (!lastSeatUpdate) return;
    setSeats((prev) =>
      prev.map((s) => (s.seatId === lastSeatUpdate.seatId ? { ...s, status: lastSeatUpdate.status } : s))
    );
  }, [lastSeatUpdate]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setSelectedSeatIds([]);
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // LOGIC CHỌN / HỦY CHỌN NHIỀU GHẾ
  const handleSelectSeat = useCallback(
    async (seatId) => {
      setError(null);
      try {
        const isSelected = selectedSeatIds.includes(seatId);

        if (isSelected) {
          // NẾU GHẾ ĐÃ ĐƯỢC CHỌN -> CLICK LẦN NỮA ĐỂ HỦY CHỌN (BỎ HOLD)
          await bookingApi.releaseSeat(showId, seatId);
          setSeats((prev) => prev.map((s) => (s.seatId === seatId ? { ...s, status: 'available' } : s)));
          
          const updated = selectedSeatIds.filter((id) => id !== seatId);
          setSelectedSeatIds(updated);
          if (updated.length === 0) setCountdown(null);
        } else {
          // NẾU CHƯA CHỌN -> GỌI API GIỮ GHẾ VÀ THÊM VÀO DANH SÁCH
          await bookingApi.holdSeat(showId, seatId, sessionId);
          setSeats((prev) => prev.map((s) => (s.seatId === seatId ? { ...s, status: 'held' } : s)));
          
          setSelectedSeatIds((prev) => [...prev, seatId]);
          if (countdown === null) setCountdown(HOLD_TTL_SECONDS);
        }
      } catch (err) {
        setError(err.message || 'Không thể thao tác ghế này.');
      }
    },
    [showId, sessionId, selectedSeatIds, countdown]
  );

  const handleCancelAll = useCallback(async () => {
    if (selectedSeatIds.length === 0) return;
    for (const seatId of selectedSeatIds) {
      await bookingApi.releaseSeat(showId, seatId);
    }
    setSeats((prev) =>
      prev.map((s) => (selectedSeatIds.includes(s.seatId) ? { ...s, status: 'available' } : s))
    );
    setSelectedSeatIds([]);
    setCountdown(null);
  }, [showId, selectedSeatIds]);

  const handleProceedToPayment = () => {
    // Chuyển danh sách ghế phân tách bằng dấu phẩy sang trang thanh toán
    const seatsParam = selectedSeatIds.join(',');
    navigate(`/checkout/${showId}/${seatsParam}?sessionId=${sessionId}`);
  };

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>Đang tải sơ đồ ghế...</div>;

  return (
    <div className="luxury-booking-container">
      <style>{`
        body {
          background-color: #0d1117;
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .luxury-booking-container {
          max-width: 1050px;
          margin: 30px auto;
          padding: 30px;
          background: #161b22;
          border-radius: 16px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
          color: #f0f6fc;
        }
        h1 {
          text-align: center;
          color: #e6dfd5;
          margin-bottom: 25px;
          font-size: 26px;
          letter-spacing: 1px;
        }
        .error-banner {
          background: #ffebe9;
          color: #cf222e;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .action-bar {
          margin-top: 25px;
          padding: 20px;
          border: 1px solid #30363d;
          border-radius: 12px;
          background: #21262d;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }
        .btn-luxury-pay {
          background: linear-gradient(135deg, #d4af37, #aa7c11);
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-luxury-pay:hover { opacity: 0.9; }
        .btn-luxury-cancel {
          background: transparent;
          color: #f85149;
          border: 1px solid #f85149;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-luxury-cancel:hover { background: rgba(248, 81, 73, 0.1); }
      `}</style>

      <h1>ĐẶT VÉ PHÒNG TRÀ – CHỌN GHẾ</h1>
      {error && <div className="error-banner">{error}</div>}

      <SeatMapView
        seats={seats}
        selectedSeatIds={selectedSeatIds}
        onSelectSeat={handleSelectSeat}
      />

      {selectedSeatIds.length > 0 && (
        <div className="action-bar">
          <div style={{ fontSize: 16 }}>
            Bàn đã chọn: <strong style={{ color: '#d4af37' }}>{selectedSeatIds.join(', ')}</strong> — Thời gian giữ chỗ:{' '}
            <span style={{ color: '#f85149', fontWeight: 'bold' }}>
              {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-luxury-pay" onClick={handleProceedToPayment}>
              Thanh toán ({selectedSeatIds.length} ghế)
            </button>
            <button className="btn-luxury-cancel" onClick={handleCancelAll}>
              Hủy tất cả
            </button>
          </div>
        </div>
      )}
    </div>
  );
}