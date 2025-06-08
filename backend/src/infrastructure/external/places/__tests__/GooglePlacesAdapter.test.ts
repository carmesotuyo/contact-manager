import { PlaceInputType } from '@googlemaps/google-maps-services-js';
import { GooglePlacesAdapter } from '../GooglePlacesAdapter';
import { Address } from '../../../../domain/value-objects/Address';

jest.mock('../../../config', () => ({
  __esModule: true,
  default: {
    googlePlacesApiKey: 'test-api-key',
  },
}));

const mockFindPlaceFromText = jest.fn();
const mockPlaceDetails = jest.fn();

jest.mock('@googlemaps/google-maps-services-js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    findPlaceFromText: mockFindPlaceFromText,
    placeDetails: mockPlaceDetails,
  })),
  PlaceInputType: {
    textQuery: 'textQuery',
  },
}));

describe('GooglePlacesAdapter', () => {
  let adapter: GooglePlacesAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new GooglePlacesAdapter();
  });

  describe('validateAddress', () => {
    const validAddress = '123 Main St';
    const validResponse = {
      data: {
        candidates: [
          {
            place_id: 'place123',
            formatted_address: '123 Main Street, City, Country',
          },
        ],
      },
    };

    it('should validate a valid address', async () => {
      mockFindPlaceFromText.mockResolvedValueOnce(validResponse);

      const result = await adapter.validateAddress(validAddress);

      expect(mockFindPlaceFromText).toHaveBeenCalledWith({
        params: {
          input: validAddress,
          inputtype: PlaceInputType.textQuery,
          key: 'test-api-key',
          fields: ['place_id', 'formatted_address'],
        },
      });
      expect(result).toBeInstanceOf(Address);
      expect(result).toEqual(
        Address.create({
          placeId: 'place123',
          formattedAddress: '123 Main Street, City, Country',
        }),
      );
    });

    it('should throw error for empty address', async () => {
      await expect(adapter.validateAddress('')).rejects.toThrow('Address is required');
      expect(mockFindPlaceFromText).not.toHaveBeenCalled();
    });

    it('should throw error when no candidates found', async () => {
      mockFindPlaceFromText.mockResolvedValueOnce({
        data: { candidates: [] },
      });

      await expect(adapter.validateAddress(validAddress)).rejects.toThrow('Address not found');
    });

    it('should throw error when place data is invalid', async () => {
      mockFindPlaceFromText.mockResolvedValueOnce({
        data: {
          candidates: [{ place_id: null, formatted_address: null }],
        },
      });

      await expect(adapter.validateAddress(validAddress)).rejects.toThrow(
        'Invalid place data received',
      );
    });
  });

  describe('getPlaceById', () => {
    const validPlaceId = 'place123';
    const validResponse = {
      data: {
        result: {
          place_id: 'place123',
          formatted_address: '123 Main Street, City, Country',
        },
      },
    };

    it('should fetch place details by ID', async () => {
      mockPlaceDetails.mockResolvedValueOnce(validResponse);

      const result = await adapter.getPlaceById(validPlaceId);

      expect(mockPlaceDetails).toHaveBeenCalledWith({
        params: {
          place_id: validPlaceId,
          key: 'test-api-key',
          fields: ['place_id', 'formatted_address'],
        },
      });
      expect(result).toBeInstanceOf(Address);
      expect(result).toEqual(
        Address.create({
          placeId: 'place123',
          formattedAddress: '123 Main Street, City, Country',
        }),
      );
    });

    it('should throw error for empty place ID', async () => {
      await expect(adapter.getPlaceById('')).rejects.toThrow('Place ID is required');
      expect(mockPlaceDetails).not.toHaveBeenCalled();
    });

    it('should throw error when place data is invalid', async () => {
      mockPlaceDetails.mockResolvedValueOnce({
        data: {
          result: { place_id: null, formatted_address: null },
        },
      });

      await expect(adapter.getPlaceById(validPlaceId)).rejects.toThrow(
        'Invalid place data received',
      );
    });
  });

  describe('searchPlaces', () => {
    const validQuery = 'coffee shop';
    const validResponse = {
      data: {
        candidates: [
          {
            place_id: 'place123',
            formatted_address: '123 Main Street, City, Country',
          },
          {
            place_id: 'place456',
            formatted_address: '456 Oak Street, City, Country',
          },
        ],
      },
    };

    it('should search places with valid query', async () => {
      mockFindPlaceFromText.mockResolvedValueOnce(validResponse);

      const results = await adapter.searchPlaces(validQuery);

      expect(mockFindPlaceFromText).toHaveBeenCalledWith({
        params: {
          input: validQuery,
          inputtype: PlaceInputType.textQuery,
          key: 'test-api-key',
          fields: ['place_id', 'formatted_address'],
        },
      });
      expect(results).toHaveLength(2);
      results.forEach((result) => {
        expect(result).toBeInstanceOf(Address);
      });
      expect(results[0]).toEqual(
        Address.create({
          placeId: 'place123',
          formattedAddress: '123 Main Street, City, Country',
        }),
      );
    });

    it('should throw error for empty query', async () => {
      await expect(adapter.searchPlaces('')).rejects.toThrow('Search query is required');
      expect(mockFindPlaceFromText).not.toHaveBeenCalled();
    });

    it('should return empty array when no places found', async () => {
      mockFindPlaceFromText.mockResolvedValueOnce({
        data: { candidates: [] },
      });

      const results = await adapter.searchPlaces(validQuery);
      expect(results).toEqual([]);
    });

    it('should filter out invalid place data', async () => {
      mockFindPlaceFromText.mockResolvedValueOnce({
        data: {
          candidates: [
            { place_id: 'place123', formatted_address: '123 Main St' },
            { place_id: null, formatted_address: null },
            { place_id: 'place456', formatted_address: '456 Oak St' },
          ],
        },
      });

      const results = await adapter.searchPlaces(validQuery);
      expect(results).toHaveLength(2);
      expect(results[0].getPlaceId()).toBe('place123');
      expect(results[1].getPlaceId()).toBe('place456');
    });
  });
});
