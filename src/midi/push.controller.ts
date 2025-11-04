import { WebMidi, Utilities, Input, Output } from 'webmidi';
import { MidiData, PushKnobCCMapping, PushButtonMidiCC, PushLEDColor } from '../types/midi.types';
import { PUSH_CONFIG, PUSH_BUTTON_RANGE, MIDI_CHANNELS } from '../config/push.config';
import { clamp } from '../utils/utils';
import { Grid } from '../grid/grid';
import { GRID_CONFIG } from '../config/grid.config';
import { GRID_METHOD, EASE_TYPE } from '../types/types';

export class PushController {
  private midiInput: Input | null = null;
  private midiOutput: Output | null = null;
  private midiData: MidiData;
  private grid: Grid;

  constructor(grid: Grid, initialData?: Partial<MidiData>) {
    this.grid = grid;
    this.midiData = {
      knob1: initialData?.knob1 ?? PUSH_CONFIG.initialValue,
      knob2: initialData?.knob2 ?? PUSH_CONFIG.initialValue,
      knob3: initialData?.knob3 ?? PUSH_CONFIG.initialValue,
      knob4: initialData?.knob4 ?? PUSH_CONFIG.initialValue,
      knob5: initialData?.knob5 ?? PUSH_CONFIG.initialValue,
      knob6: initialData?.knob6 ?? PUSH_CONFIG.initialValue,
      knob7: initialData?.knob7 ?? PUSH_CONFIG.initialValue,
      knob8: initialData?.knob8 ?? PUSH_CONFIG.initialValue,
    };
  }

  async initialize(): Promise<void> {
    try {
      await WebMidi.enable();
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
    if (WebMidi.inputs.length < 1) {
      console.warn('No MIDI device detected.');
      return;
    }

    WebMidi.inputs.forEach((device, index) => {
      console.log(`${index}: ${device.name}`);
    });

    this.midiInput = WebMidi.getInputByName(PUSH_CONFIG.deviceName) || null;
    this.midiOutput = WebMidi.getOutputByName(PUSH_CONFIG.deviceName) || null;

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

    this.midiInput.addListener('controlchange', (e) => this.handleControlChange(e), {
      channels: MIDI_CHANNELS,
    });

    this.midiInput.addListener('noteon', (e) => this.handleNoteOn(e));
  }

  private handleControlChange(e: any): void {
    const controllerNumber = e.controller.number;

    // Handle knobs
    if (controllerNumber >= PushKnobCCMapping.KNOB_1 && controllerNumber <= PushKnobCCMapping.KNOB_8) {
      this.handleKnobChange(controllerNumber, e.rawValue);
      return;
    }

    // Handle buttons
    switch (controllerNumber) {
      case PushButtonMidiCC.KNOB_LEFT_1:
        this.cycleGridMethod();
        break;
      case PushButtonMidiCC.KNOB_LEFT_2:
        this.cycleShapingFunction();
        break;
      case PushButtonMidiCC.NEW:
        GRID_CONFIG.shouldSetButtonsToInitialShapeindex = !GRID_CONFIG.shouldSetButtonsToInitialShapeindex;
        this.flashButton('new-btn');
        break;
      case PushButtonMidiCC.RECORD:
        if (e.rawValue === 127) {
          GRID_CONFIG.debug = !GRID_CONFIG.debug;
          this.flashButton('record-btn');
        }
        break;
      case PushButtonMidiCC.PLAY:
        if (e.rawValue === 127) {
          this.grid.resetAllShapes();
          this.setAllButtonsOff();
          this.flashButton('play-btn');
        }
        break;
    }
  }

  private handleKnobChange(controllerNumber: number, rawValue: number): void {
    const knobIndex = controllerNumber - PushKnobCCMapping.KNOB_1;
    const knobKey = `knob${knobIndex + 1}` as keyof MidiData;

    let normalizedValue = Utilities.from7bitToFloat(rawValue);
    const increment = PUSH_CONFIG.increment;

    if (normalizedValue <= 1 && normalizedValue > 0.5) {
      normalizedValue = 1 - normalizedValue;
      this.midiData[knobKey] -= increment;
    } else if (normalizedValue < 0.5 && normalizedValue > 0) {
      this.midiData[knobKey] += increment;
    }

    if (PUSH_CONFIG.clamp01) {
      this.midiData[knobKey] = clamp(this.midiData[knobKey], 0, 1);
    }
    if (PUSH_CONFIG.clamp0Infinity) {
      this.midiData[knobKey] = clamp(this.midiData[knobKey], 0, Infinity);
    }

    // Update GRID_CONFIG based on knob
    if (knobIndex === 0) GRID_CONFIG.alleyX = this.midiData.knob1;
    if (knobIndex === 1) GRID_CONFIG.alleyY = this.midiData.knob2;
  }

  private handleNoteOn(e: any): void {
    const noteNumber = e.data[1];

    if (noteNumber >= PUSH_BUTTON_RANGE.min && noteNumber <= PUSH_BUTTON_RANGE.max) {
      const row = 7 - Math.floor((noteNumber - PUSH_BUTTON_RANGE.min) / 8);
      const col = (noteNumber - PUSH_BUTTON_RANGE.min) % 8;

      this.handleGridButtonPress(row, col, noteNumber);
    }
  }

  private handleGridButtonPress(row: number, col: number, noteNumber: number): void {
    const module = this.grid.getModule(row, col);
    if (!module) return;

    // Cycle through shapes
    if (GRID_CONFIG.shouldSetButtonsToInitialShapeindex) {
      this.grid.setModuleShapeIndex(row, col, this.grid.INITIAL_SHAPE_INDEX);
    } else {
      this.grid.cycleShapeIndex(row, col);
    }

    // Update LED
    const updatedModule = this.grid.getModule(row, col);
    if (updatedModule && updatedModule.shapeIndex !== this.grid.INITIAL_SHAPE_INDEX) {
      this.setButtonLED(noteNumber, PushLEDColor.BLUE_HI, true);
    } else {
      this.setButtonLED(noteNumber, PushLEDColor.BLACK, false);
    }
  }

  private cycleGridMethod(): void {
    const methods = Object.values(GRID_METHOD).filter((method) => typeof method === 'number');
    const currentIndex = methods.indexOf(GRID_CONFIG.gridMethod);
    const nextIndex = (currentIndex + 1) % methods.length;
    GRID_CONFIG.gridMethod = methods[nextIndex];
    console.log('Grid Method:', GRID_METHOD[methods[nextIndex]]);
  }

  private cycleShapingFunction(): void {
    const easeTypes = Object.values(EASE_TYPE).filter((ease) => typeof ease === 'number');
    const currentIndex = easeTypes.indexOf(GRID_CONFIG.easeType);
    const nextIndex = (currentIndex + 1) % easeTypes.length;
    GRID_CONFIG.easeType = easeTypes[nextIndex];
    console.log('Ease Type:', EASE_TYPE[easeTypes[nextIndex]]);
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

  private flashButton(buttonId: string): void {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.classList.add('active');
    setTimeout(() => {
      button.classList.remove('active');
    }, 150);
  }

  getMidiData(): MidiData {
    return { ...this.midiData };
  }

  getKnobValue(knobIndex: number): number {
    return this.midiData[`knob${knobIndex + 1}` as keyof MidiData];
  }

  destroy(): void {
    if (this.midiInput) {
      this.midiInput.removeListener();
    }
  }
}
