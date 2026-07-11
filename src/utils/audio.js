class SoundEffects {
  constructor() {
    this.ctx = null;
    this.musicInterval = null;
    this.soundProfile = 'default';
  }

  setSoundProfile(profile) {
    this.soundProfile = profile;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    if (this.soundProfile === 'mechanical') {
      this.playMechanicalClick();
      return;
    }

    this.init();
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  playMechanicalClick() {
    this.init();
    const ctx = this.ctx;
    
    // Low thud
    const oscThud = ctx.createOscillator();
    const gainThud = ctx.createGain();
    oscThud.type = 'sine';
    oscThud.frequency.setValueAtTime(150, ctx.currentTime);
    oscThud.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05);
    gainThud.gain.setValueAtTime(0.4, ctx.currentTime);
    gainThud.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    oscThud.connect(gainThud);
    gainThud.connect(ctx.destination);
    oscThud.start();
    oscThud.stop(ctx.currentTime + 0.06);

    // High transient click
    const oscClick = ctx.createOscillator();
    const gainClick = ctx.createGain();
    oscClick.type = 'square';
    oscClick.frequency.setValueAtTime(2000, ctx.currentTime);
    oscClick.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.02);
    gainClick.gain.setValueAtTime(0.1, ctx.currentTime);
    gainClick.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);
    oscClick.connect(gainClick);
    gainClick.connect(ctx.destination);
    oscClick.start();
    oscClick.stop(ctx.currentTime + 0.03);
  }

  playPop() {
    this.init();
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Rising sweep for pop sound
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  }

  playCorrect() {
    this.init();
    const ctx = this.ctx;
    const playNote = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    const now = ctx.currentTime;
    playNote(523.25, now, 0.1); // C5
    playNote(659.25, now + 0.08, 0.2); // E5
  }

  playIncorrect() {
    this.init();
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Low sliding buzz
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.21);
  }

  playLevelUp() {
    this.init();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      
      gain.gain.setValueAtTime(0.18, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.1 + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.35);
    });
  }

  startMusic() {
    this.init();
    if (this.musicInterval) return;

    const ctx = this.ctx;
    // Cheerful, looping pentatonic kids theme
    // C4, E4, F4, G4, A4, G4, F4, E4
    const melody = [261.63, 329.63, 349.23, 392.00, 440.00, 392.00, 349.23, 329.63];
    let noteIdx = 0;

    const playNextNote = () => {
      if (!this.ctx || this.ctx.state === 'suspended') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Soft chiptune flute sound
      osc.frequency.setValueAtTime(melody[noteIdx], now);

      // Keep volume very soft so it sits as background ambience
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);

      noteIdx = (noteIdx + 1) % melody.length;
    };

    playNextNote();
    this.musicInterval = setInterval(playNextNote, 420);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  playSwordSwing() {
    this.init();
    const ctx = this.ctx;
    
    const bufferSize = ctx.sampleRate * 0.2; // 0.2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(8000, ctx.currentTime + 0.1);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start();
    noise.stop(ctx.currentTime + 0.2);
  }

  startNinjaMusic() {
    this.init();
    if (this.ninjaMusicInterval) return;

    const ctx = this.ctx;
    let beatCount = 0;
    
    // Japanese pentatonic scale for the flute (A minor pentatonic: A, C, D, E, G)
    const melody = [440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

    const playBeat = () => {
      if (!this.ctx || this.ctx.state === 'suspended') return;
      const now = ctx.currentTime;
      
      // -- TAIKO DRUM --
      const drumOsc = ctx.createOscillator();
      const drumGain = ctx.createGain();
      
      // Square wave provides mid-harmonics so it's audible on laptop speakers
      drumOsc.type = 'square';
      drumOsc.frequency.setValueAtTime(200, now);
      drumOsc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      
      const drumVol = (beatCount % 4 === 0) ? 0.4 : 0.2;
      
      drumGain.gain.setValueAtTime(drumVol, now);
      drumGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      
      drumOsc.connect(filter);
      filter.connect(drumGain);
      drumGain.connect(ctx.destination);
      
      drumOsc.start(now);
      drumOsc.stop(now + 0.25);
      
      // -- FLUTE MELODY --
      if (beatCount % 2 === 0) {
        const fluteOsc = ctx.createOscillator();
        const fluteGain = ctx.createGain();
        
        fluteOsc.type = 'triangle';
        const note = melody[Math.floor(Math.random() * melody.length)];
        fluteOsc.frequency.setValueAtTime(note, now);
        
        fluteGain.gain.setValueAtTime(0, now);
        fluteGain.gain.linearRampToValueAtTime(0.1, now + 0.1);
        fluteGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        
        fluteOsc.connect(fluteGain);
        fluteGain.connect(ctx.destination);
        
        fluteOsc.start(now);
        fluteOsc.stop(now + 0.65);
      }
      
      beatCount++;
    };

    playBeat();
    this.ninjaMusicInterval = setInterval(playBeat, 400);
  }

  stopNinjaMusic() {
    if (this.ninjaMusicInterval) {
      clearInterval(this.ninjaMusicInterval);
      this.ninjaMusicInterval = null;
    }
  }
}

export const audio = new SoundEffects();
