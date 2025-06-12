export interface AddressProps {
  placeId: string;
  formattedAddress: string;
}

export class Address {
  constructor(
    private readonly placeId: string,
    private readonly formattedAddress: string,
  ) {}

  static create(props: AddressProps): Address {
    if (!props.placeId || !props.formattedAddress?.trim()) {
      throw new Error('Invalid address properties');
    }
    return new Address(props.placeId, props.formattedAddress?.trim());
  }

  getPlaceId(): string {
    return this.placeId;
  }

  getFormattedAddress(): string {
    return this.formattedAddress;
  }

  toJSON() {
    return {
      placeId: this.placeId,
      formattedAddress: this.formattedAddress,
    };
  }
}
