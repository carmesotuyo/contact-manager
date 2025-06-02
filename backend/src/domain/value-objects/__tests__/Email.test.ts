import { Email } from '../Email';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const email = Email.create('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = Email.create('TEST@EXAMPLE.COM');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const email = Email.create('  test@example.com  ');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should throw error for empty email', () => {
      expect(() => Email.create('')).toThrow('Email is required');
    });

    it('should throw error for whitespace only', () => {
      expect(() => Email.create('   ')).toThrow('Email is required');
    });

    it('should throw error for invalid format', () => {
      expect(() => Email.create('invalid-email')).toThrow('Invalid email format');
      expect(() => Email.create('test@')).toThrow('Invalid email format');
      expect(() => Email.create('@example.com')).toThrow('Invalid email format');
      expect(() => Email.create('test@example')).toThrow('Invalid email format');
    });
  });

  describe('toJSON', () => {
    it('should return email string', () => {
      const email = Email.create('test@example.com');
      expect(email.toJSON()).toBe('test@example.com');
    });
  });
});
