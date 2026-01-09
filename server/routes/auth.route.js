import express from "express";
import { loginUser, logoutUser, registerUser, getCurrentUser } from "../controllers/auth.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const Router = express.Router();

Router.route('/register').post(registerUser);

Router.route('/login').post(loginUser);

Router.route('/logout').post(authenticateUser, logoutUser);

Router.route('/me').get(authenticateUser, getCurrentUser);

export default Router;