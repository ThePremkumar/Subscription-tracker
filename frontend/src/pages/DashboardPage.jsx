import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, DollarSign, TrendingUp, AlertCircle, Plus, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserSubscriptions } from '../api/endpoints';
import { format, differenceInDays } from '../utils/dateHelpers';
import toast from 'react-hot-toast';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

function calcMonthlySpend(subs) {
  const map = { daily: 30, weekly: 4.33, monthly: 1, yearly: 1 / 12 };
  return subs
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.price * (map[s.frequency] || 1), 0);
}

function getUpcomingRenewals(subs) {
  return subs
    .filter((s) => s.status === 'active' && s.renewalDate)
    .map((s) => ({ ...s, daysLeft: differenceInDays(s.renewalDate) }))
    .filter((s) => s.daysLeft >= 0 && s.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading]             = useState(true);

  const fetchSubs = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await getUserSubscriptions(user._id);
      setSubscriptions(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const active    = subscriptions.filter((s) => s.status === 'active').length;
  const cancelled = subscriptions.filter((s) => s.status === 'cancelled').length;
  const expired   = subscriptions.filter((s) => s.status === 'expired').length;
  const monthly   = calcMonthlySpend(subscriptions);
  const upcoming  = getUpcomingRenewals(subscriptions);

  // Group by category
  const byCategory = subscriptions.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Hey, <span className="gradient-text">{firstName}</span> 👋
        </h1>
        <p className="page-subtitle">Here's your subscription overview</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card stat-card skeleton" style={{ height: 130 }} />
          ))}
        </div>
      ) : (
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <div className="stat-icon stat-icon-primary">
              <CreditCard size={20} />
            </div>
            <p className="stat-value">{subscriptions.length}</p>
            <p className="stat-label">Total Subscriptions</p>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon stat-icon-success">
              <TrendingUp size={20} />
            </div>
            <p className="stat-value">{active}</p>
            <p className="stat-label">Active</p>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon stat-icon-warning">
              <DollarSign size={20} />
            </div>
            <p className="stat-value gradient-text">
              ₹{monthly.toFixed(0)}
            </p>
            <p className="stat-label">Monthly Spend (est.)</p>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon stat-icon-danger">
              <AlertCircle size={20} />
            </div>
            <p className="stat-value">{upcoming.length}</p>
            <p className="stat-label">Renewing this month</p>
          </div>
        </div>
      )}

      {/* Two-column section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}
           className="dash-two-col">

        {/* Upcoming Renewals */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Upcoming Renewals</h2>
            <Calendar size={18} style={{ color: 'var(--color-text-faint)' }} />
          </div>

          {loading ? (
            <div className="loading-screen" style={{ minHeight: 120 }}>
              <div className="spinner" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                No renewals in the next 30 days 🎉
              </p>
            </div>
          ) : (
            <div className="timeline-list">
              {upcoming.map((s) => {
                const sym = CURRENCY_SYMBOLS[s.currency] || s.currency;
                const dotClass = s.daysLeft <= 7 ? 'timeline-dot-warning' : 'timeline-dot-active';
                return (
                  <div className="timeline-item" key={s._id}>
                    <span className={`timeline-dot ${dotClass}`} />
                    <div className="timeline-info">
                      <p className="timeline-name">{s.name}</p>
                      <p className="timeline-date">
                        {s.daysLeft === 0 ? 'Today' : `In ${s.daysLeft} day${s.daysLeft !== 1 ? 's' : ''}`} · {format(s.renewalDate)}
                      </p>
                    </div>
                    <span className="timeline-price">{sym}{s.price}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h2 className="section-title">By Category</h2>
          {loading ? (
            <div className="loading-screen" style={{ minHeight: 120 }}>
              <div className="spinner" />
            </div>
          ) : topCategories.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No subscriptions yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {topCategories.map(([cat, count]) => {
                const pct = subscriptions.length ? Math.round((count / subscriptions.length) * 100) : 0;
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.85rem', textTransform: 'capitalize', fontWeight: 500 }}>{cat}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{count} · {pct}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--color-surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'var(--grad-primary)',
                          borderRadius: 99,
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick CTA */}
      {!loading && subscriptions.length === 0 && (
        <div
          className="glass-card"
          style={{
            marginTop: '1.5rem',
            padding: '3rem',
            textAlign: 'center',
            background: 'var(--grad-card)',
          }}
        >
          <div className="empty-state-icon" style={{ margin: '0 auto 1rem' }}>
            <CreditCard size={32} />
          </div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>No subscriptions yet</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Start tracking by adding your first subscription
          </p>
          <Link to="/subscriptions" className="btn btn-primary btn-lg" id="dash-add-first-sub">
            <Plus size={18} />
            Add First Subscription
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .dash-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
