import { Request, Response } from 'express';
import { AuthController } from '../AuthController';
import { IAuthenticationService } from '../../../../application/ports/IAuthenticationService';
import { User } from '../../../../domain/entities/User';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: jest.Mocked<IAuthenticationService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  const testUser = User.create({
    id: 'user123',
    email: 'test@example.com',
    password: 'hashedPassword',
  });

  beforeEach(() => {
    mockAuthService = {
      authenticate: jest.fn(),
      verifyToken: jest.fn(),
      generateToken: jest.fn(),
    };

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    controller = new AuthController(mockAuthService);
  });

  describe('login', () => {
    it('should authenticate user and return token', async () => {
      const testToken = 'valid.jwt.token';
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.authenticate.mockResolvedValue({
        user: testUser,
        token: testToken,
      });

      await controller.login(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.authenticate).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: testUser,
        token: testToken,
      });
    });

    it('should return 400 when email is missing', async () => {
      mockRequest.body = {
        password: 'password123',
      };

      await controller.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email and password are required',
      });
    });

    it('should return 400 when password is missing', async () => {
      mockRequest.body = {
        email: 'test@example.com',
      };

      await controller.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email and password are required',
      });
    });

    it('should return 401 for invalid credentials', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.authenticate.mockRejectedValue(new Error('Invalid email or password'));

      await controller.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid email or password',
      });
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.authenticate.mockRejectedValue(new Error('Unexpected error'));

      await controller.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return the authenticated user', async () => {
      mockRequest.user = testUser;

      await controller.getCurrentUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: testUser,
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await controller.getCurrentUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not authenticated',
      });
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest.user = testUser;
      let statusCalled = false;
      let jsonCalled = false;

      mockResponse.status = jest.fn().mockImplementation((code: number) => {
        statusCalled = true;
        if (code === 200) {
          throw new Error('Unexpected error');
        }
        return mockResponse;
      });

      mockResponse.json = jest.fn().mockImplementation(() => {
        jsonCalled = true;
      });

      await controller.getCurrentUser(mockRequest as Request, mockResponse as Response);

      expect(statusCalled).toBe(true);
      expect(jsonCalled).toBe(true);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });
});
