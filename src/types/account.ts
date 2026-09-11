export type AccountType =
  | 'checking'
  | 'savings'
  | 'credit_card'
  | 'cash'
  | 'upi'
  | 'investment'
  | 'loan';

export interface Account {
  id: string;
  userId?: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  institution?: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  isLiability?: boolean;
  creditLimit?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountTransferPayload {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  description?: string;
  fee?: number;
}
