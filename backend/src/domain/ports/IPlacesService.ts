import { Address } from '../value-objects/Address';

export interface IPlacesService {
  validateAddress(address: string): Promise<Address>;
  getPlaceById(placeId: string): Promise<Address>;
  searchPlaces(query: string): Promise<Address[]>;
}
