import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaContactRepository } from '../ContactRepository';
import { Contact } from '../../../../../domain/entities/Contact';
import { Address } from '../../../../../domain/value-objects/Address';
import { ProfilePicture } from '../../../../../domain/value-objects/ProfilePicture';

jest.mock('../../client', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

const prismaMock = jest.requireMock('../../client').prisma as DeepMockProxy<PrismaClient>;

describe('PrismaContactRepository', () => {
  let repository: PrismaContactRepository;
  const testContact = {
    id: '123',
    userId: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    placeId: 'place123',
    formattedAddress: '123 Main St',
    profilePicture: 'profile.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockReset(prismaMock);
    repository = new PrismaContactRepository();
  });

  describe('findById', () => {
    it('should return null when contact not found', async () => {
      prismaMock.contact.findUnique.mockResolvedValue(null);
      const result = await repository.findById('123');
      expect(result).toBeNull();
    });

    it('should return contact when found', async () => {
      prismaMock.contact.findUnique.mockResolvedValue(testContact);
      const result = await repository.findById('123');
      expect(result).toBeInstanceOf(Contact);
      expect(result?.id).toBe('123');
      expect(result?.getName()).toBe('John Doe');
      expect(result?.getEmail()).toBe('john@example.com');
    });
  });

  describe('findByUserId', () => {
    it('should return empty array when no contacts found', async () => {
      prismaMock.contact.findMany.mockResolvedValue([]);
      const result = await repository.findByUserId('user123');
      expect(result).toEqual([]);
    });

    it('should return contacts when found', async () => {
      prismaMock.contact.findMany.mockResolvedValue([testContact]);
      const result = await repository.findByUserId('user123');
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Contact);
      expect(result[0].getUserId()).toBe('user123');
    });
  });

  describe('save', () => {
    it('should create new contact', async () => {
      const contact = Contact.create({
        userId: 'user123',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+0987654321',
      });

      prismaMock.contact.upsert.mockResolvedValue({
        ...testContact,
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+0987654321',
      });

      const result = await repository.save(contact);
      expect(result).toBeInstanceOf(Contact);
      expect(result.getName()).toBe('Jane Doe');
      expect(result.getEmail()).toBe('jane@example.com');
    });

    it('should update existing contact with address and profile picture', async () => {
      const address = Address.create({
        placeId: 'place123',
        formattedAddress: '123 Main St',
      });

      const profilePicture = ProfilePicture.create({
        filename: 'profile.jpg',
      });

      const contact = Contact.create({
        id: '123',
        userId: 'user123',
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '+1111111111',
        address,
        profilePicture,
      });

      prismaMock.contact.upsert.mockResolvedValue({
        ...testContact,
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '+1111111111',
        placeId: 'place123',
        formattedAddress: '123 Main St',
        profilePicture: 'profile.jpg',
      });

      const result = await repository.save(contact);
      expect(result).toBeInstanceOf(Contact);
      expect(result.getName()).toBe('Updated Name');
      expect(result.getEmail()).toBe('updated@example.com');
      expect(result.getAddress()?.getPlaceId()).toBe('place123');
      expect(result.getProfilePicture()?.getUrl()).toBe('/uploads/profile-pictures/profile.jpg');
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const contacts = [testContact];
      prismaMock.contact.findMany.mockResolvedValue(contacts);
      prismaMock.contact.count.mockResolvedValue(1);

      const result = await repository.findAll({ userId: 'user123', page: 1, limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by search query', async () => {
      const contacts = [testContact];
      prismaMock.contact.findMany.mockResolvedValue(contacts);
      prismaMock.contact.count.mockResolvedValue(1);

      await repository.findAll({ userId: 'user123', query: 'john' });
      expect(prismaMock.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user123',
            OR: [
              { name: { contains: 'john', mode: 'insensitive' } },
              { email: { contains: 'john', mode: 'insensitive' } },
              { phone: { contains: 'john', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });
  });

  describe('delete', () => {
    it('should delete contact', async () => {
      await repository.delete('123');
      expect(prismaMock.contact.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });
  });

  describe('count', () => {
    it('should count contacts with search criteria', async () => {
      prismaMock.contact.count.mockResolvedValue(5);
      const count = await repository.count({ userId: 'user123', query: 'john' });
      expect(count).toBe(5);
      expect(prismaMock.contact.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId: 'user123',
          OR: [
            { name: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
            { phone: { contains: 'john', mode: 'insensitive' } },
          ],
        }),
      });
    });
  });
});
