import { Address } from '../value-objects/Address';
import { ProfilePicture } from '../value-objects/ProfilePicture';

export interface ContactData {
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address?: Address;
  profilePicture?: ProfilePicture;
}

export class Contact {
  constructor(
    readonly id: string,
    private userId: string,
    private name: string,
    private email: string,
    private phone: string,
    private address?: Address,
    private profilePicture?: ProfilePicture,
  ) {}

  static create(data: ContactData): Contact {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    const phoneRegex = /^\+?[\d\s-()]{8,}$/;
    if (!data.phone || !phoneRegex.test(data.phone)) {
      throw new Error('Phone number must be at least 6 characters long');
    }

    return new Contact(
      data.id || crypto.randomUUID(),
      data.userId,
      data.name.trim(),
      data.email.toLowerCase(),
      data.phone.trim(),
      data.address,
      data.profilePicture,
    );
  }

  getUserId(): string {
    return this.userId;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getPhone(): string {
    return this.phone;
  }

  getAddress(): Address | undefined {
    return this.address;
  }

  getProfilePicture(): ProfilePicture | undefined {
    return this.profilePicture;
  }

  updateDetails(data: Partial<Omit<ContactData, 'id' | 'userId'>>): void {
    if (data.name && data.name.trim().length >= 2) {
      this.name = data.name.trim();
    }

    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Invalid email format');
      }
      this.email = data.email.toLowerCase();
    }

    if (data.phone) {
      const phoneRegex = /^\+?[\d\s-()]{8,}$/;
      if (!phoneRegex.test(data.phone)) {
        throw new Error('Phone number must be at least 6 characters long');
      }
      this.phone = data.phone.trim();
    }

    if (data.address) {
      this.address = data.address;
    }

    if (data.profilePicture) {
      this.profilePicture = data.profilePicture;
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address?.toJSON(),
      profilePicture: this.profilePicture?.toJSON(),
    };
  }
}
