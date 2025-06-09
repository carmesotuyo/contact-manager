import { Request, Response } from 'express';
import { INoteService } from '../../../../application/ports/INoteService';
import { NoteController } from '../NoteController';
import { NoteResponseDTO, NoteListResponseDTO } from '../../../../application/dtos/notes.dto';

describe('NoteController', () => {
  let mockNoteService: jest.Mocked<Omit<INoteService, 'getNotesByContact'>>;
  let noteController: NoteController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockNoteService = {
      createNote: jest.fn(),
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
      getNotesByUser: jest.fn(),
      searchNotes: jest.fn(),
    };

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockSend = jest.fn();

    mockResponse = {
      json: mockJson,
      status: mockStatus,
      send: mockSend,
    };

    noteController = new NoteController(mockNoteService as unknown as INoteService);
  });

  describe('createNote', () => {
    const mockNote: NoteResponseDTO = {
      id: 'note123',
      userId: 'user123',
      contactId: 'contact123',
      text: 'Test note',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockRequest = {
        user: { id: 'user123' },
        body: {
          contactId: 'contact123',
          text: 'Test note',
        },
      };
    });

    it('should create note successfully', async () => {
      mockNoteService.createNote.mockResolvedValue(mockNote);

      await noteController.createNote(mockRequest as Request, mockResponse as Response);

      expect(mockNoteService.createNote).toHaveBeenCalledWith({
        userId: 'user123',
        contactId: 'contact123',
        text: 'Test note',
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockNote);
    });

    it('should return 400 if user not found', async () => {
      mockRequest.user = undefined;

      await noteController.createNote(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
      expect(mockNoteService.createNote).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockNoteService.createNote.mockRejectedValue(new Error('Invalid note data'));

      await noteController.createNote(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Invalid note data' });
    });
  });

  describe('updateNote', () => {
    const mockNote: NoteResponseDTO = {
      id: 'note123',
      userId: 'user123',
      contactId: 'contact123',
      text: 'Updated note',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockRequest = {
        user: { id: 'user123' },
        params: { noteId: 'note123' },
        body: { text: 'Updated note' },
      };
    });

    it('should update note successfully', async () => {
      mockNoteService.updateNote.mockResolvedValue(mockNote);

      await noteController.updateNote(mockRequest as Request, mockResponse as Response);

      expect(mockNoteService.updateNote).toHaveBeenCalledWith('note123', 'user123', {
        text: 'Updated note',
      });
      expect(mockJson).toHaveBeenCalledWith(mockNote);
    });

    it('should return 404 if note not found', async () => {
      mockNoteService.updateNote.mockRejectedValue(new Error('Note not found'));

      await noteController.updateNote(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Note not found' });
    });

    it('should return 400 if user not found', async () => {
      mockRequest.user = undefined;

      await noteController.updateNote(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
      expect(mockNoteService.updateNote).not.toHaveBeenCalled();
    });
  });

  describe('deleteNote', () => {
    beforeEach(() => {
      mockRequest = {
        user: { id: 'user123' },
        params: { noteId: 'note123' },
      };
    });

    it('should delete note successfully', async () => {
      mockNoteService.deleteNote.mockResolvedValue();

      await noteController.deleteNote(mockRequest as Request, mockResponse as Response);

      expect(mockNoteService.deleteNote).toHaveBeenCalledWith('note123', 'user123');
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 404 if note not found', async () => {
      mockNoteService.deleteNote.mockRejectedValue(new Error('Note not found'));

      await noteController.deleteNote(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Note not found' });
    });

    it('should return 400 if user not found', async () => {
      mockRequest.user = undefined;

      await noteController.deleteNote(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
      expect(mockNoteService.deleteNote).not.toHaveBeenCalled();
    });
  });

  describe('getNotesByUser', () => {
    const mockNoteList: NoteListResponseDTO = {
      items: [
        {
          id: 'note123',
          userId: 'user123',
          contactId: 'contact123',
          text: 'Test note',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    };

    beforeEach(() => {
      mockRequest = {
        user: { id: 'user123' },
        query: { page: '1', limit: '10' },
      };
    });

    it('should get notes by user successfully', async () => {
      mockNoteService.getNotesByUser.mockResolvedValue(mockNoteList);

      await noteController.getNotesByUser(mockRequest as Request, mockResponse as Response);

      expect(mockNoteService.getNotesByUser).toHaveBeenCalledWith('user123', {
        page: 1,
        limit: 10,
      });
      expect(mockJson).toHaveBeenCalledWith(mockNoteList);
    });

    it('should return 400 if user not found', async () => {
      mockRequest.user = undefined;

      await noteController.getNotesByUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
      expect(mockNoteService.getNotesByUser).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockNoteService.getNotesByUser.mockRejectedValue(new Error('Service error'));

      await noteController.getNotesByUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});
