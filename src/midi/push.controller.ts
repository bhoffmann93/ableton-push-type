import { WebMidi, Utilities, Input, Output } from 'webmidi';
import { MidiData, MidiCallbacks, PushKnob, PushButton, PushLEDColor } from '../types/midi.types';
import { PUSH_CONFIG, PUSH_BUTTON_RANGE, MIDI_CHANNELS } from '../config/push.config';
import { clamp } from '../utils/utils';

export class PushController {
  private midiInput: Input | null = null;
  private midiOutput: Output | null = null;
  private midiData: MidiData;
  private callbacks: MidiCallbacks;

  constructor(initialData?: Partial<MidiData>, callbacks?: MidiCallbacks) {
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
    this.callbacks = callbacks || {};
  }

  async initialize(): Promise<void> {
    try {
      await WebMidi.enable();
      this.setupDevices();
      this.setupListeners();
      console.log('MIDI initialized successfully');
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
    if (controllerNumber >= PushKnob.KNOB_1 && controllerNumber <= PushKnob.KNOB_8) {
      this.handleKnobChange(controllerNumber, e.rawValue);
      return;
    }

    // Handle buttons
    switch (controllerNumber) {
      case PushButton.KNOB_LEFT_1:
        this.callbacks.onGridMethodChange?.();
        break;
      case PushButton.KNOB_LEFT_2:
        this.callbacks.onShapingFunctionChange?.();
        break;
      case PushButton.NEW:
        this.callbacks.onDeleteToggle?.();
        break;
      case PushButton.RECORD:
        if (e.rawValue === 127) {
          this.callbacks.onDebugToggle?.();
        }
        break;
      case PushButton.PLAY:
        if (e.rawValue === 127) {
          this.callbacks.onReset?.();
          this.setAllButtonsOff();
        }
        break;
    }
  }

  private handleKnobChange(controllerNumber: number, rawValue: number): void {
    const knobIndex = controllerNumber - PushKnob.KNOB_1;
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

    this.callbacks.onKnobChange?.(knobIndex, this.midiData[knobKey], this.midiData);
  }

  private handleNoteOn(e: any): void {
    const noteNumber = e.data[1];

    if (noteNumber >= PUSH_BUTTON_RANGE.min && noteNumber <= PUSH_BUTTON_RANGE.max) {
      const row = 7 - Math.floor((noteNumber - PUSH_BUTTON_RANGE.min) / 8);
      const col = (noteNumber - PUSH_BUTTON_RANGE.min) % 8;

      this.callbacks.onButtonPress?.(row, col);
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
