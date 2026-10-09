import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { matchService, itemService } from '../services';
import { MatchBreakdownCard } from '../components/MatchBreakdownCard';

export function MatchPage({ queryType = 'lost' }) {
  const { id } = useParams();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [sourceItem, setSourceItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, [id, queryType]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      if (queryType === 'direct') {
        const directMatch = await matchService.getMatchById(id);
        setMatches([directMatch]);
        setSelectedMatch(directMatch);
      } else if (queryType === 'lost') {
        const [matchList, item] = await Promise.all([
          matchService.getMatchesForLost(id),
          itemService.getLostItem(id)
        ]);
        setMatches(matchList || []);
        setSourceItem(item);
        if (matchList && matchList.length > 0) {
          setSelectedMatch(matchList[0]);
        }
      } else {
        const [matchList, item] = await Promise.all([
          matchService.getMatchesForFound(id),
          itemService.getFoundItem(id)
        ]);
        setMatches(matchList || []);
        setSourceItem(item);
        if (matchList && matchList.length > 0) {
          setSelectedMatch(matchList[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Computing Dijkstra routes & MaxHeap ranking...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Intelligent Match Analysis</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Evaluated using custom Java algorithms (Dijkstra Shortest Path, Jaccard Keyword Overlap, MaxHeap Ranking).
        </p>
      </div>

      {sourceItem && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--gold)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--light-gold)', textTransform: 'uppercase' }}>
            Target {queryType.toUpperCase()} Item
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem', color: '#FFFFFF' }}>{sourceItem.title}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Category: {sourceItem.category} • Location: {sourceItem.locationName} • Date: {sourceItem.date} {sourceItem.time}
          </div>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <h3>No algorithmic matches identified yet.</h3>
          <p style={{ marginTop: '0.5rem' }}>
            Our background matching engine scans whenever new reports are submitted.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Matches List sidebar if multiple */}
          {matches.length > 1 && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#FFFFFF' }}>
                Top Matches Ranked by MaxHeap ({matches.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {matches.map(m => {
                  const isSelected = selectedMatch?.id === m.id;
                  return (
                    <div
                      key={m.id}
                      className="card"
                      onClick={() => setSelectedMatch(m)}
                      style={{
                        cursor: 'pointer',
                        borderColor: isSelected ? 'var(--gold)' : 'var(--glass-border)',
                        background: isSelected ? 'rgba(212, 175, 55, 0.12)' : 'var(--glass-bg)',
                        boxShadow: isSelected ? '0 0 15px rgba(212, 175, 55, 0.2)' : 'none',
                        padding: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>
                          {queryType === 'lost' ? m.foundItemTitle : m.lostItemTitle}
                        </div>
                        <div style={{ fontWeight: 800, color: m.matchScore >= 75 ? 'var(--light-gold)' : 'var(--text-ice)' }}>
                          {m.matchScore}%
                        </div>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Distance: {m.distanceMeters}m • Grade: {m.matchGrade}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Match Breakdown view */}
          <div style={{ gridColumn: matches.length > 1 ? 'span 2' : 'span 1' }}>
            {selectedMatch && (
              <div>
                <MatchBreakdownCard match={selectedMatch} />
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link to={`/found/${selectedMatch.foundItemId}`} className="btn btn-liquid">
                    View Found Item & Claim →
                  </Link>
                  <Link to={`/lost/${selectedMatch.lostItemId}`} className="btn btn-electric">
                    View Lost Report
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}