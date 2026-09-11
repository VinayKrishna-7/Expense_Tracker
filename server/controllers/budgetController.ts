import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';

export const setBudgetSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    amount: z.number().positive(),
    period: z.enum(['monthly', 'weekly', 'yearly']).default('monthly'),
    month: z.number().min(1).max(12).optional(),
    year: z.number().min(2020).max(2100).optional(),
    alertThreshold: z.number().min(1).max(100).default(80),
  }),
});

export async function getBudgets(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const now = new Date();
  const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getMonth() + 1;
  const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Fetch budgets and user categories
  const [budgets, categories, monthExpenses] = await Promise.all([
    prisma.budget.findMany({
      where: {
        userId,
        OR: [
          { month: null, year: null },
          { month, year },
        ],
      },
      include: { category: true },
    }),
    prisma.category.findMany({
      where: {
        OR: [{ userId }, { userId: null }],
        type: 'expense',
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        date: { gte: startDate, lte: endDate },
      },
      select: { categoryId: true, amount: true },
    }),
  ]);

  // Aggregate spending by category
  const spendMap = new Map<string, number>();
  monthExpenses.forEach((tx) => {
    spendMap.set(tx.categoryId, (spendMap.get(tx.categoryId) || 0) + Number(tx.amount));
  });

  const enrichedBudgets = budgets.map((b) => {
    const spent = spendMap.get(b.categoryId) || 0;
    const remaining = Math.max(0, b.amount - spent);
    const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
    const isOverBudget = spent > b.amount;

    return {
      ...b,
      spent,
      remaining,
      percentage,
      isOverBudget,
    };
  });

  res.json({
    success: true,
    data: {
      budgets: enrichedBudgets,
      categories,
      month,
      year,
    },
  });
}

export async function setBudget(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { categoryId, amount, period = 'monthly', month, year, alertThreshold = 80 } = req.body;

  // Check if budget exists for category + month + year
  const existing = await prisma.budget.findFirst({
    where: {
      userId,
      categoryId,
      month: month || null,
      year: year || null,
    },
  });

  let budget;
  if (existing) {
    budget = await prisma.budget.update({
      where: { id: existing.id },
      data: { amount, period, alertThreshold },
      include: { category: true },
    });
  } else {
    budget = await prisma.budget.create({
      data: {
        userId,
        categoryId,
        amount,
        period,
        month: month || null,
        year: year || null,
        alertThreshold,
      },
      include: { category: true },
    });
  }

  res.status(201).json({
    success: true,
    data: { budget },
  });
}

export async function deleteBudget(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.budget.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });
    return;
  }

  await prisma.budget.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Budget deleted successfully',
  });
}
