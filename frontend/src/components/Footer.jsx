import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFFFFF' }}>
            Lost & Found <span style={{ color: 'var(--gold)' }}>Intelligence</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Campus Lost & Found Intelligence Network • Deterministic DSA Engine
          </p>
        </div>

        <div className="footer-dsa-tags">
          <span className="footer-tag">CustomHashTable O(1)</span>
          <span className="footer-tag">Trie Autocomplete O(L)</span>
          <span className="footer-tag">MaxHeap Ranking O(log n)</span>
          <span className="footer-tag">MergeSort O(n log n)</span>
          <span className="footer-tag">Dijkstra Shortest Path</span>
          <span className="footer-tag">BFS/DFS Traversals</span>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-dim)', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
        Engineered with Java 17 Spring Boot, React, and Ice Glass + Gold Architecture. All DSA executed deterministically.
      </div>
    </footer>
  );
}
