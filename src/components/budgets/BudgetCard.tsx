import React from 'react';
import { BudgetProgress } from '../../types/budget';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Card } from '../ui/Card';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { MoreVertical, Edit3, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface BudgetCardProps {
  progress: BudgetProgress;
  onEdit: (progress: BudgetProgress) => void;
  onDelete: (progress: BudgetProgress) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  progress,
  onEdit,
  onDelete,
}) => {
  const { budget, spent, remaining, percentage, status } = progress;
  const categories = useCategoryStore((s) => s.categories);
  const currency = useSettingsStore((s) => s.settings.currency);

  const category = categories.find(
    (c) =>
      c.id === budget.category ||
      c.name.toLowerCase() === (budget.category || '').toLowerCase()
  );

  const menuItems: DropdownItem[] = [
    {
      label: 'Edit Budget',
      icon: <Edit3 size={14} />,
      onClick: () => onEdit(progress),
    },
    {
      label: 'Delete Budget',
      icon: <Trash2 size={14} />,
      variant: 'danger',
      onClick: () => onDelete(progress),
    },
  ];

  const getStatusBadge = () => {
    if (status === 'danger') {
      return (
        <Badge variant="danger" size="sm" icon={<AlertTriangle size={12} />}>
          Over Budget ({percentage}%)
        </Badge>
      );
    }
    if (status === 'warning') {
      return (
        <Badge variant="warning" size="sm" icon={<AlertTriangle size={12} />}>
          Near Limit ({percentage}%)
        </Badge>
      );
    }
    return (
      <Badge variant="success" size="sm" icon={<CheckCircle2 size={12} />}>
        Healthy ({percentage}%)
      </Badge>
    );
  };

  return (
    <Card hoverable className="p-5 sm:p-6 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${category?.color || '#6366f1'}15`,
              color: category?.color || '#6366f1',
            }}
          >
            <CategoryIcon name={category?.icon} size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-surface-900 dark:text-white">
              {category?.name || 'Category Budget'}
            </h4>
            <p className="text-xs text-surface-400 mt-0.5">
              Monthly allocation: {formatCurrency(budget.monthlyLimit, currency)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Dropdown
            trigger={
              <button
                type="button"
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <MoreVertical size={16} />
              </button>
            }
            items={menuItems}
          />
        </div>
      </div>

      {/* Progress Metric */}
      <div className="mt-5 space-y-2">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-bold text-surface-900 dark:text-white text-sm">
            {formatCurrency(spent, currency)}
            <span className="text-xs font-normal text-surface-400 ml-1">
              spent
            </span>
          </span>

          <span
            className={clsx(
              'font-semibold text-xs',
              status === 'danger'
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-surface-500 dark:text-surface-400'
            )}
          >
            {status === 'danger'
              ? `${formatCurrency(spent - budget.monthlyLimit, currency)} over`
              : `${formatCurrency(remaining, currency)} remaining`}
          </span>
        </div>

        <ProgressBar
          value={spent}
          max={budget.monthlyLimit}
          variant="auto"
          size="md"
        />
      </div>
    </Card>
  );
};
