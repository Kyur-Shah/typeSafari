import React, { useState } from 'react';
import { Trophy, Star, Zap, Target, Edit2, Check } from 'lucide-react';
import { audio } from '../utils/audio';

const AVATARS = [
  { id: 'penguin', emoji: '🐧', name: 'Penny Penguin', color: '#e0f2fe' },
  { id: 'panda', emoji: '🐼', name: 'Peter Panda', color: '#f3f4f6' },
  { id: 'lion', emoji: '🦁', name: 'Leo Lion', color: '#fef3c7' },
  { id: 'koala', emoji: '🐨', name: 'Koko Koala', color: '#e5e7eb' },
  { id: 'monkey', emoji: '🐵', name: 'Momo Monkey', color: '#ffedd5' },
  { id: 'frog', emoji: '🐸', name: 'Fiona Frog', color: '#dcfce7' },
  { id: 'fox', emoji: '🦊', name: 'Felix Fox', color: '#ffede9' },
  { id: 'unicorn', emoji: '🦄', name: 'Una Unicorn', color: '#f3e8ff' }
];

const BADGES = [
  { id: 'first_step', name: 'First Step', desc: 'Complete your first lesson!', emoji: '🌱', color: 'from-green-400 to-emerald-500' },
  { id: 'novice', name: 'Typing Novice', desc: 'Complete 3 lessons!', emoji: '⭐', color: 'from-blue-400 to-indigo-500' },
  { id: 'key_master', name: 'Key Master', desc: 'Complete all 5 lessons!', emoji: '👑', color: 'from-purple-500 to-pink-500' },
  { id: 'pop_star', name: 'Pop Star', desc: 'Get 200 points in Balloon Burst!', emoji: '🎈', color: 'from-pink-400 to-rose-500' },
  { id: 'super_popper', name: 'Super Popper', desc: 'Get 500 points in Balloon Burst!', emoji: '💥', color: 'from-orange-400 to-red-500' },
  { id: 'speed_demon', name: 'Speed Demon', desc: 'Reach over 30 WPM in a lesson!', emoji: '⚡', color: 'from-amber-400 to-orange-500' },
  { id: 'perfectionist', name: 'Perfectionist', desc: 'Get 100% accuracy in a lesson!', emoji: '🎯', color: 'from-teal-400 to-green-500' }
];

export default function Dashboard({ progress, updateProgress }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(progress.name || 'Little Typist');

  const selectedAvatar = AVATARS.find(a => a.id === progress.avatar) || AVATARS[0];

  // Level formula: Level = floor(points / 200) + 1
  const calculatedLevel = Math.floor(progress.points / 200) + 1;
  const pointsInCurrentLevel = progress.points % 200;
  const pointsNeededForNextLevel = 200;
  const levelProgressPercentage = Math.min((pointsInCurrentLevel / pointsNeededForNextLevel) * 100, 100);

  // Auto update level in state/file if it changes
  React.useEffect(() => {
    if (calculatedLevel !== progress.level) {
      updateProgress({ level: calculatedLevel });
      audio.playLevelUp();
    }
  }, [calculatedLevel, progress.level, updateProgress]);

  const handleSaveName = () => {
    audio.playClick();
    updateProgress({ name: tempName });
    setIsEditingName(false);
  };

  const handleSelectAvatar = (avatarId) => {
    audio.playClick();
    updateProgress({ avatar: avatarId });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Profile & Level Card */}
      <div className="kids-card" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #ffffff 0%, #f4f9ff 100%)',
        borderColor: '#bfdbfe',
        boxShadow: '0 8px 0px #93c5fd'
      }}>
        
        {/* Profile Avatar Display */}
        <div style={{
          fontSize: '5rem',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          backgroundColor: selectedAvatar.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '4px solid #93c5fd',
          boxShadow: '0 6px 0 rgba(147, 197, 253, 0.4)'
        }} className="float-animation">
          {selectedAvatar.emoji}
        </div>

        {/* Level and Nickname details */}
        <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isEditingName ? (
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value.slice(0, 18))}
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.5rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    border: '3px solid #93c5fd',
                    color: 'var(--text-main)',
                    outline: 'none',
                    width: '70%'
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                />
                <button
                  className="kids-button btn-green"
                  onClick={handleSaveName}
                  style={{ padding: '0.5rem', borderRadius: '12px', boxShadow: '0 4px 0 #047857' }}
                >
                  <Check size={20} />
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '2rem', color: '#1e40af' }}>{progress.name || 'Little Typist'}</h2>
                <button
                  onClick={() => { audio.playClick(); setIsEditingName(true); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <Edit2 size={18} />
                </button>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              background: '#dbeafe',
              color: '#1e40af',
              fontFamily: 'var(--font-heading)',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.9rem'
            }}>
              Mascot: {selectedAvatar.name}
            </span>
          </div>

          {/* Level Progress Slider */}
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontWeight: 'bold' }}>
              <span style={{ color: '#1e3a8a' }}>Level {progress.level}</span>
              <span style={{ color: '#5c6f84' }}>{pointsInCurrentLevel} / {pointsNeededForNextLevel} Stars to Level {progress.level + 1}</span>
            </div>
            <div style={{ width: '100%', height: '24px', background: '#e2e8f0', borderRadius: '12px', overflow: 'hidden', border: '3px solid #cbd5e1' }}>
              <div style={{
                width: `${levelProgressPercentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                borderRadius: '8px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>

      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem'
      }}>
        
        {/* Stars/Points */}
        <div className="kids-card" style={{
          borderColor: '#fde047',
          boxShadow: '0 8px 0px #facc15',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: '#fefce8'
        }}>
          <div style={{ background: '#fef08a', padding: '1rem', borderRadius: '20px', color: '#a16207' }}>
            <Star size={36} fill="#ca8a04" />
          </div>
          <div>
            <h4 style={{ color: '#854d0e', fontSize: '1rem', textTransform: 'uppercase' }}>Stars Earned</h4>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#ca8a04' }}>{progress.points}</p>
          </div>
        </div>

        {/* Speed WPM */}
        <div className="kids-card" style={{
          borderColor: '#93c5fd',
          boxShadow: '0 8px 0px #60a5fa',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: '#eff6ff'
        }}>
          <div style={{ background: '#dbeafe', padding: '1rem', borderRadius: '20px', color: '#1d4ed8' }}>
            <Zap size={36} fill="#3b82f6" />
          </div>
          <div>
            <h4 style={{ color: '#1e40af', fontSize: '1rem', textTransform: 'uppercase' }}>Top Speed</h4>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#1d4ed8' }}>{Math.round(progress.wpm || 0)} <span style={{ fontSize: '1rem' }}>WPM</span></p>
          </div>
        </div>

        {/* Accuracy */}
        <div className="kids-card" style={{
          borderColor: '#a7f3d0',
          boxShadow: '0 8px 0px #34d399',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: '#f0fdf4'
        }}>
          <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '20px', color: '#047857' }}>
            <Target size={36} />
          </div>
          <div>
            <h4 style={{ color: '#065f46', fontSize: '1rem', textTransform: 'uppercase' }}>Avg Accuracy</h4>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#047857' }}>{Math.round(progress.accuracy || 100)}%</p>
          </div>
        </div>

      </div>

      {/* Avatar / Mascot Selection Grid */}
      <div className="kids-card" style={{ borderColor: '#e9d5ff', boxShadow: '0 8px 0px #d8b4fe' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#6b21a8', textAlign: 'center' }}>Choose Your Adventure Mascot!</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {AVATARS.map(avatar => {
            const isSelected = progress.avatar === avatar.id;
            return (
              <button
                key={avatar.id}
                onClick={() => handleSelectAvatar(avatar.id)}
                style={{
                  background: avatar.color,
                  border: isSelected ? '4px solid #8b5cf6' : '3px solid #e5e7eb',
                  borderRadius: '20px',
                  padding: '1rem 0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transform: isSelected ? 'scale(1.05)' : 'none',
                  boxShadow: isSelected ? '0 6px 0 #7c3aed' : '0 4px 0 #d1d5db',
                  transition: 'all 0.15s ease'
                }}
                className="wiggle-hover"
              >
                <span style={{ fontSize: '2.5rem' }}>{avatar.emoji}</span>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.85rem',
                  color: isSelected ? '#5b21b6' : 'var(--text-main)'
                }}>
                  {avatar.name.split(' ')[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Badges Grid */}
      <div className="kids-card" style={{ borderColor: '#fbcfe8', boxShadow: '0 8px 0px #f9a8d4' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#9d174d', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <Trophy size={28} /> Kid Achievements & Badges
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          {BADGES.map(badge => {
            const isUnlocked = progress.badges?.includes(badge.id);
            return (
              <div
                key={badge.id}
                style={{
                  background: isUnlocked ? 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)' : '#f9fafb',
                  border: isUnlocked ? '3px solid #fda4af' : '3px dashed #e5e7eb',
                  borderRadius: '20px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: isUnlocked ? '0 6px 0 #fecdd3' : 'none',
                  opacity: isUnlocked ? 1 : 0.55,
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: isUnlocked ? '#ffe4e6' : '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  border: isUnlocked ? '2px solid #fda4af' : '2px solid #e5e7eb'
                }}>
                  {badge.emoji}
                </div>
                <h4 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.1rem',
                  color: isUnlocked ? '#be123c' : 'var(--text-muted)',
                  marginBottom: '0.25rem'
                }}>
                  {badge.name}
                </h4>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}>
                  {badge.desc}
                </p>
                {isUnlocked && (
                  <span style={{
                    marginTop: '0.5rem',
                    fontSize: '0.7rem',
                    background: '#fda4af',
                    color: '#9f1239',
                    fontFamily: 'var(--font-heading)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '8px'
                  }}>
                    UNLOCKED! 🎉
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
