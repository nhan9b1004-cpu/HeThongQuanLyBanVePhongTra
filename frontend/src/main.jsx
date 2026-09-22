import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ShowListPage from './pages/booking/ShowListPage';
import SeatSelectionPage from './pages/booking/SeatSelectionPage';

// import CheckoutPage from './pages/payment/CheckoutPage';           // Người B tự thêm khi xong
// import CheckinScannerPage from './pages/admin/CheckinScannerPage'; // Người C tự thêm khi xong

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ShowListPage />} />
        <Route path="/shows/:showId" element={<SeatSelectionPage />} />
        {/* <Route path="/checkout/:showId/:seatId" element={<CheckoutPage />} /> */}
        {/* <Route path="/admin/checkin" element={<CheckinScannerPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);