export class PhoneNumber {
  private constructor(private readonly value: string) {}

  static create(phone: string): PhoneNumber {
    if (!phone || !phone.trim()) {
      throw new Error('Phone number is required');
    }

    // Remove whitespace but keep formatting characters
    const cleaned = phone.trim().replace(/\s+/g, '');

    // Accepts:
    // - Optional + at start
    // - Digits, dashes, and parentheses
    // - Minimum 8 digits (not counting formatting)
    // Examples: +1(555)123-4567, 555-123-4567, +442071234567
    const phoneRegex = /^\+?[\d()-]{8,}$/;
    if (!phoneRegex.test(cleaned)) {
      throw new Error('Invalid phone number format');
    }

    return new PhoneNumber(cleaned);
  }

  getValue(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
