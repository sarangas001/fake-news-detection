import { validate } from "../../middleware/validate.middleware";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validators";
import express from "express";

const router = express.Router();

const authCtrl = new authController();

router.post( "/register", validate(registerSchema), authCtrl.register );
router.post( "/login", validate(loginSchema), authCtrl.login );
router.post( "/refresh", authCtrl.refresh );
router.post( "/logout", authCtrl.logout );

export default router;