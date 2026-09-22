import React from 'react';
import SeatShape from './SeatShape';

const LEGEND_ITEMS = [
  { status: 'available', label: 'Còn trống', color: '#22c55e' },
  { status: 'held', label: 'Đang được giữ', color: '#eab308' },
  { status: 'sold', label: 'Đã bán', color: '#ef4444' },
  { status: 'disabled', label: 'Không mở bán', color: '#6b7280' },
];

export default function SeatMapView({ seats, selectedSeatIds = [], onSelectSeat }) {
  if (!seats || seats.length === 0) {
    return <p>Chưa có sơ đồ ghế cho show này.</p>;
  }

  const maxX = Math.max(...seats.map((s) => s.x || 0)) + 100;
  const maxY = Math.max(...seats.map((s) => s.y || 0)) + 100;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ overflowX: 'auto', border: '1px solid #ddd', borderRadius: 8 }}>
        <svg viewBox={`0 0 ${maxX} ${maxY}`} style={{ width: '100%', height: 'auto', minWidth: 400 }}>
          <rect x={0} y={0} width={maxX} height={30} fill="#1f2937" />
          <text x={maxX / 2} y={20} textAnchor="middle" fill="#fff" fontSize="14">
            SÂN KHẤU
          </text>

          {seats.map((seat) => (
            <SeatShape
              key={seat.seatId}
              seat={seat}
              isSelected={selectedSeatIds.includes(seat.seatId)}
              onClick={onSelectSeat}
            />
          ))}
        </svg>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {LEGEND_ITEMS.map((item) => (
          <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
            <span style={{ fontSize: 13 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}