export type SubscriptionBillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface Subscription {
  id: string;
  userId?: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: SubscriptionBillingCycle;
  nextBillingDate: string;
  categoryId?: string;
  accountId?: string;
  icon?: string;
  color?: string;
  website?: string;
  notes?: string;
  status: SubscriptionStatus;
  createdAt?: string;
  updatedAt?: string;
  category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
  account?: {
    id: string;
    name: string;
    type?: string;
  };
}

export interface SubscriptionSummary {
  totalMonthly: number;
  totalYearly: number;
  activeCount: number;
  totalCount: number;
}
