import { Contact } from '../../../domain/entities/Contact';
import { IContactRepository } from '../../../domain/ports/IContactRepository';
import { ContactService } from '../ContactService';
import { Address } from '../../../domain/value-objects/Address';
import { ProfilePicture } from '../../../domain/value-objects/ProfilePicture';

describe('ContactService', () => {
  let contactService: ContactService;
  let mockContactRepository: jest.Mocked<IContactRepository>;
  let userId: string;
  let contactId: string;
  let testContact: Contact;
  let testAddress: Address;
  let testProfilePicture: ProfilePicture;

  beforeEach(() => {
    mockContactRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findByUserId: jest.fn(),
    };

    contactService = new ContactService(mockContactRepository);

    userId = 'user123';
    contactId = 'contact123';
    testAddress = Address.create({
      placeId: 'place123',
      formattedAddress: '123 Main St',
    });
    testProfilePicture = ProfilePicture.create({
      filename: 'profile.jpg',
    });

    testContact = Contact.create({
      userId,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: testAddress,
      profilePicture: testProfilePicture,
    });
    Object.defineProperty(testContact, 'id', { value: contactId });
  });

  describe('createContact', () => {
    it('should create a contact successfully', async () => {
      const contactData = {
        userId,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: {
          placeId: 'place123',
          formattedAddress: '123 Main St',
        },
        profilePicture: {
          filename: 'profile.jpg',
        },
      };

      mockContactRepository.findAll.mockResolvedValue({ items: [], total: 0, page: 1, limit: 1 });
      mockContactRepository.save.mockResolvedValue(testContact);

      const result = await contactService.createContact(contactData);

      expect(result).toEqual({
        id: testContact.id,
        userId: testContact.getUserId(),
        name: testContact.getName(),
        email: testContact.getEmail(),
        phone: testContact.getPhone(),
        address: testContact.getAddress()?.toJSON(),
        profilePicture: testContact.getProfilePicture()?.toJSON(),
      });
      expect(mockContactRepository.save).toHaveBeenCalled();
    });

    it('should throw error if email already exists for user', async () => {
      const existingContact = Contact.create({
        userId,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      });

      mockContactRepository.findAll.mockResolvedValue({
        items: [existingContact],
        total: 1,
        page: 1,
        limit: 1,
      });

      await expect(
        contactService.createContact({
          userId,
          name: 'John Doe 2',
          email: 'john@example.com',
          phone: '0987654321',
        }),
      ).rejects.toThrow('You already have a contact with this email address');
      expect(mockContactRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateContact', () => {
    beforeEach(() => {
      mockContactRepository.findById.mockResolvedValue(testContact);
      mockContactRepository.save.mockImplementation((c) => Promise.resolve(c));
    });

    it('should update contact successfully', async () => {
      const updateData = {
        name: 'John Updated',
        email: 'john.updated@example.com',
        phone: '0987654321',
        address: {
          placeId: 'place456',
          formattedAddress: '456 New St',
        },
      };

      mockContactRepository.findAll.mockResolvedValue({ items: [], total: 0, page: 1, limit: 1 });

      const result = await contactService.updateContact(contactId, userId, updateData);

      expect(result.name).toBe(updateData.name);
      expect(result.email).toBe(updateData.email);
      expect(result.phone).toBe(updateData.phone);
      expect(result.address).toEqual(updateData.address);
      expect(mockContactRepository.save).toHaveBeenCalled();
    });

    it('should throw error if contact not found', async () => {
      mockContactRepository.findById.mockResolvedValue(null);

      await expect(
        contactService.updateContact('non-existent', userId, { name: 'New Name' }),
      ).rejects.toThrow('Contact not found');
      expect(mockContactRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error if contact belongs to different user', async () => {
      const differentUserContact = Contact.create({
        userId: 'different-user',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      });

      mockContactRepository.findById.mockResolvedValue(differentUserContact);

      await expect(
        contactService.updateContact(differentUserContact.id, userId, { name: 'New Name' }),
      ).rejects.toThrow('Contact not found');
      expect(mockContactRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error if updating to existing email', async () => {
      const existingEmail = 'existing@example.com';
      const existingContact = Contact.create({
        userId,
        name: 'Existing Contact',
        email: existingEmail,
        phone: '5555555555',
      });

      mockContactRepository.findAll.mockResolvedValue({
        items: [existingContact],
        total: 1,
        page: 1,
        limit: 1,
      });

      await expect(
        contactService.updateContact(contactId, userId, { email: existingEmail }),
      ).rejects.toThrow('You already have another contact with this email address');
      expect(mockContactRepository.save).not.toHaveBeenCalled();
    });

    it('should update contact without optional fields', async () => {
      const updateData = {
        name: 'John Updated',
      };

      const result = await contactService.updateContact(contactId, userId, updateData);

      expect(result.name).toBe(updateData.name);
      expect(result.email).toBe(testContact.getEmail());
      expect(result.phone).toBe(testContact.getPhone());
      expect(result.address).toEqual(testContact.getAddress()?.toJSON());
      expect(result.profilePicture).toEqual(testContact.getProfilePicture()?.toJSON());
      expect(mockContactRepository.save).toHaveBeenCalled();
    });

    it('should preserve optional fields when not provided in update', async () => {
      const updateData = {
        name: 'John Updated',
        email: 'john.updated@example.com',
        phone: '0987654321',
      };

      mockContactRepository.findAll.mockResolvedValue({ items: [], total: 0, page: 1, limit: 1 });

      const result = await contactService.updateContact(contactId, userId, updateData);

      expect(result.name).toBe(updateData.name);
      expect(result.email).toBe(updateData.email);
      expect(result.phone).toBe(updateData.phone);
      expect(result.address).toEqual(testContact.getAddress()?.toJSON());
      expect(result.profilePicture).toEqual(testContact.getProfilePicture()?.toJSON());
      expect(mockContactRepository.save).toHaveBeenCalled();
    });
  });

  describe('deleteContact', () => {
    it('should delete contact successfully', async () => {
      mockContactRepository.findById.mockResolvedValue(testContact);

      await contactService.deleteContact(contactId, userId);

      expect(mockContactRepository.findById).toHaveBeenCalledWith(contactId);
      expect(mockContactRepository.delete).toHaveBeenCalledWith(contactId);
    });

    it('should throw error if contact not found', async () => {
      mockContactRepository.findById.mockResolvedValue(null);

      await expect(contactService.deleteContact('non-existent', userId)).rejects.toThrow(
        'Contact not found',
      );
      expect(mockContactRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error if contact belongs to different user', async () => {
      const differentUserContact = Contact.create({
        userId: 'different-user',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      });

      mockContactRepository.findById.mockResolvedValue(differentUserContact);

      await expect(contactService.deleteContact(differentUserContact.id, userId)).rejects.toThrow(
        'Contact not found',
      );
      expect(mockContactRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getContactsByUser', () => {
    it('should return contacts with pagination', async () => {
      const contacts = [
        testContact,
        Contact.create({
          userId,
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '0987654321',
        }),
      ];

      mockContactRepository.findAll.mockResolvedValue({
        items: contacts,
        total: 2,
        page: 1,
        limit: 20,
      });

      const result = await contactService.getContactsByUser(userId, { page: 1, limit: 20 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockContactRepository.findAll).toHaveBeenCalledWith({
        userId,
        page: 1,
        limit: 20,
      });
    });

    it('should apply search criteria', async () => {
      const query = 'john';
      mockContactRepository.findAll.mockResolvedValue({
        items: [testContact],
        total: 1,
        page: 1,
        limit: 20,
      });

      const result = await contactService.getContactsByUser(userId, { query, page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(mockContactRepository.findAll).toHaveBeenCalledWith({
        userId,
        query,
        page: 1,
        limit: 20,
      });
    });
  });

  describe('searchContacts', () => {
    it('should search contacts with pagination', async () => {
      const contacts = [
        testContact,
        Contact.create({
          userId: 'user2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '0987654321',
        }),
      ];

      mockContactRepository.findAll.mockResolvedValue({
        items: contacts,
        total: 2,
        page: 1,
        limit: 20,
      });

      const result = await contactService.searchContacts({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockContactRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
    });

    it('should search contacts with query', async () => {
      mockContactRepository.findAll.mockResolvedValue({
        items: [testContact],
        total: 1,
        page: 1,
        limit: 20,
      });

      const result = await contactService.searchContacts({ query: 'john' });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockContactRepository.findAll).toHaveBeenCalledWith({
        query: 'john',
        page: 1,
        limit: 20,
      });
    });

    it('should use default pagination values', async () => {
      mockContactRepository.findAll.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      const result = await contactService.searchContacts({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockContactRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
    });
  });

  describe('getContactByIdAndValidateUser', () => {
    it('should return contact when found and user matches', async () => {
      const mockContact = Contact.create({
        userId: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      });

      mockContactRepository.findById.mockResolvedValue(mockContact);

      const result = await contactService.getContactByIdAndValidateUser('contact123', 'user123');

      expect(mockContactRepository.findById).toHaveBeenCalledWith('contact123');
      expect(result).toEqual({
        id: expect.any(String),
        userId: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: undefined,
        profilePicture: undefined,
      });
    });

    it('should throw error when contact not found', async () => {
      mockContactRepository.findById.mockResolvedValue(null);

      await expect(
        contactService.getContactByIdAndValidateUser('contact123', 'user123'),
      ).rejects.toThrow('Contact not found');
    });

    it('should throw error when user does not match', async () => {
      const mockContact = Contact.create({
        userId: 'differentUser',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      });

      mockContactRepository.findById.mockResolvedValue(mockContact);

      await expect(
        contactService.getContactByIdAndValidateUser('contact123', 'user123'),
      ).rejects.toThrow('Contact not found');
    });

    it('should handle contact with full details', async () => {
      const address = Address.create({
        placeId: 'place123',
        formattedAddress: '123 Main St',
      });
      const profilePicture = ProfilePicture.create({
        filename: 'profile.jpg',
      });

      const mockContact = Contact.create({
        userId: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address,
        profilePicture,
      });

      mockContactRepository.findById.mockResolvedValue(mockContact);

      const result = await contactService.getContactByIdAndValidateUser('contact123', 'user123');

      expect(result).toEqual({
        id: expect.any(String),
        userId: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: {
          placeId: 'place123',
          formattedAddress: '123 Main St',
        },
        profilePicture: {
          url: '/uploads/profile-pictures/profile.jpg',
        },
      });
    });
  });
});
