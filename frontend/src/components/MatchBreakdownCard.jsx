import React from 'react';

export function MatchBreakdownCard({ match }) {
  if (!match) return null;

  const scoreClass = match.matchScore >= 90 ? 'match-very-high'
    : match.matchScore >= 75 ? 'match-high'
    : match.matchScore >= 50 ? 'match-possible' : 'match-low';

  const dimensions = [
    { label: 'Category Match', score: match.categoryScore, max: 20 },
    { label: 'Brand Match', score: match.brandScore, max: 10 },
    { label: 'Color Match', score: match.colorScore, max: 15 },
    { label: 'Keyword Overlap', score: match.keywordScore, max: 20 },
    { label: 'Description Jaccard', score: match.descriptionScore, max: 10 },
    { label: 'Campus Distance (Dijkstra)', score: match.locationScore, max: 15, note: `${match.distanceMeters}m` },
    { label: 'Date Proximity', score: match.dateScore, max: 5 },
    { label: 'Time Proximity', score: match.timeScore, max: 5 }
  ];

  return (
    <div className="score-breakdown-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>Deterministic Match Analysis</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Computed across 8 distinct DSA scoring dimensions</p>
        </div>
        <div className={`match-badge ${scoreClass}`}>
          <span>{match.matchScore}%</span>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{match.matchGrade?.replace('_', ' ')}</span>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        {dimensions.map((dim, idx) => {
          const pct = Math.min(100, Math.round((dim.score / dim.max) * 100));
          return (
            <div key={idx} className="score-bar-row">
              <div className="score-bar-label">
                {dim.label}
                {dim.note && <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: 'var(--light-gold)', fontWeight: 700 }}>({dim.note})</span>}
              </div>
              <div className="score-progress-wrapper">
                <div className="score-progress-fill" style={{ width: `${pct}%`, background: pct >= 80 ? 'linear-gradient(90deg, #10B981, #6EE7B7)' : pct >= 50 ? 'linear-gradient(90deg, var(--ice-blue), var(--gold))' : 'linear-gradient(90deg, #F59E0B, #FDE68A)' }}></div>
              </div>
              <div className="score-bar-value">
                {dim.score}/{dim.max}
              </div>
            </div>
          );
        })}
      </div>

      {match.route && match.route.length > 0 && (
        <div style={{ background: 'rgba(7, 21, 33, 0.75)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--glass-border)', boxShadow: 'inset 0 1px 0 rgba(223, 247, 255, 0.1)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            🚶 Campus Walking Route (Shortest Path)
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--ice-glass)', fontWeight: 600 }}>
            {match.route.join(' ➔ ')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Total walking distance: <strong style={{ color: 'var(--light-gold)' }}>{match.distanceMeters} meters</strong> calculated by Dijkstra algorithm.
          </div>
        </div>
      )}

      {match.explanation && (
        <div style={{ background: 'rgba(212, 175, 55, 0.08)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gold-border)', borderLeft: '4px solid var(--gold)', fontSize: '0.88rem', color: 'var(--light-gold)' }}>
          <strong>Match Logic: </strong>{match.explanation}
        </div>
      )}
    </div>
  );
}
