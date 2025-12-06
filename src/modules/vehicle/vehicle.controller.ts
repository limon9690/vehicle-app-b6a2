import { Request, Response } from "express";
import { vehicleService } from "./vehicle.service";

const createVehicle = async(req : Request, res : Response) => {
    try {
        const result = await vehicleService.createVehicle(req.body);
    
        res.status(201).json({
            "success" : true,
            "message": "Vehicle created successfully",
            data : result
        })
    } catch (error : any) {
        res.status(400).json(
            {
                "success": false,
                "message": "Vehicle creation failed",
                "errors": error.message
            }
        );
    }
}

const getAllVehicles = async(req : Request, res : Response) => {
    try {
        const result = await vehicleService.getAllVehicles();
    
        res.status(200).json({
            "success" : true,
            "message": result.rows.length > 0 ? "Vehicles retrieved successfully" : "No vehicles found",
            data : result.rows
        })
    } catch (error : any) {
        res.status(400).json(
            {
                "success": false,
                "message": "Error occurred while getting vehicles",
                "errors": error.message
            }
        );
    }
}

const getSingleVehicle = async(req : Request, res : Response) => {
    try {
        const result = await vehicleService.getSingleVehicle(req.params.vehicleId as string);
    
        res.status(200).json({
            "success" : true,
            "message": "Vehicle retrieved successfully",
            data : result.rows[0]
        })
    } catch (error : any) {
        res.status(404).json(
            {
                "success": false,
                "message": "Vehicle not found",
                "errors": error.message
            }
        );
    }
}

const updateVehicle = async(req : Request, res : Response) => {
    try {
        const result = await vehicleService.updateVehicle(req.body, req.params.vehicleId as string);
    
        res.status(200).json({
            "success" : true,
            "message": "Vehicle updated successfully",
            data : result
        })
    } catch (error : any) {
        res.status(400).json(
            {
                "success": false,
                "message": "Vehicle update failed",
                "errors": error.message
            }
        );
    }
}

const deleteVehicle = async(req : Request, res : Response) => {
    try {
        const result = await vehicleService.deleteVehicle(req.params.vehicleId as string);
    
        res.status(200).json({
            "success" : true,
            "message": "Vehicle deleted successfully",
        })
    } catch (error : any) {
        res.status(400).json(
            {
                "success": false,
                "message": "Failed to delete vehicle",
                "errors": error.message
            }
        );
    }
};

export const vehicleController = {
    createVehicle,
    getAllVehicles,
    getSingleVehicle, 
    updateVehicle,
    deleteVehicle
}