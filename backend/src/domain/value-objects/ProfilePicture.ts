export interface ProfilePictureProps {
  filename: string; // e.g., "user123-profile.jpg"
}

export class ProfilePicture {
  private static readonly UPLOADS_DIR = 'public/uploads/profile-pictures';

  constructor(private readonly filename: string) {}

  static create(props: ProfilePictureProps): ProfilePicture {
    if (!props.filename?.trim()) {
      throw new Error('Filename cannot be empty');
    }
    return new ProfilePicture(props.filename.trim());
  }

  getFilename(): string {
    return this.filename;
  }

  getPath(): string {
    return `${ProfilePicture.UPLOADS_DIR}/${this.filename}`;
  }

  getUrl(): string {
    return `/uploads/profile-pictures/${this.filename}`;
  }

  toJSON() {
    return {
      url: this.getUrl(),
    };
  }
}
