import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";

const router = Router();

router.use( "/auth", authRoutes );

router.use( "/users", userRoutes);

export default router;

// /users

// /news-analysis

// /chat

// /admin