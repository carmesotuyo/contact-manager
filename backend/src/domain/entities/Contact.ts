import { Address } from '../value-objects/Address';
import { ProfilePicture } from '../value-objects/ProfilePicture';
import { Email } from '../value-objects/Email';
import { PhoneNumber } from '../value-objects/PhoneNumber';

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
    private email: Email,
    private phone: PhoneNumber,
    private address?: Address,
    private profilePicture?: ProfilePicture,
  ) {}

  static create(data: ContactData): Contact {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    const email = Email.create(data.email);
    const phone = PhoneNumber.create(data.phone);

    return new Contact(
      data.id || crypto.randomUUID(),
      data.userId,
      data.name.trim(),
      email,
      phone,
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
    return this.email.getValue();
  }

  getPhone(): string {
    return this.phone.getValue();
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
      this.email = Email.create(data.email);
    }

    if (data.phone) {
      this.phone = PhoneNumber.create(data.phone);
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
      email: this.email.getValue(),
      phone: this.phone.getValue(),
      address: this.address?.toJSON(),
      profilePicture: this.profilePicture?.toJSON(),
    };
  }
}
