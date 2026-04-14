import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt.strategy';
export declare class AuthService {
    private readonly jwt;
    constructor(jwt: JwtService);
    generateToken(payload: JwtPayload): string;
    verifyToken(token: string): JwtPayload;
}
