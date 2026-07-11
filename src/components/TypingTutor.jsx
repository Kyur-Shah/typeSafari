import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, ChevronLeft, ArrowRight, Zap, Target } from 'lucide-react';
import { audio } from '../utils/audio';

const LESSONS = [
  {
    id: 1,
    title: 'Home Row Helpers',
    description: 'Learn the home row starting keys!',
    keys: ['f', 'j', 'd', 'k'],
    text: 'ff jj dd kk fj dk fd jk fdfd jkjk fjd kdf'
  },
  {
    id: 2,
    title: 'Home Row Extended',
    description: 'Add more home row keys (S, L, A, and semicolon)!',
    keys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    text: 'aa ss ll ;; as sd l; s; fd jk sl a; ds lk'
  },
  {
    id: 3,
    title: 'Top Row Ascent',
    description: 'Reach up to the top row keys!',
    keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    text: 'ru ei wo qp re ut ie ow pq ru e i w o q p'
  },
  {
    id: 4,
    title: 'Bottom Row Dive',
    description: 'Learn keys on the bottom row!',
    keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
    text: 'vm cx z, ./ vb mn cx z, zx cv bn m, zc vm'
  },
  {
    id: 5,
    title: 'Animal Kingdom',
    description: 'Type names of your favorite animal friends!',
    keys: ['a-z'],
    text: 'cat dog lion tiger panda koala zebra frog bear monkey rabbit fox'
  },
  {
    id: 6,
    title: 'Jungle Adventure Story',
    description: 'Type a fun short story about animal adventures!',
    keys: ['a-z', '.', ','],
    text: 'the friendly panda climbed the tall green tree. the clever little fox jumped over the sleepy brown bear. a happy green frog sang a song under the bright yellow sun.'
  }
];

// Key-to-Finger Mapping
const getKeyFinger = (key) => {
  if (!key) return { hand: null, finger: null };
  const k = key.toLowerCase();
  
  if (k === ' ') return { hand: 'both', finger: 'thumb' }; // Space
  
  const leftPinky = ['q', 'a', 'z', '1', '`'];
  const leftRing = ['w', 's', 'x', '2'];
  const leftMiddle = ['e', 'd', 'c', '3'];
  const leftIndex = ['r', 't', 'f', 'g', 'v', 'b', '4', '5'];
  
  if (leftPinky.includes(k)) return { hand: 'left', finger: 'pinky' };
  if (leftRing.includes(k)) return { hand: 'left', finger: 'ring' };
  if (leftMiddle.includes(k)) return { hand: 'left', finger: 'middle' };
  if (leftIndex.includes(k)) return { hand: 'left', finger: 'index' };
  
  const rightIndex = ['y', 'u', 'h', 'j', 'n', 'm', '6', '7'];
  const rightMiddle = ['i', 'k', ',', '8'];
  const rightRing = ['o', 'l', '.', '9'];
  const rightPinky = ['p', ';', '/', '-', '=', '0', '[', ']', "'", '\\'];
  
  if (rightIndex.includes(k)) return { hand: 'right', finger: 'index' };
  if (rightMiddle.includes(k)) return { hand: 'right', finger: 'middle' };
  if (rightRing.includes(k)) return { hand: 'right', finger: 'ring' };
  if (rightPinky.includes(k)) return { hand: 'right', finger: 'pinky' };
  
  return { hand: null, finger: null };
};

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
];

export default function TypingTutor({ progress, updateProgress }) {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [charsTyped, setCharsTyped] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [shake, setShake] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  
  // Real-time keyboard state to show keydowns visually
  const [pressedKey, setPressedKey] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    if (selectedLesson && containerRef.current) {
      containerRef.current.focus();
    }
  }, [selectedLesson]);

  // Handle typing inputs
  const handleKeyDown = (e) => {
    if (!selectedLesson || isCompleted) return;
    
    const key = e.key;

    // Prevent default browser scroll on Space
    if (key === ' ') {
      e.preventDefault();
    }

    // Ignore modifier keys like Shift, Control, Alt, Meta
    if (e.altKey || e.ctrlKey || e.metaKey || key.length > 1) {
      return;
    }

    setPressedKey(key.toLowerCase());

    // Start timer on first press
    if (startTime === null) {
      setStartTime(Date.now());
    }

    const targetChar = selectedLesson.text[inputIndex];
    
    // Check key correctness
    if (key === targetChar) {
      // Correct keypress
      audio.playClick();
      setCorrectCount(prev => prev + 1);
      setInputIndex(prev => prev + 1);
      
      // If we finished the lesson
      if (inputIndex + 1 >= selectedLesson.text.length) {
        handleLessonCompletion();
      }
    } else {
      // Incorrect keypress
      audio.playIncorrect();
      setErrorsCount(prev => prev + 1);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
    
    setCharsTyped(prev => prev + 1);
  };

  const handleKeyUp = () => {
    setPressedKey(null);
  };

  // Live Stats calculations
  useEffect(() => {
    if (startTime && !isCompleted && charsTyped > 0) {
      const minutes = (Date.now() - startTime) / 60000;
      // WPM = (correct words typed) / minutes. A word is standard 5 characters.
      const calculatedWpm = minutes > 0 ? (correctCount / 5) / minutes : 0;
      setWpm(calculatedWpm);

      const calculatedAcc = (correctCount / charsTyped) * 100;
      setAccuracy(calculatedAcc);
    }
  }, [charsTyped, correctCount, startTime, isCompleted]);

  const handleLessonCompletion = () => {
    setIsCompleted(true);
    audio.playCorrect();

    const endTime = Date.now();
    const minutes = (endTime - (startTime || endTime)) / 60000;
    const finalWpm = minutes > 0 ? Math.max((correctCount / 5) / minutes, 5) : 10;
    const finalAcc = charsTyped > 0 ? (correctCount / charsTyped) * 100 : 100;
    
    setWpm(finalWpm);
    setAccuracy(finalAcc);

    // Calculate points and updates
    const pointReward = 50;
    const newPoints = progress.points + pointReward;
    
    // Track new badges
    const newBadges = [...(progress.badges || [])];
    
    if (!newBadges.includes('first_step')) {
      newBadges.push('first_step');
    }

    const updatedCompletedLessons = [...(progress.completedLessons || [])];
    if (!updatedCompletedLessons.includes(selectedLesson.id)) {
      updatedCompletedLessons.push(selectedLesson.id);
    }

    if (updatedCompletedLessons.length >= 3 && !newBadges.includes('novice')) {
      newBadges.push('novice');
    }

    if (updatedCompletedLessons.length >= LESSONS.length && !newBadges.includes('key_master')) {
      newBadges.push('key_master');
    }

    if (finalWpm > 30 && !newBadges.includes('speed_demon')) {
      newBadges.push('speed_demon');
    }

    if (finalAcc === 100 && !newBadges.includes('perfectionist')) {
      newBadges.push('perfectionist');
    }

    // Save history and calculate aggregate averages
    const bestWpm = Math.max(progress.wpm || 0, finalWpm);
    const avgAcc = progress.accuracy 
      ? (progress.accuracy + finalAcc) / 2 
      : finalAcc;

    updateProgress({
      points: newPoints,
      completedLessons: updatedCompletedLessons,
      badges: newBadges,
      wpm: bestWpm,
      accuracy: avgAcc
    });
  };

  const startLesson = (lesson) => {
    audio.playClick();
    setSelectedLesson(lesson);
    setInputIndex(0);
    setStartTime(null);
    setCharsTyped(0);
    setErrorsCount(0);
    setCorrectCount(0);
    setShake(false);
    setIsCompleted(false);
    setWpm(0);
    setAccuracy(100);
  };

  const resetLesson = () => {
    if (selectedLesson) {
      startLesson(selectedLesson);
    }
  };

  const quitLesson = () => {
    audio.playClick();
    setSelectedLesson(null);
    setIsCompleted(false);
  };

  const targetChar = selectedLesson && selectedLesson.text[inputIndex];
  const { hand: targetHand, finger: targetFinger } = getKeyFinger(targetChar);

  // Color scheme mapping for color-coded pedagogy
  const getFingerColorTheme = (key) => {
    const { finger } = getKeyFinger(key);
    switch (finger) {
      case 'pinky':
        return { bg: '#ffe4e6', text: '#9f1239', border: '#fda4af' }; // rose/pink
      case 'ring':
        return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }; // blue
      case 'middle':
        return { bg: '#dcfce7', text: '#15803d', border: '#86efac' }; // green
      case 'index':
        return { bg: '#f3e8ff', text: '#6b21a8', border: '#c084fc' }; // purple
      case 'thumb':
        return { bg: '#fef08a', text: '#854d0e', border: '#facc15' }; // yellow
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' }; // fallback grey
    }
  };

  // Helper for rendering interactive hand
  const renderHandSVG = (handType) => {
    const isLeft = handType === 'left';
    const isActiveHand = targetHand === handType || targetHand === 'both';
    
    // Finger colors
    const fingerColors = {
      pinky: { base: '#fda4af', active: '#e11d48' },
      ring: { base: '#93c5fd', active: '#1d4ed8' },
      middle: { base: '#86efac', active: '#047857' },
      index: { base: '#c084fc', active: '#6d28d9' },
      thumb: { base: '#fde047', active: '#c2410c' }
    };

    const getFingerStyle = (fingerName) => {
      const isActiveFinger = isActiveHand && targetFinger === fingerName;
      const colorSet = fingerColors[fingerName];
      return {
        stroke: isActiveFinger ? colorSet.active : colorSet.base,
        strokeWidth: isActiveFinger ? 15 : 12,
        transition: 'all 0.15s'
      };
    };

    return (
      <svg width="150" height="160" viewBox="0 0 150 160" style={{ opacity: isActiveHand ? 1 : 0.45, transition: 'opacity 0.2s', overflow: 'visible' }}>
        {/* Shadow behind hand */}
        <path
          d={isLeft 
            ? "M 110,135 C 110,145 90,145 70,145 C 40,145 20,125 20,95 C 20,75 30,65 40,70 C 50,75 55,90 55,95"
            : "M 30,135 C 30,145 50,145 70,145 C 100,145 120,125 120,95 C 120,75 110,65 100,70 C 90,75 85,90 85,95"
          }
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ opacity: 0.3 }}
        />

        {/* Fingers - Underneath the palm */}
        {/* Pinky */}
        <path d={isLeft ? "M 25,95 L 25,45" : "M 125,95 L 125,45"} {...getFingerStyle('pinky')} strokeLinecap="round" />
        {/* Ring */}
        <path d={isLeft ? "M 45,95 L 45,25" : "M 105,95 L 105,25"} {...getFingerStyle('ring')} strokeLinecap="round" />
        {/* Middle */}
        <path d={isLeft ? "M 65,95 L 65,15" : "M 85,95 L 85,15"} {...getFingerStyle('middle')} strokeLinecap="round" />
        {/* Index */}
        <path d={isLeft ? "M 85,95 L 85,25" : "M 65,95 L 65,25"} {...getFingerStyle('index')} strokeLinecap="round" />
        {/* Thumb */}
        <path d={isLeft ? "M 105,115 L 130,85" : "M 45,115 L 20,85"} {...getFingerStyle('thumb')} strokeLinecap="round" />

        {/* Palm base */}
        <path
          d={isLeft 
            ? "M 110,130 C 110,140 90,140 70,140 C 40,140 20,120 20,90 C 20,70 30,60 40,65 C 50,70 55,85 55,90"
            : "M 40,130 C 40,140 60,140 80,140 C 110,140 130,120 130,90 C 130,70 120,60 110,65 C 100,70 95,85 95,90"
          }
          fill="#ffedd5" // Soft peach cream color
          stroke="#ea580c"
          strokeWidth="3.5"
        />

        {/* Cute Face on Palm! */}
        {isLeft ? (
          <>
            <circle cx="50" cy="95" r="3.5" fill="#7c2d12" />
            <circle cx="68" cy="95" r="3.5" fill="#7c2d12" />
            <circle cx="43" cy="99" r="4.5" fill="#fda4af" />
            <circle cx="75" cy="99" r="4.5" fill="#fda4af" />
            <path d="M 54,103 Q 59,109 64,103" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <circle cx="82" cy="95" r="3.5" fill="#7c2d12" />
            <circle cx="100" cy="95" r="3.5" fill="#7c2d12" />
            <circle cx="75" cy="99" r="4.5" fill="#fda4af" />
            <circle cx="107" cy="99" r="4.5" fill="#fda4af" />
            <path d="M 86,103 Q 91,109 96,103" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* Glowing / Bouncing Star above Active Finger */}
        {isActiveHand && (
          <>
            {targetFinger === 'pinky' && (
              <>
                <circle cx={isLeft ? 25 : 125} cy="45" r="14" fill="none" stroke="#e11d48" strokeWidth="3" strokeDasharray="4 4" className="float-animation" />
                <text x={isLeft ? 25 : 125} y="22" fontSize="20" textAnchor="middle" className="float-animation">⭐</text>
              </>
            )}
            {targetFinger === 'ring' && (
              <>
                <circle cx={isLeft ? 45 : 105} cy="25" r="14" fill="none" stroke="#1d4ed8" strokeWidth="3" strokeDasharray="4 4" className="float-animation" />
                <text x={isLeft ? 45 : 105} y="4" fontSize="20" textAnchor="middle" className="float-animation">⭐</text>
              </>
            )}
            {targetFinger === 'middle' && (
              <>
                <circle cx={isLeft ? 65 : 85} cy="15" r="14" fill="none" stroke="#047857" strokeWidth="3" strokeDasharray="4 4" className="float-animation" />
                <text x={isLeft ? 65 : 85} y="-6" fontSize="20" textAnchor="middle" className="float-animation">⭐</text>
              </>
            )}
            {targetFinger === 'index' && (
              <>
                <circle cx={isLeft ? 85 : 65} cy="25" r="14" fill="none" stroke="#6d28d9" strokeWidth="3" strokeDasharray="4 4" className="float-animation" />
                <text x={isLeft ? 85 : 65} y="4" fontSize="20" textAnchor="middle" className="float-animation">⭐</text>
              </>
            )}
            {targetFinger === 'thumb' && (
              <>
                <circle cx={isLeft ? 130 : 20} cy="85" r="14" fill="none" stroke="#c2410c" strokeWidth="3" strokeDasharray="4 4" className="float-animation" />
                <text x={isLeft ? 130 : 20} y="64" fontSize="20" textAnchor="middle" className="float-animation">⭐</text>
              </>
            )}
          </>
        )}
      </svg>
    );
  };

  return (
    <div>
      {!selectedLesson ? (
        // Lesson Selection Panel
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <h2 style={{ fontSize: '2.2rem', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              🎯 Choose Your Typing Lesson!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Complete lessons to earn stars and level up your mascot!</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {LESSONS.map((lesson) => {
              const isCompleted = progress.completedLessons?.includes(lesson.id);
              return (
                <div
                  key={lesson.id}
                  className="kids-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderColor: isCompleted ? '#86efac' : '#dbeafe',
                    boxShadow: isCompleted ? '0 8px 0px #4ade80' : '0 8px 0px #bfdbfe',
                    background: isCompleted ? '#f0fdf4' : '#ffffff',
                    gap: '1.5rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.85rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '8px'
                      }}>
                        Lesson {lesson.id}
                      </span>
                      {isCompleted && (
                        <span style={{
                          background: '#dcfce7',
                          color: '#15803d',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.8rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '8px'
                        }}>
                          Done! 💚
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.35rem', color: '#1e3a8a', marginBottom: '0.5rem' }}>{lesson.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{lesson.description}</p>
                    
                    {/* Keys list */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                      {lesson.keys.map((k, idx) => (
                        <span key={idx} style={{
                          background: '#f1f5f9',
                          border: '2px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '0.1rem 0.4rem',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-heading)',
                          textTransform: 'uppercase'
                        }}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    className="kids-button btn-blue"
                    onClick={() => startLesson(lesson)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Start Training <ArrowRight size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Active Tutor Mode
        <div
          ref={containerRef}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          tabIndex={0}
          style={{
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          {/* Top Panel Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button className="kids-button btn-pink" onClick={quitLesson} style={{ boxShadow: '0 6px 0 #9d174d' }}>
              <ChevronLeft size={20} /> Back to Lessons
            </button>
            <h3 style={{ fontSize: '1.5rem', color: '#1e40af' }}>{selectedLesson.title}</h3>
            <button className="kids-button btn-purple" onClick={resetLesson} style={{ boxShadow: '0 6px 0 #5b21b6' }}>
              <RefreshCw size={20} /> Reset
            </button>
          </div>

          {!isCompleted ? (
            <>
              {/* Typing area box */}
              <div
                className={`kids-card ${shake ? 'shake-animation' : ''}`}
                style={{
                  borderColor: '#bfdbfe',
                  boxShadow: '0 8px 0px #3b82f6',
                  textAlign: 'center',
                  padding: '2.5rem 1.5rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Stats Bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  marginBottom: '2rem',
                  borderBottom: '3px dashed #e2e8f0',
                  paddingBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Zap size={20} color="#3b82f6" />
                    <span style={{ fontWeight: 'bold' }}>Speed: </span>
                    <span style={{ fontFamily: 'var(--font-heading)', color: '#2563eb', fontSize: '1.25rem' }}>
                      {Math.round(wpm)} WPM
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Target size={20} color="#10b981" />
                    <span style={{ fontWeight: 'bold' }}>Accuracy: </span>
                    <span style={{ fontFamily: 'var(--font-heading)', color: '#059669', fontSize: '1.25rem' }}>
                      {Math.round(accuracy)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={20} color="#f59e0b" />
                    <span style={{ fontWeight: 'bold' }}>Keys: </span>
                    <span style={{ fontFamily: 'var(--font-heading)', color: '#d97706', fontSize: '1.25rem' }}>
                      {inputIndex} / {selectedLesson.text.length}
                    </span>
                  </div>
                </div>

                {/* Main Typing text */}
                <div style={{
                  fontSize: '2rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.15em',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.8',
                  color: 'var(--text-muted)'
                }}>
                  {selectedLesson.text.split('').map((char, index) => {
                    let charColor = '#94a3b8'; // default grey
                    let charBg = 'transparent';
                    let underline = 'none';

                    if (index < inputIndex) {
                      charColor = '#10b981'; // completed correct
                    } else if (index === inputIndex) {
                      charColor = '#3b82f6'; // current target
                      charBg = '#dbeafe';
                      underline = '4px solid #3b82f6';
                    }

                    return (
                      <span
                        key={index}
                        style={{
                          color: charColor,
                          backgroundColor: charBg,
                          borderBottom: underline,
                          borderRadius: '4px',
                          padding: '0 0.1em',
                          transition: 'all 0.15s'
                        }}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>

                <p style={{ marginTop: '2rem', color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  💡 Click inside this card and start typing to begin the lesson!
                </p>
              </div>

              {/* Hands & Keyboard Guides */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '1.5rem',
                alignItems: 'center',
                justifyItems: 'center',
                flexWrap: 'wrap'
              }}>
                {/* Left Hand */}
                <div>
                  {renderHandSVG('left')}
                  <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>Left Hand</p>
                </div>

                {/* Keyboard Visualizer */}
                <div className="kids-card" style={{
                  padding: '1.25rem',
                  borderColor: '#e2e8f0',
                  boxShadow: '0 6px 0px #cbd5e1',
                  background: '#f8fafc',
                  maxWidth: '560px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {KEYBOARD_ROWS.map((row, rowIdx) => (
                      <div key={rowIdx} style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        {row.map((k) => {
                          const isTarget = targetChar && targetChar.toLowerCase() === k;
                          const isCurrentlyPressed = pressedKey === k;
                          
                          let keyBg = '#ffffff';
                          let keyColor = 'var(--text-main)';
                          let keyBorder = '2px solid #cbd5e1';
                          let keyShadow = '0 2px 0 #cbd5e1';

                          if (isTarget) {
                            const theme = getFingerColorTheme(k);
                            keyBg = theme.bg;
                            keyColor = theme.text;
                            keyBorder = `3px solid ${theme.border}`;
                            keyShadow = `0 3px 0 ${theme.border}`;
                          } else if (isCurrentlyPressed) {
                            keyBg = '#f1f5f9';
                            keyColor = 'var(--text-muted)';
                            keyBorder = '3px solid #64748b';
                            keyShadow = 'none';
                          }

                          return (
                            <div
                              key={k}
                              style={{
                                width: '40px',
                                height: '40px',
                                background: keyBg,
                                color: keyColor,
                                border: keyBorder,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'var(--font-heading)',
                                textTransform: 'uppercase',
                                fontSize: '1.1rem',
                                boxShadow: keyShadow,
                                transform: isCurrentlyPressed ? 'translateY(2px)' : 'none',
                                transition: 'all 0.05s'
                              }}
                            >
                              {k}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    
                    {/* Space Bar Row */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.2rem' }}>
                      <div
                        style={{
                          width: '280px',
                          height: '38px',
                          background: targetChar === ' ' ? '#fef08a' : pressedKey === ' ' ? '#f1f5f9' : '#ffffff',
                          color: targetChar === ' ' ? '#854d0e' : 'var(--text-muted)',
                          border: targetChar === ' ' ? '3px solid #facc15' : pressedKey === ' ' ? '3px solid #64748b' : '2px solid #cbd5e1',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.85rem',
                          boxShadow: targetChar === ' ' ? '0 3px 0 #facc15' : pressedKey === ' ' ? 'none' : '0 2px 0 #cbd5e1',
                          transform: pressedKey === ' ' ? 'translateY(2px)' : 'none',
                          transition: 'all 0.05s'
                        }}
                      >
                        Space
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Hand */}
                <div>
                  {renderHandSVG('right')}
                  <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>Right Hand</p>
                </div>
              </div>
            </>
          ) : (
            // Completion Overlay Card
            <div className="kids-card float-animation" style={{
              borderColor: '#86efac',
              boxShadow: '0 10px 0px #4ade80',
              textAlign: 'center',
              padding: '3rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              maxWidth: '600px',
              margin: '2rem auto'
            }}>
              <div style={{ fontSize: '5rem' }}>🎉🏆🎉</div>
              <h2 style={{ fontSize: '2.5rem', color: '#16a34a' }}>Splendid Work!</h2>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                You completed <strong>{selectedLesson.title}</strong> and earned stars!
              </p>

              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '1.5rem',
                width: '100%',
                margin: '1rem 0'
              }}>
                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '16px', border: '2px solid #bbf7d0' }}>
                  <h4 style={{ color: '#166534', fontSize: '0.9rem' }}>Stars</h4>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#16a34a' }}>+50 ⭐</p>
                </div>
                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '16px', border: '2px solid #bfdbfe' }}>
                  <h4 style={{ color: '#1e40af', fontSize: '0.9rem' }}>Speed</h4>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#2563eb' }}>{Math.round(wpm)} WPM</p>
                </div>
                <div style={{ background: '#fff1f2', padding: '1rem', borderRadius: '16px', border: '2px solid #fecdd3' }}>
                  <h4 style={{ color: '#9f1239', fontSize: '0.9rem' }}>Accuracy</h4>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#e11d48' }}>{Math.round(accuracy)}%</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="kids-button btn-blue" onClick={quitLesson}>
                  Back to Lessons
                </button>
                <button className="kids-button btn-green" onClick={resetLesson}>
                  <RefreshCw size={18} /> Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
