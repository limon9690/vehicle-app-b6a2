import { pool } from "../../config/db"

const getAllUsers = async() => {
    const result = await pool.query('SELECT * FROM users')

    const data = result.rows;

    for (let d of data) {
        delete d.password;
    }

    return data;
}

const updateUserForAdmin = async(id : string, payload : Record<string, undefined>) => {
    const result = await pool.query('SELECT * FROM users WHERE id=$1', [id])

    if(result.rows.length === 0) {
        throw new Error("User doesn't exist");
    }

    const existingUser = result.rows[0];
    const {name, email, phone, role} = payload;

    if(name !== undefined) {
        existingUser.name = name;
    }

    if(email !== undefined) {
        existingUser.email = email;
    }

    if(phone !== undefined) {
        existingUser.phone = phone;
    }

    if(role !== undefined) {
        existingUser.role = role;
    }

    const updatedResult = await pool.query('UPDATE users SET name=$1, email=$2, phone=$3, role=$4 WHERE id=$5 RETURNING *', [existingUser.name, existingUser.email, existingUser.phone, existingUser.role, id]);

    const updatedUser = updatedResult.rows[0];
    delete updatedUser.password;

    return updatedUser;
}

const updateUserForUser = async(id : string, payload : Record<string, undefined>, currentUserId : string) => {
    const result = await pool.query('SELECT * FROM users WHERE id=$1', [id])

    if(result.rows.length === 0) {
        throw new Error("User doesn't exist");
    }

    const existingUser = result.rows[0];

    if (id !== currentUserId.toString()) {
        throw new Error("User can only update their own profile");
    }

    const {name, email, phone} = payload;

    if(name !== undefined) {
        existingUser.name = name;
    }

    if(email !== undefined) {
        existingUser.email = email;
    }

    if(phone !== undefined) {
        existingUser.phone = phone;
    }

    const updatedResult = await pool.query('UPDATE users SET name=$1, email=$2, phone=$3, role=$4 WHERE id=$5 RETURNING *', [existingUser.name, existingUser.email, existingUser.phone, existingUser.role, id]);

    const updatedUser = updatedResult.rows[0];
    delete updatedUser.password;

    return updatedUser;
}

const deleteUser = async(id : string) => {
    const result = await pool.query('SELECT * FROM users WHERE id=$1', [id]);

    if (result.rows.length === 0) {
        throw new Error("User doesn't exists");
    }

    const user = result.rows[0];

    const bookingResult = await pool.query('SELECT * FROM bookings WHERE customer_id=$1 AND status=$2', [id, "active"]);

    if (bookingResult.rows.length > 0) {
        throw new Error("User has active bookings");
    }

    const deleteResult = await pool.query('DELETE FROM users WHERE id=$1 RETURNING *', [id]);

    return deleteResult;
}

export const userService = {
    getAllUsers,
    updateUserForAdmin,
    updateUserForUser,
    deleteUser
}