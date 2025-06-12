import { ProfilePicture, ProfilePictureProps } from '../ProfilePicture';
import config from '../../../infrastructure/config';

describe('ProfilePicture Value Object', () => {
  const validProps: ProfilePictureProps = {
    filename: 'user123-profile.jpg',
  };

  describe('create', () => {
    it('should create a valid profile picture', () => {
      const profilePicture = ProfilePicture.create(validProps);
      expect(profilePicture).toBeInstanceOf(ProfilePicture);
      expect(profilePicture.getFilename()).toBe('user123-profile.jpg');
    });

    it('should throw error for empty filename', () => {
      expect(() => ProfilePicture.create({ filename: '' })).toThrow('Filename cannot be empty');
    });

    it('should throw error for undefined filename', () => {
      expect(() => ProfilePicture.create({ filename: undefined as any })).toThrow(
        'Filename cannot be empty',
      );
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation', () => {
      const profilePicture = ProfilePicture.create(validProps);
      const json = profilePicture.toJSON();

      expect(json).toEqual({
        url: `${config.uploads.profilePictures.url}/${validProps.filename}`,
      });
    });
  });
});
