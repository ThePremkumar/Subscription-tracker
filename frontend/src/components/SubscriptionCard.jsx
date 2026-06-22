import { Trash2, Edit2, Mail, MailCheck } from 'lucide-react';
import { format, formatDateTime, differenceInDays } from '../utils/dateHelpers';

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
    lastEmailSentAt, emailSentCount,
  } = subscription;

  const symbol    = CURRENCY_SYMBOLS[currency] || currency;
  const urgency   = renewalUrgency(renewalDate);
  const emailSent = !!lastEmailSentAt;

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

      {/* ── Email Notification Status ── */}
      <div style={{
        marginTop: '0.85rem',
        padding: '0.6rem 0.85rem',
        borderRadius: 'var(--radius-md)',
        background: emailSent ? 'rgba(81,207,102,0.08)' : 'rgba(136,146,164,0.08)',
        border: `1px solid ${emailSent ? 'rgba(81,207,102,0.2)' : 'rgba(136,146,164,0.15)'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        {emailSent
          ? <MailCheck size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
          : <Mail     size={14} style={{ color: 'var(--color-text-faint)', flexShrink: 0 }} />
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          {emailSent ? (
            <>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)' }}>
                Reminder sent
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginLeft: 6 }}>
                {formatDateTime(lastEmailSentAt)}
              </span>
              {emailSentCount > 1 && (
                <span style={{
                  fontSize: '0.68rem', color: 'var(--color-text-faint)', marginLeft: 6,
                  background: 'rgba(81,207,102,0.12)', padding: '0 5px', borderRadius: 99,
                }}>
                  ×{emailSentCount}
                </span>
              )}
            </>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>
              No reminder sent yet
            </span>
          )}
        </div>
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
            <button className="icon-btn" onClick={() => onEdit(subscription)}
              title="Edit subscription" id={`edit-sub-${subscription._id}`}>
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button className="icon-btn danger" onClick={() => onDelete(subscription._id)}
              title="Delete subscription" id={`delete-sub-${subscription._id}`}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}



