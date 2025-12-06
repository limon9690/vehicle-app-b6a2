import { Router } from "express";
import { bookingController } from "./booking.controller";
import auth from "../../middlewares/auth";


const router = Router();

router.post('/', auth('admin', 'customer'), bookingController.createBooking);
router.get('/', auth('admin', 'customer'), bookingController.getAllBookings);
router.put('/:bookingId', auth('admin', 'customer'), bookingController.updateBooking);

export const bookingRoutes = router;