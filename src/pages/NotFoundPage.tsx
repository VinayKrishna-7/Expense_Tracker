import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, HelpCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-400 mb-4">
        <HelpCircle size={48} strokeWidth={1.5} />
      </div>
      <h1 className="text-4xl font-black text-surface-900 dark:text-white tracking-tight">
        404 - Page Not Found
      </h1>
      <p className="mt-2 text-sm text-surface-500 max-w-sm">
        The financial report or resource you are trying to reach does not exist or has moved.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button variant="primary" leftIcon={<Home size={16} />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
