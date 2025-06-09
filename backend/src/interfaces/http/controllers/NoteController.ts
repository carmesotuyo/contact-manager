import { Request, Response } from 'express';
import { INoteService } from '../../../application/ports/INoteService';
import { NoteSearchDTO } from '../../../application/dtos/notes.dto';

export class NoteController {
  constructor(private readonly noteService: INoteService) {}

  async createNote(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User not found' });
        return;
      }

      const userId = req.user.id;
      const result = await this.noteService.createNote({
        ...req.body,
        userId,
      });

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateNote(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User not found' });
        return;
      }

      const userId = req.user.id;
      const noteId = req.params.noteId;

      const result = await this.noteService.updateNote(noteId, userId, req.body);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Note not found') {
          res.status(404).json({ message: error.message });
          return;
        }
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteNote(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User not found' });
        return;
      }

      const userId = req.user.id;
      const noteId = req.params.noteId;

      await this.noteService.deleteNote(noteId, userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Note not found') {
          res.status(404).json({ message: error.message });
          return;
        }
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getNotesByUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User not found' });
        return;
      }

      const userId = req.user.id;
      const searchCriteria: NoteSearchDTO = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await this.noteService.getNotesByUser(userId, searchCriteria);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
