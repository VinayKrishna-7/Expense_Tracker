import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { reloadAllUserStores } from '../utils/userStoreSync';
import { User, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.register);
  const addToast = useToastStore((s) => s.addToast);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Password should be at least 4 characters.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    try {
      await registerUser(name.trim(), email.trim(), password, 'INR');
      reloadAllUserStores();
      addToast({
        message: `Welcome, ${name}! Your clean financial account is ready.`,
        type: 'success',
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
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
          Create a New Clean Account
        </h2>
        <p className="mt-1.5 text-xs text-surface-500 dark:text-surface-400">
          Start fresh with your own personal, private, and isolated expense tracker
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-surface-900 py-8 px-6 sm:px-8 shadow-card border border-surface-200/80 dark:border-surface-800/80 rounded-2xl space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2.5 text-xs font-medium text-rose-700 dark:text-rose-300">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. John Doe"
              leftIcon={<User size={16} />}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMessage('');
              }}
              required
              autoFocus
            />

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
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a secure password"
              leftIcon={<Lock size={16} />}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage('');
              }}
              required
            />

            <div className="p-3 rounded-xl bg-brand-50/50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/50 flex items-start gap-2.5 text-xs text-brand-800 dark:text-brand-300">
              <ShieldCheck size={16} className="shrink-0 mt-0.5 text-brand-600 dark:text-brand-400" />
              <span>
                Your account will be provisioned with a clean, private ledger with 0 sample records.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight size={16} />}
            >
              Create Clean Account
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-surface-100 dark:border-surface-800 text-center text-xs text-surface-500">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
