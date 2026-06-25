import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";
import {newsAnalysisRoutes} from "../modules/news-analysis/news-analysis.routes";
import {imageAnalysisRoutes} from "../modules/image-analysis/image-analysis.routes";
import { intelligenceRoutes } from "../modules/intelligence/intelligence.routes";
import { chatRoutes } from "../modules/chat/chat.routes";


const router = Router();

router.use( "/auth", authRoutes );

router.use( "/users", userRoutes);

router.use("/news-analysis", newsAnalysisRoutes);

router.use("/images", imageAnalysisRoutes)

router.use("/intelligence", intelligenceRoutes)

router.use("/chat", chatRoutes);


export default router;