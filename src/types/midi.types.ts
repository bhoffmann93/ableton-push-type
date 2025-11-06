export interface MidiData {
  knob1: number;
  knob2: number;
  knob3: number;
  knob4: number;
  knob5: number;
  knob6: number;
  knob7: number;
  knob8: number;
}

export interface MidiConfig {
  increment: number;
  incrementFine: number;
  clamp01: boolean;
  clamp0Infinity: boolean;
  initialValue: number;
  deviceName: string;
  defaultLEDColor: PushLEDColor;
  useColorPairLEDColor: boolean;
}

export interface MidiCallbacks {
  onKnobChange?: (knobIndex: number, value: number, allData: MidiData) => void;
  onGridMethodChange?: () => void;
  onShapingFunctionChange?: () => void;
  onDeleteToggle?: () => void;
  onDebugToggle?: () => void;
  onReset?: () => void;
  onButtonPress?: (row: number, col: number) => void;
}

export enum PushButtonMidiCC {
  KNOB_LEFT_1 = 14,
  KNOB_LEFT_2 = 15,
  NEW = 87,
  RECORD = 86,
  PLAY = 85,
}

export enum PushKnobCCMapping {
  KNOB_1 = 71,
  KNOB_2 = 72,
  KNOB_3 = 73,
  KNOB_4 = 74,
  KNOB_5 = 75,
  KNOB_6 = 76,
  KNOB_7 = 77,
  KNOB_8 = 78,
}

export enum PushLEDColor {
  BLACK = 0,
  WHITE_HI = 3,
  RED_HI = 120,
  ORANGE_HI = 60,
  YELLOW_HI = 13,
  GREEN_HI = 21,
  CYAN_HI = 33,
  BLUE_HI = 45,
  INDIGO_HI = 49,
  VIOLET_HI = 53,
}
