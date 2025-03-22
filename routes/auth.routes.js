import { Router } from "express";
import { signIn, signOut, signUp } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/signin", signIn);
authRouter.post("/signup", signUp);
authRouter.post("/logout", signOut);

export default authRouter;