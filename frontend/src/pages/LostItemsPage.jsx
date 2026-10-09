import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemService, campusService } from '../services';
import { TrieAutocomplete } from '../components/TrieAutocomplete';

export function LostItemsPage() {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [locationId, setLocationId] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campusService.getLocations().then(setLocations);
  }, []);

  useEffect(() => {
    loadItems();
  }, [category, locationId, sortBy]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await itemService.getLostItems({
        query: query.trim() || undefined,
        category: category || undefined,
        locationId: locationId || undefined,
        sortBy
      });
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load lost items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadItems();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Reported Lost Items</h1>
          <p style={{ color: 'var(--text-muted)' }}>Browse community-reported missing items across campus.</p>
        </div>
        <Link to="/report-lost" className="btn btn-electric">
          + Report Lost Item
        </Link>
      </div>

      {/* Filter and Trie Autocomplete Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">Trie Autocomplete Search</label>
            <TrieAutocomplete
              value={query}
              onChange={setQuery}
              onSelect={() => loadItems()}
              placeholder="e.g. earbuds, dell, keys..."
            />
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
              <option value="Clothing">Clothing</option>
              <option value="Sports">Sports</option>
            </select>
          </div>

          <div>
            <label className="form-label">Location</label>
            <select className="form-control" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              <option value="">All Campus Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">MergeSort Ordering</label>
            <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date (Newest First)</option>
              <option value="title">Title (Alphabetical A-Z)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-electric" style={{ flex: 1 }}>Filter</button>
            <button type="button" onClick={() => { setQuery(''); setCategory(''); setLocationId(''); setSortBy('date'); }} className="btn btn-electric">Reset</button>
          </div>
        </form>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Loading lost items directory...</div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <h3>No lost items match your current filter.</h3>
          <p style={{ marginTop: '0.5rem' }}>Try clearing filters or search by a broader keyword.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {items.map(item => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden', borderRadius: 'var(--radius-md)', marginBottom: '1rem', background: '#071521' }}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600'; }}
                />
                <span className={`badge badge-${item.status.toLowerCase()}`} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  {item.status}
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--ice-glass)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {item.category} • {item.brand || 'Unbranded'}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.35rem 0', color: '#FFFFFF' }}>
                  <Link to={`/lost/${item.id}`}>{item.title}</Link>
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  {item.description}
                </p>
                <div style={{ fontSize: '0.82rem', color: 'var(--ice-glass)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <span>📍</span> <strong>{item.locationName}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  📅 Lost on {item.date} at {item.time}
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to={`/matches/lost/${item.id}`} className="btn btn-electric btn-sm">
                  🎯 Matches
                </Link>
                <Link to={`/lost/${item.id}`} className="btn btn-electric btn-sm">
                  Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}