import { pool } from "../../config/db";

type BookingObj = {
    id: string;
    customer_id: string;
    vehicle_id: string;
    rent_start_date: string;
    rent_end_date: string;
    total_price: number;
    status: string;
    customer? : CustomerObj;
    vehicle? : VehicleObj;
}

type CustomerObj = {
    name : string;
    email : string;
}

type VehicleObj = {
    vehicle_name : string;
    registration_number : string;
    type? : string;
}

type BookingUpdateObj = {
    id : string;
    customer_id : string;
    vehicle_id : string;
    rent_start_date : string;
    rent_end_date : string;
    total_price : number;
    status : string;
    vehicle : {
        availability_status : string;
    }
}

const createBooking = async (payload : Record<string, unknown>) => {
    const {customer_id, vehicle_id, rent_start_date, rent_end_date} = payload;

    if (customer_id === undefined || vehicle_id === undefined || rent_start_date === undefined || rent_end_date === undefined) {
        throw new Error("Missing fields. All fields are required");
    }

    const userResult = await pool.query('SELECT * FROM users WHERE id=$1', [customer_id]);

    if (userResult.rows.length === 0) {
        throw new Error("User doesn't exist");
    }

    const user = userResult.rows[0];

    const vehicleResult = await pool.query('SELECT * FROM vehicles WHERE id=$1', [vehicle_id]);

    if (vehicleResult.rows.length === 0) {
        throw new Error("Vehicle doesn't exist");
    }

    const vehicleData = vehicleResult.rows[0];

    if (vehicleData.availability_status === "booked") {
        throw new Error("Vehicle is already booked");
    }

    const dailyRent = Number(vehicleData.daily_rent_price);

    const date1 = new Date(rent_start_date as string);
    const date2 = new Date(rent_end_date as string);
    
    const diffTime = date2.getTime() - date1.getTime();
    const diff = diffTime / (1000 * 60 * 60 * 24);

    if (diff <= 0) {
        throw new Error("Rent end date must be after rent start date");
    }
    

    const totalPrice = dailyRent * diff;
    const status = "active";

    const bookingResult = await pool.query(
        'INSERT INTO bookings(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [user.id, vehicle_id, rent_start_date, rent_end_date, totalPrice, status]
    )

    const vehicleUpdate = await pool.query(
        'UPDATE vehicles SET availability_status = $1 WHERE id = $2 RETURNING *', ["booked", vehicleData.id]
    )

    const vehicle = {
        "vehicle_name" : vehicleUpdate.rows[0].vehicle_name,
        "daily_rent_price" : vehicleUpdate.rows[0].daily_rent_price
    }

    const createdBooking = bookingResult.rows[0];

    return {
        id : createdBooking.id,
        customer_id : createdBooking.customer_id,
        vehicle_id : createdBooking.vehicle_id,
        rent_start_date : createdBooking.rent_start_date,
        rent_end_date : createdBooking.rent_end_date,
        totalPrice : createdBooking.total_price,
        status : createdBooking.status,
        vehicle : {
            vehicle_name : vehicle.vehicle_name,
            daily_rent_price : vehicle.daily_rent_price
        }
    };
}

const getAllBookingsForAdmin = async() => {
    const exResult = await pool.query('SELECT * FROM bookings');
    const exBookings = exResult.rows;

    for (let booking of exBookings) {
        const now = new Date();

        if (now >= booking.rent_end_date) {
            updateBookingForAdmin(booking.id, {"status" : "returned"});   
        }
    }

    const result = await pool.query('SELECT * FROM bookings');
    const bookings = result.rows;

    const data : BookingObj[] = []

    for (let booking of bookings) {
        const userResult = await pool.query('SELECT * FROM users WHERE id=$1', [booking.customer_id]);

        const vehicleResult = await pool.query('SELECT * FROM vehicles WHERE id=$1', [booking.vehicle_id]);

        const user = userResult.rows[0];
        const vehicle = vehicleResult.rows[0];
        
        let customerObj : CustomerObj = {
            name : user.name,
            email : user.email
        }

        let vehicleObj : VehicleObj = {
            vehicle_name : vehicle.vehicle_name,
            registration_number : vehicle.registration_number
        }

        let res : BookingObj = {
            id : booking.id,
            customer_id : booking.customer_id,
            vehicle_id : booking.vehicle_id,
            rent_start_date : booking.rent_start_date,
            rent_end_date : booking.rent_end_date,
            total_price : booking.total_price,
            status : booking.status,
            customer : customerObj,
            vehicle : vehicleObj
        }

        data.push(res);
    }

    return data;
}

const getAllBookingsForCustomer = async(id : string) => {
    const exResult = await pool.query('SELECT * FROM bookings WHERE customer_id=$1', [id]);
    const exBookings = exResult.rows;

    for (let booking of exBookings) {
        const now = new Date();

        if (now >= booking.rent_end_date) {
            updateBookingForAdmin(booking.id, {"status" : "returned"});   
        }
    }

    const result = await pool.query('SELECT * FROM bookings WHERE customer_id=$1', [id]);
    const bookings = exResult.rows;

    const data : BookingObj[] = [];

    for (let booking of bookings) {
        const vehicleResult = await pool.query('SELECT * FROM vehicles WHERE id=$1', [booking.vehicle_id]);

        const vehicle = vehicleResult.rows[0];

        let vehicleObj : VehicleObj = {
            vehicle_name : vehicle.vehicle_name,
            registration_number : vehicle.registration_number,
            type : vehicle.type
        }

        let res : BookingObj = {
            id : booking.id,
            customer_id : booking.customer_id,
            vehicle_id : booking.vehicle_id,
            rent_start_date : booking.rent_start_date,
            rent_end_date : booking.rent_end_date,
            total_price : booking.total_price,
            status : booking.status,
            vehicle : vehicleObj
        }

        data.push(res);
    }

    return data;
}

const updateBookingForCustomer = async(id : string, payload : Record<string, unknown>, userId : string) => {
    const status = payload.status;

    if (status === undefined) {
        throw new Error("Status is required");
    }

    if (status === "returned") {
        throw new Error("Only admin can return a booking. User can cancel a booking");
    }

    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id=$1', [id]);

    if (bookingResult.rows.length === 0) {
        throw new Error("Booking doesn't exist");
    }

    const booking = bookingResult.rows[0];

    if (booking.customer_id !== userId) {
        throw new Error("You can only cancel your own bookings");
    }

    if (booking.status !== "active") {
        throw new Error("This booking is not active");
    }

    const now = new Date();
    if (now >= booking.rent_start_date) {
        throw new Error("You can only cancel a booking before rent start day");
    }

    const updatedBooking = await pool.query('UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *', [status, id]);

    return updatedBooking.rows[0];
}

const updateBookingForAdmin = async(id : string, payload : Record<string, unknown>) => {
    const status = payload.status;
    
    if (status === undefined) {
        throw new Error("Status is required");
    }

    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id=$1', [id]);

    if (bookingResult.rows.length === 0) {

        throw new Error("Booking doesn't exist");
    }

    if (status === "cancelled") {
        throw new Error("Only user can cancel a booking. Admin can only return");
    }

    const booking = bookingResult.rows[0];

    if (booking.status === "returned") {
        throw new Error("This booking is already returned");
    }

    const updatedBooking = await pool.query('UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *', [status, id]);

    const vehicleUpdate = await pool.query('UPDATE vehicles SET availability_status=$1 WHERE id=$2 RETURNING *', ["available", booking.vehicle_id]);

    const updatedBookingData = updatedBooking.rows[0]; 

    const data :BookingUpdateObj = {
        id : updatedBookingData.id,
        customer_id : updatedBookingData.customer_id,
        vehicle_id : updatedBookingData.vehicle_id,
        rent_start_date : updatedBookingData.rent_start_date,
        rent_end_date : updatedBookingData.rent_end_date,
        total_price : updatedBookingData.total_price,
        status : updatedBookingData.status,
        vehicle : {
            availability_status : vehicleUpdate.rows[0].availability_status
        }
    }

    return data;
}


export const bookingService = {
    createBooking,
    getAllBookingsForAdmin,
    getAllBookingsForCustomer,
    updateBookingForCustomer,
    updateBookingForAdmin
}