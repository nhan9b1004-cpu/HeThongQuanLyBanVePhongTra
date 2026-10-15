import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import ShowListPage from './pages/booking/ShowListPage';
import SeatSelectionPage from './pages/booking/SeatSelectionPage';

import CheckoutPage from './pages/payment/CheckoutPage';
import PaymentResultPage from './pages/payment/PaymentResultPage';
import MyTicketsPage from './pages/payment/MyTicketsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<ShowListPage />}
        />

        <Route
          path="/shows/:showId"
          element={<SeatSelectionPage />}
        />

        <Route
          path="/checkout/:showId/:seatId"
          element={<CheckoutPage />}
        />

        <Route
          path="/payment/result/:ticketId"
          element={<PaymentResultPage />}
        />

        <Route
          path="/my-tickets"
          element={<MyTicketsPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM
  .createRoot(document.getElementById('root'))
  .render(<App />);