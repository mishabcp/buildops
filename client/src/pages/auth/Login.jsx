import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authStore } from '../../store/authStore.js';
import { toastStore } from '../../store/toastStore.js';
import { login as loginApi } from '../../api/auth.api.js';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = authStore((s) => s.setAuth);

  const from = location.state?.from?.pathname ?? '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(email.trim(), password);
      if (res?.success && res?.data) {
        setAuth(res.data.user, res.data.token);
        toastStore.getState().success('Signed in successfully');
        navigate(from, { replace: true });
      } else {
        const msg = res?.error ?? 'Login failed';
        setError(msg);
        toastStore.getState().error(msg);
      }
    } catch (err) {
      const message = err.response?.data?.error ?? err.message ?? 'Login failed';
      setError(message);
      toastStore.getState().error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>CBMS — Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
