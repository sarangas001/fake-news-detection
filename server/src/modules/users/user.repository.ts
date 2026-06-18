import  User from "./user.model.js"

export class UserRepository {

 async createUser(data:any) {
   return User.create(data);
 }

 async findByEmail(email:string) {
   return User.findOne({ email })
      .select("+password");
 }

 async findById(id:string) {
   return User.findById(id);
 }

 async updateLastLogin(id:string) {

   return User.findByIdAndUpdate(
      id,
      {
        lastLoginAt:
        new Date()
      }
   );
 }

}