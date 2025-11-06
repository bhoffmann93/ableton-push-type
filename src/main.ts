// @ts-nocheck
import p5 from 'p5';
import './style.css';
import { getDateAndTimeString } from './utils/utils';
import { easing } from 'ts-easing';
import { PushController } from './midi';
import { GRID_CONFIG } from './config/grid.config';
import { Grid } from './grid';
import UserInterface from './ui/ui';
import { AudioSynth } from './audio/audiosynth';
import * as Tone from 'tone';

const waveSpeed = 0.025;

async function main() {
  const grid = new Grid(GRID_CONFIG);

  let audioSynth: AudioSynth | null = null;

  const pushController = new PushController(grid, audioSynth);
  pushController.initialize().catch((err) => console.error('MIDI initialization failed:', err));

  const audioToggleButton = document.getElementById('audio-toggle-btn');
  audioToggleButton?.addEventListener('click', async () => {
    if (audioSynth == null) {
      await Tone.start();
      console.log('🎼 Tone started ');
      audioSynth = new AudioSynth();
      pushController.setAudioSynth(audioSynth);
    } else {
      audioSynth.toggleMute();
    }

    if (audioSynth.isMuted) {
      audioToggleButton.classList.remove('active');
      audioToggleButton.classList.add('inactive');
    } else {
      audioToggleButton.classList.remove('inactive');
      audioToggleButton.classList.add('active');
    }
  });

  const ui = new UserInterface(pushController);

  const sketch = new p5((p5Instance) => {
    const p = p5Instance as unknown as p5;

    p.setup = () => {
      p.createCanvas(GRID_CONFIG.canvasDimensions.width, GRID_CONFIG.canvasDimensions.height);
      grid.calculate(p, 0);
    };

    p.draw = () => {
      let time = Math.sin(p.frameCount * waveSpeed) * 0.5 + 0.5;
      time = easing.outSine(time);

      grid.calculate(p, time);
      grid.draw(p);
    };
  }, document.getElementById('app') as HTMLElement);

  document.addEventListener('keydown', (e) => {
    if (e.key === 's') {
      const date = getDateAndTimeString();
      sketch.saveCanvas((sketch as any).canvas, 'grid_' + date, 'png');
    }

    if (e.key === 'd') {
      // debug = !debug;
    }

    if (e.key === ' ') {
      sketch.noLoop();
    }
  });
}

main();
