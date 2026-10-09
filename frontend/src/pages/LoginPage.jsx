import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [activeTab, setActiveTab] = useState('STUDENT'); // 'STUDENT' or 'ADMIN'

  // Student Login Fields (Requirement 4: Full Name, College Email, Password)
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Admin Login Fields (Requirement 7: Full Name, Email, Admin Code - NO OTP)
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminCode, setAdminCode] = useState('');

  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState(null); // For PENDING or REJECTED
  const [loading, setLoading] = useState(false);

  const { loginStudent, loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Handle Student Login
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage(null);
    setLoading(true);

    try {
      await loginStudent(studentName, studentEmail, studentPassword);
      navigate(from === '/admin' ? '/dashboard' : from);
    } catch (err) {
      const msg = err.message || '';
      // Check if message corresponds to pending or rejected approval (Requirement 4)
      if (msg.includes('waiting for administrator approval') || msg.toLowerCase().includes('pending')) {
        setStatusMessage({
          type: 'PENDING',
          text: 'Your registration is waiting for administrator approval.'
        });
      } else if (msg.includes('not approved') || msg.toLowerCase().includes('rejected')) {
        setStatusMessage({
          type: 'REJECTED',
          text: 'Your registration request was not approved.'
        });
      } else {
        setError(msg || 'Invalid student credentials. Please verify your Full Name, Email, and Password.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Login (Requirement 7: Full Name, Email, Admin Code - NO OTP)
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage(null);
    setLoading(true);

    try {
      await loginAdmin(adminName, adminEmail, adminCode);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials or registration code.');
    } finally {
      setLoading(false);
    }
  };

  // Demo auto-fill helpers
  const fillApprovedStudent = () => {
    setActiveTab('STUDENT');
    setStudentName('Aarav Sharma');
    setStudentEmail('aarav.sharma@campus.edu');
    setStudentPassword('student123');
    setError('');
    setStatusMessage(null);
  };

  const fillPendingStudent = () => {
    setActiveTab('STUDENT');
    setStudentName('Kavya Patel');
    setStudentEmail('kavya.patel@campus.edu');
    setStudentPassword('student123');
    setError('');
    setStatusMessage(null);
  };

  const fillAdmin = () => {
    setActiveTab('ADMIN');
    setAdminName('Campus Admin');
    setAdminEmail('admin@campus.edu');
    setAdminCode(''); // Confidential - manually entered by administrator
    setError('');
    setStatusMessage(null);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2.5rem auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--charcoal-black)' }}>Sign In</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Access your campus lost & found intelligence dashboard
          </p>
        </div>

        {/* Tab Switcher: Student Login vs Admin Login */}
        <div className="auth-tab-group">
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'STUDENT' ? 'active' : ''}`}
            onClick={() => { setActiveTab('STUDENT'); setError(''); setStatusMessage(null); }}
          >
            🎓 Student Login
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'ADMIN' ? 'active' : ''}`}
            onClick={() => { setActiveTab('ADMIN'); setError(''); setStatusMessage(null); }}
          >
            🛡️ Admin Login
          </button>
        </div>

        {/* Pending / Rejected Account Alerts (Requirement 4) */}
        {statusMessage && (
          <div
            style={{
              background: statusMessage.type === 'PENDING' ? 'var(--warning-bg)' : 'var(--danger-bg)',
              color: statusMessage.type === 'PENDING' ? '#92400e' : 'var(--danger)',
              border: `1px solid ${statusMessage.type === 'PENDING' ? '#fde68a' : 'var(--danger-red-border)'}`,
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{statusMessage.type === 'PENDING' ? '⏳' : '🚫'}</span>
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* General Error Message */}
        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-red-border)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        {/* STUDENT LOGIN FORM */}
        {activeTab === 'STUDENT' && (
          <form onSubmit={handleStudentSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name * (As Registered)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Aarav Sharma"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">College / University Email *</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. aarav.sharma@campus.edu"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-neon-glow" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In as Student'}
            </button>
          </form>
        )}

        {/* ADMIN LOGIN FORM (Requirement 7: Full Name, Email, Admin Code - NO OTP) */}
        {activeTab === 'ADMIN' && (
          <form onSubmit={handleAdminSubmit}>
            <div className="form-group">
              <label className="form-label">Administrator Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Campus Administrator"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Email *</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. admin@campus.edu"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admin Security Code *</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter confidential authorization code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                Confidential administrator authorization code required.
              </span>
            </div>

            <button type="submit" className="btn btn-neon-glow" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Verifying Admin Access...' : 'Sign In as Administrator'}
            </button>
          </form>
        )}

        {/* Quick Demo Pre-fill Links for Testing */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ⚡ Testing Quick-Fill Accounts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
            <button type="button" onClick={fillApprovedStudent} className="btn btn-ice-glass btn-sm" title="Aarav Sharma (Approved)">
              🎓 Approved Student
            </button>
            <button type="button" onClick={fillPendingStudent} className="btn btn-ice-glass btn-sm" title="Kavya Patel (Pending Approval)">
              ⏳ Pending Student
            </button>
            <button type="button" onClick={fillAdmin} className="btn btn-ice-glass btn-sm" title="Campus Admin">
              🛡️ Admin
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.88rem', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          New student or administrator? <Link to="/register" style={{ fontWeight: 700, color: 'var(--light-gold)' }}>Create an Account</Link>
        </p>
      </div>
    </div>
  );
}