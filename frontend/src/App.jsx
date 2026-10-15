import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Checkout from './pages/Checkout';
import Ticket from './pages/Ticket';
import MyTicketsPage from './pages/MyTicketsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/checkout/:showId/:seatId" element={<Checkout />} />
        <Route path="/ticket/:ticketId" element={<Ticket />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
