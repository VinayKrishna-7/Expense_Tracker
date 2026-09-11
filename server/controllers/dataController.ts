import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { transactionsToCsv } from '../services/exportService.js';

export async function exportCsv(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: {
      account: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { date: 'desc' },
  });

  const csvContent = transactionsToCsv(transactions);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="expenseflow-export-${new Date().toISOString().split('T')[0]}.csv"`
  );
  res.send(csvContent);
}

export async function exportFullBackup(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const [accounts, categories, transactions, budgets, goals, recurring, subscriptions] =
    await Promise.all([
      prisma.account.findMany({ where: { userId } }),
      prisma.category.findMany({ where: { userId } }),
      prisma.transaction.findMany({ where: { userId } }),
      prisma.budget.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId }, include: { contributions: true } }),
      prisma.recurringTransaction.findMany({ where: { userId } }),
      prisma.subscription.findMany({ where: { userId } }),
    ]);

  const backup = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: {
      accounts,
      categories,
      transactions,
      budgets,
      goals,
      recurring,
      subscriptions,
    },
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="expenseflow-backup-${new Date().toISOString().split('T')[0]}.json"`
  );
  res.json(backup);
}

export async function resetUserData(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  await prisma.$transaction(async (tx) => {
    await tx.transaction.deleteMany({ where: { userId } });
    await tx.goalContribution.deleteMany({ where: { goal: { userId } } });
    await tx.goal.deleteMany({ where: { userId } });
    await tx.budget.deleteMany({ where: { userId } });
    await tx.recurringTransaction.deleteMany({ where: { userId } });
    await tx.subscription.deleteMany({ where: { userId } });
    await tx.notification.deleteMany({ where: { userId } });
    // Reset account balances to 0
    await tx.account.updateMany({
      where: { userId },
      data: { balance: 0 },
    });
  });

  res.json({
    success: true,
    message: 'User financial data successfully reset to clean ledger.',
  });
}
