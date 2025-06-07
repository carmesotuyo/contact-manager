import { Contact } from '../../../../domain/entities/Contact';
import {
  IContactRepository,
  ContactSearchCriteria,
} from '../../../../domain/ports/IContactRepository';
import { SearchResult } from '../../../../domain/ports/IBaseRepository';
import { prisma } from '../client';
import { Address } from '../../../../domain/value-objects/Address';
import { ProfilePicture } from '../../../../domain/value-objects/ProfilePicture';
import { Email } from '../../../../domain/value-objects/Email';
import { PhoneNumber } from '../../../../domain/value-objects/PhoneNumber';

type PrismaContact = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  placeId: string | null;
  formattedAddress: string | null;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class PrismaContactRepository implements IContactRepository {
  async findById(id: string): Promise<Contact | null> {
    try {
      const contact = await prisma.contact.findUnique({
        where: { id },
      });

      return contact ? this.mapToEntity(contact) : null;
    } catch (error) {
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Contact[]> {
    try {
      const contacts = await prisma.contact.findMany({
        where: { userId },
      });

      return contacts.map((contact: PrismaContact) => this.mapToEntity(contact));
    } catch (error) {
      throw error;
    }
  }

  async save(contact: Contact): Promise<Contact> {
    try {
      const data = {
        id: contact.id,
        userId: contact.getUserId(),
        name: contact.getName(),
        email: contact.getEmail(),
        phone: contact.getPhone(),
        placeId: contact.getAddress()?.getPlaceId() || null,
        formattedAddress: contact.getAddress()?.getFormattedAddress() || null,
        profilePicture: contact.getProfilePicture()?.getUrl() || null,
      };

      const saved = await prisma.contact.upsert({
        where: { id: contact.id },
        update: data,
        create: data,
      });

      return this.mapToEntity(saved);
    } catch (error) {
      throw error;
    }
  }

  async findAll(criteria: ContactSearchCriteria): Promise<SearchResult<Contact>> {
    try {
      const { userId, query, page = 1, limit = 10 } = criteria;
      const validPage = Math.max(1, page);
      const validLimit = Math.max(1, Math.min(100, limit));
      const skip = (validPage - 1) * validLimit;

      const where = {
        userId,
        ...(query && {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query.toLowerCase(), mode: 'insensitive' as const } },
            { phone: { contains: query.replace(/\s+/g, ''), mode: 'insensitive' as const } },
          ],
        }),
      };

      const [contacts, total] = await Promise.all([
        prisma.contact.findMany({
          where,
          skip,
          take: validLimit,
          orderBy: { name: 'asc' },
        }),
        prisma.contact.count({ where }),
      ]);

      return {
        items: contacts.map((contact: PrismaContact) => this.mapToEntity(contact)),
        total,
        page: validPage,
        limit: validLimit,
      };
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.contact.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  async count(criteria: ContactSearchCriteria): Promise<number> {
    try {
      const { userId, query } = criteria;
      const where = {
        userId,
        ...(query && {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query.toLowerCase(), mode: 'insensitive' as const } },
            { phone: { contains: query.replace(/\s+/g, ''), mode: 'insensitive' as const } },
          ],
        }),
      };

      return prisma.contact.count({ where });
    } catch (error) {
      throw error;
    }
  }

  private mapToEntity(data: PrismaContact): Contact {
    if (!data) {
      throw new Error('Cannot map null or undefined data to Contact entity');
    }

    const address =
      data.placeId && data.formattedAddress
        ? Address.create({
            placeId: data.placeId,
            formattedAddress: data.formattedAddress,
          })
        : undefined;

    const profilePicture = data.profilePicture
      ? ProfilePicture.create({ filename: data.profilePicture })
      : undefined;

    return Contact.create({
      id: data.id,
      userId: data.userId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address,
      profilePicture,
    });
  }
}
