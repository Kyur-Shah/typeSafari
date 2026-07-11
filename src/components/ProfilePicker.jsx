import React from 'react';
import { User, Plus } from 'lucide-react';
import { audio } from '../utils/audio';

export default function ProfilePicker({ globalState, onSelectProfile, onCreateProfile }) {
  const users = Object.values(globalState.users || {});

  const handleSelect = (userId) => {
    audio.playClick();
    onSelectProfile(userId);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dbeafe 100%)',
      padding: '2rem'
    }}>
      <div className="float-animation" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🦁⌨️</div>
      <h1 style={{ 
        fontFamily: 'var(--font-heading)', 
        color: '#1e40af', 
        fontSize: '3rem', 
        marginBottom: '3rem',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        Who is playing?
      </h1>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center',
        maxWidth: '1000px'
      }}>
        {users.map(user => (
          <button 
            key={user.id}
            onClick={() => handleSelect(user.id)}
            className="kids-card"
            style={{
              background: 'white',
              border: '4px solid #60a5fa',
              boxShadow: '0 8px 0px #3b82f6',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              width: '240px',
              cursor: 'pointer',
              transition: 'transform 0.1s',
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(8px)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              border: '2px solid #bfdbfe'
            }}>
              {user.avatar === 'penguin' ? '🐧' : '👦'}
            </div>
            
            <h2 style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: '1.8rem', 
              color: '#1d4ed8',
              margin: 0
            }}>
              {user.name}
            </h2>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              color: 'var(--text-muted)',
              fontSize: '1.1rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 'bold'
            }}>
              <span>Lvl {user.level}</span>
              <span>⭐ {user.points}</span>
            </div>
          </button>
        ))}

        <button 
          onClick={onCreateProfile}
          className="kids-card"
          style={{
            background: '#f8fafc',
            border: '4px dashed #94a3b8',
            boxShadow: 'none',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            width: '240px',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
        >
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b'
          }}>
            <Plus size={40} />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '1.5rem', 
            color: '#475569',
            margin: 0
          }}>
            New Profile
          </h2>
        </button>
      </div>
    </div>
  );
}
