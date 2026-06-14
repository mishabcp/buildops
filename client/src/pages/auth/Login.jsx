import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authStore } from '../../store/authStore.js';
import { toastStore } from '../../store/toastStore.js';
import { login as loginApi } from '../../api/auth.api.js';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { ArrowRight, Loader2, Mail, Lock, ShieldCheck } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = authStore((s) => s.setAuth);

  const from = location.state?.from?.pathname ?? '/';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(email.trim(), password);
      if (res?.success && res?.data) {
        setAuth(res.data.user, res.data.token);
        toastStore.getState().success('Welcome back!');
        navigate(from, { replace: true });
      } else {
        const msg = res?.error ?? 'Invalid email or password';
        setError(msg);
        toastStore.getState().error(msg);
      }
    } catch (err) {
      const message = err.response?.data?.error ?? err.message ?? 'Login failed. Please try again.';
      setError(message);
      toastStore.getState().error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 lg:bg-white text-slate-900 overflow-hidden font-sans">
      {/* Left Pane - Branding & Visuals (Hidden on small screens) */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-brand-950 px-12 pb-12 pt-16">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-brand-600/30 mix-blend-screen blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute right-0 top-1/2 h-[32rem] w-[32rem] -translate-y-1/2 translate-x-1/3 rounded-full bg-accent-500/20 mix-blend-screen blur-[100px]" />
        
        <div className="relative z-10 flex flex-col h-full justify-between gap-12">
          {/* Logo / Header */}
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg shadow-brand-500/30">
              <img src="/logo.png" alt="Buildops logo" className="h-9 w-9 object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Buildops Workspace</span>
          </div>
          
          {/* Hero text */}
          <div className="max-w-lg">
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 sm:text-5xl lg:text-5xl leading-[1.15]">
              Manage your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">operations</span> smartly.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300 font-medium">
              A comprehensive system tailored for seamless project management, transparent billing, and efficient resource allocation. 
              Built for scale and reliability.
            </p>
          </div>

          {/* Trust indicator */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-sm mt-auto shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-accent-500/20 rounded-lg">
                <ShieldCheck className="h-7 w-7 text-accent-400" />
              </div>
              <div>
                <p className="font-semibold text-white tracking-wide">Enterprise Security</p>
                <p className="text-sm text-slate-400 font-medium mt-0.5">Your sessions are protected end-to-end.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Form Area */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2 lg:px-12 bg-white relative">
        <div className={`w-full max-w-[400px] transition-all duration-700 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Mobile Logo */}
          <div className="mb-10 lg:hidden flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-xl shadow-brand-500/10">
              <img src="/logo.png" alt="Buildops logo" className="h-12 w-12 object-contain" />
            </div>
          </div>
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
            <p className="mt-2 text-[15px] font-medium text-slate-500">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div className="space-y-5">
              <div className="group relative">
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  required
                  autoComplete="email"
                  className="pl-11 h-14 bg-slate-50 hover:bg-slate-100 border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 transition-all text-[15px] font-medium rounded-xl shadow-sm"
                />
              </div>

              <div className="group relative">
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="pl-11 h-14 bg-slate-50 hover:bg-slate-100 border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 transition-all text-[15px] font-medium rounded-xl shadow-sm"
                />
              </div>
            </div>

            {error && (
              <div className="animate-in fade-in slide-in-from-top-2 rounded-xl bg-red-50 p-3.5 text-sm font-medium text-red-600 border border-red-100 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-600 animate-[pulse_1.5s_ease-in-out_infinite]" />
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="group relative w-full h-14 text-base font-semibold shadow-lg shadow-brand-500/20 transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white" 
              disabled={loading}
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign in to Workspace
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </Button>

            <div className="pt-6 text-center">
              <Link 
                to="/guide" 
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                Need help? View user guide
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
