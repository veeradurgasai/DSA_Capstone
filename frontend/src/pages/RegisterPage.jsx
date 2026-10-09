import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';

export function RegisterPage() {
  const [activeTab, setActiveTab] = useState('STUDENT'); // 'STUDENT' or 'ADMIN'

  // Student Form State
  const [studentName, setStudentName] = useState('');
  const [studentCollegeEmail, setStudentCollegeEmail] = useState('');
  const [studentPersonalEmail, setStudentPersonalEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentRegistered, setStudentRegistered] = useState(false);

  // Admin Form State
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [adminOtp, setAdminOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerStudent, registerAdmin } = useAuth();
  const navigate = useNavigate();

  // Handle Student Registration
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerStudent({
        name: studentName,
        email: studentCollegeEmail,
        collegeEmail: studentCollegeEmail,
        personalEmail: studentPersonalEmail,
        phone: studentPhone,
        password: studentPassword
      });
      // Do not log in. Show pending approval state (Requirement 2)
      setStudentRegistered(true);
    } catch (err) {
      setError(err.message || 'Student registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  // Request OTP for Admin Registration via Mobile Phone (MessageCentral VerifyNow)
  const handleSendAdminOtp = async () => {
    if (!adminEmail || !adminEmail.trim()) {
      setError('Please enter your official email address first.');
      return;
    }
    if (!adminPhone || !adminPhone.trim()) {
      setError('Please enter your mobile phone number first to receive a verification OTP.');
      return;
    }
    if (!adminCode || !adminCode.trim()) {
      setError('Please enter your Admin Registration Code first before requesting an OTP.');
      return;
    }
    setError('');
    try {
      const res = await authService.sendAdminOtp(adminPhone.trim(), adminEmail.trim(), adminCode.trim());
      if (res && res.verificationId) {
        setVerificationId(res.verificationId);
      }
      setOtpSent(true);
      setOtpMessage(`Verification OTP code has been sent via SMS to mobile number: ${adminPhone.trim()}`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP to mobile.');
    }
  };

  // Handle Admin Registration
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!adminPhone || !adminPhone.trim()) {
      setError('Mobile phone number is required for administrator registration.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await registerAdmin({
        name: adminName,
        email: adminEmail,
        phone: adminPhone.trim(),
        adminCode: adminCode,
        otp: adminOtp,
        verificationId: verificationId
      });
      alert('Administrator account created successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Admin registration failed. Please verify the code and mobile OTP.');
    } finally {
      setLoading(false);
    }
  };

  // If student registration is successful and waiting for approval
  if (studentRegistered) {
    return (
      <div style={{ maxWidth: '520px', margin: '3rem auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', borderTop: '5px solid var(--warning)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--charcoal-black)', marginBottom: '0.75rem' }}>
            Registration Submitted
          </h2>
          <div style={{ background: 'var(--warning-bg)', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', color: '#92400e', fontSize: '0.95rem', fontWeight: 600 }}>
            Your registration is waiting for administrator approval.
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Thank you, <strong>{studentName}</strong>. An administrator will review your college credentials ({studentCollegeEmail}). Once your account is marked as <strong>APPROVED</strong>, you will be able to log in to the student portal.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-neon-glow">
              Return to Login
            </Link>
            <Link to="/" className="btn btn-ice-glass">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '520px', margin: '2rem auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--charcoal-black)' }}>Create an Account</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Join the campus lost and found algorithmic intelligence network
          </p>
        </div>

        {/* Tab Switcher: Student vs Admin */}
        <div className="auth-tab-group">
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'STUDENT' ? 'active' : ''}`}
            onClick={() => { setActiveTab('STUDENT'); setError(''); }}
          >
            🎓 Student Registration
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'ADMIN' ? 'active' : ''}`}
            onClick={() => { setActiveTab('ADMIN'); setError(''); }}
          >
            🛡️ Admin Registration
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-red-border)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        {/* STUDENT REGISTRATION FORM */}
        {activeTab === 'STUDENT' && (
          <form onSubmit={handleStudentSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name * (As per University ID)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Aarav Sharma"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem', display: 'block' }}>
                Enter your full name exactly as it appears on your official college ID card.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">University / College Email ID *</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. aarav.sharma@campus.edu"
                value={studentCollegeEmail}
                onChange={(e) => setStudentCollegeEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Personal Email ID *</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. aarav.personal@gmail.com"
                value={studentPersonalEmail}
                onChange={(e) => setStudentPersonalEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+91-9876543210"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password * (Min 6 characters)</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div style={{ background: 'rgba(223, 247, 255, 0.06)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ℹ️ <strong>Workflow:</strong> Upon registration, your request will be placed in the Admin Approval queue. You can log in once reviewed and approved.
            </div>

            <button type="submit" className="btn btn-neon-glow" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Submitting Registration...' : 'Submit Student Registration'}
            </button>
          </form>
        )}

        {/* ADMIN REGISTRATION FORM */}
        {activeTab === 'ADMIN' && (
          <form onSubmit={handleAdminSubmit}>
            <div className="form-group">
              <label className="form-label">Administrator Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Prof. Ramesh Kumar"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Email Address *</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. ramesh.admin@campus.edu"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Phone Number *</label>
              <input
                type="tel"
                className="form-control"
                placeholder="e.g. +91 98765 43210"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                Your mobile phone number will receive the SMS verification OTP.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Registration Code *</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter confidential registration code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                Confidential administrator authorization code required.
              </span>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Mobile Verification OTP *</label>
                <button
                  type="button"
                  onClick={handleSendAdminOtp}
                  className="btn btn-ice-glass btn-sm"
                  style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}
                >
                  Send Mobile OTP
                </button>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="6-digit mobile verification code"
                value={adminOtp}
                onChange={(e) => setAdminOtp(e.target.value)}
                required
              />
              {otpMessage && (
                <span style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '0.3rem', display: 'block' }}>
                  ✓ {otpMessage}
                </span>
              )}
            </div>

            <button type="submit" className="btn btn-neon-glow" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Creating Admin Account...' : 'Register Administrator'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.88rem', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Already registered? <Link to="/login" style={{ fontWeight: 700, color: 'var(--light-gold)' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}