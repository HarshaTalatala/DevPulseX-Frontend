'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin, useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Role } from '@/types';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DEVELOPER' as Role,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync(loginForm);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerMutation.mutateAsync(registerForm);
      toast.success('Registration successful!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-black dark:via-gray-900 dark:to-black px-4">
      {/* Animated background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">DP</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            DevPulseX
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Developer Dashboard & Analytics
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
            <button
              className={`flex-1 pb-3 text-sm font-medium ${
                !isRegistering
                  ? 'border-b-2 border-black dark:border-white text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setIsRegistering(false)}
            >
              Sign In
            </button>
            <button
              className={`flex-1 pb-3 text-sm font-medium ${
                isRegistering
                  ? 'border-b-2 border-black dark:border-white text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setIsRegistering(true)}
            >
              Sign Up
            </button>
          </div>

          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
              <Button type="submit" className="w-full" isLoading={loginMutation.isPending}>
                Sign In
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-950 px-2 text-gray-500">or</span>
                </div>
              </div>
              <Button
                type="button"
                className="w-full bg-gray-900 hover:bg-black text-white"
                onClick={() => {
                  const redirectUri = encodeURIComponent('http://localhost:3000/auth/callback');
                  const scope = encodeURIComponent('read:user,repo,user:email');
                  const url = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=${scope}`;
                  window.location.href = url;
                }}
              >
                Login with GitHub
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Name"
                type="text"
                placeholder="John Doe"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
              />
              <Select
                label="Role"
                options={[
                  { value: 'DEVELOPER', label: 'Developer' },
                  { value: 'MANAGER', label: 'Manager' },
                  { value: 'ADMIN', label: 'Admin' },
                ]}
                value={registerForm.role}
                onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value as Role })}
                required
              />
              <Button type="submit" className="w-full" isLoading={registerMutation.isPending}>
                Sign Up
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-950 px-2 text-gray-500">or</span>
                </div>
              </div>
              <Button
                type="button"
                className="w-full bg-gray-900 hover:bg-black text-white"
                onClick={() => {
                  const redirectUri = encodeURIComponent('http://localhost:3000/auth/callback');
                  const scope = encodeURIComponent('read:user,repo,user:email');
                  const url = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=${scope}`;
                  window.location.href = url;
                }}
              >
                Continue with GitHub
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Backend API: {process.env.NEXT_PUBLIC_API_URL}
        </p>
      </div>
    </div>
  );
}
