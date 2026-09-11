import React from 'react';
import { Goal } from '../../types/goal';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateGoalProgress } from '../../utils/calculations';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import {
  MoreVertical,
  Edit3,
  Trash2,
  PlusCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  onAddContribution: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onAddContribution,
  onEdit,
  onDelete,
}) => {
  const currency = useSettingsStore((s) => s.settings.currency);
  const { percentage, remainingAmount, monthlyNeeded, monthsLeft } =
    calculateGoalProgress(goal);

  const isCompleted = goal.isCompleted || percentage >= 100;

  const menuItems: DropdownItem[] = [
    {
      label: 'Add Deposit',
      icon: <PlusCircle size={14} />,
      onClick: () => onAddContribution(goal),
    },
    {
      label: 'Edit Goal',
      icon: <Edit3 size={14} />,
      onClick: () => onEdit(goal),
    },
    {
      label: 'Delete Goal',
      icon: <Trash2 size={14} />,
      variant: 'danger',
      onClick: () => onDelete(goal),
    },
  ];

  return (
    <Card hoverable className="p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${goal.color || '#6366f1'}18`,
                color: goal.color || '#6366f1',
              }}
            >
              <CategoryIcon name={goal.icon || 'Target'} size={24} />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-surface-900 dark:text-white">
                {goal.title}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-surface-400">
                <Calendar size={13} />
                <span>Target: {formatDate(goal.deadline, 'MMM yyyy')}</span>
                <span>•</span>
                <span>{goal.category || 'General'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isCompleted ? (
              <Badge variant="success" size="sm" icon={<Sparkles size={12} />}>
                Achieved 🎉
              </Badge>
            ) : (
              <span className="text-xs font-black text-brand-600 dark:text-brand-400">
                {percentage}%
              </span>
            )}
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

        {/* Amounts */}
        <div className="mt-5 flex items-baseline justify-between">
          <div>
            <span className="text-xs text-surface-400 font-medium">Saved</span>
            <p className="text-xl font-extrabold text-surface-900 dark:text-white">
              {formatCurrency(goal.currentAmount, currency)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-surface-400 font-medium">Target</span>
            <p className="text-sm font-bold text-surface-700 dark:text-surface-300">
              {formatCurrency(goal.targetAmount, currency)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <ProgressBar
            value={goal.currentAmount}
            max={goal.targetAmount}
            variant="primary"
            size="md"
          />
        </div>

        {/* Monthly Pacing Info */}
        {!isCompleted && (
          <div className="mt-4 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/50 text-xs text-surface-600 dark:text-surface-300 flex items-center justify-between">
            <span>Required Monthly SIP:</span>
            <span className="font-bold text-surface-900 dark:text-white">
              {formatCurrency(monthlyNeeded, currency)}/mo ({monthsLeft} mos)
            </span>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="mt-5 pt-4 border-t border-surface-100 dark:border-surface-800/80 flex items-center justify-between">
        <span className="text-xs text-surface-400">
          {isCompleted
            ? 'Goal complete!'
            : `${formatCurrency(remainingAmount, currency)} left to save`}
        </span>

        <Button
          variant={isCompleted ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => onAddContribution(goal)}
          leftIcon={<PlusCircle size={14} />}
        >
          {isCompleted ? 'Add Extra' : 'Contribute'}
        </Button>
      </div>
    </Card>
  );
};
