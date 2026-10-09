import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span>⚡ Campus Lost & Found • Algorithmic Intelligence</span>
        </div>
        <h1 className="hero-title">
          Reconnecting Lost Campus Items with Deterministic Precision
        </h1>
        <p className="hero-subtitle">
          An intelligent campus platform matching lost belongings and found items using custom Java Hash Tables, Trie prefix autocomplete, MaxHeap ranking, and Dijkstra shortest path campus routing.
        </p>

        {/* Hero Actions (DSA Lab button removed) */}
        <div className="hero-cta">
          <Link to={user ? "/report-lost" : "/login"} className="btn btn-ice-glass btn-lg">
            🔍 Report Lost Item
          </Link>
          <Link to={user ? "/report-found" : "/login"} className="btn btn-liquid btn-lg">
            📦 Report Found Item
          </Link>
          <Link to="/map" className="btn btn-3d-glass btn-lg">
            🗺️ Campus Map
          </Link>
        </div>

        {/* Google Lens Informational Callout (Requirement 26) */}
        <div className="lens-info-banner">
          <div className="lens-icon-bubble">
            📷
          </div>
          <div className="lens-info-content">
            <h4>Item Identification Tip</h4>
            <p>
              <strong>You can use Lens if you don't know what the item or model is.</strong> Use Google Lens or your device's visual search on a photo to quickly identify brand names, model numbers, and exact product titles before filing your report.
            </p>
          </div>
        </div>
      </section>

      {/* Directory Quick Navigation Cards (Requirement 28) */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--ice-glass)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🔍</span>
            <span className="badge badge-active">Active Reports</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem', color: '#FFFFFF' }}>
            Lost Directory
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Browse missing laptops, student ID cards, keys, earphones, and personal property reported lost by campus students.
          </p>
          <Link to="/lost" className="btn btn-electric btn-sm" style={{ width: '100%' }}>
            Browse Lost Directory →
          </Link>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📦</span>
            <span className="badge badge-found">Awaiting Claim</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem', color: '#FFFFFF' }}>
            Found Directory
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            View items discovered across libraries, hostels, labs, and sports grounds awaiting owner verification and handover.
          </p>
          <Link to="/found" className="btn btn-liquid btn-sm" style={{ width: '100%' }}>
            Browse Found Directory →
          </Link>
        </div>
      </section>

      {/* Algorithmic Features Grid (DSA Lab card REMOVED) */}
      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Deterministic Matching Engine</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Backend scoring algorithm evaluating Category, Color, Brand, Jaccard Keyword Overlap, Physical Location Distance, Date, and Time.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🗺️</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Dijkstra Campus Routing</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Weighted campus graph connecting 15 physical locations. Dijkstra computes shortest pedestrian walking meters between lost and found locations.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Trie Keyword Autocomplete</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Custom Trie prefix tree indexing item titles, descriptions, and categories for instant sub-millisecond keyword recommendations as you type.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🏆</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>MaxHeap Match Ranking</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Binary Max-Heap priority queue organizing candidates by match score, ensuring top probability pairings are presented first in O(log n) time.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Verified Student Handover</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Structured claim and handover flow. Finders choose between keeping items or handing over to OSW/Admin with mutual verification descriptions.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📋</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Admin Record Auditing</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Full administrative oversight for reviewing student registrations, monitoring item custody, verifying ownership proof, and auditing resolutions.
          </p>
        </div>
      </section>

      {/* Academic Architecture Section */}
      <section className="card" style={{ marginTop: '2rem', background: '#18181b', color: '#f8fafc', padding: '2.5rem', border: 'none' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff' }}>
            Built for Academic Excellence & Campus Security
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#a1a1aa', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Pure Java Data Structures and Algorithms execute deterministically on the backend. Every distance in meters is calculated by Dijkstra, every autocomplete is retrieved by a Trie, and every ranking is extracted from a binary MaxHeap.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/lost" className="btn btn-primary">Browse Lost Items</Link>
            <Link to="/map" className="btn btn-secondary">Explore Campus Map</Link>
          </div>
        </div>
      </section>
    </div>
  );
}