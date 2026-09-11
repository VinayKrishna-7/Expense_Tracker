import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { reloadAllUserStores } from '../utils/userStoreSync';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const addToast = useToastStore((s) => s.addToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      reloadAllUserStores();
      addToast({
        message: 'Welcome back to ExpenseFlow!',
        type: 'success',
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand-500/25">
          EF
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-surface-900 dark:text-white">
          Sign in to your Account
        </h2>
        <p className="mt-1.5 text-xs text-surface-500 dark:text-surface-400">
          Enter your login credentials to access your private financial ledger
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-surface-900 py-8 px-6 sm:px-8 shadow-card border border-surface-200/80 dark:border-surface-800/80 rounded-2xl space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2.5 text-xs font-medium text-rose-700 dark:text-rose-300 animate-shake">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage('');
              }}
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage('');
              }}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-brand-600 focus:ring-brand-500 border-surface-300"
                />
                <span className="text-surface-600 dark:text-surface-400">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight size={16} />}
            >
              Sign In to Account
            </Button>
          </form>

          <div className="pt-4 border-t border-surface-100 dark:border-surface-800 text-center text-xs text-surface-500">
            <span>Don't have an account yet? </span>
            <Link
              to="/register"
              className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Create a Clean Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
