import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';
import { ITokenService, TokenPayload } from '../../../domain/ports/ITokenService';

type ValidExpiresIn = string | number | undefined;

export class JwtTokenService implements ITokenService {
  private readonly secret: Secret;
  private readonly options: SignOptions;

  constructor(secret: string, expiresIn: ValidExpiresIn = '24h') {
    if (!secret) {
      throw new Error('JWT secret is required');
    }
    this.secret = secret;
    this.options = { expiresIn } as SignOptions;
  }

  async generate(payload: TokenPayload): Promise<string> {
    if (!payload.userId || !payload.email) {
      throw new Error('Token payload must contain userId and email');
    }

    return jwt.sign(payload, this.secret, this.options);
  }

  async verify(token: string): Promise<TokenPayload> {
    if (!token) {
      throw new Error('Token is required');
    }

    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload & TokenPayload;

      if (!decoded.userId || !decoded.email) {
        throw new Error('Invalid token payload');
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }
}
