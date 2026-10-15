import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ShowListPage() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/shows/upcoming')
      .then((res) => res.json())
      .then((data) => {
        // Hứng dữ liệu từ Redis (hỗ trợ cả mảng hoặc object data)
        const list = Array.isArray(data) ? data : (data.data || [
          { showId: 'show-1', name: 'Đêm Nhạc Trịnh Công Sơn', date: '2026-04-20T20:00:00.000Z', price: 150000 },
          { showId: 'show-2', name: 'Acoustic Mùa Hè Rực Rỡ', date: '2026-04-25T20:00:00.000Z', price: 200000 },
        ]);
        setShows(list);
      })
      .catch(() => {
        // Dữ liệu fallback cứng nếu fetch lỗi để web không bị trắng trang
        setShows([
          { showId: 'show-1', name: 'Đêm Nhạc Trịnh Công Sơn', date: '2026-04-20T20:00:00.000Z', price: 150000 },
          { showId: 'show-2', name: 'Acoustic Mùa Hè Rực Rỡ', date: '2026-04-25T20:00:00.000Z', price: 200000 },
          { showId: 'show-3', name: 'Bolero Tình Khúc Xưa & Nay', date: '2026-05-01T20:00:00.000Z', price: 180000 },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '40px auto', 
      padding: '30px', 
      background: '#161b22', 
      borderRadius: '16px', 
      border: '1px solid #30363d',
      color: '#f0f6fc',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      boxShadow: '0 15px 35px rgba(0,0,0,0.6)'
    }}>
      <style>{`
        body { background-color: #0d1117 !important; margin: 0; }
      `}</style>

      <h1 style={{ color: '#e6dfd5', textAlign: 'center', marginBottom: '30px', letterSpacing: '1px' }}>
        LỊCH BIỂU PHÒNG TRÀ SẮP TỚI
      </h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>Đang tải lịch diễn...</div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {shows.map((show) => {
            const showId = show.showId || show.id;
            return (
              <div 
                key={showId}
                onClick={() => navigate(`/shows/${showId}`)}
                style={{
                  padding: '22px 24px',
                  background: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d4af37'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#30363d'}
              >
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#f0f6fc', fontSize: '18px' }}>
                    {show.name}
                  </h3>
                  <p style={{ margin: 0, color: '#8b949e', fontSize: '14px' }}>
                    📅 {show.date ? new Date(show.date).toLocaleDateString('vi-VN', { dateStyle: 'full' }) : 'Sắp diễn ra'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#2ea043', fontWeight: 'bold', fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                    {Number(show.price || show.price_default || 150000).toLocaleString('vi-VN')}đ
                  </span>
                  <button style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #d4af37, #aa7c11)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    Chọn Ghế
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}