import React from 'react';

const STATUS_COLOR = {
  available: '#2ea043', // Emerald
  held: '#d4af37',      // Gold
  sold: '#da3633',      // Ruby
  disabled: '#484f58',  // Slate
};

const SHAPE_SIZE = { round: 48, square: 48, sofa: 64, bar: 52 };

export default function SeatShape({ seat, isSelected, onClick }) {
  const { seatId, status, x, y, table_shape = 'round', price } = seat;
  const size = SHAPE_SIZE[table_shape] || 48;
  const fillColor = STATUS_COLOR[status] || STATUS_COLOR.available;
  const isClickable = status === 'available' || isSelected;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={() => isClickable && onClick(seatId)}
      style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}
    >
      {table_shape === 'round' ? (
        <circle
          r={size / 2}
          fill={fillColor}
          stroke={isSelected ? '#ffffff' : '#30363d'}
          strokeWidth={isSelected ? 3 : 1.5}
          filter={isSelected ? 'drop-shadow(0px 0px 8px #d4af37)' : 'none'}
        />
      ) : (
        <rect
          x={-size / 2}
          y={-size / 2}
          width={size}
          height={size}
          rx={10}
          fill={fillColor}
          stroke={isSelected ? '#ffffff' : '#30363d'}
          strokeWidth={isSelected ? 3 : 1.5}
          filter={isSelected ? 'drop-shadow(0px 0px 8px #d4af37)' : 'none'}
        />
      )}

      {/* MÃ GHẾ */}
      <text textAnchor="middle" dy="-2" fontSize="13" fill="#ffffff" fontWeight="bold" pointerEvents="none">
        {seatId}
      </text>

      {/* HIỂN THỊ CHỮ HOLD KHI ĐƯỢC CHỌN (GIỐNG ẢNH MẪU) */}
      {isSelected && (
        <text textAnchor="middle" dy="12" fontSize="9" fill="#161b22" fontWeight="bold" pointerEvents="none">
          HOLD
        </text>
      )}

      {/* GIÁ TIỀN BÊN DƯỚI */}
      {price && (
        <text textAnchor="middle" dy={size / 2 + 14} fontSize="11" fill="#8b949e" pointerEvents="none">
          {Number(price).toLocaleString('vi-VN')}đ
        </text>
      )}
    </g>
  );
}