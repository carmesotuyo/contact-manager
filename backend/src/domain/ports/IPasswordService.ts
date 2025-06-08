export interface IPasswordService {
  hash(password: string): Promise<string>;
  verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
