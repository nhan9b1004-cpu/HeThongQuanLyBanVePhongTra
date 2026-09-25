import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../api/bookingApi';

export default function ShowListPage() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    bookingApi
      .getShows()
      .then((res) => setShows(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Đang tải danh sách show...</p>;
  if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>Lịch diễn sắp tới</h1>
      {shows.length === 0 && <p>Hiện chưa có show nào.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {shows.map((show) => (
          <Link
            key={show.showId}
            to={`/shows/${show.showId}`}
            style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, textDecoration: 'none', color: '#111' }}
          >
            <h3 style={{ margin: '0 0 4px' }}>{show.name}</h3>
            <p style={{ margin: 0, color: '#555' }}>
              {show.artist} — {new Date(show.datetime).toLocaleString('vi-VN')}
            </p>
            <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>{show.location}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}