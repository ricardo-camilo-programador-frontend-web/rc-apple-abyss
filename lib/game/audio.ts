export class AudioSystem {
  private context: AudioContext | null = null;
  private muted: boolean = false;
  private volume: number = 0.5;

  constructor(muted: boolean = false, volume: number = 0.5) {
    this.muted = muted;
    this.volume = volume;
  }

  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  setVolume(volume: number) {
    this.volume = volume;
  }

  playClick() {
    this.playSound(440, 'sine', 0.1);
  }

  playBreak() {
    this.playSound(150, 'square', 0.3);
  }

  playUpgrade() {
    this.playSound(880, 'triangle', 0.2);
  }

  playAscension() {
    this.playSound(660, 'sine', 0.5, true);
  }

  private playSound(frequency: number, type: OscillatorType, duration: number, slide: boolean = false) {
    if (this.muted || typeof window === 'undefined') return;
    this.initContext();
    if (!this.context) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.context.currentTime);
    if (slide) {
      osc.frequency.exponentialRampToValueAtTime(frequency * 2, this.context.currentTime + duration);
    }

    gain.gain.setValueAtTime(this.volume * 0.2, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.context.destination);

    osc.start();
    osc.stop(this.context.currentTime + duration);
  }
}
