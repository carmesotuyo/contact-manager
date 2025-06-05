import { Contact, ContactData } from '../../domain/entities/Contact';
import { IContactRepository } from '../../domain/ports/IContactRepository';
import { Address } from '../../domain/value-objects/Address';
import { ProfilePicture } from '../../domain/value-objects/ProfilePicture';
import {
  CreateContactDTO,
  UpdateContactDTO,
  ContactSearchDTO,
  ContactResponseDTO,
  ContactListResponseDTO,
} from '../dtos/contacts.dto';
import { IContactService } from '../ports/IContactService';

export class ContactService implements IContactService {
  constructor(private readonly contactRepository: IContactRepository) {}

  private mapContactToDTO(contact: Contact): ContactResponseDTO {
    const json = contact.toJSON();
    return {
      id: json.id,
      userId: json.userId,
      name: json.name,
      email: json.email,
      phone: json.phone,
      address: json.address,
      profilePicture: json.profilePicture,
    };
  }

  async createContact(data: CreateContactDTO): Promise<ContactResponseDTO> {
    const existingContact = await this.contactRepository.findAll({
      userId: data.userId,
      query: data.email,
      page: 1,
      limit: 1,
    });

    if (existingContact.items.length > 0) {
      throw new Error('You already have a contact with this email address');
    }

    const contactData: ContactData = {
      userId: data.userId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address ? Address.create(data.address) : undefined,
      profilePicture: data.profilePicture ? ProfilePicture.create(data.profilePicture) : undefined,
    };

    const contact = Contact.create(contactData);
    const savedContact = await this.contactRepository.save(contact);
    return this.mapContactToDTO(savedContact);
  }

  async updateContact(
    id: string,
    userId: string,
    data: UpdateContactDTO,
  ): Promise<ContactResponseDTO> {
    const contact = await this.contactRepository.findById(id);
    if (!contact || contact.getUserId() !== userId) {
      throw new Error('Contact not found');
    }

    if (data.email && data.email !== contact.getEmail()) {
      const existingContact = await this.contactRepository.findAll({
        userId,
        query: data.email,
        page: 1,
        limit: 1,
      });

      if (existingContact.items.length > 0 && existingContact.items[0].id !== id) {
        throw new Error('You already have another contact with this email address');
      }
    }

    contact.updateDetails({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address ? Address.create(data.address) : undefined,
      profilePicture: data.profilePicture ? ProfilePicture.create(data.profilePicture) : undefined,
    });

    const updatedContact = await this.contactRepository.save(contact);
    return this.mapContactToDTO(updatedContact);
  }

  async deleteContact(id: string, userId: string): Promise<void> {
    const contact = await this.contactRepository.findById(id);
    if (!contact || contact.getUserId() !== userId) {
      throw new Error('Contact not found');
    }

    await this.contactRepository.delete(id);
  }

  async getContactsByUser(
    userId: string,
    criteria: ContactSearchDTO = {},
  ): Promise<ContactListResponseDTO> {
    const result = await this.contactRepository.findAll({
      userId,
      query: criteria.query,
      page: criteria.page || 1,
      limit: criteria.limit || 20,
    });

    return {
      items: result.items.map((contact) => this.mapContactToDTO(contact)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  async searchContacts(criteria: ContactSearchDTO): Promise<ContactListResponseDTO> {
    const result = await this.contactRepository.findAll({
      ...criteria,
      page: criteria.page || 1,
      limit: criteria.limit || 20,
    });

    return {
      items: result.items.map((contact) => this.mapContactToDTO(contact)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
