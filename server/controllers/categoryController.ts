import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(['income', 'expense']),
    icon: z.string().default('Tag'),
    color: z.string().default('#3B82F6'),
  }),
});

export async function getCategories(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const categories = await prisma.category.findMany({
    where: {
      OR: [{ userId }, { userId: null }],
    },
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
  });

  res.json({
    success: true,
    data: { categories },
  });
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { name, type, icon, color } = req.body;

  const category = await prisma.category.create({
    data: {
      userId,
      name,
      type,
      icon,
      color,
      isSystem: false,
    },
  });

  res.status(201).json({
    success: true,
    data: { category },
  });
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const category = await prisma.category.findFirst({
    where: { id, userId },
  });

  if (!category) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Custom category not found or is a protected system category.' },
    });
    return;
  }

  await prisma.category.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Category deleted successfully',
  });
}
