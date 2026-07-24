type SoundName = 'task_complete' | 'click' | 'timer_start' | 'timer_pause' | 'achievement' | 'warning' | string;

class SoundEngine {
  private context: AudioContext | null = null;

  private getPreset(name: SoundName): [number, OscillatorType, number] {
    switch (name) {
      case 'task_complete':
        return [523.25, 'sine', 0.08];
      case 'click':
        return [880, 'triangle', 0.03];
      case 'timer_start':
        return [330, 'sine', 0.1];
      case 'timer_pause':
        return [440, 'sine', 0.1];
      case 'achievement':
        return [783.99, 'sine', 0.35];
      case 'warning':
        return [180, 'sawtooth', 0.18];
      default:
        return [880, 'triangle', 0.03];
    }
  }

  private ensureContext() {
    if (!this.context) {
      this.context = new AudioContext();
    }

    return this.context;
  }

  play(name: SoundName, volume = 0.7) {
    const context = this.ensureContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    const preset = this.getPreset(name);
    const [frequency, waveform, duration] = preset;
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
    gain.gain.value = Math.max(0, Math.min(1, volume));

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }
}

export const soundEngine = new SoundEngine();