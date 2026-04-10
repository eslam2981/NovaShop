import { useState, useRef, KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '@/components/layouts/AuthLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

// Schemas for the 3 steps
const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const codeSchema = z.object({
  code: z.string().length(6, 'Code must be exactly 6 characters'),
});

const newPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<string>('EMAIL');
  const [error, setError] = useState<string>('');
  
  const [userEmail, setUserEmail] = useState('');
  const [resetCode, setResetCode] = useState('');

  // Step 1: Email Form
  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors, isSubmitting: isEmailSubmitting } } = useForm({
    resolver: zodResolver(emailSchema),
  });

  // Step 2: Code Form removed react-hook-form since it's hard to integrate with 6 custom controlled inputs directly.
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isCodeSubmitting, setIsCodeSubmitting] = useState(false);
  const [codeError, setCodeError] = useState('');

  // Step 3: Password Form
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting } } = useForm({
    resolver: zodResolver(newPasswordSchema),
  });

  const onEmailSubmit = async (data: any) => {
    try {
      setError('');
      await authService.forgotPassword(data.email);
      setUserEmail(data.email);
      setStep('VERIFY');
    } catch (err: any) {
      let errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to send reset code. Email might not exist.';
      if (typeof errorMessage === 'string') {
        errorMessage = errorMessage.replace(/\x1B\[[0-9;]*[A-Za-z]/g, '').trim();
        if (errorMessage.toLowerCase().includes('google')) {
          errorMessage = 'This account uses Google Sign-In. Please log in with Google directly.';
        }
      }
      setError(errorMessage);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newCode = [...codeDigits];
    newCode[index] = value;
    setCodeDigits(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onCodeSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const fullCode = codeDigits.join('');
    if (fullCode.length !== 6) {
      setCodeError('Code must be exactly 6 digits');
      return;
    }
    try {
      setCodeError('');
      setIsCodeSubmitting(true);
      await authService.verifyResetCode(userEmail, fullCode);
      setResetCode(fullCode);
      setStep('NEW_PASSWORD');
    } catch (err: any) {
      setCodeError(err.response?.data?.message || err.response?.data?.error || 'Invalid or expired code.');
    } finally {
      setIsCodeSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: any) => {
    try {
      setError('');
      await authService.resetPassword(userEmail, resetCode, data.password);
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to reset password. The code might have expired.');
    }
  };

  // Animation variants
  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: { zIndex: 0, x: -50, opacity: 0 }
  };

  return (
    <AuthLayout
      title={step === 'EMAIL' ? "Forgot Password?" : step === 'VERIFY' ? "Check Your Email" : step === 'NEW_PASSWORD' ? "Create New Password" : "Password Reset"}
      subtitle={step === 'EMAIL' ? "Enter your email to receive a reset code" : step === 'VERIFY' ? `We sent a 6-digit code to ${userEmail}` : step === 'NEW_PASSWORD' ? "Please enter your new strong password" : "Your password was successfully reset"}
    >
      <div className="relative min-h-[300px]">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 'EMAIL' && (
            <motion.form
              key="email-form"
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3 }}
              onSubmit={handleEmailSubmit(onEmailSubmit)} 
              className="space-y-6"
            >
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...registerEmail('email')}
                  className="h-14 md:h-16 font-semibold rounded-[1.5rem] bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800/50 text-black dark:text-white placeholder:text-neutral-500 focus:bg-neutral-50 dark:focus:bg-zinc-900 focus:border-primary transition-all px-6 text-base shadow-sm focus:shadow-md"
                  autoComplete="email"
                />
                {emailErrors.email && <p className="text-sm text-red-500">{emailErrors.email.message as string}</p>}
              </div>

              <Button type="submit" className="w-full h-14 md:h-16 text-base font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={isEmailSubmitting}>
                {isEmailSubmitting ? 'Sending...' : 'Send Reset Code'}
              </Button>
              
              <div className="text-center mt-6">
                <Link to="/login" className="inline-flex items-center text-sm font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
                </Link>
              </div>
            </motion.form>
          )}

          {step === 'VERIFY' && (
            <motion.form
              key="verify-form"
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3 }}
              onSubmit={onCodeSubmit} 
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between gap-2 max-w-[320px] mx-auto">
                  {codeDigits.map((digit, index) => (
                    <Input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      ref={(el) => (inputRefs.current[index] = el)}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pasted = e.clipboardData.getData('text/plain').slice(0, 6).replace(/[^0-9]/g, '');
                        if (pasted) {
                          const newCode = [...codeDigits];
                          for (let i = 0; i < pasted.length; i++) newCode[i] = pasted[i];
                          setCodeDigits(newCode);
                          if (pasted.length === 6) inputRefs.current[5]?.focus();
                          else inputRefs.current[pasted.length]?.focus();
                        }
                      }}
                      className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-black rounded-xl bg-white dark:bg-zinc-950 border-2 border-neutral-200 dark:border-zinc-800/50 text-black dark:text-white focus:bg-neutral-50 dark:focus:bg-zinc-900 focus:border-primary transition-all shadow-sm focus:shadow-md px-0"
                    />
                  ))}
                </div>
                {codeError && <p className="text-sm text-red-500 text-center">{codeError}</p>}
              </div>

              <Button type="submit" className="w-full h-14 md:h-16 text-base font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={isCodeSubmitting}>
                {isCodeSubmitting ? 'Verifying...' : 'Verify Code'}
              </Button>
              
              <div className="text-center mt-6">
                <button type="button" onClick={() => setStep('EMAIL')} className="inline-flex items-center text-sm font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Wrong email?
                </button>
              </div>
            </motion.form>
          )}

          {step === 'NEW_PASSWORD' && (
            <motion.form
              key="password-form"
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3 }}
              onSubmit={handlePasswordSubmit(onPasswordSubmit)} 
              className="space-y-6"
            >
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="New Password"
                  {...registerPassword('password')}
                  className="h-14 md:h-16 font-semibold rounded-[1.5rem] bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800/50 text-black dark:text-white placeholder:text-neutral-500 focus:bg-neutral-50 dark:focus:bg-zinc-900 focus:border-primary transition-all px-6 text-base shadow-sm focus:shadow-md"
                />
                {passwordErrors.password && <p className="text-sm text-red-500">{passwordErrors.password.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  {...registerPassword('confirmPassword')}
                  className="h-14 md:h-16 font-semibold rounded-[1.5rem] bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800/50 text-black dark:text-white placeholder:text-neutral-500 focus:bg-neutral-50 dark:focus:bg-zinc-900 focus:border-primary transition-all px-6 text-base shadow-sm focus:shadow-md"
                />
                {passwordErrors.confirmPassword && <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message as string}</p>}
              </div>

              <Button type="submit" className="w-full h-14 md:h-16 text-base font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting ? 'Resetting...' : 'Set Password'}
              </Button>
            </motion.form>
          )}

          {step === 'SUCCESS' && (
            <motion.div
              key="success-form"
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center space-y-6 text-center py-8"
            >
              <div className="h-20 w-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center border-4 border-green-500/20">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <p className="text-neutral-500 font-medium pb-4">You can now securely log in with your updated credentials.</p>
              <Button onClick={() => navigate('/login')} className="w-full h-14 md:h-16 text-base font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Go to Login
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
