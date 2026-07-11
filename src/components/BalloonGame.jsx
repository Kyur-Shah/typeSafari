import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Award, Star, Info } from 'lucide-react';
import { audio } from '../utils/audio';

const BALLOON_COLORS = [
  '#f43f5e', // rose/pink
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#f97316'  // orange
];

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

export default function BalloonGame({ progress, updateProgress, settings }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [highScore, setHighScore] = useState(progress.highScore || 0);
  const [lastKeyPressed, setLastKeyPressed] = useState(null);
  const [lastKeyWasCorrect, setLastKeyWasCorrect] = useState(true);
  const [debugLogs, setDebugLogs] = useState([]);
  
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const addLogRef = useRef(null);

  const addLog = (message, type) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setDebugLogs(prev => [
      { id: Date.now() + Math.random(), time, message, type },
      ...prev.slice(0, 4) // keep last 5 logs
    ]);
  };

  useEffect(() => {
    addLogRef.current = addLog;
  }, []);
  
  // Keep game values in refs to avoid closure stale state in animation loop
  const stateRef = useRef({
    balloons: [],
    particles: [],
    score: 0,
    missed: 0,
    speedMultiplier: 1.0,
    spawnTimer: 0,
    spawnInterval: 120, // frames between spawns
    keysTyped: 0,
    balloonsSpawned: 0
  });

  // Sync react state to refs
  useEffect(() => {
    stateRef.current.score = score;
    stateRef.current.missed = missedCount;
  }, [score, missedCount]);

  // Start/Stop Game
  const startGame = () => {
    audio.playClick();
    audio.startMusic();
    setIsPlaying(true);
    setIsGameOver(false);
    setIsVictory(false);
    setScore(0);
    setMissedCount(0);
    setLastKeyPressed(null);
    setLastKeyWasCorrect(true);
    setDebugLogs([]);
    addLog('Game started! Get ready to pop! 🎈', 'info');
    
    stateRef.current = {
      balloons: [],
      particles: [],
      score: 0,
      missed: 0,
      speedMultiplier: 1.0,
      spawnTimer: 0,
      spawnInterval: 100,
      keysTyped: 0,
      balloonsSpawned: 0
    };

    // Add initial balloon
    spawnBalloon();
  };

  const pauseGame = () => {
    audio.playClick();
    audio.stopMusic();
    setIsPlaying(false);
  };

  const spawnBalloon = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use CSS client dimensions instead of high-DPI canvas.width to prevent spawning off-screen on Retina macs!
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;

    const isJuniorMode = progress.level <= 5;
    if (isJuniorMode && stateRef.current.balloonsSpawned >= 20) {
      return; // Do not spawn more than 20 balloons in Junior Mode
    }

    // Pick random letter, color
    const letter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    
    // Choose x position avoiding edges
    const radius = 42;
    const x = radius + Math.random() * (width - radius * 2);
    
    // Speed increases slightly as score goes up
    const baseSpeed = 1.0 + (stateRef.current.score / 200) * 0.5;
    const finalSpeed = Math.min(baseSpeed * (0.8 + Math.random() * 0.4), 4.5);

    stateRef.current.balloons.push({
      x,
      y: height + radius + 10,
      letter,
      color,
      radius,
      speed: finalSpeed,
      wiggle: Math.random() * 100,
      wiggleSpeed: 0.02 + Math.random() * 0.02
    });

    stateRef.current.balloonsSpawned += 1;
  };

  const createExplosion = (x, y, color) => {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: 3 + Math.random() * 4,
        alpha: 1,
        life: 30 + Math.floor(Math.random() * 20)
      });
    }
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying || isGameOver || isVictory) return;
      
      if (e.repeat) return; // ignore hold-down auto-repeats
      
      const key = e.key.toLowerCase();
      if (!ALPHABET.includes(key)) return; // only allow a-z letters

      const state = stateRef.current;
      state.keysTyped += 1;
      const isJuniorMode = progress.level <= 5;

      // Find lowest balloon matching this letter
      let matchIdx = -1;
      let lowestY = -9999;

      for (let i = 0; i < state.balloons.length; i++) {
        const balloon = state.balloons[i];
        if (balloon.letter === key && balloon.y > lowestY) {
          lowestY = balloon.y;
          matchIdx = i;
        }
      }

      if (matchIdx !== -1) {
        // Burst the balloon!
        const b = state.balloons[matchIdx];
        audio.playPop();
        createExplosion(b.x, b.y, b.color);
        
        // Remove from list
        state.balloons.splice(matchIdx, 1);
        
        // Update Score
        const newScore = state.score + 10;
        setScore(newScore);

        setLastKeyPressed(key.toUpperCase());
        setLastKeyWasCorrect(true);
        addLog(`Pop! You typed '${key.toUpperCase()}' and burst a balloon! (+10 Stars) 💥`, 'success');

        // Scale spawn frequency slightly based on score
        state.spawnInterval = Math.max(100 - Math.floor(newScore / 50) * 10, 45);
      } else {
        // Penalty for wrong keypress
        audio.playIncorrect(); // Play buzzer sound
        setLastKeyPressed(key.toUpperCase());
        setLastKeyWasCorrect(false);
        
        if (isJuniorMode) {
          // Under Level 5: wrong key press counts as missed/wrong attempt
          const newMissed = state.missed + 1;
          setMissedCount(newMissed);
          addLog(`Mistake! You typed '${key.toUpperCase()}' which counts as an error! ❌`, 'error');
          if (newMissed >= 5) {
            handleGameOver();
          }
        } else {
          // Level 6+: wrong key press is just a soft buzzer/click but not counted as missed
          addLog(`Mistake! You typed '${key.toUpperCase()}' but there was no balloon for it! ❌`, 'error');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, isVictory, progress]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    if (!isPlaying || isGameOver || isVictory) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const state = stateRef.current;
      const isJuniorMode = progress.level <= 5;
      
      // Update canvas dimensions dynamically if they change (e.g. from 0 on initial layout to full size)
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.floor(rect.width);
      const targetH = Math.floor(rect.height);
      
      if (targetW > 0 && targetH > 0 && (canvas.width !== targetW * dpr || canvas.height !== targetH * dpr)) {
        canvas.width = targetW * dpr;
        canvas.height = targetH * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, targetW, targetH);

      // Check for victory condition in Junior Mode
      if (isJuniorMode && state.balloonsSpawned >= 20 && state.balloons.length === 0 && !isGameOver && !isVictory) {
        handleVictory();
        return;
      }

      // Draw cute sky background decorations (clouds)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      // Cloud 1
      ctx.beginPath();
      ctx.arc(80, 60, 25, 0, Math.PI * 2);
      ctx.arc(110, 50, 35, 0, Math.PI * 2);
      ctx.arc(140, 60, 25, 0, Math.PI * 2);
      ctx.fill();

      // Cloud 2
      ctx.beginPath();
      ctx.arc(targetW - 120, 90, 20, 0, Math.PI * 2);
      ctx.arc(targetW - 95, 80, 28, 0, Math.PI * 2);
      ctx.arc(targetW - 70, 90, 20, 0, Math.PI * 2);
      ctx.fill();

      // Update and Draw Balloons
      for (let i = state.balloons.length - 1; i >= 0; i--) {
        const b = state.balloons[i];
        
        // Move balloon up
        b.y -= b.speed;
        
        // Gentle horizontal sway
        b.wiggle += b.wiggleSpeed;
        const wiggleX = b.x + Math.sin(b.wiggle) * 15;

        // Check if balloon missed and went past the screen top
        if (b.y < -b.radius) {
          const missedLetter = b.letter.toUpperCase();
          state.balloons.splice(i, 1);
          
          if (isJuniorMode) {
            // Junior Mode: Escaped balloons do NOT count as missed attempts/errors
            if (addLogRef.current) {
              addLogRef.current(`Balloon '${missedLetter}' floated away! 🎈`, 'info');
            }
          } else {
            // Arcade Mode: Escaped balloons count as misses
            const newMissed = state.missed + 1;
            setMissedCount(newMissed);
            audio.playIncorrect();

            if (addLogRef.current) {
              addLogRef.current(`Balloon '${missedLetter}' missed! Floated off screen. 🎈`, 'warning');
            }

            if (newMissed >= 5) {
              handleGameOver();
            }
          }
          continue;
        }

        // Draw balloon string
        ctx.beginPath();
        ctx.moveTo(wiggleX, b.y + b.radius);
        ctx.quadraticCurveTo(
          wiggleX + Math.sin(b.wiggle * 2) * 10,
          b.y + b.radius + 30,
          wiggleX,
          b.y + b.radius + 60
        );
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw balloon body (ellipse shape)
        ctx.beginPath();
        ctx.ellipse(wiggleX, b.y, b.radius * 0.9, b.radius, 0, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();

        // Shiny reflection highlight
        ctx.beginPath();
        ctx.ellipse(wiggleX - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.2, b.radius * 0.3, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        // Balloon tie (triangle at the bottom)
        ctx.beginPath();
        ctx.moveTo(wiggleX, b.y + b.radius);
        ctx.lineTo(wiggleX - 6, b.y + b.radius + 8);
        ctx.lineTo(wiggleX + 6, b.y + b.radius + 8);
        ctx.closePath();
        ctx.fillStyle = b.color;
        ctx.fill();

        // Draw Letter in the center of balloon - Using standard Fredoka font loaded from Google Fonts!
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px Fredoka, Quicksand, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4;
        ctx.fillText(b.letter.toUpperCase(), wiggleX, b.y);
        ctx.shadowBlur = 0; // reset shadow
      }

      // Update and Draw Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = Math.max(0, p.alpha - 0.02);
        p.life -= 1;

        if (p.life <= 0 || p.alpha <= 0) {
          state.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }

      // Handle spawns - Spawn relative to targetH!
      if (targetH > 0) {
        state.spawnTimer++;
        if (state.spawnTimer >= state.spawnInterval) {
          state.spawnTimer = 0;
          spawnBalloon();
        }
      }

      // Continue loop
      if (isPlaying && !isGameOver && !isVictory) {
        gameLoopRef.current = requestAnimationFrame(render);
      }
    };

    gameLoopRef.current = requestAnimationFrame(render);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying, isGameOver, isVictory]);

  // Stop background music if player navigates away from page
  useEffect(() => {
    return () => {
      audio.stopMusic();
    };
  }, []);

  const handleGameOver = () => {
    setIsGameOver(true);
    setIsPlaying(false);
    audio.stopMusic();
    audio.playIncorrect(); // play buzzer
    addLog(`Game Over! Final Score: ${stateRef.current.score} Stars. 🏆`, 'info');

    // Calculate final scores
    const finalScore = stateRef.current.score;
    
    // Save highscore
    let newHighScore = highScore;
    if (finalScore > highScore) {
      newHighScore = finalScore;
      setHighScore(finalScore);
    }

    // Award overall progress points/stars directly from the game score!
    const pointReward = finalScore;
    const newPoints = progress.points + pointReward;

    const newBadges = [...(progress.badges || [])];
    if (finalScore >= 200 && !newBadges.includes('pop_star')) {
      newBadges.push('pop_star');
    }
    if (finalScore >= 500 && !newBadges.includes('super_popper')) {
      newBadges.push('super_popper');
    }

    updateProgress({
      points: newPoints,
      highScore: newHighScore,
      badges: newBadges
    });
  };

  const handleVictory = () => {
    setIsVictory(true);
    setIsPlaying(false);
    audio.stopMusic();
    audio.playLevelUp(); // victory sound fanfare
    addLog(`Victory! Popped all 20 balloons in the round! 🏆`, 'info');

    const finalScore = stateRef.current.score;
    let newHighScore = highScore;
    if (finalScore > highScore) {
      newHighScore = finalScore;
      setHighScore(finalScore);
    }

    // Reward score + 30 Victory Bonus Stars!
    const pointReward = finalScore + 30;
    const newPoints = progress.points + pointReward;

    const newBadges = [...(progress.badges || [])];
    if (finalScore >= 200 && !newBadges.includes('pop_star')) {
      newBadges.push('pop_star');
    }
    if (finalScore >= 500 && !newBadges.includes('super_popper')) {
      newBadges.push('super_popper');
    }

    updateProgress({
      points: newPoints,
      highScore: newHighScore,
      badges: newBadges
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      


      {/* Game Header Panels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🎈 Balloon Burst!
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Press the matching key on your keyboard to pop the balloons and earn stars!</p>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          background: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '16px',
          border: '3px solid #fbcfe8'
        }}>
          <div style={{ textAlign: 'center', padding: '0 0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Stars Score</span>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#ec4899' }}>{score}</p>
          </div>
          <div style={{ width: '2px', background: '#fbcfe8' }} />
          <div style={{ textAlign: 'center', padding: '0 0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
              {progress.level <= 5 ? 'Mistakes' : 'Missed Balloons'}
            </span>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: missedCount >= 4 ? '#ef4444' : '#64748b' }}>
              {missedCount} / 5
            </p>
          </div>
          <div style={{ width: '2px', background: '#fbcfe8' }} />
          <div style={{ textAlign: 'center', padding: '0 0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Personal Best</span>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#db2777' }}>{highScore}</p>
          </div>
        </div>
      </div>

      {/* Main Play Area */}
      <div style={{ position: 'relative', width: '100%', height: '420px' }}>
        
        {/* HTML Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#e0f2fe', // sky blue sky background
            borderRadius: '24px',
            border: '4px solid #bae6fd',
            boxShadow: '0 8px 0px #bae6fd',
            display: 'block'
          }}
        />

        {/* Start / Pause / GameOver Overlays */}
        {!isPlaying && !isGameOver && !isVictory && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(224, 242, 254, 0.85)',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div style={{ fontSize: '4.5rem' }} className="float-animation">🎈</div>
            <h3 style={{ fontSize: '2.5rem', color: '#1e3a8a' }}>
              {progress.level <= 5 ? '🌟 Junior Practice Mode 🌟' : 'Are you ready to pop?'}
            </h3>
            <p style={{ maxWidth: '440px', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5' }}>
              {progress.level <= 5 
                ? 'Pop all 20 balloons to win! Take your time: balloons floating away do NOT count as errors, but making 5 keyboard typing mistakes ends the game!' 
                : 'Letters will float up. Press the correct letter keys to burst them! Let 5 escape, and it\'s game over!'}
            </p>
            <button className="kids-button btn-pink" onClick={startGame} style={{ fontSize: '1.25rem' }}>
              <Play size={20} fill="white" /> Start Popping Game!
            </button>
          </div>
        )}

        {/* Pause Overlay */}
        {isPlaying && !isGameOver && !isVictory && (
          <button
            onClick={pauseGame}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.7)',
              border: '2px solid #bae6fd',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 0 rgba(0,0,0,0.05)'
            }}
          >
            <Pause size={20} color="#0284c7" />
          </button>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(253, 242, 248, 0.9)',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div style={{ fontSize: '4.5rem' }}>🏆🎈💥</div>
            <h3 style={{ fontSize: '2.5rem', color: '#be123c' }}>Game Over!</h3>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
              {progress.level <= 5 
                ? 'Don\'t worry! Practice makes perfect. Try again!'
                : 'You burst a ton of balloons and earned stars!'}
            </p>

            <div style={{
              display: 'flex',
              gap: '2rem',
              background: 'white',
              border: '3px solid #fda4af',
              borderRadius: '20px',
              padding: '1rem 2.5rem',
              boxShadow: '0 6px 0 #fda4af'
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Points Score</span>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#db2777' }}>{score}</h4>
              </div>
              <div style={{ width: '2px', background: '#fda4af' }} />
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stars Added</span>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#ca8a04' }}>+{score} ⭐</h4>
              </div>
            </div>

            <button className="kids-button btn-blue" onClick={startGame} style={{ marginTop: '0.5rem' }}>
              <RotateCcw size={18} /> Play Again
            </button>
          </div>
        )}

        {/* Victory Overlay */}
        {isVictory && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(240, 253, 250, 0.95)',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div style={{ fontSize: '4.5rem' }} className="float-animation">🎉🏆🌟</div>
            <h3 style={{ fontSize: '2.5rem', color: '#0f766e' }}>Practice Completed!</h3>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
              Amazing job! You popped all 20 balloons and completed this practice round!
            </p>

            <div style={{
              display: 'flex',
              gap: '2rem',
              background: 'white',
              border: '3px solid #5eead4',
              borderRadius: '20px',
              padding: '1rem 2.5rem',
              boxShadow: '0 6px 0 #5eead4'
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pops Score</span>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#0d9488' }}>{score}</h4>
              </div>
              <div style={{ width: '2px', background: '#5eead4' }} />
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stars Earned</span>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#ca8a04' }}>+{score + 30} ⭐</h4>
              </div>
            </div>

            <button className="kids-button btn-green" onClick={startGame} style={{ marginTop: '0.5rem' }}>
              <RotateCcw size={18} /> Play Again!
            </button>
          </div>
        )}
      </div>

      {/* Last Key Pressed Diagnostic Indicator */}
      {lastKeyPressed && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          margin: '0 auto',
          padding: '0.5rem 1.5rem',
          borderRadius: '16px',
          fontFamily: 'var(--font-heading)',
          fontSize: '1.25rem',
          color: 'white',
          background: lastKeyWasCorrect ? 'var(--color-green)' : 'var(--color-red)',
          boxShadow: lastKeyWasCorrect ? '0 5px 0 #047857' : '0 5px 0 #991b1b',
          width: 'fit-content',
          animation: lastKeyWasCorrect ? 'pop 0.3s ease' : 'shake 0.3s ease'
        }}>
          {lastKeyWasCorrect ? '✨ Good Job! Key:' : '❌ Wrong Key:'} [{lastKeyPressed}]
        </div>
      )}

      {/* Visual Debugging Log Panel */}
      {settings?.showDiagnostics && (
      <div className="kids-card" style={{
        borderColor: '#cbd5e1',
        boxShadow: '0 6px 0px #cbd5e1',
        background: '#f8fafc',
        padding: '1.25rem',
        marginTop: '0.5rem'
      }}>
        <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          🔍 Game Event Log (Diagnostic Panel)
        </h4>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          maxHeight: '120px',
          overflowY: 'auto',
          fontSize: '0.85rem',
          fontFamily: 'monospace',
          background: '#ffffff',
          border: '2px solid #e2e8f0',
          borderRadius: '12px',
          padding: '0.75rem'
        }}>
          {debugLogs.length === 0 ? (
            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No game events yet. Press start to play!</span>
          ) : (
            debugLogs.map(log => {
              let logColor = '#475569';
              let bg = '#f1f5f9';
              if (log.type === 'success') { logColor = '#166534'; bg = '#f0fdf4'; }
              if (log.type === 'error') { logColor = '#991b1b'; bg = '#fef2f2'; }
              if (log.type === 'warning') { logColor = '#854d0e'; bg = '#fefce8'; }
              
              return (
                <div key={log.id} style={{
                  color: logColor,
                  background: bg,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <span style={{ color: '#94a3b8' }}>[{log.time}]</span>
                  <span>{log.message}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
      )}

      {/* Helpful Instructions Footer */}
      <div className="kids-card" style={{
        borderColor: '#bfdbfe',
        boxShadow: '0 6px 0px #93c5fd',
        background: '#eff6ff',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '1.25rem'
      }}>
        <Info size={24} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ color: '#1e40af', marginBottom: '0.25rem' }}>Game Tips:</h4>
          <ul style={{ paddingLeft: '1.25rem', color: '#1e3a8a', fontSize: '0.85rem', lineHeight: '1.5' }}>
            <li>Place your fingers on the Home Row (A, S, D, F, J, K, L, ;) so you can reach any letter quickly!</li>
            <li>Look directly at the screen to read letters rather than looking down at your keyboard. This builds muscle memory!</li>
            <li>All points earned here are added as **stars** to your profile, helping level up your mascot!</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
