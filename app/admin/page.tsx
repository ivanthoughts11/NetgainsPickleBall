
'use client';

import { useEffect, useState } from 'react';
import {
  LogOut,
  RefreshCw,
  Trash2,
} from 'lucide-react';

type Booking = {
  id: string;
  reference: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  email: string;
  phone: string;
  players: number;
  status: string;
  paymentStatus: string;
  notes?: string | null;
};

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);

    try {
      const r = await fetch('/api/admin/bookings');

      if (r.ok) {
        setAuth(true);
        setBookings(await r.json());
      }
    } catch {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!r.ok) {
        setError('Invalid password');
        return;
      }

      setPassword('');
      await load();
    } catch {
      setError('Login failed. Please try again.');
    }
  }

  async function update(id: string, status: string) {
    setError('');

    try {
      const r = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const result = await r.json();

      if (!r.ok) {
        setError(result.error || 'Failed to update booking.');
        return;
      }

      await load();
    } catch {
      setError('Failed to update booking.');
    }
  }

  async function deleteBooking(booking: Booking) {
    if (
      booking.status !== 'PENDING' ||
      booking.paymentStatus !== 'UNPAID'
    ) {
      setError('Only pending, unpaid bookings can be deleted.');
      return;
    }

    const confirmed = window.confirm(
      `Permanently delete booking ${booking.reference} for ${booking.customerName}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(booking.id);
    setError('');

    try {
      const r = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'DELETE',
      });

      const result = await r.json();

      if (!r.ok) {
        setError(result.error || 'Failed to delete booking.');
        return;
      }

      setBookings((current) =>
        current.filter((b) => b.id !== booking.id)
      );
    } catch {
      setError('Failed to delete booking. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuth(false);
    setBookings([]);
  }

  if (!auth) {
    return (
      <div className="login">
        <form className="login-card" onSubmit={login}>
          <div className="brand" style={{ marginBottom: 20 }}>
            <div className="brand-mark">NG</div>
            <div>
              NET <span>GAINS</span>
            </div>
          </div>

          <h2 style={{ fontFamily: 'Outfit' }}>Admin Dashboard</h2>
          <p className="muted">
            Sign in to manage court reservations.
          </p>

          <div className="field">
            <label>Admin password</label>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="notice error">{error}</div>}

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Sign in
          </button>
        </form>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  const todayBookings = bookings.filter(
    (b) => b.date.startsWith(today) && b.status !== 'CANCELLED'
  );

  const revenue =
    todayBookings.length *
    Number(process.env.NEXT_PUBLIC_HOURLY_RATE || 500);

  return (
    <div className="admin">
      <div className="admin-nav">
        <div className="container nav-inner">
          <div className="brand" style={{ color: 'white' }}>
            NET <span>GAINS</span>{' '}
            <small style={{ color: '#aaa' }}>ADMIN</small>
          </div>

          <div className="admin-actions">
            <button onClick={load} disabled={loading} title="Refresh">
              <RefreshCw size={16} />
            </button>
            <button onClick={logout} title="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div style={{ paddingTop: 30 }}>
          <div className="eyebrow">OVERVIEW</div>
          <h1 style={{ fontFamily: 'Outfit' }}>Booking Dashboard</h1>
        </div>

        {error && (
          <div className="notice error" style={{ marginTop: 16 }}>
            {error}
            <button
              onClick={() => setError('')}
              style={{ marginLeft: 12 }}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="admin-grid">
          <div className="stat">
            <span className="small">Today's bookings</span>
            <strong>{todayBookings.length}</strong>
          </div>

          <div className="stat">
            <span className="small">Today's estimated revenue</span>
            <strong>₱{revenue.toLocaleString()}</strong>
          </div>

          <div className="stat">
            <span className="small">All bookings</span>
            <strong>{bookings.length}</strong>
          </div>

          <div className="stat">
            <span className="small">Court</span>
            <strong>1</strong>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Date</th>
                <th>Time</th>
                <th>Customer</th>
                <th>Players</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b) => {
                const canDelete =
                  b.status === 'PENDING' &&
                  b.paymentStatus === 'UNPAID';

                return (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.reference}</strong>
                    </td>

                    <td>{new Date(b.date).toLocaleDateString()}</td>
                    <td>
                      {b.startTime}–{b.endTime}
                    </td>

                    <td>
                      {b.customerName}
                      <br />
                      <span className="small">{b.phone}</span>
                    </td>

                    <td>{b.players}</td>

                    <td>
                      <span
                        className={`badge ${
                          b.status === 'CONFIRMED'
                            ? 'green'
                            : b.status === 'CANCELLED'
                              ? 'red'
                              : 'yellow'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td>{b.paymentStatus}</td>

                    <td>
                      <div className="admin-actions">
                        <button
                          disabled={loading || deletingId !== null}
                          onClick={() => update(b.id, 'CONFIRMED')}
                          title="Confirm booking"
                        >
                          Confirm
                        </button>

                        <button
                          disabled={loading || deletingId !== null}
                          onClick={() => update(b.id, 'CANCELLED')}
                          title="Cancel booking"
                        >
                          Cancel
                        </button>

                        <button
                          disabled={!canDelete || deletingId !== null}
                          onClick={() => deleteBooking(b)}
                          title={
                            canDelete
                              ? 'Delete pending unpaid booking'
                              : 'Only pending, unpaid bookings can be deleted'
                          }
                          aria-label={`Delete booking ${b.reference}`}
                          style={{
                            color: canDelete ? '#dc2626' : '#999',
                            cursor: canDelete ? 'pointer' : 'not-allowed',
                            opacity: canDelete ? 1 : 0.4,
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!bookings.length && (
                <tr>
                  <td colSpan={8} className="center">
                    {loading ? 'Loading bookings...' : 'No bookings yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}