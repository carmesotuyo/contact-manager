import { Request, Response, NextFunction } from 'express';
import { IAuthenticationService } from '../../application/ports/IAuthenticationService';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export class AuthMiddleware {
  constructor(private readonly authService: IAuthenticationService) {}

  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractTokenFromHeader(req);

      if (!token) {
        res.status(401).json({ message: 'Authentication token is missing' });
        return;
      }

      const user = await this.authService.verifyToken(token);
      req.user = user;
      next();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Token has expired') {
          res.status(401).json({ message: 'Token has expired' });
          return;
        }
        if (error.message === 'Invalid token') {
          res.status(401).json({ message: 'Invalid token' });
          return;
        }
      }
      res.status(401).json({ message: 'Authentication failed' });
    }
  };

  private extractTokenFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}
