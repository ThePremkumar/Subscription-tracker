import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CreditCard, DollarSign, TrendingUp, AlertCircle, Plus, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserSubscriptions } from '../api/endpoints';
import { format, differenceInDays } from '../utils/dateHelpers';
import toast from 'react-hot-toast';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

const COLORS = [
  '#6c63ff', // Primary
  '#00d4aa', // Secondary
  '#ff6b6b', // Accent
  '#ffa94d', // Warning
  '#51cf66', // Success
  '#a855f7', // Purple
  '#00b4d8', // Cyan
  '#e91e63'  // Pink
];

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
  const monthly   = calcMonthlySpend(subscriptions);
  const upcoming  = getUpcomingRenewals(subscriptions);

  // Group by category for charts
  const byCategoryCount = subscriptions.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

  const mapFreq = { daily: 30, weekly: 4.33, monthly: 1, yearly: 1 / 12 };
  const byCategorySpend = subscriptions.reduce((acc, s) => {
    if (s.status === 'active') {
      const monthlySpend = s.price * (mapFreq[s.frequency] || 1);
      acc[s.category] = (acc[s.category] || 0) + monthlySpend;
    }
    return acc;
  }, {});

  const categoryPieData = Object.entries(byCategoryCount).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const categoryBarData = Object.entries(byCategorySpend).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    amount: Math.round(value),
  })).sort((a, b) => b.amount - a.amount);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="fade-in flex flex-col gap-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
        <div>
          <h1 className="page-title">
            Hey, <span className="gradient-text">{firstName}</span> 👋
          </h1>
          <p className="page-subtitle">Here's your real-time subscription overview</p>
        </div>
        <Link
          to="/subscriptions"
          className="btn btn-primary"
          id="dash-add-first-sub-header"
        >
          <Plus size={16} /> Add Subscription
        </Link>
      </motion.div>

      {/* Stats Grid */}
      {loading ? (
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card stat-card skeleton" style={{ height: 130 }} />
          ))}
        </div>
      ) : (
        <motion.div variants={itemVariants} className="stats-grid">
          {/* Card 1 */}
          <motion.div whileHover={{ scale: 1.02 }} className="glass-card stat-card cursor-pointer">
            <div className="stat-icon stat-icon-primary">
              <CreditCard size={20} />
            </div>
            <p className="stat-value">{subscriptions.length}</p>
            <p className="stat-label">Total Subscriptions</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div whileHover={{ scale: 1.02 }} className="glass-card stat-card cursor-pointer">
            <div className="stat-icon stat-icon-success">
              <TrendingUp size={20} />
            </div>
            <p className="stat-value">{active}</p>
            <p className="stat-label">Active Contracts</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div whileHover={{ scale: 1.02 }} className="glass-card stat-card cursor-pointer">
            <div className="stat-icon stat-icon-warning">
              <DollarSign size={20} />
            </div>
            <p className="stat-value gradient-text">
              ₹{monthly.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="stat-label">Monthly Spend (est.)</p>
          </motion.div>

          {/* Card 4 */}
          <motion.div whileHover={{ scale: 1.02 }} className="glass-card stat-card cursor-pointer">
            <div className="stat-icon stat-icon-danger">
              <AlertCircle size={20} />
            </div>
            <p className="stat-value">{upcoming.length}</p>
            <p className="stat-label">Renewing this month</p>
          </motion.div>
        </motion.div>
      )}

      {/* Analytics & Charts */}
      {!loading && subscriptions.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spend By Category (BarChart) */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 className="section-title">Monthly Cost by Category (Active)</h2>
            {categoryBarData.length === 0 ? (
              <div style={{ height: 256, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                No active subscription spend data available.
              </div>
            ) : (
              <div style={{ height: 256 }}>
                <ResponsiveContainer width="100%" height={256}>
                  <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#8892a4" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8892a4" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      contentStyle={{
                        background: '#0f1120',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="amount" fill="#6c63ff" radius={[8, 8, 0, 0]}>
                      {categoryBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Distribution By Category (PieChart) */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 className="section-title">Subscriptions Distribution</h2>
            <div style={{ height: 256, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={256}>
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0f1120',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{subscriptions.length}</span>
                <span style={{ fontSize: '0.65rem', uppercase: true, tracking: '0.1em', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>Services</span>
              </div>
            </div>
            {/* Custom Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem 1rem', marginTop: '1rem' }}>
              {categoryPieData.map((entry, index) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Renewals Timeline & List */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Renewals */}
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
                        {s.daysLeft === 0 ? (
                          <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>Renewing Today</span>
                        ) : (
                          `In ${s.daysLeft} day${s.daysLeft !== 1 ? 's' : ''}`
                        )} · {format(s.renewalDate)}
                      </p>
                    </div>
                    <span className="timeline-price">{sym}{s.price}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Breakdown (Linear Bars for quick breakdown) */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h2 className="section-title">Volume Breakdown</h2>
          {loading ? (
            <div className="loading-screen" style={{ minHeight: 120 }}>
              <div className="spinner" />
            </div>
          ) : categoryPieData.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No subscriptions added yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {categoryPieData.map((item, idx) => {
                const pct = subscriptions.length ? Math.round((item.value / subscriptions.length) * 100) : 0;
                return (
                  <div key={item.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.85rem', textTransform: 'capitalize', fontWeight: 500 }}>{item.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.value} · {pct}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--color-surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: COLORS[idx % COLORS.length],
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
      </motion.div>

      {/* Quick CTA */}
      {!loading && subscriptions.length === 0 && (
        <motion.div
          variants={itemVariants}
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
        </motion.div>
      )}
    </motion.div>
  );
}
