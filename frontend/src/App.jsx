import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Checkout from './pages/Checkout';
import Ticket from './pages/Ticket';
import MyTicketsPage from './pages/MyTicketsPage'; // Đảm bảo file này đã tồn tại

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/checkout/:showId/:seatId" element={<Checkout />} />
        <Route path="/ticket/:ticketId" element={<Ticket />} />
        {/* Thêm route cho danh sách vé của tôi */}
        <Route path="/my-tickets" element={<MyTicketsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;