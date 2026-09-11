import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { config } from '../config/index.js';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    currency: z.string().default('USD'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, currency } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    res.status(409).json({
      success: false,
      error: {
        code: 'USER_ALREADY_EXISTS',
        message: 'An account with this email address already exists.',
      },
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Clean account provisioning: Create user and default primary account
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        currency: currency || 'USD',
      },
    });

    // Create default Primary Checking account
    await tx.account.create({
      data: {
        userId: newUser.id,
        name: 'Primary Checking',
        type: 'checking',
        balance: 0,
        currency: currency || 'USD',
        isDefault: true,
        color: '#2563EB',
      },
    });

    // Seed standard base categories
    const defaultCategories = [
      { name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10B981', isSystem: true },
      { name: 'Freelance', type: 'income', icon: 'Laptop', color: '#059669', isSystem: true },
      { name: 'Housing & Rent', type: 'expense', icon: 'Home', color: '#3B82F6', isSystem: true },
      { name: 'Groceries', type: 'expense', icon: 'ShoppingCart', color: '#F59E0B', isSystem: true },
      { name: 'Dining Out', type: 'expense', icon: 'Utensils', color: '#EF4444', isSystem: true },
      { name: 'Transportation', type: 'expense', icon: 'Car', color: '#8B5CF6', isSystem: true },
      { name: 'Utilities', type: 'expense', icon: 'Zap', color: '#EC4899', isSystem: true },
      { name: 'Entertainment', type: 'expense', icon: 'Film', color: '#6366F1', isSystem: true },
      { name: 'Health & Medical', type: 'expense', icon: 'HeartPulse', color: '#14B8A6', isSystem: true },
      { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#F97316', isSystem: true },
      { name: 'Subscriptions', type: 'expense', icon: 'Repeat', color: '#06B6D4', isSystem: true },
      { name: 'Investment', type: 'expense', icon: 'TrendingUp', color: '#84CC16', isSystem: true },
    ];

    await tx.category.createMany({
      data: defaultCategories.map((c) => ({
        ...c,
        userId: newUser.id,
      })),
    });

    return newUser;
  });

  const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        theme: user.theme,
      },
      token,
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      },
    });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      },
    });
    return;
  }

  const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        theme: user.theme,
      },
      token,
    },
  });
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not logged in' } });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      currency: true,
      theme: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    return;
  }

  res.json({
    success: true,
    data: { user },
  });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}
