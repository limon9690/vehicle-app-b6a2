import { pool } from "../../config/db"

const createVehicle = async (payload : Record<string, unknown>) => {
    const carTypes : string[] = ['car', 'bike', 'van', 'SUV'];
    const availability_statuses : string[] = ['available', 'booked'];

    const {vehicle_name, type, registration_number, daily_rent_price, availability_status} = payload;

    if (vehicle_name === undefined || type === undefined || registration_number === undefined || daily_rent_price === undefined || availability_status === undefined) {
        throw new Error("Missing fields. All fields are required");
    }

    if (!carTypes.includes(type as string)) {
        throw new Error("Vehicles must be of type - car, bike, van or SUV");
    }

    if (!availability_statuses.includes(availability_status as string)) {
        throw new Error("Status must be of type - available or booked");
    }

    if (daily_rent_price as number <= 0) {
        throw new Error("Daily rent price must be a positive number");
    }

    const result = await pool.query(
        `INSERT INTO vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES($1, $2, $3, $4, $5) RETURNING *`, [vehicle_name, type, registration_number, daily_rent_price, availability_status]
    )

    return result.rows[0];
}

const getAllVehicles = async () => {
    const result = await pool.query('SELECT * FROM vehicles');

    return result;
}

const getSingleVehicle = async (id : string) => {
    const result = pool.query('SELECT * FROM vehicles WHERE id=$1', [id]);

    if ((await result).rows.length == 0) {
        throw new Error('No vehicle found');
    }

    return result;
}

const updateVehicle = async (payload : Record<string, unknown>, id : string) => {
    const existingVehicleResult = await pool.query('SELECT * FROM vehicles WHERE id=$1', [id]);

    if (existingVehicleResult.rows.length === 0) {
        throw new Error("Vehicle doesn't exist");
    }

    const existingVehicle = existingVehicleResult.rows[0];

    const {vehicle_name, type, registration_number, daily_rent_price, availability_status} = payload;

    if (vehicle_name !== undefined) {
        existingVehicle.vehicle_name = vehicle_name;
    }

    if (type !== undefined) {
        existingVehicle.type = type;
    }

    if (registration_number !== undefined) {
        existingVehicle.registration_number = registration_number;
    }

    if (daily_rent_price !== undefined) {
        existingVehicle.daily_rent_price = daily_rent_price;
    }

    if (availability_status !== undefined) {
        existingVehicle.availability_status = availability_status;
    }

    const updateResult = await pool.query('UPDATE vehicles SET vehicle_name=$1, type=$2, registration_number=$3, daily_rent_price=$4, availability_status=$5 WHERE id=$6 RETURNING *', [existingVehicle.vehicle_name, existingVehicle.type, existingVehicle.registration_number, existingVehicle.daily_rent_price, existingVehicle.availability_status, id])

    return updateResult.rows[0];
}

const deleteVehicle = async (id : string) => {
    const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);

    if (result.rows.length === 0) {
        throw new Error("Vehicle not found");
    }

    const vehicle = result.rows[0];
    if (vehicle.availability_status === 'booked') {
        throw new Error("Booked vehicles can't be deleted");
    }

    const deleted = await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);

    return deleted;
}

export const vehicleService = {
    createVehicle,
    getAllVehicles,
    getSingleVehicle,
    updateVehicle,
    deleteVehicle
}