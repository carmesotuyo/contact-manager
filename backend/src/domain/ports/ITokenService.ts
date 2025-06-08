export interface TokenPayload {
  userId: string;
  email: string;
}

export interface ITokenService {
  generate(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
