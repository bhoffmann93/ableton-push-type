import * as Tone from 'tone';

export class AudioSynth {
  private synth: Tone.Synth;

  constructor() {
    this.synth = new Tone.Synth().toDestination();
  }

  playNote(note: string, duration = '8n'): void {
    this.synth.triggerAttackRelease(note, duration);
  }

  playFrequency(frequency: number, duration = 100): void {
    this.synth.triggerAttackRelease(frequency, duration / 1000);
  }

  dispose(): void {
    this.synth.dispose();
  }
}
