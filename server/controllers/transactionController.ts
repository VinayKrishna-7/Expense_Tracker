import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';

export const createTransactionSchema = z.object({
  body: z.object({
    accountId: z.string().uuid(),
    categoryId: z.string().uuid(),
    type: z.enum(['income', 'expense', 'transfer']),
    amount: z.number().positive(),
    date: z.string().or(z.date()),
    description: z.string().min(1),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    receiptUrl: z.string().optional(),
    isRecurring: z.boolean().optional(),
  }),
});

export const updateTransactionSchema = z.object({
  body: z.object({
    accountId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    type: z.enum(['income', 'expense', 'transfer']).optional(),
    amount: z.number().positive().optional(),
    date: z.string().or(z.date()).optional(),
    description: z.string().min(1).optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    receiptUrl: z.string().optional(),
  }),
});

export const bulkImportSchema = z.object({
  body: z.object({
    transactions: z.array(
      z.object({
        accountId: z.string().uuid(),
        categoryId: z.string().uuid(),
        type: z.enum(['income', 'expense', 'transfer']),
        amount: z.number().positive(),
        date: z.string(),
        description: z.string(),
        notes: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    ),
    skipDuplicates: z.boolean().default(true),
  }),
});

export async function getTransactions(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const {
    search,
    type,
    categoryId,
    accountId,
    startDate,
    endDate,
    page = '1',
    limit = '50',
    sortBy = 'date',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const take = parseInt(limit as string, 10) || 50;
  const skip = (pageNum - 1) * take;

  const where: any = { userId };

  if (type && type !== 'all') {
    where.type = type;
  }
  if (categoryId && categoryId !== 'all') {
    where.categoryId = categoryId;
  }
  if (accountId && accountId !== 'all') {
    where.accountId = accountId;
  }
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }
  if (search) {
    where.OR = [
      { description: { contains: search as string, mode: 'insensitive' } },
      { notes: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        account: { select: { id: true, name: true, type: true, color: true } },
        category: { select: { id: true, name: true, icon: true, color: true, type: true } },
      },
      orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
      skip,
      take,
    }),
    prisma.transaction.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    },
  });
}

export async function createTransaction(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { accountId, categoryId, type, amount, date, description, notes, tags, receiptUrl, isRecurring } =
    req.body;

  // Validate account ownership
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) {
    res.status(404).json({ success: false, error: { code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' } });
    return;
  }

  // Validate category ownership or system category
  const category = await prisma.category.findFirst({
    where: { id: categoryId, OR: [{ userId }, { userId: null }] },
  });
  if (!category) {
    res.status(404).json({ success: false, error: { code: 'CATEGORY_NOT_FOUND', message: 'Category not found' } });
    return;
  }

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId,
        accountId,
        categoryId,
        type,
        amount,
        date: new Date(date),
        description,
        notes,
        tags: tags || [],
        receiptUrl,
        isRecurring: !!isRecurring,
      },
      include: {
        account: true,
        category: true,
      },
    });

    // Update account balance
    const delta = type === 'income' ? amount : -amount;
    await tx.account.update({
      where: { id: accountId },
      data: { balance: { increment: delta } },
    });

    return transaction;
  });

  res.status(201).json({
    success: true,
    data: { transaction: result },
  });
}

export async function updateTransaction(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' } });
    return;
  }

  const updateData = req.body;
  const newAccountId = updateData.accountId || existing.accountId;
  const newType = updateData.type || existing.type;
  const newAmount = updateData.amount !== undefined ? updateData.amount : existing.amount;

  const result = await prisma.$transaction(async (tx) => {
    // Revert old transaction effect on old account
    const oldDelta = existing.type === 'income' ? -existing.amount : existing.amount;
    await tx.account.update({
      where: { id: existing.accountId },
      data: { balance: { increment: oldDelta } },
    });

    // Apply new transaction effect on new account
    const newDelta = newType === 'income' ? newAmount : -newAmount;
    await tx.account.update({
      where: { id: newAccountId },
      data: { balance: { increment: newDelta } },
    });

    const updated = await tx.transaction.update({
      where: { id },
      data: {
        ...updateData,
        date: updateData.date ? new Date(updateData.date) : undefined,
      },
      include: {
        account: true,
        category: true,
      },
    });

    return updated;
  });

  res.json({
    success: true,
    data: { transaction: result },
  });
}

export async function deleteTransaction(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' } });
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Revert balance
    const revertDelta = existing.type === 'income' ? -existing.amount : existing.amount;
    await tx.account.update({
      where: { id: existing.accountId },
      data: { balance: { increment: revertDelta } },
    });

    // If part of transfer, handle paired transaction
    if (existing.transferId) {
      const paired = await tx.transaction.findFirst({
        where: { id: existing.transferId, userId },
      });
      if (paired) {
        const pairedDelta = paired.type === 'income' ? -paired.amount : paired.amount;
        await tx.account.update({
          where: { id: paired.accountId },
          data: { balance: { increment: pairedDelta } },
        });
        await tx.transaction.delete({ where: { id: paired.id } });
      }
    }

    await tx.transaction.delete({ where: { id } });
  });

  res.json({
    success: true,
    message: 'Transaction deleted successfully',
  });
}

export async function bulkImportTransactions(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { transactions, skipDuplicates = true } = req.body;

  let insertedCount = 0;
  let skippedCount = 0;

  for (const item of transactions) {
    const txDate = new Date(item.date);

    if (skipDuplicates) {
      const isDuplicate = await prisma.transaction.findFirst({
        where: {
          userId,
          accountId: item.accountId,
          amount: item.amount,
          description: item.description,
          date: {
            gte: new Date(txDate.getTime() - 24 * 60 * 60 * 1000),
            lte: new Date(txDate.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      if (isDuplicate) {
        skippedCount++;
        continue;
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          userId,
          accountId: item.accountId,
          categoryId: item.categoryId,
          type: item.type,
          amount: item.amount,
          date: txDate,
          description: item.description,
          notes: item.notes,
          tags: item.tags || [],
        },
      });

      const delta = item.type === 'income' ? item.amount : -item.amount;
      await tx.account.update({
        where: { id: item.accountId },
        data: { balance: { increment: delta } },
      });
    });

    insertedCount++;
  }

  res.status(201).json({
    success: true,
    data: {
      insertedCount,
      skippedCount,
      totalProcessed: transactions.length,
    },
  });
}
