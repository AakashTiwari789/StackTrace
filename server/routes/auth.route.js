import express from "express";
import { loginUser, logoutUser, registerUser, getCurrentUser, sendVerificationLink, verifyEmailLink, VerifyOTP, sendVerificationOtp } from "../controllers/auth.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const Router = express.Router();

Router.route('/register').post(registerUser);

Router.route('/login').post(loginUser);

Router.route('/logout').post(authenticateUser, logoutUser);

Router.route('/me').get(authenticateUser, getCurrentUser);

Router.route('/send-verification-link').post(authenticateUser, sendVerificationLink);

Router.route('/verify-email/:link').get(verifyEmailLink);

Router.route('/send-otp').post(authenticateUser, sendVerificationOtp);

Router.route('/verify-otp').post(authenticateUser, VerifyOTP);

export default Router;