import config from '../../infrastructure/config';

export interface ProfilePictureProps {
  filename: string;
}

export class ProfilePicture {
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

  toJSON() {
    return {
      url: `${config.uploads.profilePictures.url}/${this.filename}`,
    };
  }
}
