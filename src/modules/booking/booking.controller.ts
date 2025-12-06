import { Request, Response } from "express";
import { bookingService } from "./booking.service";


const createBooking = async(req : Request, res : Response) => {
    try {
        const result = await bookingService.createBooking(req.body);
    
        res.status(201).json({
            "success" : true,
            "message": "Booking created successfully",
            data : result
        })
    } catch (error : any) {
        res.status(400).json(
            {
                "success": false,
                "message": "Booking creation failed",
                "errors": error.message,
            }
        );
    }
}

const getAllBookings = async(req : Request, res : Response) => {
    try {
        const {id, role} = req.user!;
        let result;

        if (role === "admin") {
            result = await bookingService.getAllBookingsForAdmin();
        } else {
            result = await bookingService.getAllBookingsForCustomer(id);
        }

        res.status(200).json({
            "success" : true,
            "message": role === "admin" ? "Bookings retrieved successfully" : "Your Bookings retrieved successfully",
            data : result
        })
    } catch (error : any) {
        res.status(400).json(
            {
                "success": false,
                "message": "Failed to retrieve bookings",
                "errors": error.message,
            }
        );
    }
}

const updateBooking = async(req : Request, res : Response) => {
    try {
        const {id, role} = req.user!;
        let result;

        if (role === "admin") {
            result = await bookingService.updateBookingForAdmin(req.params.bookingId as string, req.body);
        } else {
            result = await bookingService.updateBookingForCustomer(req.params.bookingId as string, req.body, id as string);
        }

        res.status(200).json({
            "success" : true,
            "message": role === "admin" ? "Booking marked as returned. Vehicle is now available" : "Booking cancelled successfully",
            data : result
        })
    } catch (error : any) {
        res.status(400).json(
            {
                "success": false,
                "message": "Failed to retrieve bookings",
                "errors": error.message,
            }
        );
    }
}

export const bookingController = {
    createBooking,
    getAllBookings,
    updateBooking
}