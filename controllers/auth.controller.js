import mongoose from "mongoose";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export const signUp = async (req, res, next) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        console.log(req.body);
        const {name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const error = new Error("User already exists");
            error.statusCode = 409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUsers = await User.create([{ name, email, password: hashedPassword }], { session });

        const token = jwt.sign({id: newUsers[0]._id}, JWT_SECRET, {expiresIn: "1h"});

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data : {
                token: token,
                user: newUsers[0],
            }
        });

    }catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }

};


export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const error = new Error("Password is incorrect");
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: "1h"});

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                token: token,
                user: user,
            }
        });

    }catch (error) {
        next(error);
    }
};

export const signOut = async (req, res, next) => {};