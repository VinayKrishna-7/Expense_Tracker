import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { processUserRecurringTransactions } from '../services/recurringEngine.js';

export const createRecurringSchema = z.object({
  body: z.object({
    accountId: z.string().uuid(),
    categoryId: z.string().uuid(),
    type: z.enum(['income', 'expense']),
    amount: z.number().positive(),
    frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly']),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string().min(1),
    status: z.enum(['active', 'paused', 'completed']).default('active'),
  }),
});

export const updateRecurringSchema = z.object({
  body: z.object({
    accountId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    type: z.enum(['income', 'expense']).optional(),
    amount: z.number().positive().optional(),
    frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().min(1).optional(),
    status: z.enum(['active', 'paused', 'completed']).optional(),
  }),
});

export async function getRecurring(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const recurring = await prisma.recurringTransaction.findMany({
    where: { userId },
    include: {
      account: { select: { id: true, name: true, type: true } },
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: { recurring },
  });
}

export async function createRecurring(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const data = req.body;

  const recurring = await prisma.recurringTransaction.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      nextRunAt: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      userId,
    },
    include: {
      account: true,
      category: true,
    },
  });

  // Check if it should be immediately processed
  await processUserRecurringTransactions(userId);

  res.status(201).json({
    success: true,
    data: { recurring },
  });
}

export async function updateRecurring(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.recurringTransaction.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recurring transaction not found' } });
    return;
  }

  const updated = await prisma.recurringTransaction.update({
    where: { id },
    data: {
      ...req.body,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    },
    include: {
      account: true,
      category: true,
    },
  });

  res.json({
    success: true,
    data: { recurring: updated },
  });
}

export async function deleteRecurring(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.recurringTransaction.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recurring transaction not found' } });
    return;
  }

  await prisma.recurringTransaction.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Recurring rule deleted successfully',
  });
}

export async function processRecurring(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const generatedCount = await processUserRecurringTransactions(userId);

  res.json({
    success: true,
    data: { generatedCount },
  });
}
