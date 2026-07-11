import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Keyboard, Sparkles, Star, Settings, Swords, User } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TypingTutor from './components/TypingTutor';
import BalloonGame from './components/BalloonGame';
import FruitNinja from './components/FruitNinja';
import AdminPanel from './components/AdminPanel';
import ProfilePicker from './components/ProfilePicker';
import UserProfile from './components/UserProfile';
import { audio } from './utils/audio';

export default function App() {
  const [globalState, setGlobalState] = useState(null);
  const [localUserId, setLocalUserId] = useState(() => localStorage.getItem('localActiveUserId'));
  const [localKeyboardSound, setLocalKeyboardSound] = useState(() => localStorage.getItem('keyboardSound') || 'default');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Initialize sound on mount
  useEffect(() => {
    audio.setSoundProfile(localKeyboardSound);
  }, []);

  // Load progress from backend on mount
  useEffect(() => {
    fetch('/api/progress')
      .then(res => res.json())
      .then(data => {
        setGlobalState(data);
      })
      .catch(err => {
        console.error('Error fetching progress:', err);
      });
  }, []);

  // Save global state changes
  const updateGlobalState = (newFields) => {
    setGlobalState(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...newFields };
      
      // Post changes asynchronously
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(err => {
        console.error('Error saving global state:', err);
      });
      
      return updated;
    });
  };

  // Helper for components to only update the active user's progress
  const updateProgress = (newUserFields) => {
    setGlobalState(prev => {
      if (!prev || !localUserId) return prev;
      
      const userId = localUserId;
      const currentUser = prev.users[userId];
      const updatedUser = { ...currentUser, ...newUserFields };
      
      const updatedGlobal = {
        ...prev,
        users: {
          ...prev.users,
          [userId]: updatedUser
        }
      };

      // Post changes asynchronously
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGlobal)
      }).catch(err => console.error('Error saving progress:', err));

      return updatedGlobal;
    });
  };

  const handleTabChange = (tabId) => {
    audio.playClick();
    setActiveTab(tabId);
  };

  if (!globalState || !globalState.users) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', fontFamily: 'var(--font-heading)',
        color: 'var(--color-blue)', fontSize: '2rem'
      }}>
        <div className="float-animation" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🦁⌨️</div>
        Loading TypeSafari...
      </div>
    );
  }

  // Ensure selected local user actually exists in the db
  const isLocalUserValid = localUserId && globalState.users[localUserId];

  if (!isLocalUserValid) {
    return (
      <ProfilePicker 
        globalState={globalState} 
        onSelectProfile={(id) => {
          localStorage.setItem('localActiveUserId', id);
          setLocalUserId(id);
        }}
        onCreateProfile={() => {
          // If they want to create a new profile, we just route them to the admin panel
          // but we need them to bypass the picker first. So we can just set localUserId to a temp flag?
          // Actually, it's easier to just pick the first user and jump to admin tab, OR just have a minimal modal.
          // For now, we'll pick the first user (if exists) and jump to Admin.
          const firstUser = Object.values(globalState.users)[0];
          if (firstUser) {
            localStorage.setItem('localActiveUserId', firstUser.id);
            setLocalUserId(firstUser.id);
            setActiveTab('admin');
          }
        }}
      />
    );
  }

  const progress = globalState.users[localUserId];

  return (
    <div className="app-container">
      
      {/* Header Panel */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '4px solid #bfdbfe'
      }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => handleTabChange('dashboard')}>
          <span style={{ fontSize: '2.5rem' }}>🦁</span>
          <div>
            <h1 style={{ fontSize: '2.2rem', color: '#1e40af', lineHeight: '1.1' }}>TypeSafari</h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>Typing Adventure for Kids!</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`kids-button ${activeTab === 'dashboard' ? 'btn-yellow' : ''}`}
            style={{
              background: activeTab === 'dashboard' ? undefined : '#ffffff',
              color: activeTab === 'dashboard' ? undefined : '#854d0e',
              border: activeTab === 'dashboard' ? undefined : '3px solid #fef08a',
              boxShadow: activeTab === 'dashboard' ? undefined : '0 4px 0 #fef08a'
            }}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>

          <button
            onClick={() => handleTabChange('lessons')}
            className={`kids-button ${activeTab === 'lessons' ? 'btn-blue' : ''}`}
            style={{
              background: activeTab === 'lessons' ? undefined : '#ffffff',
              color: activeTab === 'lessons' ? undefined : '#1d4ed8',
              border: activeTab === 'lessons' ? undefined : '3px solid #bfdbfe',
              boxShadow: activeTab === 'lessons' ? undefined : '0 4px 0 #bfdbfe'
            }}
          >
            <Keyboard size={20} /> Learn & Type
          </button>

          <button
            onClick={() => handleTabChange('balloon-game')}
            className={`kids-button ${activeTab === 'balloon-game' ? 'btn-pink' : ''}`}
            style={{
              background: activeTab === 'balloon-game' ? undefined : '#ffffff',
              color: activeTab === 'balloon-game' ? undefined : '#be185d',
              border: activeTab === 'balloon-game' ? undefined : '3px solid #fbcfe8',
              boxShadow: activeTab === 'balloon-game' ? undefined : '0 4px 0 #fbcfe8'
            }}
          >
            <Sparkles size={20} /> Balloon Burst
          </button>

          <button
            onClick={() => handleTabChange('fruit-ninja')}
            className={`kids-button ${activeTab === 'fruit-ninja' ? 'btn-green' : ''}`}
            style={{
              background: activeTab === 'fruit-ninja' ? undefined : '#ffffff',
              color: activeTab === 'fruit-ninja' ? undefined : '#166534',
              border: activeTab === 'fruit-ninja' ? undefined : '3px solid #bbf7d0',
              boxShadow: activeTab === 'fruit-ninja' ? undefined : '0 4px 0 #bbf7d0'
            }}
          >
            <Swords size={20} /> Fruit Ninja
          </button>

          <button
            onClick={() => handleTabChange('profile')}
            className={`kids-button ${activeTab === 'profile' ? 'btn-blue' : ''}`}
            style={{
              background: activeTab === 'profile' ? undefined : '#ffffff',
              color: activeTab === 'profile' ? undefined : '#4f46e5',
              border: activeTab === 'profile' ? undefined : '3px solid #c7d2fe',
              boxShadow: activeTab === 'profile' ? undefined : '0 4px 0 #c7d2fe'
            }}
          >
            <User size={20} /> User Profile
          </button>

          <button
            onClick={() => handleTabChange('admin')}
            className={`kids-button ${activeTab === 'admin' ? 'btn-yellow' : ''}`}
            style={{
              background: activeTab === 'admin' ? undefined : '#ffffff',
              color: activeTab === 'admin' ? undefined : '#475569',
              border: activeTab === 'admin' ? undefined : '3px solid #cbd5e1',
              boxShadow: activeTab === 'admin' ? undefined : '0 4px 0 #cbd5e1',
              padding: '0.75rem', // Make it squarish
              borderRadius: '50%' // Make it a circle
            }}
            title="Admin Panel"
          >
            <Settings size={20} />
          </button>

        </nav>

        {/* Mini Stars Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'linear-gradient(135deg, #fef08a 0%, #ca8a04 100%)',
          color: 'white',
          fontFamily: 'var(--font-heading)',
          padding: '0.4rem 1rem',
          borderRadius: '16px',
          boxShadow: '0 4px 0 #a16207',
          border: '2px solid #fde047'
        }}>
          <Star size={18} fill="white" />
          <span>{progress.points} Stars</span>
        </div>

      </header>

      {/* Main Tab Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <Dashboard progress={progress} updateProgress={updateProgress} />
        )}
        {activeTab === 'lessons' && (
          <TypingTutor progress={progress} updateProgress={updateProgress} />
        )}
        {activeTab === 'balloon-game' && (
          <BalloonGame progress={progress} updateProgress={updateProgress} settings={globalState.settings} />
        )}
        {activeTab === 'fruit-ninja' && (
          <FruitNinja progress={progress} updateProgress={updateProgress} />
        )}
        {activeTab === 'profile' && (
          <UserProfile 
            user={progress} 
            localKeyboardSound={localKeyboardSound}
            setLocalKeyboardSound={setLocalKeyboardSound}
            onSwitchProfile={() => {
              localStorage.removeItem('localActiveUserId');
              setLocalUserId(null);
            }}
          />
        )}
        {activeTab === 'admin' && (
          <AdminPanel 
            globalState={globalState} 
            updateGlobalState={updateGlobalState} 
            localUserId={localUserId}
            onSwitchProfile={() => {
              localStorage.removeItem('localActiveUserId');
              setLocalUserId(null);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: '3rem',
        textAlign: 'center',
        padding: '1.5rem',
        borderTop: '3px dashed #cbd5e1',
        fontSize: '0.9rem',
        color: 'var(--text-muted)'
      }}>
        <p>🐾 Keep typing to explore more of the TypeSafari jungle! Built with 💖 for young typists.</p>
      </footer>

    </div>
  );
}
