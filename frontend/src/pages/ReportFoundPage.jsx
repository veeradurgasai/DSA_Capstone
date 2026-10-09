import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService, campusService } from '../services';

export function ReportFoundPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    brand: '',
    color: '',
    locationId: '',
    foundDate: new Date().toISOString().split('T')[0],
    foundTime: '15:25',
    description: '',
    imageUrl: '',
    keywords: '',
    handoverOption: 'KEEPING_WITH_ME', // Requirement 17
    finderDescription: ''
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

      const result = await itemService.reportFound(payload);
      navigate(`/matches/found/${result.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit found report.');
    } finally {
      setLoading(false);
    }
  };

  const fillFoundEarbudsExample = () => {
    setFormData({
      title: 'Black Wireless Earbuds',
      category: 'Electronics',
      brand: 'Sony',
      color: 'Black',
      locationId: locations.find(l => l.name.includes('Library'))?.id || locations[0]?.id || 1,
      foundDate: '2026-10-01',
      foundTime: '15:25',
      description: 'Found black Sony earbuds in a charging case near the reading section.',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
      keywords: 'black, sony, wireless, earbuds, case, reading, library',
      handoverOption: 'KEEPING_WITH_ME',
      finderDescription: 'Keeping in my hostel backpack. Can verify with lost person when contacted.'
    });
  };

  return (
    <div style={{ maxWidth: '680px', margin: '1rem auto' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--charcoal-black)' }}>Report a Found Item</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Help return campus property to its rightful student owner.</p>
          </div>
          <button type="button" onClick={fillFoundEarbudsExample} className="btn btn-secondary btn-sm">
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
            <label className="form-label">Found Item Title *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              placeholder="e.g. Black Wireless Earbuds"
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
                placeholder="e.g. Sony, Dell, Apple"
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
                placeholder="e.g. Black, Silver, Blue"
                value={formData.color}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Where Was It Found? *</label>
              <select name="locationId" className="form-control" value={formData.locationId} onChange={handleChange} required>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date Found *</label>
              <input
                type="date"
                name="foundDate"
                className="form-control"
                value={formData.foundDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time Found *</label>
              <input
                type="time"
                name="foundTime"
                className="form-control"
                value={formData.foundTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Specific Location *</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              placeholder="e.g. Found on table 4 near the reference reading racks..."
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          {/* Handover Custody Selection (Requirement 17) */}
          <div className="form-group">
            <label className="form-label">Found Item Custody Choice *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginTop: '0.35rem' }}>
              <label
                style={{
                  border: `1.5px solid ${formData.handoverOption === 'KEEPING_WITH_ME' ? 'var(--lavender)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  cursor: 'pointer',
                  background: formData.handoverOption === 'KEEPING_WITH_ME' ? 'var(--lavender-light)' : '#ffffff'
                }}
              >
                <input
                  type="radio"
                  name="handoverOption"
                  value="KEEPING_WITH_ME"
                  checked={formData.handoverOption === 'KEEPING_WITH_ME'}
                  onChange={handleChange}
                  style={{ marginRight: '0.5rem' }}
                />
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--charcoal-black)' }}>OPTION 1</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>"I will keep it with me"</span>
              </label>

              <label
                style={{
                  border: `1.5px solid ${formData.handoverOption === 'HANDED_TO_OSW' ? 'var(--lavender)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  cursor: 'pointer',
                  background: formData.handoverOption === 'HANDED_TO_OSW' ? 'var(--lavender-light)' : '#ffffff'
                }}
              >
                <input
                  type="radio"
                  name="handoverOption"
                  value="HANDED_TO_OSW"
                  checked={formData.handoverOption === 'HANDED_TO_OSW'}
                  onChange={handleChange}
                  style={{ marginRight: '0.5rem' }}
                />
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--charcoal-black)' }}>OPTION 2</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>"I will hand it over to OSW/Admin"</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Finder Handover / Custody Notes (Optional)</label>
            <textarea
              name="finderDescription"
              className="form-control"
              rows="2"
              placeholder="e.g. Deposited with OSW reception desk or safe in my dorm room..."
              value={formData.finderDescription}
              onChange={handleChange}
            ></textarea>
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
            <label className="form-label">Keywords (Comma separated)</label>
            <input
              type="text"
              name="keywords"
              className="form-control"
              placeholder="e.g. earbuds, sony, charging, case, black"
              value={formData.keywords}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-liquid btn-lg" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Evaluating Algorithmic Matches...' : 'Submit Found Report & Check Matches'}
          </button>
        </form>
      </div>
    </div>
  );
}