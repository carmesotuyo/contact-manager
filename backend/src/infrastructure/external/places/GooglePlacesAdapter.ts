import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js';
import { IPlacesService } from '../../../domain/ports/IPlacesService';
import { Address } from '../../../domain/value-objects/Address';
import config from '../../config';

interface PlaceCandidate {
  place_id?: string;
  formatted_address?: string;
}

export class GooglePlacesAdapter implements IPlacesService {
  private readonly client: Client;

  constructor() {
    this.client = new Client({});
  }

  async validateAddress(address: string): Promise<Address> {
    try {
      if (!address.trim()) {
        throw new Error('Address is required');
      }

      const response = await this.client.findPlaceFromText({
        params: {
          input: address,
          inputtype: PlaceInputType.textQuery,
          key: config.googlePlacesApiKey,
          fields: ['place_id', 'formatted_address'],
        },
      });

      if (response.data.candidates.length === 0) {
        throw new Error('Address not found');
      }

      const place = response.data.candidates[0] as PlaceCandidate;
      if (!place.place_id || !place.formatted_address) {
        throw new Error('Invalid place data received');
      }

      return Address.create({
        placeId: place.place_id,
        formattedAddress: place.formatted_address,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to validate address');
    }
  }

  async getPlaceById(placeId: string): Promise<Address> {
    try {
      if (!placeId.trim()) {
        throw new Error('Place ID is required');
      }

      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          key: config.googlePlacesApiKey,
          fields: ['place_id', 'formatted_address'],
        },
      });

      const place = response.data.result as PlaceCandidate;
      if (!place.place_id || !place.formatted_address) {
        throw new Error('Invalid place data received');
      }

      return Address.create({
        placeId: place.place_id,
        formattedAddress: place.formatted_address,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch place details');
    }
  }

  async searchPlaces(query: string): Promise<Address[]> {
    try {
      if (!query.trim()) {
        throw new Error('Search query is required');
      }

      const response = await this.client.findPlaceFromText({
        params: {
          input: query,
          inputtype: PlaceInputType.textQuery,
          key: config.googlePlacesApiKey,
          fields: ['place_id', 'formatted_address'],
        },
      });

      if (response.data.candidates.length === 0) {
        return [];
      }

      return response.data.candidates
        .filter((candidate: unknown): candidate is PlaceCandidate => {
          const place = candidate as PlaceCandidate;
          return !!place.place_id && !!place.formatted_address;
        })
        .map((place) =>
          Address.create({
            placeId: place.place_id!,
            formattedAddress: place.formatted_address!,
          }),
        );
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to search places');
    }
  }
}
