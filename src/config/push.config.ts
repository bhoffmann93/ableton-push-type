import { MidiConfig } from '../types/midi.types';
import { PushLEDColor } from '../types/midi.types';

export const PUSH_CONFIG: MidiConfig = {
  increment: 0.05,
  incrementFine: 0.001,
  clamp01: false,
  clamp0Infinity: true,
  initialValue: 0,
  deviceName: 'Ableton Push User Port',
  defaultLEDColor: PushLEDColor.BLUE_HI,
  useColorPairLEDColor: true,
};

export const PUSH_BUTTON_RANGE = {
  min: 36,
  max: 99,
};

export const MIDI_CHANNELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
