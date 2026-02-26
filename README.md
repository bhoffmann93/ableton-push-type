# Ableton Push Type

A prototype modular graphics tool for Ableton Push 1 – buttons cycle through geometric modules to build illustrations, icons, and letterforms. Knobs drive real-time shaping functions that animate the grid as a whole.

Note: only tested with Google Chrome and Ableton Push 1. Push 2/3 are currently not supported.

**[Live Project](https://push-tool.netlify.app/)** · **[Video Demonstration](https://www.youtube.com/watch?v=qIMF-jOBgYc)**

Color Palettes from [Pigment](https://pigment.shapefactory.co/)

---

## Demo

![Demo](static/img/push_demo.gif)

---

## Tech Stack

| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Rendering** | [p5.js](https://p5js.org/) on HTML Canvas |
| **Language** | TypeScript |
| **Build tool** | [Vite](https://vitejs.dev/) |
| **Audio** | [Tone.js](https://tonejs.github.io/) |
| **MIDI** | [WebMIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) via [webmidi.js](https://webmidijs.org/) |

---

## Prerequisites

- **Ableton Push** (Push 1 in User Mode)
- **Chrome or Edge** — WebMIDI is only supported in Chromium-based browsers
- **Node.js** 18+

---

## Quick Start

```bash
git clone https://github.com/yourusername/ableton-push-type.git
cd ableton-push-type
npm install
npm run dev
```

Open `http://localhost:3000` in Chrome or Edge.

---

## Hardware Setup

1. Connect Ableton Push via USB
2. Set Push to **User Mode** (hold the User button)
3. Start the app — the grid buttons will light up when a shape is active

---

## Controls

### Push Hardware

| Control                   | Action                                                |
| ------------------------- | ----------------------------------------------------- |
| **Grid buttons (8×8)**    | Cycle through shapes on that cell                     |
| **Left encoder (top)**    | Cycle grid method (Uniform / Wave / Bezier / …)       |
| **Left encoder (second)** | Cycle shaping function (linear / sinc / parabola / …) |
| **Knob 1**                | Cycle color pair                                      |
| **Knob 2**                | Alley X — gap width between columns                   |
| **Knob 3**                | Alley Y — gap width between rows                      |
| **New button**            | Toggle reset mode — next grid press resets that cell  |
| **Play button**           | Reset all shapes, clear all LEDs                      |
| **Record button**         | Toggle debug overlay                                  |

### Keyboard

| Key     | Action             |
| ------- | ------------------ |
| `s`     | Save canvas as PNG |
| `Space` | Pause animation    |

### UI

Click the **audio button** in the top bar to enable sound. Each grid button press triggers a MIDI note via Tone.js.

---

## Build

```bash
npm run build
```

---

## MIDI Reference

Push 2 MIDI mapping: [Ableton Push 2 MIDI & Display Interface](https://github.com/Ableton/push-interface/blob/main/doc/AbletonPush2MIDIDisplayInterface.asc)
