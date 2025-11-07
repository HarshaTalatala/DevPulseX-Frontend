'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin, useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Brand } from '@/components/ui/Brand';
import { Role } from '@/types';
import { toast } from 'sonner';
import { Github, Mail, Lock, User, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth';

export default function LoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const { setAuth } = useAuthStore();
  const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Invalid credentials. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerMutation.mutateAsync(registerForm);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleGoogleOAuth = () => {
    setIsGoogleLoading(true);
    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent('openid email profile')}&access_type=offline&prompt=consent&state=google`;
    
    // Open popup window
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      url,
      'Google OAuth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    // Listen for messages from the popup
    const handleMessage = async (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS' && event.data.code) {
        try {
          const response = await authApi.googleLogin(event.data.code);
          setAuth(response.user, response.token);
          toast.success('Successfully logged in with Google!');
          popup?.close();
          router.push('/dashboard');
        } catch (error) {
          toast.error('Google authentication failed. Please try again.');
        } finally {
          setIsGoogleLoading(false);
          window.removeEventListener('message', handleMessage);
        }
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        toast.error('Google authentication was cancelled or failed.');
        setIsGoogleLoading(false);
        popup?.close();
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    // Check if popup was blocked
    if (!popup || popup.closed) {
      toast.error('Popup blocked. Please allow popups for this site.');
      setIsGoogleLoading(false);
      window.removeEventListener('message', handleMessage);
      return;
    }

    // Monitor if popup is closed manually
    const popupChecker = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupChecker);
        setIsGoogleLoading(false);
        window.removeEventListener('message', handleMessage);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-black">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50/30 dark:to-white/[0.02]"></div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Main card */}
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg shadow-gray-900/5 dark:shadow-none overflow-hidden">
            {/* Header */}
            <div className="text-center pt-8 pb-6 px-6 border-b border-gray-100 dark:border-gray-900">
              <Link href="/" className="flex justify-center mb-4 transition-opacity hover:opacity-70">
                <Brand size="lg" accent="none" asLink={false} />
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isRegistering 
                  ? 'Create your account to get started' 
                  : 'Sign in to your account'}
              </p>
            </div>

            {/* Auth methods - GitHub style */}
            <div className="p-6">
              {/* OAuth buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 text-sm font-medium"
                  onClick={() => {
                    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/callback');
                    const scope = encodeURIComponent('read:user,repo,user:email');
                    const url = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=${scope}`;
                    window.location.href = url;
                  }}
                >
                  <Github className="w-5 h-5 mr-2" />
                  Continue with GitHub
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 text-sm font-medium"
                  onClick={handleGoogleOAuth}
                  isLoading={isGoogleLoading}
                  disabled={isGoogleLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-black px-3 text-gray-500 dark:text-gray-400 font-medium">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email/Password forms */}
              {!isRegistering ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      className="pl-10 h-11"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      type="password"
                      placeholder="Password"
                      className="pl-10 h-11"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-black dark:focus:ring-white" />
                      <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                    </label>
                    <button type="button" className="text-gray-900 dark:text-white hover:underline">
                      Forgot password?
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 text-sm font-semibold" 
                    isLoading={loginMutation.isPending}
                  >
                    Sign in to DevPulseX
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Full name"
                      className="pl-10 h-11"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      className="pl-10 h-11"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      type="password"
                      placeholder="Create a password"
                      className="pl-10 h-11"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
                    <Select
                      options={[
                        { value: 'DEVELOPER', label: 'Developer' },
                        { value: 'MANAGER', label: 'Manager' },
                        { value: 'ADMIN', label: 'Admin' },
                      ]}
                      className="pl-10 h-11"
                      value={registerForm.role}
                      onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value as Role })}
                      required
                    />
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    By creating an account, you agree to our{' '}
                    <button type="button" className="text-gray-900 dark:text-white hover:underline">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" className="text-gray-900 dark:text-white hover:underline">
                      Privacy Policy
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 text-sm font-semibold" 
                    isLoading={registerMutation.isPending}
                  >
                    Create account
                  </Button>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}
              </span>{' '}
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-gray-900 dark:text-white font-medium hover:underline"
              >
                {isRegistering ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Trusted by developers worldwide • Enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}