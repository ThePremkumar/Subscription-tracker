import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, price: Number(form.price) });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {initialData ? 'Edit Subscription' : 'Add Subscription'}
          </h2>
          <button className="modal-close-btn" onClick={onClose} id="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-form-grid">
            {/* Name */}
            <div className="form-group span-2">
              <label className="form-label" htmlFor="sub-name">Service Name</label>
              <input
                id="sub-name"
                name="name"
                className="form-input"
                placeholder="e.g. Netflix, Spotify..."
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
              />
            </div>

            {/* Price */}
            <div className="form-group">
              <label className="form-label" htmlFor="sub-price">Price</label>
              <input
                id="sub-price"
                name="price"
                type="number"
                min="0"
                max="1000"
                step="0.01"
                className="form-input"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            {/* Currency */}
            <div className="form-group">
              <label className="form-label" htmlFor="sub-currency">Currency</label>
              <select id="sub-currency" name="currency" className="form-select" value={form.currency} onChange={handleChange}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Frequency */}
            <div className="form-group">
              <label className="form-label" htmlFor="sub-frequency">Billing Cycle</label>
              <select id="sub-frequency" name="frequency" className="form-select" value={form.frequency} onChange={handleChange}>
                {FREQUENCIES.map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="sub-category">Category</label>
              <select id="sub-category" name="category" className="form-select" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>

            {/* Payment Method */}
            <div className="form-group">
              <label className="form-label" htmlFor="sub-payment">Payment Method</label>
              <input
                id="sub-payment"
                name="paymentMethod"
                className="form-input"
                placeholder="Credit Card, UPI..."
                value={form.paymentMethod}
                onChange={handleChange}
                required
              />
            </div>

            {/* Start Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="sub-start-date">Start Date</label>
              <input
                id="sub-start-date"
                name="startDate"
                type="date"
                className="form-input"
                value={form.startDate}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Submit */}
            <div className="form-group span-2" style={{ marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                id="sub-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner spinner-sm" />
                    Saving...
                  </>
                ) : initialData ? 'Save Changes' : 'Add Subscription'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
