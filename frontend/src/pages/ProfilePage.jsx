import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, deleteAccount, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    setDeleteError('');

    if (deleteConfirmation.trim().toUpperCase() !== 'DELETE') {
      setDeleteError("Please type 'DELETE' in all caps to confirm.");
      return;
    }

    if (!deletePassword.trim()) {
      setDeleteError('Please enter your password or authorization code to verify identity.');
      return;
    }

    setDeleting(true);
    try {
      await deleteAccount(deletePassword.trim(), deleteConfirmation.trim());
      alert('Your account has been successfully deleted and deactivated.');
      navigate('/');
    } catch (err) {
      setDeleteError(err.message || 'Verification failed. Unable to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '2.5rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--charcoal-black)', margin: 0 }}>
              User Profile
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem', margin: 0 }}>
              Manage your campus identity and security credentials
            </p>
          </div>
          <span className="badge badge-active" style={{ fontSize: '0.82rem', padding: '0.35rem 0.85rem' }}>
            {user?.role === 'ROLE_ADMIN' ? '🛡️ Administrator' : '🎓 Student'}
          </span>
        </div>

        {/* Profile Details Panel */}
        <div style={{
          background: 'rgba(7, 21, 33, 0.4)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ice-glass)', marginTop: '0.2rem' }}>
              {user?.name || 'Campus User'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Email Address</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', marginTop: '0.2rem' }}>
              {user?.email || 'N/A'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Role & Status</span>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.3rem', alignItems: 'center' }}>
              <span className="badge badge-found" style={{ fontSize: '0.75rem' }}>
                {user?.accountStatus || 'APPROVED'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isAdmin ? 'Full administrative authority' : 'Active verified student'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="btn btn-ice-glass">
            ← Return to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => { setShowDeleteModal(true); setDeleteError(''); }}
            className="btn btn-danger-glass"
          >
            🗑️ Delete Account
          </button>
        </div>
      </div>

      {/* Account Deletion Verification Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(4, 12, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(239, 68, 68, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--danger)' }}>
              <span style={{ fontSize: '1.75rem' }}>⚠️</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#f87171' }}>
                Verify Account Deletion
              </h2>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Deleting your account is permanent. Your active authentication tokens will be revoked and you will be signed out immediately.
            </p>

            {deleteError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid var(--danger)',
                color: '#fca5a5',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  Step 1: Enter Current Password or Authorization Code *
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password to verify ownership"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  Step 2: Type <strong style={{ color: '#f87171' }}>DELETE</strong> in capital letters to confirm *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type DELETE"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-cancel-glass"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger-glass"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Confirm Account Deletion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}