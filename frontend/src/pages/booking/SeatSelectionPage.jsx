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
  const [selectedSeatId, setSelectedSeatId] = useState(null);
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
      setSelectedSeatId(null);
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSelectSeat = useCallback(
    async (seatId) => {
      setError(null);
      try {
        await bookingApi.holdSeat(showId, seatId, sessionId);
        setSelectedSeatId(seatId);
        setCountdown(HOLD_TTL_SECONDS);
        setSeats((prev) => prev.map((s) => (s.seatId === seatId ? { ...s, status: 'held' } : s)));
      } catch (err) {
        setError(err.message);
      }
    },
    [showId, sessionId]
  );

  const handleCancelHold = useCallback(async () => {
    if (!selectedSeatId) return;
    await bookingApi.releaseSeat(showId, selectedSeatId);
    setSeats((prev) => prev.map((s) => (s.seatId === selectedSeatId ? { ...s, status: 'available' } : s)));
    setSelectedSeatId(null);
    setCountdown(null);
  }, [showId, selectedSeatId]);

  const handleProceedToPayment = () => {
    navigate(`/checkout/${showId}/${selectedSeatId}?sessionId=${sessionId}`);
  };

  if (loading) return <p>Đang tải sơ đồ ghế...</p>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Chọn bàn/ghế</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <SeatMapView
        seats={seats}
        selectedSeatIds={selectedSeatId ? [selectedSeatId] : []}
        onSelectSeat={handleSelectSeat}
      />

      {selectedSeatId && (
        <div style={{ marginTop: 20, padding: 16, border: '1px solid #22c55e', borderRadius: 8, background: '#f0fdf4' }}>
          <p>
            Bạn đang giữ bàn <strong>{selectedSeatId}</strong> — còn lại{' '}
            <strong>{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</strong> để thanh toán.
          </p>
          <button onClick={handleProceedToPayment} style={{ marginRight: 8 }}>
            Tiến hành thanh toán
          </button>
          <button onClick={handleCancelHold}>Hủy giữ chỗ</button>
        </div>
      )}
    </div>
  );
}