import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { itemService, claimService, adminService } from '../services';
import { useAuth } from '../context/AuthContext';

export function ItemDetailsPage({ type = 'LOST' }) {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Claim Modal
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimDescription, setClaimDescription] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');

  // Handover Progress Modal for Found Item (Req 17, 18, 20)
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [handoverOption, setHandoverOption] = useState('KEEPING_WITH_ME');
  const [itemStatus, setItemStatus] = useState('FOUND');
  const [finderDescription, setFinderDescription] = useState('');
  const [updatingProgress, setUpdatingProgress] = useState(false);

  // Owner Verification Description Modal for Lost Item (Req 19, 20)
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [ownerDescription, setOwnerDescription] = useState('');
  const [updatingVerification, setUpdatingVerification] = useState(false);

  useEffect(() => {
    loadItem();
  }, [id, type]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const data = type === 'LOST'
        ? await itemService.getLostItem(id)
        : await itemService.getFoundItem(id);
      setItem(data);
      if (data) {
        if (data.handoverOption) setHandoverOption(data.handoverOption);
        if (data.status) setItemStatus(data.status);
        if (data.finderDescription) setFinderDescription(data.finderDescription);
        if (data.ownerDescription) setOwnerDescription(data.ownerDescription);
      }
    } catch (err) {
      console.error('Failed to load item:', err);
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user && item && (user.id === item.userId || user.name === item.userName);

  // Submit Claim (Lost student claiming found item)
  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimSubmitting(true);
    try {
      await claimService.submitClaim({
        foundItemId: item.id,
        description: claimDescription
      });
      setClaimSuccess('Claim submitted successfully! Campus admin and finder will review your proof.');
      setTimeout(() => {
        setClaimModalOpen(false);
        navigate('/claims');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to submit claim.');
    } finally {
      setClaimSubmitting(false);
    }
  };

  // Submit Found Item Progress Update (Requirement 17 & 18 & 20)
  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProgress(true);
    try {
      await itemService.updateFoundProgress(item.id, {
        handoverOption,
        status: itemStatus,
        finderDescription
      });
      setProgressModalOpen(false);
      await loadItem();
    } catch (err) {
      alert(err.message || 'Failed to update handover progress.');
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Submit Lost Item Verification Description (Requirement 19 & 20)
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setUpdatingVerification(true);
    try {
      await itemService.updateLostVerification(item.id, {
        ownerDescription
      });
      setVerificationModalOpen(false);
      await loadItem();
    } catch (err) {
      alert(err.message || 'Failed to update verification details.');
    } finally {
      setUpdatingVerification(false);
    }
  };

  // Delete Request (Requirement 14 & 53: Red destructive styling with confirmation)
  const handleDelete = async () => {
    const confirmationText = isAdmin
      ? `⚠️ ADMIN DESTRUCTIVE ACTION: Are you sure you want to permanently delete this ${type.toLowerCase()} record?`
      : `⚠️ DESTRUCTIVE ACTION: Are you sure you want to permanently delete your ${type.toLowerCase()} report?`;

    if (!window.confirm(confirmationText)) return;

    try {
      if (type === 'LOST') {
        if (isAdmin) {
          await adminService.deleteLostItem(item.id);
        } else {
          await itemService.deleteLostItem(item.id);
        }
        navigate(isAdmin ? '/admin' : '/dashboard');
      } else {
        if (isAdmin) {
          await adminService.deleteFoundItem(item.id);
        } else {
          await itemService.deleteFoundItem(item.id);
        }
        navigate(isAdmin ? '/admin' : '/dashboard');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete record.');
    }
  };

  // Cancel Request (Requirement 14)
  const handleCancel = async () => {
    if (!window.confirm(`Are you sure you want to cancel this ${type.toLowerCase()} request?`)) return;
    try {
      if (type === 'LOST') {
        await itemService.cancelLostItem(item.id);
      } else {
        await itemService.cancelFoundItem(item.id);
      }
      await loadItem();
    } catch (err) {
      alert(err.message || 'Failed to cancel request.');
    }
  };

  if (loading) {
    return <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>Loading item details...</div>;
  }

  if (!item) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
        <h3>Item not found or record has been removed.</h3>
        <Link to={type === 'LOST' ? '/lost' : '/found'} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '940px', margin: '1rem auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to={type === 'LOST' ? '/lost' : '/found'} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          ← Back to {type === 'LOST' ? 'Lost Directory' : 'Found Directory'}
        </Link>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Item Image with Fallback */}
          <div>
            <div style={{ width: '100%', height: '340px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#f1f5f9', position: 'relative' }}>
              <img
                src={item.imageUrl}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600'; }}
              />
              <span className={`badge badge-${item.status.toLowerCase()}`} style={{ position: 'absolute', top: '14px', right: '14px' }}>
                {item.status}
              </span>
            </div>

            {/* Handover custody badge for Found items */}
            {type === 'FOUND' && (
              <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'var(--beige-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Item Custody Status (Requirement 17)
                </span>
                <div style={{ marginTop: '0.25rem', fontWeight: 700 }}>
                  {item.handoverOption === 'HANDED_TO_OSW' ? (
                    <span className="badge badge-osw" style={{ fontSize: '0.85rem' }}>🏢 Handed over to OSW/Admin</span>
                  ) : (
                    <span className="badge badge-keeping" style={{ fontSize: '0.85rem' }}>👤 Keeping with Finder</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Details & Workflow Actions */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
              <span className="badge badge-active">{type} REPORT</span>
              <span className="badge badge-matched">{item.category}</span>
              {item.status === 'RESOLVED' && <span className="badge badge-resolved">RESOLVED</span>}
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--charcoal-black)' }}>
              {item.title}
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1.25rem 0', background: 'var(--beige-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Brand</span>
                <div style={{ fontWeight: 600 }}>{item.brand || 'Unbranded'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Color</span>
                <div style={{ fontWeight: 600 }}>{item.color || 'Unspecified'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Campus Location</span>
                <div style={{ fontWeight: 600 }}>📍 {item.locationName}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Date & Time</span>
                <div style={{ fontWeight: 600 }}>📅 {item.date} {item.time}</div>
              </div>
            </div>

            {/* Original Report Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--charcoal-black)' }}>
                Report Description:
              </h4>
              <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: 1.6 }}>{item.description}</p>
            </div>

            {/* Verification / Handover Descriptions (Requirement 20) */}
            {type === 'FOUND' && item.finderDescription && (
              <div style={{ marginBottom: '1.25rem', background: 'rgba(212, 175, 55, 0.08)', borderLeft: '4px solid var(--gold)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gold-border)' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--light-gold)', marginBottom: '0.2rem' }}>
                  Finder's Handover & Verification Notes:
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#FFFFFF' }}>{item.finderDescription}</p>
              </div>
            )}

            {type === 'LOST' && item.ownerDescription && (
              <div style={{ marginBottom: '1.25rem', background: 'rgba(16, 185, 129, 0.08)', borderLeft: '4px solid #10b981', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#A7F3D0', marginBottom: '0.2rem' }}>
                  Owner's Identifying Verification Details:
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#FFFFFF' }}>{item.ownerDescription}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)' }}>
              <Link to={`/matches/${type.toLowerCase()}/${item.id}`} className="btn btn-neon-border">
                🎯 View Algorithmic Matches
              </Link>

              {/* Claim Item for other students */}
              {type === 'FOUND' && user && !isOwner && item.status !== 'RESOLVED' && item.status !== 'CANCELLED' && (
                <button onClick={() => setClaimModalOpen(true)} className="btn btn-ice-glass">
                  ✋ Claim This Item
                </button>
              )}

              {/* Found Item Progress & Handover (Owner action - Special 3D) */}
              {type === 'FOUND' && (isOwner || isAdmin) && item.status !== 'RESOLVED' && (
                <button onClick={() => setProgressModalOpen(true)} className="btn btn-3d-glass">
                  📦 Update Handover Progress
                </button>
              )}

              {/* Lost Item Identifying Details (Owner action) */}
              {type === 'LOST' && (isOwner || isAdmin) && (
                <button onClick={() => setVerificationModalOpen(true)} className="btn btn-ice-glass">
                  ✏️ Edit Identifying Proof
                </button>
              )}

              {/* Cancel Request (Owner action) */}
              {isOwner && item.status === 'ACTIVE' && (
                <button onClick={handleCancel} className="btn btn-cancel-glass">
                  Cancel Request
                </button>
              )}

              {/* Destructive Delete Button (Requirement 14 & 53) */}
              {(isOwner || isAdmin) && (
                <button onClick={handleDelete} className="btn btn-danger-glass">
                  🗑️ Delete Request
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {claimModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 8, 14, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFFFFF' }}>Submit Ownership Claim</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Describe unique identifying details (e.g. lockscreen wallpaper, engravings, serial number, specific contents) to verify your claim before handover.
            </p>

            {claimSuccess ? (
              <div style={{ background: 'var(--success-glass)', color: '#A7F3D0', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--success-border)' }}>
                {claimSuccess}
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit}>
                <div className="form-group">
                  <label className="form-label">Proof of Ownership / Identifiable Features *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Provide specific details that only the true owner would know..."
                    value={claimDescription}
                    onChange={(e) => setClaimDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setClaimModalOpen(false)} className="btn btn-cancel-glass">Cancel</button>
                  <button type="submit" className="btn btn-3d-glass" disabled={claimSubmitting}>
                    {claimSubmitting ? 'Submitting...' : 'Submit Claim'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Found Item Handover & Progress Modal (Requirement 17 & 18 & 20) */}
      {progressModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 8, 14, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '540px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFFFFF' }}>
              Found Item Handover & Progress
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Update custody choices and handover workflow for: <strong>{item.title}</strong>
            </p>

            <form onSubmit={handleProgressSubmit}>
              {/* Requirement 17: TWO choices */}
              <div className="form-group">
                <label className="form-label">Item Custody Choice *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.35rem' }}>
                  <label
                    style={{
                      border: `1.5px solid ${handoverOption === 'KEEPING_WITH_ME' ? 'var(--gold)' : 'var(--glass-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      background: handoverOption === 'KEEPING_WITH_ME' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(7, 21, 33, 0.7)',
                      boxShadow: handoverOption === 'KEEPING_WITH_ME' ? '0 0 15px rgba(212, 175, 55, 0.2)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="handoverOption"
                      value="KEEPING_WITH_ME"
                      checked={handoverOption === 'KEEPING_WITH_ME'}
                      onChange={() => setHandoverOption('KEEPING_WITH_ME')}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#FFFFFF' }}>Option 1</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>"I will keep it with me"</span>
                  </label>

                  <label
                    style={{
                      border: `1.5px solid ${handoverOption === 'HANDED_TO_OSW' ? 'var(--gold)' : 'var(--glass-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      background: handoverOption === 'HANDED_TO_OSW' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(7, 21, 33, 0.7)',
                      boxShadow: handoverOption === 'HANDED_TO_OSW' ? '0 0 15px rgba(212, 175, 55, 0.2)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="handoverOption"
                      value="HANDED_TO_OSW"
                      checked={handoverOption === 'HANDED_TO_OSW'}
                      onChange={() => setHandoverOption('HANDED_TO_OSW')}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#FFFFFF' }}>Option 2</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>"I will hand it over to OSW/Admin"</span>
                  </label>
                </div>
              </div>

              {/* Requirement 18: Status update */}
              <div className="form-group">
                <label className="form-label">Current Progress Status *</label>
                <select
                  className="form-control"
                  value={itemStatus}
                  onChange={(e) => setItemStatus(e.target.value)}
                  required
                >
                  <option value="FOUND">FOUND (Item discovered)</option>
                  <option value="KEEPING_WITH_ME">KEEPING_WITH_ME (Stored safely with finder)</option>
                  <option value="HANDED_TO_OSW">HANDED_TO_OSW (Deposited at OSW / Campus Admin office)</option>
                  <option value="HANDED_TO_LOST_PERSON">HANDED_TO_LOST_PERSON (Returned to owner)</option>
                  <option value="RESOLVED">RESOLVED (Case closed)</option>
                </select>
              </div>

              {/* Requirement 20: Finder description */}
              <div className="form-group">
                <label className="form-label">Finder's Handover & Verification Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Provide handover details (e.g. deposited at OSW reception with Officer Sharma, or specific notes for identification)..."
                  value={finderDescription}
                  onChange={(e) => setFinderDescription(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setProgressModalOpen(false)} className="btn btn-cancel-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-3d-glass" disabled={updatingProgress}>
                  {updatingProgress ? 'Saving...' : 'Save Handover Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lost Item Verification Description Modal (Requirement 19 & 20) */}
      {verificationModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 8, 14, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFFFFF' }}>
              Identifying Verification Description
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Item: <strong>{item.title}</strong>
            </p>

            <form onSubmit={handleVerificationSubmit}>
              <div className="form-group">
                <label className="form-label">Identifying Description (Proof of Ownership) *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Provide private identifying details (e.g. engravings, wallpaper, contents, case stickers)..."
                  value={ownerDescription}
                  onChange={(e) => setOwnerDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setVerificationModalOpen(false)} className="btn btn-cancel-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-3d-glass" disabled={updatingVerification}>
                  {updatingVerification ? 'Saving...' : 'Save Verification Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}