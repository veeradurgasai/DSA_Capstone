import React, { useState, useEffect } from 'react';
import { claimService } from '../services';
import { useAuth } from '../context/AuthContext';

export function ClaimsPage() {
  const { user, isAdmin } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL');

  useEffect(() => {
    loadClaims();
  }, [isAdmin]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const data = isAdmin ? await claimService.getAllClaims() : await claimService.getMyClaims();
      setClaims(data || []);
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    const notes = window.prompt(`Enter review notes for ${status}:`, status === 'APPROVED' ? 'Proof verified.' : 'Proof unverified.');
    if (notes !== null) {
      await claimService.reviewClaim(id, status, notes);
      loadClaims();
    }
  };

  const pendingCount = claims.filter(c => c.status === 'PENDING').length;
  const approvedCount = claims.filter(c => c.status === 'APPROVED').length;
  const rejectedCount = claims.filter(c => c.status === 'REJECTED').length;

  const filteredClaims = filterTab === 'ALL' ? claims : claims.filter(c => c.status === filterTab);

  if (loading) {
    return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Loading claims...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF' }}>
          {isAdmin ? 'Campus Claims Adjudication' : 'My Ownership Claims'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {isAdmin ? 'Verify student identification proof before releasing found property.' : 'Track the review status of items you have claimed.'}
        </p>
      </div>

      {/* Tabs Filter Bar */}
      <div className="dashboard-tab-bar">
        <button
          type="button"
          className={`dashboard-tab-item ${filterTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterTab('ALL')}
        >
          <span>All Claims</span>
          <span className="dashboard-tab-badge">{claims.length}</span>
        </button>
        <button
          type="button"
          className={`dashboard-tab-item ${filterTab === 'PENDING' ? 'active' : ''}`}
          onClick={() => setFilterTab('PENDING')}
        >
          <span>⏳ Pending Review</span>
          <span className={`dashboard-tab-badge ${pendingCount > 0 ? 'badge-highlight' : ''}`}>{pendingCount}</span>
        </button>
        <button
          type="button"
          className={`dashboard-tab-item ${filterTab === 'APPROVED' ? 'active' : ''}`}
          onClick={() => setFilterTab('APPROVED')}
        >
          <span>✓ Approved</span>
          <span className="dashboard-tab-badge">{approvedCount}</span>
        </button>
        <button
          type="button"
          className={`dashboard-tab-item ${filterTab === 'REJECTED' ? 'active' : ''}`}
          onClick={() => setFilterTab('REJECTED')}
        >
          <span>✕ Rejected</span>
          <span className="dashboard-tab-badge">{rejectedCount}</span>
        </button>
      </div>

      <div className="card">
        {filteredClaims.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '2rem 0', textAlign: 'center' }}>
            No {filterTab !== 'ALL' ? filterTab.toLowerCase() : ''} claims recorded.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Found Item</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Claimant</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Identifying Proof</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Submitted At</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  {isAdmin && <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{c.foundItemTitle}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{c.claimantName}</td>
                    <td style={{ padding: '0.75rem 0.5rem', maxWidth: '320px' }}>{c.description}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        {c.status === 'PENDING' ? (
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button onClick={() => handleReview(c.id, 'APPROVED')} className="btn btn-approve-glass btn-sm">Approve</button>
                            <button onClick={() => handleReview(c.id, 'REJECTED')} className="btn btn-reject-glass btn-sm">Reject</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.reviewerNotes || 'Reviewed'}</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}