import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';

export const createSubscriptionSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Subscription name is required'),
    amount: z.number().positive(),
    currency: z.string().default('USD'),
    billingCycle: z.enum(['monthly', 'yearly', 'weekly', 'quarterly']).default('monthly'),
    nextBillingDate: z.string(),
    categoryId: z.string().uuid().optional(),
    accountId: z.string().uuid().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    website: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateSubscriptionSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    amount: z.number().positive().optional(),
    currency: z.string().optional(),
    billingCycle: z.enum(['monthly', 'yearly', 'weekly', 'quarterly']).optional(),
    nextBillingDate: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    accountId: z.string().uuid().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    website: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['active', 'paused', 'cancelled']).optional(),
  }),
});

export async function getSubscriptions(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    include: {
      account: { select: { id: true, name: true, type: true } },
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
    orderBy: { nextBillingDate: 'asc' },
  });

  // Calculate monthly normalized burn
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const monthlyTotal = activeSubs.reduce((sum, s) => {
    if (s.billingCycle === 'yearly') return sum + s.amount / 12;
    if (s.billingCycle === 'quarterly') return sum + s.amount / 3;
    if (s.billingCycle === 'weekly') return sum + s.amount * 4.33;
    return sum + s.amount;
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  res.json({
    success: true,
    data: {
      subscriptions,
      summary: {
        totalMonthly: Math.round(monthlyTotal * 100) / 100,
        totalYearly: Math.round(yearlyTotal * 100) / 100,
        activeCount: activeSubs.length,
        totalCount: subscriptions.length,
      },
    },
  });
}

export async function createSubscription(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const data = req.body;

  const subscription = await prisma.subscription.create({
    data: {
      ...data,
      nextBillingDate: new Date(data.nextBillingDate),
      userId,
    },
    include: {
      account: true,
      category: true,
    },
  });

  res.status(201).json({
    success: true,
    data: { subscription },
  });
}

export async function updateSubscription(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.subscription.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Subscription not found' } });
    return;
  }

  const updated = await prisma.subscription.update({
    where: { id },
    data: {
      ...req.body,
      nextBillingDate: req.body.nextBillingDate ? new Date(req.body.nextBillingDate) : undefined,
    },
    include: {
      account: true,
      category: true,
    },
  });

  res.json({
    success: true,
    data: { subscription: updated },
  });
}

export async function deleteSubscription(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.subscription.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Subscription not found' } });
    return;
  }

  await prisma.subscription.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Subscription deleted successfully',
  });
}
