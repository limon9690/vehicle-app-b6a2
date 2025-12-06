import { Request, Response } from "express";
import { authService } from "./auth.service";


const signUp = async (req : Request, res : Response) => {
    try {
        const result = await authService.signUp(req.body);

        res.status(201).json({
            "success" : true,
            "message": "User registered successfully",
            data : result
        })
    } catch (error : any) {
        res.status(400).json(
            {
                "success": false,
                "message": "User registration failed",
                "errors": error.message
            }
        );
    }
}

const signIn = async (req : Request, res : Response) => {
    try {
        const {email, password} = req.body;
        const result = await authService.signIn(email, password);

        res.status(200).json({
            "success" : true,
            "message": "Login successful",
            data : result
        })
    } catch (error : any) {
        res.status(400).json(
            {
                "success": false,
                "message": "Login failed",
                "errors": error.message
            }
        );
    }
};

export const authController = {
    signUp,
    signIn,
}