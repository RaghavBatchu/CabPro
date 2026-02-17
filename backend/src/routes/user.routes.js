import { Router } from "express";
import {
  getUsers,
  getUser,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  checkUserExists,
} from "../controllers/user.controller.js";

const userRouter = Router();

/*READ ROUTES*/

// Check if user exists
// GET /api/users/exists?personalEmail=...
userRouter.get("/exists", checkUserExists);

// Get user by personalEmail
// GET /api/users/by-email?personalEmail=...
userRouter.get("/by-email", getUserByEmail);

// Get all users
// GET /api/users
userRouter.get("/", getUsers);

// Get single user by ID
// GET /api/users/:id
userRouter.get("/:id", getUser);


/*WRITE ROUTES*/

// Create user
// POST /api/users
userRouter.post("/", createUser);

// Update user
// PUT /api/users/:id
userRouter.put("/:id", updateUser);

// Delete user
// DELETE /api/users/:id
userRouter.delete("/:id", deleteUser);


export default userRouter;
