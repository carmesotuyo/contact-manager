import { ProfilePicture, ProfilePictureProps } from '../ProfilePicture';

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

  describe('paths and urls', () => {
    let profilePicture: ProfilePicture;

    beforeEach(() => {
      profilePicture = ProfilePicture.create(validProps);
    });

    it('should generate correct file path', () => {
      expect(profilePicture.getPath()).toBe('public/uploads/profile-pictures/user123-profile.jpg');
    });

    it('should generate correct URL', () => {
      expect(profilePicture.getUrl()).toBe('/uploads/profile-pictures/user123-profile.jpg');
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation', () => {
      const profilePicture = ProfilePicture.create(validProps);
      const json = profilePicture.toJSON();

      expect(json).toEqual({
        url: '/uploads/profile-pictures/user123-profile.jpg',
      });
    });
  });
});
