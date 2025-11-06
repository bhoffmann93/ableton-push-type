import * as webmidi from 'webmidi';
import { MidiData, PushKnobCCMapping, PushButtonMidiCC, PushLEDColor } from '../types/push.types';
import { PUSH_CONFIG, PUSH_BUTTON_RANGE, MIDI_CHANNELS } from '../config/push.config';
import { Grid } from '../grid/grid';
import { GRID_CONFIG } from '../config/grid.config';
import { AudioSynth } from '../audio/audiosynth';
import { COLOR_PAIRS, COLOR_PAIR_PUSH_LED_MAP } from '../constants/color.constants';
import { Knob } from './push.knob';
import { KNOB_CONFIGS } from '../config/knob.config';

export class PushController {
  private midiInput: webmidi.Input | null = null;
  private midiOutput: webmidi.Output | null = null;
  private grid: Grid;
  private audioSynth: AudioSynth | null;
  private knobs: Knob[] = [];
  private shouldResetModuleButtons = false;

  constructor(grid: Grid, audioSynth: AudioSynth | null) {
    this.grid = grid;
    this.audioSynth = audioSynth;
    this.knobs = KNOB_CONFIGS.map((config, index) => new Knob(index, config));
  }

  async initialize(): Promise<void> {
    try {
      await webmidi.WebMidi.enable();
      this.setupDevices();
      this.setupListeners();

      if (this.midiInput && this.midiOutput) {
        console.log('✅ Ableton Push connected successfully');
      } else {
        console.warn('⚠️ MIDI system ready, but Ableton Push not found');
      }
    } catch (err) {
      console.error('Failed to initialize MIDI:', err);
      throw err;
    }
  }

  private setupDevices(): void {
    if (webmidi.WebMidi.inputs.length < 1) {
      console.warn('No MIDI device detected.');
      return;
    }

    webmidi.WebMidi.inputs.forEach((device, index) => {
      console.log(`${index}: ${device.name}`);
    });

    this.midiInput = webmidi.WebMidi.getInputByName(PUSH_CONFIG.deviceName) || null;
    this.midiOutput = webmidi.WebMidi.getOutputByName(PUSH_CONFIG.deviceName) || null;

    if (!this.midiInput || !this.midiOutput) {
      console.warn(`Could not find device: ${PUSH_CONFIG.deviceName}`);
      return;
    }

    this.setAllButtonsOff();
    console.log('MIDI Input:', this.midiInput.name);
    console.log('MIDI Output:', this.midiOutput.name);
  }

  private setupListeners(): void {
    if (!this.midiInput) return;

    this.midiInput.addListener('controlchange', (e) => this.handleMidiCC(e), {
      channels: MIDI_CHANNELS,
    });

    this.midiInput.addListener('noteon', (e) => this.handleNoteOn(e));
  }

  private handleMidiCC(e: any): void {
    const controllerNumber = e.controller.number;

    // Handle upper knob row
    if (controllerNumber >= PushKnobCCMapping.KNOB_1 && controllerNumber <= PushKnobCCMapping.KNOB_8) {
      this.handleKnobMididCC(controllerNumber, e.rawValue);
      return;
    }

    //handle left knobs and buttons
    switch (controllerNumber) {
      case PushButtonMidiCC.KNOB_LEFT_1:
        this.grid.cycleMethod();
        break;
      case PushButtonMidiCC.KNOB_LEFT_2:
        this.grid.cycleShapingFunction();
        break;
      case PushButtonMidiCC.NEW:
        this.shouldResetModuleButtons = !this.shouldResetModuleButtons;
        // this.flashButton('new-btn');
        break;
      case PushButtonMidiCC.RECORD:
        if (e.rawValue === 127) {
          this.grid.toggleDebug();
          // this.flashButton('record-btn');
        }
        break;
      case PushButtonMidiCC.PLAY:
        if (e.rawValue === 127) {
          this.grid.resetAllShapes();
          this.setAllButtonsOff();
          // this.flashButton('play-btn');
        }
        break;
    }
  }

  private handleKnobMididCC(controllerNumber: number, rawValue: number): void {
    const knobIndex = controllerNumber - PushKnobCCMapping.KNOB_1;
    const knob = this.knobs[knobIndex];

    if (!knob) {
      console.warn('Knob not found');
      return;
    }

    let normalizedValue = webmidi.Utilities.from7bitToFloat(rawValue);

    if (normalizedValue <= 1 && normalizedValue > 0.5) {
      normalizedValue = 1 - normalizedValue;
      knob.decrement();
    } else if (normalizedValue < 0.5 && normalizedValue > 0) {
      knob.increment();
    }

    switch (knob.config.label) {
      case 'Colors':
        this.grid.setColorPair(knob.getValue());
        break;
      case 'Alley X':
        this.grid.setAlleyX(knob.getValue());
        break;
      case 'Alley Y':
        this.grid.setAlleyY(knob.getValue());
        break;
    }
  }

  private handleNoteOn(e: any): void {
    const noteNumber = e.data[1];
    const midiNote = webmidi.Utilities.buildNote(noteNumber).identifier;

    if (noteNumber >= PUSH_BUTTON_RANGE.min && noteNumber <= PUSH_BUTTON_RANGE.max) {
      const row = 7 - Math.floor((noteNumber - PUSH_BUTTON_RANGE.min) / 8);
      const col = (noteNumber - PUSH_BUTTON_RANGE.min) % 8;

      this.handleGridButtonPress(row, col, noteNumber);
      this.audioSynth?.playNote(midiNote, '16n');
    }
  }

  private handleGridButtonPress(row: number, col: number, noteNumber: number): void {
    const module = this.grid.getModule(row, col);
    if (!module) return;

    // Cycle through shapes
    if (this.shouldResetModuleButtons) {
      this.grid.setModuleShapeIndex(row, col, this.grid.INITIAL_SHAPE_INDEX);
    } else {
      this.grid.cycleShapeIndex(row, col);
    }

    // Update LED
    const updatedModule = this.grid.getModule(row, col);
    if (updatedModule && updatedModule.shapeIndex !== this.grid.INITIAL_SHAPE_INDEX) {
      let ledColor = PUSH_CONFIG.defaultLEDColor;

      if (PUSH_CONFIG.useColorPairLEDColor) {
        const currentPair = GRID_CONFIG.colorPair;
        const colorPairName = Object.keys(COLOR_PAIRS).find((key) => COLOR_PAIRS[key] === currentPair);

        if (colorPairName && COLOR_PAIR_PUSH_LED_MAP[colorPairName]) {
          ledColor = COLOR_PAIR_PUSH_LED_MAP[colorPairName];
        } else {
          console.warn(`No LED mapping for color pair: ${colorPairName}, using default`);
        }
      }

      this.setButtonLED(noteNumber, ledColor, true);
    } else {
      this.setButtonLED(noteNumber, PushLEDColor.BLACK, false);
    }
  }

  setButtonLED(buttonId: number, color: PushLEDColor, on = true): void {
    if (!this.midiOutput) return;

    if (on) {
      this.midiOutput.sendNoteOn(buttonId, { rawAttack: color, channels: 1 });
    } else {
      this.midiOutput.sendNoteOff(buttonId, { channels: 1 });
    }
  }

  setAllButtonsOff(): void {
    if (!this.midiOutput) return;

    for (let i = PUSH_BUTTON_RANGE.min; i <= PUSH_BUTTON_RANGE.max; i++) {
      this.midiOutput.sendNoteOff(i, { channels: 1 });
    }
  }

  getMidiData(): MidiData {
    return {
      knob1: this.knobs[0].getValue(),
      knob2: this.knobs[1].getValue(),
      knob3: this.knobs[2].getValue(),
      knob4: this.knobs[3].getValue(),
      knob5: this.knobs[4].getValue(),
      knob6: this.knobs[5].getValue(),
      knob7: this.knobs[6].getValue(),
      knob8: this.knobs[7].getValue(),
    };
  }

  getKnobValue(knobIndex: number): number {
    return this.knobs[knobIndex]?.getValue() ?? 0;
  }

  destroy(): void {
    if (this.midiInput) {
      this.midiInput.removeListener();
    }
  }

  setAudioSynth(audioSynth: AudioSynth) {
    this.audioSynth = audioSynth;
  }

  getGrid(): Grid {
    return this.grid;
  }
}
