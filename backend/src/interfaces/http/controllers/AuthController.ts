import { Request, Response } from 'express';
import { IAuthenticationService } from '../../../application/ports/IAuthenticationService';

export class AuthController {
  constructor(private readonly authService: IAuthenticationService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const result = await this.authService.authenticate(email, password);

      res.status(200).json({
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid email or password') {
          res.status(401).json({ message: error.message });
          return;
        }
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const response = { user: req.user };
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}
