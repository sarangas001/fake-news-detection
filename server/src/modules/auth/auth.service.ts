import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../shared/sercurity/jwt";
import { comparePassword, hashPassword } from "../../shared/sercurity/password";
import { UserRepository } from "../users/user.repository";
import { LoginDTO, RegisterDTO } from "./auth.dto";
import { RefreshTokenRepository } from "./refresh-token.repository";

export class AuthService {

   private userRepository = new UserRepository();

   private refreshRepository = new RefreshTokenRepository();

   async register(data: RegisterDTO) {
        
        const existingUser = await this.userRepository.findByEmail( data.email);

        if(existingUser){
            return {
                message: "Email already in use"
            };
        }

        const hashedPassword =
            await hashPassword(
            data.password
        );

        const user = await this.userRepository.createUser({ ...data, password: hashedPassword });

        const accessToken = generateAccessToken({ userId:user.id, role:user.role });

        const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

        await this.refreshRepository.createToken({
            userId:user.id,
            token:refreshToken,
            expiresAt:
            new Date(
                Date.now() +
                30*24*60*60*1000
            )
        })

        return {
            user,
            accessToken,
            refreshToken
        };

   }

   async login (data:LoginDTO) {
        const user = await this.userRepository.findByEmail(data.email);

        if(!user) {
            return {
                message: "Invalid email or password"
            };
        }

        const validPassword = await comparePassword(data.password, user.password);

        if(!validPassword) {
            return {
                message: "Invalid email or password"
            };
        }

        const accessToken = generateAccessToken({ userId:user.id, role:user.role });

        const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

        await this.refreshRepository.createToken({
            userId:user.id,
            token:refreshToken,
            expiresAt: new Date(
                Date.now() +
                30*24*60*60*1000
            )
        });

        // Update login time
        await this.userRepository.updateLastLogin(user.id);

        return {
            user,
            accessToken,
            refreshToken
        };
   }

   async refresh(token: string) {
        const payload = verifyRefreshToken(token) as { userId: string };

        const storedToken = await this.refreshRepository.findToken(token);

        if (!storedToken) {
            throw new Error("Invalid refresh token");
        }

        const user = await this.userRepository.findById(payload.userId);

        if (!user) {
            throw new Error("User not found");
        }

        const accessToken = generateAccessToken({ userId: user.id, role: user.role });

        return {
            accessToken
        };
    }
  async logout(token: string) {
    await this.refreshRepository.deleteToken(token);

    return {
        message: "Logged out successfully"
    };

  }

}


