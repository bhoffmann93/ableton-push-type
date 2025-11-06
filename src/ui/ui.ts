import { MidiData, PushController } from '../midi';
import { EASE_TYPE } from '../types/types';
import { Grid, GRID_METHOD } from '../grid';

export default class UserInterface {
  private pushController: PushController;

  constructor(pushController: PushController) {
    this.pushController = pushController;

    this.pushController.addEventListener('flash', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.flashButton(customEvent.detail.buttonId);
    });
  }

  public update() {
    const midiData = this.pushController.getMidiData();
    const grid = this.pushController.getGrid();

    this.updateUpperRowKnobValues(midiData);
    this.updateGridMethodDisplay(grid);
  }

  private updateUpperRowKnobValues(midiData: MidiData) {
    for (let i = 1; i <= Object.keys(midiData).length; i++) {
      const knobKey = `knob${i}` as keyof typeof midiData;
      // const knobAngle = midiData[knobKey] * 270 - 135; // Map 0-1 to -135° to 135°
      // document.getElementById(`knob${i}`)?.style.setProperty('--rotation', `${knobAngle}deg`);
      const knobValue = document.getElementById(`knob${i}-value`);
      if (knobValue) {
        knobValue.textContent = midiData[knobKey].toFixed(2);
      }
    }
  }

  private updateGridMethodDisplay(grid: Grid) {
    const gridMethodValue = document.getElementById('grid-method-value');
    const methodNames = Object.values(GRID_METHOD).filter((ease) => typeof ease === 'string');
    if (gridMethodValue)
      gridMethodValue.textContent = methodNames[grid.getMethod()] || methodNames[GRID_METHOD.Uniform];

    const easeTypes = Object.values(EASE_TYPE).filter((ease) => typeof ease === 'string');
    const easeTypeElement = document.getElementById('ease-type-value');
    if (easeTypeElement) easeTypeElement.textContent = easeTypes[grid.getEaseType()] || easeTypes[EASE_TYPE.parabola];
  }

  flashButton = (buttonId: string): void => {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.classList.add('active');
    setTimeout(() => {
      button.classList.remove('active');
    }, 150);
  };
}
