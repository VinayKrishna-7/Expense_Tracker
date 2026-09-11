import { CurrencyCode } from './settings';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: CurrencyCode;
  createdAt: string;
}

export interface UserAccountRecord extends User {
  passwordHash: string;
}
