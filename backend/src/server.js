const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const errorHandler = require('./shared/middlewares/errorHandler');
const bookingRoutes = require('./modules/booking/booking.routes');
const initBookingSocket = require('./modules/booking/booking.socket');

// const paymentRoutes = require('./modules/payment/payment.routes');       // Người B tự thêm khi xong
// const checkinRoutes = require('./modules/checkin-admin/checkin.routes'); // Người C tự thêm khi xong
// const adminRoutes = require('./modules/checkin-admin/admin.routes');     // Người C tự thêm khi xong

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.use(cors());
app.use(express.json());
app.set('io', io);

app.use('/api', bookingRoutes);
// app.use('/api', paymentRoutes);
// app.use('/api', checkinRoutes);
// app.use('/api', adminRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

initBookingSocket(io);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));