import { Request, Response, NextFunction } from 'express';
import { AuthMiddleware } from '../AuthMiddleware';
import { IAuthenticationService } from '../../../application/ports/IAuthenticationService';
import { User } from '../../../domain/entities/User';

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let mockAuthService: jest.Mocked<IAuthenticationService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.MockedFunction<NextFunction>;

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
      headers: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    nextFunction = jest.fn();

    middleware = new AuthMiddleware(mockAuthService);
  });

  it('should authenticate valid token and attach user to request', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid.token.here',
    };

    mockAuthService.verifyToken.mockResolvedValue(testUser);

    await middleware.authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockAuthService.verifyToken).toHaveBeenCalledWith('valid.token.here');
    expect(mockRequest.user).toBe(testUser);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should return 401 when no authorization header is present', async () => {
    await middleware.authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Authentication token is missing',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header has invalid format', async () => {
    mockRequest.headers = {
      authorization: 'InvalidFormat token.here',
    };

    await middleware.authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Authentication token is missing',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 when token has expired', async () => {
    mockRequest.headers = {
      authorization: 'Bearer expired.token.here',
    };

    mockAuthService.verifyToken.mockRejectedValue(new Error('Token has expired'));

    await middleware.authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Token has expired',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', async () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid.token.here',
    };

    mockAuthService.verifyToken.mockRejectedValue(new Error('Invalid token'));

    await middleware.authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid token',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 for unexpected errors', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid.token.here',
    };

    mockAuthService.verifyToken.mockRejectedValue(new Error('Unexpected error'));

    await middleware.authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Authentication failed',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
