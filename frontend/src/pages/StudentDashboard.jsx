import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemService, matchService, claimService } from '../services';

export function StudentDashboard() {
  const { user } = useAuth();
  const [lostReports, setLostReports] = useState([]);
  const [foundReports, setFoundReports] = useState([]);
  const [claims, setClaims] = useState([]);
  const [topMatches, setTopMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  // Handover / Progress Modal State for Found Items (Requirement 17 & 18)
  const [progressModalItem, setProgressModalItem] = useState(null);
  const [handoverOption, setHandoverOption] = useState('KEEPING_WITH_ME');
  const [itemStatus, setItemStatus] = useState('FOUND');
  const [finderDescription, setFinderDescription] = useState('');
  const [updatingProgress, setUpdatingProgress] = useState(false);

  // Verification Description Modal State for Lost Items (Requirement 19 & 20)
  const [verificationModalItem, setVerificationModalItem] = useState(null);
  const [ownerDescription, setOwnerDescription] = useState('');
  const [updatingVerification, setUpdatingVerification] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [lost, found, myClaims] = await Promise.all([
        itemService.getMyLost(),
        itemService.getMyFound(),
        claimService.getMyClaims()
      ]);
      setLostReports(lost || []);
      setFoundReports(found || []);
      setClaims(myClaims || []);

      // Load algorithmic matches for active lost reports (Requirement 15 & 16)
      const matchesAccumulator = [];
      for (const item of (lost || []).slice(0, 5)) {
        try {
          const itemMatches = await matchService.getMatchesForLost(item.id);
          if (itemMatches && itemMatches.length > 0) {
            itemMatches.forEach(m => {
              matchesAccumulator.push({ ...m, sourceLostItem: item });
            });
          }
        } catch (mErr) {
          console.warn('Error loading matches for item:', item.id, mErr);
        }
      }
      // Sort by backend matchScore descending
      matchesAccumulator.sort((a, b) => b.matchScore - a.matchScore);
      setTopMatches(matchesAccumulator);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete / Cancel own requests (Requirement 14)
  const handleDeleteLost = async (id, title) => {
    if (!window.confirm(`⚠️ DESTRUCTIVE ACTION: Are you sure you want to delete your lost report "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await itemService.deleteLostItem(id);
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete report.');
    }
  };

  const handleCancelLost = async (id, title) => {
    if (!window.confirm(`Cancel your lost report "${title}"? Status will become CANCELLED.`)) {
      return;
    }
    try {
      await itemService.cancelLostItem(id);
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to cancel report.');
    }
  };

  const handleDeleteFound = async (id, title) => {
    if (!window.confirm(`⚠️ DESTRUCTIVE ACTION: Are you sure you want to delete your found report "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await itemService.deleteFoundItem(id);
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete report.');
    }
  };

  const handleCancelFound = async (id, title) => {
    if (!window.confirm(`Cancel your found report "${title}"? Status will become CANCELLED.`)) {
      return;
    }
    try {
      await itemService.cancelFoundItem(id);
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to cancel report.');
    }
  };

  // Open Handover Progress Modal (Requirement 17 & 18)
  const openProgressModal = (item) => {
    setProgressModalItem(item);
    setHandoverOption(item.handoverOption || 'KEEPING_WITH_ME');
    setItemStatus(item.status || 'FOUND');
    setFinderDescription(item.finderDescription || '');
  };

  const submitProgressUpdate = async (e) => {
    e.preventDefault();
    if (!progressModalItem) return;
    setUpdatingProgress(true);
    try {
      await itemService.updateFoundProgress(progressModalItem.id, {
        handoverOption,
        status: itemStatus,
        finderDescription
      });
      setProgressModalItem(null);
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update progress.');
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Open Owner Verification Modal (Requirement 19 & 20)
  const openVerificationModal = (item) => {
    setVerificationModalItem(item);
    setOwnerDescription(item.ownerDescription || '');
  };

  const submitVerificationUpdate = async (e) => {
    e.preventDefault();
    if (!verificationModalItem) return;
    setUpdatingVerification(true);
    try {
      await itemService.updateLostVerification(verificationModalItem.id, {
        ownerDescription
      });
      setVerificationModalItem(null);
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update verification details.');
    } finally {
      setUpdatingVerification(false);
    }
  };

  if (loading) {
    return <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>Loading Student Dashboard...</div>;
  }

  return (
    <div>
      {/* Dashboard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--charcoal-black)' }}>Student Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, <strong>{user?.name}</strong>! Track your reported items, handover custody, and algorithmic matches.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/report-lost" className="btn btn-primary">
            🔍 Report Lost Item
          </Link>
          <Link to="/report-found" className="btn btn-liquid">
            📦 Report Found Item
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--lavender)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>My Lost Requests</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--lavender)' }}>{lostReports.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lostReports.filter(r => r.status === 'ACTIVE').length} Active</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>My Found Requests</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: '#10b981' }}>{foundReports.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{foundReports.filter(r => r.status === 'ACTIVE' || r.status === 'FOUND').length} Active Custody</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Algorithmic Matches</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: '#059669' }}>{topMatches.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Computed by backend Java DSA</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active Claims</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: '#2563eb' }}>{claims.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{claims.filter(c => c.status === 'PENDING').length} Pending Review</div>
        </div>
      </div>

      {/* Student Dashboard Navigation Tabs */}
      <div className="dashboard-tab-bar">
        <button
          type="button"
          className={`dashboard-tab-item ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          <span>🌟 All Overview</span>
        </button>
        <button
          type="button"
          className={`dashboard-tab-item ${activeTab === 'MATCHES' ? 'active' : ''}`}
          onClick={() => setActiveTab('MATCHES')}
        >
          <span>🎯 Algorithmic Matches</span>
          <span className={`dashboard-tab-badge ${topMatches.length > 0 ? 'badge-highlight' : ''}`}>{topMatches.length}</span>
        </button>
        <button
          type="button"
          className={`dashboard-tab-item ${activeTab === 'LOST' ? 'active' : ''}`}
          onClick={() => setActiveTab('LOST')}
        >
          <span>🔍 My Lost Reports</span>
          <span className="dashboard-tab-badge">{lostReports.length}</span>
        </button>
        <button
          type="button"
          className={`dashboard-tab-item ${activeTab === 'FOUND' ? 'active' : ''}`}
          onClick={() => setActiveTab('FOUND')}
        >
          <span>📦 My Found Reports</span>
          <span className="dashboard-tab-badge">{foundReports.length}</span>
        </button>
        <button
          type="button"
          className={`dashboard-tab-item ${activeTab === 'CLAIMS' ? 'active' : ''}`}
          onClick={() => setActiveTab('CLAIMS')}
        >
          <span>🛡️ My Claims</span>
          <span className="dashboard-tab-badge">{claims.length}</span>
        </button>
      </div>

      {/* TOP POTENTIAL MATCHES SECTION (Requirement 15 & 16: "94% Potential Match") */}
      {(activeTab === 'ALL' || activeTab === 'MATCHES') && (
        topMatches.length > 0 ? (
          <div className="card" style={{ marginBottom: '2rem', border: '1.5px solid var(--gold-border)' }}>
            <div className="card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>🎯</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Potential Matches Detected for Your Lost Items
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Java backend matching engine continuously evaluates 8 dimensions across all reported found property.
                </p>
              </div>
              <span className="badge badge-matched">{topMatches.length} High Confidence Matches</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              {topMatches.slice(0, 4).map(m => (
                <div key={m.id} className="card" style={{ background: 'rgba(7, 21, 33, 0.75)', padding: '1.25rem', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Match for your "{m.lostItemTitle}"
                      </span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.2rem', color: '#FFFFFF' }}>
                        Found: {m.foundItemTitle}
                      </h4>
                    </div>
                    {/* Match Percentage Display (Ice Glass + Gold Badge) */}
                    <div
                      className={`match-badge ${m.matchScore >= 90 ? 'match-very-high' : m.matchScore >= 75 ? 'match-high' : 'match-possible'}`}
                      style={{ fontSize: '0.92rem', padding: '0.35rem 0.85rem' }}
                    >
                      <span>{m.matchScore}%</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Potential Match</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>📍 <strong>Location:</strong> {m.foundLocation} (Dijkstra Distance: {m.distanceMeters}m)</div>
                    <div>🏷️ <strong>Category:</strong> {m.category}</div>
                    <div>📊 <strong>Evaluation Grade:</strong> {m.matchGrade}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/match/${m.id}`} className="btn btn-ice-glass btn-sm" style={{ flex: 1 }}>
                      View Match Breakdown →
                    </Link>
                    <Link to={`/found/${m.foundItemId}`} className="btn btn-neon-border btn-sm">
                      Item Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'MATCHES' ? (
          <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '2.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🎯</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.5rem', color: '#FFFFFF' }}>No algorithmic matches yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>When a found item matches your reported belongings (&ge; 40% similarity), it will appear here automatically.</p>
          </div>
        ) : null
      )}

      {/* MY REPORTED LOST ITEMS TABLE */}
      {(activeTab === 'ALL' || activeTab === 'LOST') && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>My Reported Lost Items</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Manage your lost requests, provide identifying verification details, or delete/cancel.
              </p>
            </div>
            <Link to="/report-lost" className="btn btn-electric btn-sm">+ Report Lost Item</Link>
          </div>

          {lostReports.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1.5rem 0', textAlign: 'center' }}>
              You have not submitted any lost item requests yet.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Item</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Category</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Location</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Verification Details</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lostReports.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>
                        <Link to={`/lost/${item.id}`}>{item.title}</Link>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-ice)' }}>{item.category}</td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>📍 {item.locationName}</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-muted)' }}>{item.date}</td>
                      <td style={{ padding: '0.85rem 0.5rem', maxWidth: '240px' }}>
                        {item.ownerDescription ? (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-ice)' }}>
                            "{item.ownerDescription.length > 50 ? item.ownerDescription.substring(0, 50) + '...' : item.ownerDescription}"
                          </span>
                        ) : (
                          <button onClick={() => openVerificationModal(item)} className="btn btn-ice-glass btn-sm" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                            + Add Proof / Details
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                          <Link to={`/matches/lost/${item.id}`} className="btn btn-neon-border btn-sm">
                            Matches 🎯
                          </Link>
                          <button
                            onClick={() => openVerificationModal(item)}
                            className="btn btn-ice-glass btn-sm"
                            title="Update identifying verification details"
                          >
                            ✏️ Details
                          </button>
                          {item.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleCancelLost(item.id, item.title)}
                              className="btn btn-cancel-glass btn-sm"
                              title="Cancel request"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteLost(item.id, item.title)}
                            className="btn btn-danger-glass btn-sm"
                            title="Delete lost request permanently"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MY REPORTED FOUND ITEMS & HANDOVER TABLE */}
      {(activeTab === 'ALL' || activeTab === 'FOUND') && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>My Reported Found Items & Handover Progress</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Manage custody progress ("Keep with me" vs "Hand over to OSW/Admin"), description notes, and resolution.
              </p>
            </div>
            <Link to="/report-found" className="btn btn-liquid btn-sm">+ Report Found Item</Link>
          </div>

          {foundReports.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1.5rem 0', textAlign: 'center' }}>
              You have not submitted any found item reports yet.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Item</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Location</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Handover Custody (Req 17)</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {foundReports.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>
                        <Link to={`/found/${item.id}`}>{item.title}</Link>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>📍 {item.locationName}</td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>{item.date}</td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        {item.handoverOption === 'HANDED_TO_OSW' ? (
                          <span className="badge badge-osw">🏢 Handed over to OSW/Admin</span>
                        ) : (
                          <span className="badge badge-keeping">👤 Keeping with me</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                          <Link to={`/matches/found/${item.id}`} className="btn btn-neon-border btn-sm">
                            Matches 🎯
                          </Link>
                          <button
                            onClick={() => openProgressModal(item)}
                            className="btn btn-3d-glass btn-sm"
                            title="Update handover option and progress status"
                          >
                            📦 Handover Progress
                          </button>
                          {item.status !== 'RESOLVED' && item.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleCancelFound(item.id, item.title)}
                              className="btn btn-cancel-glass btn-sm"
                              title="Cancel request"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteFound(item.id, item.title)}
                            className="btn btn-danger-glass btn-sm"
                            title="Delete found request permanently"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MY SUBMITTED CLAIMS SECTION */}
      {(activeTab === 'ALL' || activeTab === 'CLAIMS') && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>My Ownership Claims</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Track verification status and reviewer notes on items you have claimed.
              </p>
            </div>
            <Link to="/claims" className="btn btn-ice-glass btn-sm">Full Claims History →</Link>
          </div>

          {claims.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1.5rem 0', textAlign: 'center' }}>
              You have not submitted any ownership claims yet.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Found Item</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Submitted Proof</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>{c.foundItemTitle}</td>
                      <td style={{ padding: '0.85rem 0.5rem', maxWidth: '300px' }}>{c.description}</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-muted)' }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-ice)', fontSize: '0.82rem' }}>
                        {c.reviewerNotes || 'Under investigation'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* HANDOVER PROGRESS MODAL (Requirement 17 & 18) */}
      {progressModalItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 8, 14, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '540px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFFFFF' }}>
              Found Item Handover & Progress
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Updating custody and handover workflow for: <strong>{progressModalItem.title}</strong>
            </p>

            <form onSubmit={submitProgressUpdate}>
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

              {/* Requirement 18: Possible statuses */}
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

              {/* Requirement 20: Found student description */}
              <div className="form-group">
                <label className="form-label">Found-Item Verification Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Provide additional handover information or verification notes (e.g. deposited at OSW desk with Officer Sharma, or specific condition notes)..."
                  value={finderDescription}
                  onChange={(e) => setFinderDescription(e.target.value)}
                ></textarea>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                  Separate concept from original report description. Stored for handover verification.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setProgressModalItem(null)} className="btn btn-cancel-glass">
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

      {/* OWNER IDENTIFYING VERIFICATION MODAL (Requirement 19 & 20) */}
      {verificationModalItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 8, 14, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFFFFF' }}>
              Identifying Verification Description
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Lost Item: <strong>{verificationModalItem.title}</strong>
            </p>

            <form onSubmit={submitVerificationUpdate}>
              <div className="form-group">
                <label className="form-label">Identifying Description (Proof of Ownership) *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Provide specific identifying details known only to the owner (e.g. sticker on laptop, lockscreen wallpaper, serial digits, keychain charm)..."
                  value={ownerDescription}
                  onChange={(e) => setOwnerDescription(e.target.value)}
                  required
                ></textarea>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                  This will help the finder and OSW/Admin verify that the item is handed over to the rightful owner.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setVerificationModalItem(null)} className="btn btn-cancel-glass">
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