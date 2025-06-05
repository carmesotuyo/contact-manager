import { Note } from '../../../domain/entities/Note';
import { Contact } from '../../../domain/entities/Contact';
import { INoteRepository } from '../../../domain/ports/INoteRepository';
import { IContactRepository } from '../../../domain/ports/IContactRepository';
import { NoteService } from '../NoteService';

describe('NoteService', () => {
  let noteService: NoteService;
  let mockNoteRepository: jest.Mocked<INoteRepository>;
  let mockContactRepository: jest.Mocked<IContactRepository>;
  let userId: string;
  let contactId: string;
  let noteId: string;
  let testContact: Contact;
  let testNote: Note;

  beforeEach(() => {
    mockNoteRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findByContactId: jest.fn(),
      findByUserId: jest.fn(),
      deleteByContactId: jest.fn(),
    };

    mockContactRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findByUserId: jest.fn(),
    };

    noteService = new NoteService(mockNoteRepository, mockContactRepository);

    userId = 'user123';
    contactId = 'contact123';
    noteId = 'note123';

    testContact = Contact.create({
      userId,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
    });
    Object.defineProperty(testContact, 'id', { value: contactId });

    testNote = Note.create({
      userId,
      contactId,
      text: 'Test note',
    });
    Object.defineProperty(testNote, 'id', { value: noteId });
  });

  describe('createNote', () => {
    beforeEach(() => {
      mockContactRepository.findById.mockResolvedValue(testContact);
      mockNoteRepository.save.mockResolvedValue(testNote);
    });

    it('should create a note successfully', async () => {
      const noteData = {
        userId,
        contactId,
        text: 'Test note',
      };

      const result = await noteService.createNote(noteData);

      expect(result).toEqual({
        id: testNote.id,
        userId: testNote.getUserId(),
        contactId: testNote.getContactId(),
        text: testNote.getText(),
        createdAt: testNote.getCreatedAt(),
        updatedAt: testNote.getUpdatedAt(),
      });
      expect(mockContactRepository.findById).toHaveBeenCalledWith(contactId);
      expect(mockNoteRepository.save).toHaveBeenCalled();
    });

    it('should throw error if contact not found', async () => {
      mockContactRepository.findById.mockResolvedValue(null);

      await expect(
        noteService.createNote({
          userId,
          contactId: 'non-existent',
          text: 'Test note',
        }),
      ).rejects.toThrow('Contact not found');
      expect(mockNoteRepository.save).not.toHaveBeenCalled();
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
        noteService.createNote({
          userId,
          contactId: differentUserContact.id,
          text: 'Test note',
        }),
      ).rejects.toThrow('Contact not found');
      expect(mockNoteRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateNote', () => {
    beforeEach(() => {
      mockNoteRepository.findById.mockResolvedValue(testNote);
      mockNoteRepository.save.mockImplementation((n) => Promise.resolve(n));
    });

    it('should update note text successfully', async () => {
      const updateData = {
        text: 'Updated text',
      };

      const result = await noteService.updateNote(noteId, userId, updateData);

      expect(result.text).toBe(updateData.text);
      expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
      expect(mockNoteRepository.save).toHaveBeenCalled();
    });

    it('should throw error if note not found', async () => {
      mockNoteRepository.findById.mockResolvedValue(null);

      await expect(
        noteService.updateNote('non-existent', userId, { text: 'New text' }),
      ).rejects.toThrow('Note not found');
      expect(mockNoteRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error if note belongs to different user', async () => {
      const differentUserNote = Note.create({
        userId: 'different-user',
        contactId,
        text: 'Test note',
      });

      mockNoteRepository.findById.mockResolvedValue(differentUserNote);

      await expect(
        noteService.updateNote(differentUserNote.id, userId, { text: 'New text' }),
      ).rejects.toThrow('Note not found');
      expect(mockNoteRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteNote', () => {
    it('should delete note successfully', async () => {
      mockNoteRepository.findById.mockResolvedValue(testNote);

      await noteService.deleteNote(noteId, userId);

      expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
      expect(mockNoteRepository.delete).toHaveBeenCalledWith(noteId);
    });

    it('should throw error if note not found', async () => {
      mockNoteRepository.findById.mockResolvedValue(null);

      await expect(noteService.deleteNote('non-existent', userId)).rejects.toThrow(
        'Note not found',
      );
      expect(mockNoteRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error if note belongs to different user', async () => {
      const differentUserNote = Note.create({
        userId: 'different-user',
        contactId,
        text: 'Test note',
      });

      mockNoteRepository.findById.mockResolvedValue(differentUserNote);

      await expect(noteService.deleteNote(differentUserNote.id, userId)).rejects.toThrow(
        'Note not found',
      );
      expect(mockNoteRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getNotesByContact', () => {
    beforeEach(() => {
      mockContactRepository.findById.mockResolvedValue(testContact);
    });

    it('should return notes with pagination', async () => {
      const notes = [
        testNote,
        Note.create({
          userId,
          contactId,
          text: 'Another note',
        }),
      ];

      mockNoteRepository.findAll.mockResolvedValue({
        items: notes,
        total: 2,
        page: 1,
        limit: 20,
      });

      const result = await noteService.getNotesByContact(contactId, userId, { page: 1, limit: 20 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockNoteRepository.findAll).toHaveBeenCalledWith({
        contactId,
        page: 1,
        limit: 20,
      });
    });

    it('should throw error if contact not found', async () => {
      mockContactRepository.findById.mockResolvedValue(null);

      await expect(noteService.getNotesByContact('non-existent', userId)).rejects.toThrow(
        'Contact not found',
      );
      expect(mockNoteRepository.findAll).not.toHaveBeenCalled();
    });

    it('should throw error if contact belongs to different user', async () => {
      const differentUserContact = Contact.create({
        userId: 'different-user',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      });

      mockContactRepository.findById.mockResolvedValue(differentUserContact);

      await expect(noteService.getNotesByContact(differentUserContact.id, userId)).rejects.toThrow(
        'Contact not found',
      );
      expect(mockNoteRepository.findAll).not.toHaveBeenCalled();
    });
  });

  describe('getNotesByUser', () => {
    it('should return notes with pagination', async () => {
      const notes = [
        testNote,
        Note.create({
          userId,
          contactId,
          text: 'Another note',
        }),
      ];

      mockNoteRepository.findAll.mockResolvedValue({
        items: notes,
        total: 2,
        page: 1,
        limit: 20,
      });

      const result = await noteService.getNotesByUser(userId, { page: 1, limit: 20 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockNoteRepository.findAll).toHaveBeenCalledWith({
        userId,
        page: 1,
        limit: 20,
      });
    });

    it('should use default pagination values', async () => {
      mockNoteRepository.findAll.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      const result = await noteService.getNotesByUser(userId);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockNoteRepository.findAll).toHaveBeenCalledWith({
        userId,
        page: 1,
        limit: 20,
      });
    });

    it('should filter by contactId', async () => {
      mockNoteRepository.findAll.mockResolvedValue({
        items: [testNote],
        total: 1,
        page: 1,
        limit: 20,
      });

      const result = await noteService.getNotesByUser(userId, { contactId, page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(mockNoteRepository.findAll).toHaveBeenCalledWith({
        userId,
        contactId,
        page: 1,
        limit: 20,
      });
    });
  });

  describe('searchNotes', () => {
    it('should search notes with pagination', async () => {
      const notes = [
        testNote,
        Note.create({
          userId: 'user2',
          contactId: 'contact2',
          text: 'Another note',
        }),
      ];

      mockNoteRepository.findAll.mockResolvedValue({
        items: notes,
        total: 2,
        page: 1,
        limit: 20,
      });

      const result = await noteService.searchNotes({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockNoteRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
    });

    it('should filter by userId and contactId', async () => {
      mockNoteRepository.findAll.mockResolvedValue({
        items: [testNote],
        total: 1,
        page: 1,
        limit: 20,
      });

      const result = await noteService.searchNotes({ userId, contactId });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockNoteRepository.findAll).toHaveBeenCalledWith({
        userId,
        contactId,
        page: 1,
        limit: 20,
      });
    });

    it('should use default pagination values', async () => {
      mockNoteRepository.findAll.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      const result = await noteService.searchNotes({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockNoteRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
    });
  });
});
