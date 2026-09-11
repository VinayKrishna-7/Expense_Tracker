import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { useAuthStore } from '../store/useAuthStore';
import {
  Account,
  AccountTransferPayload,
  Subscription,
  Transaction,
  TransactionFilters,
} from '../types';

export function useAccounts() {
  const { user } = useAuthStore();
  const userId = user?.id || 'guest';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['accounts', userId],
    queryFn: () => apiClient.getAccounts(userId),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Account, 'id' | 'userId'>) =>
      apiClient.createAccount(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', userId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', userId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Account> }) =>
      apiClient.updateAccount(userId, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', userId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', userId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteAccount(userId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', userId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', userId] });
    },
  });

  const transferMutation = useMutation({
    mutationFn: (payload: AccountTransferPayload) =>
      apiClient.transferAccounts(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', userId] });
    },
  });

  return {
    accounts: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createAccount: createMutation.mutateAsync,
    updateAccount: updateMutation.mutateAsync,
    deleteAccount: deleteMutation.mutateAsync,
    transferAccounts: transferMutation.mutateAsync,
    isTransferring: transferMutation.isPending,
  };
}

export function useSubscriptions() {
  const { user } = useAuthStore();
  const userId = user?.id || 'guest';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['subscriptions', userId],
    queryFn: () => apiClient.getSubscriptions(userId),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Subscription, 'id' | 'userId'>) =>
      apiClient.createSubscription(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', userId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', userId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Subscription> }) =>
      apiClient.updateSubscription(userId, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', userId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', userId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteSubscription(userId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', userId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', userId] });
    },
  });

  return {
    subscriptions: query.data?.subscriptions || [],
    summary: query.data?.summary || { totalMonthly: 0, totalYearly: 0, activeCount: 0, totalCount: 0 },
    isLoading: query.isLoading,
    error: query.error,
    createSubscription: createMutation.mutateAsync,
    updateSubscription: updateMutation.mutateAsync,
    deleteSubscription: deleteMutation.mutateAsync,
  };
}

export function useFinancialAnalytics() {
  const { user } = useAuthStore();
  const userId = user?.id || 'guest';

  return useQuery({
    queryKey: ['analytics', userId],
    queryFn: () => apiClient.getAnalyticsSummary(userId),
    enabled: !!user,
  });
}
