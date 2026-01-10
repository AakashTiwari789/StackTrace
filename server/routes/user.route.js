import express from "express";
import { getAllSessionOfUser, getUserById, getUserByUsername, logoutUserFromAllDevices, logoutUserFromDevice } from "../controllers/user.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const Router = express.Router();

Router.route('/get-user/:id').get(getUserById);

Router.route('/:username').get(getUserByUsername);

Router.route('/sessions').post(authenticateUser, getAllSessionOfUser);

Router.route('/logout-all-devices').post(authenticateUser, logoutUserFromAllDevices);

Router.route('/logout-device/').post(authenticateUser, logoutUserFromDevice);

export default Router;