import React, { useState, useEffect } from 'react';
import { campusService } from '../services';

export function CampusMapPage() {
  const [locations, setLocations] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [routeResult, setRouteResult] = useState(null);
  const [traversalResult, setTraversalResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      const [locs, g] = await Promise.all([
        campusService.getLocations(),
        campusService.getGraph()
      ]);
      setLocations(locs || []);
      setGraphData(g);
      if (locs && locs.length >= 3) {
        setFromId(locs[0].id); // 1: Library
        setToId(locs[2].id);   // 3: Academic Block
      }
    } catch (err) {
      console.error('Failed to load campus graph:', err);
    }
  };

  const handleCalculateShortestPath = async () => {
    if (!fromId || !toId) return;
    setLoading(true);
    setTraversalResult(null);
    try {
      const res = await campusService.getShortestPath(fromId, toId);
      setRouteResult(res);
    } catch (err) {
      alert(err.message || 'Error running Dijkstra shortest path.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunBfs = async () => {
    if (!fromId) return;
    setLoading(true);
    setRouteResult(null);
    try {
      const res = await campusService.runBfs(fromId);
      setTraversalResult(res);
    } catch (err) {
      alert(err.message || 'Error running BFS.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunDfs = async () => {
    if (!fromId) return;
    setLoading(true);
    setRouteResult(null);
    try {
      const res = await campusService.runDfs(fromId);
      setTraversalResult(res);
    } catch (err) {
      alert(err.message || 'Error running DFS.');
    } finally {
      setLoading(false);
    }
  };

  // Node coordinates for all 15 official campus locations (Requirement 29, 30, 64)
  const nodeCoords = {
    1: { x: 260, y: 150 }, // Library
    2: { x: 490, y: 80 },  // Temple
    3: { x: 420, y: 220 }, // Academic Block
    4: { x: 380, y: 340 }, // Main Canteen
    5: { x: 640, y: 230 }, // Lab Block & Kaivalya Bhavan Hostel
    6: { x: 810, y: 250 }, // Aitherya Bhavan Hostel
    7: { x: 440, y: 460 }, // Night Canteen
    8: { x: 120, y: 310 }, // Volleyball Court
    9: { x: 200, y: 430 }, // Basketball Court
    10: { x: 90, y: 130 },  // Girls Hostel Kaushitaki
    11: { x: 190, y: 220 }, // Badminton Court
    12: { x: 300, y: 560 }, // Football Ground
    13: { x: 580, y: 560 }, // Cricket Ground
    14: { x: 870, y: 390 }, // Vyasa Bhavan Hostel
    15: { x: 800, y: 90 }   // Villas (Seniors Hostels)
  };

  const activePathNodeIds = new Set(routeResult?.pathNodeIds || []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--charcoal-black)' }}>
          Campus Graph & Shortest Route Navigator
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Real-time algorithmic campus navigation powered by custom Java Graph algorithms: Dijkstra's Algorithm, Breadth-First Search (BFS), and Depth-First Search (DFS).
        </p>
      </div>

      {/* Control Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">Origin Location (From)</label>
            <select className="form-control" value={fromId} onChange={(e) => setFromId(e.target.value)}>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Destination Location (To)</label>
            <select className="form-control" value={toId} onChange={(e) => setToId(e.target.value)}>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={handleCalculateShortestPath} className="btn btn-3d-glass" disabled={loading}>
              🚶 Dijkstra Path
            </button>
            <button onClick={handleRunBfs} className="btn btn-neon-border" disabled={loading}>
              🌊 Run BFS
            </button>
            <button onClick={handleRunDfs} className="btn btn-neon-border" disabled={loading}>
              🌲 Run DFS
            </button>
          </div>
        </div>

        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          💡 <em>Tip: Click any node on the campus map below to quickly set Origin or Destination.</em>
        </div>
      </div>

      {/* Interactive Visual Map Canvas (15 Campus Nodes) */}
      <div className="card" style={{ padding: '1rem', overflowX: 'auto', marginBottom: '1.5rem' }}>
        <div style={{ minWidth: '960px', height: '620px', position: 'relative', background: 'rgba(4, 12, 20, 0.95)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', boxShadow: 'inset 0 2px 12px rgba(0, 0, 0, 0.8)' }}>
          <svg width="100%" height="100%" viewBox="0 0 980 620">
            {/* Draw Edges */}
            {graphData?.edges?.map((edge, idx) => {
              const src = nodeCoords[edge.sourceLocationId] || { x: 50, y: 50 };
              const tgt = nodeCoords[edge.targetLocationId] || { x: 100, y: 100 };
              const isPath = activePathNodeIds.has(edge.sourceLocationId) && activePathNodeIds.has(edge.targetLocationId);

              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2;

              return (
                <g key={idx}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isPath ? 'var(--gold)' : 'rgba(223, 247, 255, 0.22)'}
                    strokeWidth={isPath ? 4.5 : 2}
                    strokeDasharray={isPath ? 'none' : '4 3'}
                    filter={isPath ? 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.9))' : 'none'}
                  />
                  <rect
                    x={midX - 18}
                    y={midY - 9}
                    width={36}
                    height={16}
                    rx={4}
                    fill="#071521"
                    stroke={isPath ? 'var(--gold)' : 'rgba(223, 247, 255, 0.25)'}
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill={isPath ? 'var(--light-gold)' : 'var(--text-muted)'}
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="700"
                  >
                    {edge.distanceMeters}m
                  </text>
                </g>
              );
            })}

            {/* Draw Nodes (All 15 Locations) */}
            {graphData?.nodes?.map((node) => {
              const coord = nodeCoords[node.id] || { x: 100, y: 100 };
              const isActive = activePathNodeIds.has(node.id);
              const isStart = Number(fromId) === node.id;
              const isTarget = Number(toId) === node.id;

              return (
                <g
                  key={node.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (!fromId) setFromId(node.id);
                    else setToId(node.id);
                  }}
                >
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={isActive ? 16 : 13}
                    fill={isStart ? '#10B981' : isTarget ? '#EF4444' : isActive ? 'var(--gold)' : '#0B1F33'}
                    stroke={isActive ? '#FFFFFF' : 'rgba(223, 247, 255, 0.4)'}
                    strokeWidth={2.5}
                    filter={isActive ? 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.95))' : 'none'}
                  />
                  <text
                    x={coord.x}
                    y={coord.y - 18}
                    textAnchor="middle"
                    fill="#f4f4f5"
                    fontSize="11"
                    fontWeight="700"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                  >
                    {node.name}
                  </text>
                  <text
                    x={coord.x}
                    y={coord.y + 4}
                    textAnchor="middle"
                    fill={isActive || isStart || isTarget ? '#ffffff' : '#a1a1aa'}
                    fontSize="9.5"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    #{node.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Dijkstra Shortest Path Result */}
      {routeResult && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '5px solid var(--gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              Dijkstra Shortest Route: {routeResult.sourceName} ➔ {routeResult.targetName}
            </h3>
            <div className="badge badge-matched" style={{ fontSize: '1.05rem', padding: '0.4rem 0.9rem' }}>
              Walking Distance: {routeResult.distanceMeters} meters
            </div>
          </div>

          <div style={{ background: 'rgba(7, 21, 33, 0.75)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
              Optimal Sequence of Waypoints:
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--light-gold)', fontFamily: 'var(--font-mono)' }}>
              {routeResult.pathNodes.join(' ➔ ')}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-ice)' }}>
              Algorithmic Step-by-Step Traversal Trace (Java Dijkstra):
            </div>
            <div className="dsa-step-box">
              {routeResult.stepByStepPath?.map((step, idx) => (
                <div key={idx} style={{ marginBottom: '0.35rem' }}>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Traversal Result Box (BFS / DFS) */}
      {traversalResult && (
        <div className="card" style={{ borderLeft: '5px solid var(--ice-glass)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFFFFF' }}>
            {traversalResult.algorithm} Graph Traversal from: {traversalResult.startNodeName}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Nodes visited in order using queue/stack based exploration:
          </p>
          <div style={{ background: 'rgba(7, 21, 33, 0.75)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.92rem', color: 'var(--ice-glass)', fontWeight: 700 }}>
            {traversalResult.visitedNodes?.join(' ➔ ')}
          </div>
        </div>
      )}
    </div>
  );
}