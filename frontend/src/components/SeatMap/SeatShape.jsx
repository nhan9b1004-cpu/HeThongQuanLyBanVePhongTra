import React from 'react';

const STATUS_COLOR = {
  available: '#22c55e',
  held: '#eab308',
  sold: '#ef4444',
  disabled: '#6b7280',
};

const SHAPE_SIZE = { round: 40, square: 40, sofa: 60, bar: 50 };

export default function SeatShape({ seat, isSelected, onClick }) {
  const { seatId, status, x, y, table_shape = 'round', price } = seat;
  const size = SHAPE_SIZE[table_shape] || 40;
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
          stroke={isSelected ? '#000' : '#fff'}
          strokeWidth={isSelected ? 3 : 1}
          opacity={isClickable ? 1 : 0.6}
        />
      ) : (
        <rect
          x={-size / 2}
          y={-size / 2}
          width={size}
          height={size}
          rx={8}
          fill={fillColor}
          stroke={isSelected ? '#000' : '#fff'}
          strokeWidth={isSelected ? 3 : 1}
          opacity={isClickable ? 1 : 0.6}
        />
      )}
      <text textAnchor="middle" dy="0.35em" fontSize="12" fill="#fff" fontWeight="bold" pointerEvents="none">
        {seatId}
      </text>
      {price && (
        <text textAnchor="middle" dy={size / 2 + 14} fontSize="10" fill="#333" pointerEvents="none">
          {Number(price).toLocaleString('vi-VN')}đ
        </text>
      )}
    </g>
  );
}