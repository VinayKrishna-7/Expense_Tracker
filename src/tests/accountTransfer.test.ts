import { describe, it, expect, beforeEach } from 'vitest';
import { AccountService } from '../services/accountService';
import { StorageService } from '../services/storageService';

describe('Account Service & Inter-Account Transfers', () => {
  const testUserId = 'test_user_isolation_1';

  beforeEach(() => {
    StorageService.clearUserData(testUserId);
  });

  it('provisions default accounts for new user', () => {
    const accounts = AccountService.getAccounts(testUserId);
    expect(accounts.length).toBeGreaterThanOrEqual(1);
    expect(accounts[0].isDefault).toBe(true);
  });

  it('creates and tracks new accounts', () => {
    const newAccount = AccountService.createAccount(testUserId, {
      name: 'Crypto Vault',
      type: 'investment',
      balance: 5000,
      currency: 'USD',
    });

    expect(newAccount.id).toBeDefined();
    expect(newAccount.balance).toBe(5000);

    const accounts = AccountService.getAccounts(testUserId);
    expect(accounts.some((a) => a.name === 'Crypto Vault')).toBe(true);
  });

  it('executes atomic transfer between accounts and updates balances and transactions', () => {
    const fromAcc = AccountService.createAccount(testUserId, {
      name: 'Checking A',
      type: 'checking',
      balance: 1000,
      currency: 'USD',
    });

    const toAcc = AccountService.createAccount(testUserId, {
      name: 'Savings B',
      type: 'savings',
      balance: 200,
      currency: 'USD',
    });

    const result = AccountService.transfer(testUserId, {
      fromAccountId: fromAcc.id,
      toAccountId: toAcc.id,
      amount: 300,
      date: '2026-09-11',
      description: 'Emergency reserve transfer',
    });

    expect(result.fromAccount.balance).toBe(700);
    expect(result.toAccount.balance).toBe(500);
    expect(result.debitTx.type).toBe('transfer');
    expect(result.creditTx.type).toBe('transfer');
    expect(result.debitTx.transferId).toBe(result.creditTx.id);
  });

  it('rejects transfer when source and destination are identical', () => {
    const acc = AccountService.createAccount(testUserId, {
      name: 'Solo Account',
      type: 'checking',
      balance: 500,
      currency: 'USD',
    });

    expect(() => {
      AccountService.transfer(testUserId, {
        fromAccountId: acc.id,
        toAccountId: acc.id,
        amount: 100,
        date: '2026-09-11',
      });
    }).toThrow(/must be different/);
  });
});
