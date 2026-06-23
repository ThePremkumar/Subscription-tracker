import { Trash2, Edit2, Mail, MailCheck, Calendar, Wallet } from 'lucide-react';
import { format, formatDateTime, differenceInDays } from '../utils/dateHelpers';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

function renewalUrgency(renewalDate) {
  if (!renewalDate) return null;
  const days = differenceInDays(renewalDate);
  if (days < 0) return 'expired';
  if (days <= 7) return 'warning';
  return 'active';
}

function getCycleProgress(startDate, renewalDate) {
  if (!startDate || !renewalDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(renewalDate).getTime();
  const now = new Date().getTime();
  if (now >= end) return 100;
  if (now <= start) return 0;
  const total = end - start;
  const elapsed = now - start;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

export default function SubscriptionCard({ subscription, onEdit, onDelete }) {
  const {
    name, price, currency, frequency, category,
    paymentMethod, status, startDate, renewalDate,
    lastEmailSentAt, emailSentCount,
  } = subscription;

  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const urgency = renewalUrgency(renewalDate);
  const emailSent = !!lastEmailSentAt;
  const progress = getCycleProgress(startDate, renewalDate);

  return (
    <article className="glass-card sub-card">
      {/* Top row */}
      <div className="sub-card-top">
        <div>
          <p className="sub-card-name">{name}</p>
          <span className={`badge badge-${category}`}>
            {category}
          </span>
        </div>
        <div className="sub-card-price">
          <p className="sub-card-amount">{symbol}{Number(price).toFixed(2)}</p>
          <p className="sub-card-freq">/ {frequency}</p>
        </div>
      </div>

      {/* Progress of Billing Cycle */}
      {status === 'active' && renewalDate && (
        <div style={{ margin: '1rem 0 0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
            <span>Cycle Progress</span>
            <span>{progress}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--color-surface-2)', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'var(--grad-primary)',
                borderRadius: 99,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>
      )}

      <hr className="sub-card-divider" />

      {/* Metadata */}
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

      {/* Email Notification Status */}
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
          : <Mail size={14} style={{ color: 'var(--color-text-faint)', flexShrink: 0 }} />
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          {emailSent ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>Reminder sent</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{formatDateTime(lastEmailSentAt)}</span>
              {emailSentCount > 1 && (
                <span style={{
                  fontSize: '0.65rem', color: 'var(--color-text-faint)',
                  background: 'rgba(81,207,102,0.12)', padding: '0 5px', borderRadius: 99,
                }}>
                  ×{emailSentCount}
                </span>
              )}
            </div>
          ) : (
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-faint)' }}>
              No reminder sent yet
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sub-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge badge-${status}`}>{status}</span>
          {urgency === 'warning' && status === 'active' && (
            <span className="badge" style={{ background: 'rgba(255,169,77,0.15)', color: 'var(--color-warning)' }}>
              Renews soon
            </span>
          )}
        </div>

        <div className="sub-card-actions">
          {onEdit && (
            <button
              className="icon-btn"
              onClick={() => onEdit(subscription)}
              title="Edit subscription"
              id={`edit-sub-${subscription._id}`}
            >
              <Edit2 size={13} />
            </button>
          )}
          {onDelete && (
            <button
              className="icon-btn danger"
              onClick={() => onDelete(subscription._id)}
              title="Delete subscription"
              id={`delete-sub-${subscription._id}`}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
