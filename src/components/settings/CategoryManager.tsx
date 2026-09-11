import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useToastStore } from '../../store/useToastStore';
import { Category, CategoryType } from '../../types/category';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const CategoryManager: React.FC = () => {
  const categories = useCategoryStore((s) => s.categories);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);
  const transactions = useTransactionStore((s) => s.transactions);
  const addToast = useToastStore((s) => s.addToast);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('expense');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('Tag');

  const filtered = categories.filter((c) => c.type === activeTab);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setType(activeTab);
    setColor('#6366f1');
    setIcon('Tag');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color);
    setIcon(cat.icon);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        type,
        color,
        icon,
      });
      addToast({ message: 'Category updated successfully!', type: 'success' });
    } else {
      addCategory({
        name: name.trim(),
        type,
        color,
        icon,
      });
      addToast({ message: 'Category created successfully!', type: 'success' });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (cat: Category) => {
    const isUsed = transactions.some((t) => t.category === cat.id);
    if (isUsed) {
      addToast({
        message: `Cannot delete "${cat.name}" because it is referenced by existing transactions.`,
        type: 'error',
      });
      return;
    }

    deleteCategory(cat.id);
    addToast({
      message: `Category "${cat.name}" deleted.`,
      type: 'info',
    });
  };

  const colorPresets = [
    '#f43f5e',
    '#f97316',
    '#eab308',
    '#10b981',
    '#06b6d4',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#64748b',
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <div>
          <h3 className="text-base font-bold text-surface-900 dark:text-white">
            Category Management
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Organize and customize spending and income categories
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<Plus size={15} />}
        >
          Add Category
        </Button>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Expense vs Income Filter Tabs */}
        <div className="flex gap-2 p-1 bg-surface-100 dark:bg-surface-800 rounded-lg w-fit text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'expense'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-500 hover:text-surface-900'
            }`}
          >
            Expense Categories ({categories.filter((c) => c.type === 'expense').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'income'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-500 hover:text-surface-900'
            }`}
          >
            Income Categories ({categories.filter((c) => c.type === 'income').length})
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 hover:border-surface-300 dark:hover:border-surface-700 transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <CategoryIcon name={cat.icon} size={16} />
                </div>
                <span className="text-xs font-bold text-surface-900 dark:text-white truncate">
                  {cat.name}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1 rounded text-surface-400 hover:text-brand-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  title="Edit Category"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat)}
                  className="p-1 rounded text-surface-400 hover:text-rose-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'New Category'}
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Pet Care, Gaming, Freelance"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Select
            label="Category Type"
            value={type}
            onChange={(e) => setType(e.target.value as CategoryType)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>

          <Select
            label="Icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          >
            <option value="Tag">🏷️ Tag</option>
            <option value="Utensils">🍽️ Food / Dining</option>
            <option value="Car">🚗 Transport / Car</option>
            <option value="ShoppingBag">🛍️ Shopping</option>
            <option value="Zap">⚡ Utilities / Bills</option>
            <option value="Tv">📺 Entertainment</option>
            <option value="HeartPulse">🩺 Healthcare</option>
            <option value="GraduationCap">🎓 Education</option>
            <option value="Plane">✈️ Travel</option>
            <option value="Home">🏠 Rent / Housing</option>
            <option value="Briefcase">💼 Salary</option>
            <option value="Laptop">💻 Freelance</option>
            <option value="TrendingUp">📈 Investment</option>
            <option value="Gift">🎁 Gift</option>
          </Select>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-400 mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-125 border-white ring-2 ring-brand-500' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-surface-100 dark:border-surface-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
