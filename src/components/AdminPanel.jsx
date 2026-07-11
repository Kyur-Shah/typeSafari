import React, { useState } from 'react';
import { User, UserPlus, Settings, Trash2, RotateCcw, Volume2, Terminal } from 'lucide-react';
import { audio } from '../utils/audio';

export default function AdminPanel({ globalState, updateGlobalState }) {
  const [newUserName, setNewUserName] = useState('');

  if (!globalState || !globalState.users) return null;

  const usersList = Object.values(globalState.users);

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const newId = `user_${Date.now()}`;
    const newUser = {
      id: newId,
      name: newUserName.trim(),
      level: 1,
      points: 0,
      accuracy: 100,
      wpm: 0,
      completedLessons: [],
      badges: [],
      avatar: 'penguin',
      highScore: 0
    };

    updateGlobalState({
      users: { ...globalState.users, [newId]: newUser },
      activeUserId: newId // auto-switch to new user
    });
    setNewUserName('');
    audio.playLevelUp();
  };

  const handleSwitchUser = (userId) => {
    updateGlobalState({ activeUserId: userId });
    audio.playClick();
  };

  const handleDeleteUser = (userId) => {
    if (usersList.length <= 1) {
      alert("You cannot delete the last remaining user!");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this profile? This cannot be undone.")) {
      const newUsers = { ...globalState.users };
      delete newUsers[userId];
      
      let newActiveId = globalState.activeUserId;
      if (globalState.activeUserId === userId) {
        newActiveId = Object.keys(newUsers)[0];
      }

      updateGlobalState({
        users: newUsers,
        activeUserId: newActiveId
      });
      audio.playIncorrect();
    }
  };

  const handleResetCounters = (userId) => {
    if (window.confirm("Are you sure you want to reset this profile's progress to zero?")) {
      const userToReset = globalState.users[userId];
      const resetUser = {
        ...userToReset,
        level: 1,
        points: 0,
        accuracy: 100,
        wpm: 0,
        completedLessons: [],
        badges: [],
        highScore: 0
      };

      updateGlobalState({
        users: { ...globalState.users, [userId]: resetUser }
      });
      audio.playPop();
    }
  };

  const handleSoundChange = (e) => {
    const newSound = e.target.value;
    updateGlobalState({
      settings: {
        ...globalState.settings,
        keyboardSound: newSound
      }
    });
    // Immediately play sample sound
    setTimeout(() => {
      audio.setSoundProfile(newSound);
      audio.playClick();
    }, 50);
  };

  const handleDiagnosticsToggle = (e) => {
    updateGlobalState({
      settings: {
        ...globalState.settings,
        showDiagnostics: e.target.checked
      }
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Settings Section */}
      <div className="kids-card" style={{ borderColor: '#d8b4fe', boxShadow: '0 8px 0px #c084fc' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#7e22ce', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Settings size={28} /> Game Settings
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#faf5ff', borderRadius: '16px', border: '2px solid #e9d5ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Volume2 color="#9333ea" />
            <span style={{ fontSize: '1.1rem', color: '#6b21a8', fontWeight: 'bold' }}>Keyboard Key Press Sound</span>
          </div>
          
          <select 
            className="kids-input" 
            style={{ width: 'auto', minWidth: '200px', cursor: 'pointer' }}
            value={globalState.settings?.keyboardSound || 'default'}
            onChange={handleSoundChange}
          >
            <option value="default">Standard Soft Click</option>
            <option value="mechanical">Mechanical Switch</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#faf5ff', borderRadius: '16px', border: '2px solid #e9d5ff', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Terminal color="#9333ea" />
            <span style={{ fontSize: '1.1rem', color: '#6b21a8', fontWeight: 'bold' }}>Balloon Game Diagnostic Panel</span>
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={globalState.settings?.showDiagnostics || false} 
              onChange={handleDiagnosticsToggle}
              style={{ width: '24px', height: '24px', cursor: 'pointer', accentColor: '#9333ea' }}
            />
          </label>
        </div>
      </div>

      {/* Users Section */}
      <div className="kids-card" style={{ borderColor: '#60a5fa', boxShadow: '0 8px 0px #3b82f6' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <User size={28} /> Manage Profiles
        </h2>
        
        {/* User List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {usersList.map(user => {
            const isActive = user.id === globalState.activeUserId;
            return (
              <div key={user.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
                background: isActive ? '#eff6ff' : '#f8fafc',
                borderRadius: '16px',
                border: isActive ? '3px solid #60a5fa' : '2px solid #e2e8f0',
                transition: 'all 0.2s'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: isActive ? '#1d4ed8' : '#334155', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {user.name} {isActive && <span style={{ fontSize: '0.9rem', padding: '0.2rem 0.6rem', background: '#3b82f6', color: 'white', borderRadius: '12px' }}>Active</span>}
                  </h3>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Level {user.level} • {user.points} Stars
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!isActive && (
                    <button className="kids-button btn-blue" onClick={() => handleSwitchUser(user.id)} style={{ padding: '0.5rem 1rem' }}>
                      Play
                    </button>
                  )}
                  <button className="kids-button btn-yellow" onClick={() => handleResetCounters(user.id)} title="Reset Progress" style={{ padding: '0.5rem 1rem' }}>
                    <RotateCcw size={18} />
                  </button>
                  <button className="kids-button btn-pink" onClick={() => handleDeleteUser(user.id)} title="Delete User" style={{ padding: '0.5rem 1rem' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add User Form */}
        <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '16px', border: '3px dashed #86efac' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#166534', margin: '0 0 1rem 0' }}>Add New Player</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              className="kids-input"
              placeholder="Enter kid's name..."
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              maxLength={20}
              style={{ flex: 1 }}
            />
            <button type="submit" className="kids-button btn-green">
              <UserPlus size={20} /> Add
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
