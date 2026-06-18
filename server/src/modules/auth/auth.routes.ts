import { validate } from "../../middleware/validate.middleware";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validators";
import express from "express";

const router = express.Router();

const authCtrl = new authController();

router.post( "/register", validate(registerSchema), authCtrl.register.bind(authCtrl) );
router.post( "/login", validate(loginSchema), authCtrl.login.bind(authCtrl) );
router.post( "/refresh", authCtrl.refresh.bind(authCtrl) );
router.post( "/logout", authCtrl.logout.bind(authCtrl) );

export default router;
