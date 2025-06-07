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
  });

  describe('delete', () => {
    it('should delete note', async () => {
      await repository.delete('123');
      expect(prismaMock.note.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
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
  });
});
