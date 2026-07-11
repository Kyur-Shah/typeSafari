import React from 'react';
import { User, Volume2, LogOut } from 'lucide-react';
import { audio } from '../utils/audio';

export default function UserProfile({ 
  user, 
  localKeyboardSound, 
  setLocalKeyboardSound, 
  onSwitchProfile 
}) {

  const handleSoundChange = (e) => {
    const newSound = e.target.value;
    localStorage.setItem('keyboardSound', newSound);
    setLocalKeyboardSound(newSound);
    
    // Immediately apply and play sample sound
    setTimeout(() => {
      audio.setSoundProfile(newSound);
      audio.playClick();
    }, 50);
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Profile Header */}
      <div className="kids-card" style={{ borderColor: '#60a5fa', boxShadow: '0 8px 0px #3b82f6', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
        <div>
          <h2 style={{ fontSize: '2rem', color: '#1d4ed8', margin: 0 }}>
            {user.name}
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Level {user.level} • {user.points} Stars
          </p>
        </div>
      </div>

      {/* Settings Section */}
      <div className="kids-card" style={{ borderColor: '#d8b4fe', boxShadow: '0 8px 0px #c084fc' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#7e22ce', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Volume2 size={28} /> Sound Settings
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#faf5ff', borderRadius: '16px', border: '2px solid #e9d5ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.1rem', color: '#6b21a8', fontWeight: 'bold' }}>Keyboard Key Press Sound</span>
          </div>
          
          <select 
            className="kids-input" 
            style={{ width: 'auto', minWidth: '200px', cursor: 'pointer' }}
            value={localKeyboardSound}
            onChange={handleSoundChange}
          >
            <option value="default">Standard Soft Click</option>
            <option value="mechanical">Mechanical Switch</option>
          </select>
        </div>
      </div>

      {/* Account Actions */}
      <div className="kids-card" style={{ borderColor: '#f87171', boxShadow: '0 8px 0px #ef4444' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <User size={28} /> Account Actions
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="kids-button btn-blue" 
            onClick={onSwitchProfile} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '1.2rem' }}
          >
            <LogOut size={20} /> Switch Profile
          </button>
        </div>
      </div>

    </div>
  );
}
