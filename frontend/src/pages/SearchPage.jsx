import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemService, campusService } from '../services';
import { TrieAutocomplete } from '../components/TrieAutocomplete';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('ALL');
  const [category, setCategory] = useState('');
  const [locationId, setLocationId] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [locations, setLocations] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    campusService.getLocations().then(setLocations);
    executeSearch();
  }, [type, category, locationId, sortBy]);

  const executeSearch = async () => {
    setLoading(true);
    try {
      const data = await itemService.search({
        q: query.trim() || undefined,
        type,
        category: category || undefined,
        locationId: locationId || undefined,
        sortBy
      });
      setResults(data || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Campus Universal Search</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Search reported lost and found items across the entire university database with Trie prefix suggestions.
        </p>
      </div>

      <div className="card search-filter-card" style={{ marginBottom: '2rem', padding: '1.25rem', position: 'relative', zIndex: 100 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">Keyword (Trie Autocomplete)</label>
            <TrieAutocomplete
              value={query}
              onChange={setQuery}
              onSelect={() => executeSearch()}
              placeholder="e.g. earbuds, sony..."
            />
          </div>

          <div>
            <label className="form-label">Report Type</label>
            <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="ALL">All Items</option>
              <option value="LOST">Lost Items Only</option>
              <option value="FOUND">Found Items Only</option>
            </select>
          </div>

          <div>
            <label className="form-label">Category</label>
            <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Personal Belongings">Personal Belongings</option>
              <option value="Bags">Bags</option>
              <option value="Stationery">Stationery & Books</option>
              <option value="Accessories">Accessories</option>
              <option value="Keys">Keys</option>
            </select>
          </div>

          <div>
            <label className="form-label">Location</label>
            <select className="form-control" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <button type="submit" className="btn btn-ice-glass" style={{ width: '100%' }}>Search</button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Executing search query...</div>
      ) : results.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <h3>No items matched your query.</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {results.map(item => (
            <div key={`${item.type}-${item.id}`} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className={`badge ${item.type === 'LOST' ? 'badge-active' : 'badge-found'}`}>{item.type}</span>
                <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.2rem 0' }}>
                <Link to={`/${item.type.toLowerCase()}/${item.id}`}>{item.title}</Link>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', flex: 1 }}>{item.description}</p>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                📍 {item.locationName} • 📅 {item.date}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}