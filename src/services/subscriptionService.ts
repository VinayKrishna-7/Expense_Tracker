import { Subscription, SubscriptionSummary } from '../types';
import { StorageService, STORAGE_KEYS } from './storageService';

export class SubscriptionService {
  static getSubscriptions(userId: string): Subscription[] {
    return StorageService.getItem<Subscription[]>(
      STORAGE_KEYS.getUserSubscriptionsKey(userId),
      []
    );
  }

  static getSummary(userId: string): SubscriptionSummary {
    const subs = this.getSubscriptions(userId);
    const active = subs.filter((s) => s.status === 'active');

    const totalMonthly = active.reduce((sum, s) => {
      if (s.billingCycle === 'yearly') return sum + s.amount / 12;
      if (s.billingCycle === 'quarterly') return sum + s.amount / 3;
      if (s.billingCycle === 'weekly') return sum + s.amount * 4.33;
      return sum + s.amount;
    }, 0);

    return {
      totalMonthly: Math.round(totalMonthly * 100) / 100,
      totalYearly: Math.round(totalMonthly * 12 * 100) / 100,
      activeCount: active.length,
      totalCount: subs.length,
    };
  }

  static createSubscription(
    userId: string,
    data: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Subscription {
    const subs = this.getSubscriptions(userId);
    const newSub: Subscription = {
      ...data,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newSub, ...subs];
    StorageService.setItem(STORAGE_KEYS.getUserSubscriptionsKey(userId), updated);
    return newSub;
  }

  static updateSubscription(
    userId: string,
    id: string,
    updates: Partial<Subscription>
  ): Subscription | null {
    const subs = this.getSubscriptions(userId);
    const idx = subs.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const updated = {
      ...subs[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    subs[idx] = updated;
    StorageService.setItem(STORAGE_KEYS.getUserSubscriptionsKey(userId), subs);
    return updated;
  }

  static deleteSubscription(userId: string, id: string): boolean {
    const subs = this.getSubscriptions(userId);
    const filtered = subs.filter((s) => s.id !== id);
    if (filtered.length === subs.length) return false;

    StorageService.setItem(STORAGE_KEYS.getUserSubscriptionsKey(userId), filtered);
    return true;
  }
}
