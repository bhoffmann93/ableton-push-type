import * as webmidi from 'webmidi';
import { MidiData, PushKnobCCMapping, PushButtonMidiCC, PushLEDColor } from '../types/push.types';
import { PUSH_CONFIG, PUSH_BUTTON_RANGE, MIDI_CHANNELS } from '../config/push.config';
import { Grid } from '../grid/grid';
import { AudioSynth } from '../audio/audiosynth';
import { COLOR_PAIRS, COLOR_PAIR_PUSH_LED_MAP } from '../constants/color.constants';
import { Knob } from './push.knob';
import { KNOB_CONFIGS } from '../config/knob.config';

export class PushController extends EventTarget {
  private midiInput: webmidi.Input | null = null;
  private midiOutput: webmidi.Output | null = null;
  private grid: Grid;
  private audioSynth: AudioSynth | null;
  private knobs: Knob[] = [];
  private resetModuleButtonFlag = false;

  constructor(grid: Grid, audioSynth: AudioSynth | null) {
    super();
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
        this.dispatchEvent(
          new CustomEvent('gridMethodChange', {
            detail: { method: this.grid.getMethod() },
          })
        );
        break;
      case PushButtonMidiCC.KNOB_LEFT_2:
        this.grid.cycleShapingFunction();
        this.dispatchEvent(
          new CustomEvent('easeTypeChange', {
            detail: { easeType: this.grid.getEaseType() },
          })
        );
        break;
      case PushButtonMidiCC.NEW:
        this.resetModuleButtonFlag = !this.resetModuleButtonFlag;
        this.dispatchEvent(
          new CustomEvent('flash', {
            detail: { buttonId: 'new-btn' },
          })
        );
        break;
      case PushButtonMidiCC.RECORD:
        if (e.rawValue === 127) {
          this.grid.toggleDebug();
          this.dispatchEvent(
            new CustomEvent('flash', {
              detail: { buttonId: 'record-btn' },
            })
          );
        }
        break;
      case PushButtonMidiCC.PLAY:
        if (e.rawValue === 127) {
          this.grid.resetAllShapes();
          this.setAllButtonsOff();
          this.dispatchEvent(
            new CustomEvent('flash', {
              detail: { buttonId: 'play-btn' },
            })
          );
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
        this.updateActiveModulesButtonLEDColor();
        break;
      case 'Alley X':
        this.grid.setAlleyX(knob.getValue());
        break;
      case 'Alley Y':
        this.grid.setAlleyY(knob.getValue());
        break;
    }

    this.dispatchEvent(
      new CustomEvent('knobChange', {
        detail: {
          knobIndex: knob.id + 1,
          value: knob.config?.shouldRound ?? false ? Math.round(knob.getValue()) : knob.getValue(),
          label: knob.config.label,
        },
      })
    );
  }

  private handleNoteOn(e: any): void {
    const noteNumber = e.data[1];
    const midiNote = webmidi.Utilities.buildNote(noteNumber).identifier;

    const isPushGridButton = noteNumber >= PUSH_BUTTON_RANGE.min && noteNumber <= PUSH_BUTTON_RANGE.max;
    if (isPushGridButton) {
      const buttonRow = 7 - Math.floor((noteNumber - PUSH_BUTTON_RANGE.min) / 8);
      const buttonCol = (noteNumber - PUSH_BUTTON_RANGE.min) % 8;

      this.handleGridButtonPress(buttonRow, buttonCol, noteNumber);
      this.audioSynth?.playNote(midiNote, '16n');
    }
  }

  private handleGridButtonPress(row: number, col: number, noteNumber: number): void {
    const module = this.grid.getModule(row, col);
    if (!module) return;

    // set shape
    if (this.resetModuleButtonFlag) {
      this.grid.setModuleShapeIndex(row, col, this.grid.INITIAL_SHAPE_INDEX);
    } else {
      this.grid.cycleShapeIndex(row, col);
    }

    // Update LED
    const updatedModule = this.grid.getModule(row, col);
    const shouldSetActiveLEDColor = updatedModule && updatedModule.shapeIndex !== this.grid.INITIAL_SHAPE_INDEX;
    if (shouldSetActiveLEDColor) {
      const ledColor = this.getLEDColorFromColorPair();
      this.activateButtonLED(noteNumber, ledColor);
    } else {
      this.deactivateButtonLED(noteNumber);
    }
  }

  private getLEDColorFromColorPair() {
    let ledColor = PUSH_CONFIG.defaultLEDColor;

    if (PUSH_CONFIG.useColorPairLEDColor) {
      const currentPair = this.grid.getColorPair();
      const colorPairName = Object.keys(COLOR_PAIRS).find(
        (key) =>
          (COLOR_PAIRS[key][0] === currentPair[0] && COLOR_PAIRS[key][1] === currentPair[1]) ||
          (COLOR_PAIRS[key][0] === currentPair[1] && COLOR_PAIRS[key][1] === currentPair[0])
      );

      if (colorPairName && COLOR_PAIR_PUSH_LED_MAP[colorPairName]) {
        ledColor = COLOR_PAIR_PUSH_LED_MAP[colorPairName];
      } else {
        console.warn(`No LED mapping for color pair: ${colorPairName}, using default`);
      }
    }
    return ledColor;
  }

  private updateActiveModulesButtonLEDColor(): void {
    const activeModuleCoords = this.grid.getModulesCoordsExcludingShapeIndex(this.grid.INITIAL_SHAPE_INDEX);

    activeModuleCoords.forEach((coords) => {
      const { c, r } = coords;
      const noteNumber = PUSH_BUTTON_RANGE.min + (7 - r) * 8 + c;
      const ledColor = this.getLEDColorFromColorPair();
      this.activateButtonLED(noteNumber, ledColor);
    });
  }

  private activateButtonLED(noteNumber: number, color: PushLEDColor) {
    if (!this.midiOutput) return;
    this.midiOutput.sendNoteOn(noteNumber, { rawAttack: color, channels: 1 });
  }

  private deactivateButtonLED(noteNumber: number) {
    if (!this.midiOutput) return;
    this.midiOutput.sendNoteOff(noteNumber, { channels: 1 });
  }

  private setAllButtonsOff() {
    if (!this.midiOutput) return;

    for (let i = PUSH_BUTTON_RANGE.min; i <= PUSH_BUTTON_RANGE.max; i++) {
      this.midiOutput.sendNoteOff(i, { channels: 1 });
    }
  }

  destroy() {
    if (this.midiInput) {
      this.midiInput.removeListener();
    }
  }

  setAudioSynth(audioSynth: AudioSynth) {
    this.audioSynth = audioSynth;
  }
}
