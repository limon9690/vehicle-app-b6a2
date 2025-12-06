import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";


const auth = (...roles : string[]) => {
    return async (req : Request, res : Response, next : NextFunction) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
            "success": false,
            "message": "Unauthorized",
        });
        };

        const tokenParts = token.split(" ");
        const jwtToken = tokenParts[1] as string;
        const decoded = jwt.verify(jwtToken, config.jwt_secret as string) as JwtPayload;
        req.user = decoded;

        if (roles && !roles.includes(decoded.role as string)) {
            return res.status(403).json({
            "success": false,
            "message": "Forbidden - You don't have enough permission.",
        });
        }
        
        next();
    } catch (error : any) {
        res.status(401).json({
            "success": false,
            "message": "Unauthorized",
            "errors": error.message
        });
    }
    }
}

export default auth;