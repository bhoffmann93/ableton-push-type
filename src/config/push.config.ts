import { MidiConfig } from '../types/push.types';
import { PushLEDColor } from '../types/push.types';

export const PUSH_CONFIG: MidiConfig = {
  deviceName: 'Ableton Push User Port',
  defaultLEDColor: PushLEDColor.BLUE_HI,
  useColorPairLEDColor: true, //false == use defaultLEDColor
};

export const PUSH_BUTTON_RANGE = {
  min: 36,
  max: 99,
};

export const MIDI_CHANNELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
