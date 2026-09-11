import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';

export const createGoalSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Goal name is required'),
    targetAmount: z.number().positive(),
    currentAmount: z.number().nonnegative().default(0),
    targetDate: z.string().optional(),
    category: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
  }),
});

export const updateGoalSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    targetAmount: z.number().positive().optional(),
    currentAmount: z.number().nonnegative().optional(),
    targetDate: z.string().optional(),
    category: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    status: z.enum(['in_progress', 'completed', 'cancelled']).optional(),
  }),
});

export const contributeGoalSchema = z.object({
  body: z.object({
    amount: z.number().positive('Contribution must be positive'),
    accountId: z.string().uuid().optional(),
    notes: z.string().optional(),
  }),
});

export async function getGoals(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const goals = await prisma.goal.findMany({
    where: { userId },
    include: {
      contributions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const enrichedGoals = goals.map((g) => {
    const percentage = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
    return {
      ...g,
      percentage,
      isCompleted: g.currentAmount >= g.targetAmount || g.status === 'completed',
    };
  });

  res.json({
    success: true,
    data: { goals: enrichedGoals },
  });
}

export async function createGoal(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const data = req.body;

  const goal = await prisma.goal.create({
    data: {
      ...data,
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      userId,
    },
  });

  res.status(201).json({
    success: true,
    data: { goal },
  });
}

export async function updateGoal(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.goal.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Goal not found' } });
    return;
  }

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      ...req.body,
      targetDate: req.body.targetDate ? new Date(req.body.targetDate) : undefined,
    },
  });

  res.json({
    success: true,
    data: { goal },
  });
}

export async function deleteGoal(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.goal.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Goal not found' } });
    return;
  }

  await prisma.goal.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Goal deleted successfully',
  });
}

export async function contributeToGoal(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;
  const { amount, accountId, notes } = req.body;

  const goal = await prisma.goal.findFirst({
    where: { id, userId },
  });

  if (!goal) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Goal not found' } });
    return;
  }

  const result = await prisma.$transaction(async (tx) => {
    // Record contribution
    const contribution = await tx.goalContribution.create({
      data: {
        goalId: id,
        amount,
        notes,
      },
    });

    const newAmount = goal.currentAmount + amount;
    const isCompleted = newAmount >= goal.targetAmount;

    // Update goal current amount & status
    const updatedGoal = await tx.goal.update({
      where: { id },
      data: {
        currentAmount: newAmount,
        status: isCompleted ? 'completed' : goal.status,
      },
      include: {
        contributions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    // If account was specified, deduct balance
    if (accountId) {
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { decrement: amount } },
      });
    }

    return { goal: updatedGoal, contribution };
  });

  res.status(201).json({
    success: true,
    data: result,
  });
}
