import React, { useState, useEffect, useRef } from 'react';
import { itemService } from '../services';

export function TrieAutocomplete({ value, onChange, onSelect, placeholder = 'Search by keyword...' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!value || value.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const words = await itemService.getAutocomplete(value.trim());
        setSuggestions(words || []);
        setShowDropdown((words || []).length > 0);
      } catch (err) {
        console.error('Trie autocomplete fetch failed:', err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (word) => {
    onChange(word);
    setShowDropdown(false);
    if (onSelect) onSelect(word);
  };

  return (
    <div className="autocomplete-container" ref={containerRef}>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
      />

      {showDropdown && suggestions.length > 0 && (
        <ul className="autocomplete-dropdown">
          <li style={{ padding: '0.45rem 0.9rem', fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(11, 31, 51, 0.95)', borderBottom: '1px solid var(--glass-border)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ⚡ Trie Prefix Suggestions
          </li>
          {suggestions.map((word, idx) => (
            <li
              key={idx}
              className="autocomplete-item"
              onClick={() => handleSelect(word)}
            >
              {word}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
