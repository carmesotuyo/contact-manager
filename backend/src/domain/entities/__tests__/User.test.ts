import { User, UserData } from '../User';

describe('User', () => {
  const validUserData: UserData = {
    email: 'test@example.com',
    password: 'hashedPassword123',
  };

  describe('create', () => {
    it('should create a user with valid data', () => {
      const user = User.create(validUserData);
      expect(user.id).toBeDefined();
      expect(user.getEmail()).toBe('test@example.com');
    });

    it('should throw error for empty email', () => {
      expect(() => User.create({ ...validUserData, email: '' })).toThrow('Email is required');
    });

    it('should throw error for invalid email format', () => {
      expect(() => User.create({ ...validUserData, email: 'invalid-email' })).toThrow(
        'Invalid email format',
      );
    });

    it('should normalize email to lowercase', () => {
      const user = User.create({ ...validUserData, email: 'TEST@EXAMPLE.COM' });
      expect(user.getEmail()).toBe('test@example.com');
    });
  });

  describe('toJSON', () => {
    it('should return object without password', () => {
      const user = User.create(validUserData);
      const json = user.toJSON();
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('email');
      expect(json).not.toHaveProperty('password');
    });
  });
});
