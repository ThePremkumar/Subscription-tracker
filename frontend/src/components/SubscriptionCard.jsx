import { Trash2, Edit2 } from 'lucide-react';
import { format, parseISO, differenceInDays } from '../utils/dateHelpers';

// Currency symbols
const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

function renewalUrgency(renewalDate) {
  if (!renewalDate) return null;
  const days = differenceInDays(renewalDate);
  if (days < 0) return 'expired';
  if (days <= 7) return 'warning';
  return 'active';
}

export default function SubscriptionCard({ subscription, onEdit, onDelete }) {
  const {
    name, price, currency, frequency, category,
    paymentMethod, status, startDate, renewalDate,
  } = subscription;

  const symbol   = CURRENCY_SYMBOLS[currency] || currency;
  const urgency  = renewalUrgency(renewalDate);

  return (
    <article className="glass-card sub-card">
      {/* Top row */}
      <div className="sub-card-top">
        <div>
          <p className="sub-card-name">{name}</p>
          <p className="sub-card-category">{category}</p>
        </div>
        <div className="sub-card-price">
          <p className="sub-card-amount">{symbol}{Number(price).toFixed(2)}</p>
          <p className="sub-card-freq">/ {frequency}</p>
        </div>
      </div>

      <hr className="sub-card-divider" />

      {/* Meta */}
      <div className="sub-card-meta">
        <div className="sub-card-meta-item">
          <span className="sub-card-meta-label">Payment</span>
          <span className="sub-card-meta-value">{paymentMethod}</span>
        </div>
        <div className="sub-card-meta-item">
          <span className="sub-card-meta-label">Started</span>
          <span className="sub-card-meta-value">{format(startDate)}</span>
        </div>
        {renewalDate && (
          <div className="sub-card-meta-item" style={{ gridColumn: 'span 2' }}>
            <span className="sub-card-meta-label">Next Renewal</span>
            <span className="sub-card-meta-value">{format(renewalDate)}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sub-card-footer">
        <span className={`badge badge-${status}`}>{status}</span>
        {urgency === 'warning' && status === 'active' && (
          <span className="badge" style={{ background: 'rgba(255,169,77,0.15)', color: 'var(--color-warning)', marginLeft: 6 }}>
            Renews soon
          </span>
        )}

        <div className="sub-card-actions">
          {onEdit && (
            <button
              className="icon-btn"
              onClick={() => onEdit(subscription)}
              title="Edit subscription"
              id={`edit-sub-${subscription._id}`}
            >
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button
              className="icon-btn danger"
              onClick={() => onDelete(subscription._id)}
              title="Delete subscription"
              id={`delete-sub-${subscription._id}`}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
