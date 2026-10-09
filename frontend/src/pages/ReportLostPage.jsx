import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService, campusService } from '../services';

export function ReportLostPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    brand: '',
    color: '',
    locationId: '',
    lostDate: new Date().toISOString().split('T')[0],
    lostTime: '15:00',
    description: '',
    imageUrl: '',
    keywords: '',
    ownerDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    campusService.getLocations().then(locs => {
      setLocations(locs || []);
      if (locs && locs.length > 0) {
        setFormData(prev => ({ ...prev, locationId: locs[0].id }));
      }
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const kwList = formData.keywords ? formData.keywords.split(',').map(s => s.trim()) : [];
      const payload = {
        ...formData,
        locationId: Number(formData.locationId),
        keywords: kwList
      };

      const result = await itemService.reportLost(payload);
      // Redirect to potential matches page
      navigate(`/matches/lost/${result.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  const fillSonyEarbudsExample = () => {
    setFormData({
      title: 'Sony Wireless Earbuds',
      category: 'Electronics',
      brand: 'Sony',
      color: 'Black',
      locationId: locations.find(l => l.name.includes('Library'))?.id || locations[0]?.id || 1,
      lostDate: '2026-10-01',
      lostTime: '15:00',
      description: 'Black Sony wireless earbuds inside a small black charging case. Lost near the second-floor reading section.',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
      keywords: 'black, sony, wireless, earbuds, charging, case, library',
      ownerDescription: 'Has a small scratch on the back corner of the case and blue tip cushion.'
    });
  };

  return (
    <div style={{ maxWidth: '680px', margin: '1rem auto' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--charcoal-black)' }}>Report a Lost Item</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Enter precise details to trigger the deterministic matching engine.</p>
          </div>
          <button type="button" onClick={fillSonyEarbudsExample} className="btn btn-secondary btn-sm">
            ✨ Auto-fill Example
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item Title *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              placeholder="e.g. Sony Wireless Earbuds"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="category" className="form-control" value={formData.category} onChange={handleChange} required>
                <option value="Electronics">Electronics</option>
                <option value="Personal Belongings">Personal Belongings</option>
                <option value="Bags">Bags & Luggage</option>
                <option value="Stationery">Stationery & Books</option>
                <option value="Accessories">Accessories & Jewelry</option>
                <option value="Keys">Keys</option>
                <option value="Clothing">Clothing</option>
                <option value="Sports">Sports Equipment</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                type="text"
                name="brand"
                className="form-control"
                placeholder="e.g. Sony, Apple, Nike"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <input
                type="text"
                name="color"
                className="form-control"
                placeholder="e.g. Black, White, Red"
                value={formData.color}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Campus Location *</label>
              <select name="locationId" className="form-control" value={formData.locationId} onChange={handleChange} required>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date Lost *</label>
              <input
                type="date"
                name="lostDate"
                className="form-control"
                value={formData.lostDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time Lost (Approx.) *</label>
              <input
                type="time"
                name="lostTime"
                className="form-control"
                value={formData.lostTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              placeholder="e.g. Black Sony wireless earbuds inside a small black charging case..."
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          {/* Owner Identifying Proof for Handover Verification (Requirement 19 & 20) */}
          <div className="form-group">
            <label className="form-label">Identifying Proof Details (Optional - for Verification)</label>
            <textarea
              name="ownerDescription"
              className="form-control"
              rows="2"
              placeholder="Private details known only to you (e.g. specific stickers, scratches, wallpaper, serial suffix)..."
              value={formData.ownerDescription}
              onChange={handleChange}
            ></textarea>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem', display: 'block' }}>
              Used to verify genuine ownership when a matching found item is retrieved.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL (Optional)</label>
            <input
              type="url"
              name="imageUrl"
              className="form-control"
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Keywords (Comma separated for Trie index)</label>
            <input
              type="text"
              name="keywords"
              className="form-control"
              placeholder="e.g. earbuds, sony, charging, case, black"
              value={formData.keywords}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Evaluating Algorithmic Matches...' : 'Submit Lost Report & Find Matches'}
          </button>
        </form>
      </div>
    </div>
  );
}