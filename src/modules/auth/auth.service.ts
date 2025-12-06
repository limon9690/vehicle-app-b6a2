import bcrypt from "bcryptjs";
import { pool } from "../../config/db";
import jwt from 'jsonwebtoken';
import config from "../../config";

const signUp = async (payload : Record<string, unknown>) => {
    const {name, email, password, phone, role} = payload;

    if (name === undefined || email === undefined || password === undefined || phone === undefined || role === undefined) {
        throw new Error("Missing fields. All fields are required");
    }

    const email_str = email as string;
    const lowerCaseEmail = email_str.toLowerCase();
    const password_str = password as string;
    const role_str = role as string;
    const lowerCaseRole = role_str.toLowerCase();

    const rolesArr = ['admin', 'customer'];

    if (!rolesArr.includes(lowerCaseRole)) {
        throw new Error("Role must be either admin or customer");
    }

    if (password_str.length < 6) {
        throw new Error("Passwords must be 6 characters long");
    }

    const hashedPassword = await bcrypt.hash(password_str as string, 10);

    const result = await pool.query(
        `INSERT INTO users(name, email, password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING *`, [name, lowerCaseEmail, hashedPassword, phone, role]
    )

    const data = result.rows[0];

    return {id : data.id, name : data.name, email : data.email, phone : data.phone, role : data.role};
}

const signIn = async (email : string, password : string) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    if (result.rows.length == 0) {
        throw new Error("User not found");
    }

    const user = result.rows[0];
    
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw new Error("Wrong credentials");
    }

    const secret = config.jwt_secret as string;
    delete user.password;

    const token = jwt.sign(user, secret, {
        expiresIn : "7d"
    });

    return {token, user};
}

export const authService = {
    signUp,
    signIn
}