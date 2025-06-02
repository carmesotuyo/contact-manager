import { Email } from '../value-objects/Email';

export interface UserData {
  id?: string;
  email: string;
  password: string;
}

export class User {
  constructor(
    readonly id: string,
    private email: Email,
    private password: string,
  ) {}

  static create(data: UserData): User {
    const email = Email.create(data.email);
    return new User(data.id || crypto.randomUUID(), email, data.password);
  }

  getEmail(): string {
    return this.email.getValue();
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email.getValue(),
    };
  }
}
