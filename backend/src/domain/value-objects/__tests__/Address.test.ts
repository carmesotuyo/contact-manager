import { Address, AddressProps } from '../Address';

describe('Address Value Object', () => {
  const validProps: AddressProps = {
    placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    formattedAddress: '123 Main St, City, Country',
  };

  describe('create', () => {
    it('should create a valid address', () => {
      const address = Address.create(validProps);
      expect(address).toBeInstanceOf(Address);
      expect(address.getPlaceId()).toBe('ChIJN1t_tDeuEmsRUsoyG83frY4');
      expect(address.getFormattedAddress()).toBe('123 Main St, City, Country');
    });

    it('should throw error for missing placeId', () => {
      expect(() => Address.create({ ...validProps, placeId: '' })).toThrow(
        'Invalid address properties',
      );
    });

    it('should throw error for missing formattedAddress', () => {
      expect(() => Address.create({ ...validProps, formattedAddress: '' })).toThrow(
        'Invalid address properties',
      );
    });

    it('should trim whitespace from address', () => {
      const address = Address.create({
        placeId: validProps.placeId,
        formattedAddress: '  123 Main St  ',
      });
      expect(address.getFormattedAddress()).toBe('123 Main St');
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation', () => {
      const address = Address.create(validProps);
      const json = address.toJSON();

      expect(json).toEqual({
        placeId: validProps.placeId,
        formattedAddress: validProps.formattedAddress,
      });
    });
  });
});
