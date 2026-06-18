import RefreshToken  from "./refresh-token.model";

export class RefreshTokenRepository {

 async createToken(data:any) {
   return RefreshToken.create(data);
 }

 async findToken(token:string) {
   return RefreshToken.findOne({
     token
   });
 }

 async deleteToken(token:string) {
   return RefreshToken.deleteOne({
     token
   });
 }

 async deleteUserTokens(userId:string) {
   return RefreshToken.deleteMany({
     userId
   });
 }

}