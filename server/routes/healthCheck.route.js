import express from "express";
import { healthCheck } from "../controllers/healthCheck.controller.js"

const Router = express.Router();

Router.route("/").get(healthCheck);

export default Router;