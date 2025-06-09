import {
  CreateContactDTO,
  UpdateContactDTO,
  ContactSearchDTO,
  ContactResponseDTO,
  ContactListResponseDTO,
} from '../dtos/contacts.dto';

export interface IContactService {
  createContact(data: CreateContactDTO): Promise<ContactResponseDTO>;
  updateContact(id: string, userId: string, data: UpdateContactDTO): Promise<ContactResponseDTO>;
  deleteContact(id: string, userId: string): Promise<void>;
  getContactsByUser(userId: string, criteria?: ContactSearchDTO): Promise<ContactListResponseDTO>;
  searchContacts(criteria: ContactSearchDTO): Promise<ContactListResponseDTO>;
  getContactByIdAndValidateUser(id: string, userId: string): Promise<ContactResponseDTO>;
}
