"use client";

import { useState, useEffect } from 'react';
import { draftUtils } from '../../lib/draftUtils';

export default function TestDraft() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [draftInfo, setDraftInfo] = useState(null);

  useEffect(() => {
    // Load draft on mount
    const draft = draftUtils.load();
    if (draft) {
      setTitle(draft.title || '');
      setBody(draft.body || '');
      setDraftInfo(draft);
    }
  }, []);

  useEffect(() => {
    // Auto-save draft after 1 second of inactivity
    const timeout = setTimeout(() => {
      if (title || body) {
        draftUtils.save(title, body);
        setDraftInfo({ title, body, timestamp: Date.now() });
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [title, body]);

  const clearDraft = () => {
    draftUtils.clear();
    setTitle('');
    setBody('');
    setDraftInfo(null);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Draft Test Page</h1>
      
      {draftInfo && (
        <div style={{ 
          padding: '1rem', 
          background: '#fef3c7', 
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          Draft saved automatically
          <button 
            onClick={clearDraft}
            style={{ 
              marginLeft: '1rem', 
              padding: '0.25rem 0.5rem',
              background: 'transparent',
              border: '1px solid #f59e0b',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Draft
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ 
            padding: '0.75rem', 
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
        
        <textarea
          placeholder="Write your note..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          style={{ 
            padding: '0.75rem', 
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />

        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Draft exists: {draftUtils.exists() ? 'Yes' : 'No'}
          {draftInfo && (
            <div>
              Draft age: {Math.floor((Date.now() - draftInfo.timestamp) / 1000)} seconds
            </div>
          )}
        </div>
      </div>
    </div>
  );
}