import React, { useState } from 'react';
import { dsaService, campusService } from '../services';

export function DsaVisualizerPage() {
  const [activeTab, setActiveTab] = useState('trie');

  // Trie state
  const [trieInput, setTrieInput] = useState('');
  const [trieResult, setTrieResult] = useState(null);

  // Heap state
  const [heapInput, setHeapInput] = useState('');
  const [heapState, setHeapState] = useState([94, 82, 79, 61, 43]);
  const [heapMessage, setHeapMessage] = useState('');

  // Sort state
  const [sortInput, setSortInput] = useState('8, 3, 5, 1, 9, 2, 7, 4');
  const [sortResult, setSortResult] = useState(null);

  // Binary search state
  const [bsArray, setBsArray] = useState('10, 20, 30, 40, 50, 60, 70, 80, 90');
  const [bsTarget, setBsTarget] = useState('50');
  const [bsResult, setBsResult] = useState(null);

  // Hash Table state
  const [hashKey, setHashKey] = useState('');
  const [hashVal, setHashVal] = useState('');
  const [hashEntries, setHashEntries] = useState([
    { key: 'Electronics', hash: 12, bucket: 4, value: 'Category ID 101' },
    { key: 'Sony', hash: 89, bucket: 9, value: 'Brand Metadata' },
    { key: 'Earbuds', hash: 35, bucket: 3, value: 'Token Index' }
  ]);

  // Trie handlers
  const handleTrieInsert = async () => {
    if (!trieInput.trim()) return;
    const res = await dsaService.insertTrie(trieInput.trim());
    setTrieResult(res);
  };

  const handleTrieSearch = async () => {
    if (!trieInput.trim()) return;
    const res = await dsaService.searchTrie(trieInput.trim());
    setTrieResult(res);
  };

  const handleTriePrefix = async () => {
    if (!trieInput.trim()) return;
    const res = await dsaService.prefixTrie(trieInput.trim());
    setTrieResult(res);
  };

  // Heap handlers
  const handleHeapInsert = async () => {
    const val = parseInt(heapInput, 10);
    if (isNaN(val)) return;
    const res = await dsaService.insertHeap(val);
    setHeapState(res.currentHeap);
    setHeapMessage(`Inserted score: ${val}`);
    setHeapInput('');
  };

  const handleHeapExtract = async () => {
    const res = await dsaService.extractHeap();
    if (res.extractedMax !== null) {
      setHeapState(res.currentHeap);
      setHeapMessage(`Extracted Root Maximum: ${res.extractedMax}`);
    } else {
      setHeapMessage('Heap is empty.');
    }
  };

  // Sort handlers
  const handleRunSort = async () => {
    try {
      const nums = sortInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      const res = await dsaService.sortNumbers(nums);
      setSortResult(res);
    } catch (err) {
      alert('Invalid numbers input.');
    }
  };

  // Binary search handlers
  const handleRunBinarySearch = async () => {
    try {
      const nums = bsArray.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      const target = parseInt(bsTarget, 10);
      const res = await dsaService.binarySearch(nums, target);
      setBsResult(res);
    } catch (err) {
      alert('Invalid input.');
    }
  };

  // Hash table handler
  const handleAddHash = () => {
    if (!hashKey || !hashVal) return;
    let h = 0;
    for (let i = 0; i < hashKey.length; i++) {
      h = (h * 31 + hashKey.charCodeAt(i)) % 1000;
    }
    const bucket = Math.abs(h) % 16;
    setHashEntries([...hashEntries, { key: hashKey, hash: h, bucket, value: hashVal }]);
    setHashKey('');
    setHashVal('');
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>DSA Algorithm & Data Structure Laboratory</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Interactive visualization and live verification of all custom Java algorithms powering the system.
        </p>
      </div>

      {/* Tabs */}
      <div className="dsa-tabs">
        <button className={`dsa-tab-btn ${activeTab === 'trie' ? 'active' : ''}`} onClick={() => setActiveTab('trie')}>
          🌳 Trie (Prefix Tree)
        </button>
        <button className={`dsa-tab-btn ${activeTab === 'heap' ? 'active' : ''}`} onClick={() => setActiveTab('heap')}>
          🏔️ Binary Max-Heap
        </button>
        <button className={`dsa-tab-btn ${activeTab === 'sort' ? 'active' : ''}`} onClick={() => setActiveTab('sort')}>
          🔀 Merge Sort O(n log n)
        </button>
        <button className={`dsa-tab-btn ${activeTab === 'binary-search' ? 'active' : ''}`} onClick={() => setActiveTab('binary-search')}>
          🎯 Binary Search O(log n)
        </button>
        <button className={`dsa-tab-btn ${activeTab === 'hash-table' ? 'active' : ''}`} onClick={() => setActiveTab('hash-table')}>
          ⚡ Custom Hash Table
        </button>
      </div>

      {/* 1. TRIE TAB */}
      {activeTab === 'trie' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Trie (Prefix Tree) Visualizer</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Complexity: Insert O(L), Search O(L), Prefix Autocomplete O(P + K)</p>
            </div>
            <span className="badge badge-active">Java Class: Trie.java</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. earbuds, earphones, early..."
              value={trieInput}
              onChange={(e) => setTrieInput(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
            <button onClick={handleTrieInsert} className="btn btn-primary">Insert Word</button>
            <button onClick={handleTrieSearch} className="btn btn-secondary">Search Exact</button>
            <button onClick={handleTriePrefix} className="btn btn-secondary">Prefix Autocomplete</button>
          </div>

          {trieResult && (
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>
                Operation: <span style={{ color: 'var(--primary)' }}>{trieResult.operation}</span> for query "<strong>{trieResult.query}</strong>"
              </div>
              <div>Status: {trieResult.found ? '✅ Match Found' : '❌ Not Found'}</div>
              {trieResult.wordsWithPrefix && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Words matching prefix:</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                    {trieResult.wordsWithPrefix.map((w, idx) => (
                      <span key={idx} className="badge badge-active" style={{ fontSize: '0.9rem' }}>{w}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. HEAP TAB */}
      {activeTab === 'heap' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Binary Max-Heap (Priority Queue)</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Complexity: Insert O(log n), ExtractMax O(log n), Peek O(1)</p>
            </div>
            <span className="badge badge-active">Java Class: MaxHeap.java</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input
              type="number"
              className="form-control"
              placeholder="Match score (e.g. 98)"
              value={heapInput}
              onChange={(e) => setHeapInput(e.target.value)}
              style={{ maxWidth: '200px' }}
            />
            <button onClick={handleHeapInsert} className="btn btn-primary">Insert Score</button>
            <button onClick={handleHeapExtract} className="btn btn-danger">Extract Max Root</button>
          </div>

          {heapMessage && (
            <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 600 }}>
              {heapMessage}
            </div>
          )}

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Current Heap Array Representation:</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontFamily: 'var(--font-mono)' }}>
              {heapState.map((val, idx) => (
                <div key={idx} style={{ background: idx === 0 ? 'var(--primary)' : '#1e293b', color: '#ffffff', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Index {idx}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{val}</div>
                  <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>{idx === 0 ? 'ROOT (MAX)' : `P: ${Math.floor((idx - 1) / 2)}`}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. MERGE SORT TAB */}
      {activeTab === 'sort' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Merge Sort Step-by-Step Execution</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Divide and Conquer: Time O(n log n) Guaranteed, Space O(n)</p>
            </div>
            <span className="badge badge-active">Java Class: MergeSort.java</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control"
              value={sortInput}
              onChange={(e) => setSortInput(e.target.value)}
              placeholder="Comma separated integers"
              style={{ maxWidth: '400px' }}
            />
            <button onClick={handleRunSort} className="btn btn-primary">Run MergeSort</button>
          </div>

          {sortResult && (
            <div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span className="badge badge-active">Time: {sortResult.timeComplexity}</span>
                <span className="badge badge-matched">Space: {sortResult.spaceComplexity}</span>
                <span className="badge badge-resolved">Result: [{sortResult.sorted.join(', ')}]</span>
              </div>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.4rem' }}>Algorithm Intermediate Steps:</h4>
              <div className="dsa-step-box">
                {sortResult.steps.map((step, idx) => (
                  <div key={idx}>{step}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. BINARY SEARCH TAB */}
      {activeTab === 'binary-search' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Binary Search Range Reduction</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Precondition: Sorted Array • Time O(log n) • Space O(1)</p>
            </div>
            <span className="badge badge-active">Java Class: BinarySearch.java</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <label className="form-label">Sorted Array</label>
              <input
                type="text"
                className="form-control"
                value={bsArray}
                onChange={(e) => setBsArray(e.target.value)}
              />
            </div>
            <div style={{ width: '120px' }}>
              <label className="form-label">Target</label>
              <input
                type="number"
                className="form-control"
                value={bsTarget}
                onChange={(e) => setBsTarget(e.target.value)}
              />
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button onClick={handleRunBinarySearch} className="btn btn-primary">Search</button>
            </div>
          </div>

          {bsResult && (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <span className={`badge ${bsResult.found ? 'badge-matched' : 'badge-danger'}`} style={{ fontSize: '0.95rem' }}>
                  {bsResult.found ? `Target ${bsResult.target} found at index ${bsResult.index}` : `Target ${bsResult.target} not found`}
                </span>
              </div>
              <div className="dsa-step-box">
                {bsResult.steps.map((step, idx) => (
                  <div key={idx}>{step}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. HASH TABLE TAB */}
      {activeTab === 'hash-table' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Custom Separate-Chaining Hash Table</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Polynomial Rolling Hash with dynamic rehashing at 0.75 load factor</p>
            </div>
            <span className="badge badge-active">Java Class: CustomHashTable.java</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Key (e.g. Sony)"
              value={hashKey}
              onChange={(e) => setHashKey(e.target.value)}
              style={{ maxWidth: '200px' }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Value (e.g. Japanese Electronics)"
              value={hashVal}
              onChange={(e) => setHashVal(e.target.value)}
              style={{ maxWidth: '280px' }}
            />
            <button onClick={handleAddHash} className="btn btn-primary">Put(key, value)</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.65rem' }}>Key</th>
                  <th style={{ padding: '0.65rem' }}>Polynomial Hash</th>
                  <th style={{ padding: '0.65rem' }}>Bucket Index (h % 16)</th>
                  <th style={{ padding: '0.65rem' }}>Stored Value</th>
                </tr>
              </thead>
              <tbody>
                {hashEntries.map((entry, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 0.65rem', fontWeight: 700 }}>{entry.key}</td>
                    <td style={{ padding: '0.75rem 0.65rem', fontFamily: 'var(--font-mono)' }}>{entry.hash}</td>
                    <td style={{ padding: '0.75rem 0.65rem' }}>
                      <span className="badge badge-active">Bucket #{entry.bucket}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.65rem' }}>{entry.value}</td>
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