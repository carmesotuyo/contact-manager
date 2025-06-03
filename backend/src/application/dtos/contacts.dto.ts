import { SearchResult } from '../../domain/ports/IBaseRepository';

export interface CreateContactDTO {
  userId: string;
  name: string;
  email: string;
  phone: string;
  address?: {
    placeId: string;
    formattedAddress: string;
  };
  profilePicture?: {
    filename: string;
  };
}

export interface UpdateContactDTO {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    placeId: string;
    formattedAddress: string;
  };
  profilePicture?: {
    filename: string;
  };
}

export interface ContactSearchDTO {
  userId?: string;
  query?: string;
  page?: number;
  limit?: number;
}

export interface ContactResponseDTO {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address?: {
    placeId: string;
    formattedAddress: string;
  };
  profilePicture?: {
    url: string;
  };
}

export interface ContactListResponseDTO {
  items: ContactResponseDTO[];
  total: number;
  page: number;
  limit: number;
}
