import { Contact, ContactData } from '../Contact';
import { Address } from '../../value-objects/Address';
import { ProfilePicture } from '../../value-objects/ProfilePicture';

describe('Contact Entity', () => {
  const mockAddress = Address.create({
    placeId: 'place123',
    formattedAddress: '123 Main St',
  });
  const mockProfilePicture = ProfilePicture.create({
    filename: 'profile.jpg',
  });

  const validContactData: ContactData = {
    userId: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
  };

  const validContactWithAddressData: ContactData = {
    ...validContactData,
    address: mockAddress,
    profilePicture: mockProfilePicture,
  };

  describe('create', () => {
    it('should create a valid contact', () => {
      const contact = Contact.create(validContactData);
      expect(contact).toBeInstanceOf(Contact);
      expect(contact.getName()).toBe('John Doe');
      expect(contact.getEmail()).toBe('john@example.com');
      expect(contact.getPhone()).toBe('+1(555)123-4567');
      expect(contact.getUserId()).toBe('user123');
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
        'Invalid phone number format',
      );
    });
  });

  describe('getters', () => {
    it('should return address when set', () => {
      const contact = Contact.create(validContactWithAddressData);
      expect(contact.getAddress()).toBe(mockAddress);
    });

    it('should return undefined when address not set', () => {
      const contact = Contact.create(validContactData);
      expect(contact.getAddress()).toBeUndefined();
    });

    it('should return profile picture when set', () => {
      const contact = Contact.create(validContactWithAddressData);
      expect(contact.getProfilePicture()).toBe(mockProfilePicture);
    });

    it('should return undefined when profile picture not set', () => {
      const contact = Contact.create(validContactData);
      expect(contact.getProfilePicture()).toBeUndefined();
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
      expect(contact.getPhone()).toBe('+1(555)987-6543');
    });

    it('should throw error for invalid email update', () => {
      expect(() => contact.updateDetails({ email: 'invalid-email' })).toThrow(
        'Invalid email format',
      );
    });

    it('should throw error for invalid phone update', () => {
      expect(() => contact.updateDetails({ phone: '123' })).toThrow('Invalid phone number format');
    });

    it('should update address', () => {
      const newAddress = Address.create({
        placeId: 'place456',
        formattedAddress: '456 Oak St',
      });
      contact.updateDetails({ address: newAddress });
      expect(contact.getAddress()).toBe(newAddress);
    });

    it('should update profile picture', () => {
      const newProfilePic = ProfilePicture.create({
        filename: 'new-profile.jpg',
      });
      contact.updateDetails({ profilePicture: newProfilePic });
      expect(contact.getProfilePicture()).toBe(newProfilePic);
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation with all fields', () => {
      const contact = Contact.create(validContactWithAddressData);
      const json = contact.toJSON();

      expect(json).toEqual({
        id: contact.id,
        userId: validContactWithAddressData.userId,
        name: validContactWithAddressData.name,
        email: validContactWithAddressData.email,
        phone: '+1(555)123-4567',
        address: validContactWithAddressData.address?.toJSON(),
        profilePicture: validContactWithAddressData.profilePicture?.toJSON(),
      });
    });

    it('should return correct JSON representation without optional fields', () => {
      const contact = Contact.create(validContactData);
      const json = contact.toJSON();

      expect(json).toEqual({
        id: contact.id,
        userId: validContactData.userId,
        name: validContactData.name,
        email: validContactData.email,
        phone: '+1(555)123-4567',
        address: undefined,
        profilePicture: undefined,
      });
    });
  });
});
