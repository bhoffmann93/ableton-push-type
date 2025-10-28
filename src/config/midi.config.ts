const INITIAL_MIDI_VALUE = 0;

export const MIDI_CONFIG = {
  increment: 0.05,
  incrementFine: 0.001,
  clamp01: false,
  clampInfinity: true,
  initialValues: {
    knob1: 0.1,
    knob2: 0.1,
    knob3: INITIAL_MIDI_VALUE,
    knob4: INITIAL_MIDI_VALUE,
    knob5: INITIAL_MIDI_VALUE,
    knob6: INITIAL_MIDI_VALUE,
    knob7: INITIAL_MIDI_VALUE,
    knob8: INITIAL_MIDI_VALUE,
  },
};
