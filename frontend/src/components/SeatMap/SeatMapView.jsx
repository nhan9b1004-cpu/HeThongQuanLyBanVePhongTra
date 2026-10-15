import React from 'react';
import SeatShape from './SeatShape';

const LEGEND_ITEMS = [
  { label: 'Emerald (Còn trống)', color: '#2ea043' },
  { label: 'Gold (Đang giữ)', color: '#d4af37' },
  { label: 'Ruby (Đã bán)', color: '#da3633' },
  { label: 'Slate (Không bán)', color: '#484f58' },
];

export default function SeatMapView({ seats, selectedSeatIds = [], onSelectSeat }) {
  if (!seats || seats.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>Chưa có sơ đồ ghế cho show này.</div>;
  }

  const maxX = Math.max(...seats.map((s) => s.x || 0), 700);
  const maxY = Math.max(...seats.map((s) => s.y || 0), 350);
  const width = maxX + 100;
  const height = maxY + 140;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ 
        width: '100%', 
        overflowX: 'auto', 
        border: '1px solid #30363d', 
        borderRadius: 12, 
        background: '#0d1117',
        padding: '20px',
        boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.6)'
      }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: '700px', display: 'block' }}>
          
          {/* KHUNG SÂN KHẤU SANG TRỌNG */}
          <g transform="translate(40, 20)">
            <rect 
              x={0} 
              y={0} 
              width={width - 80} 
              height={70} 
              rx={12}
              fill="linear-gradient(180deg, #21262d 0%, #161b22 100%)" 
              stroke="#30363d"
              strokeWidth="2"
            />
            {/* Hiệu ứng viền phát sáng nhẹ */}
            <rect 
              x={2} 
              y={2} 
              width={width - 84} 
              height={66} 
              rx={10}
              fill="none" 
              stroke="#d4af37" 
              strokeWidth="1" 
              opacity="0.3"
            />
            <text 
              x={(width - 80) / 2} 
              y={42} 
              textAnchor="middle" 
              fill="#e6dfd5" 
              fontSize="18" 
              fontWeight="bold"
              letterSpacing="6"
            >
              SÂN KHẤU
            </text>
          </g>

          {/* KHU VỰC VẼ GHẾ */}
          <g transform="translate(40, 110)">
            {seats.map((seat) => (
              <SeatShape
                key={seat.seatId}
                seat={seat}
                isSelected={selectedSeatIds.includes(seat.seatId)}
                onClick={onSelectSeat}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* BẢNG CHÚ THÍCH MÀU SẮC PHÒNG TRÀ */}
      <div style={{ display: 'flex', gap: 25, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {LEGEND_ITEMS.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: item.color, display: 'inline-block', boxShadow: '0 0 8px rgba(0,0,0,0.5)' }} />
            <span style={{ fontSize: 13, color: '#c9d1d9', fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}