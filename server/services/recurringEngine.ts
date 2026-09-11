import { prisma } from '../db/prisma.js';

export function calculateNextRunDate(
  currentDate: Date,
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
): Date {
  const next = new Date(currentDate);
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

export async function processUserRecurringTransactions(userId: string): Promise<number> {
  const now = new Date();

  // Find all active recurring transactions where nextRunAt <= now (or is null)
  const dueRecurring = await prisma.recurringTransaction.findMany({
    where: {
      userId,
      status: 'active',
      nextRunAt: {
        lte: now,
      },
    },
    include: {
      account: true,
      category: true,
    },
  });

  let generatedCount = 0;

  for (const item of dueRecurring) {
    // Check if end date passed
    if (item.endDate && new Date(item.endDate) < now) {
      await prisma.recurringTransaction.update({
        where: { id: item.id },
        data: { status: 'completed' },
      });
      continue;
    }

    const txDate = item.nextRunAt ? new Date(item.nextRunAt) : new Date();

    // Create transaction in atomic transaction
    await prisma.$transaction(async (tx) => {
      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: item.userId,
          accountId: item.accountId,
          categoryId: item.categoryId,
          type: item.type,
          amount: item.amount,
          date: txDate,
          description: `${item.description} (Recurring)`,
          isRecurring: true,
          recurringRuleId: item.id,
        },
      });

      // Update account balance
      const balanceDelta = item.type === 'income' ? item.amount : -item.amount;
      await tx.account.update({
        where: { id: item.accountId },
        data: {
          balance: {
            increment: balanceDelta,
          },
        },
      });

      // Update nextRunAt and lastRunAt
      const nextDate = calculateNextRunDate(
        txDate,
        item.frequency as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
      );
      await tx.recurringTransaction.update({
        where: { id: item.id },
        data: {
          lastRunAt: now,
          nextRunAt: nextDate,
        },
      });
    });

    generatedCount++;
  }

  return generatedCount;
}
