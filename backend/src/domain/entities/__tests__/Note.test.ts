import { Note, NoteData } from '../Note';

describe('Note Entity', () => {
  const validNoteData: NoteData = {
    userId: 'user1',
    contactId: 'contact1',
    text: 'Test note 1',
  };

  describe('create', () => {
    it('should create a valid note', () => {
      const note = Note.create(validNoteData);
      expect(note).toBeInstanceOf(Note);
      expect(note.getText()).toBe('Test note 1');
      expect(note.getUserId()).toBe('user1');
      expect(note.getContactId()).toBe('contact1');
    });

    it('should generate an id if not provided', () => {
      const note = Note.create(validNoteData);
      expect(note.id).toBeDefined();
      expect(typeof note.id).toBe('string');
    });

    it('should set timestamps if not provided', () => {
      const note = Note.create(validNoteData);
      expect(note.getCreatedAt()).toBeInstanceOf(Date);
      expect(note.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should use provided timestamps', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');
      const note = Note.create({ ...validNoteData, createdAt, updatedAt });
      expect(note.getCreatedAt()).toBe(createdAt);
      expect(note.getUpdatedAt()).toBe(updatedAt);
    });

    it('should throw error for empty text', () => {
      expect(() => Note.create({ ...validNoteData, text: '' })).toThrow(
        'Note text cannot be empty',
      );
    });

    it('should throw error for whitespace-only text', () => {
      expect(() => Note.create({ ...validNoteData, text: '   ' })).toThrow(
        'Note text cannot be empty',
      );
    });

    it('should trim text', () => {
      const note = Note.create({ ...validNoteData, text: '  trimmed text  ' });
      expect(note.getText()).toBe('trimmed text');
    });
  });

  describe('updateText', () => {
    let note: Note;

    beforeEach(() => {
      note = Note.create(validNoteData);
    });

    it('should update text and updatedAt', async () => {
      const oldUpdatedAt = note.getUpdatedAt();
      await new Promise((resolve) => setTimeout(resolve, 1)); // Add 1ms delay
      note.updateText('Updated text');
      expect(note.getText()).toBe('Updated text');
      expect(note.getUpdatedAt().getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
    });

    it('should throw error for empty text', () => {
      expect(() => note.updateText('')).toThrow('Note text cannot be empty');
    });

    it('should throw error for whitespace-only text', () => {
      expect(() => note.updateText('   ')).toThrow('Note text cannot be empty');
    });

    it('should trim text', () => {
      note.updateText('  updated text  ');
      expect(note.getText()).toBe('updated text');
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation', () => {
      const note = Note.create(validNoteData);
      const json = note.toJSON();

      expect(json).toEqual({
        id: note.id,
        userId: validNoteData.userId,
        contactId: validNoteData.contactId,
        text: validNoteData.text,
        createdAt: note.getCreatedAt(),
        updatedAt: note.getUpdatedAt(),
      });
    });
  });
});
