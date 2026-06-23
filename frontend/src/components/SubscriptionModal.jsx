import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES  = ['sports', 'news', 'entertainment', 'lifestyle', 'technology', 'finance', 'politics', 'other'];
const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];
const CURRENCIES  = ['INR', 'USD', 'EUR', 'GBP'];

const EMPTY_FORM = {
  name: '',
  price: '',
  currency: 'INR',
  frequency: 'monthly',
  category: 'entertainment',
  paymentMethod: '',
  startDate: '',
};

export default function SubscriptionModal({ isOpen, onClose, onSubmit, initialData, isLoading }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (initialData) {
      setForm({
        name:          initialData.name         || '',
        price:         initialData.price         || '',
        currency:      initialData.currency      || 'INR',
        frequency:     initialData.frequency     || 'monthly',
        category:      initialData.category      || 'entertainment',
        paymentMethod: initialData.paymentMethod || '',
        startDate:     initialData.startDate
          ? new Date(initialData.startDate).toISOString().split('T')[0]
          : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, price: Number(form.price) });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="w-full max-w-lg bg-[#0f1120] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {initialData ? 'Edit Subscription Details' : 'Add Subscription Contract'}
              </h2>
              <button
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                onClick={onClose}
                id="modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {/* Service Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400" htmlFor="sub-name">
                  Service Name
                </label>
                <input
                  id="sub-name"
                  name="name"
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none transition-all duration-300"
                  placeholder="e.g. Netflix, Spotify, AWS..."
                  value={form.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                />
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400" htmlFor="sub-price">
                    Price
                  </label>
                  <input
                    id="sub-price"
                    name="price"
                    type="number"
                    min="0"
                    max="1000000"
                    step="0.01"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2.5 text-white placeholder-0.00 outline-none transition-all duration-300"
                    placeholder="0.00"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400" htmlFor="sub-currency">
                    Currency
                  </label>
                  <select
                    id="sub-currency"
                    name="currency"
                    className="w-full bg-[#16182c] border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2.5 text-white outline-none transition-all duration-300 cursor-pointer"
                    value={form.currency}
                    onChange={handleChange}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c} className="bg-[#0f1120]">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Billing Cycle & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400" htmlFor="sub-frequency">
                    Billing Cycle
                  </label>
                  <select
                    id="sub-frequency"
                    name="frequency"
                    className="w-full bg-[#16182c] border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2.5 text-white outline-none transition-all duration-300 cursor-pointer"
                    value={form.frequency}
                    onChange={handleChange}
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f} value={f} className="bg-[#0f1120]">
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400" htmlFor="sub-category">
                    Category
                  </label>
                  <select
                    id="sub-category"
                    name="category"
                    className="w-full bg-[#16182c] border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2.5 text-white outline-none transition-all duration-300 cursor-pointer"
                    value={form.category}
                    onChange={handleChange}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#0f1120]">
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Method & Start Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400" htmlFor="sub-payment">
                    Payment Method
                  </label>
                  <input
                    id="sub-payment"
                    name="paymentMethod"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2.5 text-white placeholder-Credit Card, UPI... outline-none transition-all duration-300"
                    placeholder="Credit Card, UPI..."
                    value={form.paymentMethod}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400" htmlFor="sub-start-date">
                    Start Date
                  </label>
                  <input
                    id="sub-start-date"
                    name="startDate"
                    type="date"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2.5 text-white outline-none transition-all duration-300 cursor-pointer"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold shadow-lg shadow-violet-500/20 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                  id="sub-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving changes...
                    </>
                  ) : initialData ? 'Save Changes' : 'Add Subscription'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
