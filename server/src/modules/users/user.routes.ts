import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = express.Router();

router.get(
 "/profile",
 authMiddleware,
 (req: any, res: any)=>{

   res.json({
     success:true,
     user:req.user
   });

 });

export default router;