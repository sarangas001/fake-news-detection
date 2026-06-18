interface AuthRequest
extends Request {

 user: {

   userId: string;

   role: string;
 }
}