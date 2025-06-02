import { PhoneNumber } from '../PhoneNumber';

describe('PhoneNumber Value Object', () => {
  describe('create', () => {
    it('should create a valid phone number with international format', () => {
      const phone = PhoneNumber.create('+1 (555) 123-4567');
      expect(phone.getValue()).toBe('+1(555)123-4567');
    });

    it('should create a valid phone number with local format', () => {
      const phone = PhoneNumber.create('555-123-4567');
      expect(phone.getValue()).toBe('555-123-4567');
    });

    it('should create a valid phone number with spaces', () => {
      const phone = PhoneNumber.create('+44 20 7123 4567');
      expect(phone.getValue()).toBe('+442071234567');
    });

    it('should trim whitespace', () => {
      const phone = PhoneNumber.create('  +1 (555) 123-4567  ');
      expect(phone.getValue()).toBe('+1(555)123-4567');
    });

    it('should throw error for empty phone number', () => {
      expect(() => PhoneNumber.create('')).toThrow('Phone number is required');
    });

    it('should throw error for whitespace only', () => {
      expect(() => PhoneNumber.create('   ')).toThrow('Phone number is required');
    });

    it('should throw error for invalid format', () => {
      expect(() => PhoneNumber.create('123')).toThrow('Invalid phone number format');
      expect(() => PhoneNumber.create('abc-def-ghij')).toThrow('Invalid phone number format');
      expect(() => PhoneNumber.create('+1@123#456')).toThrow('Invalid phone number format');
    });
  });

  describe('toJSON', () => {
    it('should return phone number string', () => {
      const phone = PhoneNumber.create('+1 (555) 123-4567');
      expect(phone.toJSON()).toBe('+1(555)123-4567');
    });
  });
});
