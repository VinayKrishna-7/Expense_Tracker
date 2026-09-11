import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useGoalStore } from '../../store/useGoalStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToastStore } from '../../store/useToastStore';
import { Goal } from '../../types/goal';
import { CURRENCIES } from '../../constants/currencies';

const goalSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(60, 'Title cannot exceed 60 characters'),
  targetAmount: z
    .number({ invalid_type_error: 'Please enter a valid target amount' })
    .positive('Target amount must be greater than 0'),
  initialAmount: z
    .number({ invalid_type_error: 'Please enter a valid starting amount' })
    .min(0, 'Starting amount cannot be negative')
    .optional(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid deadline (YYYY-MM-DD)'),
  category: z.string().min(1, 'Category is required'),
  color: z.string().min(1, 'Color is required'),
  icon: z.string().min(1, 'Icon is required'),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Goal | null;
}

export const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const addGoal = useGoalStore((s) => s.addGoal);
  const updateGoal = useGoalStore((s) => s.updateGoal);
  const currencyCode = useSettingsStore((s) => s.settings.currency);
  const currencySymbol = CURRENCIES[currencyCode]?.symbol || '₹';
  const addToast = useToastStore((s) => s.addToast);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      targetAmount: 100000,
      initialAmount: 0,
      deadline: '2026-12-31',
      category: 'Emergency Fund',
      color: '#10b981',
      icon: 'ShieldCheck',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          targetAmount: initialData.targetAmount,
          initialAmount: initialData.currentAmount,
          deadline: initialData.deadline,
          category: initialData.category || 'General',
          color: initialData.color || '#6366f1',
          icon: initialData.icon || 'Target',
        });
      } else {
        reset({
          title: '',
          targetAmount: 100000,
          initialAmount: 0,
          deadline: '2026-12-31',
          category: 'Emergency Fund',
          color: '#10b981',
          icon: 'ShieldCheck',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: GoalFormData) => {
    if (initialData) {
      updateGoal(initialData.id, {
        title: data.title,
        targetAmount: data.targetAmount,
        deadline: data.deadline,
        category: data.category,
        color: data.color,
        icon: data.icon,
      });
      addToast({ message: 'Goal updated successfully!', type: 'success' });
    } else {
      addGoal({
        title: data.title,
        targetAmount: data.targetAmount,
        initialAmount: data.initialAmount || 0,
        deadline: data.deadline,
        category: data.category,
        color: data.color,
        icon: data.icon,
      });
      addToast({ message: 'Savings goal created successfully!', type: 'success' });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Savings Goal' : 'Create Financial Goal'}
      description="Set a target amount and deadline to visualize your savings milestones."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Goal Title"
          placeholder="e.g. Emergency Fund, Goa Vacation, New Laptop"
          {...register('title')}
          error={errors.title?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={`Target Amount (${currencySymbol})`}
            type="number"
            placeholder="100000"
            leftIcon={<span className="font-bold text-sm">{currencySymbol}</span>}
            {...register('targetAmount', { valueAsNumber: true })}
            error={errors.targetAmount?.message}
          />

          {!initialData && (
            <Input
              label={`Starting Deposit (${currencySymbol})`}
              type="number"
              placeholder="0"
              leftIcon={<span className="font-bold text-sm">{currencySymbol}</span>}
              {...register('initialAmount', { valueAsNumber: true })}
              error={errors.initialAmount?.message}
            />
          )}

          <Input
            label="Target Deadline"
            type="date"
            {...register('deadline')}
            error={errors.deadline?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Category Tag" {...register('category')}>
            <option value="Emergency Fund">Emergency Fund</option>
            <option value="Tech Gadgets">Tech Gadgets</option>
            <option value="Travel & Vacation">Travel & Vacation</option>
            <option value="Vehicles & Auto">Vehicles & Auto</option>
            <option value="Home & Real Estate">Home & Real Estate</option>
            <option value="Investment & Wealth">Investment & Wealth</option>
            <option value="Other">Other</option>
          </Select>

          <Select label="Theme Icon" {...register('icon')}>
            <option value="ShieldCheck">🛡️ Shield / Safety</option>
            <option value="Laptop">💻 Tech Laptop</option>
            <option value="Plane">✈️ Flight Travel</option>
            <option value="Home">🏠 House</option>
            <option value="Car">🚗 Car</option>
            <option value="TrendingUp">📈 Growth</option>
            <option value="Target">🎯 Target</option>
            <option value="Gift">🎁 Gift</option>
          </Select>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-surface-100 dark:border-surface-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
