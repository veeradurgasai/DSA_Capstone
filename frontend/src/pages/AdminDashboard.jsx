import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, claimService } from '../services';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING_STUDENTS'); // 'PENDING_STUDENTS', 'LOST_RECORDS', 'FOUND_RECORDS', 'CLAIMS', 'ALL_STUDENTS'

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [sRes, pendingRes, allRes, lostRes, foundRes, cRes] = await Promise.allSettled([
        adminService.getStatistics(),
        adminService.getPendingStudents(),
        adminService.getAllStudents(),
        adminService.getAllLostItems(),
        adminService.getAllFoundItems(),
        claimService.getAllClaims()
      ]);
      if (sRes.status === 'fulfilled') setStats(sRes.value);
      if (pendingRes.status === 'fulfilled') setPendingStudents(pendingRes.value || []);
      if (allRes.status === 'fulfilled') setAllStudents(allRes.value || []);
      if (lostRes.status === 'fulfilled') setLostItems(lostRes.value || []);
      if (foundRes.status === 'fulfilled') setFoundItems(foundRes.value || []);
      if (cRes.status === 'fulfilled') setClaims(cRes.value || []);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Student Approval / Rejection (Requirement 3 & 52)
  const handleReviewStudent = async (studentId, status, studentName) => {
    const actionText = status === 'APPROVED' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionText} registration for ${studentName}?`)) {
      return;
    }
    try {
      await adminService.reviewStudentApproval(studentId, status);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update student approval status.');
    }
  };

  // Admin Request Deletion (Requirement 53)
  const handleDeleteLostItem = async (itemId, title) => {
    if (!window.confirm(`⚠️ DESTRUCTIVE ACTION: Are you sure you want to permanently delete lost item "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await adminService.deleteLostItem(itemId);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete lost item.');
    }
  };

  const handleDeleteFoundItem = async (itemId, title) => {
    if (!window.confirm(`⚠️ DESTRUCTIVE ACTION: Are you sure you want to permanently delete found item "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await adminService.deleteFoundItem(itemId);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete found item.');
    }
  };

  const handleReviewClaim = async (id, status) => {
    const notes = window.prompt(`Enter review notes for ${status}:`, status === 'APPROVED' ? 'Proof verified.' : 'Insufficient proof.');
    if (notes !== null) {
      await claimService.reviewClaim(id, status, notes);
      loadAdminData();
    }
  };

  if (loading) {
    return <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>Loading Administrative Console...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF' }}>Campus Administrator Console</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Review pending student registrations, monitor campus lost & found records, and audit item handovers.
        </p>
      </div>

      {/* KPI Stats Overview */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--gold)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Pending Approvals</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem', color: pendingStudents.length > 0 ? 'var(--light-gold)' : '#FFFFFF' }}>
              {pendingStudents.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting review</div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--ice-glass)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Lost Reports</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--ice-glass)' }}>{stats.totalLostItems}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stats.activeLostItems} Active</div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--gold)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Found Reports</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--light-gold)' }}>{stats.totalFoundItems}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stats.activeFoundItems} Active</div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Resolved Items</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem', color: '#A7F3D0' }}>{stats.totalResolved}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cases closed</div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--gold)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>High Matches</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--light-gold)' }}>{stats.highMatchesCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>&ge; 75% DSA score</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs for Admin Sections */}
      <div className="dashboard-tab-bar">
        <button
          type="button"
          className={`dashboard-tab-item ${activeTab === 'PENDING_STUDENTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('PENDING_STUDENTS')}
        >
          <span>⏳ Pending Approvals</span>
          <span className={`dashboard-tab-badge ${pendingStudents.length > 0 ? 'badge-highlight' : ''}`}>
            {pendingStudents.length}
          </span>
        </button>
        <button
          type="button"
          className={`dashboard-tab-item ${activeTab === 'LOST_RECORDS' ? 'active' : ''}`}
          onClick={() => setActiveTab('LOST_RECORDS')}
        >
          <span>🔍 Lost Records</span>
          <span className="dashboard-tab-badge">{lostItems.length}</span>
        </button>
        <button
          type="button"
          className={`dashboard-tab-item ${activeTab === 'FOUND_RECORDS' ? 'active' : ''}`}
          onClick={() => setActiveTab('FOUND_RECORDS')}
        >
          <span>📦 Found & Handover</span>
          <span className="dashboard-tab-badge">{foundItems.length}</span>
        </button>
        <button
          type="button"
          className={`dashboard-tab-item ${activeTab === 'CLAIMS' ? 'active' : ''}`}
          onClick={() => setActiveTab('CLAIMS')}
        >
          <span>🛡️ Claims</span>
          <span className="dashboard-tab-badge">{claims.length}</span>
        </button>
        <button
          type="button"
          className={`dashboard-tab-item ${activeTab === 'ALL_STUDENTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL_STUDENTS')}
        >
          <span>👥 Student Directory</span>
          <span className="dashboard-tab-badge">{allStudents.length}</span>
        </button>
      </div>

      {/* 1. PRIORITY: PENDING STUDENT REGISTRATIONS (Requirement 3 & 51 & 52) */}
      {activeTab === 'PENDING_STUDENTS' && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>Pending Student Registrations</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Verify student college credentials before granting access to report items and view matches.
              </p>
            </div>
            <span className="badge badge-pending">{pendingStudents.length} Awaiting Approval</span>
          </div>

          {pendingStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--light-gold)' }}>✓</div>
              <h4 style={{ fontWeight: 700, color: '#FFFFFF' }}>All Student Registrations Reviewed</h4>
              <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>There are currently no new student accounts waiting for approval.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.6rem' }}>Full Name</th>
                    <th style={{ padding: '0.75rem 0.6rem' }}>College Email</th>
                    <th style={{ padding: '0.75rem 0.6rem' }}>Personal Email</th>
                    <th style={{ padding: '0.75rem 0.6rem' }}>Phone</th>
                    <th style={{ padding: '0.75rem 0.6rem' }}>Registration Date</th>
                    <th style={{ padding: '0.75rem 0.6rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingStudents.map(student => (
                    <tr key={student.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '0.85rem 0.6rem', fontWeight: 700, color: '#FFFFFF' }}>
                        {student.name}
                      </td>
                      <td style={{ padding: '0.85rem 0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-ice)' }}>
                        {student.collegeEmail || student.email}
                      </td>
                      <td style={{ padding: '0.85rem 0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {student.personalEmail || '—'}
                      </td>
                      <td style={{ padding: '0.85rem 0.6rem' }}>
                        {student.phone || '—'}
                      </td>
                      <td style={{ padding: '0.85rem 0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {(student.registrationDate || student.registeredAt) ? new Date(student.registrationDate || student.registeredAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td style={{ padding: '0.85rem 0.6rem' }}>
                        <span className="badge badge-pending">PENDING</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.6rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleReviewStudent(student.id, 'APPROVED', student.name)}
                            className="btn btn-approve-glass btn-sm"
                            title="Approve student login"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleReviewStudent(student.id, 'REJECTED', student.name)}
                            className="btn btn-reject-glass btn-sm"
                            title="Reject student registration"
                          >
                            ✕ Reject
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

      {/* 2. LOST RECORDS AUDITING & DELETION (Requirement 21 & 53) */}
      {activeTab === 'LOST_RECORDS' && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>Campus Lost Item Records</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Audit all lost property requests filed across campus with administrative deletion authority.
              </p>
            </div>
            <Link to="/report-lost" className="btn btn-electric btn-sm">+ File Lost Report</Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Item</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Location</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Reported By</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>Administrative Action</th>
                </tr>
              </thead>
              <tbody>
                {lostItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.85rem 0.6rem', fontWeight: 700 }}>
                      <Link to={`/lost/${item.id}`}>{item.title}</Link>
                    </td>
                    <td style={{ padding: '0.85rem 0.6rem', color: 'var(--text-ice)' }}>{item.category}</td>
                    <td style={{ padding: '0.85rem 0.6rem' }}>📍 {item.locationName}</td>
                    <td style={{ padding: '0.85rem 0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.date}</td>
                    <td style={{ padding: '0.85rem 0.6rem' }}>{item.userName}</td>
                    <td style={{ padding: '0.85rem 0.6rem' }}>
                      <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
                    </td>
                    <td style={{ padding: '0.85rem 0.6rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Link to={`/matches/lost/${item.id}`} className="btn btn-neon-border btn-sm">
                          Matches 🎯
                        </Link>
                        <button
                          onClick={() => handleDeleteLostItem(item.id, item.title)}
                          className="btn btn-danger-glass btn-sm"
                          title="Delete lost report permanently"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. FOUND & HANDOVER RECORDS AUDITING & DELETION (Requirement 17, 18, 21, 53) */}
      {activeTab === 'FOUND_RECORDS' && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>Found Items & Handover Tracking</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Track item custody (Keeping with finder vs. Handed to OSW/Admin) and audit resolutions.
              </p>
            </div>
            <Link to="/report-found" className="btn btn-liquid btn-sm">+ File Found Report</Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Item</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Location</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Finder</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Handover Option</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>Administrative Action</th>
                </tr>
              </thead>
              <tbody>
                {foundItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.85rem 0.6rem', fontWeight: 700 }}>
                      <Link to={`/found/${item.id}`}>{item.title}</Link>
                    </td>
                    <td style={{ padding: '0.85rem 0.6rem' }}>📍 {item.locationName}</td>
                    <td style={{ padding: '0.85rem 0.6rem' }}>{item.userName}</td>
                    <td style={{ padding: '0.85rem 0.6rem' }}>
                      {item.handoverOption === 'HANDED_TO_OSW' ? (
                        <span className="badge badge-osw">🏢 Handed over to OSW/Admin</span>
                      ) : (
                        <span className="badge badge-keeping">👤 With Finder</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 0.6rem' }}>
                      <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
                    </td>
                    <td style={{ padding: '0.85rem 0.6rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Link to={`/matches/found/${item.id}`} className="btn btn-neon-border btn-sm">
                          Matches 🎯
                        </Link>
                        <button
                          onClick={() => handleDeleteFoundItem(item.id, item.title)}
                          className="btn btn-danger-glass btn-sm"
                          title="Delete found report permanently"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CLAIMS MODERATION QUEUE */}
      {activeTab === 'CLAIMS' && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', color: '#FFFFFF' }}>Ownership Claim Adjudication</h3>
          {claims.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No claims currently submitted.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.65rem' }}>Found Item</th>
                    <th style={{ padding: '0.65rem' }}>Claimant</th>
                    <th style={{ padding: '0.65rem' }}>Proof / Identifying Details</th>
                    <th style={{ padding: '0.65rem' }}>Status</th>
                    <th style={{ padding: '0.65rem', textAlign: 'right' }}>Adjudication</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '0.75rem 0.65rem', fontWeight: 600, color: '#FFFFFF' }}>{c.foundItemTitle}</td>
                      <td style={{ padding: '0.75rem 0.65rem' }}>
                        <div style={{ color: 'var(--text-ice)' }}>{c.claimantName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.claimantEmail}</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.65rem', maxWidth: '320px', color: 'var(--text-muted)' }}>{c.description}</td>
                      <td style={{ padding: '0.75rem 0.65rem' }}>
                        <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.65rem', textAlign: 'right' }}>
                        {c.status === 'PENDING' ? (
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button onClick={() => handleReviewClaim(c.id, 'APPROVED')} className="btn btn-approve-glass btn-sm">Approve</button>
                            <button onClick={() => handleReviewClaim(c.id, 'REJECTED')} className="btn btn-reject-glass btn-sm">Reject</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. ALL REGISTERED STUDENTS */}
      {activeTab === 'ALL_STUDENTS' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', color: '#FFFFFF' }}>All Registered Students</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.65rem' }}>Name</th>
                  <th style={{ padding: '0.65rem' }}>College Email</th>
                  <th style={{ padding: '0.65rem' }}>Personal Email</th>
                  <th style={{ padding: '0.65rem' }}>Phone</th>
                  <th style={{ padding: '0.65rem' }}>Account Status</th>
                  <th style={{ padding: '0.65rem', textAlign: 'right' }}>Status Action</th>
                </tr>
              </thead>
              <tbody>
                {allStudents.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.75rem 0.65rem', fontWeight: 600, color: '#FFFFFF' }}>{s.name}</td>
                    <td style={{ padding: '0.75rem 0.65rem', color: 'var(--text-ice)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{s.collegeEmail || s.email}</td>
                    <td style={{ padding: '0.75rem 0.65rem', color: 'var(--text-muted)' }}>{s.personalEmail || '—'}</td>
                    <td style={{ padding: '0.75rem 0.65rem' }}>{s.phone || '—'}</td>
                    <td style={{ padding: '0.75rem 0.65rem' }}>
                      <span className={`badge badge-${s.accountStatus.toLowerCase()}`}>{s.accountStatus}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.65rem', textAlign: 'right' }}>
                      {s.accountStatus !== 'APPROVED' ? (
                        <button
                          onClick={() => handleReviewStudent(s.id, 'APPROVED', s.name)}
                          className="btn btn-approve-glass btn-sm"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReviewStudent(s.id, 'REJECTED', s.name)}
                          className="btn btn-reject-glass btn-sm"
                        >
                          Revoke / Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}