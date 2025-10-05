import { Router } from "express";
import { 
    getUser, 
    getUsers, 
    createUser, 
    updateUser, 
    deleteUser,
    checkUserExists
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/:id", getUser);
userRouter.post("/", createUser);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);
userRouter.get("/exists/check", checkUserExists);

export default userRouter;
