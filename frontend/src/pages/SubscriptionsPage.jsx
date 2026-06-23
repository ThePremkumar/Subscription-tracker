import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  getUserSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../api/endpoints';
import SubscriptionCard from '../components/SubscriptionCard';
import SubscriptionModal from '../components/SubscriptionModal';
import toast from 'react-hot-toast';

const ALL_STATUSES  = ['all', 'active', 'cancelled', 'expired'];
const ALL_CATEGORIES = ['all', 'sports', 'news', 'entertainment', 'lifestyle', 'technology', 'finance', 'politics', 'other'];

export default function SubscriptionsPage() {
  const { user } = useAuth();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [modalOpen, setModalOpen]         = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [statusFilter, setStatusFilter]   = useState('all');
  const [catFilter, setCatFilter]         = useState('all');
  const [search, setSearch]               = useState('');

  const fetchSubs = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await getUserSubscriptions(user._id);
      setSubscriptions(res.data?.data || []);
    } catch {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const handleAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleEdit = (sub) => {
    setEditTarget(sub);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;
    try {
      await deleteSubscription(id);
      setSubscriptions((prev) => prev.filter((s) => s._id !== id));
      toast.success('Subscription deleted');
    } catch {
      toast.error('Failed to delete subscription');
    }
  };

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      if (editTarget) {
        // ── Edit existing subscription ──
        const res = await updateSubscription(editTarget._id, formData);
        setSubscriptions((prev) =>
          prev.map((s) => (s._id === editTarget._id ? res.data.data : s))
        );
        toast.success('Subscription updated! ✏️');
      } else {
        // ── Create new subscription ──
        const res = await createSubscription(formData);
        setSubscriptions((prev) => [res.data.data, ...prev]);
        toast.success('Subscription added! 🎉');
      }
      setModalOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save subscription';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Filtering
  const filtered = subscriptions.filter((s) => {
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchCat    = catFilter    === 'all' || s.category === catFilter;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="fade-in flex flex-col gap-6"
    >
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Subscriptions</h1>
          <p className="page-subtitle">
            {subscriptions.length} total tracked · {subscriptions.filter(s => s.status === 'active').length} active
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAdd}
          id="add-subscription-btn"
        >
          <Plus size={16} />
          Add Subscription
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute', left: '1rem',
              top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-faint)',
              pointerEvents: 'none',
            }}
          />
          <input
            id="sub-search"
            type="text"
            className="form-input"
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', borderRadius: '999px' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Status filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-bold mr-2 shrink-0">Status:</span>
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                className={`filter-btn ${statusFilter === s ? 'active' : ''} shrink-0`}
                onClick={() => setStatusFilter(s)}
                id={`filter-status-${s}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-bold mr-2 shrink-0">Category:</span>
            {ALL_CATEGORIES.map((c) => (
              <button
                key={c}
                className={`filter-btn ${catFilter === c ? 'active' : ''} shrink-0`}
                onClick={() => setCatFilter(c)}
                id={`filter-cat-${c}`}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="sub-cards-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card skeleton" style={{ height: 220, borderRadius: 16 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">
            <CreditCard size={32} />
          </div>
          <h3>No subscriptions found</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', maxWidth: '300px' }}>
            {search || statusFilter !== 'all' || catFilter !== 'all'
              ? 'Try adjusting your search query or reset filters.'
              : 'Add your first subscription to get started tracking.'}
          </p>
          {!search && statusFilter === 'all' && catFilter === 'all' && (
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              id="empty-add-btn"
            >
              <Plus size={16} />
              Add Subscription
            </button>
          )}
        </div>
      ) : (
        <motion.div
          layout
          className="sub-cards-grid"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((sub) => (
              <motion.div
                key={sub._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <SubscriptionCard
                  subscription={sub}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal */}
      <SubscriptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editTarget}
        isLoading={saving}
      />
    </motion.div>
  );
}
