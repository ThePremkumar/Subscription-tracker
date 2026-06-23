import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="auth-card glass-card"
      >
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">
            <Zap size={22} color="#fff" />
          </span>
          <span className="auth-logo-text gradient-text">SubTrack</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to manage your subscriptions</p>

        <form className="auth-form" onSubmit={handleSubmit} id="login-form">
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute', left: '0.9rem',
                  top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-faint)',
                  pointerEvents: 'none'
                }}
              />
              <input
                id="login-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute', left: '0.9rem',
                  top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-faint)',
                  pointerEvents: 'none'
                }}
              />
              <input
                id="login-password"
                name="password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                style={{
                  position: 'absolute', right: '0.9rem',
                  top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--color-text-muted)',
                  display: 'flex'
                }}
                id="toggle-password"
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            id="login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm" />
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="auth-link-row">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link" id="go-to-register">
            Create one
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
