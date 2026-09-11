import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';

export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Account name is required'),
    type: z.enum(['checking', 'savings', 'credit_card', 'cash', 'upi', 'investment', 'loan']),
    balance: z.number().default(0),
    currency: z.string().default('USD'),
    institution: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    isDefault: z.boolean().optional(),
    isLiability: z.boolean().optional(),
    creditLimit: z.number().optional(),
  }),
});

export const updateAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    type: z.enum(['checking', 'savings', 'credit_card', 'cash', 'upi', 'investment', 'loan']).optional(),
    balance: z.number().optional(),
    currency: z.string().optional(),
    institution: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    isDefault: z.boolean().optional(),
    isLiability: z.boolean().optional(),
    creditLimit: z.number().optional(),
  }),
});

export const transferSchema = z.object({
  body: z.object({
    fromAccountId: z.string().uuid('Invalid fromAccountId'),
    toAccountId: z.string().uuid('Invalid toAccountId'),
    amount: z.number().positive('Transfer amount must be positive'),
    date: z.string().or(z.date()),
    description: z.string().optional(),
    fee: z.number().nonnegative().optional().default(0),
  }),
});

export async function getAccounts(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  });

  res.json({
    success: true,
    data: { accounts },
  });
}

export async function createAccount(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const data = req.body;

  if (data.isDefault) {
    // Reset existing defaults
    await prisma.account.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const account = await prisma.account.create({
    data: {
      ...data,
      userId,
    },
  });

  res.status(201).json({
    success: true,
    data: { account },
  });
}

export async function updateAccount(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  // Verify ownership (IDOR prevention)
  const existing = await prisma.account.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Account not found or access denied.' },
    });
    return;
  }

  if (req.body.isDefault) {
    await prisma.account.updateMany({
      where: { userId, isDefault: true, NOT: { id } },
      data: { isDefault: false },
    });
  }

  const account = await prisma.account.update({
    where: { id },
    data: req.body,
  });

  res.json({
    success: true,
    data: { account },
  });
}

export async function deleteAccount(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.account.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Account not found or access denied.' },
    });
    return;
  }

  const count = await prisma.account.count({ where: { userId } });
  if (count <= 1) {
    res.status(400).json({
      success: false,
      error: { code: 'CANNOT_DELETE_LAST_ACCOUNT', message: 'You must maintain at least one account.' },
    });
    return;
  }

  await prisma.account.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
}

export async function transferBetweenAccounts(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { fromAccountId, toAccountId, amount, date, description, fee = 0 } = req.body;

  if (fromAccountId === toAccountId) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_TRANSFER', message: 'Source and destination accounts must be different.' },
    });
    return;
  }

  // IDOR Protection: verify user owns both accounts
  const [fromAccount, toAccount] = await Promise.all([
    prisma.account.findFirst({ where: { id: fromAccountId, userId } }),
    prisma.account.findFirst({ where: { id: toAccountId, userId } }),
  ]);

  if (!fromAccount || !toAccount) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'One or both accounts not found or access denied.' },
    });
    return;
  }

  const transferDesc = description || `Transfer from ${fromAccount.name} to ${toAccount.name}`;
  const txDate = new Date(date);

  // Find or create a 'Transfer' category for internal records
  let transferCategory = await prisma.category.findFirst({
    where: { userId, name: 'Transfer' },
  });
  if (!transferCategory) {
    transferCategory = await prisma.category.create({
      data: {
        userId,
        name: 'Transfer',
        type: 'expense',
        icon: 'ArrowRightLeft',
        color: '#64748B',
        isSystem: true,
      },
    });
  }

  // Perform atomic transfer
  const result = await prisma.$transaction(async (tx) => {
    // 1. Debit from source account
    const debitTx = await tx.transaction.create({
      data: {
        userId,
        accountId: fromAccountId,
        categoryId: transferCategory!.id,
        type: 'transfer',
        amount,
        date: txDate,
        description: transferDesc,
        notes: `Transfer Out to ${toAccount.name}`,
      },
    });

    // 2. Credit to destination account
    const creditTx = await tx.transaction.create({
      data: {
        userId,
        accountId: toAccountId,
        categoryId: transferCategory!.id,
        type: 'transfer',
        amount,
        date: txDate,
        description: transferDesc,
        notes: `Transfer In from ${fromAccount.name}`,
        transferId: debitTx.id,
      },
    });

    // Link debit with credit
    await tx.transaction.update({
      where: { id: debitTx.id },
      data: { transferId: creditTx.id },
    });

    // 3. Update balances
    const updatedFrom = await tx.account.update({
      where: { id: fromAccountId },
      data: { balance: { decrement: amount + fee } },
    });

    const updatedTo = await tx.account.update({
      where: { id: toAccountId },
      data: { balance: { increment: amount } },
    });

    return {
      debitTransaction: debitTx,
      creditTransaction: creditTx,
      fromAccount: updatedFrom,
      toAccount: updatedTo,
    };
  });

  res.status(201).json({
    success: true,
    data: result,
  });
}
