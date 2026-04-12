import express from "express";
import { getAllSessionOfUser, getUserById, getUserByUsername, logoutUserFromAllDevices, logoutUserFromDevice, updateUserPhoto } from "../controllers/user.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
});

const Router = express.Router();

Router.route('/get-user/:id').get(getUserById);

Router.route('/:username').get(getUserByUsername);

Router.route('/sessions').post(authenticateUser, getAllSessionOfUser);

Router.route('/logout-all-devices').post(authenticateUser, logoutUserFromAllDevices);

Router.route('/logout-device/').post(authenticateUser, logoutUserFromDevice);

Router.route('/update-photo').put(authenticateUser, upload.single("image"), updateUserPhoto);

export default Router;