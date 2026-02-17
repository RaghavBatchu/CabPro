import express from "express";
import { getUserHistory } from "../controllers/history.controller.js";

const historyRouter = express.Router();

historyRouter.get("/:userId", getUserHistory);

export default historyRouter;
