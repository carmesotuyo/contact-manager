import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaNoteRepository } from '../NoteRepository';
import { Note } from '../../../../../domain/entities/Note';

jest.mock('../../client', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

const prismaMock = jest.requireMock('../../client').prisma as DeepMockProxy<PrismaClient>;

describe('PrismaNoteRepository', () => {
  let repository: PrismaNoteRepository;
  const testNote = {
    id: '123',
    contactId: 'contact123',
    userId: 'user123',
    text: 'Test note',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockReset(prismaMock);
    repository = new PrismaNoteRepository();
  });

  describe('findById', () => {
    it('should return null when note not found', async () => {
      prismaMock.note.findUnique.mockResolvedValue(null);
      const result = await repository.findById('123');
      expect(result).toBeNull();
    });

    it('should return note when found', async () => {
      prismaMock.note.findUnique.mockResolvedValue(testNote);
      const result = await repository.findById('123');
      expect(result).toBeInstanceOf(Note);
      expect(result?.id).toBe('123');
      expect(result?.getText()).toBe('Test note');
    });
  });

  describe('save', () => {
    it('should create new note', async () => {
      const note = Note.create({
        contactId: 'contact123',
        userId: 'user123',
        text: 'New note',
      });

      prismaMock.note.upsert.mockResolvedValue({
        ...testNote,
        text: 'New note',
      });

      const result = await repository.save(note);
      expect(result).toBeInstanceOf(Note);
      expect(result.getText()).toBe('New note');
    });

    it('should update existing note', async () => {
      const note = Note.create({
        id: '123',
        contactId: 'contact123',
        userId: 'user123',
        text: 'Updated note',
      });

      prismaMock.note.upsert.mockResolvedValue({
        ...testNote,
        text: 'Updated note',
      });

      const result = await repository.save(note);
      expect(result).toBeInstanceOf(Note);
      expect(result.getText()).toBe('Updated note');
    });

    it('should throw error for null note', async () => {
      await expect(repository.save(null as any)).rejects.toThrow('Note is required');
    });

    it('should handle database errors', async () => {
      const note = Note.create({
        contactId: 'contact123',
        userId: 'user123',
        text: 'Test note',
      });

      const error = new Error('Database error');
      prismaMock.note.upsert.mockRejectedValue(error);

      await expect(repository.save(note)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const notes = [testNote];
      prismaMock.note.findMany.mockResolvedValue(notes);
      prismaMock.note.count.mockResolvedValue(1);

      const result = await repository.findAll({ userId: 'user123', page: 1, limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by contact ID', async () => {
      const notes = [testNote];
      prismaMock.note.findMany.mockResolvedValue(notes);
      prismaMock.note.count.mockResolvedValue(1);

      await repository.findAll({ userId: 'user123', contactId: 'contact123' });
      expect(prismaMock.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user123',
            contactId: 'contact123',
          }),
        }),
      );
    });

    it('should filter by search query', async () => {
      const notes = [testNote];
      prismaMock.note.findMany.mockResolvedValue(notes);
      prismaMock.note.count.mockResolvedValue(1);

      await repository.findAll({ userId: 'user123', query: 'test' });
      expect(prismaMock.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user123',
            text: { contains: 'test', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should handle empty search criteria', async () => {
      prismaMock.note.findMany.mockResolvedValue([]);
      prismaMock.note.count.mockResolvedValue(0);

      const result = await repository.findAll({});
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should handle database errors in findMany', async () => {
      const error = new Error('Database error');
      prismaMock.note.findMany.mockRejectedValue(error);
      prismaMock.note.count.mockResolvedValue(0);

      await expect(repository.findAll({})).rejects.toThrow('Database error');
    });

    it('should handle database errors in count', async () => {
      const error = new Error('Database error');
      prismaMock.note.findMany.mockResolvedValue([]);
      prismaMock.note.count.mockRejectedValue(error);

      await expect(repository.findAll({})).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('should delete note', async () => {
      await repository.delete('123');
      expect(prismaMock.note.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should throw error for empty id', async () => {
      await expect(repository.delete('')).rejects.toThrow('Note ID is required');
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      prismaMock.note.delete.mockRejectedValue(error);

      await expect(repository.delete('123')).rejects.toThrow('Database error');
    });
  });

  describe('count', () => {
    it('should count notes with search criteria', async () => {
      prismaMock.note.count.mockResolvedValue(5);
      const count = await repository.count({ userId: 'user123', contactId: 'contact123' });
      expect(count).toBe(5);
      expect(prismaMock.note.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId: 'user123',
          contactId: 'contact123',
        }),
      });
    });

    it('should handle empty search criteria', async () => {
      prismaMock.note.count.mockResolvedValue(0);
      const count = await repository.count({});
      expect(count).toBe(0);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      prismaMock.note.count.mockRejectedValue(error);

      await expect(repository.count({})).rejects.toThrow('Database error');
    });
  });

  describe('findByContactId', () => {
    it('should return notes for a contact', async () => {
      const notes = [testNote];
      prismaMock.note.findMany.mockResolvedValue(notes);

      const result = await repository.findByContactId('contact123');
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Note);
      expect(result[0].getContactId()).toBe('contact123');
    });

    it('should return empty array when no notes found', async () => {
      prismaMock.note.findMany.mockResolvedValue([]);
      const result = await repository.findByContactId('contact123');
      expect(result).toHaveLength(0);
    });

    it('should throw error for empty contactId', async () => {
      await expect(repository.findByContactId('')).rejects.toThrow('Contact ID is required');
    });
  });

  describe('findByUserId', () => {
    it('should return notes for a user', async () => {
      const notes = [testNote];
      prismaMock.note.findMany.mockResolvedValue(notes);

      const result = await repository.findByUserId('user123');
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Note);
      expect(result[0].getUserId()).toBe('user123');
    });

    it('should return empty array when no notes found', async () => {
      prismaMock.note.findMany.mockResolvedValue([]);
      const result = await repository.findByUserId('user123');
      expect(result).toHaveLength(0);
    });

    it('should throw error for empty userId', async () => {
      await expect(repository.findByUserId('')).rejects.toThrow('User ID is required');
    });
  });

  describe('deleteByContactId', () => {
    it('should delete all notes for a contact', async () => {
      await repository.deleteByContactId('contact123');
      expect(prismaMock.note.deleteMany).toHaveBeenCalledWith({
        where: { contactId: 'contact123' },
      });
    });

    it('should throw error for empty contactId', async () => {
      await expect(repository.deleteByContactId('')).rejects.toThrow('Contact ID is required');
    });
  });

  describe('mapToEntity', () => {
    it('should throw error for null data', () => {
      expect(() => repository['mapToEntity'](null as any)).toThrow(
        'Cannot map null or undefined data to Note entity',
      );
    });
  });
});
