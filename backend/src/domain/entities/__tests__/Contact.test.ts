import { Contact, ContactData } from '../Contact';

describe('Contact Entity', () => {
  const validContactData: ContactData = {
    userId: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
  };

  describe('create', () => {
    it('should create a valid contact', () => {
      const contact = Contact.create(validContactData);
      expect(contact).toBeInstanceOf(Contact);
      expect(contact.getName()).toBe('John Doe');
      expect(contact.getEmail()).toBe('john@example.com');
      expect(contact.getPhone()).toBe('+1 (555) 123-4567');
    });

    it('should generate an id if not provided', () => {
      const contact = Contact.create(validContactData);
      expect(contact.id).toBeDefined();
      expect(typeof contact.id).toBe('string');
    });

    it('should throw error for invalid name', () => {
      expect(() => Contact.create({ ...validContactData, name: 'J' })).toThrow(
        'Name must be at least 2 characters long',
      );
    });

    it('should throw error for invalid email', () => {
      expect(() => Contact.create({ ...validContactData, email: 'invalid-email' })).toThrow(
        'Invalid email format',
      );
    });

    it('should throw error for invalid phone', () => {
      expect(() => Contact.create({ ...validContactData, phone: '123' })).toThrow(
        'Phone number must be at least 6 characters long',
      );
    });
  });

  describe('updateDetails', () => {
    let contact: Contact;

    beforeEach(() => {
      contact = Contact.create(validContactData);
    });

    it('should update name', () => {
      contact.updateDetails({ name: 'Jane Doe' });
      expect(contact.getName()).toBe('Jane Doe');
    });

    it('should update email', () => {
      contact.updateDetails({ email: 'jane@example.com' });
      expect(contact.getEmail()).toBe('jane@example.com');
    });

    it('should update phone', () => {
      contact.updateDetails({ phone: '+1 (555) 987-6543' });
      expect(contact.getPhone()).toBe('+1 (555) 987-6543');
    });

    it('should throw error for invalid email update', () => {
      expect(() => contact.updateDetails({ email: 'invalid-email' })).toThrow(
        'Invalid email format',
      );
    });

    it('should throw error for invalid phone update', () => {
      expect(() => contact.updateDetails({ phone: '123' })).toThrow(
        'Phone number must be at least 6 characters long',
      );
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation', () => {
      const contact = Contact.create(validContactData);
      const json = contact.toJSON();

      expect(json).toEqual({
        id: contact.id,
        userId: validContactData.userId,
        name: validContactData.name,
        email: validContactData.email,
        phone: validContactData.phone,
        address: undefined,
        profilePicture: undefined,
      });
    });
  });
});
