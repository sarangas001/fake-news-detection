import { AuthService } from "./auth.service";

export class authController {
    private readonly authService: AuthService = new AuthService();

    async register( req: any, res: any, next: any) {

        const result = await this.authService.register(req.body);

        res.status(201).json({
            success:true,
            data:result
        });

    };

    async login( req: any, res: any, next: any){

        const result = await this.authService.login(req.body);

        res.status(200).json({
            success:true,
            data:result
        });
    };

    async refresh ( req: any, res: any, next: any) {
    const { refreshToken } = req.body;

    const result = await this.authService.refresh(refreshToken);
        res.status(200).json({
            success:true,
            data:result
        });
    };

    async logout( req: any, res: any, next: any) {
        const { refreshToken } = req.body;

        await this.authService.logout(refreshToken);

        res.status(200).json({
            success:true,
            message:"Logged out successfully"
        });
    };

}




