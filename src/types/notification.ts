export type NotificationType = 'budget_alert' | 'goal_reached' | 'recurring_due' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}
