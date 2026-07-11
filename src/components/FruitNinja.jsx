import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Trophy, Swords, Heart } from 'lucide-react';
import { audio } from '../utils/audio';

const FRUIT_EMOJIS = ['🍉', '🍎', '🍌', '🍇', '🍓', '🍍', '🥥', '🥭'];
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

export default function FruitNinja({ progress, updateProgress }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover', 'victory'
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  
  const isJunior = progress.level <= 5;
  const MAX_FRUITS_JUNIOR = 20;
  const MAX_MISSES = 5;

  const gameStateRef = useRef({
    fruits: [],
    particles: [],
    spawnTimer: 0,
    fruitsSpawned: 0,
    score: 0,
    misses: 0,
    lastTime: 0,
    slashes: []
  });

  const requestRef = useRef();

  // Reset internal state
  const initGame = () => {
    gameStateRef.current = {
      fruits: [],
      particles: [],
      spawnTimer: 0,
      fruitsSpawned: 0,
      score: 0,
      misses: 0,
      lastTime: performance.now(),
      slashes: []
    };
    setScore(0);
    setMisses(0);
  };

  const startGame = () => {
    initGame();
    setGameState('playing');
  };

  const endGame = (won) => {
    setGameState(won ? 'victory' : 'gameover');
    
    if (won) {
      audio.playLevelUp();
      const pointsEarned = Math.floor(gameStateRef.current.score * 1.5);
      updateProgress({
        points: progress.points + pointsEarned,
        highScore: Math.max(progress.highScore || 0, gameStateRef.current.score)
      });
    } else {
      audio.playIncorrect();
    }
  };

  const spawnFruit = (canvasWidth, canvasHeight) => {
    const letter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    const emoji = FRUIT_EMOJIS[Math.floor(Math.random() * FRUIT_EMOJIS.length)];
    
    // Spawn from the bottom
    const startX = Math.random() * (canvasWidth - 100) + 50;
    const startY = canvasHeight + 50;
    
    // Arc towards the center
    const targetX = canvasWidth / 2 + (Math.random() * 200 - 100);
    // Adjusted vx and vy for gravity=0.06 to maintain the same max height and arc shape
    const vx = (targetX - startX) / 140; 
    const vy = - (Math.random() * 2 + 7.5);

    gameStateRef.current.fruits.push({
      id: Math.random().toString(36),
      x: startX,
      y: startY,
      vx,
      vy,
      emoji,
      letter,
      sliced: false,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      halves: []
    });

    gameStateRef.current.fruitsSpawned++;
  };

  const createParticles = (x, y, color) => {
    for (let i = 0; i < 10; i++) {
      gameStateRef.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        color
      });
    }
  };

  const createSlash = (x, y) => {
    gameStateRef.current.slashes.push({
      x, y,
      angle: (Math.random() - 0.5) * 0.5, // Nearly vertical slash
      life: 1,
      length: 0
    });
  };

  const gameLoop = (time) => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) {
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 500;
    
    // Clear background
    ctx.clearRect(0, 0, width, height);

    const state = gameStateRef.current;
    const dt = time - state.lastTime;
    state.lastTime = time;

    // Spawn logic
    const spawnRate = isJunior ? 1500 : Math.max(500, 1500 - state.score * 20);
    state.spawnTimer += dt;
    
    if (state.spawnTimer > spawnRate) {
      if (!isJunior || state.fruitsSpawned < MAX_FRUITS_JUNIOR) {
        spawnFruit(width, height);
      }
      state.spawnTimer = 0;
    }

    // Check Junior Win Condition
    if (isJunior && state.fruitsSpawned >= MAX_FRUITS_JUNIOR && state.fruits.length === 0) {
      endGame(true);
      return;
    }

    // Update and Draw Fruits
    const gravity = 0.06;

    for (let i = state.fruits.length - 1; i >= 0; i--) {
      const f = state.fruits[i];

      if (!f.sliced) {
        f.x += f.vx;
        f.vy += gravity;
        f.y += f.vy;
        f.rotation += f.rotationSpeed;

        // Draw unsliced fruit
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);
        
        ctx.font = '90px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(f.emoji, 0, 0);
        
        // Draw letter
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 45px var(--font-heading)';
        ctx.fillText(f.letter.toUpperCase(), 0, 0);
        ctx.shadowBlur = 0; // reset
        
        ctx.restore();

        // Check drop
        if (f.y > height + 100) {
          state.fruits.splice(i, 1);
          if (!isJunior) { // Arcade drop penalty
            state.misses++;
            setMisses(state.misses);
            audio.playIncorrect();
            if (state.misses >= MAX_MISSES) endGame(false);
          }
        }
      } else {
        // Draw sliced halves flying apart
        for (let j = 0; j < f.halves.length; j++) {
          const half = f.halves[j];
          half.x += half.vx;
          half.vy += gravity;
          half.y += half.vy;
          half.rotation += half.rotationSpeed;
          
          ctx.save();
          ctx.translate(half.x, half.y);
          ctx.rotate(half.rotation);
          
          ctx.font = '90px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Use clipping to draw half of the emoji
          ctx.beginPath();
          if (j === 0) {
            ctx.rect(-60, -60, 60, 120); // left half
          } else {
            ctx.rect(0, -60, 60, 120); // right half
          }
          ctx.clip();
          ctx.fillText(f.emoji, 0, 0);
          ctx.restore();
        }
        
        // Remove if halves fall off
        if (f.halves[0].y > height + 100) {
          state.fruits.splice(i, 1);
        }
      }
    }

    // Update and draw particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
      
      if (p.life <= 0) {
        state.particles.splice(i, 1);
        continue;
      }
      
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Update and draw slashes
    if (state.slashes) {
      for (let i = state.slashes.length - 1; i >= 0; i--) {
        const s = state.slashes[i];
        s.length += 40; // rapidly extend
        s.life -= 0.08; // rapidly fade
        
        if (s.life <= 0) {
          state.slashes.splice(i, 1);
          continue;
        }
        
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        
        // Glow effect
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 20;
        
        // Draw the slash line
        ctx.beginPath();
        ctx.moveTo(0, -s.length);
        ctx.lineTo(0, s.length);
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${s.life})`;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Inner silver core
        ctx.strokeStyle = `rgba(226, 232, 240, ${s.life})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.restore();
      }
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      gameStateRef.current.lastTime = performance.now();
      requestRef.current = requestAnimationFrame(gameLoop);
      audio.startNinjaMusic();
    }
    return () => {
      cancelAnimationFrame(requestRef.current);
      audio.stopNinjaMusic();
    };
  }, [gameState]);

  // Handle Keyboard Slicing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      const key = e.key.toLowerCase();
      if (!ALPHABET.includes(key)) return;

      const state = gameStateRef.current;
      
      // Find lowest unsliced fruit with matching letter
      let target = null;
      let targetIndex = -1;
      
      for (let i = 0; i < state.fruits.length; i++) {
        const f = state.fruits[i];
        if (!f.sliced && f.letter === key) {
          if (!target || f.y > target.y) {
            target = f;
            targetIndex = i;
          }
        }
      }

      if (target) {
        // Slice it!
        audio.playSwordSwing();
        target.sliced = true;
        
        // Setup halves
        target.halves = [
          { x: target.x, y: target.y, vx: target.vx - 3, vy: target.vy, rotation: target.rotation, rotationSpeed: -0.1 },
          { x: target.x, y: target.y, vx: target.vx + 3, vy: target.vy, rotation: target.rotation, rotationSpeed: 0.1 }
        ];

        // Add juice particles and slash visual
        const colors = ['#f87171', '#fef08a', '#c084fc', '#4ade80'];
        createParticles(target.x, target.y, colors[Math.floor(Math.random() * colors.length)]);
        createSlash(target.x, target.y);

        state.score++;
        setScore(state.score);
      } else {
        // Wrong key press penalty
        state.misses++;
        setMisses(state.misses);
        audio.playIncorrect();
        
        if (state.misses >= MAX_MISSES) {
          endGame(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Setup canvas size
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        // Fix for high DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = 500 * dpr;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        // Force css size to match parent layout
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `500px`;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [gameState]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Game Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: '#166534', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Swords size={32} /> Fruit Ninja
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
            {isJunior ? `Junior Mode: Slice ${MAX_FRUITS_JUNIOR} fruits! Only wrong keys hurt.` : 'Arcade Mode: Slicing frenzy! Don\'t drop them!'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div className="kids-card" style={{ padding: '0.75rem 1.5rem', background: '#f0fdf4', borderColor: '#86efac', boxShadow: '0 4px 0px #4ade80' }}>
            <span style={{ fontSize: '1.2rem', color: '#166534', fontWeight: 'bold' }}>Score: {score}</span>
          </div>
          <div className="kids-card" style={{ padding: '0.75rem 1.5rem', background: '#fef2f2', borderColor: '#fca5a5', boxShadow: '0 4px 0px #f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {[...Array(MAX_MISSES)].map((_, i) => (
              <Heart key={i} size={20} fill={i < misses ? '#ef4444' : '#fee2e2'} color={i < misses ? '#b91c1c' : '#fca5a5'} />
            ))}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '500px',
        background: 'linear-gradient(to bottom, #dbeafe, #f0fdf4)',
        borderRadius: '24px',
        border: '4px solid #86efac',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        
        {gameState === 'menu' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)' }}>
            <Swords size={64} color="#22c55e" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '2rem', color: '#166534', margin: '0 0 2rem 0' }}>Ready your katana!</h3>
            <button className="kids-button btn-green" style={{ fontSize: '1.5rem', padding: '1rem 3rem' }} onClick={startGame}>
              <Play size={28} /> Start Slicing
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(254,226,226,0.9)' }}>
            <h3 style={{ fontSize: '3rem', color: '#991b1b', margin: '0 0 1rem 0' }}>Game Over!</h3>
            <p style={{ fontSize: '1.5rem', color: '#7f1d1d', margin: '0 0 2rem 0' }}>You sliced {score} fruits.</p>
            <button className="kids-button btn-yellow" style={{ fontSize: '1.5rem', padding: '1rem 3rem' }} onClick={startGame}>
              <RotateCcw size={28} /> Try Again
            </button>
          </div>
        )}

        {gameState === 'victory' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(254,240,138,0.95)' }}>
            <Trophy size={80} color="#ca8a04" style={{ marginBottom: '1rem' }} className="float-animation" />
            <h3 style={{ fontSize: '3rem', color: '#854d0e', margin: '0 0 1rem 0' }}>Ninja Master!</h3>
            <p style={{ fontSize: '1.5rem', color: '#713f12', margin: '0 0 2rem 0' }}>Perfect slicing technique! +{Math.floor(score * 1.5)} Stars</p>
            <button className="kids-button btn-green" style={{ fontSize: '1.5rem', padding: '1rem 3rem' }} onClick={startGame}>
              <Play size={28} /> Play Again
            </button>
          </div>
        )}

        <canvas 
          ref={canvasRef}
          style={{ 
            width: '100%', 
            height: '100%',
            display: gameState === 'playing' ? 'block' : 'none'
          }} 
        />
        
      </div>
    </div>
  );
}
