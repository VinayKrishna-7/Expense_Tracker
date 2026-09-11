import React, { useState } from 'react';
import { useGoalStore } from '../store/useGoalStore';
import { useToastStore } from '../store/useToastStore';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalFormModal } from '../components/goals/GoalFormModal';
import { AddContributionModal } from '../components/goals/AddContributionModal';
import { Dialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Goal } from '../types/goal';
import { Plus, Target } from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const goals = useGoalStore((s) => s.goals);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);
  const addToast = useToastStore((s) => s.addToast);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormModalOpen(true);
  };

  const handleDelete = (goal: Goal) => {
    setDeletingGoal(goal);
  };

  const handleConfirmDelete = () => {
    if (!deletingGoal) return;
    deleteGoal(deletingGoal.id);
    addToast({
      message: `Goal "${deletingGoal.title}" deleted.`,
      type: 'info',
    });
    setDeletingGoal(null);
  };

  const handleAddContribution = (goal: Goal) => {
    setContributingGoal(goal);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Financial Goals
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Track your milestone savings, emergency funds, gadgets, and vacation goals.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setEditingGoal(null);
            setIsFormModalOpen(true);
          }}
          leftIcon={<Plus size={16} strokeWidth={2.5} />}
        >
          Create Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No savings goals yet"
          description="Create your first financial goal to calculate required monthly contributions and track your savings milestones."
          actionLabel="+ Create Goal"
          onAction={() => {
            setEditingGoal(null);
            setIsFormModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onAddContribution={handleAddContribution}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Goal Form Modal */}
      <GoalFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingGoal(null);
        }}
        initialData={editingGoal}
      />

      {/* Contribution Deposit Modal */}
      <AddContributionModal
        isOpen={!!contributingGoal}
        onClose={() => setContributingGoal(null)}
        goal={contributingGoal}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!deletingGoal}
        onClose={() => setDeletingGoal(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Financial Goal?"
        description={`Are you sure you want to delete "${deletingGoal?.title}"? All logged contribution records will be removed.`}
        confirmText="Delete Goal"
        confirmVariant="danger"
        type="danger"
      />
    </div>
  );
};
