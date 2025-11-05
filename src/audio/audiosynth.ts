import * as Tone from 'tone';

export class AudioSynth {
  private synth: Tone.Synth;

  constructor() {
    this.synth = new Tone.Synth().toDestination();
    console.log('🎼 Tone Audio Synth created ');
  }

  playNote(note: string, duration = '8n'): void {
    // this.synth.triggerAttackRelease(note, duration);

    const now = Tone.now();
    const dur = 0.1; //seconds
    this.synth.triggerAttack(note, now);

    this.synth.triggerRelease(now + dur);
  }

  playFrequency(frequency: number, duration = 100): void {
    this.synth.triggerAttackRelease(frequency, duration / 1000);
  }

  dispose(): void {
    this.synth.dispose();
  }
}
