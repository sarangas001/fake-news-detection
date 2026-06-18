import { ZodSchema }
from "zod";

export const validate =
(schema:ZodSchema)=>
(req: any,res: any,next: any)=>{

 const result =
 schema.safeParse(
   req.body
 );

 if(!result.success){

   return res.status(400)
   .json({
     success:false,
     errors:
     result.error
   });
 }

 next();
};