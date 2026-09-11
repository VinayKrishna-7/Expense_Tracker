import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToastStore } from '../../store/useToastStore';
import { Budget } from '../../types/budget';
import { CURRENCIES } from '../../constants/currencies';

const budgetSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  monthlyLimit: z
    .number({ invalid_type_error: 'Please enter a valid monthly limit' })
    .positive('Limit must be greater than 0'),
  period: z.string().min(1, 'Period is required'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Budget | null;
}

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const categories = useCategoryStore((s) => s.categories);
  const addBudget = useBudgetStore((s) => s.addBudget);
  const updateBudget = useBudgetStore((s) => s.updateBudget);
  const currencyCode = useSettingsStore((s) => s.settings.currency);
  const currencySymbol = CURRENCIES[currencyCode]?.symbol || '₹';
  const addToast = useToastStore((s) => s.addToast);

  const expenseCategories = React.useMemo(
    () => categories.filter((c) => c.type === 'expense'),
    [categories]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: expenseCategories[0]?.id || '',
      monthlyLimit: 10000,
      period: new Date().toISOString().slice(0, 7), // YYYY-MM
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          category: initialData.category,
          monthlyLimit: initialData.monthlyLimit,
          period: initialData.period || new Date().toISOString().slice(0, 7),
        });
      } else {
        reset({
          category: expenseCategories[0]?.id || '',
          monthlyLimit: 10000,
          period: new Date().toISOString().slice(0, 7),
        });
      }
    }
  }, [isOpen, initialData]);

  const onSubmit = (data: BudgetFormData) => {
    if (initialData) {
      updateBudget(initialData.id, {
        category: data.category,
        monthlyLimit: data.monthlyLimit,
        period: data.period,
      });
      addToast({ message: 'Budget updated successfully!', type: 'success' });
    } else {
      addBudget({
        category: data.category,
        monthlyLimit: data.monthlyLimit,
        period: data.period,
      });
      addToast({ message: 'Budget created successfully!', type: 'success' });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Budget' : 'Create Monthly Budget'}
      description="Set a monthly spending threshold for a category to keep your finances on track."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Expense Category"
          {...register('category')}
          error={errors.category?.message}
        >
          {expenseCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Input
          label={`Monthly Budget Limit (${currencySymbol})`}
          type="number"
          placeholder="10000"
          leftIcon={<span className="font-bold text-sm">{currencySymbol}</span>}
          {...register('monthlyLimit', { valueAsNumber: true })}
          error={errors.monthlyLimit?.message}
        />

        <Input
          label="Budget Month Period"
          type="month"
          {...register('period')}
          error={errors.period?.message}
        />

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-surface-100 dark:border-surface-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Save Changes' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
