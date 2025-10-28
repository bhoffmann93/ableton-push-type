// @ts-nocheck
const MIDI_BUTTON_COLORS = {
  BLACK: 0,
  WHITE: 3,
  RED: 120,
  ORANGE: 60,
  YELLOW: 13,
  GREEN: 21,
  CYAN: 33,
  BLUE: 45,
  INDIGO: 49,
  VIOLET: 53,
};

// export const setButtonLED = (buttonId, shapeIndex) => {
//   if (shapeIndex !== INITIAL_SHAPE_INDEX) {
//     const colorKeys = Object.keys(MIDI_BUTTON_COLORS);
//     const buttonColor = MIDI_BUTTON_COLORS[colorKeys[shapeIndex % colorKeys.length]];
//     midiOutput.sendNoteOn(buttonId, { rawAttack: buttonColor, channel: 1 });
//   } else {
//     midiOutput.sendNoteOff(buttonId, { channel: 1 });
//   }
// };
