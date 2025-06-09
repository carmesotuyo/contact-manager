import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthMiddleware } from '../../middleware/AuthMiddleware';
import { IAuthenticationService } from '../../../application/ports/IAuthenticationService';

export const createAuthRouter = (authService: IAuthenticationService): Router => {
  const router = Router();
  const authController = new AuthController(authService);
  const authMiddleware = new AuthMiddleware(authService);

  router.post('/login', (req, res) => authController.login(req, res));
  router.get('/user', authMiddleware.authenticate.bind(authMiddleware), (req, res) =>
    authController.getCurrentUser(req, res),
  );

  return router;
};
