export interface UserData {
  id?: string;
  email: string;
  password: string;
}

export class User {
  constructor(
    readonly id: string,
    private email: string,
    private password: string,
  ) {}

  static create(data: UserData): User {
    if (!data.email || !data.email.trim()) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    return new User(data.id || crypto.randomUUID(), data.email.toLowerCase().trim(), data.password);
  }

  getEmail(): string {
    return this.email;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
    };
  }
}
