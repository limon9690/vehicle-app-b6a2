import express from 'express';
import config from './config';
import { initDB } from './config/db';
import { authRoutes } from './modules/auth/auth.routes';
import { vehicleRoutes } from './modules/vehicle/vehicle.routes';
import { userRoutes } from './modules/user/user.routes';
import { bookingRoutes } from './modules/booking/booking.routes';

const app = express();
app.use(express.json());
const port = config.port;

initDB();

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/bookings', bookingRoutes);

app.listen(port, () => {
    console.log(`app is running on port ${port}`);
})
