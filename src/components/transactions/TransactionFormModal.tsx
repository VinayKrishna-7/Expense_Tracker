import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToastStore } from '../../store/useToastStore';
import { Transaction, PaymentMethod, RecurringFrequency } from '../../types/transaction';
import { CURRENCIES } from '../../constants/currencies';
import { clsx } from 'clsx';
import { ArrowDownLeft, ArrowUpRight, Calendar, CreditCard, Tag } from 'lucide-react';

const transactionSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(80, 'Title cannot exceed 80 characters'),
  amount: z
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .positive('Amount must be greater than 0')
    .max(100000000, 'Amount is too large'),
  type: z.enum(['expense', 'income']),
  category: z.string().min(1, 'Please select a category'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date (YYYY-MM-DD)'),
  paymentMethod: z.enum([
    'Cash',
    'Credit Card',
    'Debit Card',
    'UPI',
    'Bank Transfer',
    'Wallet',
    'Other',
  ]),
  notes: z.string().max(300, 'Notes cannot exceed 300 characters').optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(['Daily', 'Weekly', 'Monthly', 'Yearly']).optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Transaction | null;
  defaultType?: 'expense' | 'income';
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  defaultType = 'expense',
}) => {
  const categories = useCategoryStore((s) => s.categories);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const currencyCode = useSettingsStore((s) => s.settings.currency);
  const currencySymbol = CURRENCIES[currencyCode]?.symbol || '₹';
  const addToast = useToastStore((s) => s.addToast);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'UPI',
      isRecurring: false,
      recurringFrequency: 'Monthly',
      notes: '',
    },
  });

  const currentType = watch('type');
  const isRecurring = watch('isRecurring');

  // Filter categories by selected type (expense / income)
  const filteredCategories = React.useMemo(
    () => categories.filter((c) => c.type === currentType),
    [categories, currentType]
  );

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          amount: initialData.amount,
          type: (initialData.type === 'income' ? 'income' : 'expense') as 'expense' | 'income',
          category: initialData.category,
          date: initialData.date,
          paymentMethod: initialData.paymentMethod,
          notes: initialData.notes || '',
          isRecurring: initialData.isRecurring || false,
          recurringFrequency: initialData.recurringFrequency || 'Monthly',
        });
      } else {
        const initialFiltered = categories.filter((c) => c.type === defaultType);
        reset({
          title: '',
          amount: undefined as unknown as number,
          type: defaultType,
          category: initialFiltered[0]?.id || '',
          date: new Date().toISOString().slice(0, 10),
          paymentMethod: 'UPI',
          notes: '',
          isRecurring: false,
          recurringFrequency: 'Monthly',
        });
      }
    }
  }, [isOpen, initialData, defaultType, reset]);

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setValue('type', newType);
    const nextCats = categories.filter((c) => c.type === newType);
    if (nextCats.length > 0) {
      setValue('category', nextCats[0].id);
    }
  };

  const onSubmit = (data: TransactionFormData) => {
    if (initialData) {
      updateTransaction(initialData.id, {
        title: data.title,
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date,
        paymentMethod: data.paymentMethod as PaymentMethod,
        notes: data.notes || '',
        isRecurring: data.isRecurring,
        recurringFrequency: data.isRecurring ? (data.recurringFrequency as RecurringFrequency) : undefined,
      });
      addToast({
        message: 'Transaction updated successfully!',
        type: 'success',
      });
    } else {
      addTransaction({
        title: data.title,
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date,
        paymentMethod: data.paymentMethod as PaymentMethod,
        notes: data.notes || '',
        isRecurring: data.isRecurring,
        recurringFrequency: data.isRecurring ? (data.recurringFrequency as RecurringFrequency) : undefined,
      });
      addToast({
        message: `${data.type === 'expense' ? 'Expense' : 'Income'} added successfully!`,
        type: 'success',
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'New Transaction'}
      description={
        initialData
          ? 'Update the details for this transaction record.'
          : 'Record a new expense or income transaction in your ledger.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Type Toggle: Expense / Income */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-400 mb-1.5">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={clsx(
                'flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all',
                currentType === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900'
              )}
            >
              <ArrowDownLeft size={16} /> Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={clsx(
                'flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all',
                currentType === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900'
              )}
            >
              <ArrowUpRight size={16} /> Income
            </button>
          </div>
        </div>

        {/* Title & Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Title / Description"
            placeholder="e.g. Swiggy Gourmet, Monthly Rent"
            {...register('title')}
            error={errors.title?.message}
          />

          <Input
            label={`Amount (${currencySymbol})`}
            type="number"
            step="any"
            placeholder="0.00"
            leftIcon={<span className="font-bold text-sm">{currencySymbol}</span>}
            {...register('amount', { valueAsNumber: true })}
            error={errors.amount?.message}
          />
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            {...register('category')}
            error={errors.category?.message}
          >
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Input
            label="Date"
            type="date"
            leftIcon={<Calendar size={16} />}
            {...register('date')}
            error={errors.date?.message}
          />
        </div>

        {/* Payment Method */}
        <Select
          label="Payment Method"
          {...register('paymentMethod')}
          error={errors.paymentMethod?.message}
        >
          <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Debit Card">Debit Card</option>
          <option value="Bank Transfer">Net Banking / Bank Transfer</option>
          <option value="Cash">Cash</option>
          <option value="Wallet">Digital Wallet</option>
          <option value="Other">Other</option>
        </Select>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-400 mb-1.5">
            Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Add any extra notes or reference IDs..."
            className="block w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            {...register('notes')}
          />
          {errors.notes?.message && (
            <p className="mt-1 text-xs text-rose-500">{errors.notes.message}</p>
          )}
        </div>

        {/* Recurring Toggle */}
        <div className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/40 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-bold text-surface-800 dark:text-surface-200">
              Make this a Recurring Transaction
            </span>
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-surface-300 dark:border-surface-700"
              {...register('isRecurring')}
            />
          </label>

          {isRecurring && (
            <div className="pt-2 border-t border-surface-200/60 dark:border-surface-700/60 animate-fade-in">
              <Select
                label="Recurrence Frequency"
                {...register('recurringFrequency')}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </Select>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-surface-100 dark:border-surface-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={currentType === 'expense' ? 'danger' : 'success'}
            isLoading={isSubmitting}
          >
            {initialData ? 'Save Changes' : `Add ${currentType === 'expense' ? 'Expense' : 'Income'}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
