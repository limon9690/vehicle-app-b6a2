import { Request, Response } from "express";
import { userService } from "./user.service";

const getAllUsers = async(req : Request, res : Response) => {
    try {
        const result = await userService.getAllUsers();
    
        res.status(200).json({
            "success" : true,
            "message": result.length > 0 ? "Users retrieved successfully" : "No Users found",
            data : result
        })
    } catch (error : any) {
        res.status(400).json(
            {
                "success": false,
                "message": "Error occurred while getting users",
                "errors": error.message
            }
        );
    }
};

const updateUser = async(req : Request, res : Response) => {
    try {
        const {id, role} = req.user!;
        let result;

        if (role === "admin") {
            result = await userService.updateUserForAdmin(req.params.userId as string, req.body);
        } else {
            result = await userService.updateUserForUser(req.params.userId as string, req.body, id)
        }

        res.status(200).json({
            "success" : true,
            "message": "User updated successfully",
            data : result
        })
    } catch (error : any) {
        res.status(400).json(
            {
                "success": false,
                "message": "Failed to update user",
                "errors": error.message
            }
        );
    }
};

const deleteUser = async(req : Request, res : Response) => {
    try {
        const result = await userService.deleteUser(req.params.userId as string);

        res.status(200).json({
            "success" : true,
            "message": "User deleted successfully"
        })
    } catch (error : any) {
        res.status(400).json(
            {
                "success": false,
                "message": "Failed to delete user",
                "errors": error.message
            }
        );
    }
};

export const userController = {
    getAllUsers,
    updateUser,
    deleteUser
}