import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Semantic status badges:
 *  Green  → completed, paid, ready, available, active, approved
 *  Blue   → confirmed, accepted, billing, reserved, new
 *  Amber  → preparing, pending, partially_paid, occupied
 *  Red    → cancelled, refunded, critical, cleaning
 *  Gray   → everything else
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const s = status?.toLowerCase();

  let cls = '';
  if (['completed', 'paid', 'ready', 'available', 'active', 'approved', 'served'].includes(s)) {
    cls = 'badge-success';
  } else if (['confirmed', 'accepted', 'reserved', 'billing', 'new'].includes(s)) {
    cls = 'badge-info';
  } else if (['preparing', 'pending', 'partially_paid', 'occupied', 'processing'].includes(s)) {
    cls = 'badge-warning';
  } else if (['cancelled', 'refunded', 'critical', 'cleaning', 'failed', 'rejected'].includes(s)) {
    cls = 'badge-danger';
  } else {
    cls = 'badge-neutral';
  }

  const label = status?.replace(/_/g, ' ') ?? 'Unknown';

  return (
    <span className={`${cls} ${className}`}>
      {label}
    </span>
  );
};
