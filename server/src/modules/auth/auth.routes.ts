import { validate } from "../../middleware/validate.middleware";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema, refreshSchema } from "./auth.validators";
import express from "express";

const router = express.Router();

const authCtrl = new authController();

router.post( "/register", validate(registerSchema), authCtrl.register.bind(authCtrl) );
router.post( "/login", validate(loginSchema), authCtrl.login.bind(authCtrl) );
router.post( "/refresh", validate(refreshSchema), authCtrl.refresh.bind(authCtrl) );
router.post( "/logout", validate(refreshSchema), authCtrl.logout.bind(authCtrl) );

export default router;

