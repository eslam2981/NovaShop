import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '@/components/layouts/AuthLayout';
import { useGoogleLogin } from '@react-oauth/google';


const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Reset form when coming from logout or on mount
  useEffect(() => {
    reset({
      email: '',
      password: '',
    });
    setError('');
  }, [reset]);

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const response = await authService.login(data);
      if (response.status === 'success' && response.data) {
        login(response.data.user, response.data.accessToken);
        // Redirect based on user role
        if (response.data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      // Get error message from API response
      let errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Login failed. Please check your credentials.';

      if (typeof errorMessage === 'string') {
        // Remove ANSI color codes e.g., [39m
        errorMessage = errorMessage.replace(/\x1B\[[0-9;]*[A-Za-z]/g, '').trim();

        // Provide friendly messages for common errors
        const lowerError = errorMessage.toLowerCase();
        if (lowerError.includes('invalid') || lowerError.includes('credentials') || lowerError.includes('password') || lowerError.includes('incorrect')) {
          errorMessage = 'Incorrect email or password.';
        } else if (lowerError.includes('not found') || lowerError.includes('no user')) {
          errorMessage = 'No account found with this email.';
        } else if (lowerError.includes('network') || lowerError.includes('failed to fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
      }

      setError(errorMessage);
      setError(errorMessage);
      console.error('Login failed', error);
    }
  };

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        setIsGoogleLoading(true);
        setError('');
        if (!codeResponse.access_token) throw new Error('No access_token received');
        const response = await authService.googleLogin(codeResponse.access_token);
        if (response.status === 'success' && response.data) {
          login(response.data.user, response.data.accessToken);
          if (response.data.user.role === 'ADMIN') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      } catch (error: any) {
        setError('Google Sign-In failed. Please try again.');
        console.error('Google login failed', error);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      setError('Google Sign-In was unsuccessful.');
      console.error('Login Failed:', error);
    }
  });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your email to sign in to your account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <Input
            type="email"
            placeholder="name@example.com"
            {...register('email')}
            className="h-14 md:h-16 font-semibold rounded-[1.5rem] bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800/50 text-black dark:text-white placeholder:text-neutral-500 focus:bg-neutral-50 dark:focus:bg-zinc-900 focus:border-primary transition-all px-6 text-base shadow-sm focus:shadow-md"
            autoComplete="off"
            key="login-email"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password"
            {...register('password')}
            className="h-14 md:h-16 font-semibold rounded-[1.5rem] bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800/50 text-black dark:text-white placeholder:text-neutral-500 focus:bg-neutral-50 dark:focus:bg-zinc-900 focus:border-primary transition-all px-6 text-base shadow-sm focus:shadow-md"
            autoComplete="new-password"
            key="login-password"
          />
          <div className="flex justify-between items-center px-2">
            {errors.password ? (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            ) : <div />}
            <Link to="/forgot-password" className="text-sm font-bold text-primary hover:underline transition-all">
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full h-14 md:h-16 text-base font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-200 dark:border-zinc-800/80" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-zinc-950 px-4 text-neutral-500 font-black uppercase tracking-widest text-[10px]">OR</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-14 md:h-16 rounded-[1.5rem] border-neutral-200 dark:border-zinc-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-zinc-900 font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => loginWithGoogle()}
          disabled={isGoogleLoading || isSubmitting}
        >
          {isGoogleLoading ? (
            'Connecting...'
          ) : (
            <>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        <div className="text-center text-sm mt-8 pb-4">
          <span className="text-neutral-500 font-bold tracking-wide">Don't have an account? </span>
          <Link to="/register" className="font-black uppercase tracking-widest text-primary hover:underline ml-1">
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
