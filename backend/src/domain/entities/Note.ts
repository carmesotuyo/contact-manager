export interface NoteData {
  id?: string;
  userId: string;
  contactId: string;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Note {
  constructor(
    readonly id: string,
    private userId: string,
    private contactId: string,
    private text: string,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(data: NoteData): Note {
    if (!data.text?.trim()) {
      throw new Error('Note text cannot be empty');
    }

    const now = new Date();
    return new Note(
      data.id || crypto.randomUUID(),
      data.userId,
      data.contactId,
      data.text.trim(),
      data.createdAt || now,
      data.updatedAt || now,
    );
  }

  getUserId(): string {
    return this.userId;
  }

  getContactId(): string {
    return this.contactId;
  }

  getText(): string {
    return this.text;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updateText(text: string): void {
    if (!text?.trim()) {
      throw new Error('Note text cannot be empty');
    }
    this.text = text.trim();
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      contactId: this.contactId,
      text: this.text,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
