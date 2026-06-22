import mongoose from "mongoose";
import User from '../models/user.model.js';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

export const singUp = async (req, res, next) => {
    const session = await mongoose.startSession(); //session for mongoose transaction.
    session.startTransaction(); // to perform something known as atomic updates

    try{
        // Logic to create a new user
        const {name, email, password} = req.body;

        // Check if a user already exists
        const existingUser = await User.findOne({email});

        if(existingUser) {
            const error = new Error("User already exists");
            error.statusCode = 409;
            throw error;
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUsers = await User.create([{name, email, password: hashedPassword}], {session});

        const token = jwt.sign({userId: newUsers[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN});

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user:newUsers[0]
            }
        })

    } catch (error){
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};
//Atomic Operations
// •Database operations that update the state are atomic. All or nothing.

// Insert either works completely or it doesn't.
// Update either works completely or it doesn't.
// You never get half an operation.

// Reasons why operations may not work
// One or more constraints violated.
// Datatype mismatch.
// Syntax error.
export const singIn = async (req, res, next) => {
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if(!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error; 
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            const error = new Error('Invalid password');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({userId:user._id}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});

        res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            data: {
                token,
                user
            }
        });
    } catch (error){
        next(error);
    }
};

export const singOut = async (req, res, next) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.status(200).json({
            success: true,
            message: "User signed out successfully",
        });
    } catch (error) {
        next(error);
    }
};